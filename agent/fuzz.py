#!/usr/bin/env python3
"""Robustness testing for the parsers that eat untrusted input.

fetch._parse_xml and fetch.fetch_feed consume XML fetched from the open
internet. A publisher can change their feed, a host can be hijacked, and a
response can simply be garbage - and none of that should take the weekly job
down, because an unhandled exception there means no ingest and no deploy.

This mutates valid feeds and malformed payloads and asserts that every input
either parses or raises something the caller already handles. It is not
OSS-Fuzz and does not claim to be: no coverage guidance, fixed iteration count,
deterministic seed. It is a regression net over the one place this codebase
touches hostile bytes.

    python3 agent/fuzz.py [iterations]
"""

from __future__ import annotations

import pathlib
import random
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import fetch
import gate

SEEDS = [
    (b'<?xml version="1.0"?><rss version="2.0"><channel><item><title>x</title>'
     b'<link>https://e.com/a</link><pubDate>Mon, 03 Nov 2026 10:00:00 +0000</pubDate>'
     b"<description>prompt injection against agents</description></item></channel></rss>"),
    (b'<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry>'
     b'<title>y</title><link href="https://e.com/b"/><updated>2026-11-03T10:00:00Z</updated>'
     b"<summary>jailbreak</summary></entry></feed>"),
    b"<!DOCTYPE html><html><body>not a feed at all</body></html>",
    b"", b"   ", b"\x00\x01\x02", b"<feed><entry>", b"<rss>&nbsp;&bogus;&</rss>",
    b'<?xml version="1.0"?><feed>' + b"<entry><title>a</title></entry>" * 400 + b"</feed>",
]

def _flip_one_byte(b: bytes, r: random.Random) -> bytes:
    """Flip a single byte at a random offset - the classic bit-flip mutation."""
    if not b:
        return b
    i = r.randrange(len(b))
    return b[:i] + bytes([r.randrange(256)]) + b[i + 1:]


MUT = [
    lambda b, r: b[: r.randint(0, max(1, len(b)))],
    lambda b, r: b + bytes(r.randrange(256) for _ in range(r.randint(1, 40))),
    lambda b, r: b.replace(b"<", b"", 1),
    lambda b, r: b.replace(b">", b"", 1),
    lambda b, r: b.replace(b'"', b"'"),
    lambda b, r: b + b"&" * r.randint(1, 60),
    lambda b, r: b.replace(b"https", b"file", 1),
    lambda b, r: b.replace(b"entry", b"e" * 300, 1),
    _flip_one_byte,
    lambda b, r: b.upper(),
]

# Exceptions the callers already catch. Anything else is a real finding.
HANDLED = (ET.ParseError, ValueError, UnicodeDecodeError, AttributeError, TypeError, KeyError, IndexError)


def main() -> int:
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    r = random.Random(20261105)           # deterministic: a failure reproduces
    bad = []

    for _ in range(n):
        data = bytearray(r.choice(SEEDS))
        for _ in range(r.randint(1, 3)):
            data = bytearray(r.choice(MUT)(bytes(data), r))
        payload = bytes(data)
        try:
            root = fetch._parse_xml(payload)
            # Asserted, not just "did not raise": a parser that returns
            # something other than an element would break every caller
            # downstream while looking like a clean run here.
            assert root is not None, "parse returned None instead of raising"
            assert hasattr(root, "tag"), f"parse returned a {type(root).__name__}"
            assert isinstance(root.tag, str), "element tag is not a string"
        except HANDLED:
            pass
        except AssertionError as exc:
            bad.append(("_parse_xml", "ASSERT", str(exc)[:90], payload[:60]))
        except Exception as exc:
            bad.append(("_parse_xml", type(exc).__name__, str(exc)[:90], payload[:60]))

    # the gate must survive whatever a candidate's text contains
    sources = {"trusted_venues": ["USENIX Security", "NeurIPS"], "feeds": [],
               "exclude_title_keywords": ["retracted"], "top_labs": ["Anthropic"]}
    for _ in range(n // 3):
        junk = "".join(chr(r.randrange(32, 0x2FFF)) for _ in range(r.randint(0, 300)))
        c = fetch.Candidate(id="arxiv:1", title=junk, url="https://e.com",
                            abstract=junk[::-1], comment=junk[:80], source="arxiv")
        try:
            verdict = gate.stage1(c, sources)
            topic = gate.topic_score(c)
            prio = gate.priority_score(c, {"mcp": 2, "least privilege": 2})
            # The gate's contract, asserted on every case. A score that goes
            # negative or None on hostile text, or a verdict missing its
            # reason, would silently change what reaches the model - and a
            # run that merely "did not crash" would not notice.
            assert isinstance(verdict, dict), f"stage1 returned {type(verdict).__name__}"
            assert isinstance(verdict.get("eligible"), bool), "eligible is not a bool"
            assert isinstance(verdict.get("reason"), str), "reason is not a str"
            assert isinstance(topic, int), f"topic_score = {topic!r}"
            assert topic >= 0, f"topic_score negative: {topic}"
            assert isinstance(prio, int), f"priority_score = {prio!r}"
            assert prio >= 0, f"priority_score negative: {prio}"
        except AssertionError as exc:
            bad.append(("gate", "ASSERT", str(exc)[:90], junk[:40].encode()))
        except Exception as exc:
            bad.append(("gate", type(exc).__name__, str(exc)[:90], junk[:40].encode()))

    # a non-HTTP scheme must always be refused, never fetched
    for url in ["file:///etc/passwd", "ftp://x/y", "jar:file:///x", "data:text/html,x",
                "FILE:///etc/passwd", "gopher://x", "\\\\host\\share"]:
        try:
            fetch.get(url)
        except ValueError:
            pass            # the only correct outcome: refused before any I/O
        except Exception as exc:
            bad.append(("get", type(exc).__name__, str(exc)[:70], url.encode()))
        else:
            # Reached the network (or the filesystem) on a scheme that must
            # never be fetched. This is the finding the whole loop exists for,
            # so it cannot be left to "no exception was raised".
            bad.append(("get", "NOT-REFUSED", url, b""))

    print(f"  {n} parser cases, {n // 3} gate cases, 7 scheme cases")
    for b in bad[:12]:
        print(f"  UNHANDLED {b[0]}: {b[1]} — {b[2]!r} on {b[3]!r}")
    print(f"  {'no unhandled exceptions' if not bad else str(len(bad)) + ' unhandled'}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
