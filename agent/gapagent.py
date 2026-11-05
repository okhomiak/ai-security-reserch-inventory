"""Gap reassessment when new work arrives.

derive.py already recomputes the figures inside a gap - demand, coverage,
balance - on every run. That is arithmetic, and arithmetic cannot tell you
whether a paper published last week actually answers the question a gap asks.
A gap can look healthier because three loosely related papers appeared, or stay
numerically identical while one paper closed it outright.

So this asks the model directly, once per run, with the new records and the
gaps in front of it:

  * does any new work materially address this gap, and does it meet the gap's
    own `closes_when` criterion?
  * should the status move (open -> partial -> closed)?
  * do the new papers' `gap_signal` fields suggest a gap nobody has written?

The output is advisory and additive. It writes an `agent_assessment` block
alongside the authored chain and a `proposed_gaps` list for review. It never
edits a claim, never changes `status`, and never deletes anything - because the
reasoning in a gap chain is the part a human is responsible for, and an agent
quietly rewriting it would make the whole artefact untrustworthy.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone

MODEL = os.environ.get("GAP_MODEL", os.environ.get("CLASSIFIER_MODEL", "claude-opus-5"))
EFFORT = os.environ.get("GAP_EFFORT", "high")

SYSTEM = """\
You maintain the gap analysis for an AI-security research inventory. A gap is an
argued claim that the literature has not answered something practitioners need,
with an explicit criterion for what would close it.

New work has just been catalogued. For each existing gap, judge whether any of it
changes the picture - and be conservative. A paper that is merely topically
adjacent does not touch a gap. The question is whether the gap's own
`closes_when` criterion is now closer to being met, and the default answer is no.

Statuses: `open` (nothing addresses it), `partial` (something addresses part of
it, or addresses it under assumptions that do not hold generally), `closed` (the
closes_when criterion is met). Recommend `closed` only if you can name the paper
that meets the stated criterion.

Also consider whether the new papers' `gap_signal` fields - what each paper
leaves unresolved - cluster into something nobody has written up as a gap. Only
propose one where several papers independently leave the same thing open.

Your output is advisory. A human reads it and decides. Say "no change" freely;
a reassessment that finds nothing is a useful result, and inventing movement to
look productive would corrupt the thing you are maintaining."""

SCHEMA = {
    "type": "object",
    "properties": {
        "assessments": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "gap_id": {"type": "string"},
                    "changed": {"type": "boolean"},
                    "suggested_status": {"type": "string", "enum": ["open", "partial", "closed", "unchanged"]},
                    "reasoning": {"type": "string"},
                    "relevant_new_papers": {"type": "array", "items": {"type": "string"}},
                    "closes_when_progress": {"type": "string"},
                },
                "required": ["gap_id", "changed", "suggested_status", "reasoning",
                             "relevant_new_papers", "closes_when_progress"],
                "additionalProperties": False,
            },
        },
        "proposed_gaps": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "why_now": {"type": "string"},
                    "supporting_papers": {"type": "array", "items": {"type": "string"}},
                    "categories": {"type": "array", "items": {"type": "string"}},
                    "closes_when": {"type": "string"},
                    "counter": {"type": "string"},
                },
                "required": ["title", "why_now", "supporting_papers", "categories",
                             "closes_when", "counter"],
                "additionalProperties": False,
            },
        },
        "summary": {"type": "string"},
    },
    "required": ["assessments", "proposed_gaps", "summary"],
    "additionalProperties": False,
}


def _gap_digest(gaps: dict) -> str:
    out = []
    for g in gaps.get("gaps", []):
        steps = " ".join(f"({s['step']}) {s['claim']}" for s in g.get("chain", []))
        out.append(
            f"- id: {g['id']}\n"
            f"  title: {g['title']}\n"
            f"  status: {g.get('status')} | severity: {g.get('severity')} | confidence: {g.get('confidence')}\n"
            f"  closes_when: {g.get('closes_when', '-')}\n"
            f"  argument: {steps[:900]}"
        )
    return "\n".join(out)


def _paper_digest(papers: list[dict]) -> str:
    return "\n".join(
        f"- {p['id']} [{p.get('primary_category')}] {p['title']}\n"
        f"    about: {p.get('what_its_about', '')[:260]}\n"
        f"    leaves open: {p.get('gap_signal') or '-'}"
        for p in papers
    )


def assess(client, gaps: dict, new_papers: list[dict], taxonomy: dict) -> dict:
    """One call. Returns the parsed advisory, or raises."""
    leaves = [n["id"] for n in taxonomy["nodes"] if n["parent"]]
    prompt = (
        "EXISTING GAPS\n" + _gap_digest(gaps)
        + "\n\nNEWLY CATALOGUED WORK\n" + _paper_digest(new_papers)
        + "\n\nVALID CATEGORY IDS for proposed_gaps[].categories:\n" + ", ".join(leaves)
        + "\n\nAssess each gap against the new work, then consider whether the "
          "`leaves open` fields cluster into an unwritten gap."
    )
    response = client.messages.create(
        model=MODEL,
        max_tokens=16000,
        system=[{"type": "text", "text": SYSTEM, "cache_control": {"type": "ephemeral"}}],
        thinking={"type": "adaptive"},
        output_config={"effort": EFFORT, "format": {"type": "json_schema", "schema": SCHEMA}},
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal":
        raise RuntimeError("gap assessment refused")
    text = next(b.text for b in response.content if b.type == "text")
    out = json.loads(text)
    out["_usage"] = {
        "input": response.usage.input_tokens,
        "output": response.usage.output_tokens,
        "cache_read": getattr(response.usage, "cache_read_input_tokens", 0),
    }
    return out


def apply(gaps: dict, result: dict, known_ids: set[str], leaves: set[str]) -> tuple[dict, int]:
    """Attach advisory blocks. Never edits an authored claim or a status."""
    today = datetime.now(timezone.utc).date().isoformat()
    by_id = {g["id"]: g for g in gaps.get("gaps", [])}
    touched = 0

    for a in result.get("assessments", []):
        g = by_id.get(a["gap_id"])
        if not g:
            continue
        papers = [p for p in a.get("relevant_new_papers", []) if p in known_ids]
        if not a.get("changed") and a.get("suggested_status") in (None, "unchanged", g.get("status")):
            # Record that it was looked at and nothing moved - absence of an
            # assessment should not be confusable with absence of a review.
            g["agent_assessment"] = {"date": today, "verdict": "no change", "papers": []}
            continue
        g["agent_assessment"] = {
            "date": today,
            "verdict": "review suggested",
            "suggested_status": a["suggested_status"],
            "current_status": g.get("status"),
            "reasoning": a["reasoning"],
            "closes_when_progress": a.get("closes_when_progress", ""),
            "papers": papers,
        }
        touched += 1

    proposals = []
    for p in result.get("proposed_gaps", []):
        cats = [c for c in p.get("categories", []) if c in leaves]
        sup = [s for s in p.get("supporting_papers", []) if s in known_ids]
        if not sup:
            continue   # a proposal with no surviving evidence is noise
        proposals.append({**p, "categories": cats, "supporting_papers": sup,
                          "proposed": today, "status": "unreviewed"})
    if proposals:
        gaps["proposed_gaps"] = (proposals + gaps.get("proposed_gaps", []))[:20]
    gaps["last_assessment"] = {"date": today, "summary": result.get("summary", ""),
                               "gaps_flagged": touched, "proposals": len(proposals)}
    return gaps, touched
