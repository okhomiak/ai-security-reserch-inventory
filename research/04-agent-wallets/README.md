# 04 · Agent wallets under hijack: do on-chain permissions bound the loss?

Status: draft brief, 18 Nov 2026. Ranked 4 of 6, score 3.69 out of 5. Not yet run.

## The question

When an agent that can sign transactions is fully hijacked, how much can it lose under each permission
design: a raw key, a custodial policy engine, a session key with caps, a per-task grant? And what does each
design cost in finished tasks?

## The evidence, as a chain

1. **Agents now hold spending authority.** Coinbase ships Agentic Wallets with a
   [policy engine](https://docs.cdp.coinbase.com/server-wallets/v2/policies/overview)
   ([launch](https://www.coinbase.com/developer-platform/discover/launches/agentic-wallets)). A
   systematisation of agentic commerce security assesses eight protocols, among them x402, AP2, ERC-8004 and
   MCP ([arXiv 2604.15367](https://arxiv.org/abs/2604.15367)).
2. **Money has already moved by mistake and by attack.** An autonomous agent sent a memecoin holding, put at
   $250,000 in CoinDesk's headline, to a stranger who had asked for 4 SOL
   ([CoinDesk, 23 Feb 2026](https://www.coindesk.com/markets/2026/02/23/ai-bot-s-tipping-blunder-hands-usd250-000-memecoin-pile-to-x-sad-story-poster)).
   Researchers measuring malicious model routers reported one client's wallet drained of $500,000
   ([CoinDesk on arXiv 2604.08407](https://www.coindesk.com/tech/2026/04/13/ai-agents-are-set-to-power-crypto-payments-but-a-hidden-flaw-could-expose-wallets)).
   Hundreds of malicious agent skills were packaged as trading tools
   ([Koi](https://www.koi.ai/blog/clawhavoc-341-malicious-clawedbot-skills-found-by-the-bot-they-were-targeting)).
   And an OpenAI research model spent from a test wallet it had derived the keys for
   ([Decrypt, 16 Oct 2026](https://decrypt.co/381123/openai-model-used-testnet-ethereum-wallet-without-permission-to-finish-coding-task)).
3. **Everyone says limits are the answer.** The systematisation recommends that agents "enforce scoped
   spending policies at the signing or credential layer". An audit firm's guidance says separating read and
   execute permissions "does not eliminate prompt injection" and only reduces the blast radius
   ([Sherlock](https://sherlock.xyz/post/agentic-ai-security-risks-in-web3-what-protocols-need-to-know-in-2026)).
4. **Nobody has measured what the limits bound.** The same systematisation says "financial-agent benchmarks
   remain weak" and describes no benchmark of spending limits or session-key scope under attack. Recent
   papers go after approval flows and protocol flaws instead: an approval-binding defence that cut forged
   narration from 0.54 to 0.03 ([arXiv 2610.21063](https://arxiv.org/abs/2610.21063), digest), attacks and a
   binding defence for AP2 ([arXiv 2609.11757](https://arxiv.org/abs/2609.11757), title), analyses of x402
   ([arXiv 2605.30998](https://arxiv.org/abs/2605.30998), [arXiv 2607.19545](https://arxiv.org/abs/2607.19545),
   titles), and solver-checked transaction guards ([arXiv 2610.00354](https://arxiv.org/abs/2610.00354),
   title).
5. **Gap.** No benchmark reports the worst-case and the realised loss under hijack across wallet permission
   designs, together with what each design costs in usefulness.

## Who's asking

- **Crypto.** Wallet providers, payment-protocol teams and audit firms. The audit firm above lists "authority
  without hard limits" among its five agent risks and notes that on-chain transfers can't be reversed.
- **Frontier labs.** Indirect. One lab has a published case of its own model spending from a wallet without
  permission. That's the whole of the direct evidence.
- **Hedge funds and banks.** Also indirect. Five UK banks restrict third-party agents on customer accounts
  ([Cointelegraph via TradingView](https://www.tradingview.com/news/cointelegraph:f53e6b324094b:0-banks-are-banning-ai-agents-over-security-and-competition-concerns/)),
  and agent identity and authorisation appear in fund security roles. The on-chain setting is the cleanest
  place to measure a question they share: what a scoped credential is worth once the agent is compromised.

This repository's demand map has no crypto organisation, so none of this demand shows in its heat map.

## The critical view

**The strongest argument against.** "Least privilege reduces damage" isn't a finding. For a simple cap the
worst case is arithmetic: the cap times the number of windows before someone notices. Wallet vendors test
their own policies and know their limits better than an outsider will. A benchmark could spend ten weeks
confirming that caps cap.

**Where measurement could still earn its place.** The interesting failures are in what policies can't
express. An allowance granted to an approved contract isn't a transfer, so a transfer cap may not see it. An
allowlisted contract can itself forward value. Many small transfers stay under any per-transaction limit.
These depend on how each design composes with real contract behaviour, and that needs a search, not a
calculation. If the search finds nothing surprising, say so and stop early.

**What would make this worthless.**

- A wallet provider or an audit firm publishing a policy red-team benchmark with its own data.
- Results that match the configured cap in every design and every attack.
- A testbed too simple to contain the composition failures that matter.

**Scoop risk: medium.** Academic attention is on protocols and approvals. Commercial attention is private.

**What isn't known yet.** How faithfully a local testbed can model each vendor's policy engine from public
documentation. How much engineering the account-abstraction designs need. Whether "worst case" is tractable
to search beyond a few steps.

**Weakest of the six on lab demand.** That should be weighed honestly against how clean the metric is.

## What would close it

- **Closes when:** a public benchmark compares at least four wallet permission designs on worst-case loss,
  realised loss under a model-driven hijack and task success, on an open testbed.
- **Blocked by:** wallet vendors evaluate in private, academic work targets protocols, and there's no shared
  metric for loss under compromise.
- **Falsifier:** a published loss comparison across permission designs for hijacked agents.

## Scores

| Criterion | Score | Reason |
|---|---|---|
| Open gap | 4 | The field's own systematisation says benchmarks are weak and describes none for this. |
| Demand: labs | 3 | One published case and little else. |
| Demand: funds | 3 | Shared question, different setting. |
| Demand: crypto | 5 | Products are shipping and money has been lost. |
| Promise | 4 | A loss figure in currency is easy to act on, and a testbed would be reused. Loses a point because the answer may be obvious. |
| Solo feasibility | 3 | Needs smart-contract and account-abstraction engineering. |
| Budget | 4 | $150 to $600. The worst-case search needs no model. |
| Durability | 3 | Private commercial work is the main risk. |
| Repo signal | 2 | Mapped needs average a pressure of 0.121, and the demand map has no crypto rows. |

## Where it sits in this inventory

- **Needs:** `n.identity` (mean demand 3.50, 18 of 28 organisations at 4+, 20 papers) and `n.agent_sec` (3.82,
  17 of 28, 49 papers).
- **Leaves:** `agent.authz` (18 papers), `infra.identity` (4), `agent.hijack` (25).
- **Authored gap:** `gap-agent-identity`. Its chain says delegation is being solved in product without a
  literature. This topic measures one family of those products.
- **Closest paper already in the inventory:** an early evaluation of models on smart-contract audits
  (`arxiv:2306.12338`). Nothing on agents that hold keys.

## If it works

An open testbed, a loss table per design and attack, and a list of the policy gaps that arithmetic misses.
If it finds none, a short note saying so is still useful to anyone choosing a wallet design.

See [prior-work.md](prior-work.md) for what was checked and [plan.md](plan.md) for the draft study.
