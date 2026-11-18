# Method: how the six topics were picked and scored

Written 18 Nov 2026. This file says what went in, how candidates were filtered, how the survivors were
scored, and where the method is weak.

## What went in

- **This repository's data**, as of `derived.json` generated 2026-11-05: the 12 needs with mean demand,
  organisations at 4+, coverage and pressure; the 41 taxonomy leaves with paper counts; the 8 authored gaps;
  the 104-item news feed.
- **Fresh web searches on 18 Nov 2026**, about 40 queries, listed per topic in each `prior-work.md`.
- **An earlier nine-gap list** from a literature map built on 2 to 4 Nov 2026. Four of those nine survive
  here in some form. [REJECTED.md](REJECTED.md) says what happened to the rest.

## How candidates were filtered

About 23 candidates were written down. Each had to pass four tests, in this order:

1. **Still open.** A targeted search had to fail to find work that answers the question. Where a close paper
   existed, it had to leave the question open in its own words or by its design.
2. **Somebody is asking.** At least one of frontier labs, hedge funds and trading firms, or crypto had to show
   demand through an incident report, a shipped product, a job post or a published agenda.
3. **One person can do it.** No privileged model access, no human subjects, no employer or client data, no
   special hardware.
4. **Cheap.** A full study under about $2,000, with a first result for far less.

Seventeen failed. Most failed the first test: somebody published between May and November 2026.

## The rubric

| Criterion | Weight | What a 5 means | What a 1 means |
|---|---|---|---|
| Open gap | 20% | No work found that answers the question; the closest work names it as future work | A paper already answers it |
| Demand | 20% | The strongest group has incidents, products or roles on exactly this | Mentioned in passing |
| Promise | 20% | A result changes a deployment decision and leaves an artefact others reuse | A footnote |
| Solo feasibility | 15% | One person, part-time, public tools and data | Needs a team, a lab or participants |
| Budget | 10% | Under $300 | Over $2,000 |
| Durability | 10% | Low chance the same study appears before a first result | Several groups are visibly on it |
| Repo signal | 5% | Mean pressure of the mapped needs is 0.40 or more | Under 0.10 |

Two rules need spelling out.

- **Demand** is scored per group (labs, funds, crypto) and combined as 0.6 times the strongest group plus 0.4
  times the mean of the other two. The request was for demand from any of the three, so one strong group
  should carry most of the score.
- **Repo signal** is the mean `pressure` of the mapped needs in `derived.json`, bucketed: 0.40 and up is 5,
  0.25 to 0.40 is 4, 0.15 to 0.25 is 3, 0.10 to 0.15 is 2, below 0.10 is 1. It gets only 5% because the corpus
  behind it is thin after mid-2025 and has no crypto organisations.

Budget buckets: under $300 is 5, $300 to $700 is 4, $700 to $1,200 is 3, $1,200 to $2,000 is 2, more is 1. The
top of each topic's range decides the bucket.

## The scores

| Topic | Open gap | Labs | Funds | Crypto | Demand | Promise | Feasible | Budget | Durable | Repo | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 Found credentials | 4 | 5 | 4 | 4 | 4.6 | 5 | 4 | 3 | 2 | 2 | **3.92** |
| 02 Allowlist relays | 3 | 5 | 5 | 3 | 4.6 | 4 | 5 | 4 | 2 | 4 | **3.87** |
| 03 Unprompted egress | 4 | 3 | 5 | 3 | 4.2 | 3 | 5 | 3 | 3 | 4 | **3.79** |
| 04 Agent wallets | 4 | 3 | 3 | 5 | 4.2 | 4 | 3 | 4 | 3 | 2 | **3.69** |
| 05 Detection coverage | 3 | 3 | 5 | 3 | 4.2 | 4 | 4 | 4 | 2 | 3 | **3.59** |
| 06 Threat model as input | 4 | 4 | 4 | 4 | 4.0 | 4 | 4 | 2 | 3 | 1 | **3.55** |

Total = 0.20 x open + 0.20 x demand + 0.20 x promise + 0.15 x feasible + 0.10 x budget + 0.10 x durable +
0.05 x repo. Each brief gives the reason for every score.

