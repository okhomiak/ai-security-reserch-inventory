## What this changes

<!-- One or two lines. -->

## Checklist

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
