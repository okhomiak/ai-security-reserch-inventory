# Contributing

Thanks for looking. This is a small, opinionated repository: a static dashboard
over AI-security research plus a scheduled agent that keeps it current. The
things most worth contributing are **corrections** — a paper filed under the
wrong leaf, a missing overlap, an organisation's stated priorities read wrong —
because those are judgements, and judgements are where this is weakest.

## How to report something

| What | Where |
|---|---|
| A wrong classification, a missing paper, a broken link | [Open an issue](https://github.com/okhomiak/ai-security-reserch-inventory/issues/new) |
| A feature idea | [Open an issue](https://github.com/okhomiak/ai-security-reserch-inventory/issues/new) |
| A security vulnerability | **Not an issue.** [Open a private advisory](https://github.com/okhomiak/ai-security-reserch-inventory/security/advisories/new) — see [SECURITY.md](SECURITY.md) |

Every issue and its replies stay publicly readable and searchable in the
[issue archive](https://github.com/okhomiak/ai-security-reserch-inventory/issues?q=is%3Aissue).

## The contribution process

Changes reach `main` through **pull requests**. Direct pushes to `main` are
blocked by a repository ruleset; this applies to the maintainer too.

1. Fork, or branch if you have write access.
2. Make the change. Keep it to one thing.
3. Run the checks below. A red pull request is not ready for review.
4. Open a pull request and fill in the template. Say *why*, not just *what* —
   for a reclassification, cite the paper's own abstract.
5. Required checks (`validate`, `gitleaks`) must pass before merge.

## What makes a change acceptable

- **The data stays verifiable.** Every paper carries a real URL and, where one
  exists, a venue and citation count from Semantic Scholar. No invented
  metadata. If you cannot verify a field, leave it out rather than guess.
- **Referential integrity holds.** `agent/check.py` must report 0 errors.
  Papers may only cite taxonomy leaves that exist, gaps may only cite papers
  and needs that exist.
- **Derived data is regenerated, not hand-edited.** If you change
  `papers.json`, run `python3 agent/pipeline.py --derive-only` and commit the
  result. CI fails if `derived.json` disagrees with its inputs.
- **Authored prose is never overwritten by the agent.** A gap's claim chain and
  status are written by a human. The agent may only add an `agent_assessment`
  beside them. A change that lets the agent edit a claim will be rejected.
- **No inline styles in the page.** The published CSP forbids them; colour is
  applied through `data-sty` and the CSSOM. CI greps for `style="`.
- **Python passes `ruff` with this repository's config.** It selects `ALL` and
  then removes specific rules with written reasons in `pyproject.toml`. If a
  rule is wrong for a new file, add it to `per-file-ignores` *with the reason*
  — do not add a bare `noqa`.
- **Lines wrap at 110 characters.** Prose comments are welcome and encouraged;
  this codebase explains its reasoning in comments rather than docstrings.

## Tests

The suite is invocable the standard way for Python:

```bash
python3 -m pytest
```

The three underlying suites also run standalone, which is how the workflows
call them:

```bash
python3 agent/check.py             # referential integrity over docs/data
python3 agent/selftest.py --offline # the whole ingest path, model stubbed
python3 agent/fuzz.py 4000         # the untrusted-input parsers
python3 -m ruff check agent/ tests/
node --check docs/app.js
```

### The policy on adding tests

**As new functionality is added, a test for it is added in the same pull
request.** This is not negotiable for three areas, because they are where a
silent failure is most expensive:

1. **Anything that parses input from outside the repository** — feeds, API
   responses, model output. Add cases to `agent/fuzz.py`'s seeds or mutators.
2. **Anything that decides what reaches the model** (`agent/gate.py`). Add a
   unit test in `tests/test_agent.py` pinning the behaviour.
3. **Anything that writes to `docs/data/`.** Extend `agent/selftest.py`, which
   runs the whole path against a temporary copy.

A test that cannot fail is not a test. When you add one for a mitigation,
check that removing the mitigation makes it red before you commit it.

## Style

Prose comments over docstrings; explain the *why* and the thing that went
wrong, not the obvious *what*. The existing files are the reference — match
them. British spelling in prose. Em dashes are fine.
