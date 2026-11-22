# Critic review: Detection coverage for agent intrusions

Reviewed 22 Nov 2026 by an AI reviewer (Claude) in a fresh session with no access to the author's working notes. Most searches were run on 19 Nov 2026.

## Verdict

**PARK.** The full question is still open. I found no study that tests open rule sets against agent-run intrusions with a human baseline and a measured false-positive rate. The plan as written cannot answer it either. Its agent data is web requests sent from the agent's own container to single Flask apps, so Linux host rules have almost nothing to observe. No fair human baseline exists for those tasks. The fund demand score of 5 rests on inference, and the keenest audience is security vendors, who can do this faster. The brief is honest about its unknowns, and two of its angles (alert load, false positives on a firm's own agents) are worth keeping. A one-week feasibility check on a different data source, described below, could turn this into GO WITH CHANGES.

## Is the gap still open?

"Opened and read" means the page was fetched and queried with a reading tool. It does not mean every line was read.

| Work | Date | What it measured | Overlap with the proposed study | How checked |
|---|---|---|---|---|
| [StealthBench paper](https://arxiv.org/abs/2607.26314) | 28 Jul 2026 | Stealth of offensive agents, judged by three language models. 14 tasks, each one Flask app. 771 trajectories, 8 models. No real detectors, no humans. | Some. Agent side only. | Opened and read ([HTML](https://arxiv.org/html/2607.26314v1)) |
| [StealthBench site](https://stealthbench.com/) | Snapshot 21 Oct 2026 | Now 24 tasks: 14 web and 10 "simulated Windows endpoint" tasks. "2,754 valid trajectories across 17 model versions". Two prompt conditions: baseline, and "a generic, optimized operational prompt". Windows runs are scored with rule IDs and "deterministic severity anchors". The site says "this is not a live Windows EDR test". | Some. A quiet-prompt arm already exists. Rule-based scoring has started. Still no open rule sets, no humans, no false positives. | Opened and read |
| [Elastic Security Labs on the Hugging Face breach](https://www.elastic.co/security-labs/ai-agent-attack-detection-hugging-face-breach) | 31 Jul 2026 | Maps the publicly described stages of the July intrusion to rules Elastic already ships. Uses public reporting and mock data. No execution test, no rates, no human baseline, no false positives. | Some. The same question for one vendor, answered by mapping, not measurement. | Opened and read |
| [Hiding in the AI Traffic](https://arxiv.org/html/2511.15998v1), MIT and Vectra AI | Nov 2025 by arXiv id | An agent-driven operation and a manual operator in a vendor range running commercial network and endpoint detection. One run per method. Says the manual operator raised "multiple alerts" and the agent run drew fewer. No counts, no statistics. | Some. The only agent versus human comparison against production detectors I found. Anecdotal. | Opened and read (first 100,000 characters) |
| [BypassGym](https://arxiv.org/pdf/2611.13684) | Nov 2026 by arXiv id | Agents tested against six commercial endpoint protection products on Windows. 90 main runs. Pass or fail only: "Detection alerts are deliberately excluded from the verdict." No human baseline, no open rule sets, no false positives. | Little to some. A real-product measurement now exists, on Windows and commercial tools. | Opened and read |
| [BTH master's thesis](https://www.diva-portal.org/smash/get/diva2:2080153/FULLTEXT01.pdf) | 2026 | Aims to tell language-model attackers from bots and human attackers in SSH honeypots, using timing, behaviour and honeytokens. | Some, for the discrimination question only. | Summary on a [programme page](https://www.ai.se/en/adoption/talent-programs/master-thesis-program/masters-thesis-program-outcomes). Full text could not be opened. |
| [Whose Agent Are You?](https://arxiv.org/abs/2606.20910) | 18 Jun 2026 | Web agents against 30 human participants and three crawlers, using timing, TLS, HTTP and behaviour. 97.1% accuracy. Benign browsing. No false-positive rate, no evasion arm. | Some, for discrimination at the web layer. | Secondary page ([Emergent Mind](https://www.emergentmind.com/papers/2606.20910)) |
| [Trace](https://arxiv.org/abs/2605.01186) | 2 May 2026 | 2,028 agent shell sessions on one Linux capture-the-flag box. Seven model families, three scaffolds. Asks which model, not agent or human. Includes an adversarial robustness analysis. | Little on the question. Its data type fits host rules better than StealthBench does. | Secondary page ([Emergent Mind](https://www.emergentmind.com/papers/2605.01186)). arXiv was rate limited. |
| [Say Shibboleth](https://arxiv.org/abs/2611.12386) | Nov 2026 | About 800 runs, 15 models, four harnesses against trap services. Attributes model and harness. No human sessions, no rule sets, no alert counts. | Little. | Opened and read ([HTML](https://arxiv.org/html/2611.12386)) |
| [ARTEMIS](https://arxiv.org/abs/2512.09882v1), Stanford, CMU and Gray Swan | Dec 2025, v2 Mar 2026 | Ten professionals and several agents on a live university network of about 8,000 hosts. Rich human telemetry recorded, not released. No detection results. Future work: "integrate defensive tools such as SIEM systems". | Little today. This team is best placed to close the gap. | Opened and read ([alphaXiv text](https://www.alphaxiv.org/abs/2512.09882.md)) |
| Sysdig field reports: [June](https://webflow.sysdig.com/blog/agentic-threat-actor-hits-the-orchestration-plane-ai-agent-driven-container-escape), [July](https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion) | 4 Jun and 1 Jul 2026 | Agent-run intrusions seen in the wild. Qualitative signs of automation. No rules named, no alert counts. | Little. | Opened and read |
| [CSA: Agentic Intrusion Goes Retail](https://labs.cloudsecurityalliance.org/research/csa-research-note-agentic-intrusion-campaigns-hunting-202610/) | 27 Oct 2026 | Hunting guidance drawn from three reported campaigns. No measured coverage. | Little. | Opened and read |
| [The benign true positive](https://www.csoonline.com/article/4248451/the-benign-true-positive-when-trusted-ai-agents-look-like-attackers.html), CSO Online | 16 Nov 2026 | Opinion piece by a vendor chief executive. Says authorised agents trigger correct, attack-like detections. No data. | Little. It frames hypothesis H3 and measures nothing. | Opened and read |
| [ZERO-APT](https://www.alphaxiv.org/abs/2606.05567v1) | 4 Jun 2026 | A language-model pentester against a language-model defender reading Sysmon. No rule sets, no humans. | Little. | Abstract page only |

The "Closes when" condition has not been met. The first half of the falsifier ("any such coverage study") has not been met. The second half ("a detection benchmark with both agent and human operators") is loosely worded: honeypot and web-agent studies already put agents and humans in one detection experiment, though none tests existing rule content against intrusions. The gap is narrowed, not closed.

Two adjacent questions look least crowded. First, alert load: how many alerts one agent run produces and whether the decisive step can be found among them. Second, whether rules that fire on intruding agents also fire on an organisation's own agents. I found an opinion piece on the second and no measurement of either.

## Is the demand real?

**Claim 1: monitoring is the top need, "a mean of 4.25, with 24 of 28 organisations at 4 or above, against 14 papers". Partly confirmed.** The numbers match [derived.json](../../../docs/data/derived.json). The same record shows `evidenced_cells: 1`. Only one of the 28 monitoring cells has a source, and it belongs to a lab. In [companies.json](../../../docs/data/companies.json) every trading firm and hedge fund row is described as inferred from sector. The need is also defined broadly: "Abuse detection, incident response, online anomaly detection". This is an editorial estimate of interest in monitoring, not stated demand for this study.

**Claim 2: three fund roles name it. Partly confirmed.** The roles exist. None is about this question.

- [Soros Fund Management](https://www.tealhq.com/job/senior-cybersecurity-engineer_7ea1a37716e33e425bf2e16fe154b6542a1fe) asks for "Familiarity with agentic AI systems" to "enhance threat detection, response, and security operations". That is using agents in security operations. It does not mention attackers who use agents.
- [Bridgewater](https://job-boards.greenhouse.io/bridgewater89/jobs/8499417002) wants "autonomous agents for threat detection, alert triage, vulnerability management, and incident response" and "monitoring, kill switches, escalation triggers, and anomaly detection for AI agents in production". That is agents doing detection, and monitoring of the firm's own agents.
- [Jane Street](https://www.janestreet.com/join-jane-street/position/8687509002/): could not open.

**Claim 3: the July 2026 incident shows defenders saw agent activity and did not act. Confirmed.** The [Hugging Face timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline) reports "~17,600 attacker actions", says its stack "failed to correctly raise the alert's criticality and trigger the on-call team", and says "Volume is what changes the defensive problem." This is the strongest evidence in the brief. It supports the alert load question more than the rule coverage question. The post names no detection rule. Its signals came from platform logs, a database audit log, network flow logs and "an AI-based security agent stack".

**By audience.**

- **Labs: weak, inferred.** A [digest](https://hyper.ai/en/stories/eff36dafb7250ff9afef1dbe454bf0a7) of OpenAI's [monitoring post](https://openai.com/index/how-we-detect-frontier-model-misalignment/) describes model-side monitors: activation probes and reviewers of reasoning and tool use, with a telemetry cross-check. I found no lab asking for coverage of third-party rule sets. The brief says this itself.
- **Funds: moderate at best, inferred.** Any security operations team would read the result. I found no fund role, product or incident on exactly this.
- **Crypto: not evidenced.** One search returned two leads I could not open: a report that [Coinbase warned about AI attacks](https://aiweekly.co/alerts/coinbase-warns-ai-attacks-now-outrun-enterprise-defenses) and a [CSA note](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/11/CSA_research_note_agentic_intrusions_chainalysis_20261104-csa-styled.pdf) dated 4 Nov 2026. Titles only.
- **Vendors and rule maintainers: strong and stated.** Elastic, Sysdig, Vectra and the Cloud Security Alliance all publish on agent-run intrusions. They are not one of the three target audiences, and they are the likeliest to run this study themselves.

## Will the plan work?

**The data does not fit the sensors.** This is the main problem. In StealthBench each task is "a self-contained Docker environment" with one Flask app and a shared agent container holding Python, curl, jq and dnsutils. The agent's commands run in its own container. The target is reached over HTTP at `app:5000`. The paper describes no shell on a target, no second host and no lateral movement. The plan's sensors are "process and file auditing, a kernel-level runtime sensor, shell history and network flow logs", with "at least two open sets for Linux hosts". On these targets a host sensor sees a web server answering requests. Linux host rules would report near-zero coverage for a trivial reason. The fair rule sets here are web and network ones. Most tasks are authorisation logic flaws, which signature rules are not built to see, so "the decisive step often does not fire a rule" is close to known in advance.

**Replay loses what matters.** The release is usable in form: code under MIT on [GitHub](https://github.com/GangGreenTemperTatum/stealthbench), data under CC BY 4.0 on [Hugging Face](https://huggingface.co/datasets/0xmoose/stealthbench), two JSONL files, 771 evaluated rows and 150 excluded rows, 277 MB. Access is gated: a login and acceptance of conditions. The paper says each action records "tool name, sanitised arguments and output, wall-clock timestamp, and token counts", so timing exists. I could not inspect the files. Three things threaten command replay:

- **State.** Recorded commands carry session tokens, one-time codes and identifiers from the original run. After the first mismatch, later requests fail. That inflates error counts and so alert counts.
- **Sanitised arguments.** Redacted values cannot be replayed exactly.
- **Adaptivity.** The agent reacted to outputs. A replay that diverges is no longer the same attack.

The 70% fidelity threshold is arbitrary and does not check whether the decisive step replayed. Prior art exists for log replay, which re-ingests recorded telemetry: Splunk's [attack_data](https://github.com/splunk/attack_data) ships `bin/replay.py` and a [replay tool](https://www.splunk.com/en_us/blog/security/total-replay-splunk-attack-data-testing.html). That works because the telemetry was recorded. StealthBench recorded none. Live reruns with sensors attached avoid the problem. The paper's whole run cost $345.42, so "replay is compute, not tokens" saves little.

**No fair human baseline exists for these tasks.** Candidates I could verify:

| Dataset | Licence | Size | Comparable? |
|---|---|---|---|
| [Shell commands from cybersecurity training](https://zenodo.org/record/6670113), Masaryk University ([paper record](https://dev.nlk.cz/mdv/doc/pmid34621929?lang=en)) | CC BY 4.0 | 21,762 command records from 275 trainees in version 3. The paper reports 13,446 from 175 participants in 27 sessions. | Partly. Commands with timestamps from Bash, ZSH and Metasploit shells. No host or network telemetry. Trainees on guided tasks, not professionals. Not web app tasks. Usable only if agents run on the same training games. |
| [Training behaviour for process mining](https://zenodo.org/records/10298187), Masaryk University | CC BY 4.0 | 100 trainees on one exercise. Command histories and training events. | Same limits. |
| PWNJUTSU ([IEEE DataPort](https://ieee-dataport.org/documents/pwnjutsu-dataset), [COMIDDS entry](https://fkie-cad.github.io/COMIDDS/content/datasets/pwnjutsu), [paper](https://doi.org/10.1109/TNSM.2022.3183476)) | CC BY 4.0 on IEEE DataPort, which shows "Subscription Required". | 22 red teamers, one instance each of a three-machine network. Host logs, packet captures and Zeek output. About 81 GB packed. Unlabelled. | The best candidate. Real telemetry from individual operators, described by COMIDDS as red team professionals. Comparable only if agents run on a rebuilt copy of that network. I did not check whether the build is published. |
| CPTC competition data ([description](https://hurricanelabs.com/blog/cptc-review-part-4-the-data/)) | Not stated | "more than 9TB of raw data" for 2019, as Splunk buckets | No. Too large for this budget. Student teams. Public release not confirmed: the 2019 post calls it planned, and the [CPTC Hugging Face page](https://huggingface.co/globalcptc) lists no datasets. |
| Splunk [attack_data](https://github.com/splunk/attack_data) | Apache-2.0 | Technique-level log files | No. Mostly scripted technique runs, Windows sources. Not free-form human sessions. |

A hand-recorded set by one person is one operator. Operator variance cannot be estimated, so H2 cannot be tested. That person will also have read the agent trajectories first.

**The benign baseline has the same problem.** A false-positive rate has to come from benign activity in the environment where the rules run. Benign agent sessions from another benchmark produce another environment's telemetry. The 14 Flask apps have no real users, so benign traffic would have to be invented by the researcher.

**Power.** The plan clusters by scenario, which is right. It leaves 14 clusters.

- Overall coverage. If scenario-level coverage is spread widely, say a standard deviation of 0.35 to 0.5, the standard error is 0.09 to 0.13. With 13 degrees of freedom the 95% interval is about plus or minus 20 to 29 points. A bootstrap over 14 clusters is unstable and tends to be too narrow.
- Per model. Published per-model counts are 69 to 119. Ignoring clustering, the interval at 50% is plus or minus 12 points for 69 and 9 points for 119. With clustering it is wider. Most model comparisons will be inconclusive.
- Quiet arm. 672 runs is 336 per instruction and 8 per cell. One cell gives plus or minus 35 points. Pooled and independent, 336 per arm detects a gap of about 11 points at 80% power (50% against 39% needs about 316 per arm). The runs are not independent. With 24 runs per scenario per arm and an assumed within-scenario correlation of 0.3, the design effect is 7.9, the effective sample is about 43 per arm, and the detectable gap is about 30 points. Pairing by scenario helps, but 14 pairs only detect an effect of about 0.8 standard deviations.
- "At a 1% false-positive rate." Zero false positives in n benign sessions gives a 95% upper bound of 3/n. Claiming 1% needs 300 independent benign sessions with none. Estimating 1% to within half a point needs about 1,520. One false positive in 100 sessions is consistent with anything from 0.03% to 5.4%.
- Step labelling. The paper's source set has 399 tool calls in 11 trajectories, about 36 each. At that rate 771 trajectories is roughly 28,000 steps to map to techniques, by one annotator with no agreement check.

**Budget.** The arithmetic is right: 672 runs at $0.30 to $0.70 is $202 to $470. The paper's agent cost works out at about $0.37 per trajectory ($345.42 less $62.30 for judges, over 771), so the range holds for a similar model mix. That mix was mostly low-cost models. An [aggregator dated 10 Nov 2026](https://www.morphllm.com/llm-api), not provider pages, lists Claude Opus 4.8 at $5 and $25 per million input and output tokens, GPT-5.6 Sol at $4 and $20, and GLM-5.2 at $1.40 and $4.40. As an illustration with my own assumed token counts, 200,000 input and 10,000 output tokens at the Opus price is $1.25 a run, or $840 for 672. With pilots and reruns, $300 to $1,000 is more realistic. It stays under $2,000.

**Timeline.** Eight weeks is 80 hours. The work is: a rig for 14 scenarios with three sensor types and three rule sets, 771 replays with fidelity scoring, a human baseline, a benign baseline, 672 new runs, labelling, analysis, rule contributions and a paper. My estimate is 150 to 250 hours, so four to six months. Week 4 gives 10 hours to "human and benign baselines" when no dataset has been chosen and the best candidate is 81 GB and needs an environment rebuilt.

**Legal, ethics and terms of service.**

- Provider limits. The paper reports one model that refused the security-testing prompt and another blocked by a content filter on most runs through one route. The site lists two more models as "not ranked" for the same reason. An arm that tells the model to avoid detection is more likely to be refused. The models that comply may not be the frontier ones, so results may not speak for them. I did not check each provider's usage policy.
- Dual use. A per-rule coverage matrix is also a map of blind spots. The plan's handling is reasonable: report classes of signal, and send rules upstream first.
- Human baseline. Recruiting volunteers is research with human participants. That needs consent and review, and the constraints rule out cheap recruitment.
- Data terms. Released event data would embed the benchmark's commands. That needs attribution under CC BY 4.0. The dataset card also says "This dataset should not appear in training corpora."
- Rule licences. Not rechecked. Some public rule sets are source-available, not open source. Check before republishing results rule by rule.

**Skills.** The rule pipeline work fits a detection engineer well. The gaps are statistics for clustered data and reliable step labelling. No smart-contract or machine-learning research skill is needed.

**What is sound.** The kill criteria are the right ones. The brief names its own strongest counter-argument. The plan refuses to coerce models that decline. The budget is small. The score arithmetic checks out (3.59), and so do the StealthBench figures quoted from the paper.

**The single most likely failure.** No acceptable human baseline, on tasks where host rules have nothing to see. The plan's second kill criterion then fires at week 4 or 5, after 40 to 50 hours. What remains is a web rule coverage table on 14 small apps. The benchmark's authors can produce that faster, and it tells defenders what they already know.

## Errors and overstatements in the brief

1. **"the public agent trajectories are Linux shell sessions"** (README). Misleading. The shell is the agent's own container. Each target is one Flask app reached over HTTP. Evidence: the [paper](https://arxiv.org/html/2607.26314v1) and the [repository](https://github.com/GangGreenTemperTatum/stealthbench), which describes "14 dockerised Flask apps". The plan's sensor and rule choices depend on this.
2. **"published agent intrusion trajectories"** (README, plan) and **"11 real incidents expanded into 14 container scenarios"** (prior-work). Overstated. The source set is 11 trajectories from bug-bounty programmes, which the abstract calls "11 hand-verified OPSEC incidents". These are operational slips during bug-bounty work, not intrusions.
3. **StealthBench described as 771 trajectories and eight models, with EDR baselines "next"** (README, prior-work). Stale on 18 Nov. The [site](https://stealthbench.com/) snapshot of 21 Oct 2026 shows 24 tasks, 2,754 valid trajectories, 17 model versions, an optimised prompt condition and a rule-scored Windows track.
4. **"Demand: funds 5. Monitoring is their top need in this inventory, and three roles name it."** Overstated. The fund rows are inferred, and the two roles I opened are about using agents in security operations and monitoring the firm's own agents. [METHOD.md](../../METHOD.md) reserves a 5 for "incidents, products or roles on exactly this".
5. **"Nobody has reported what the detection content defenders already run catches when the operator is an agent"** (README, with its qualifiers). True only as the full conjunction. Parts exist that the log does not list: the Elastic mapping, the MIT and Vectra comparison, BypassGym, and the ARTEMIS plan to add SIEM tooling. The topic's log shows three queries.
6. **"about 17,600 actions over roughly two and a half days"** (README). The count is right. The duration follows the post's summary line. The post's own timestamps run from 9 July 02:28 UTC to 13 July 14:14 UTC, and its replay section says "the 4.5-day campaign".
7. **The incident used as motivation for rule coverage** (README, chain step 1). The post describes a triage failure in an AI-based correlation stack on cloud platform telemetry. It names no rule. News coverage of the second cited campaign describes sign-ins to Microsoft 365 tenants ([The Hacker News](https://thehackernews.com/2026/10/china-linked-hackers-use-artex-ai.html), search result only). Neither incident resembles Flask apps in containers.
8. **Trace: "No agents imitating people, no timing tests"** (prior-work). Incomplete. A secondary summary reports an adversarial robustness analysis in the paper. Checked through that summary only.
9. **Whose Agent Are You?: "Looks like web traffic, not host intrusion"** (prior-work, by title). Since the chosen agent data is web traffic, this is the closer literature. It includes 30 human participants.
10. **"Solo feasibility 4"** and the eight-week timeline. Optimistic, for the reasons above.

I found no error in the cost, solve-rate or safe-success figures for StealthBench, in the inventory figures, or in the score arithmetic.

## What would make it better

1. **Pick the data to fit the question, starting from the human side.** Spend one week testing whether the PWNJUTSU network can be rebuilt with matching audit settings. If it can, run agents live on the copy and compare with the 22 recorded human runs. Human telemetry then needs no replay. The Masaryk training games are a weaker second option. If neither works, drop the human claim, keep StealthBench, and switch to web and network rule sets.
2. **Run agents live with sensors attached. Do not replay.** The harness is MIT licensed and a full run costs about the same as the planned quiet arm. Use the benchmark's own optimised prompt condition as the quiet arm so results line up with its published numbers. Check first whether the Trace sessions are released: they are shell activity on a Linux target, which is what host rules need.
3. **Lead with the two results nobody has, and size the claims to the data.** Report alert load and whether the decisive step is findable. Report false positives on benign agents doing ordinary work in the same environment. Replace "at a 1% false-positive rate" with a bound the sample can support. Treat scenarios as the unit, pre-register the metrics, and validate step labels on a second-rater sample.

Before any of this, get one stated request from a fund or lab security team. Without it, the audience is vendors.

## Scores

| Criterion | Author | Reviewer | Reason |
|---|---|---|---|
| Open gap | 3 | 3 | The full conjunction is unanswered. Parts exist: a vendor mapping, a one-run agent versus manual comparison, a commercial endpoint benchmark and a rule-scored Windows track. |
| Demand: labs | 3 | 2 | Labs publish on model-side monitors. Nothing found asks for third-party rule coverage. |
| Demand: funds | 5 | 3 | Inferred from sector and general security operations hiring. No role, product or incident on exactly this. |
| Demand: crypto | 3 | 2 | Nothing verified. Two unopened leads suggest general concern only. |
| Promise | 4 | 3 | As designed, the likely headline is already known to web security people. The load and own-agent results would be new if the data supported them. |
| Solo feasibility | 4 | 2 | The agent side is easy. The human baseline needs participants or a heavy rebuild, and the sensors do not fit the data. |
| Budget | 4 | 3 | $200 to $500 holds only with low-cost models and no reruns. $300 to $1,000 is more realistic. |
| Durability | 2 | 1 | Two research groups list defender tooling as next work, one has started, and vendors publish on it. The realistic timeline is months. |

Holding the author's repo signal at 3, these scores total 2.57 against the author's 3.59.

## Searches run

19 Nov 2026:

- StealthBench operational stealth offensive AI agents benchmark arXiv 2607.26314 GitHub
- LLM penetration testing agent evaluated against Wazuh Falco Suricata alerts "detection rate" blue team telemetry 2026
- autonomous AI red team agent EDR alerts triggered comparison human red teamers noise footprint study
- "Trace" unmasking AI attack agents terminal behavior fingerprinting arXiv 2605.01186
- "Say Shibboleth" honeypot identify model harness attacker agents arXiv 2611.12386
- Sigma rules OR "Falco rules" OR "Elastic detection rules" tested against AI agent attacker intrusion "coverage" LLM-driven attack chain SIEM experiment
- KYPO cyber range shell commands dataset participants hands-on cybersecurity training Zenodo licence
- PWNJUTSU dataset human red teamers system network logs vulnerable machines download licence
- Collegiate Penetration Testing Competition CPTC dataset Splunk logs human red team public download
- Sysdig OR Datadog OR "Elastic Security Labs" research AI agent attacker Linux runtime detection "agentic" intrusion Falco rules fired LLM-driven attack 2026
- detectability of LLM pentest agents intrusion detection system alerts Suricata Snort "agent" penetration test noisy stealth measured IDS alerts arXiv
- distinguish AI agent attacker from human attacker SSH honeypot session classification inter-command timing "human" vs "LLM" sessions dataset 2026
- ARTEMIS AI agents versus cybersecurity professionals real-world penetration testing university network detection noise human pentesters comparison
- "Identifying LLM-Powered Cyber Attacks" timing thesis diva-portal human attackers comparison
- "Honey for the Agent" cyber deception behavioral fingerprinting LLM-based attackers human baseline
- MITRE ATT&CK Evaluations 2026 enterprise round AI-driven adversary emulation agentic OR MITRE "agent-driven" intrusion detection results vendors
- Microsoft Storm-0940 ARTEX agentic AI ConnectWise supply chain compromise detections Defender
- "Red Canary" OR "SpecterOps" OR "Splunk Threat Research" OR "Unit 42" OR "SentinelLabs" AI agent operator intrusion "detection" telemetry "looks different" human operator alert volume 2026 Hugging Face incident detection engineering
- Hugging Face agent intrusion technical timeline 17,600 actions detection correlation July 2026
- dataset of audit logs generated by LLM agent attackers evaluate provenance-based intrusion detection systems "agent-driven attacks" host telemetry benchmark 2026 arXiv
- CyberClear benchmark APT attack chain provenance LLM agent systems arXiv 2609.32424 abstract
- "AI-driven" OR "LLM-driven" attacks "existing" EDR OR "detection rules" "still fire" OR "evade" empirical study autonomous agent post-exploitation Linux Sigma auditd evaluation November 2026
- "would the blue team notice" OR "alerts per run" OR "alerts generated" AI pentesting agent XBOW OR PentestGPT OR "Claude Code" OR Strix SOC "Wazuh" OR "Security Onion" OR "Elastic" lab experiment 2026
- arXiv 2026 "human red team" OR "human operators" versus "LLM agents" same environment host logs intrusion detection "alert" comparison "agentic attacks" detection rules generalise
- OpenAI "how we detect frontier model misalignment" replayed monitors sandbox escape alert 30 minutes July incident
- replay recorded attack telemetry to test detection rules prior art Splunk attack_data replay OTRF Security-Datasets Mordor Atomic Red Team Sigma rule validation Linux auditd limitations
- Claude Opus 4.8 API pricing per million tokens input output November 2026 GPT-5.6 Sol price Kimi K3 DeepSeek V4 Pro price
- CrowdStrike OR "Red Canary" OR "Datadog Security Labs" OR SentinelOne OR "Microsoft Threat Intelligence" tested detections against autonomous AI agent red team "detected" percent techniques agentic attack emulation results 2026
- LIDAR fingerprinting LLM agents harness agentic behavior arXiv 2609.28559 OR "AgentTrace" arXiv 2610.32092 attacker agents attribution human
- crypto exchange OR DeFi protocol security operations detecting AI agent driven attackers detection rules SOC 2026 Coinbase OR Kraken OR Chainalysis "AI agents" intrusion detection engineering

22 Nov 2026:

- new study this week: do existing SIEM and EDR detection rules catch AI agent attackers, measured against human red teamers, alert counts, false positives, arXiv 2611 November 2026
- StealthBench update "EDR" baseline OR "live EDR" OR "human operators" OR "v2" offensive agents stealth benchmark Dawson Wood November 2026

The 22 Nov searches found nothing dated after 18 Nov that closes the gap. They surfaced BypassGym and the CSO Online piece, both dated before 18 Nov.

## Could not check

- The Jane Street posting. The fetch was blocked.
- OpenAI's monitoring post. The page failed to open. A digest was used.
- The full text of Trace. arXiv was rate limited twice and a later attempt was blocked. Whether its session data is released is unknown.
- The full text of the BTH thesis. The host disallows automated fetches.
- The StealthBench data files. The dataset is gated, so field names, timestamp precision and what "sanitised" removes are unverified.
- What "expert runs" means on the StealthBench site. It may or may not mean human operators.
- Say Shibboleth's headline accuracies of about 90% and 92%. My read did not confirm them.
- Whether PWNJUTSU's environment build and audit settings are published. Its project site was not opened.
- [OTRF Security-Datasets](https://github.com/OTRF/Security-Datasets). The fetch was blocked.
- A reported Unit 42 case of an agent-run breach. The only page found failed to open.
- The two crypto leads. A usage limit stopped the fetches.
- Whether MITRE ATT&CK Evaluations 2026 emulates an agent-driven adversary. One [participant page](https://fieldeffect.com/blog/field-effect-2026-mitre-attck-evaluations) says nothing on it.
- Claims in the brief not reopened: the dates taken from arXiv 2610.12463, the CyberArena figures, MITRE ATLAS v2026.09, the Transluce and Wikimedia items, Microsoft's own post on the supply chain campaign, and the Rouxii, CyberClear, Optional Traps and FP-Agent entries.
- Papers seen by title only: [Who Is Behind the Harness?](https://arxiv.org/pdf/2609.28559), [When Agents Look Like Beacons](https://arxiv.org/pdf/2609.19091), [On the Effectiveness of Kernel-Level Evidence for Agent Security](https://arxiv.org/pdf/2609.28915), and AgentTrace (arXiv 2610.32092, as cited by Say Shibboleth).
- Licences of the candidate rule sets and of public benign agent sessions.
- Model providers' usage policies on security testing with an instruction to avoid detection.
