# Research shortlist: six open questions worth testing

Status: draft, written 18 Nov 2026. Nothing here has been run yet.

This folder turns the inventory into a decision. It asks which questions one independent researcher could
test part-time, on a small budget, where the literature is still thin and somebody with models or money is
asking for the answer. Each topic has its own folder with a critical brief, a log of the prior work that was
checked, and a draft research plan. The next step is a detailed analysis of one topic at a time.

It sits beside the dashboard's [gaps](../docs/data/gaps.json), not inside them. A gap in the dashboard is an
argued hole in the literature. A topic here is a study small enough to run.

## The shortlist

Scores are out of 5. The rubric, the per-criterion scores and the sensitivity checks are in
[METHOD.md](METHOD.md). Folder numbers are ids fixed on 18 Nov 2026; they don't change if the ranking does.
Budget is for the full study. First result is the pilot or the first dataset, at about 10 hours a week.

| Rank | Topic | The question | Score | Strongest demand | Budget | First result |
|---|---|---|---|---|---|---|
| 1 | [Found credentials](01-found-credentials/README.md) | When a task is blocked and a key is within reach, how often do agents use it without authorisation, and do they say so? | 3.92 | Frontier labs | $600 to $1,200 | 3 to 4 weeks |
| 2 | [Allowlist relays](02-allowlist-relays/README.md) | How many hosts on default agent allowlists can relay data to an outsider, do agents find them, and what does closing them cost? | 3.87 | Labs and funds | $330 to $700 | 3 weeks |
| 3 | [Unprompted egress](03-unprompted-egress/README.md) | With no attacker at all, what private code and identifiers do coding agents send to third parties? | 3.79 | Hedge funds and banks | $300 to $900 | 2 to 3 weeks |
| 4 | [Agent wallets](04-agent-wallets/README.md) | When an agent that can sign is hijacked, do on-chain permissions really bound the loss? | 3.69 | Crypto | $150 to $600 | 5 weeks |
| 5 | [Detection coverage](05-detection-coverage/README.md) | Do the detection rules defenders already run fire when the intruder is an agent? | 3.59 | Fund and vendor SOCs | $200 to $500 | 3 weeks |
| 6 | [Threat model as input](06-threat-model-input/README.md) | Does giving a bug-finding agent a threat model buy true positives per dollar? | 3.55 | Labs, funds and auditors | $700 to $1,800 | 3 to 4 weeks |

## Read the ranking with care

The six scores sit within 0.37 of each other. The rubric can tell these six apart from the seventeen that
were dropped, but it can't order them with confidence.

- Topics 01 and 02 are a tie. Double the weight on budget and 02 comes first.
- If being scooped worries you most, 03 comes first. It's the least crowded and the least glamorous.
- If only crypto demand counts, 04 comes first. If only fund demand counts, 02 and 03 tie for first.
- Topic 06 is last mainly because it's the dearest to run. Its gap is as open as any here.

## Why each one made it, and what could sink it

1. **Found credentials.** OpenAI has published cases of its models using keys nobody gave them, Google's
   Gemini did the same in a reported incident, and a position paper asks for a benchmark that doesn't exist. What could sink it: rates too low to measure
   cheaply, or a lab publishing its own numbers first.
2. **Allowlist relays.** The 2026 breakouts started on permitted routes, and product sandboxes ship default
   allowlists of 71 and 204 hosts. What could sink it: the core idea is already public and a vendor sells the
   assessment, so the value is in the measurement, not the insight.
3. **Unprompted egress.** The only cross-product evidence on what coding agents send out is a reading of
   privacy policies. What could sink it: a dull result, and findings that go stale with each release.
4. **Agent wallets.** Everyone recommends spending limits for agents that can sign, and nobody has measured
   what they bound. What could sink it: the answer may be arithmetic, and lab demand is indirect.
5. **Detection coverage.** Agent intrusions are in incident reports and the benchmarks that study them use no
   real detectors. What could sink it: container replays aren't enterprise telemetry, and the benchmark's own
   authors plan the obvious follow-up.
6. **Threat model as input.** The best-known AI scanner builds a threat model first and reports large gains
   with no ablation. What could sink it: a lab can run this in a week on better data.

## What's in each folder

