"""The trust gate.

Only well-reviewed work or work from top labs is allowed into the inventory. That
judgement is split in two, because it is partly mechanical and partly not:

  stage 1 (here, free)   - venue strings, trusted feeds, topical relevance, exclusions.
  stage 2 (classify.py)  - "is this really from a top lab, and what is it about?"

A candidate that stage 1 cannot vouch for is not rejected outright; it is marked
`needs_agent_judgement` and the model decides. Anything the model also cannot vouch
for lands in the review queue rather than the database, so nothing is silently
dropped and nothing unvetted is silently published.
"""

from __future__ import annotations

import re

# A preprint nobody has vouched for must look clearly on-topic before it is
# worth spending a classification call on. A named venue bypasses this.
UNVOUCHED_MIN_RELEVANCE = 4

# Phrases that precede a venue name in an arXiv comment.
_ACCEPTED = re.compile(
    r"\b(accepted|to appear|camera[- ]ready|published|appears?)\b", re.IGNORECASE
)

# Topic relevance: a candidate must look like AI *security* work, not generic ML.
_TOPIC_TERMS = [
    "prompt injection", "jailbreak", "guardrail", "red team", "red-team",
    "adversarial", "backdoor", "poison", "trojan", "membership inference",
    "unlearning", "memoriz", "extraction attack", "model stealing",
    "agent", "tool use", "sandbox", "privilege", "authoriz", "authentic",
    "threat model", "attack surface", "vulnerab", "exploit", "malware",
    "phishing", "security", "safety", "misuse", "harmful", "refusal",
    "alignment", "deception", "sandbagging", "watermark", "provenance",
    "side channel", "confidential", "privacy", "differential privacy",
    "robustness", "certif", "evaluation", "benchmark", "interpretab",
    "monitoring", "anomaly", "supply chain", "mcp", "model context protocol",
]


def _venue_hit(text: str, venues: list[str]) -> str | None:
    """Find a trusted venue named in free text (arXiv comment / journal ref)."""
    if not text:
        return None
    for venue in venues:
        # Short all-caps acronyms need tight boundaries so "CCS" does not match
        # inside another word and "S&P" survives regex escaping.
        pattern = r"(?<![A-Za-z])" + re.escape(venue) + r"(?![A-Za-z])"
        if re.search(pattern, text, re.IGNORECASE):
            return venue
    return None


# -ise / -ize and British/American pairs, so "authorisation" in the taxonomy
# matches "Unauthorized" in a paper title.
def _fold(text: str) -> str:
    text = text.lower()
    for a, b in (("isation", "ization"), ("ise", "ize"), ("ised", "ized"),
                 ("defence", "defense"), ("behaviour", "behavior")):
        text = text.replace(a, b)
    return text


def topic_score(candidate) -> int:
    """How many distinct AI-security terms the title+abstract touches."""
    blob = _fold(f"{candidate.title} {candidate.abstract}")
    return sum(1 for term in _TOPIC_TERMS if _fold(term) in blob)


def gap_terms(taxonomy: dict, gaps: dict) -> dict[str, int]:
    """Weighted vocabulary for the areas the inventory currently calls a gap.

    The pipeline should look harder at work addressing a known hole, not pass over
    it because the hole means there is little prior art for it to look topical
    against. Terms are weighted because they are not equally informative: a paper
    saying "MCP" is telling you something, a paper saying "monitoring" is not.

      2  taxonomy id segments ("mcp", "authz", "dangercap") - distinctive by
         construction - and multi-word phrases from a category label
      1  a single long word from a category label
    """
    by_id = {n["id"]: n for n in taxonomy.get("nodes", [])}
    cats = {c for gap in gaps.get("gaps", []) for c in gap.get("categories", [])}

    terms: dict[str, int] = {}
    def put(term: str, weight: int) -> None:
        term = term.strip(" .,;:()-")
        if term:
            terms[term] = max(terms.get(term, 0), weight)

    for cid in cats:
        node = by_id.get(cid)
        if not node:
            continue
        put(_fold(cid.split(".")[-1].replace("_", " ")), 2)
        for raw_phrase in _fold(node["label"]).split("&"):
            phrase = raw_phrase.strip(" .,;:()-")
            if " " in phrase:
                put(phrase, 2)
            elif len(phrase) >= 9:
                put(phrase, 1)
    return terms


