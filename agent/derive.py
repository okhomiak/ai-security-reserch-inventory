"""Everything the dashboard shows that is computed rather than authored.

Derived artefacts are written to docs/data/derived.json so the page stays a static
fetch of JSON - no build step, no server.

The gap chains in gaps.json are the one place where authored and derived content
meet. A chain step is written by a human (or by this agent) as a claim; a step may
additionally carry a `metric`, and this module refreshes that metric's numbers on
every run. The *reasoning* is preserved exactly as authored; only the figures move.
"""

from __future__ import annotations

import itertools
import re
from collections import Counter, defaultdict
from datetime import UTC, date, datetime

PAIR_THRESHOLD = 0.34       # below this a pair is adjacency, not overlap
CLUSTER_THRESHOLD = 0.45    # edges that form clusters are held to a higher bar


def stamp(as_of: date | None = None) -> str:
    """The date written into derived artefacts: today (UTC) unless pinned.

    A recompute whose only purpose is to confirm the committed data is still
    current must not differ from it by the date alone, so the CI staleness
    gate pins this to the committed `generated` value (pipeline.py --as-of).
    """
    return (as_of or datetime.now(UTC).date()).isoformat()


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (s or "").lower()).strip()


def _jaccard(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


# ---------------------------------------------------------------- overlaps

def overlap_pairs(papers: list[dict]) -> list[dict]:
    """Every pair of papers that genuinely shares an object of study."""
    index = {p["id"]: p for p in papers}
    declared: dict[tuple[str, str], str] = {}
    for p in papers:
        for o in p.get("overlaps_with", []):
            if o.get("id") in index:
                key = tuple(sorted((p["id"], o["id"])))
                declared[key] = o.get("shared", "")

    pairs: list[dict] = []
    for a, b in itertools.combinations(papers, 2):
        key = tuple(sorted((a["id"], b["id"])))
        cats_a, cats_b = set(a.get("categories", [])), set(b.get("categories", []))
        meth_a = {_norm(m) for m in a.get("methods", [])}
        meth_b = {_norm(m) for m in b.get("methods", [])}

        cat_j = _jaccard(cats_a, cats_b)
        meth_j = _jaccard(meth_a, meth_b)
        note = declared.get(key, "")

        score = 0.55 * cat_j + 0.25 * meth_j + (0.40 if note else 0.0)
        # Same branch of the tree but a different leaf still counts a little.
        branches_a = {c.split(".")[0] for c in cats_a}
        branches_b = {c.split(".")[0] for c in cats_b}
        score += 0.10 * _jaccard(branches_a, branches_b)
        score = min(score, 1.0)

        if score < PAIR_THRESHOLD:
            continue
        pairs.append(
            {
                "a": key[0],
                "b": key[1],
                "score": round(score, 3),
                "shared_categories": sorted(cats_a & cats_b),
                "shared_methods": sorted(
                    {m for m in a.get("methods", []) if _norm(m) in meth_a & meth_b}
                ),
                "note": note,
                "declared": bool(note),
            }
        )
    pairs.sort(key=lambda p: p["score"], reverse=True)
    return pairs


def clusters(papers: list[dict], pairs: list[dict], taxonomy: dict) -> list[dict]:
    """Connected components of the strong-overlap graph, labelled by their centre."""
    labels = {n["id"]: n["label"] for n in taxonomy["nodes"]}
    index = {p["id"]: p for p in papers}

    parent: dict[str, str] = {p["id"]: p["id"] for p in papers}

    def find(x: str) -> str:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x: str, y: str) -> None:
        rx, ry = find(x), find(y)
        if rx != ry:
            parent[ry] = rx

    strong = [p for p in pairs if p["score"] >= CLUSTER_THRESHOLD]
    for pair in strong:
        union(pair["a"], pair["b"])

    groups: dict[str, list[str]] = defaultdict(list)
    for pid in parent:
        groups[find(pid)].append(pid)

    edge_by_group: dict[str, list[dict]] = defaultdict(list)
    for pair in strong:
        edge_by_group[find(pair["a"])].append(pair)

    out: list[dict] = []
    for i, (root, members) in enumerate(
        sorted(groups.items(), key=lambda kv: len(kv[1]), reverse=True)
    ):
        if len(members) < 2:
            continue
        cat_counts = Counter(
            c for m in members for c in index[m].get("categories", [])
        )
        top = [c for c, _ in cat_counts.most_common(3)]
        edges = edge_by_group[root]
        out.append(
            {
                "id": f"cluster-{i + 1}",
                "label": " + ".join(labels.get(c, c) for c in top[:2]) or "Mixed",
                "categories": top,
                "papers": sorted(members, key=lambda m: index[m].get("date", ""), reverse=True),
                "size": len(members),
                "mean_score": round(
                    sum(e["score"] for e in edges) / len(edges), 3
                ) if edges else 0.0,
                "shared": sorted({s for e in edges for s in e["shared_categories"]}),
            }
        )
    return out


