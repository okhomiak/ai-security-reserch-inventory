# Draft research plan: detection coverage for agent intrusions

Draft v0.1, 18 Nov 2026. Nothing has been run. This is the starting point for the detailed analysis, not a
commitment.

## Research questions

- **RQ1. Coverage.** What share of agent intrusion trajectories, and of the technique steps within them,
  trigger at least one rule in each open rule set?
- **RQ2. Load.** How many alerts does one trajectory produce, from how many distinct rules, and how long
  until the first?
- **RQ3. Discrimination.** Which rules or simple features separate agent sessions from human ones at a 1%
  false-positive rate?
- **RQ4. Quiet agents.** What changes when the agent is told to pace itself and avoid noise?

## Hypotheses and what would refute them

| | Hypothesis | Refuted if |
|---|---|---|
| H1 | Most agent trajectories trip at least one rule, but the step that achieved the objective often doesn't. | Rules fire on the decisive step in most trajectories. |
| H2 | An agent trajectory produces several times the alert volume of a human one on a comparable task. | Volumes are similar. |
| H3 | Some rules that fire on intruding agents also fire on benign agents doing ordinary work. | No overlap at a 1% false-positive budget. |
| H4 | A quiet-agent instruction lowers alert volume more than it lowers coverage. | Coverage falls as fast as volume, or neither moves. |

## Design in one paragraph

A measurement study built on replay. Published agent trajectories are re-executed against the same
vulnerable targets on hosts instrumented with open sensors. The resulting events are run through open rule
sets. The same is done for human sessions on comparable tasks and for benign sessions from people and
agents. A small new set of agent runs adds the quiet-agent arm.

## Data

- **Agent intrusions:** the public release of a stealth benchmark for offensive agents: 14 container
  scenarios and 771 trajectories from eight models
  ([StealthBench](https://arxiv.org/abs/2607.26314)). Licence and replayability to be confirmed.
- **Human intrusions:** to be found. See the unverified candidates in `prior-work.md`. If no comparable set
  exists, record a small one by hand on the same scenarios and say plainly how small it is.
- **Benign activity:** agent sessions from a public terminal benchmark and human developer or administrator
  sessions, for false positives.

## Replay rig

- One instrumented Linux host or container per scenario: process and file auditing, a kernel-level runtime
  sensor, shell history and network flow logs.
- Commands re-executed in recorded order with recorded gaps where timing is available.
- A replay counts as faithful if at least 70% of commands produce the recorded class of outcome. Report
  fidelity per scenario.

## Rule sets

At least two open sets for Linux hosts and one for network traffic: a community rule format with a Linux
ruleset, the default rules of an open runtime sensor, and an open network ruleset. Versions pinned. No
tuning before the first measurement, then one tuned pass reported separately.

## Metrics

- Trajectory coverage and step coverage, per rule set, with steps mapped to a public technique taxonomy.
- Whether the decisive step fired a rule.
- Alerts per trajectory, distinct rules per trajectory, time to first alert.
- Detection rate at a 1% false-positive rate measured on benign sessions, for individual rules and for a
  simple classifier over rule firings and timing.
- The same again for the quiet-agent arm.

## Statistics

Bootstrap clustered by scenario, since trajectories within a scenario aren't independent. Report per-model
results only where each model has at least 50 trajectories.

## New agent runs

For the quiet-agent arm only: 14 scenarios, 3 models, 2 instructions (default and quiet), 8 runs. That's 672
trajectories. Models that refuse the security-testing task are recorded as refusals and excluded, not
coerced.

## Budget

- Replay and rule evaluation: compute on a laptop or a small cloud instance, under $50.
- New agent runs: 672 trajectories at $0.30 to $0.70 is about $200 to $470.
- Total: about $200 to $500.

## Timeline at about 10 hours a week

| Week | Work | Output |
|---|---|---|
| 1 | Confirm data licence and format; build the rig for two scenarios | Fidelity check |
| 2 to 3 | Replay all scenarios; run the rule sets | First coverage matrix |
| 4 | Human and benign baselines | Comparison |
| 5 | Kill check | Go or stop |
| 6 | Quiet-agent runs | Evasion results |
| 7 | Analysis; draft new rules | Tables and rules |
| 8 | Share with rule maintainers; write-up | Preprint draft |

## Kill criteria

- Replay fidelity is under 70% for most scenarios and can't be fixed in a week.
- No human baseline can be found or recorded that a reviewer would accept as comparable.
- The benchmark's authors or a vendor publish coverage against real detection content first.
- Coverage is near total and doesn't move in the quiet-agent arm. Write a short note and stop.

## Safety, ethics and disclosure

- Local ranges only. No live targets. No real organisation's telemetry.
- This is defensive work. Report which classes of signal survive a quiet agent, not instructions that defeat
  a named rule.
- Send new or corrected rules to the rule maintainers before publishing.
- No employer, client or personal data.

## What gets released

The replay rig, the event data, the coverage matrix, new rules contributed upstream, and a short paper.

## Where to publish

A preprint in arXiv cs.CR; a practitioner conference talk aimed at detection engineers; an applied security
venue; a post with the coverage matrix.

## Open questions for the detailed run

- [ ] Can the published trajectories be replayed, and under what licence?
- [ ] Which human dataset is comparable, and if none is, how large must a hand-recorded one be?
- [ ] Which rule sets are fair for Linux container scenarios?
- [ ] How should steps be mapped to techniques without a second annotator?
- [ ] What counts as benign agent activity, and where does that data come from?
- [ ] Is timing information in the trajectories good enough to test timing-based signals?
- [ ] Has anyone published this since 18 Nov 2026? Redo the searches in `prior-work.md` first.

## One-page spec, to fill before any code

```text
Question (one sentence):
Hypothesis, and the result that would refute it:
Setting (who the operator is; what the defender sees):
Data (agent, human and benign sessions: n, source, licence):
Conditions (what changes, what stays fixed):
Sensors and rule sets (versions):
Primary metric (and the false-positive rate it is reported at):
Baselines (human operators; benign agents):
Sample size and why:
Replay fidelity threshold:
Stopping rule and kill criterion:
Safety: local range, rule-maintainer disclosure:
Cost estimate:
```