def priority_score(candidate, terms: dict[str, int]) -> int:
    """Weighted gap-area signal in the candidate's title and abstract.

    Terms shorter than five characters match on word boundaries, so "tee" cannot
    fire inside "committee"; longer ones match as substrings, so "injection" also
    catches "injections"."""
    if not terms:
        return 0
    blob = _fold(f"{candidate.title} {candidate.abstract}")
    total = 0
    for t, w in terms.items():
        if len(t) < 5:
            if re.search(r"(?<![a-z0-9])" + re.escape(t) + r"(?![a-z0-9])", blob):
                total += w
        elif t in blob:
            total += w
    return total


def stage1(candidate, sources: dict, gap_vocab: dict[str, int] | None = None) -> dict:
    """Mechanical eligibility. Never calls a model."""
    venues = sources.get("trusted_venues", [])
    excluded = [k.lower() for k in sources.get("exclude_title_keywords", [])]
    feeds_by_name = {f["name"]: f for f in sources.get("feeds", [])}

    title_lc = candidate.title.lower()
    for bad in excluded:
        if bad in title_lc:
            return {
                "eligible": False,
                "tier": None,
                "reason": f"excluded keyword: {bad}",
                "needs_agent_judgement": False,
            }

    # A trusted feed vouches for its own publisher.
    if candidate.source == "feed":
        feed = feeds_by_name.get(candidate.source_name)
        if feed and feed.get("trusted"):
            return {
                "eligible": True,
                "tier": feed.get("tier", "industry-research"),
                "reason": f"trusted publisher: {feed['org']}",
                "needs_agent_judgement": False,
            }
        return {
            "eligible": False,
            "tier": None,
            "reason": "feed not on the trusted list",
            "needs_agent_judgement": False,
        }

    # arXiv: a named venue in the comment or journal ref is the strongest signal.
    venue = _venue_hit(candidate.comment, venues) or _venue_hit(
        candidate.journal_ref, venues
    )
    base = topic_score(candidate)
    gap_hits = priority_score(candidate, gap_vocab or {})
    # Work that lands in an open gap area clears a lower topical bar: a gap is by
    # definition a place with little prior art to look similar to.
    score = base + (2 if gap_hits >= 2 else 0)

    if score < 2:
        return {
            "eligible": False,
            "tier": None,
            "reason": f"off-topic (relevance {score})",
            "needs_agent_judgement": False,
        }

    if venue and (_ACCEPTED.search(candidate.comment or "") or candidate.journal_ref):
        return {
            "eligible": True,
            "tier": "peer-reviewed",
            "venue": venue,
            "reason": f"accepted at {venue}",
            "needs_agent_judgement": False,
        }

    if venue:
        return {
            "eligible": True,
            "tier": "peer-reviewed",
            "venue": venue,
            "reason": f"venue named in comment: {venue}",
            "needs_agent_judgement": True,
        }

    # A declared affiliation on a top-lab list is usable when arXiv supplies one.
    labs = sources.get("top_labs", [])
    for aff in candidate.affiliations:
        for lab in labs:
            if lab.lower() in aff.lower():
                return {
                    "eligible": True,
                    "tier": "top-institution",
                    "reason": f"declared affiliation: {lab}",
                    "needs_agent_judgement": False,
                }

    # Relevant preprint with no provenance signal we can read mechanically.
    # arXiv's API almost never returns affiliations, so this is the common path:
    # hand it to the model, which knows where these authors work. Because that
    # costs an API call per candidate and most such preprints will not clear the
    # inclusion bar, the topical bar is higher here than for a venue-named paper.
    if score < UNVOUCHED_MIN_RELEVANCE:
        return {
            "eligible": False,
            "tier": None,
            "reason": f"unvouched preprint below the relevance bar ({base} < {UNVOUCHED_MIN_RELEVANCE})",
            "needs_agent_judgement": False,
        }
    return {
        "eligible": True,
        "tier": None,
        "gap_hits": gap_hits,
        "reason": (f"relevant preprint (relevance {base}"
                   + (f", gap-area signal {gap_hits}" if gap_hits >= 2 else "")
                   + "), provenance unresolved"),
        "needs_agent_judgement": True,
    }


def partition(candidates: list, sources: dict, gap_vocab: dict[str, int] | None = None) -> tuple[list, list]:
    """Split candidates into (to_classify, rejected_with_reason)."""
    keep, drop = [], []
    for c in candidates:
        verdict = stage1(c, sources, gap_vocab)
        (keep if verdict["eligible"] else drop).append((c, verdict))

    # Spend a capped run's budget where it pays off: reviewed work first, then
    # work landing in an open gap, then the most clearly on-topic.
    keep.sort(
        key=lambda pair: (
            pair[1]["tier"] == "peer-reviewed",
            pair[1].get("gap_hits", 0),
            topic_score(pair[0]),
        ),
        reverse=True,
    )
    return keep, drop
