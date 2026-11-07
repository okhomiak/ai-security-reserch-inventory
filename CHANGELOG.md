# Changelog

Dates are the release date. Versioning is [CalVer](https://calver.org/)
(`YYYY.MM.MICRO`), because this is a continuously-published dataset and a
website rather than a library anyone pins — the useful question about a version
is "how current is the data", which a date answers and a semantic version does
not.

The dashboard itself deploys from `main` on every push, so a release here marks
a coherent state of the data and tooling, not a separate artefact to download.

## Unreleased

- **The Strata redesign is live in `docs/`.** The left rail, type, surfaces and
  colour are restyled across all ten views; Demand is rebuilt as a glass slab over research-coverage bars with a per-need
  sheet; Papers is a single sortable, groupable table; every other view takes
  the same type, surfaces and flat inline stat rows. Light and dark both work
  (`?theme=light|dark` pins one), glass falls back to opaque surfaces under
  `prefers-reduced-transparency`, and CSP is unchanged (no inline style, no
  webfonts). Keyboard: `1`-`9` and `0` jump between the ten views.

## 2026.11.4 — 2026-11-07

- **Validate failed on any push made on a day after the last data refresh.**
  The "derived data is current" gate recomputed the data and compared it with
  what was committed, but the recompute stamped today's date into
  `derived.json`, every gap's `refreshed` field and the "inventory updated"
  badge, so the comparison failed on the date alone. `pipeline.py --as-of`
  pins the stamped date and the gate pins it to the committed value, so the
  check now fails only when the numbers differ. The release workflow had the
  same check with the same bug; it now ignores date-only differences instead,
  because a manual run of an older tag executes that tag's `pipeline.py`,
  which may predate `--as-of`.
- **A redesign proposal, "Strata", lives in `design/strata/`:** a self-contained
  mockup with screenshots and the designer's notes. It was a proposal
  only when released; the live dashboard adopts it in the entry above.
- **ClusterFuzzLite also runs on pushes to `main` that touch the fuzzed code**
  (`agent/`, `.clusterfuzzlite/`, its own workflow), so its badge reflects
  `main` rather than the last pull request or Thursday's scheduled run.
- **2026.11.3 was described below but never tagged.** The tag now exists, on
  the commit this file described it at. Its tag-push release ran that
  commit's own workflow and failed on the old date check, so, like
  2026.11.2, it publishes through a manual run of the release workflow with
  the tag as input.

## 2026.11.3 — 2026-11-05

- **The 2026.11.2 release did not publish.** A line-continuation backslash
  inside an unquoted YAML scalar: YAML folds the newline to a space, so the
  shell received `cp "src" \ "dest"` and read `\ ` as an escaped space,
  giving `cp` a destination path with a leading space. The step was correct;
  the quoting was not. Already fixed on main as a side effect of moving every
  interpolation into `env`.
- **A failed release can now be re-run.** `workflow_dispatch` checked out the
  default branch rather than the tag, so re-running a release would have built
  `main` and labelled it with the tag's version — publishing something that is
  not what the tag claims. Manual runs now check out the tag they are given.

## 2026.11.2 — 2026-11-05

- **Provenance ships with the artefact.** `actions/attest-build-provenance`
  files the attestation with GitHub's API, which is no help to someone holding
  the tarball on a disconnected machine. The in-toto bundle is now a release
  asset (`*.intoto.jsonl`), verifiable with `gh attestation verify --bundle`.
  Scorecard caps a release at 8/10 until the provenance is downloadable beside
  the thing it describes, which is a fair thing to insist on.
- **Fixes a latent bug in the release workflow**: a manual run took its version
  from `github.ref_name`, which on `workflow_dispatch` is a *branch*, so it
  would have published a bundle named after a branch. Manual runs now take the
  tag as an explicit input.

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
