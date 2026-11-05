#!/usr/bin/env python3
"""End-to-end test of onboarding a new paper, without spending API calls.

The expensive, fragile part of the weekly job is not discovery - it is
everything that happens *after* the model answers: validating what it said,
merging a record, recomputing overlaps and gap figures, and having the page
render it as new. That path had never been exercised end to end, because
running it for real needs a key and costs money.

So this drives the whole path with a stubbed classifier that returns a fixed,
realistic response. Discovery and the gate run for real against the live
sources; only the model call is replaced. Everything downstream is the actual
production code.

It works on a COPY of docs/data and never touches the real files.

    python3 agent/selftest.py            # full run, live discovery
    python3 agent/selftest.py --offline  # skip the network, stub a candidate
"""

from __future__ import annotations

import argparse
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).parent))

import classify
import derive
import fetch
import gapagent
import gate

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "docs" / "data"

FAKE_CLASSIFICATION = {
    "include": True,
    "include_reason": "Peer-reviewed at a trusted venue; directly on topic.",
    "relevant_to_ai_security": True,
    "provenance": {"tier": "peer-reviewed", "organisations": ["Test University"],
                   "venue": "USENIX Security", "justification": "stubbed for the self-test"},
    "what_its_about": "A stubbed record used to prove the onboarding path end to end.",
    "primary_category": "attack.injection",
    "categories": ["attack.injection", "agent.hijack"],
    "proposed_new_leaf": None,
    "contribution_type": "attack",
    "methods": ["stub"],
    "threat_model": "Not a real threat model - this record exists to exercise the merge path.",
    "addresses_needs": ["n.agent_sec"],
    "overlaps_with": [],
    "gap_signal": "Nothing; this is a test fixture.",
    "confidence": 0.95,
    "notes": "",
}

FAILS = []


