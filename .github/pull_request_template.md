## What this changes

<!-- One or two lines. -->

Please read [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md) first — in
particular [what makes a change acceptable](../blob/main/CONTRIBUTING.md#what-makes-a-change-acceptable)
and [the policy on adding tests](../blob/main/CONTRIBUTING.md#the-policy-on-adding-tests).

## Checklist

- [ ] `python3 -m pytest` passes
- [ ] `python3 -m ruff check agent/ tests/` is clean
- [ ] New functionality comes with a test in this pull request — and that test
      was checked to fail when the thing it covers is removed
- [ ] `python3 agent/check.py` passes (no dangling ids)
- [ ] `python3 agent/pipeline.py --derive-only` run if `docs/data/*.json` changed
- [ ] New paper records carry a verified URL and a provenance tier with a justification
- [ ] No secret, token, key or credential in the diff — including in a test fixture
- [ ] Any new GitHub Action is pinned to a full commit SHA with a `# vX.Y.Z` comment
- [ ] Any new job declares the minimum `permissions:` it needs
- [ ] No new third-party resource loaded by the page (it would need a CSP change — say why)

## For agent-generated ingests

- [ ] Classifications spot-checked: category, provenance tier, claimed overlaps
- [ ] Any `notes` field reporting an injection attempt in a source abstract has been read
