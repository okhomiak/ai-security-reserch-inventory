# Prior work and search log: detection coverage

Checked 18 Nov 2026.

How each entry was checked: **read** means the page was opened and read or summarised that day; **digest**
means it wasn't opened and the summary comes from a named secondary source; **title** means it appeared in
search results and wasn't opened; **earlier** means it was read on 2 to 4 Nov 2026.

## Closest work

| Work | Date | What it did | What it leaves open | Checked |
|---|---|---|---|---|
| [StealthBench](https://arxiv.org/abs/2607.26314), two independent researchers | 28 Jul 2026 | Scores operational stealth of offensive agents on six dimensions. 11 real incidents expanded into 14 container scenarios. 771 trajectories, 68.4% solved, 43.8% solved safely. Eight agent models. Judged by three language models. Total cost $345.42. Harness and data released. | No EDR, SIEM or WAF. No human labels. Lists EDR baselines, timing discipline, human validation and resistance to evasion as future work. | Read |
| [Trace](https://arxiv.org/abs/2605.01186) | May 2026 | Attributes shell sessions to seven model families from commands alone: 0.981 macro F1 on 2,028 sessions, 84.0% after five commands. Falls to 0.815 on an unseen scaffold. About 78% on 24 sessions from a third-party platform. | No human sessions. No false-positive rate. Honeypot container only. No agents imitating people, no timing tests. | Read through a [review](https://www.themoonlight.io/review/trace-unmasking-ai-attack-agents-through-terminal-behavior-fingerprinting) |
| [Say Shibboleth](https://arxiv.org/abs/2611.12386) | 9 Nov 2026 | Honeypot traps that identify the model (about 90% top-1 over 15) and the harness (92% over four). Behavioural evidence survives when agents are told to hide their identity. | Version 0.1. Attribution inside a honeypot, not detection in production telemetry. | Read (abstract) |
| [CyberArena](https://arxiv.org/abs/2610.19005), Liu et al. | 19 Oct 2026 | Agents attack each other's services and patch their own. 466 games over 40 challenges, 12 entrants, about $8,368 in tokens. | Agent against agent. No human operators, no detection content, no defender cost in human terms. | Read (first 100,000 characters) |
| [Whose Agent Are You?](https://arxiv.org/abs/2606.20910) | Jun 2026 | By its title: multi-layer fingerprinting and attribution of autonomous web agents. | Looks like web traffic, not host intrusion. | Title |
| [FP-Agent](https://arxiv.org/abs/2605.01247) | May 2026 | By its title: fingerprinting AI browsing agents. | Same. | Title |
| [Rouxii](https://arxiv.org/abs/2609.26555) | Sep 2026 | By its title: AI pentesters that recognise and exploit honeypots. | Relevant to the quiet-agent arm. To be read. | Title |
| [CyberClear](https://arxiv.org/abs/2609.32424) | Sep 2026 | By its title: a benchmark for agent systems on attack-chain provenance. | Looks like agents as investigators. To be read. | Title |
| [LLM Agent Honeypot](https://arxiv.org/abs/2410.13919), Palisade Research | Oct 2024 | Catches agent attackers in the wild with injection canaries and response timing. | Detection in a honeypot built for the purpose. | Earlier |
| [Optional Traps](https://arxiv.org/abs/2611.19295) | 14 Nov 2026 | Decoy credentials against attacker agents; a small model ignored every optional decoy. | Deception, not rule coverage. | Read (abstract) |

## Incident and field evidence

| Source | What it reports | Checked |
|---|---|---|
| [Hugging Face timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline) | About 17,600 actions; signals correlated but not escalated; volume named as the core problem | Read |
| [From Reactive Containment to Proactive Assurance](https://arxiv.org/abs/2610.12463) | Port scanning detected on 27 June, evaluation not stopped; detection on 19 July | Read |
| [Transluce: agents targeting government websites](https://transluce.org/us-canada-gov) | Injection attempts, disposable sign-ups and anti-bot evasion attributed to agents | Digest (Adversa, Oct 2026) |
| [Wikimedia Foundation](https://wikimediafoundation.org/news/2026/10/05/openai-rogue-agent-activities-found-on-wikimedia-projects/) | Test edits and exploit attempts attributed to a lab's agents; no compromise found | Digest (Adversa, Nov 2026) |
| [Microsoft on Storm-0940](https://www.microsoft.com/en-us/security/blog/2026/10/21/storm-0940-uses-artex-agentic-ai-connectwise-supply-chain-compromise/) | An agentic system used in a supply chain compromise | In this repo's news feed, not reopened |
| [MITRE ATLAS v2026.09](https://github.com/mitre-atlas/atlas-data/releases/tag/v2026.09) | Eleven new techniques for agent reconnaissance and manipulation, and an AI honeypots mitigation | Digest (Adversa, Oct 2026) |

## Adjacent detection content

| Source | What it is | Checked |
|---|---|---|
| [agent-threat-rules](https://github.com/Agent-Threat-Rule/agent-threat-rules) | Open detection rules for threats to your own agents: injection, tool poisoning, context exfiltration | Title |
| [sigma-ai](https://github.com/agentshield-ai/sigma-ai) | Sigma rules for monitoring AI agents | Title |

Both look at an organisation's own agents. Neither is about recognising an intruding agent in host telemetry.

## Candidates for the human baseline, not verified

These are recalled, not checked on 18 Nov 2026. Confirm each exists, its licence and whether its tasks are
comparable before relying on it.

- Shell-command logs from participants in hands-on cyber-range training, published by a university group.
- Open collections of security event telemetry recorded while known attack techniques were run.
- Benign agent sessions from public terminal benchmarks, for the false-positive side.

## Searches run on 18 Nov 2026

- detecting autonomous AI agent attackers versus human operators in logs telemetry fingerprinting benchmark
  honeypot
- do EDR SIEM Sigma detection rules catch LLM agent driven intrusions evaluation replay agent attack
  trajectories detection coverage
- Trace: Unmasking AI Attack Agents Through Terminal Behavior Fingerprinting results accuracy human vs agent
  sessions evasion

The second query returned work on using language models to write detection rules and none on testing
existing rules against agent intrusions.

## Before starting, search again for

- A second version of StealthBench, or anything citing it that adds EDR or SIEM baselines.
- "agentic intrusion" or "AI operator" with "detection coverage", "Sigma", "EDR" or "alert volume".
- Vendor threat reports that publish detection outcomes for agent-driven campaigns.
- Human red-team datasets with shell or host telemetry on tasks comparable to the benchmark scenarios.

## Read in full before the detailed run

1. StealthBench, including its data licence and trajectory format.
2. Trace, for its feature analysis and the scaffold-shift result.
3. Say Shibboleth, once past version 0.1.
4. The Hugging Face timeline, for what a real defender's stack did and didn't do.