## Sensitivity

The order under different weightings. Changes are made one at a time.

| Change | Order |
|---|---|
| Base | 01 (3.92), 02 (3.87), 03 (3.79), 04 (3.69), 05 (3.59), 06 (3.55) |
| Durability doubled, taken from promise | 03, 02, 01, 04, 06, 05 |
| Budget doubled, taken from promise | 02, 03, 01, 04, 05, 06 |
| Open gap raised to 30%, demand cut to 10% | 01, 03, 02, 04, 06, 05 |
| Only lab demand counts | 01, 02, then 06 and 03 level, 04, 05 |
| Only fund demand counts | 02 and 03 level, 01, 05, 06, 04 |
| Only crypto demand counts | 04, 01, then 06, 02 and 03 level, 05 |
| Repo signal removed, its 5% split between open gap and demand | 01, 02, 04, 03, 06, 05 |

Topic 01 or 02 leads in six of the eight rows. Topic 05 or 06 is last in seven. Treat the list as three
bands: 01 and 02; then 03 and 04; then 05 and 06.

## Repo metrics behind the mapping

From `derived.json` (generated 2026-11-05) and the taxonomy counts in `papers.json`.

| Topic | Mapped needs: mean demand, organisations at 4+, papers, pressure | Thin leaves it touches (papers) | Mean pressure |
|---|---|---|---|
| 01 | `n.identity`: 3.50, 18 of 28, 20, 0.167. `n.agent_sec`: 3.82, 17 of 28, 49, 0.076 | `infra.identity` (4), `agent.authz` (18) | 0.121 |
| 02 | `n.agent_sec`: 3.82, 17 of 28, 49, 0.076. `n.secure_infra`: 3.86, 19 of 28, 7, 0.482 | `agent.sandbox` (5), `infra.serving` (5) | 0.279 |
| 03 | `n.privacy`: 3.39, 14 of 28, 23, 0.141. `n.secure_infra`: 3.86, 19 of 28, 7, 0.482 | `infra.serving` (5), `attack.privacy` (12) | 0.311 |
| 04 | `n.identity`: 3.50, 18 of 28, 20, 0.167. `n.agent_sec`: 3.82, 17 of 28, 49, 0.076 | `infra.identity` (4), `agent.authz` (18) | 0.121 |
| 05 | `n.monitoring`: 4.25, 24 of 28, 14, 0.283. `n.offensive`: 3.21, 12 of 28, 40, 0.078 | `cyber.defense` (6), `defense.monitoring` (12) | 0.180 |
| 06 | `n.evals`: 3.29, 9 of 28, 61, 0.053. `n.offensive`: 3.21, 12 of 28, 40, 0.078 | `cyber.vulndiscovery` (6), `cyber.defense` (6) | 0.066 |

Topic 03 has no need column that fits. What a customer's code tells third parties is a data-governance
question, and the twelve needs don't have one. The methodology in `companies.json` names this bias itself:
a demand that doesn't map onto a column is invisible.

## Demand evidence, by group

Each brief cites its own evidence. This is the shared base.

**Frontier labs**

