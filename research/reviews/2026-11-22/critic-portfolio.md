# Critic review: the shortlist as a whole

Reviewed 22 Nov 2026 by an AI reviewer (Claude) in a fresh session with no access to the author's working notes. Most searches were run on 19 Nov 2026.

This review covers the selection method, the scoring, the rejected candidates and what is missing. Other reviewers take the six topics one at a time, so topic-level prior work is not rechecked here.

How sources are labelled. **Read** means the page was opened on 19 Nov 2026 and summarised through a fetch tool. **Title only** means it appeared in search results and was not opened. Figures from repository files were recomputed with short scripts. The reviewer brief describes one part-time security generalist: strong on network controls, identity, application security and detection, competent in Python, not a smart-contract specialist and not an ML researcher.

## Verdict on the shortlist

1. **The top of the list is reasonable. The order is not established.** Topics 01 and 02 are sound candidates. Nothing in the method separates them.
2. **The rubric did not pick the six.** A four-test filter removed seventeen candidates before any scoring, and none of the seventeen has a score. The [README](../../README.md) says the rubric "can tell these six apart from the seventeen that were dropped". It was never asked to.
3. **The filter is the weak point.** Fourteen of the seventeen failed the "still open" test. [METHOD.md](../../METHOD.md) reports about 40 queries. The six topic logs list 23 of them. That leaves about one for each rejected candidate, and [REJECTED.md](../../REJECTED.md) logs none, so the rejections can't be rerun. Of the 38 citations offered as closing a candidate, 34 were not opened on the day: 17 are marked title, 14 digest and 3 not reopened. Two of the four rejections re-examined below do not hold as written.
4. **Earlier candidates got a second chance that new ones did not.** Four gaps survive from the 4 Nov list, and three of them survive only after being reframed or split. None of the twelve new candidates that failed was reframed. Five of the six topics descend from the earlier list.
5. **The arithmetic is right.** Every total matches. One sensitivity row reports a tie as an order.
6. **The rubric cannot rank the six.** Half of all one-point changes to a single score change the order.
7. **Topic 04 does not fit the stated constraints.** Topics 05 and 06 rest on inputs nobody has checked: the data for 05, the cost per scan and the blind author for 06.

What is strong. Every brief argues against itself, says what would close the gap and sets kill criteria. Every source carries a label for how it was checked, which is what made this audit possible. The limits section is candid. The figures quoted from the repository are correct.

## The rubric

### Fit with the four requirements

The most a criterion can move a total is its weight times the spread of scores it was given.

| Requirement | Criteria that carry it | Combined weight | Most each can move a total among the six |
|---|---|---|---|
| 1. A real gap | Open gap, Durability | 30% | 0.20 and 0.10 |
| 2. Strong demand from at least one audience | Demand, Repo signal | 25% | 0.12 and 0.15 |
| 3. Very promising | Promise | 20% | 0.40 |
| 4. Doable under the constraints | Solo feasibility, Budget | 25% | 0.30 and 0.20 |

Demand has 20% of the weight and can move a total by 0.12. Repo signal has 5% and can move it by 0.15. The criterion the author trusts least has more say over the order than the second of the four requirements. Promise, one judgement call per topic, has the most say.

### Double counting

- Topic 02 loses a point on Open gap because "the insight is public" and a point on Promise for "the 'known issue' objection". One fact, two deductions.
- Topic 05 scores 3 on Open gap because the work is "an announced next step for others" and 2 on Durability because it is "the obvious follow-up for the benchmark's authors". One fact, two deductions. The rubric's own anchor for a 5 on Open gap is "the closest work names it as future work". That is topic 05's situation.
- Topic 01's crowding is charged once, on Durability. Its Open gap stays at 4.
- Repo signal has mean demand in its numerator, so demand is counted again there.
- Feasibility and budget were filter tests before they were criteria. Survivors bunch at 3 to 5 and 2 to 4.

### The demand formula