def check(name: str, ok: bool, detail: str = "") -> None:
    print(f"  {'PASS' if ok else 'FAIL'}  {name}{(' — ' + detail) if detail else ''}")
    if not ok:
        FAILS.append(name)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true")
    args = ap.parse_args()

    sources = json.loads((ROOT / "agent" / "sources.json").read_text())
    taxonomy = json.loads((DATA / "taxonomy.json").read_text())
    companies = json.loads((DATA / "companies.json").read_text())
    papers_doc = json.loads((DATA / "papers.json").read_text())
    gaps_doc = json.loads((DATA / "gaps.json").read_text())
    before = len(papers_doc["papers"])

    print("== 1. discovery and the gate")
    if args.offline:
        cand = fetch.Candidate(
            id="arxiv:9999.00001",
            title="A Stubbed Study of Indirect Prompt Injection in Tool-Using Agents",
            url="https://arxiv.org/abs/9999.00001",
            abstract=("We study prompt injection against agents with tool access, red team several "
                      "guardrail defences, and measure jailbreak success under an adaptive attacker."),
            authors=["A Researcher"], date="2026-11-05", source="arxiv",
            source_name="arXiv", comment="Accepted at USENIX Security 2027")
        keep = [(cand, gate.stage1(cand, sources))]
        drop = []
    else:
        found = fetch.discover(sources, window_days=4)
        gap_vocab = gate.gap_terms(taxonomy, gaps_doc)
        keep, drop = gate.partition(found, sources, gap_vocab)
        check("discovery returned candidates", bool(found), f"{len(found)} found")
    check("gate produced something to classify", bool(keep), f"{len(keep)} kept, {len(drop)} dropped")
    if not keep:
        print("\nno candidates to onboard; cannot continue")
        return 1

    candidate, verdict = keep[0]
    print(f"     candidate: {candidate.title[:70]}")

    print("== 2. classification (stubbed) and validation")
    result = dict(FAKE_CLASSIFICATION)
    # The real model is replaced, but validate() is the production function.
    result = classify.validate(result, taxonomy, companies,
                               {p["id"] for p in papers_doc["papers"]})
    check("validate kept the known category", result["primary_category"] == "attack.injection")
    check("validate reported no problems", not result["_validation"], str(result["_validation"]))

    # a deliberately invalid response must be scrubbed, not trusted
    bad = dict(FAKE_CLASSIFICATION)
    bad["primary_category"] = "totally.invented"
    bad["categories"] = ["totally.invented", "attack.injection"]
    bad["addresses_needs"] = ["n.not_a_need"]
    bad["overlaps_with"] = [{"id": "arxiv:0000.00000", "shared": "nope"}]
    bad = classify.validate(bad, taxonomy, companies, {p["id"] for p in papers_doc["papers"]})
    check("invented category dropped", bad["primary_category"] is None)
    check("invented need dropped", bad["addresses_needs"] == [])
    check("invented overlap dropped", bad["overlaps_with"] == [])
    check("scrubbing was reported", len(bad["_validation"]) >= 3, f"{len(bad['_validation'])} notes")

    print("== 3. merge into a COPY of the inventory")
    with tempfile.TemporaryDirectory() as tmp:
        tmpdata = pathlib.Path(tmp) / "data"
        shutil.copytree(DATA, tmpdata)

        import pipeline
        record = pipeline.to_record(candidate, verdict, result)
        check("record carries a usable url", record["url"].startswith("http"))
        check("record marked agent-curated", record["curation"] == "agent")
        check("record carries a provenance tier", bool(record["trust"]["tier"]))

        papers = papers_doc["papers"] + [record]
        check("inventory grew by one", len(papers) == before + 1)

        print("== 4. derive: overlaps, coverage, gap figures")
        derived, gaps2 = derive.run(papers, taxonomy, companies, json.loads(json.dumps(gaps_doc)))
        check("derived counts the new paper", derived["paper_count"] == before + 1)
        new_pairs = [p for p in derived["pairs"] if record["id"] in (p["a"], p["b"])]
        check("new paper acquired overlaps", bool(new_pairs), f"{len(new_pairs)} pairs")
        cov = derived["coverage"]["n.agent_sec"]
        check("coverage picked it up", record["id"] in cov["paper_ids"])
        refreshed = [s for g in gaps2["gaps"] for s in g.get("chain", []) if s.get("computed")]
        check("gap metrics recomputed", bool(refreshed), f"{len(refreshed)} steps")

        print("== 5. gap reassessment wiring (no model call)")
        stub = {"assessments": [{"gap_id": gaps_doc["gaps"][0]["id"], "changed": True,
                                 "suggested_status": "partial",
                                 "reasoning": "stubbed", "relevant_new_papers": [record["id"]],
                                 "closes_when_progress": "stub"}],
                "proposed_gaps": [], "summary": "stubbed assessment"}
        leaves = {n["id"] for n in taxonomy["nodes"] if n["parent"]}
        gaps3, flagged = gapagent.apply(json.loads(json.dumps(gaps2)), stub,
                                        {p["id"] for p in papers}, leaves)
        g0 = gaps3["gaps"][0]
        check("assessment attached", bool(g0.get("agent_assessment")))
        check("authored status NOT overwritten",
              g0["status"] == gaps_doc["gaps"][0]["status"],
              f"{g0['status']} unchanged")
        check("authored claims NOT rewritten",
              g0["chain"][0]["claim"] == gaps_doc["gaps"][0]["chain"][0]["claim"])
        check("reassessment counted", flagged == 1)

        print("== 6. integrity of the resulting inventory")
        out = json.loads(json.dumps(papers_doc))
        out["papers"] = papers
        out["count"] = len(papers)
        (tmpdata / "papers.json").write_text(json.dumps(out, indent=2))
        (tmpdata / "derived.json").write_text(json.dumps(derived, indent=2))
        (tmpdata / "gaps.json").write_text(json.dumps(gaps3, indent=2))
        # check.py reads a module-level DATA path, so point it at the temp copy
        # in a child interpreter rather than mutating this one's import state.
        probe = (
            "import sys,pathlib;sys.path.insert(0,'agent');"
            "import check as c;c.DATA=pathlib.Path(sys.argv[1]);sys.exit(c.main())"
        )
        env_check = subprocess.run(
            [sys.executable, "-c", probe, str(tmpdata)],
            capture_output=True, text=True, cwd=str(ROOT), check=False)
        check("check.py passes on the merged data", env_check.returncode == 0,
              env_check.stdout.strip().splitlines()[-1] if env_check.stdout else "")

    print("== 7. the real inventory was not touched")
    check("papers.json unchanged",
          len(json.loads((DATA / "papers.json").read_text())["papers"]) == before)

    print(f"\n{'ALL CHECKS PASSED' if not FAILS else str(len(FAILS)) + ' FAILED: ' + ', '.join(FAILS)}")
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
