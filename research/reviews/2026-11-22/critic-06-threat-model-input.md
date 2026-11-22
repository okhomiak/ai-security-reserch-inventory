# Critic review: Threat model as agent input

Reviewed 22 Nov 2026 by an AI reviewer (Claude) in a fresh session with no access to the author's working notes. Most searches were run on 19 Nov 2026.

## Verdict

**PARK.** The basic with-and-without comparison is already published twice. [HoF-Bench](https://arxiv.org/html/2607.27030v1) (Section 5.2) and [Antaeus](https://arxiv.org/pdf/2607.01138) (RQ3) both switch a model-written, target-specific security briefing on and off, and they disagree: plus 2 points in one, plus 18 to 21 in the other. The brief cites HoF-Bench as a benchmark to reuse and missed the ablation inside it. Demand is the author's inference: no source I opened asks for this study. The plan as written can't settle the question, because thirty targets only detect a gap of about 27 points and the named benchmarks can't score false positives. The plan's key hypothesis (threat model against a placebo) is still untested and cheap to test, but it's a modest result and the owners of the harness could publish it in days.

## Is the gap still open?

| Work | Date | What it measured | Overlap with the proposed study | How checked |
|---|---|---|---|---|
| [HoF-Bench](https://arxiv.org/html/2607.27030v1), AISLE and others, Section 5.2 "Generated Context Is Not a Universal Gain" | 29 Jul 2026 | A model-written "security briefing" per target (component purpose, externally reachable entry points, trust boundaries, security-relevant data and control flow, plus up to three repository searches), switched on and off. Ten small or open-weight detectors, 95 CVEs in eight repositories, four passes each. Strict rediscovery: 514 of 950 cells with the briefing (54.1%), 493 of 950 without (51.9%). Difference plus 2.2 points, CVE-bootstrap 95% interval from minus 6 to plus 47 cells. Per model: from minus 1 to plus 6 CVEs of 95. Deduplicated findings rose from 1,664 to 2,088. The authors call the recall effect "small and uncertain while candidate volume rises". | Some. It is the plan's C0 against C1 contrast on detection, with more targets, models and passes than the plan. No placebo, wrong-target or expert arm. No per-dollar figure for the briefing. No false-positive measure. | Opened and read, full text, queried twice |
| [Antaeus](https://arxiv.org/pdf/2607.01138), University College London and University of Bologna, RQ3 | Jul 2026 (by arXiv number; day not seen) | Removes a "repository context bundle" written once per repository by an agent. Five sections: system purpose, principal model (actors), protected objects, information outputs, trust topology (exposed interfaces and boundaries). 28 CVEs (CWE-200 and CWE-284) in 28 repositories, whole-repository scope. Detected with the bundle: 15 of 28 (Claude Opus 4.7) and 12 of 28 (GPT-5.4). Without it: 9 and 7. | Some. Same contrast, for logic bugs, on frontier models. False positives not reported for the ablated arm. Run count not stated. No placebo. | Opened and read, full text, queried twice |
| [Demystifying Agent Skills for Smart Contract Auditing](https://arxiv.org/pdf/2609.29454) | 24 Sep 2026 | Generic audit skills on and off on EVMbench, seven configurations. Best case 79 to 97 of 120, repeated three times. Three other gains of 2 to 5 detections. Three losses of 2 to 3. Three configurations never loaded a skill and still moved by plus 2, minus 2 and minus 3. Cost per audit $0.73 to $8.29 on flagship models. | Little. Generic guidance, not target context. Useful for effect size, noise and cost. | Opened and read |
| [EVMbench](https://arxiv.org/html/2603.04915v1), OpenAI, Paradigm and OtterSec, hint experiments | 5 Mar 2026 | Hints taken from ground truth. Low: a location. Medium: location plus a short mechanism. Medium hints lift GPT-5.2 to 90.2% on Patch and 78.3% on Exploit. Detect scores with hints were not in the text I read. | Little. Oracle hints, not a threat model. | Opened and read, first 100,000 characters |
| [CyberGym](https://arxiv.org/pdf/2506.02548v2), input levels | Jun 2025, v2 Oct 2025 | Success for one agent rises with information: codebase only 3.5%, plus description 9.4%, plus crash trace 13.1%, plus patch 17.1%. | Little. Oracle information about the bug. | Opened and read, first 100,000 characters |
| [Endor Labs post](https://www.endorlabs.com/learn/2x-the-findings-12x-fewer-tokens) | 9 Nov 2026 | One agent with and without precomputed vendor security evidence on 34 security questions. The unaided agent used about 12 times the tokens. Cost only, not correctness. No ground-truth bug finding. | Little. Vendor-run, no placebo. Shows vendors now publish context economics. | Opened and read |
| [VulContextBench](https://arxiv.org/pdf/2609.32601) | Sep 2026 | Which code context agents retrieve on 111 vulnerable commits. A label check lifts a verifier from 27.0% to 75.1% when it is handed the gold code blocks. | Little. No with-and-without detection test for agents. | Opened and read |
| [Where Do the Tokens Go?](https://arxiv.org/html/2610.11602) | Oct 2026 | Cost of vulnerability agents on CyberGym with four add-ons, single runs. No threat-model arm. | Little. Good cost data. | Opened and read |
| [Specification-Guided Vulnerability Detection with LLMs](https://arxiv.org/html/2511.04014v1), [A Context-Driven Approach for Co-Auditing Smart Contracts](https://arxiv.org/html/2406.18075), [Reva](https://arxiv.org/abs/2610.35829v1), [From Requirements to Attack Trees](https://arxiv.org/html/2610.03820) | 2024 to 2026 | By their titles, these may test specifications or context as input. | Unknown | Title only. The last one could not be opened. |

Narrowed, not closed. The brief's falsifier ("any published ablation of target-specific threat models in automated vulnerability finding") is met in substance by the first two rows, because a generated briefing of entry points, trust boundaries, actors and assets is exactly what the plan's own C1 arm is. The "Closes when" condition is not met: nobody has run a length-matched placebo, a wrong-target arm, an expert-written arm, a registered analysis, or true positives per dollar. The open adjacent question is why the two results disagree (bug class, scope, model tier) and whether either beats a placebo.

Pages were read through a fetch tool that returns an extract, so quotes are short fragments.

## Is the demand real?

Three claims checked.

1. **"OpenAI ships the design."** Confirmed. [OpenAI's page](https://openai.com/index/codex-security-now-in-research-preview) says Codex Security "generates a project-specific threat model", that "Threat models can be edited", and that it works "Using the threat model as context". The page has no ablation. It also doesn't credit the 50% and 90% figures to the threat model. They're changes over the beta for the whole system.
2. **"Jane Street hires a threat-modelling engineer whose models turn into architectural fixes."** Partly confirmed. [The posting](https://www.janestreet.com/join-jane-street/position/7999330002) asks for practical threat modelling and the ability to "translate security principles into concrete architectural improvements". It doesn't mention AI, agents or scanners. It shows the firm values human threat modelling. It doesn't show demand for this study.
3. **"Audit firms and contest platforms run AI auditors on protocols whose invariants are a threat model in all but name."** Partly confirmed. [Nethermind's AuditAgent](https://docs.auditagent.nethermind.io/) is a live product with a "Select Documentation" step. Its docs page reports no with-and-without comparison. EVMbench is OpenAI's benchmark, built with Paradigm and OtterSec from contest audits, so "their benchmark" is loose.

Also opened: [Anthropic's policy](https://www.anthropic.com/research/coordinated-vulnerability-disclosure-timelines) (16 Nov 2026) is as the brief says. It gives no false-positive or triage numbers and doesn't mention threat models. The [Trail of Bits post](https://blog.trailofbits.com/2026/09/18/auditing-in-the-age-of-good-enough-ai/) is about tooling built before an audit. It isn't demand evidence.

How strong, honestly:

- **Labs: moderate, inferred.** A product exists whose first step is the thing under test, and a vendor cared enough to run the ablation. No lab asks for an outside one, and a lab can run it on private data.
- **Funds: weak, inferred.** Hiring a human threat modeller isn't demand for a scanner ablation. Funds are buyers of scanners at most.
- **Crypto: moderate, inferred.** An active product market and a benchmark. Nobody states the need. The skills study asks for per-skill causal benchmarks, which is an academic ask.

## Will the plan work?

What's strong: a paired design, a judge blind to condition, registration before the full run, a wrong-target arm, the cost of writing the threat model counted, clear kill criteria, and candour about power and conflicts.

**The benchmarks don't fit the design.**

- HoF-Bench has 95 CVEs in eight repositories (OpenSSL, curl, GnuTLS, Apache httpd, pearweb, FOGProject, OpenEMR, WeKan). Thirty targets are thirty CVEs inside at most eight codebases. A threat model is written per codebase, so there are at most eight of them. The bootstrap must cluster by repository, and eight clusters are too few.
- HoF-Bench hands the detector 1 to 7 files per task, and "This target-file scope is derived from the benchmark ground truth". The benchmark already points at the risky code, which is the job a threat model is meant to do. Its protocol biases towards a null. Whole-repository scans avoid that but cost more and find less.
- HoF-Bench scores recall only. Unmatched findings are "unverified, not false positives", and the judge and deduplication "have not been human-audited". H2 has no ground truth.
- CyberGym can't supply executable checks for HoF-Bench targets. Its 1,507 instances are OSS-Fuzz crashes disclosed from 1 Jan 2017 to 21 Apr 2025. HoF-Bench's CVEs were found by an AI system, and 50 of 95 are PHP or JavaScript. I couldn't check the overlap CVE by CVE. By construction it's likely zero. CyberGym's server also holds about 10 TB of environments.
- EVMbench's Detect grading lets agents "submit false positives without penalty" and can't credit valid findings outside the historical report.
- Targets after model cutoffs. CyberGym: none, since it ends in April 2025. EVMbench: audits run from July 2023 to January 2026, and [a re-evaluation](https://arxiv.org/html/2603.10795v1) says "roughly 36 of the 40 repositories" predate August 2025. HoF-Bench: the paper gives no CVE dates and says "training-data contamination cannot be excluded". A split by cutoff date on thirty targets leaves groups too small to read.
- Licences. None of the three papers names a dataset licence in the text I read. Check before releasing derived data.

**Thirty targets are too few.** Published effects to plan against: plus 2.2 points (HoF-Bench), plus 15 points in the skills study's best configuration and 2 to 4 elsewhere, plus 18 to 21 points (Antaeus). Noise is high. In HoF-Bench, 62% of successful cells were found in only one to three of four passes.

| Calculation | Assumptions | Result |
|---|---|---|
| Smallest detectable gap, 30 pairs | McNemar test, Connor's formula, 80% power, two-sided 5%, 30% of targets flip between arms | 27 points. 32 points after the plan's correction for four comparisons |
| Pairs needed | Same | 20 points: 56 (81 corrected). 15 points: 102 (146). 10 points: 233. 5 points: 940. 2.2 points: about 4,900 |
| Simulated power, 30 targets, 2 runs per cell, one model | Per-run detection averages 36% with wide spread across targets. Effect varies across targets with a standard deviation of 10 points | 15 points: 46%. 20 points: 70%. After correction: 25% and 47% |
| Same, two models pooled (4 runs per cell) | Same, and the effect has the same sign in both models | 10 points: 43%. 15 points: 74%. 20 points: 92%. After correction: 23%, 53%, 79% |
| C2 on 10 targets | Same, one model | 15 points: 15%. 20 points: 23% |
| 95 targets, 4 runs per cell | Same | 5 points: 40%. 10 points: 90% (77% corrected) |

So the plan confirms an Antaeus-sized effect only if both models are pooled and agree in sign. The skills study shows signs flip between backends. H3 compares two treated arms, so its gap is smaller than any gap against C0. H5 has no power. The primary metric makes this worse: true positives per dollar is a ratio with a noisy denominator, and a generated threat model costs a full read of the repository. Antaeus's own result shows how thin 28 pairs are: 15 against 9 is significant by an exact test if the discordant pairs split 6 to 0 (p = 0.031) and not if they split 8 to 2 (p = 0.109).

**Controls are missing.**

- An equal-spend baseline. C1 buys an extra pass over the code. HoF-Bench found that one pass recovers about 68% of what four passes find, and that twelve cheap passes found 70 CVEs for $66 against 65 for $128 from four dearer ones. The rival to a threat model is another pass, not nothing.
- A neutral architecture summary of the same target with the security content removed. It separates knowing the system from threat modelling.
- A true placebo. The checklist is an active comparator: generic security guidance moved one configuration by 15 points in the skills study. Keep it, name it correctly, and add length-matched irrelevant text.
- C1 against C4 is the cleanest test of content. H4 compares C4 with C0 instead.
- More passes. Two seeds are too few for this noise.
- A second labeller. One unblinded person can't validate the judge.

**The expert arm won't be accepted as described.** The targets are well-known CVEs in famous projects, so an expert may know them, and public documentation post-dates the fixes. A "signed and dated log" is self-attestation that nobody can check. One author confounds "expert" with one person's skill. The brief's own rule says a second, blind author is the only acceptable option if a commercial interest exists, and the budget has no line for one. A better source is material written before the bug was known. EVMbench's Detect task already gives agents the sponsor's notes on where to look, so withholding them is an expert arm that is blind by construction.

**The budget assumption is off in both directions.** Published per-scan costs on current models:

- Skills study, per EVMbench audit: $6.30 (Codex, GPT-5.5), $7.41 (Claude Code, Opus 4.8), $2.84 (Gemini 3.5 Flash), $0.73 (GLM-5.1), $0.07 to $0.08 (DeepSeek V4 Pro).
- [Where Do the Tokens Go?](https://arxiv.org/html/2610.11602), per CyberGym task: $2.14 and $6.63 (Codex, GPT-5.5, two task sets), $0.22 to $0.86 (OpenCode, DeepSeek).
- Antaeus: about $8 per repository for a plain Opus 4.7 agent, about $16 for its pipeline.
- HoF-Bench: about $0.34 per file-scoped pass on GPT-5.6 luna, about $0.06 on cheap models.
- CyberGym capped its 2025 agents at "approximately $2.0" a run.

[Anthropic's price list](https://platform.claude.com/docs/en/about-claude/pricing) today: Opus 5.5 at $4 in and $20 out per million tokens, Sonnet 5.5 at $2 and $10, Haiku 5.5 at $0.10 and $0.50 for prompts up to 100,000 tokens, batch at half price. On my arithmetic a 100-turn scan that re-reads 80,000 tokens a turn costs about $2 on Sonnet 5.5 and $4 on Opus 5.5 with caching.

So $1.30 to $3.20 is right for a mid-tier model, two to six times too low for a frontier agent on a whole repository, and four to fifty times too high for file-scoped passes on small models. 260 frontier scans at $6 to $8 cost $1,560 to $2,080 before the small model, the judge, the pilot and reruns. A spend cap keeps the bill in range only by cutting those scans short. A powered file-scoped design (95 CVEs, five arms, four passes, two small models, 3,800 passes) costs about $230 to $1,300.

**The timeline hides the labelling.** Ten weeks is 100 hours. Matching a finding to the known CVE is quick. Deciding whether an unmatched finding in OpenSSL or GnuTLS is a different real bug is triage. At 30 to 60 minutes each (my estimate), the 100-finding validation set alone takes 50 to 100 hours. Ten expert threat models add about 20 hours from someone else. Expect 16 to 24 weeks unless H2 and C2 are cut.

**Access and ethics.**

- Frontier cyber capability is gated. A [CSA note of 8 Oct 2026](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/10/CSA_research_note_anthropic_cyber_verification_tiers_20261008-csa-styled.pdf) says Anthropic's lowest verification tier unlocks vulnerability analysis and admits individual researchers "with a vulnerability disclosure history", and that OpenAI's programme checks identity. I couldn't confirm what an unverified user is refused for plain source scanning. Test it in week 1.
- Safeguards may react to a prompt full of attack language. That's a confound between arms. Log refusals per condition.
- Scans will produce unmatched findings in real code. HoF-Bench saw 3 to 4 per rediscovered CVE. Some will be live upstream. The plan's disclosure rule is right, but it implies triage the timeline doesn't hold.
- Public, fixed CVEs and no human participants: no problem there.

**Skills.** The plan needs more than one security generalist: triage of C memory-safety findings in cryptographic libraries, Solidity and DeFi logic for the second arm, and clustered resampling with a power analysis. Drop the smart-contract arm or add a co-author.

**Most likely failure.** The study runs on budget and returns intervals that span zero and plus 20 points for every contrast. It adds a third, noisier data point to two published ones and can't say whether the threat model beats the checklist.

## Errors and overstatements in the brief

1. "nobody has isolated what that step is worth" and "The closest experiment switches generic skills on and off, not target context." Wrong since July 2026. HoF-Bench Section 5.2 and Antaeus RQ3 switch generated target context on and off. `prior-work.md` lists HoF-Bench as read earlier and says only "The blind judge is the scoring method this study needs."
2. "A Cloud Security Alliance note points out those figures are unverified and that no ablation separates the threat model from everything else in the design". The first half is right: the [note](https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-vulnerability-scanning-market-20260308/) says "figures that have not been independently verified as of this writing". The second half isn't in it. The [PDF](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/03/CSA_research_note_ai_vulnerability_scanning_market_20260308-csa-styled.pdf) has no match for ablation, separate or contribution, and credits the gains to "these design choices" as a group. The point is the author's own. The same error is in `prior-work.md`.
3. "The best-known AI scanner builds a threat model first and reports large gains with no ablation." Overstated by placement. OpenAI says false-positive rates "have fallen by more than 50% across all repositories" over the beta. That's a time trend for the whole system.
4. "Precision is the bottleneck at this scale." Unsupported by the sources cited. Counts of findings and CVEs aren't a precision measure, and the Anthropic policy has no false-positive figures.
5. "Gains were smaller for three other configurations (3.2% to 13.9%)". The 3.2% belongs to a configuration that loaded no skill in any of 40 audits. It's noise, not a gain.
6. "Trail of Bits wrote in September 2026 about what the many posts on agentic code review leave out". The post is an experience report on tooling for a zkVM audit. The brief says it wasn't opened. It doesn't belong under "Who's asking".
7. "with executable checks where a second benchmark supplies them". CyberGym is unlikely to cover any HoF-Bench CVE.
8. "Thirty paired targets detect a large effect and miss a small one." Understated. For one model, thirty pairs miss the largest published effects more often than not.
9. "Assume three to seven times the $0.45 that a 50-turn shell trajectory cost in one published benchmark". Direct costs were in a paper the brief had read: $0.73 to $8.29 per audit in the skills study.
10. "It isn't a glamorous one, which is why it hasn't been published." Part of it has been, twice.
11. Minor. "Three searches found no ablation": `prior-work.md` lists four. "ran on their benchmark": EVMbench is OpenAI's, with Paradigm and OtterSec.

Checked and correct: the Codex Security figures (50%, 90%, 1.2 million commits, 792, 10,561, 14 CVEs), the Firefox figures (112 reports, 22 CVEs), the skills study numbers, and the Anthropic policy.

## What would make it better

1. **Reframe it as a controlled extension of the two published ablations.** Ask whether a generated briefing beats length-matched irrelevant text, a neutral architecture summary, a wrong-target briefing and an equal-spend extra pass, and whether the answer changes with bug class, scope and model tier. Name HoF-Bench 5.2 and Antaeus RQ3 as the results to reconcile. Reuse the [HoF-Bench harness](https://github.com/weareaisle/HoF-Bench) (cited in the paper, not opened here), which already has the switch.
2. **Fix power and the unit of analysis before spending.** Use all 95 CVEs, at least four passes per cell and small models first. Cluster by repository and add repositories, because eight is too few. Register detection at matched spend as the primary metric, name a smallest effect of interest such as 10 points, and plan an equivalence test for a null.
3. **Replace the parts that can't be checked.** For the expert arm, use material that pre-dates the bug: EVMbench sponsor notes withheld against supplied, or threat models published before the CVE. For false positives, have two independent people label a random sample and report agreement, or drop H2 and report candidate volume per rediscovered CVE. Drop the smart-contract arm unless a co-author has that skill.

With these three changes it becomes a small GO WITH CHANGES study, at roughly $230 to $1,300.

## Scores

| Criterion | Author | Reviewer | Reason |
|---|---|---|---|
| Open gap | 4 | 2 | The with-and-without comparison exists twice for generated context. Only the control arms, the expert arm and cost metrics are open. |
| Demand: labs | 4 | 3 | OpenAI ships the design and a vendor ran the ablation. Nobody asks for an outside one. |
| Demand: funds | 4 | 2 | One posting for human threat modelling with no mention of AI. Inference only. |
| Demand: crypto | 4 | 3 | Live products and a benchmark. No stated need. |
| Promise | 4 | 3 | A third data point between a null and a large positive. It matters only if it explains the disagreement. |
| Solo feasibility | 4 | 3 | Harness and data are public. The expert arm, false-positive triage and gated frontier access need other people or approvals. |
| Budget | 2 | 2 | Holds only with a mid-tier model or a hard cap. Frontier whole-repository scans measure $6 to $8. A file-scoped redesign would score 4. |
| Durability | 3 | 2 | Two groups have published partial versions and one owns a harness with the switch built in. A placebo arm is days of work for them. |

## Searches run

The search tool returned titles and links only. Run on 19 Nov 2026:

- OpenAI Codex Security threat model repository editable research preview false positives 50% severity 90%
- LLM agent vulnerability discovery ablation "threat model" OR "attack surface analysis" stage removed recall precision paper 2026
- HoF-Bench arXiv 2607.27030 AI-found CVEs benchmark blind judge
- "security briefing" OR "architecture summary" OR "design document" given to LLM bug-finding agent with versus without context recall comparison CVE rediscovery 2026
- smart contract audit agent protocol documentation invariants provided versus withheld detection rate ablation EVMbench ScaBench 2026
- "Demystifying Agent Skills for Smart Contract Auditing" arXiv 2609.29454
- EVMbench OpenAI Paradigm detect patch exploit 120 vulnerabilities 40 audits hints GitHub licence grading
- CyberGym 1,507 vulnerabilities 188 projects levels of information vulnerability description ablation cost per task licence Hugging Face dataset size
- Trail of Bits "Auditing in the age of good enough AI" September 2026
- Cloud Security Alliance research note "AI Vulnerability Scanning Market" March 2026 Codex Security Claude Code Security unverified vendor claims
- Anthropic Mozilla Firefox Claude Opus 4.6 two weeks 22 vulnerabilities 112 reports 14 high severity
- cost per repository scan LLM agent vulnerability hunting dollars per run "per run" Mythos OpenBSD $20,000 thousand runs cost per finding AISLE Big Sleep XBOW 2026
- arXiv 2610.11602 Lu Zhao Chen Wang vulnerability agents CyberGym AVRI add-ons cost recall
- "threat model" guided vulnerability detection LLM agent "ablation" "without threat model" OR "w/o threat model" OR "threat-model-guided" repository audit arXiv
- LLM smart contract auditing business logic vulnerabilities documentation whitepaper specification context improves detection ablation "without documentation" Code4rena benchmark
- AI code security review agent "context" experiment false positive rate architecture description AGENTS.md security notes Semgrep OR ZeroPath OR "Endor Labs" OR XBOW benchmark results 2026
- Jane Street "Cybersecurity Engineer" "Threat Modelling" job posting
- Anthropic coordinated vulnerability disclosure timelines 30 days high critical January 2027 rediscovery policy November 2026
- AI auditor smart contracts protocol invariants specs as input improves findings Nethermind AuditAgent OR "Zellic V12" OR "Sherlock AI" OR Cantina OR OpenZeppelin benchmark results context documentation 2026
- EVMbench GitHub repository openai frontier-evals evmbench license dataset Code4rena audits dates hints "medium hints"
- API pricing per million tokens November 2026 GPT-5.5 GPT-5.6 Claude Opus 4.8 Sonnet input output price
- AISLE HoF-Bench follow-up generated context briefing analyzer "context" helps or hurts small models rediscover CVEs blog October November 2026
- Codex Security threat model evaluation "threat model" quality affects findings OpenAI technical deep dive how it works validation stage contribution 2026
- does extra context help LLM vulnerability detection "irrelevant context" OR "distractor" OR "placebo" controlled experiment repository-level agent security audit prompt length 2026
- OpenAI "Trusted Access for Cyber" Anthropic "Cyber Verification Program" safeguards block vulnerability research requests API usage policy 2026

Run on 22 Nov 2026:

- vulnerability-finding agent threat model OR "security context" input ablation placebo arXiv November 2026

The last search showed nothing new on point by title since 18 Nov 2026.

## Could not check

- The [HoF-Bench dataset page](https://huggingface.co/datasets/aisleinc/HoF-Bench): the fetch was blocked. So no licence, CVE dates or per-repository counts.
- [From Requirements to Attack Trees](https://arxiv.org/html/2610.03820): rate limited twice.
- Dataset licences for HoF-Bench, [CyberGym](https://github.com/sunblaze-ucb/cybergym) and [EVMbench](https://github.com/openai/frontier-evals). The repositories are cited in the papers and were not opened.
- The overlap between HoF-Bench and CyberGym, CVE by CVE.
- The training cutoff of each current model. I assumed models released in 2026 have cutoffs after April 2025.
- The Hudson River Trading posting, the field-wide agenda, the ISC source, ACSE-Eval, ASTRIDE, Alibi, the Agentic Benchmark Checklist and the StealthBench $0.45 figure.
- OpenAI and Google list prices. I used Anthropic's price page and measured costs from three 2026 papers.
- What an unverified API user is refused for source-code scanning. The labs' own programme pages were not opened.
- Whether the Jane Street posting is still live.
- Antaeus's submission day and its runs per configuration.
- Vendor and lab posts from XBOW, ZeroPath, Semgrep, Snyk, AISLE's blog, Zellic, OpenZeppelin, Sherlock, Cantina, Google Big Sleep and CodeMender. They were named in searches, nothing on point surfaced by title, and none was opened. The same goes for [Revelio](https://arxiv.org/pdf/2606.22263), [VulnAgent-R2](https://arxiv.org/pdf/2603.13384) and a [2025 Semgrep study](https://semgrep.dev/blog/2025/finding-vulnerabilities-in-modern-web-apps-using-claude-code-and-openai-codex/).
- Anything published after 18 Nov 2026, beyond one title-level search.
