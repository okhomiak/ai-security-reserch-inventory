# Prior work and search log: threat model as agent input

Checked 18 Nov 2026.

How each entry was checked: **read** means the page was opened and read or summarised that day; **digest**
means it wasn't opened and the summary comes from a named secondary source; **title** means it appeared in
search results and wasn't opened; **earlier** means it was read on 2 to 4 Nov 2026.

## Closest work

| Work | Date | What it did | What it leaves open | Checked |
|---|---|---|---|---|
| [The AI Vulnerability Scanning Market](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/03/CSA_research_note_ai_vulnerability_scanning_market_20260308-csa-styled.pdf), Cloud Security Alliance | 8 Mar 2026 | Describes Codex Security's threat-model-first design and the vendor's figures: false positives down 50%, over-reported severity down 90%, 1.2 million commits scanned, 14 CVEs. | Says the figures are unverified and that nothing isolates the threat model's contribution. | Read |
| [Demystifying Agent Skills for Smart Contract Auditing](https://arxiv.org/abs/2609.29454), Lingnan University and others | 2026 | Collects 83 audit skills and switches them on and off on EVMBench (40 audits, 120 vulnerabilities). One configuration gains 22.8% in detection; a swapped backend loses 5.9% to 9.4%. | Generic skills, not target context. Mostly single runs. No per-skill ablation. No threat model of the target in any condition. | Read |
| [From Requirements to Attack Trees](https://arxiv.org/abs/2610.03820) | Oct 2026 | By its title: grounded agents for design-time security review. | Looks like generating the artefact, not testing its downstream effect. To be read. | Title |
| [ACSE-Eval](https://arxiv.org/abs/2505.11565) | May 2025 | A dataset for scoring threat models of cloud architectures. | Scores the threat model itself. | Earlier |
| [ASTRIDE](https://arxiv.org/abs/2512.04785) | Dec 2025 | Threat modelling for agentic systems. | Scores the threat model itself. | Earlier |
| [Re-Evaluating EVMBench](https://arxiv.org/abs/2603.10795) | Mar 2026 | By its title: a second look at whether agents are ready for smart-contract security. | Read for benchmark weaknesses before using it. | Title |
| [Alibi](https://arxiv.org/abs/2607.24964) | Jul 2026 | By its title: adaptive attacks on model-based vulnerability detectors through code comments. | A confound: comments in a target can steer the scanner. Strip or control them. | Title |

## Benchmarks and methods to reuse

| Work | Why it matters here | Checked |
|---|---|---|
| [HoF-Bench](https://arxiv.org/abs/2607.27030) | 95 AI-found CVEs pinned at the vulnerable commit, scored by a judge blind to the detector. The blind judge is the scoring method this study needs. | Earlier |
| [CyberGym](https://arxiv.org/abs/2506.02548) | 1,507 real vulnerabilities where success means a proof of concept reproduces the crash. Executable ground truth. | Earlier |
| [Agentic Benchmark Checklist](https://arxiv.org/abs/2507.02825) | An empty-response agent scored 38% on one popular benchmark. Run the checklist on the scoring before trusting it. | Earlier |
| [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640) | Paired and clustered statistics for evaluations. | Earlier |

## Demand evidence

| Source | What it says | Checked |
|---|---|---|
| [Anthropic disclosure timelines](https://www.anthropic.com/research/coordinated-vulnerability-disclosure-timelines) | 30 days for high and critical findings from 1 Jan 2027, because rediscovery is now likely | Read |
| [ISC on vulnerability reports](https://victor.isc.org/blogs/2026-04-16-How-to-report-a-vulnerability/) | 150 reports in three months, 134 dismissed | Earlier |
| [Jane Street threat-modelling role](https://resumegeni.com/jobs/cybersecurity-engineer-threat-modelling-janestreet-fab65ab964) | Practical threat models turned into architectural fixes | Earlier |
| [AI Security Priorities: A Field-Wide Agenda](https://arxiv.org/abs/2607.26069) | Lists threat modelling of AI attacking its host infrastructure among 18 priorities | Read (first 100,000 characters) |

## Searches run on 18 Nov 2026

- does a threat model improve LLM agent vulnerability detection ablation architecture context security review
  benchmark
- "threat model" input improves AI vulnerability discovery agent precision false positives ablation study
  Codex Security Claude security review repository context
- LLM vulnerability detection "threat model" OR "attack surface" OR "security context" provided as input
  ablation improves precision repository-level agentic auditing smart contract invariants EVMbench
- Codex Security builds editable threat model of repository first then validates findings in sandbox

None returned an ablation of target-specific threat models. The third returned the skills study above.

## Before starting, search again for

- Any OpenAI or Anthropic post that breaks down what each stage of their scanners contributes.
- "ablation" with "threat model", "architecture context" or "security context" and "vulnerability detection"
  on arXiv from November 2026 onward.
- Follow-ups to the skills study that add per-skill or per-target conditions.
- Audit-firm write-ups on giving AI auditors protocol invariants.

## Read in full before the detailed run

1. The skills study, for its design and its warning about single runs.
2. HoF-Bench, for the blinded judge and the target list.
3. OpenAI's own description of the threat-model step, from the primary source.
4. The Agentic Benchmark Checklist, applied to whichever benchmark is chosen.