def cooccurrence(papers: list[dict], taxonomy: dict) -> dict:
    """Category x category co-occurrence - the overlap matrix."""
    leaves = [n["id"] for n in taxonomy["nodes"] if n["parent"]]
    present = [c for c in leaves if any(c in p.get("categories", []) for p in papers)]
    counts = {a: dict.fromkeys(present, 0) for a in present}
    for p in papers:
        cats = [c for c in p.get("categories", []) if c in counts]
        for a in cats:
            counts[a][a] += 1
        for a, b in itertools.combinations(sorted(set(cats)), 2):
            counts[a][b] += 1
            counts[b][a] += 1
    return {"categories": present, "matrix": counts}


# ---------------------------------------------------------------- coverage

def coverage(papers: list[dict], companies: dict) -> dict:
    """Research coverage per company need, and the demand it is measured against."""
    out: dict[str, dict] = {}
    for need in companies["needs"]:
        cats = set(need["categories"])
        matching = [p for p in papers if cats & set(p.get("categories", []))]
        kinds = Counter(p.get("contribution_type", "unknown") for p in matching)
        scores = [
            c["cells"][need["id"]]["score"]
            for c in companies["companies"]
            if need["id"] in c["cells"]
        ]
        evidenced = sum(
            1
            for c in companies["companies"]
            if c["cells"].get(need["id"], {}).get("evidence")
        )
        mean_demand = round(sum(scores) / len(scores), 2) if scores else 0.0
        out[need["id"]] = {
            "papers": len(matching),
            "paper_ids": [p["id"] for p in matching],
            "by_contribution": dict(kinds),
            "defensive": kinds.get("defence", 0) + kinds.get("framework", 0),
            "offensive": kinds.get("attack", 0),
            "mean_demand": mean_demand,
            "max_demand": max(scores) if scores else 0,
            "companies_at_4plus": sum(1 for s in scores if s >= 4),
            "evidenced_cells": evidenced,
            # Demand per unit of research. High = wanted and understudied.
            "pressure": round(mean_demand / (len(matching) + 1), 3),
        }
    return out


def derived_gaps(cov: dict, companies: dict, papers: list[dict]) -> list[dict]:  # noqa: ARG001
    """Gaps the numbers assert on their own, independent of the authored chains."""
    needs = {n["id"]: n for n in companies["needs"]}
    ranked = sorted(cov.items(), key=lambda kv: kv[1]["pressure"], reverse=True)
    out = []
    for need_id, c in ranked:
        if c["mean_demand"] < 3.0 or c["papers"] > 6:
            continue
        out.append(
            {
                "id": f"derived-{need_id}",
                "need": need_id,
                "title": f"{needs[need_id]['label']}: high demand, thin coverage",
                "pressure": c["pressure"],
                "chain": [
                    {
                        "step": 1,
                        "claim": f"{c['companies_at_4plus']} of "
                                 f"{len(companies['companies'])} tracked organisations rate "
                                 f"{needs[need_id]['label'].lower()} at 4+ (mean {c['mean_demand']}/5).",
                        "metric": {"kind": "demand", "need": need_id},
                    },
                    {
                        "step": 2,
                        "claim": f"The inventory holds {c['papers']} paper(s) touching "
                                 f"{', '.join(needs[need_id]['categories'][:3])}.",
                        "metric": {"kind": "coverage", "need": need_id},
                        "evidence": [{"type": "paper", "id": pid} for pid in c["paper_ids"][:6]],
                    },
                    {
                        "step": 3,
                        "claim": f"Of those, {c['defensive']} propose a defence "
                                 f"and {c['offensive']} are attacks - "
                                 "so the demand is for mitigation the literature has not supplied.",
                        "metric": {"kind": "balance", "need": need_id},
                    },
                ],
                "auto": True,
            }
        )
    return out


