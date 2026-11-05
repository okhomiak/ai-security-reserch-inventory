# Interface reference

Everything this project exposes to the outside world, input and output. There
are three surfaces: the **agent's command line**, the **environment** it reads,
and the **JSON files** it writes — which are also the dashboard's only input and
the project's public data interface. Nothing else is stable; treat
`docs/app.js`, `docs/index.html` and the module internals as implementation.

Field types below were read off the committed data, not from a hand-maintained
spec. `agent/check.py` is the executable form of the referential rules.

---

## 1. Command line

### `agent/pipeline.py` — the ingest run

```
python3 agent/pipeline.py [--dry-run] [--derive-only] [--limit N] [--days N]
```

| Flag | Type | Default | Effect |
|---|---|---|---|
| `--dry-run` | flag | off | Runs discovery and the mechanical gate, then stops. **No API calls, no writes.** Use this to see what a run would consider. |
| `--derive-only` | flag | off | Skips discovery and classification entirely; recomputes `derived.json` and the derived parts of `gaps.json` from the committed `papers.json`. Run this after any hand edit. |
| `--limit N` | int | unlimited | Caps how many candidates are sent to the model this run. The cost control. |
| `--days N` | int | from `sources.json` | Overrides the recency window for discovery. |

**Exit codes:** `0` success. `1` any unhandled error, with a traceback on
stderr. A run that discovers nothing is a success, not a failure.

**stdout** is a structured progress log intended for a CI log, not for
parsing — the machine-readable record of a run is appended to
`docs/data/runs.json`.

### Other entry points

| Command | Purpose | Exit codes |
|---|---|---|
| `python3 agent/check.py` | Referential integrity over `docs/data/`. Reads only. | `0` clean, `1` any error |
| `python3 agent/selftest.py --offline` | The whole ingest path against a temporary copy, model stubbed. Never touches real data. | `0` all checks passed |
| `python3 agent/fuzz.py [cases]` | Parser fuzzing, default 3000 cases, deterministic seed. | `0` no unhandled exceptions |
| `python3 -m pytest` | All of the above plus unit tests. | standard pytest |

---

## 2. Environment

| Variable | Required | Default | Meaning |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | for classification | — | Read at call time, never written to a file or log. Not needed for `--dry-run`, `--derive-only`, the tests, or the fuzzer. |
| `ANTHROPIC_AUTH_TOKEN` | no | — | Alternative to the API key. |
| `CLASSIFIER_MODEL` | no | `claude-opus-5` | Model for paper classification. |
| `CLASSIFIER_EFFORT` | no | repo default | `output_config.effort` for classification. |
| `GAP_MODEL` | no | `claude-opus-5` | Model for gap reassessment. |
| `GAP_EFFORT` | no | repo default | Effort for gap reassessment. |
| `GITHUB_ACTOR`, `GITHUB_EVENT_NAME` | no | — | Recorded in `runs.json` so a manual run is distinguishable from the schedule. |

---

## 3. Input: `agent/sources.json`

The discovery allowlist. **Nothing is ever fetched from a URL discovered at
runtime** — if it is not in this file, it is not fetched.

| Key | Type | Meaning |
|---|---|---|
| `feeds` | list | Each `{name, url, trusted, …}`. `trusted: true` lets a candidate skip agent judgement. |
| `trusted_venues` | list[str] | Venue names that clear the inclusion bar on their own. |
| `top_labs` | list[str] | Organisations whose work clears the bar on its own. |
| `exclude_title_keywords` | list[str] | Case-insensitive title substrings that reject a candidate outright (e.g. `retracted`). |

Only `http` and `https` URLs are fetched; `agent/fetch.py:get()` raises
`ValueError` on anything else *before* any I/O, and the fuzzer asserts that on
seven schemes every CI run. Responses are capped at `MAX_RESPONSE_BYTES`
(8 MiB) and a feed declaring a DTD or entity is refused unparsed.

---

## 4. Output: `docs/data/*.json`

All files are UTF-8 JSON objects. Those carrying a `schema` integer will bump
it on a breaking field change; `updated` is an ISO date.

### `papers.json` — the inventory
`{schema: 2, updated, count, note, papers: [...]}`

