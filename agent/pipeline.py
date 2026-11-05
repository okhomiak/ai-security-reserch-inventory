#!/usr/bin/env python3
"""Weekly ingest: discover -> gate -> classify -> merge -> derive -> write.

  python3 agent/pipeline.py                 # the full weekly run
  python3 agent/pipeline.py --dry-run       # discovery + gate only, no API calls
  python3 agent/pipeline.py --limit 5       # classify at most 5 (useful for a smoke test)
  python3 agent/pipeline.py --derive-only   # recompute overlaps/coverage/gaps from current data

Writes docs/data/{papers,derived,gaps,runs}.json. Nothing else in the repo is touched,
so the diff the workflow commits is always reviewable.
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import sys
import traceback
from datetime import datetime, timezone

sys.path.insert(0, str(pathlib.Path(__file__).parent))

import derive  # noqa: E402
import fetch  # noqa: E402
import news  # noqa: E402
import gate  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "docs" / "data"
AGENT = ROOT / "agent"

MIN_CONFIDENCE = 0.55


def load(path: pathlib.Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text())


def save(path: pathlib.Path, obj) -> None:
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")


def to_record(candidate, verdict: dict, result: dict) -> dict:
    """One classified candidate -> one papers.json record."""
    prov = result["provenance"]
    tier = prov["tier"]
    if tier == "unknown" and verdict.get("tier"):
        tier = verdict["tier"]
    return {
        "id": candidate.id,
        "title": candidate.title,
        "url": candidate.url,
        "pdf": candidate.pdf,
        "date": candidate.date,
        "authors": candidate.authors[:25],
        "organisations": prov["organisations"],
        "venue": prov.get("venue") or verdict.get("venue", ""),
        "trust": {
            "tier": tier,
            "justification": prov["justification"],
            "gate_reason": verdict["reason"],
        },
        "source": candidate.source_name,
        "what_its_about": result["what_its_about"],
        "primary_category": result["primary_category"],
        "categories": result["categories"],
        "contribution_type": result["contribution_type"],
        "methods": result["methods"][:8],
        "threat_model": result["threat_model"],
        "addresses_needs": result["addresses_needs"],
        "overlaps_with": result["overlaps_with"],
        "gap_signal": result.get("gap_signal"),
        "confidence": result["confidence"],
        "abstract": candidate.abstract[:1500],
        "added": datetime.now(timezone.utc).date().isoformat(),
        "classified_by": result.get("_model", "unknown"),
        "curation": "agent",
        "notes": result.get("notes", ""),
        "validation_warnings": result.get("_validation", []),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="no API calls")
    ap.add_argument("--derive-only", action="store_true", help="recompute derived data only")
    ap.add_argument("--limit", type=int, default=None, help="cap classifications this run")
    ap.add_argument("--days", type=int, default=None, help="override the recency window")
    args = ap.parse_args()

    sources = load(AGENT / "sources.json", {})
    taxonomy = load(DATA / "taxonomy.json", {"nodes": []})
    companies = load(DATA / "companies.json", {"needs": [], "companies": []})
    papers_doc = load(DATA / "papers.json", {"schema": 2, "papers": []})
    gaps_doc = load(DATA / "gaps.json", {"gaps": []})
    runs = load(DATA / "runs.json", {"runs": []})

    papers = papers_doc.get("papers", [])
    started = datetime.now(timezone.utc)
    run = {
        "started": started.isoformat(timespec="seconds"),
        "mode": "derive-only" if args.derive_only else ("dry-run" if args.dry_run else "full"),
        "discovered": 0, "gated_out": 0, "considered": 0,
        "classified": 0, "added": 0, "queued": 0, "errors": [],
        "usage": {"input": 0, "output": 0, "cache_read": 0, "cache_write": 0},
        "proposed_leaves": [],
    }

    if not args.derive_only:
        print("== discover")
        candidates = fetch.discover(sources, args.days)
        run["discovered"] = len(candidates)
        print(f"   {len(candidates)} unique candidates")

        known = {p["id"] for p in papers}
        queue = load(DATA / "review_queue.json", {"items": []})
        queued_ids = {i["id"] for i in queue["items"]}
        fresh = [c for c in candidates if c.id not in known and c.id not in queued_ids]
        print(f"   {len(fresh)} not already catalogued or queued")

        print("== gate")
        gap_vocab = gate.gap_terms(taxonomy, gaps_doc)
        keep, drop = gate.partition(fresh, sources, gap_vocab)
        run["gap_vocab_terms"] = len(gap_vocab)
        run["gap_matches"] = sum(1 for _, v in keep if v.get("gap_hits", 0) >= 2)
        run["gated_out"] = len(drop)
        cap = args.limit or sources.get("max_classify_per_run", 40)
        keep = keep[:cap]
        run["considered"] = len(keep)
        print(f"   {len(drop)} rejected mechanically, {len(keep)} to classify (cap {cap})")
        print(f"   {run['gap_matches']} of those land in an open gap area "
              f"({len(gap_vocab)}-term vocabulary from gaps.json)")
        for c, v in drop[:10]:
            print(f"     - {v['reason']}: {c.title[:70]}")

        if args.dry_run:
            save(DATA.parent.parent / "agent" / "last_dry_run.json",
                 {"keep": [{"candidate": c.as_dict(), "verdict": v} for c, v in keep],
                  "drop": [{"title": c.title, "reason": v["reason"]} for c, v in drop]})
            print("   dry run: wrote agent/last_dry_run.json, no API calls made")
        elif keep:
            import anthropic
            import classify

            if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")
                    or pathlib.Path.home().joinpath(".config/anthropic").exists()):
                msg = "no Anthropic credentials found - skipping classification"
                print(f"   !! {msg}")
                run["errors"].append(msg)
            else:
                client = anthropic.Anthropic()
                prefix = classify.build_prefix(taxonomy, companies, papers)
                known_ids = {p["id"] for p in papers}
                print(f"== classify ({classify.MODEL}, effort {classify.EFFORT})")

                for i, (candidate, verdict) in enumerate(keep, 1):
                    print(f"   [{i}/{len(keep)}] {candidate.title[:68]}")
                    try:
                        result = classify.classify(client, candidate, verdict, prefix)
                        result = classify.validate(result, taxonomy, companies, known_ids)
                    except Exception as exc:  # noqa: BLE001 - one bad paper must not end the run
                        run["errors"].append(f"{candidate.id}: {exc}")
                        print(f"        ! {exc}")
                        continue

                    run["classified"] += 1
                    for k, v in result.get("_usage", {}).items():
                        run["usage"][k] = run["usage"].get(k, 0) + v
                    if result.get("proposed_new_leaf"):
                        run["proposed_leaves"].append(
                            {"from": candidate.id, **result["proposed_new_leaf"]}
                        )

                    good = (
                        result["include"]
                        and result["relevant_to_ai_security"]
                        and result["primary_category"]
                        and result["confidence"] >= MIN_CONFIDENCE
                        and result["provenance"]["tier"] != "unknown"
                    )
                    record = to_record(candidate, verdict, result)
                    if good:
                        papers.append(record)
                        known_ids.add(candidate.id)
                        run["added"] += 1
                        print(f"        + {record['primary_category']} "
                              f"[{record['trust']['tier']}] conf {result['confidence']}")
                    else:
                        queue["items"].append(
                            {**record,
                             "queued_because": result["include_reason"],
                             "agent_verdict": {
                                 "include": result["include"],
                                 "tier": result["provenance"]["tier"],
                                 "confidence": result["confidence"],
                             }}
                        )
                        run["queued"] += 1
                        print(f"        ~ queued: {result['include_reason'][:70]}")

        queue["items"] = queue["items"][-300:]
        queue["updated"] = started.date().isoformat()
        save(DATA / "review_queue.json", queue)

    if not args.derive_only:
        try:
            news_doc = news.build(sources, days=150)
            save(DATA / "news.json", news_doc)
            run["news_items"] = news_doc["count"]
        except Exception as exc:  # noqa: BLE001 - news is secondary to the inventory
            run["errors"].append(f"news: {exc}")
            print(f"   ! news collection failed: {exc}")

    print("== derive")
    papers.sort(key=lambda p: (p.get("date", ""), p["id"]), reverse=True)
    derived, gaps_doc = derive.run(papers, taxonomy, companies, gaps_doc)

    papers_doc.update({
        "schema": 2,
        "updated": started.date().isoformat(),
        "count": len(papers),
        "papers": papers,
    })
    save(DATA / "papers.json", papers_doc)
    save(DATA / "gaps.json", gaps_doc)
    save(DATA / "derived.json", derived)

    run["finished"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    run["seconds"] = round((datetime.now(timezone.utc) - started).total_seconds(), 1)
    run["total_papers"] = len(papers)
    runs["runs"] = ([run] + runs.get("runs", []))[:40]
    runs["latest"] = run
    save(DATA / "runs.json", runs)

    print(f"\n   papers {len(papers)} | added {run['added']} | queued {run['queued']} "
          f"| pairs {len(derived['pairs'])} | clusters {len(derived['clusters'])}")
    if run["usage"]["input"]:
        u = run["usage"]
        print(f"   tokens in {u['input']} out {u['output']} "
              f"cache-read {u['cache_read']} cache-write {u['cache_write']}")
    if run["errors"]:
        print(f"   {len(run['errors'])} error(s): {run['errors'][:3]}")
    if run["proposed_leaves"]:
        print(f"   {len(run['proposed_leaves'])} proposed new taxonomy leaf/leaves "
              "- review and add to docs/data/taxonomy.json")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        traceback.print_exc()
        sys.exit(1)
