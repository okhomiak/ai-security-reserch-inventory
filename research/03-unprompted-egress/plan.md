# Draft research plan: unprompted egress

Draft v0.1, 18 Nov 2026. Nothing has been run. This is the starting point for the detailed analysis, not a
commitment.

## Research questions

- **RQ1.** During routine work on a private repository, which third parties receive anything from a coding
  agent's machine?
- **RQ2.** How often do planted markers (identifiers, code, fake secrets, internal names) appear in what's
  sent to them?
- **RQ3.** Which settings change that: privacy modes, tool permissions, offline documentation, a local
  proxy?
- **RQ4.** For tools that run on the provider's side, do planted marker links get fetched, and from where?

## Hypotheses and what would refute them

| | Hypothesis | Refuted if |
|---|---|---|
| H1 | In default settings, most agents send workspace-derived content to at least one party that isn't the model provider on a meaningful share of tasks. | Under 2% of tasks show any third-party marker hit, for every agent. |
| H2 | The commonest third-party channels are web search or fetch, and package lookups that reveal internal names. | Another channel dominates, or none does. |
| H3 | Hardened settings cut third-party hits by most but not all, and the residue is undocumented. | Hardened settings reach zero, or every residual flow is documented. |
| H4 | Document-based privacy scores don't predict measured flows. | Rank order by scorecard matches rank order by measured hits. |

## Design in one paragraph

A field measurement on own equipment. Several coding agents each do the same routine tasks on synthetic
private repositories that are seeded with unique markers. All traffic from the machine is captured and
decoded. Destinations are classified. Marker hits are counted per destination class, per agent and per
setting.

## Setting

No attacker, no injection, no hijack. The agent is used as its documentation suggests. This is deliberate:
it measures the baseline that every adversarial study sits on top of.

## The marked repositories

Three synthetic repositories, written for the study: a Python service, a TypeScript application and a
research-style numerical codebase. Each carries markers that exist nowhere else:

- unique identifiers and comment strings;
- invented internal package names and internal hostnames;
- fake secrets in the usual files, in realistic formats and never valid;
- marker links that point at a listener the researcher controls.

A generator script produces fresh markers per run so a hit can be traced to one session.

## Agents and settings

Six to eight agents, covering terminal agents, editor agents and at least one open-source client. Each in two
settings: as installed, and hardened using only options the vendor documents. Versions and dates recorded.

## Tasks

Thirty to forty routine tasks, the same for every agent: fix a failing test, upgrade a dependency, add a
small feature that needs unfamiliar library documentation, debug an obscure build error, write tests, explain
a module, add a new dependency. Nothing in a task tells the agent to use the network.

## Capture and classification

- A virtual machine per agent with a capturing proxy and a study certificate authority; DNS queries logged.
- If a client pins certificates and can't be observed without circumventing it, record "not observable" and
  move on. Don't defeat the pinning.
- Destination classes: model provider; the agent vendor's telemetry; package registries; search, fetch and
  documentation services; connectors; everything else.
- Marker matching on decoded bodies, URLs, headers and DNS names, including common encodings.
- The listener records any fetch of a marker link, with source address and time, to catch server-side tools.

## Metrics

- Share of tasks with at least one third-party marker hit, per agent and setting. Primary metric.
- Hits by marker type and by destination class.
- Bytes sent per destination class.
- Marker-link fetches seen at the listener, and whether they came from the user's machine or a provider's
  address range.
- Agreement between measured rank and the document-based scorecard.

## Baselines

- The same tasks with all network tools switched off, to confirm the capture is clean.
- A scripted client that sends a known marker to a known host, to confirm the matcher finds it.

## Sample size

6 agents, 30 tasks, 2 settings, 2 runs is 720 sessions. With 60 sessions per agent and setting, a 10% rate is
estimated to within about 8 points. Pool across agents for channel-level claims.

## Budget

- Model usage for 720 short sessions at $0.30 to $1.00: about $220 to $720.
- Subscriptions where a product needs one, for one or two months: about $80 to $180.
- Total: about $300 to $900.

## Timeline at about 10 hours a week

| Week | Work | Output |
|---|---|---|
| 1 | Capture rig; marker generator; one repository | Working harness |
| 2 | Pilot with two agents on ten tasks | First flows |
| 3 | Kill check; remaining repositories and tasks | Go or stop |
| 4 to 5 | Full capture, both settings | Raw captures |
| 6 | Classification, matching, analysis | Tables |
| 7 | Vendor review of findings; write-up | Preprint draft |

## Kill criteria

- The pilot shows no third-party flows beyond package downloads for both pilot agents in default settings.
  Narrow to the name-disclosure and server-side fetch questions, or stop.
- More than half the chosen agents can't be observed without circumventing pinning.
- A cross-product traffic study is published first. Replicate on newer versions or stop.

## Safety, ethics and disclosure

- Own machines, own accounts, own traffic. Synthetic code. No real secrets and no real internal names.
- No employer, client or personal data. Nothing from a real private repository.
- Read each product's terms before capturing. Don't circumvent technical protections.
- Share each vendor's findings with that vendor before publication, with versions and reproduction steps.
- Report documented flows as documented. The finding is the gap between documentation and measurement.

## What gets released

The capture harness, the marker generator, the task list, per-product result tables with versions and dates,
and a short paper. The tables are meant to be rerun on new releases.

## Where to publish

A preprint in arXiv cs.CR; a privacy or internet-measurement venue; a plain-language summary for security
and risk teams.

## Open questions for the detailed run

- [ ] Which agents can be observed within their terms, and which pin certificates?
- [ ] How are server-side tools measured when the query never crosses the local wire?
- [ ] Do agents treat a marker in a comment differently from one in live code?
- [ ] Is a looked-up internal package name a disclosure worth counting on its own?
- [ ] What's the right unit: tasks with a hit, or bytes of marked content?
- [ ] How many runs per task are needed, given how much agents vary between runs?
- [ ] Has anyone published this since 18 Nov 2026? Redo the searches in `prior-work.md` first.

## One-page spec, to fill before any code

```text
Question (one sentence):
Hypothesis, and the result that would refute it:
Setting (no attacker; products, versions, settings):
Environment and tasks (n, source, held-out split):
Conditions (what changes, what stays fixed):
Capture method and what it cannot see:
Primary metric (and how a marker hit is defined):
Baselines (network off, known-marker client):
Sample size and why:
Runs per task:
Stopping rule and kill criterion:
Safety: terms of service, vendor review, disclosure plan:
Cost estimate:
```
