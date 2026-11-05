"""The agent's test suite, invocable the standard way for Python: `pytest`.

The three existing suites - check.py (referential integrity), selftest.py (the
end-to-end onboarding path with a stubbed model) and fuzz.py (the untrusted-
input parsers) - are the substance, and they stay runnable on their own because
the workflows call them directly. This module makes them discoverable by pytest
and adds unit tests for the pure functions that the end-to-end suites only
exercise indirectly.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "agent"))

import fetch  # noqa: E402
import gate  # noqa: E402


def _run(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, *args], cwd=ROOT, capture_output=True, text=True, check=False,
    )


# ---------------------------------------------------------------- the suites

def test_referential_integrity() -> None:
    """Every id referenced anywhere in docs/data resolves."""
    r = _run("agent/check.py")
    assert r.returncode == 0, r.stdout + r.stderr


def test_end_to_end_onboarding() -> None:
    """Discovery through merge and gap reassessment, with the model stubbed."""
    r = _run("agent/selftest.py", "--offline")
    assert r.returncode == 0, r.stdout + r.stderr
    assert "ALL CHECKS PASSED" in r.stdout


def test_parsers_survive_hostile_input() -> None:
    """The feed and gate parsers on mutated input. Deterministic seed."""
    r = _run("agent/fuzz.py", "1200")
    assert r.returncode == 0, r.stdout + r.stderr
    assert "no unhandled exceptions" in r.stdout


# ------------------------------------------------- the fetch scheme boundary

@pytest.mark.parametrize("url", [
    "file:///etc/passwd",
    "FILE:///etc/passwd",
    "ftp://example.org/x",
    "jar:file:///x",
    "data:text/html,<b>x</b>",
    "gopher://example.org",
    r"\\host\share",
])
def test_non_http_schemes_are_refused(url: str) -> None:
    """urllib honours file:// and ftp://. get() must not."""
    with pytest.raises(ValueError, match="non-HTTP"):
        fetch.get(url)


def test_a_dtd_is_refused_before_parsing() -> None:
    """ElementTree expands internal entities, so a billion-laughs feed is the
    one XML attack that applies here. No real feed declares an entity."""
    bomb = (
        b'<?xml version="1.0"?><!DOCTYPE lolz [<!ENTITY lol "lol">'
        b'<!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;">]><feed>&lol2;</feed>'
    )
    with pytest.raises(ValueError, match="DTD or entity"):
        fetch._parse_xml(bomb)


def test_html_served_instead_of_a_feed_is_a_clear_error() -> None:
    with pytest.raises(ValueError, match="not a feed"):
        fetch._parse_xml(b"<!DOCTYPE html><html><body>nope</body></html>")


# -------------------------------------------------------------- the gate

def test_short_gap_terms_match_on_word_boundaries() -> None:
    """"tee" must not fire inside "committee" - that was a real false positive."""
    c = fetch.Candidate(
        id="t:1", title="Report of the committee", url="https://e.org/a",
        abstract="Minutes of a committee meeting.", comment="", source="arxiv",
    )
    assert gate.priority_score(c, {"tee": 2}) == 0


def test_long_gap_terms_match_as_substrings() -> None:
    """"injection" should also catch "injections"."""
    c = fetch.Candidate(
        id="t:2", title="Prompt injections in agents", url="https://e.org/b",
        abstract="We study prompt injections.", comment="", source="arxiv",
    )
    assert gate.priority_score(c, {"injection": 2}) > 0


def test_stage1_verdict_shape() -> None:
    """The contract the fuzzer asserts on every case, stated once as a test."""
    c = fetch.Candidate(
        id="t:3", title="Jailbreaking aligned language models",
        url="https://e.org/c", abstract="Adversarial prompts against RLHF models.",
        comment="", source="arxiv",
    )
    v = gate.stage1(c, {"trusted_venues": [], "feeds": [],
                        "exclude_title_keywords": [], "top_labs": []})
    assert isinstance(v, dict)
    assert isinstance(v["eligible"], bool)
    assert isinstance(v["reason"], str)


# ------------------------------------------------------------------ the data

def test_published_data_is_valid_json() -> None:
    for f in sorted((ROOT / "docs" / "data").glob("*.json")):
        json.loads(f.read_text())


def test_taxonomy_leaves_explain_themselves() -> None:
    """Every leaf carries the prose the dashboard's popups render."""
    tax = json.loads((ROOT / "docs" / "data" / "taxonomy.json").read_text())
    nodes = tax["nodes"]
    ids = {n["id"] for n in nodes}
    leaves = [n for n in nodes if n.get("parent")]
    assert leaves, "taxonomy has no leaves"
    orphans = [n["id"] for n in leaves if n["parent"] not in ids]
    assert not orphans, f"leaves with a dangling parent: {orphans}"
    missing = [n["id"] for n in leaves if not n.get("means") or not n.get("example")]
    assert not missing, f"leaves without means/example: {missing}"
