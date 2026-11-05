#!/usr/bin/env python3
"""Atheris fuzz target for the candidate gate.

gate.stage1 scores a paper's title, abstract and arXiv comment - all text
fetched from the open internet. It must return a verdict for any input rather
than raise, because one malformed record should not end the run.
"""

import pathlib
import sys

import atheris

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

with atheris.instrument_imports():
    import fetch
    import gate

SOURCES = {
    "trusted_venues": ["USENIX Security", "NeurIPS", "ICML"],
    "feeds": [], "exclude_title_keywords": ["retracted"],
    "top_labs": ["Anthropic", "Google DeepMind"],
}
VOCAB = {"mcp": 2, "least privilege": 2, "injection": 1}


def TestOneInput(data: bytes) -> None:
    fdp = atheris.FuzzedDataProvider(data)
    c = fetch.Candidate(
        id="arxiv:0000.0000",
        title=fdp.ConsumeUnicodeNoSurrogates(200),
        url="https://example.org/a",
        abstract=fdp.ConsumeUnicodeNoSurrogates(600),
        comment=fdp.ConsumeUnicodeNoSurrogates(120),
        journal_ref=fdp.ConsumeUnicodeNoSurrogates(80),
        source="arxiv",
    )
    gate.stage1(c, SOURCES, VOCAB)
    gate.topic_score(c)
    gate.priority_score(c, VOCAB)


def main() -> None:
    atheris.Setup(sys.argv, TestOneInput)
    atheris.Fuzz()


if __name__ == "__main__":
    main()
