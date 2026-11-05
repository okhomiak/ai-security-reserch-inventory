# Changelog

Dates are the release date. Versioning is [CalVer](https://calver.org/)
(`YYYY.MM.MICRO`), because this is a continuously-published dataset and a
website rather than a library anyone pins — the useful question about a version
is "how current is the data", which a date answers and a semantic version does
not.

The dashboard itself deploys from `main` on every push, so a release here marks
a coherent state of the data and tooling, not a separate artefact to download.

## 2026.11.1 — 2026-11-05

Trust and verifiability. No change to the inventory itself.

- **Signed releases.** A release workflow builds the data as a checksummed
  tarball and signs it with cosign keyless signing, so a third party can verify
  they hold the same bytes this repository published. Build provenance is
  attached as a GitHub attestation. This closes the Scorecard `Signed-Releases`
  check, which previously read "no releases found" — there was a tag, but a tag
  is not a release and nothing was signed.
- **Status badges.** Workflow badges that can go red, plus badges generated
  from the project's own data (paper count, measured overlaps, referential
  integrity, inventory date). The generated ones are rebuilt on every derive
  and checked in CI, so a badge cannot outlive the number it claims.
- **`CITATION.cff`**, giving GitHub's native "Cite this repository" button.
- **OpenSSF Best Practices passing badge** earned: 51 criteria Met, 15 N/A,
  1 Unmet (`test_most` — `docs/app.js` has no automated tests, which is
  recorded rather than claimed).

## 2026.11.0 — 2026-11-05

First tagged release.

### The inventory
- 169 papers across a taxonomy of 9 branches and 41 leaves, each leaf carrying
  a plain-language `means` and a concrete `example`.
- 386 measured overlaps between papers and the 20 clusters they form.
- 28 organisations scored against 12 needs, with a stated methodology naming
  six biases in the scoring.
- 8 gaps, each a numbered chain of claims carrying its counter-argument,
  `closes_when`, `blocked_by` and a falsifier.
- 7 frameworks mapped onto the taxonomy, scored on their **weakest** mapped
  category rather than the union — which is what surfaced "Identity & secrets"
  as the thinnest leg under four separate frameworks.
- 27 verified AI-security repositories and a security-filtered news feed.

### The agent
- Weekly scheduled ingest: fetch, mechanical gate, classification with
  `claude-opus-5`, validation against the taxonomy, merge, derive, and a
  strictly additive gap reassessment.
- Candidate text is treated as untrusted throughout. Invented category, need
  and overlap ids are dropped before anything is written.

### Tooling and security
- `ruff` with `select = ["ALL"]` and per-rule exclusions that carry written
  reasons.
- `pytest` suite; end-to-end onboarding test with the model stubbed; a
  deterministic parser fuzzer with assertions on the gate's contract.
- semgrep, gitleaks, CodeQL default setup, OpenSSF Scorecard, ClusterFuzzLite.
- All GitHub Actions pinned to commit SHAs; container images pinned by digest.
- Content Security Policy with no `unsafe-inline`.

### Known limits
- The seed inventory was assembled for this repository. It is not a systematic
  literature review, and the classification of any single paper is one
  reading of it. Corrections are the most useful contribution.
- The dashboard's own JavaScript has no automated tests; the suite covers the
  Python agent and the published data.