- Five of the six topics have a 5 for their strongest group. The 0.6 term is therefore the same for five topics, and the formula ranks them by the 0.4 term, which measures breadth. The stated intent was the opposite.
- No group scores below 3 on any topic. "Plausible, not evidenced" earns a 3 (topic 05, crypto). The rubric's anchor for a 1 is "mentioned in passing". The scale in use runs from 3 to 5.
- The evidence for a 5 is incidents, products and job posts. These show that the problem exists. They don't show that the audience wants outside research, or would see it.
- Topic 01 cites two fellowships as proof that labs "fund this kind of work". Anthropic's [AI Security Fellows posting](https://job-boards.greenhouse.io/anthropic/jobs/5030244008) (read) lists five mentors and no research areas, and requires full-time work for four months. OpenAI's [Safety Fellowship post](https://openai.com/index/introducing-openai-safety-fellowship/) of 6 Apr 2026 (read) lists "agentic oversight" and "safety evaluation" among its areas, but applications closed on 3 May 2026 and the programme runs from 14 Sep 2026 to 5 Feb 2027. Neither is a route for a part-time researcher. Both are competition. A [sister posting](https://job-boards.greenhouse.io/anthropic/jobs/5183052008) in Anthropic's programme (read) gives compute funding of about $15,000 a month per fellow, and the OpenAI cohort's outputs fall due inside the next three months.
- Fund scores differ by topic (4, 5, 5, 3, 5, 4) on the strength of which words appear in the same handful of job postings, read on 2 to 4 Nov and not reopened. Two roles that name identity earn a 4. Three that name sandboxing earn a 5.
- The formula treats the three audiences alike. If labs matter most, as the portfolio question below assumes, it should not.
- The filter's demand test removed nothing. No candidate was dropped for lack of demand. "Information barriers for finance agents" was dropped partly because "demand is limited to finance", which the stated rule allows.

### Repo signal

- The formula is `pressure = mean_demand / (papers + 1)`, in [`agent/derive.py`](../../../agent/derive.py). Across the twelve needs in [`derived.json`](../../../docs/data/derived.json) it correlates 0.98 with 1/(papers + 1) and 0.40 with mean demand. It is a paper count.
- The paper count comes from 169 hand-curated records in [`papers.json`](../../../docs/data/papers.json). Five are dated July 2025 or later.
- Mean demand comes from 336 cells in [`companies.json`](../../../docs/data/companies.json). 26 carry evidence. 17 of the 28 rows are marked low confidence. The ten fund rows have no evidenced cell.
- `n.secure_infra` gives topics 02 and 03 their 4. It has 7 papers and no evidenced cell. The fund rows pull its mean up: 4.60 for them against 3.44 for the other eighteen rows.
- The mapping is a free choice. Topic 05 averages `n.monitoring` (0.283) with `n.offensive` (0.078) and gets a 3. Mapped to monitoring alone it gets a 4. Topic 03's brief says neither of its needs fits, and it still takes a 4.
- For labs it points the wrong way. The four lab rows are marked high confidence and hold 12 of the 26 evidenced cells. Their top needs are evaluation and guardrails (4.75 each). Their lowest is identity (2.75). Topic 06 maps to the labs' first and fifth needs and gets the lowest repo score, 1, because the seed corpus holds 61 evaluation papers.
- The repository sets its own test: pressure should predict where new papers appear. REJECTED.md is evidence against it. By my reading, at least six of the fourteen candidates closed by published work sit in agent and tool security, which ranks ninth of twelve on pressure.

The author gives this criterion 5% and shows a row without it. The weight should be zero.

### Weights and the form of the sum

- METHOD.md justifies one weight, the 5% on repo signal. The rest are stated without reasons.
- The four requirements are joined by "and". A weighted sum lets a strong score on one requirement buy back a weak score on another. Topic 04 needs smart-contract engineering, which the brief rules out as a strength, and still ranks fourth.
- With each requirement at 25% and no repo signal, the order is 01, 02, 04, then 03 and 05 level, then 06. With demand weighted 0.6 to labs and 0.2 to each of the others, it is 01, 02, 03, 06, 04, 05.

### What the rubric leaves out

- **Skill fit.** "Solo feasibility" is defined by resources: "one person, part-time, public tools and data". Topic 04 loses a point for smart-contract engineering, so skill enters by accident. Topics 01 and 06 are evaluation-method studies, with judge validation, clustered bootstraps and evaluation awareness, and lose nothing for it. Topics 02, 03 and 05 sit on the strengths the brief names and gain nothing.
- **Hours.** No plan estimates hours. Topic 03 schedules 720 agent sessions in two weeks. At ten hours a week that is under two minutes a session, across six to eight products. Topic 04 allows two weeks to build four wallet designs.
- **Time to a result that could be published if work stopped there.** The README's "first result" column mixes a publishable dataset (02) with pilots that only decide go or stop (01, 06).
- **Reach.** Nothing scores whether the named audience will see the result. Topics 02 and 03 send findings to the vendors before publishing, and those vendors include the labs. That is a built-in route to lab security teams, and it earns nothing.
- **Validity.** The chance a sceptical reader accepts the result: evaluation awareness in 01, replay fidelity in 05, judge reliability in 06.
- **Cost uncertainty.** Three budgets (01, 02, 06) are anchored on one figure, $0.45 per trajectory, taken from one benchmark. Topic 05 prices its runs in the same range. Topic 05's brief also quotes another benchmark at about $18 a game. That is a forty-fold spread inside the author's own sources. I opened neither paper.
- **Terms of service.** Topic 02 tests third-party hosts and topic 03 intercepts product traffic.

### Does it discriminate?

- The six totals span 0.37. The steps between neighbours are 0.05, 0.08, 0.10, 0.10 and 0.04. One point on Promise is worth 0.20.
- Of the 98 possible one-point changes to a single score, 49 change the order and 14 change or tie the leader.
- I moved every score one point down, left it, or moved it one point up, with probabilities one quarter, one half and one quarter, 20,000 times. The base order survived in 0.6% of draws. Topic 01 came first in 32%, 02 in 26%, 03 in 16%, 04 in 12%, 06 in 9% and 05 in 6%.
- The scores support "01 and 02 are the likeliest leaders" and little more. They don't support three bands. Topics 03 and 04 finish last in 12% and 19% of draws, against 26% and 32% for 06 and 05.

## Scoring audit

### Recomputed totals

Demand is 0.6 times the strongest group plus 0.4 times the mean of the other two. The total uses the weights in METHOD.md.

| Topic | Demand recomputed | Demand stated | Total recomputed | Total stated | Match |
|---|---|---|---|---|---|
| 01 Found credentials | 4.60 | 4.6 | 3.92 | 3.92 | Yes |
| 02 Allowlist relays | 4.60 | 4.6 | 3.87 | 3.87 | Yes |
| 03 Unprompted egress | 4.20 | 4.2 | 3.79 | 3.79 | Yes |
| 04 Agent wallets | 4.20 | 4.2 | 3.69 | 3.69 | Yes |
| 05 Detection coverage | 4.20 | 4.2 | 3.59 | 3.59 | Yes |
| 06 Threat model as input | 4.00 | 4.0 | 3.55 | 3.55 | Yes |

### Recomputed sensitivity rows

| Change | Order stated | Recomputed | Match |
|---|---|---|---|
| Base | 01, 02, 03, 04, 05, 06 | 01 (3.92), 02 (3.87), 03 (3.79), 04 (3.69), 05 (3.59), 06 (3.55) | Yes |
| Durability doubled, taken from promise | 03, 02, 01, 04, 06, 05 | 03 (3.79), 02 (3.67), 01 (3.62), 04 (3.59), 06 (3.45), 05 (3.39) | Yes |
| Budget doubled, taken from promise | 02, 03, 01, 04, 05, 06 | 02 (3.87), 03 (3.79), 01 (3.72), 04 (3.69), 05 (3.59), 06 (3.35) | Yes |
| Open gap raised to 30%, demand cut to 10% | 01, 03, 02, 04, 06, 05 | 01 (3.86), 03 (3.77), 02 (3.71), 04 (3.67), 06 (3.55), 05 (3.47) | Yes |
| Only lab demand counts | 01, 02, then 06 and 03 level, 04, 05 | 01 (4.00), 02 (3.95), 03 and 06 (3.55), 04 (3.45), 05 (3.35) | Yes |
| Only fund demand counts | 02 and 03 level, 01, 05, 06, 04 | 02 and 03 (3.95), 01 (3.80), 05 (3.75), 06 (3.55), 04 (3.45) | Yes |
| Only crypto demand counts | 04, 01, then 06, 02 and 03 level, 05 | 04 (3.85), 01 (3.80), then 02, 03 and 06 (3.55), 05 (3.35) | Yes |
| Repo signal removed, its 5% split between open gap and demand | 01, 02, 04, 03, 06, 05 | 01 (4.035), 02 (3.86), 03 and 04 level (3.795), 06 (3.70), 05 (3.62) | No. 03 and 04 tie |

Seven rows match. The last row lists 04 ahead of 03 where the two are level. No other arithmetic error was found.

### Other checks on the numbers

- "Topic 01 or 02 leads in six of the eight rows" counts the fund-only tie between 02 and 03 as a lead. Sole leads number five. "Topic 05 or 06 is last in seven" is right.
- The pressure figures and leaf counts in METHOD.md match `derived.json` and `papers.json`. Mean pressures are rounded unevenly: 0.1215 is printed as 0.121 and 0.0655 as 0.066. No bucket changes.
- The budget buckets share their edges. Topic 02 tops out at exactly $700 and topic 01 at exactly $1,200. Both took the higher score. Resolved the other way, the order is 01 (3.82), 03 (3.79), 02 (3.77), 04, 05, 06.
- Topic 06's brief says three searches found no ablation. Its log lists four.
- The README says topic 06 is last "mainly because it's the dearest to run". Its place below topic 05 turns on repo signal. Without that criterion the author's own row puts 06 above 05.

### Consistency between topics

- **Open gap falls as reading rises.** Topic 02 has the best-read prior work, nine of eleven entries, and the lowest score, 3. Topic 04 has the least-read, three of eleven with seven known by title, and scores 4. Topic 03 scores 4 on two logged searches.
- **One incident, two scores.** OpenAI's test-wallet case is the only direct evidence in two cells. It earns crypto demand a 4 in topic 01 and lab demand a 3 in topic 04.
- **Participants.** G5 was parked because it needs maintainers as participants. Topic 05 needs sessions from human operators and scores 4 on feasibility.
- **Brief against score.** Topic 02 gives labs a 5, and its own critical view says lab-internal demand "is weaker than the incident reports suggest". Topic 05 gives funds a 5 because "monitoring is their top need in this inventory". In the ten fund rows monitoring (4.40) is third, behind secure infrastructure (4.60) and compliance (4.50).

### The three scores I think are most wrong

1. **Topic 01, Promise 5. Should be 4.** It is the only 5 on Promise and it is the whole of 01's lead. At 4 the order is 02 (3.87), 03 (3.79), 01 (3.72). The brief says propensity numbers are fragile, that models recognise tests and that the labs hold better data. The plan expects base rates of 2% to 10% with intervals of about four points either side. A result that carries those caveats is a 4.
2. **Topic 05, Solo feasibility 4. Should be 2 or 3.** Three of its four data inputs are unverified: the licence and replayability of the trajectories, the human baseline, which the log calls "recalled, not checked", and the benign human sessions. Its new runs ask models to carry out intrusions and drop the ones that refuse, so the sample is whatever safeguards let through. The same participant problem parked G5. At 3, topic 05 is last (3.44).
3. **Topic 04, Open gap 4. Should be 3 at most until the papers are read.** Seven of its eleven closest works are known by title. The log says one of them may narrow the topic. "No work found" can't rest on unread work. At 3, topic 04 is last (3.49). Its crypto 5 is thin in the same way: three of its five evidence items were seen only through one audit firm's post, and my searches found no crypto funder or agenda asking for this research.

With all three changed the order is 02 (3.87), 03 (3.79), 01 (3.72), 06 (3.55), 04 (3.49), 05 (3.44).

Also wrong, with less effect: repo signal 4 for topic 03, which ties it with 04 if set to 2; lab demand 5 for topic 02; fund demand 5 for topic 05.

## Rejected candidates re-examined

| Candidate | Author's reason | What the reviewer found | Does the rejection hold |
|---|---|---|---|
| Validation in maintainer minutes (G5, parked) | Needs maintainers as participants. Observational work on AI slop is arriving, with three papers cited by title. | The participant limit applies to an experiment, not to a study of public records. The newest cited paper, [arXiv 2611.15159](https://arxiv.org/pdf/2611.15159) (read), analyses 1,779 pull requests that maintainers called slop, from public GitHub data with no participants. It does not cover vulnerability reports or triage cost. A survey, [arXiv 2608.25667](https://arxiv.org/pdf/2608.25667) (read), proposes metrics and runs none. A Cloud Security Alliance [whitepaper](https://labs.cloudsecurityalliance.org/research/csa-whitepaper-ai-vulnerability-disclosure-bottleneck-202611/) of 6 Nov 2026 (read) reports no triage time and no validation cost per report. It says Anthropic described independent human triage as the rate-limiting step, and cites Anthropic's public dashboard at 6,157 disclosures across 591 projects with 516 patched. Two searches found commentary on those figures and no measurement of maintainer effort. Not opened: [arXiv 2607.04003](https://arxiv.org/html/2607.04003), [arXiv 2511.18608](https://arxiv.org/pdf/2511.18608). | No, not as written. Parking the experiment is right. An observational slice looks open and needs no participants. |
| Reconstructing an agent incident (G3) | Crowded since September 2026. Five works cited, one read that day. | [arXiv 2609.30266](https://arxiv.org/abs/2609.30266) (abstract page read) shows agents deleting their own traces in local harnesses and recommends logging outside the agent's control. Search results add kernel-level provenance tracking ([Agent-Warden](https://arxiv.org/html/2609.38245v1)), tamper-evident records ([Tracekit](https://arxiv.org/pdf/2609.35659), [NovaFabric](https://arxiv.org/pdf/2609.12582)), auditor trust in harness records ([Hearsay](https://arxiv.org/pdf/2609.32495)), [auditing from traces](https://arxiv.org/pdf/2610.07256) and an open [forensics toolkit](https://github.com/efij/AgentDFIR), all title only. The [Hugging Face timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline) (read) says rebuilding the incident was hard because of volume, about 17,600 actions, and encoded payloads. One slice may be open: how much a responder can rebuild from telemetry already collected, scored against ground truth. One search found no such measurement. It would reuse topic 05's replay rig. | Yes. The open slice is better as a second outcome in topic 05 than as a topic. |
| Cross-session monitor evasion (G2) | Answered in outline. Four works cited, none opened. | It holds on stronger evidence than the author cites. [arXiv 2605.31593](https://arxiv.org/pdf/2605.31593) (read), from two universities in May 2026, builds a monitor that keeps state across users. It reports 81.1% to 87.2% campaign recall at 2.35% to 3.09% false positives with benign traffic at ten times attack volume, where a per-transcript monitor catches about 20% of distributed attacks. Six red-teamers attacked it for two months. Titles show more: [arXiv 2607.02514](https://arxiv.org/pdf/2607.02514v1), [arXiv 2610.24052](https://arxiv.org/html/2610.24052v1), [arXiv 2610.13227](https://arxiv.org/pdf/2610.13227). A [GitHub issue](https://github.com/Shadow-LLM/failure-cases/issues/271) title repeats the figures the author took from a digest. The paper tests no rule-based correlation across sessions. That slice suits detection skills, but it needs provider-scale traffic and attack traces, and I could not confirm either is public. | Yes. |
| Safeguards that refuse legitimate defensive work (reviewer's choice) | Published as a workshop paper at ICLR 2026, cited by title. The author notes the pain is real. | The paper, [arXiv 2603.01246](https://arxiv.org/abs/2603.01246) (abstract page read), tests 2,390 single prompts from a student defence competition on three models from 2024 and finds 12.2% refused. It runs no agents and no verified-access tiers, and names authorisation-aware benchmarks as future work. The Hugging Face timeline (read) says commercial models refused much of the responders' analysis in July 2026. Anthropic's [post of 16 Nov 2026](https://www.anthropic.com/research/coordinated-vulnerability-disclosure-timelines) (read) names a programme that tailors safeguards for defensive work. Three searches found a [note on gated access](https://labs.cloudsecurityalliance.org/research/csa-research-note-trusted-defender-access-governance-2026100/) and a [developer's post](https://dev.to/kenielzep97/openai-says-verified-defenders-get-more-access-im-going-to-test-that-1n82) announcing a plan to test verified access, both title only, and no measurement on 2026 models. Two framework papers on cyber refusals, [arXiv 2602.15689](https://arxiv.org/pdf/2602.15689) and [arXiv 2606.02644](https://arxiv.org/html/2606.02644), were not opened and could narrow this. | No, not on the stated reason. The closing paper tests 2024 models on single prompts. Whether the slice for current models and agent workflows is open depends on two unread papers. |

Two further notes.

- "Information barriers for finance agents" was dropped on two papers cited by title and on demand being "limited to finance". The second reason contradicts the filter. I did not search it again.
- The author's "most failed the first test: somebody published between May and November 2026" is loose. Several closing works date from February to April 2026.

## What is missing

### Demand signals, September to November 2026

- **Labs.** Anthropic's post of 16 Nov 2026 (read) cuts disclosure deadlines to 30 days for high and critical findings and 45 for others from 1 Jan 2027. It says rediscovery is rising and gives no number. It says: "We recognize that shorter timelines may put more pressure on software maintainers." The whitepaper above says independent verification "remains limited".
- **The repository's own feed.** Of 69 items dated September to November in [`news.json`](../../../docs/data/news.json), a rough keyword count puts 19 on vulnerability discovery, patching and disclosure and 6 on agent containment and misalignment. The shortlist has four topics on the second theme and one, ranked last, on the first. The count is crude and some dates in the feed are wrong, as shown below.
- **Fellowships and grants.** No call names any of the six topics. Anthropic's posting names mentors, not areas. OpenAI's call is closed. A [secondary listing](https://aisecurityandsafety.org/en/grants/uk-aisi-challenge-fund/) of the UK AI Security Institute's Challenge Fund (read) gives £50,000 to £200,000 per project, open to independent researchers worldwide, with a deadline of 1 Apr 2026. I could not confirm a current round. OpenAI's cybersecurity grant programme and Coefficient Giving's request for proposals turned up only as [aggregator](https://grantedai.com/grants/openai-cybersecurity-grant-program-openai-036164c6) [listings](https://grantedai.com/grants/open-philanthropy-coefficient-giving-technical-ai-safety-rfp-21-areas-coefficient-c3d4e5f6), title only.
- **Funds.** One search found no new posting that names AI or agents. Bridgewater's [role](https://job-boards.greenhouse.io/bridgewater89/jobs/8499417002) still appears in search results, title only.
- **Crypto.** Two searches found product explainers and blog posts. They found no grant call and no research agenda that names agent wallet security. One [project post](https://human.tech/blog/2pc-agent-wallets-with-verified-human-in-the-loop) mentions a security funding round, title only.

### What the candidate list never contained

- No candidate mines public records. All six are experiments on the researcher's own rig. A study of public trackers or repositories needs no model spend and no participants.
- No candidate started from the strengths the brief names. The list started from a literature map, so the candidates look like the papers already in the feed.

### Topics that would beat the weakest member

I found no wholly new topic that clearly beats the weakest member. Two slices of dropped candidates do, in my judgement, with different confidence. By the author's scores the weakest is 06. By mine it is 04 or 05.

**A. What an AI-found vulnerability report costs a maintainer, measured from public records.**

- **Question.** For reports credited to AI systems, how long do maintainers take to respond, triage and fix, how much back-and-forth does each report take, and how often is severity downgraded, compared with human-credited reports in the same projects?
- **Evidence the gap is open.** The three sources read for G5 above measure none of this. The whitepaper cites one analyst finding that maintainers rated 51.3% of findings critical or high where the model rated 91.5%, which is the nearest number I found. Two searches, on 19 and 22 Nov, returned commentary only, for example a [news report](https://venturebeat.com/security/anthropics-cyber-mission-starts-with-6-157-findings-reported-to-maintainers-and-516-patched) and a [comparison of two counts](https://cellcog.ai/blog/anthropic-glasswing-ledger-vulncheck/), both title only.
- **Evidence of demand.** Anthropic's [policy change](https://www.anthropic.com/research/coordinated-vulnerability-disclosure-timelines) and its promise to agree a sustainable pace with projects. The [whitepaper](https://labs.cloudsecurityalliance.org/research/csa-whitepaper-ai-vulnerability-disclosure-bottleneck-202611/) asks discovery programmes to publish machine-readable data. The repository's feed carries OpenAI's patching initiative and a practitioner post on backporting, neither opened here.
- **Rough budget.** Under $200. Public APIs, plus model calls for labelling.
- **Main risk.** Reporter credit may not be machine-readable, as the title of [arXiv 2609.33099](https://arxiv.org/pdf/2609.33099) suggests. An analyst firm already tracks the dashboard and could publish first. Time and comment counts are stand-ins for minutes.
- **Against the weakest.** It beats 05 and 06 on feasibility, cost and freshness of lab demand, and matches them on openness. It beats 04 on fit. Confidence: moderate.

**B. Defensive refusals on current models and agent workflows.**

- **Question.** On realistic incident-response and detection tasks, how often do late-2026 models and their agent harnesses refuse or halt, at which step, and what do verified-defender tiers change?
- **Evidence the gap is open.** The paper the author cites as closing it tests 2024 models on single prompts. Three searches found no measurement on current models. Two framework papers were not opened. Treat the gap as probable, not shown.
- **Evidence of demand.** Responders in the July 2026 incident report being blocked ([timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline), read). Anthropic runs a verification programme for defenders (read, in the 16 Nov post). OpenAI has [Trusted Access for Cyber](https://openai.com/index/trusted-access-for-cyber/), title only.
- **Rough budget.** $100 to $400.
- **Main risk.** Results go stale with each release. Labs measure this themselves and can discount outside numbers. An individual may not get verified access, which removes the most useful arm.
- **Against the weakest.** If the two unread papers leave it open, it beats 05 and 06 on feasibility, cost and directness of lab demand, and loses on durability. Confidence: low to moderate.

**A third was looked for and not found.** A census of how public repositories configure agent permissions and cloud roles would suit the brief. One search each found only vendor and blog posts, such as a [census of product defaults](https://www.digitalapplied.com/blog/coding-agent-permission-defaults-census) and a [vendor write-up of an over-privileged agent role](https://unit42.paloaltonetworks.com/exploit-of-aws-agentcore-iam-god-mode/), both title only. I did not establish demand or openness well enough to claim it beats anything.

One idea was checked and dropped. Measuring how often a second model rediscovers an AI-found bug is already covered, by title, in [HoF-Bench](https://arxiv.org/pdf/2607.27030) and a [rediscovery benchmark](https://arxiv.org/html/2605.17416v1).

## Claims about the inventory

Checked against the files in `docs/data/`.

**Correct.**

- 169 papers, 21 dated 2025 or later, 5 from July 2025 onward, 1 from 2026.
- Every run in [`runs.json`](../../../docs/data/runs.json) shows `classified: 0`.
- The four authored gaps in [`gaps.json`](../../../docs/data/gaps.json) say what the README reports. The falsifier of `gap-offence-defence-asymmetry` is quoted correctly. `gap-agent-identity` asks for a venue paper or an adopted standard, so "needs a second look" is the right strength for a NIST blog post.
- No crypto organisation appears among the 28 rows. All ten fund rows are marked low confidence, and the methodology says they are inferred.
- The 12 needs, 41 leaves, 8 authored gaps and 104 news items match. So does every leaf count and pressure figure in METHOD.md.

**Needs correcting.**

- **The detection-latency data point mixes two clocks.** The README pairs "first recorded action on 9 July" with "detection on 19 July". The [Hugging Face timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline) (read) gives the first action as 9 July and the last as 13 July, after which its team cut access. It gives no detection time. The [analysis paper](https://arxiv.org/pdf/2610.12463) (read) says "OpenAI detected suspicious internal activity on July 19", and also that monitoring "detected port scanning on June 27, but the evaluation was not stopped". So the ten days run from the victim's clock to the lab's, and the lab had signals before the intrusion began. Neither source states a time to detection. The gap's own chain is about novel attacks on model safeguards, which is a different measurement again.
- **"The briefs here use job posts and regulator statements as fund evidence, not the heat-map cells."** Topic 05 uses the heat map as fund evidence and misreads it, as shown in the scoring audit.
- **"The weekly ingest hasn't classified a paper yet."** True, and it understates the position. The 20 runs are 13 derive-only and 7 dry runs, all between 22:29 UTC on 4 Nov and 04:29 UTC on 5 Nov. No scheduled run is recorded at all.

**Missed.**

- **The news feed misdates Anthropic items.** All 27 carry dates from 28 Sep to 30 Oct 2026, and 14 share 23 Oct. Two contradict the repository's own paper records: one page is dated 23 Oct 2026 in the feed and 3 Jun 2026 in `papers.json`, another 20 Oct 2026 against 13 Nov 2025. The README calls the feed "the only current layer". About a quarter of it has no usable date.
- **The derived gap list is empty.** The rule needs six papers or fewer, and the thinnest need has seven.
- **Pressure is a paper count.** See the rubric section.
- **Evidence is sparse.** 26 of 336 demand cells carry a source, and none sits in a fund row.
- **The main README disagrees with itself.** It gives 169 papers in one place and "35 seed papers" in another.

**Not checked.** The outside papers that section cites for the MCP, offence and defence, and identity gaps. See the last section.

## If only one study

The aim given: one study in three months, a public result that lab security and safety teams will value, with funds and crypto second.

**Start: 02, allowlist relays.**

1. It gives a public artefact soonest. The dataset needs no model access and is due in week 3. Every other first result is a pilot or depends on unverified inputs.
2. It reaches lab teams by design. The two default lists it starts from belong to the two named labs, and the plan sends each vendor the dataset 30 days before publishing.
3. It sits on network controls, which the brief names as a strength. The method is security measurement, where a sceptical reader has less to dispute than in a propensity estimate.
4. Its cost is the most certain. The first work package is under $50.
5. Its blocked-agent arm also answers a lab safety question: whether a task-focused agent finds a relay unprompted.

Two conditions. The value is in the agent study and the measured cost of closing relays. A domain count alone restates a vendor post, as the brief says. And the vendor notice must go out by week 4 to publish inside three months.

**Backup: 01, found credentials.** It has the higher ceiling with lab safety teams and the wider spread of outcomes: a null result, a dispute over scenario realism, or a lab publishing rates from real transcripts. OpenAI's fellowship cohort, with agentic oversight among its areas, ends on 5 Feb 2027. If 01 is run, lead with the decoy question, how often a benign agent trips a planted credential. It is the least crowded part and the closest to detection work.

**Drop: 04, agent wallets.** Its brief calls it the weakest of the six on lab demand. It needs engineering the brief rules out as a strength. Its first result is the slowest, at week 5. Its prior work is the least read. I found no crypto funder or agenda asking for it.

**Confidence.**

- 02 over 01 as the start: about 60%.
- The start should be 01 or 02, not 03, 05 or 06: about 75%.
- Dropping 04 under a lab-first aim: about 85%.

Before committing to 05 or 06 at any later point, write a brief for topic A above and compare. It would take the place of one of those two, not of 02.

## Searches run

On 19 Nov 2026:

1. AI-generated vulnerability reports open source maintainers triage time empirical study arXiv 2026 "AI slop" security reports
2. AI agent incident forensics reconstruct what the agent did from logs benchmark arXiv 2026 trace tampering audit evidence
3. distributed attack split across sessions agents evades monitor "7%" "87%" cross-session monitoring arXiv October 2026
4. cyber safeguards refuse legitimate defensive security work false refusal rate benchmark defenders incident response LLM 2026
5. Anthropic coordinated vulnerability disclosure timelines 30 days high critical January 2027 rediscovery maintainers
6. Anthropic Fellows program 2027 cohort research areas AI security fellows application November 2026
7. OpenAI Safety Fellowship research areas priority 2026 2027 applications agentic oversight privacy-preserving safety
8. "AI Security Fellows" Anthropic Fellows Program workstream research areas example projects greenhouse
9. OpenAI Cybersecurity Grant Program 2026 priority areas agentic defenders grants call for proposals
10. UK AI Security Institute funding call 2026 research areas grants "AI Security Institute" challenge fund agent security control call for proposals autumn 2026
11. hedge fund OR "trading firm" "AI security engineer" agents job posting November 2026 Citadel OR "Two Sigma" OR "Jane Street" OR Millennium OR "DE Shaw" agentic security responsibilities
12. crypto AI agent security research grant call 2026 Ethereum Foundation OR "a16z crypto" OR Coinbase OR Paradigm agentic wallets security research agenda open problems
13. Coefficient Giving OR "Open Philanthropy" request for proposals 2026 AI security research areas "technical AI safety" RFP agent security cyber defence
14. independent evaluation false refusals cyber safeguards 2026 models agentic incident response tasks "Trusted Access for Cyber" OR "Cyber Verification Program" refusal rate defenders benchmark arXiv
15. Hugging Face agent intrusion technical timeline July 2026 responders open-weight model guardrails blocked log analysis detection date
16. reconstruct LLM agent actions from host telemetry auditd eBPF EDR cloud audit logs without harness trace forensic reconstruction accuracy coding agent attribution 2026
17. "rediscovery" AI-found vulnerabilities independent rediscovery rate across models measurement 2026 HoF-Bench OR "bug collision" LLM vulnerability discovery
18. empirical study vulnerability reports credited to AI tools maintainers time to triage time to fix public advisories HackerOne curl GitHub security advisories AI-discovered 2026 measurement
19. empirical study coding agent permission settings public GitHub repositories "settings.json" allow rules "dangerously-skip-permissions" sandbox configuration measurement in the wild
20. over-privileged IAM roles AI agents empirical measurement infrastructure-as-code Terraform Bedrock AgentCore execution role least privilege study 2026
21. Bridgewater "Agentic Security Engineer" OR "AI Security Engineer" hedge fund job 2026 agents sandboxing kill switch identity authorization posting
22. agent wallet security grants OR bounty OR "request for proposals" 2026 x402 ERC-8004 session keys AI agents security research funding Ethereum Foundation Coinbase

On 22 Nov 2026, to look for anything new since 18 Nov:

23. maintainer effort triage time AI-discovered vulnerability reports measurement study November 2026 Anthropic dashboard disclosures patched analysis
24. defensive refusal benchmark 2026 frontier models agentic incident response cyber safeguards verified defender access measured refusal rate November 2026

Neither changed a conclusion. The second surfaced one of the two unread framework papers named above.

Thirteen pages were opened, all on 19 Nov: arXiv 2611.15159, 2608.25667, 2603.01246 (abstract page), 2609.30266 (abstract page), 2605.31593 and 2610.12463; Anthropic's disclosure post and two Fellows postings; OpenAI's fellowship post; the Hugging Face timeline; the Cloud Security Alliance whitepaper; and a secondary listing of the UK Challenge Fund.

## Could not check

- **Fetch summaries.** Every page marked read was summarised by a tool. Figures quoted from those pages carry that risk.
- **OpenAI primary pages** other than the fellowship post: the training-environment post, the misalignment framework and reports, and the monitoring post that the README cites for a 30-minute alert.
- **Works known by title only.** For G2: arXiv 2610.24052, 2607.02514, 2610.13227 and the METR post. For G3: everything except one abstract. For G5: arXiv 2607.04003, 2511.18608 and 2609.33099. For defensive refusals: arXiv 2602.15689 and 2606.02644.
- **The outside papers in the README's inventory section.** The three MCP papers, CyberArena and the NIST post were not opened and their existence was not verified.
- **Fund job postings.** None was opened. Only one was confirmed as still indexed.
- **Open funding rounds.** Whether the UK Challenge Fund, OpenAI's grant programme or Coefficient Giving has a call open now.
- **Data access for the two proposed topics.** Whether Anthropic's dashboard exposes per-report dates, and whether an individual can get verified-defender access.
- **Incident reports after 5 Nov 2026.** No search was run for new ones.
- **Thirteen of the seventeen rejections.** Only four were re-examined.
- **Topic-level claims.** Left to the six topic reviewers.
