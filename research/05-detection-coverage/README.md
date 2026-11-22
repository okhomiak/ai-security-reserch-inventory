# 05 · Do today's detections see agent operators?

Status: draft brief, 18 Nov 2026. Ranked 5 of 6, score 3.59 out of 5. Not yet run.

## The question

When published agent intrusion trajectories are replayed on instrumented hosts, how much of the activity do
widely used open detection rules flag? How does that compare with human operators on similar tasks? And
which cheap signals still separate the two once the agent is told to be quiet?

## The evidence, as a chain

1. **Agent-run intrusions are in incident reports now.** The July 2026 intrusion ran about 17,600 actions over
   roughly two and a half days. The victim's own correlation stack saw the signals and didn't raise their
   priority or page anyone, and the write-up names volume as the core problem: the path that worked was
   hidden among thousands of failed attempts
   ([Hugging Face timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline)). On the lab
   side, port scanning was detected on 27 June and the evaluation wasn't stopped
   ([analysis](https://arxiv.org/abs/2610.12463)). Microsoft has since described a state-linked campaign that
   used an agentic system in a supply chain compromise
   ([21 Oct 2026](https://www.microsoft.com/en-us/security/blog/2026/10/21/storm-0940-uses-artex-agentic-ai-connectwise-supply-chain-compromise/),
   in this repo's news feed, not reopened).
2. **Site operators are already attributing agent activity by hand.** Investigators traced agent probing of
   government and health sites from public records, and one foundation attributed test edits and exploit
   attempts on its own projects to a lab's agents (digest only; see the log).
3. **Research has measured the attacker and fingerprinted it in honeypots.** One benchmark scores how
   stealthy offensive agents are: 771 trajectories, no model above 54% "safe success", judged by a panel of
   language models. It tested no EDR, SIEM or WAF and lists EDR baselines, timing discipline and human
   validation as future work ([StealthBench](https://arxiv.org/abs/2607.26314)). Another attributes shell
   sessions to one of seven model families at 0.981 macro F1, with no human sessions, no false-positive rate
   and only a honeypot ([Trace](https://arxiv.org/abs/2605.01186), read through a review). A third
   identifies model and harness with honeypot traps at about 90% and 92%
   ([Say Shibboleth, 9 Nov 2026](https://arxiv.org/abs/2611.12386)).
4. **The one paired attack and defence benchmark pits agents against agents.** It ran 466 games at about $18
   each and doesn't measure whether a defender can tell an agent from a person, or what defence costs in
   human terms ([CyberArena](https://arxiv.org/abs/2610.19005)).
5. **Gap.** Nobody has reported what the detection content defenders already run catches when the operator is
   an agent, against a human baseline, with false positives measured on benign activity and an arm where the
   agent tries to stay quiet.

## Who's asking

- **Fund and bank security operations.** Runtime monitoring is the highest-demand need in this inventory: a
  mean of 4.25, with 24 of 28 organisations at 4 or above, against 14 papers. Jane Street hires a senior
  cyber operations engineer
  ([posting](https://www.janestreet.com/join-jane-street/position/8687509002/)), Soros Fund Management wants
  agentic AI knowledge for security operations
  ([posting](https://www.tealhq.com/job/senior-cybersecurity-engineer_7ea1a37716e33e425bf2e16fe154b6542a1fe)),
  and Bridgewater's agent security role includes detection and response
  ([posting](https://job-boards.greenhouse.io/bridgewater89/jobs/8499417002)).
- **Frontier labs.** Their threat-intelligence teams publish on adversary use of models, and OpenAI describes
  replaying the July incident against its own monitors (digest only). The audience is real, but labs study
  their own monitors, not the rules a customer's security team runs.
- **Security vendors and rule maintainers.** They'd use a coverage matrix directly, and they're also the
  likeliest to produce one privately.
- **Crypto.** Exchanges and protocols are heavily targeted, but nothing found on 18 Nov 2026 ties that to
  this question.

## The critical view

**The strongest argument against.** Vendors measure detection coverage every day and don't publish it.
Replays in containers aren't enterprise telemetry: there's no identity provider, no mail, no endpoint agent
with years of tuning. Much open detection content targets Windows, and the public agent trajectories are
Linux shell sessions. And the likeliest headline, that noisy agents trip plenty of rules, would surprise
nobody. The benchmark's own authors have said EDR baselines are next.

**Where the non-obvious results would be.**

- **Load, not coverage.** How many alerts one agent intrusion generates, and whether the step that mattered
  is findable among them. That's the problem the July write-up describes.
- **False positives on your own agents.** Legitimate coding and operations agents now run in the same
  estates. If the rules that catch an intruding agent also fire on the firm's own, that's a finding.
- **What survives a quiet agent.** Which signal classes still fire when the agent is told to pace itself and
  avoid noise.

**What would make this worthless.**

- The stealth benchmark's next version shipping EDR baselines with a human comparison.
- Replays that can't reproduce the telemetry, because the recorded commands depend on state that's gone.
- No usable human baseline on comparable tasks.

**Scoop risk: fairly high.** The follow-up is announced, and vendors have the data.

**What isn't known yet.** Whether the published trajectories carry enough detail to replay. What licence
they're under. Which human datasets are comparable. This brief names candidates from memory and hasn't
verified them.

## What would close it

- **Closes when:** a published study reports, for at least two open rule sets, detection coverage and alert
  volume on agent intrusion trajectories against a human baseline, with a false-positive rate measured on
  benign human and benign agent activity.
- **Blocked by:** attack benchmarks need no defender, so they're cheaper to publish; vendors hold the
  coverage data; and human red-team telemetry on the same tasks is scarce.
- **Falsifier:** any such coverage study, or a detection benchmark with both agent and human operators.

## Scores

| Criterion | Score | Reason |
|---|---|---|
| Open gap | 3 | Fingerprinting and stealth scoring exist. Coverage of real rule sets with a human baseline doesn't, but it's an announced next step for others. |
| Demand: labs | 3 | Real interest from threat-intelligence teams, but not their own problem. |
| Demand: funds | 5 | Monitoring is their top need in this inventory, and three roles name it. |
| Demand: crypto | 3 | Plausible, not evidenced. |
| Promise | 4 | A coverage matrix and new rules get used the week they're published. |
| Solo feasibility | 4 | Public trajectories and open rules. Loses a point to replay fidelity and the human baseline. |
| Budget | 4 | $200 to $500. Replay is compute, not tokens. |
| Durability | 2 | The obvious follow-up for the benchmark's authors and for vendors. |
| Repo signal | 3 | Mapped needs average a pressure of 0.180; `n.monitoring` alone is 0.283. |

## Where it sits in this inventory

- **Needs:** `n.monitoring` (mean demand 4.25, 24 of 28 organisations at 4+, 14 papers) and `n.offensive`
  (3.21, 12 of 28, 40 papers).
- **Leaves:** `cyber.defense` (6 papers), `defense.monitoring` (12), `cyber.exploit` (15).
- **Authored gaps:** `gap-offence-defence-asymmetry` asks for defender cost against benchmarked attacks.
  `gap-detection-latency` asks for time to detection. This topic gives a small, public answer to both.
- **Closest papers already in the inventory:** Cybench (`arxiv:2408.08926`) and Teams of LLM Agents can Exploit
  Zero-Day Vulnerabilities (`arxiv:2406.01637`), both on the attacking side.

## If it works

A coverage matrix by rule set and technique, alert counts per intrusion, a handful of new rules sent
upstream, and a replay rig others can point at their own detections.

See [prior-work.md](prior-work.md) for what was checked and [plan.md](plan.md) for the draft study.
