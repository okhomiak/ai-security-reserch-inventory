#!/usr/bin/env python3
"""Referential integrity over docs/data/*.json.

Run after editing anything by hand, and in CI after every ingest. Catches the
failure that matters most here: a dangling id. A gap citing a paper that is no
longer in the inventory, a paper filed under a taxonomy leaf that was renamed, or
a company cell for a need that was deleted all render as a silently broken link
rather than an error, so they are checked explicitly.

Exit 0 if clean, 1 if anything is wrong.
"""

from __future__ import annotations

import json
import pathlib
import sys

DATA = pathlib.Path(__file__).resolve().parent.parent / "docs" / "data"


def load(name: str, default=None):
    path = DATA / f"{name}.json"
    if not path.exists():
        return default
    return json.loads(path.read_text())


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    taxonomy = load("taxonomy", {"nodes": []})
    papers_doc = load("papers", {"papers": []})
    companies = load("companies", {"needs": [], "companies": []})
    gaps = load("gaps", {"gaps": []})
    derived = load("derived", {})
    queue = load("review_queue", {"items": []})

    nodes = {n["id"] for n in taxonomy["nodes"]}
    leaves = {n["id"] for n in taxonomy["nodes"] if n["parent"]}
    papers = papers_doc["papers"]
    paper_ids = {p["id"] for p in papers}
    needs = {n["id"] for n in companies["needs"]}
    company_ids = {c["id"] for c in companies["companies"]}

    # taxonomy
    for n in taxonomy["nodes"]:
        if n["parent"] and n["parent"] not in nodes:
            errors.append(f"taxonomy: {n['id']} has unknown parent {n['parent']}")
    if len(nodes) != len(taxonomy["nodes"]):
        errors.append("taxonomy: duplicate node ids")

    # papers
    if len(paper_ids) != len(papers):
        errors.append("papers: duplicate ids")
    for p in papers:
        where = p["id"]
        if p["primary_category"] not in leaves:
            errors.append(f"papers: {where} primary_category {p['primary_category']!r} is not a leaf")
        for c in p["categories"]:
            if c not in leaves:
                errors.append(f"papers: {where} category {c!r} is not a leaf")
        if p["primary_category"] not in p["categories"]:
            warnings.append(f"papers: {where} primary_category is not listed in categories")
        for n in p.get("addresses_needs", []):
            if n not in needs:
                errors.append(f"papers: {where} addresses unknown need {n!r}")
        for o in p.get("overlaps_with", []):
            if o["id"] not in paper_ids:
                errors.append(f"papers: {where} overlaps unknown paper {o['id']!r}")
            if o["id"] == where:
                errors.append(f"papers: {where} overlaps itself")
        if not p.get("url", "").startswith("http"):
            errors.append(f"papers: {where} has no usable url")
        for field in ("title", "what_its_about", "date"):
            if not p.get(field):
                errors.append(f"papers: {where} is missing {field}")

    # overlaps should be symmetric - the dashboard assumes it
    for p in papers:
        for o in p.get("overlaps_with", []):
            other = next((q for q in papers if q["id"] == o["id"]), None)
            if other and not any(x["id"] == p["id"] for x in other.get("overlaps_with", [])):
                warnings.append(f"papers: {p['id']} -> {o['id']} overlap is one-directional")

    # companies
    for c in companies["companies"]:
        missing = needs - set(c["cells"])
        extra = set(c["cells"]) - needs
        if missing:
            errors.append(f"companies: {c['id']} has no cell for {sorted(missing)}")
        if extra:
            errors.append(f"companies: {c['id']} has cells for unknown needs {sorted(extra)}")
        for nid, cell in c["cells"].items():
            if not isinstance(cell.get("score"), int) or not 0 <= cell["score"] <= 5:
                errors.append(f"companies: {c['id']}/{nid} score must be an int 0-5")
            for e in cell.get("evidence", []):
                if not e.get("url", "").startswith("http"):
                    errors.append(f"companies: {c['id']}/{nid} evidence has no usable url")
    for n in companies["needs"]:
        for c in n["categories"]:
            if c not in leaves:
                errors.append(f"companies: need {n['id']} maps to unknown category {c!r}")

    # gaps
    for g in gaps["gaps"]:
        for c in g.get("categories", []):
            if c not in nodes:
                errors.append(f"gaps: {g['id']} references unknown category {c!r}")
        for n in g.get("needs", []):
            if n not in needs:
                errors.append(f"gaps: {g['id']} references unknown need {n!r}")
        for pid in g.get("papers", []):
            if pid not in paper_ids:
                errors.append(f"gaps: {g['id']} references unknown paper {pid!r}")
        if not g.get("chain"):
            errors.append(f"gaps: {g['id']} has no chain - a gap without an argument is just a label")
        for step in g.get("chain", []):
            if not step.get("claim"):
                errors.append(f"gaps: {g['id']} step {step.get('step')} has no claim")
            for e in step.get("evidence", []):
                pool = paper_ids if e["type"] == "paper" else company_ids
                if e["id"] not in pool:
                    errors.append(f"gaps: {g['id']} step {step.get('step')} cites unknown {e['type']} {e['id']!r}")
            m = step.get("metric")
            if m and m.get("need") not in needs:
                errors.append(f"gaps: {g['id']} step {step.get('step')} metric targets unknown need {m.get('need')!r}")
            if m and m.get("kind") not in ("demand", "coverage", "balance"):
                errors.append(f"gaps: {g['id']} step {step.get('step')} has unknown metric kind {m.get('kind')!r}")

    # derived must match what it was derived from
    if derived:
        if derived.get("paper_count") != len(papers):
            warnings.append(f"derived: built from {derived.get('paper_count')} papers, inventory now holds "
                            f"{len(papers)} - run `python3 agent/pipeline.py --derive-only`")
        for pair in derived.get("pairs", []):
            if pair["a"] not in paper_ids or pair["b"] not in paper_ids:
                errors.append(f"derived: pair {pair['a']} / {pair['b']} references a paper that is gone")

    # the review queue must not duplicate the inventory
    for item in queue.get("items", []):
        if item["id"] in paper_ids:
            warnings.append(f"review_queue: {item['id']} is already in the inventory")

    for w in warnings:
        print(f"warn  {w}")
    for e in errors:
        print(f"ERROR {e}")
    print(f"\n{len(papers)} papers · {len(leaves)} leaves · {len(companies['companies'])} companies "
          f"· {len(gaps['gaps'])} gaps · {len(errors)} error(s) · {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