| Field | Type | Notes |
|---|---|---|
| `id` | str | Stable. `arxiv:NNNN.NNNNN`, `web:slug`, `doi:…`. The key everything else references. |
| `title`, `short` | str | `short` is the label used in graphs. |
| `url`, `pdf` | str | `pdf` may be `""`. |
| `date` | str | ISO date of publication. |
| `authors`, `organisations` | list[str] | |
| `venue`, `venue_source` | str | `venue_source` records *how* the venue was established (`semantic-scholar`, `publisher`, …) so an unverified venue is visible as such. |
| `kind` | str | `paper`, `incident`, `report`, … |
| `trust` | obj | `{tier, justification, gate_reason}` — why this cleared the inclusion bar. |
| `primary_category` | str | A leaf `id` from `taxonomy.json`. |
| `categories` | list[str] | Leaf ids. **Must all exist** in the taxonomy. |
| `methods`, `threat_model`, `contribution_type` | — | What the work does, and to whom. |
| `addresses_needs` | list[str] | Need ids from `companies.json`. **Must exist.** |
| `overlaps_with` | list | Declared overlaps; `derived.json.pairs` is the computed superset. |
| `gap_signal` | — | Which gap this bears on. |
| `confidence` | str | The classifier's own confidence. |
| `abstract`, `what_its_about` | str | `what_its_about` is the plain-language line the UI shows. |
| `added`, `classified_by`, `curation` | — | Provenance: when, by which model, and whether a human curated it. |
| `notes` | str | Includes any recorded prompt-injection attempt found in the source text. |
| `validation_warnings` | list | Anything dropped during validation — e.g. an invented category id. |

### `taxonomy.json` — the research tree
`{schema, updated, note, nodes: [{id, parent, label, blurb, means, example}]}`

A flat node list, not a nested tree. `parent: null` marks a branch; every other
node is a leaf whose `parent` must resolve. Leaves also carry `means` (what the
category actually is, in plain language) and `example` — both required, and
`tests/test_agent.py` enforces it.

### `companies.json` — demand
`{schema, updated, basis, scale, needs, companies, methodology}`

`needs[]` is `{id, label, blurb, categories}`. `companies[]` is
`{id, label, type, region, cells}` where `cells` maps a need id to
`{score: 0-5, evidence: [...]}`. **`scores are editorial estimates of visible
investment, not measurements`** — `methodology` states that in full and names
six biases the numbers carry. Read it before quoting a cell.

### `gaps.json` — the open questions
`{schema, updated, note, gaps: [...]}`

Each gap is `{id, title, severity, status, categories, needs, papers, chain,
refreshed, confidence, counter, closes_when, blocked_by, falsifier}`. `chain`
is the numbered argument: `[{step, claim, evidence}]`.

**The authored/agent boundary matters here.** `claim`, `status`, `counter`,
`closes_when`, `blocked_by` and `falsifier` are written by a human. The agent
may only *add* an `agent_assessment` object beside them, never edit them. This
is asserted by `agent/selftest.py`.

### `derived.json` — computed, never hand-edited
`{generated, paper_count, pairs, clusters, cooccurrence, coverage,
derived_gaps, tree, thresholds}`

- `pairs[]` — `{a, b, score, shared_categories, shared_methods, note, declared}`, one per measured overlap.
- `clusters[]` — `{id, label, categories, papers, size, mean_score, shared}`.
- `coverage` — per-need research coverage, keyed by need id.
- `thresholds` — the `pair` and `cluster` cutoffs the numbers above used. Changing them changes the graph.

Regenerate with `python3 agent/pipeline.py --derive-only`. CI fails if the
committed file disagrees with its inputs.

### The rest

| File | Shape |
|---|---|
| `frameworks.json` | 7 frameworks; each `{id, name, short, org, version, url, kind, blurb, critique, elements}`, elements `{id, label, cats}`. Scored on the **weakest** mapped category, not the union. |
| `tools.json` | 27 repositories; `{id, name, url, org, role, cats, what, when, note}`. Every URL returned 200 when added. |
| `news.json` | `{…, window_days, count, items}`; items `{id, title, url, date, org, source, tier, summary, relevance, title_source}`. Security-filtered. |
| `runs.json` | `{runs: [...], latest}`. Per run: counts, `errors`, `usage` (`input`/`output`/`cache_read`/`cache_write` tokens) and `proposed_leaves`. The audit trail. |
| `review_queue.json` | `{schema, updated, items}` — classifications held back for a human. |

---

## 5. Stability

`id` fields and the file names above are the contract. Fields are added more
often than removed; a removal or a type change bumps `schema`. The dashboard
reads these files over `fetch()` with no build step, so anything that can read
JSON over HTTPS can consume them directly:

```
https://okhomiak.github.io/ai-security-reserch-inventory/data/papers.json
```
