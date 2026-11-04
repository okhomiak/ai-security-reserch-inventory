"""Candidate discovery. Standard library only - no network deps beyond urllib.

Two sources:
  * the arXiv Atom API, queried with the expressions in sources.json
  * Atom/RSS feeds from labs and security research groups

Everything returned here is a *candidate*. Nothing is trusted yet; gate.py decides.
"""

from __future__ import annotations

import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta, timezone

USER_AGENT = (
    "ai-security-research-inventory/1.0 "
    "(+https://github.com/okhomiak/ai-security-reserch-inventory)"
)
ARXIV_API = "http://export.arxiv.org/api/query"
ATOM = "{http://www.w3.org/2005/Atom}"
ARXIV_NS = "{http://arxiv.org/schemas/atom}"


@dataclass
class Candidate:
    id: str
    title: str
    url: str
    abstract: str = ""
    authors: list[str] = field(default_factory=list)
    affiliations: list[str] = field(default_factory=list)
    date: str = ""
    source: str = ""
    source_name: str = ""
    comment: str = ""
    pdf: str = ""
    journal_ref: str = ""
    arxiv_categories: list[str] = field(default_factory=list)

    def as_dict(self) -> dict:
        return asdict(self)


def _get(url: str, retries: int = 3, timeout: int = 45) -> bytes:
    last = None
    for attempt in range(retries):
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            last = exc
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"GET failed after {retries} tries: {url} ({last})")


def _clean(text: str | None) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def fetch_arxiv(query: str, max_results: int = 60, window_days: int = 10) -> list[Candidate]:
    """One arXiv API query, newest first, filtered to the recency window."""
    params = urllib.parse.urlencode(
        {
            "search_query": query,
            "start": 0,
            "max_results": max_results,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }
    )
    root = ET.fromstring(_get(f"{ARXIV_API}?{params}"))
    cutoff = datetime.now(timezone.utc) - timedelta(days=window_days)
    out: list[Candidate] = []

    for entry in root.findall(f"{ATOM}entry"):
        raw_id = _clean(entry.findtext(f"{ATOM}id"))
        m = re.search(r"abs/([0-9]{4}\.[0-9]{4,5})(v\d+)?", raw_id)
        if not m:
            continue
        arxiv_id = m.group(1)

        published = _clean(entry.findtext(f"{ATOM}published"))
        try:
            when = datetime.fromisoformat(published.replace("Z", "+00:00"))
        except ValueError:
            continue
        if when < cutoff:
            continue

        authors, affils = [], []
        for a in entry.findall(f"{ATOM}author"):
            name = _clean(a.findtext(f"{ATOM}name"))
            if name:
                authors.append(name)
            aff = _clean(a.findtext(f"{ARXIV_NS}affiliation"))
            if aff and aff not in affils:
                affils.append(aff)

        pdf = ""
        for link in entry.findall(f"{ATOM}link"):
            if link.get("title") == "pdf":
                pdf = link.get("href", "")

        out.append(
            Candidate(
                id=f"arxiv:{arxiv_id}",
                title=_clean(entry.findtext(f"{ATOM}title")),
                url=f"https://arxiv.org/abs/{arxiv_id}",
                abstract=_clean(entry.findtext(f"{ATOM}summary")),
                authors=authors,
                affiliations=affils,
                date=when.date().isoformat(),
                source="arxiv",
                source_name="arXiv",
                comment=_clean(entry.findtext(f"{ARXIV_NS}comment")),
                journal_ref=_clean(entry.findtext(f"{ARXIV_NS}journal_ref")),
                pdf=pdf,
                arxiv_categories=[
                    c.get("term", "") for c in entry.findall(f"{ATOM}category")
                ],
            )
        )
    return out


def _feed_entries(root: ET.Element) -> list[ET.Element]:
    entries = root.findall(f"{ATOM}entry")
    if entries:
        return entries
    return root.findall(".//item")  # RSS 2.0


def _feed_field(entry: ET.Element, atom_tag: str, rss_tag: str) -> str:
    value = entry.findtext(f"{ATOM}{atom_tag}")
    if value is None:
        value = entry.findtext(rss_tag)
    return _clean(value)


_BARE_AMP = re.compile(rb"&(?!#?\w{1,10};)")
_CTRL = re.compile(rb"[\x00-\x08\x0b\x0c\x0e-\x1f]")
_HTML_ENT = re.compile(rb"&(nbsp|ndash|mdash|rsquo|lsquo|ldquo|rdquo|hellip|amp\w+);")