- OpenAI moved frontier training offline after a model exploited a DNS resolver misconfiguration on 20 Sep
  2026, and says its red-team agents "found vulnerabilities in almost every one of these services"
  ([post, 23 Oct 2026](https://openai.com/index/securing-our-frontier-model-training-environment/)).
- OpenAI now publishes misalignment reports under a
  [framework](https://openai.com/index/model-misalignment-reporting-framework/) launched in September 2026.
  They include a model that searched GitHub for leaked API keys
  ([SecurityWeek](https://www.securityweek.com/openai-says-its-models-hunted-github-for-leaked-api-keys-during-training/))
  and one that spent from a test wallet it derived keys for
  ([Decrypt](https://decrypt.co/381123/openai-model-used-testnet-ethereum-wallet-without-permission-to-finish-coding-task)).
- Anthropic and Google both had evaluation models reach live systems in 2026
  ([analysis of the three labs' incidents](https://arxiv.org/abs/2610.12463)).
- Anthropic cut its disclosure deadline to 30 days for high and critical findings from 1 Jan 2027, citing
  rediscovery by other models
  ([policy, 16 Nov 2026](https://www.anthropic.com/research/coordinated-vulnerability-disclosure-timelines)).
- A field-wide agenda from RAND, Irregular, Redwood and others ranks agent permission frameworks in its top
  three by importance and lists threat modelling of AI attacking its host infrastructure as a priority
  ([arXiv 2607.26069](https://arxiv.org/abs/2607.26069)).

**Hedge funds, trading firms and banks**

- Bridgewater's Staff AI Agentic Security Engineer role ($450k to $600k) covers identity and authorisation for
  agents, kill switches, sandboxing and agent red-teaming
  ([posting](https://job-boards.greenhouse.io/bridgewater89/jobs/8499417002)).
- Hudson River Trading's Security Engineering Lead owns AI security: agents, sandboxing, guardrails, MCP
  security, IAM and PKI
  ([posting](https://www.tealhq.com/job/security-engineering-lead_7ea1ad642ed4a6ed1555c41d775a291811d04)).
- Point72 hires a GenAI Security Engineer for agentic systems
  ([posting](https://job-boards.greenhouse.io/point72/jobs/8399360002)), Arrowstreet a Senior AI Security
  Engineer for secure execution environments
  ([posting](https://www.tealhq.com/job/senior-ai-security-engineer_7ea1a804ecdf46d45cedece6212477c5ac707)),
  and Jane Street a threat-modelling engineer
  ([posting](https://resumegeni.com/jobs/cybersecurity-engineer-threat-modelling-janestreet-fab65ab964)).
- A Bank of England and FCA survey found 80% of responding firms have deployed AI agents and 2% use agents with
  broad autonomy; five UK banks restrict third-party agents on customer accounts
  ([Cointelegraph via TradingView](https://www.tradingview.com/news/cointelegraph:f53e6b324094b:0-banks-are-banning-ai-agents-over-security-and-competition-concerns/)).
- The Bank of England's deputy governor said in June 2026 that "our frameworks were not built to contemplate
  autonomous agents"
  ([Tech Times](https://www.techtimes.com/articles/319549/20260702/half-finance-firms-run-autonomous-ai-traders-bank-england-proposes-market-kill-switch.htm)).

The job postings were read on 2 to 4 Nov 2026 and not reopened on 18 Nov. Postings expire.

**Crypto**

- Coinbase ships Agentic Wallets with a
  [policy engine](https://docs.cdp.coinbase.com/server-wallets/v2/policies/overview).
- A systematisation of agentic commerce security says "financial-agent benchmarks remain weak"
  ([arXiv 2604.15367](https://arxiv.org/abs/2604.15367)).
- Malicious LLM routers drained one client's wallet of $500,000
  ([CoinDesk on arXiv 2604.08407](https://www.coindesk.com/tech/2026/04/13/ai-agents-are-set-to-power-crypto-payments-but-a-hidden-flaw-could-expose-wallets)).
- An audit firm's 2026 guidance lists signing authority without hard limits among the main risks
  ([Sherlock](https://sherlock.xyz/post/agentic-ai-security-risks-in-web3-what-protocols-need-to-know-in-2026)).

## Limits of this review

- **The scores are one person's judgement, assisted by a model.** They aren't measurements. The demand cells
  in `companies.json` carry the same warning.
- **Search is not proof of absence.** "No work found" means about 40 queries on one day didn't find it.
  Preprints from the week before are the likeliest misses.
- **Not everything was read in full.** Each `prior-work.md` marks entries as read, digest or title. Most
  primary pages on `alignment.openai.com` could not be opened and are cited through digests and news reports.
- **The earlier list didn't survive a harder search.** Of the nine gaps written down on 4 Nov 2026, five were
  dropped here two weeks later. Most of the work that closed them was already out and the first search had
  missed it. Expect this review to have misses too, and recheck before committing time.
- **Job posts and regulator speeches show interest, not budgets.** Fund demand in particular is inferred from
  hiring.
- **No crypto organisations in the repo's demand map.** Crypto demand comes only from the sources cited here.
