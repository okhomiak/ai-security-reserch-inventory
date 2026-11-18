# Prior work and search log: agent wallets

Checked 18 Nov 2026.

How each entry was checked: **read** means the page was opened and read or summarised that day; **digest**
means it wasn't opened and the summary comes from a named secondary source; **title** means it appeared in
search results and wasn't opened; **earlier** means it was read on 2 to 4 Nov 2026.

More of this table rests on titles than in any other topic. Reading these papers is the first job of the
detailed run.

## Closest work

| Work | Date | What it did | What it leaves open | Checked |
|---|---|---|---|---|
| [SoK: Security of Autonomous LLM Agents in Agentic Commerce](https://arxiv.org/abs/2604.15367), Nanjing University and others | May 2026 (v2) | Five threat dimensions, 12 cross-layer attack vectors, eight protocols assessed. Recommends scoped spending policies at the signing layer. | A literature systematisation, not an experiment. Says "financial-agent benchmarks remain weak". Session keys appear only in passing. | Read (first 100,000 characters) |
| [Approve what, exactly?](https://arxiv.org/abs/2610.21063) | Oct 2026 | Twelve approval-path attacks against three approval designs. Canonical effect rendering cut forged-narration success from 0.54 to 0.03. | About what the human approves, not what the wallet permits without approval. | Digest (Adversa, Nov 2026) |
| [Signing the Transaction but Not the Decision](https://arxiv.org/abs/2609.11757) | Sep 2026 | By its title: attacks on AP2 and a binding defence. | Looks protocol-level. To be read. | Title |
| [Free-Riding the Agentic Web](https://arxiv.org/abs/2605.30998) | May 2026 | By its title: a security analysis of x402 payments. | Looks protocol-level. To be read. | Title |
| [When HTTP 402 Meets the Blockchain](https://arxiv.org/abs/2607.19545) | Jul 2026 | By its title: risks in x402 payments. | Looks protocol-level. To be read. | Title |
| [Hardening x402](https://arxiv.org/abs/2604.11430) | Apr 2026 | By its title: filtering payment metadata before execution to protect personal data. | Looks like privacy, not loss. | Title |
| [Proof-Gated Signing](https://arxiv.org/abs/2610.00354) | Oct 2026 | By its title: solver-checked transaction guards for on-chain agents. | Looks like a defence proposal. Check whether it reports loss under attack; if it does, this topic narrows. | Title |
| [Your Agent Is Mine](https://arxiv.org/abs/2604.08407), UC Santa Barbara, UC San Diego and others | Apr 2026 | Malicious intermediaries that rewrite tool calls and steal keys. One wallet drained of $500,000. | An attack on the path to the model. Motivates the hijack assumption here. | Read through [CoinDesk](https://www.coindesk.com/tech/2026/04/13/ai-agents-are-set-to-power-crypto-payments-but-a-hidden-flaw-could-expose-wallets) |
| [API Secrets Should Never Become Tokens](https://arxiv.org/abs/2609.33371), Corvic | Sep 2026 | Vault-mediated credentials for agents. Names blast radius without defining or measuring it. | The off-chain analogue of the same missing measurement. | Read |
| [Giving AI Agents Access to Cryptocurrency and Smart Contracts Creates New Vectors of AI Harm](https://arxiv.org/abs/2507.08249) | Jul 2025 | By its title: an argument that crypto access creates new harms. | Probably framing. | Title |
| [Agent-to-Agent Finance](https://arxiv.org/abs/2607.00245) | Jul 2026 | By its title: payments and trust infrastructure for agents. | Probably infrastructure, not evaluation. | Title |

## Incidents and product evidence

| Source | Date | What it reports | Checked |
|---|---|---|---|
| [CoinDesk](https://www.coindesk.com/markets/2026/02/23/ai-bot-s-tipping-blunder-hands-usd250-000-memecoin-pile-to-x-sad-story-poster) | 23 Feb 2026 | An agent's accidental transfer of a memecoin holding after a request for 4 SOL | Through Sherlock's post; the headline figure wasn't confirmed in the article body |
| [Decrypt](https://decrypt.co/381123/openai-model-used-testnet-ethereum-wallet-without-permission-to-finish-coding-task) | 16 Oct 2026 | A research model spent test funds from a wallet it derived keys for | Read |
| [Koi](https://www.koi.ai/blog/clawhavoc-341-malicious-clawedbot-skills-found-by-the-bot-they-were-targeting) | Early 2026 | Malicious agent skills, many posing as trading tools. The link's title says 341; Sherlock cites 824 | Through Sherlock's post |
| [Sherlock](https://sherlock.xyz/post/agentic-ai-security-risks-in-web3-what-protocols-need-to-know-in-2026) | 2026 | Five agent risks for protocols, including authority without hard limits | Read |
| [Coinbase policy documentation](https://docs.cdp.coinbase.com/server-wallets/v2/policies/overview) | 2026 | The policy engine for server and agent wallets | Linked from Sherlock's post; not opened |

## Searches run on 18 Nov 2026

- crypto AI agent security research 2026 wallet agents prompt injection smart contract exploit agents
  benchmark
- AI agent wallet spending policy session keys prompt injection benchmark evaluation on-chain permissions
  blast radius x402 AP2
- Coinbase agentic wallets x402 agent payments security spend limits policy engine prompt injection research
  gap session keys evaluation
- benchmark hijacked AI agent wallet loss bounded by session key spend cap allowlist smart account policy
  evaluation

None returned a benchmark that compares permission designs by loss under hijack. The last query returned
open-source wallet projects and vendor guides, not evaluations.

## Before starting, search again for

- "session key", "spend limit" or "wallet policy" with "benchmark", "red team" or "hijack" on arXiv and on
  crypto research forums.
- Security posts from wallet providers and account-abstraction teams.
- Audit-firm write-ups of agent wallet reviews.
- Anything that cites the systematisation above and adds experiments.

## Read in full before the detailed run

1. The systematisation, including the part that wasn't reached.
2. Proof-Gated Signing, since it's the likeliest to overlap.
3. Both x402 analyses and the AP2 paper.
4. The policy documentation of at least two wallet providers, to model their engines faithfully.
