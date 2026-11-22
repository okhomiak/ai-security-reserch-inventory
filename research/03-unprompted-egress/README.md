# 03 · What leaves the box unprompted: third-party data flows from coding agents

Status: draft brief, 18 Nov 2026. Ranked 3 of 6, score 3.79 out of 5. Not yet run.

## The question

With no attacker involved, what private code, identifiers and secrets do coding agents send to parties other
than the model provider during ordinary work? How often, to whom, and which settings stop it?

## The evidence, as a chain

1. **Finance is adopting agents faster than it can describe their data flows.** A Bank of England and FCA
   survey found 80% of responding firms have deployed AI agents, with data security and third-party
   dependencies among the stated concerns
   ([Cointelegraph via TradingView](https://www.tradingview.com/news/cointelegraph:f53e6b324094b:0-banks-are-banning-ai-agents-over-security-and-competition-concerns/)).
   One large fund reports token use up 86 times since January as agents run research
   ([Man Group](https://www.man.com/insights/what-ai-can-do-for-alpha)). For a trading firm the code is the
   asset, and firms go to court over it
   ([Reuters via Yahoo](https://sg.finance.yahoo.com/news/big-hedge-fund-firm-millennium-211406415.html)).
2. **The only cross-product evidence is a reading of the paperwork.** A privacy scorecard rates five coding
   assistants on 14 criteria using policies, contracts and documentation. Its author calls it "strictly
   document-focused". It captures no traffic
   ([arXiv 2509.20388](https://arxiv.org/abs/2509.20388)).
3. **The leak paths are known one at a time.** A study of one harness lists 15 routes by which protected files
   can reach an agent's context and finds 5 covered by neither permission rules nor the sandbox; it stops at
   the context window and doesn't follow the data onto the network
   ([arXiv 2609.35557](https://arxiv.org/abs/2609.35557)). Vendor documentation describes flows that bypass
   the session proxy, such as a telemetry export
   ([Claude Code docs](https://code.claude.com/docs/en/cloud-environments.md)). Incident write-ups show data
   leaving through DNS lookups, link previews and shared sandbox storage (digest only; see the log).
4. **Agents reach for the network on ordinary tasks.** They search the web for error messages, fetch
   documentation, install packages and call connectors. Each of those sends something derived from the
   workspace to someone who isn't the model provider and isn't covered by its contract.
5. **Gap.** Nobody has published a network-level measurement, with planted markers, of what coding agents send
   to third parties during routine work, across products and settings.

Step 4 is an expectation, not a citation. Establishing whether it holds, and how often, is the study.

## Who's asking

- **Hedge funds, trading firms and banks.** This is the first question a risk committee asks before approving
  a coding agent, and today the answer is a vendor's policy page. Arrowstreet hires for secure execution
  environments for agents
  ([posting](https://www.tealhq.com/job/senior-ai-security-engineer_7ea1a804ecdf46d45cedece6212477c5ac707)),
  and Citadel Securities has spoken publicly about security and data permissions for agents in trading
  workflows
  ([conference recap](https://www.citadelsecurities.com/news-and-insights/future-of-global-markets-2026-conference/technology-scale-execution/)).
  US bank supervisors issued a framework covering agentic systems on 4 Nov 2026 (reported in the Cointelegraph
  piece above).
- **Frontier labs.** Indirect. Enterprise trust is what sells their coding products, and an independent
  measurement either supports their claims or finds something they'd want fixed. Google Research lists
  agentic privacy as an open problem
  ([post, 5 Oct 2026](https://research.google/blog/open-and-emergent-problems-in-agentic-privacy-and-security-a-contextual-angle/),
  in this repo's news feed, not opened).
- **Crypto.** Repositories hold keys and seed phrases. A search query that contains one is a loss.

## The critical view

**The strongest argument against.** Large firms already handle this with egress proxies, enterprise tiers and
contracts, so the result may tell them nothing new. Findings will be specific to a product version and stale
within months. Labs may read it as a compliance note, not research. And if the honest answer is "almost
nothing goes anywhere but the model provider", the paper is a reassuring footnote.

**Why it may still be worth doing.** Nobody has the denominator. A reassuring footnote with numbers is
exactly what a risk committee lacks. Third-party flows through search and package lookups sit outside the
provider's contract, which is where the paperwork stops helping. And the method can be rerun on every
release, which suits a repository that already refreshes weekly.

**What would make this worthless.**

- Vendors publishing audited data-flow maps per product.
- A privacy-measurement group publishing the same study with more products. They have the tooling.
- Certificate pinning that hides the traffic of the products that matter most.
- Tools that run on the provider's servers. A server-side web search never appears on the local wire, so a
  local capture undercounts by design.

**Scoop risk: medium.** It isn't glamorous, which protects it. But it's an obvious study for a measurement
lab.

**What isn't known yet.** Which products can be observed without breaking their terms. How to trigger
realistic tool use without scripting the agent into it. Whether a marker in a comment is treated like real
code.

## What would close it

- **Closes when:** a published study captures the network traffic of at least five coding agents on a shared
  task set with planted markers, and reports third-party flows by destination class and by setting.
- **Blocked by:** it's dull, product-specific work that ages fast, and vendors have no reason to commission
  it across competitors.
- **Falsifier:** a cross-product traffic measurement of coding agents, from anyone.

## Scores

| Criterion | Score | Reason |
|---|---|---|
| Open gap | 4 | The closest cross-product work is document-based and the closest technical work stops at the context window. |
| Demand: labs | 3 | Indirect, through enterprise trust. |
| Demand: funds | 5 | Code confidentiality is the core concern, and adoption is already high. |
| Demand: crypto | 3 | Keys in repositories. |
| Promise | 3 | High practical use, modest research prestige, and a real chance of a dull result. |
| Solo feasibility | 5 | Own machines, own traffic, synthetic code. |
| Budget | 3 | $300 to $900, mostly subscriptions and API use across several products. |
| Durability | 3 | Unglamorous, but an easy study for a measurement group. |
| Repo signal | 4 | Mapped needs average a pressure of 0.311, though neither need fits well. |

## Where it sits in this inventory

- **Needs:** `n.privacy` (mean demand 3.39, 14 of 28 organisations at 4+, 23 papers) and `n.secure_infra`
  (3.86, 19 of 28, 7 papers). Neither fits. What a customer's workspace tells third parties is a
  data-governance need that the twelve columns don't have.
- **Leaves:** `infra.serving` (5 papers), `attack.privacy` (12), `gov.transparency` (12).
- **Authored gap:** `gap-compliance-evidence` is the nearest. This topic would produce the kind of evidence a
  third party can check.
- **Closest papers already in the inventory:** Privacy Side Channels in Machine Learning Systems
  (`arxiv:2309.05610`). Nothing on coding-agent data flows.

## If it works

A capture harness, a generator for marked repositories, and a table per product and setting that can be
rerun on each release. For a fund, it turns a vendor's promise into something measured.

See [prior-work.md](prior-work.md) for what was checked and [plan.md](plan.md) for the draft study.
