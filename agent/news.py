"""Latest security-relevant posts from frontier labs and security research groups.

Separate from the paper inventory on purpose. A lab blog post is not a paper: it
is not reviewed, it is often the first public signal of an incident or a
capability, and it dates fast. Mixing the two would corrupt the provenance tiers
the inventory depends on - so news lives in its own file and its own tab, and a
post only becomes a paper record if someone promotes it by hand.

Two source shapes:
  * RSS/Atom, for publishers that offer it
  * the Anthropic sitemap, because they do not - robots.txt explicitly allows it,
    and it carries lastmod dates, so it is a legitimate index rather than scraping
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import fetch  # noqa: E402

SM = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

# Terms that make a lab post security-relevant. Deliberately broader than the
# paper gate: a news feed should surface the adjacent item, not only the
# certain one.
TERMS = [
    "security", "safety", "misuse", "threat", "attack", "vulnerab", "exploit",
    "jailbreak", "injection", "red team", "red-team", "adversar", "malware",
    "phishing", "fraud", "scam", "abuse", "espionage", "incident", "disrupt",
    "guardrail", "classifier", "alignment", "deception", "sabotage", "interpretab",
    "evaluation", "eval", "dangerous", "cyber", "bio", "cbrn", "asl-", "safeguard",
    "privacy", "memoriz", "unlearn", "watermark", "provenance", "agent", "sandbox",
    "permission", "authoriz", "frontier", "responsible scaling", "bug bounty",
    "disclosure", "policy", "govern", "transparency", "risk",
]

SITEMAPS = [
    {"name": "Anthropic", "url": "https://www.anthropic.com/sitemap.xml",
     "include": ("/news/", "/research/", "/engineering/"), "org": "Anthropic",
     "tier": "frontier-lab"},
]


def _slug_title(url: str) -> str:
    slug = url.rstrip("/").split("/")[-1]
    words = re.split(r"[-_]", slug)
    out = " ".join(words)
    return out[:1].upper() + out[1:]


def _page_title(url: str) -> str | None:
    """Fetch a page only to read its <title>. Used sparingly, for the few recent
    sitemap entries that make the cut."""
    try:
        raw = fetch._get(url, retries=1, timeout=20)
    except Exception:  # noqa: BLE001
        return None
    m = re.search(rb"<title[^>]*>(.*?)</title>", raw, re.S | re.I)
    if not m:
        return None
    title = re.sub(r"\s+", " ", m.group(1).decode("utf-8", "replace")).strip()
    # strip the site suffix most pages append
    title = re.split(r"\s+[\\|·—-]\s+Anthropic\s*$", title)[0].strip()
    return title or None


def relevant(text: str) -> int:
    low = text.lower()
    return sum(1 for t in TERMS if t in low)


def from_sitemap(cfg: dict, days: int, fetch_titles: int = 80) -> list[dict]:
    try:
        raw = fetch._get(cfg["url"], timeout=50)
        root = ET.fromstring(raw)
    except Exception as exc:  # noqa: BLE001
        print(f"  ! sitemap unreachable: {cfg['name']} ({exc})")
        return []

    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat()
    rows = []
    for u in root.findall(f"{SM}url"):
        loc = u.findtext(f"{SM}loc") or ""
        mod = (u.findtext(f"{SM}lastmod") or "")[:10]
        if not loc or not any(seg in loc for seg in cfg["include"]):
            continue
        if mod and mod < cutoff:
            continue
        rows.append({"url": loc, "date": mod})

    rows.sort(key=lambda r: r["date"], reverse=True)
    out = []
    for i, r in enumerate(rows):
        slug_title = _slug_title(r["url"])
        score = relevant(slug_title + " " + r["url"])
        # A slug makes a poor title, so fetch the real one - but cap it, and
        # record which is which so the UI never presents a guess as a fact.
        title = _page_title(r["url"]) if i < fetch_titles else None
        src = "page" if title else "slug"
        title = title or slug_title
        score = max(score, relevant(title))
        if score < 1:
            continue
        out.append({
            "id": "news:" + re.sub(r"[^a-z0-9]+", "-", r["url"].split("//")[-1].lower()).strip("-"),
            "title": title, "url": r["url"], "date": r["date"],
            "org": cfg["org"], "source": cfg["name"], "tier": cfg["tier"],
            "summary": "", "relevance": score, "title_source": src,
        })
    return out


def from_feeds(sources: dict, days: int) -> list[dict]:
    out = []
    for feed in sources.get("feeds", []):
        items = fetch.fetch_feed(feed, days)
        print(f"  feed {feed['name']}: {len(items)} in window")
        for c in items:
            score = relevant(f"{c.title} {c.abstract}")
            if score < 1:
                continue
            out.append({
                "id": "news:" + re.sub(r"[^a-z0-9]+", "-", c.url.split("//")[-1].lower()).strip("-")[:120],
                "title": c.title, "url": c.url, "date": c.date,
                "org": feed["org"], "source": feed["name"],
                "tier": feed.get("tier", "industry-research"),
                "summary": re.sub(r"\s+", " ", c.abstract)[:420],
                "relevance": score, "title_source": "feed",
            })
    return out


def build(sources: dict, days: int = 120, keep: int = 160) -> dict:
    print("== news")
    rows = from_feeds(sources, days)
    for cfg in SITEMAPS:
        got = from_sitemap(cfg, days)
        print(f"  sitemap {cfg['name']}: {len(got)} relevant")
        rows += got

    seen, uniq = set(), []
    for r in sorted(rows, key=lambda r: (r["date"], r["relevance"]), reverse=True):
        if r["url"] in seen:
            continue
        seen.add(r["url"])
        uniq.append(r)

    return {
        "schema": 1,
        "updated": datetime.now(timezone.utc).date().isoformat(),
        "window_days": days,
        "note": ("Security-relevant posts from frontier labs and security research groups. "
                 "Not peer-reviewed and not part of the paper inventory - this is the early "
                 "signal layer. Promote an item into docs/data/papers.json by hand if it "
                 "turns out to matter."),
        "count": len(uniq[:keep]),
        "items": uniq[:keep],
    }


if __name__ == "__main__":
    cfg = json.loads((pathlib.Path(__file__).parent / "sources.json").read_text())
    doc = build(cfg, days=int(sys.argv[1]) if len(sys.argv) > 1 else 120)
    out = pathlib.Path(__file__).parent.parent / "docs" / "data" / "news.json"
    out.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n")
    print(f"\n{doc['count']} items -> {out}")