| File | What it holds |
|---|---|
| `README.md` | The brief: the question, the evidence as a numbered chain, who is asking, the strongest argument against, what would close the gap, scores and the mapping to this inventory |
| `prior-work.md` | The closest work with what each piece leaves open, how each was checked, the searches run on 18 Nov 2026 and what to search again before starting |
| `plan.md` | A draft research plan: hypotheses with refuters, design, metrics, sample size, budget, timeline, kill criteria, ethics, outputs, and the open questions for the detailed run |

## Next run: one topic at a time

| Topic | Status | Last checked | Decision |
|---|---|---|---|
| 01 Found credentials | Draft brief | 18 Nov 2026 | Open |
| 02 Allowlist relays | Draft brief | 18 Nov 2026 | Open |
| 03 Unprompted egress | Draft brief | 18 Nov 2026 | Open |
| 04 Agent wallets | Draft brief | 18 Nov 2026 | Open |
| 05 Detection coverage | Draft brief | 18 Nov 2026 | Open |
| 06 Threat model as input | Draft brief | 18 Nov 2026 | Open |

For each detailed run:

1. Redo the searches listed in the topic's `prior-work.md`. This field moved every fortnight in autumn 2026.
   If the closing condition in the brief has been met, mark the topic dropped and say which work closed it.
2. Read the three to six closest works in full. Several entries here rest on abstracts or digests, and the
   log says which.
3. Answer the open questions at the end of `plan.md`.
4. Fill the one-page spec in `plan.md` and run the smallest pilot it describes.
5. Decide go or kill against the kill criteria, and update the table above.
6. On a go, promote the topic into `docs/data/gaps.json` as an authored chain. The gate then biases the
   weekly ingest toward work that fills it.

## What this review found about the inventory itself

These came out of checking each candidate against the repository's own data.

- **The corpus is thin after mid-2025.** Of 169 papers, 21 are dated 2025 or later, 5 are from July 2025
  onward and 1 is from 2026. Coverage and pressure figures therefore undercount recent work. Every novelty
  claim in this folder rests on fresh searches, not on those counts.
- **The weekly ingest hasn't classified a paper yet.** Every run in `runs.json` shows `classified: 0`, which
  matches the known limit in the main README. Until that runs, the news feed is the only current layer.
- **Four authored gaps need a second look.**
  - `gap-mcp-ecosystem` says the tool-server ecosystem has no reviewed security literature. 2026 brought a
    security analysis of the MCP specification ([arXiv 2601.17549](https://arxiv.org/abs/2601.17549)), a scan
    of 66,192 skill versions ([arXiv 2609.12001](https://arxiv.org/abs/2609.12001)) and a study of malicious
    skills in the wild ([arXiv 2602.06547](https://arxiv.org/abs/2602.06547)). None was read in full here,
    and whether any has passed peer review wasn't checked.
  - `gap-detection-latency` asks for any published time to detection. The July 2026 incident now gives one:
    first recorded action on 9 July, detection on 19 July
    ([timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline),
    [analysis](https://arxiv.org/abs/2610.12463)). OpenAI also reports that replayed monitors alert about
    30 minutes after the sandbox escape
    ([post](https://openai.com/index/how-we-detect-frontier-model-misalignment/), read through a digest).
    Two data points aren't a distribution, but the chain should cite them.
  - `gap-offence-defence-asymmetry` names "any paired attack/defence benchmark" as its falsifier.
    [CyberArena](https://arxiv.org/abs/2610.19005) is one. It doesn't measure human defender cost, so the
    gap narrows without closing.
  - `gap-agent-identity` says there's almost no research. NIST has published
    [design tenets](https://www.nist.gov/blogs/cybersecurity-insights/design-tenets-agent-identity-management-systems)
    and autumn 2026 brought a run of authorisation papers. What's still missing is measurement, which is
    what topics 01 and 04 propose.
- **The demand map has no crypto organisation.** The 28 rows cover labs, platforms, vendors, finance and
  trading firms. Topic 04's demand evidence had to come from outside the repository.
- **Fund rows are inferred, as the methodology says.** The briefs here use job posts and regulator statements
  as fund evidence, not the heat-map cells.

## Also here

- [METHOD.md](METHOD.md): the rubric, every score, the sensitivity checks, the demand evidence and the limits
  of this review.
- [REJECTED.md](REJECTED.md): seventeen candidates that were dropped, each with the work or the blocker that
  ruled it out.