def refresh_chains(
    gaps: dict, cov: dict, companies: dict, papers: list[dict], as_of: date | None = None,
) -> dict:
    """Recompute the figures inside authored gap chains, leaving the claims alone."""
    by_id = {p["id"]: p for p in papers}
    needs = {n["id"]: n for n in companies["needs"]}

    for gap in gaps.get("gaps", []):
        for step in gap.get("chain", []):
            metric = step.get("metric")
            if not metric:
                continue
            kind, need_id = metric.get("kind"), metric.get("need")
            c = cov.get(need_id)
            if not c:
                continue
            if kind == "demand":
                step["computed"] = {
                    "mean_demand": c["mean_demand"],
                    "companies_at_4plus": c["companies_at_4plus"],
                    "of_companies": len(companies["companies"]),
                    "need_label": needs[need_id]["label"],
                }
            elif kind == "coverage":
                step["computed"] = {
                    "papers": c["papers"],
                    "paper_ids": c["paper_ids"][:8],
                }
            elif kind == "balance":
                step["computed"] = {
                    "defensive": c["defensive"],
                    "offensive": c["offensive"],
                    "by_contribution": c["by_contribution"],
                }
        # Keep the paper list on each gap honest about what still exists.
        gap["papers"] = [pid for pid in gap.get("papers", []) if pid in by_id]
        gap["refreshed"] = stamp(as_of)
    return gaps


# ---------------------------------------------------------------- tree

def tree_rollup(papers: list[dict], taxonomy: dict) -> dict:
    """Per-node paper counts, rolled up from leaves to roots."""
    children = defaultdict(list)
    for n in taxonomy["nodes"]:
        children[n["parent"]].append(n["id"])

    direct = Counter()
    for p in papers:
        for c in p.get("categories", []):
            direct[c] += 1

    total: dict[str, int] = {}
    ids: dict[str, list[str]] = {}

    def walk(node_id: str) -> tuple[int, set[str]]:
        own = {p["id"] for p in papers if node_id in p.get("categories", [])}
        acc = set(own)
        count = 0
        for child in children.get(node_id, []):
            c_count, c_ids = walk(child)
            count += c_count
            acc |= c_ids
        total[node_id] = len(acc)
        ids[node_id] = sorted(acc)
        return len(acc), acc

    for root in children.get(None, []):
        walk(root)

    return {
        "direct": dict(direct),
        "total": total,
        "paper_ids": ids,
        "children": {k or "__root__": v for k, v in children.items()},
    }


def run(
    papers: list[dict], taxonomy: dict, companies: dict, gaps: dict, as_of: date | None = None,
) -> tuple[dict, dict]:
    """Produce derived.json plus the refreshed gaps document."""
    pairs = overlap_pairs(papers)
    cov = coverage(papers, companies)
    derived = {
        "generated": stamp(as_of),
        "paper_count": len(papers),
        "pairs": pairs,
        "clusters": clusters(papers, pairs, taxonomy),
        "cooccurrence": cooccurrence(papers, taxonomy),
        "coverage": cov,
        "derived_gaps": derived_gaps(cov, companies, papers),
        "tree": tree_rollup(papers, taxonomy),
        "thresholds": {"pair": PAIR_THRESHOLD, "cluster": CLUSTER_THRESHOLD},
    }
    return derived, refresh_chains(gaps, cov, companies, papers, as_of)