def _parse_xml(raw: bytes) -> ET.Element:
    """Parse a feed, retrying leniently. Several publishers emit XML containing
    bare ampersands or HTML entities that are undeclared in XML; losing the whole
    feed over one of those is not worth it."""
    head = raw[:400].lstrip().lower()
    if head.startswith(b"<!doctype html") or head.startswith(b"<html"):
        raise ValueError("served an HTML page, not a feed - the URL is probably wrong")
    try:
        return ET.fromstring(raw)
    except ET.ParseError:
        fixed = _CTRL.sub(b"", raw)
        fixed = _HTML_ENT.sub(b" ", fixed)
        fixed = _BARE_AMP.sub(b"&amp;", fixed)
        return ET.fromstring(fixed)


def fetch_feed(feed: dict, window_days: int = 10) -> list[Candidate]:
    """One Atom or RSS feed. Failures are non-fatal - a dead feed must not kill the run."""
    try:
        root = _parse_xml(_get(feed["url"]))
    except Exception as exc:  # noqa: BLE001 - feeds break; the run continues
        print(f"  ! feed unreachable: {feed['name']} ({exc})")
        return []

    cutoff = datetime.now(timezone.utc) - timedelta(days=window_days)
    out: list[Candidate] = []

    for entry in _feed_entries(root):
        title = _feed_field(entry, "title", "title")
        link = entry.findtext("link") or ""
        if not link:
            for l in entry.findall(f"{ATOM}link"):
                if l.get("rel") in (None, "alternate"):
                    link = l.get("href", "")
                    break
        link = _clean(link)
        if not title or not link:
            continue

        raw_date = (
            _feed_field(entry, "updated", "pubDate")
            or _feed_field(entry, "published", "dc:date")
        )
        when = None
        for parse in (
            lambda s: datetime.fromisoformat(s.replace("Z", "+00:00")),
            lambda s: datetime.strptime(s, "%a, %d %b %Y %H:%M:%S %z"),
            lambda s: datetime.strptime(s, "%a, %d %b %Y %H:%M:%S %Z").replace(
                tzinfo=timezone.utc
            ),
        ):
            try:
                when = parse(raw_date)
                break
            except (ValueError, AttributeError):
                continue
        if when is None or when < cutoff:
            continue

        summary = (
            _feed_field(entry, "summary", "description")
            or _feed_field(entry, "content", "content:encoded")
        )
        summary = _clean(re.sub(r"<[^>]+>", " ", summary))[:4000]

        out.append(
            Candidate(
                id=f"url:{link}",
                title=title,
                url=link,
                abstract=summary,
                affiliations=[feed["org"]],
                date=when.date().isoformat(),
                source="feed",
                source_name=feed["name"],
            )
        )
    return out


def discover(sources: dict, window_days: int | None = None) -> list[Candidate]:
    """Run every configured source and de-duplicate by id and normalised title."""
    window = window_days if window_days is not None else sources.get("window_days", 10)
    seen_ids: set[str] = set()
    seen_titles: set[str] = set()
    found: list[Candidate] = []

    for query in sources.get("arxiv_queries", []):
        print(f"  arXiv: {query[:70]}...")
        try:
            batch = fetch_arxiv(query, sources.get("max_per_query", 60), window)
        except Exception as exc:  # noqa: BLE001
            print(f"  ! arXiv query failed ({exc})")
            continue
        print(f"    {len(batch)} in window")
        found.extend(batch)
        time.sleep(3)  # arXiv asks for one request every few seconds

    for feed in sources.get("feeds", []):
        print(f"  feed: {feed['name']}")
        batch = fetch_feed(feed, window)
        print(f"    {len(batch)} in window")
        found.extend(batch)

    unique: list[Candidate] = []
    for c in found:
        key = re.sub(r"[^a-z0-9]", "", c.title.lower())[:90]
        if c.id in seen_ids or (key and key in seen_titles):
            continue
        seen_ids.add(c.id)
        if key:
            seen_titles.add(key)
        unique.append(c)
    return unique


if __name__ == "__main__":
    import pathlib

    cfg = json.loads((pathlib.Path(__file__).parent / "sources.json").read_text())
    items = discover(cfg)
    print(f"\n{len(items)} unique candidates")
    print(json.dumps([i.as_dict() for i in items], indent=2)[:2000])
