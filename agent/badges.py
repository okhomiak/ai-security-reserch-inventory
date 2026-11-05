"""Generate the project's own status badges as SVG, from its own data.

Self-hosted on purpose. The dashboard's CSP is `img-src 'self' data:`, so a
shields.io badge would be blocked outright, and widening the CSP to admit one
would hand every visitor's IP to a third party. These are regenerated from
docs/data on every derive, so they cannot drift from what they claim - and CI
fails if a committed badge disagrees with the data beside it.

  python3 agent/badges.py        # writes docs/assets/badge-*.svg
"""

from __future__ import annotations

import io
import json
import pathlib
import sys
from contextlib import redirect_stdout

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "docs" / "data"
OUT = ROOT / "docs" / "assets"

LABEL_BG = "#555"
GOOD = "#4c1"        # same green as the OpenSSF passing badge, so they match
BAD = "#e05d44"
INFO = "#007ec6"     # informational, not a status - a count is not "good"

# Approximate advance widths for 11px DejaVu Sans / Verdana, which is what
# every badge renderer falls back to. Exact enough that textLength (below)
# never has to stretch a label by more than a pixel.
_W = {" ": 3.6, "-": 4.3, ".": 3.6, ",": 3.6, ":": 3.6, "/": 4.4, "0": 7.0,
      "1": 7.0, "2": 7.0, "3": 7.0, "4": 7.0, "5": 7.0, "6": 7.0, "7": 7.0,
      "8": 7.0, "9": 7.0, "i": 3.2, "l": 3.2, "j": 3.2, "t": 4.4, "f": 4.0,
      "r": 4.8, "m": 10.6, "w": 9.2, "M": 10.4, "W": 10.6}


def text_width(s: str) -> float:
    return sum(_W.get(ch, 6.6) for ch in s)


def badge(label: str, value: str, colour: str) -> str:
    """One flat badge, 20px tall, matching the shields.io geometry."""
    lw = round(text_width(label) + 11)
    vw = round(text_width(value) + 11)
    w = lw + vw
    # textLength pins each string to the width the box was sized for, so a
    # font substitution on the viewer's machine cannot push text out of its box.
    lt, vt = round(text_width(label), 1), round(text_width(value), 1)
    esc = lambda s: (s.replace("&", "&amp;").replace("<", "&lt;")  # noqa: E731
                      .replace(">", "&gt;").replace('"', "&quot;"))
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="20" '
        f'role="img" aria-label="{esc(label)}: {esc(value)}">'
        f"<title>{esc(label)}: {esc(value)}</title>"
        '<linearGradient id="s" x2="0" y2="100%">'
        '<stop offset="0" stop-color="#bbb" stop-opacity=".1"/>'
        '<stop offset="1" stop-opacity=".1"/></linearGradient>'
        f'<clipPath id="r"><rect width="{w}" height="20" rx="3" fill="#fff"/></clipPath>'
        f'<g clip-path="url(#r)"><rect width="{lw}" height="20" fill="{LABEL_BG}"/>'
        f'<rect x="{lw}" width="{vw}" height="20" fill="{colour}"/>'
        f'<rect width="{w}" height="20" fill="url(#s)"/></g>'
        '<g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,sans-serif" '
        'font-size="11">'
        f'<text x="{lw / 2}" y="15" fill="#010101" fill-opacity=".3" '
        f'textLength="{lt}">{esc(label)}</text>'
        f'<text x="{lw / 2}" y="14" textLength="{lt}">{esc(label)}</text>'
        f'<text x="{lw + vw / 2}" y="15" fill="#010101" fill-opacity=".3" '
        f'textLength="{vt}">{esc(value)}</text>'
        f'<text x="{lw + vw / 2}" y="14" textLength="{vt}">{esc(value)}</text>'
        "</g></svg>"
    )


def integrity() -> tuple[str, str]:
    """Run the real referential-integrity check rather than assume it passes."""
    sys.path.insert(0, str(ROOT / "agent"))
    import check
    buf = io.StringIO()
    with redirect_stdout(buf):
        rc = check.main()
    return ("0 errors", GOOD) if rc == 0 else ("failing", BAD)


def main() -> int:
    papers = json.loads((DATA / "papers.json").read_text())
    derived = json.loads((DATA / "derived.json").read_text())
    value, colour = integrity()

    OUT.mkdir(parents=True, exist_ok=True)
    made = {
        "badge-papers.svg":    badge("papers", str(len(papers["papers"])), INFO),
        "badge-overlaps.svg":  badge("measured overlaps", str(len(derived["pairs"])), INFO),
        "badge-integrity.svg": badge("data integrity", value, colour),
        "badge-updated.svg":   badge("inventory updated", derived["generated"], INFO),
    }
    for name, svg in made.items():
        (OUT / name).write_text(svg + "\n")
    print(f"  badges: {' · '.join(sorted(made))}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
