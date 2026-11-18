# Prior work and search log: unprompted egress

Checked 18 Nov 2026.

How each entry was checked: **read** means the page was opened and read or summarised that day; **digest**
means it wasn't opened and the summary comes from a named secondary source; **title** means it appeared in
search results and wasn't opened; **earlier** means it was read on 2 to 4 Nov 2026.

## Closest work

| Work | Date | What it did | What it leaves open | Checked |
|---|---|---|---|---|
| [Can You Trust Your Copilot? A Privacy Scorecard for AI Coding Assistants](https://arxiv.org/abs/2509.20388), University of Passau | Sep 2025 | Scores five assistants on 14 weighted criteria from legal documents, enterprise agreements, technical documentation and audits. Scores run from 68 to 89.25 out of 100. | "Strictly document-focused." No traffic capture, no markers, no agentic sessions. A mid-2025 snapshot. | Read |
| [The Compiler May Read It, the Agent May Not](https://arxiv.org/abs/2609.35557), University of Iowa | 2026 | Classifies 15 routes by which protected files reach one agent's context against the harness's permission rules and its sandbox. Five routes are covered by neither. A deny list grew from 14 to 586 rules in five weeks. | Local access routes only. No network destinations, no third parties, no markers. Most cells are reasoning, not tests. | Read |
| [Developer Experience with AI Coding Agents: HTTP Behavioral Signatures in Documentation Portals](https://arxiv.org/abs/2604.02544) | Apr 2026 | By its title: the server-side view of coding agents fetching documentation. | Looks like the receiving end, not what the agent discloses. | Title |
| [Permission Denied](https://arxiv.org/abs/2608.02670), Accomplish AI | 2026 | Coding agents under restrictive policy. Egress denials dominate blocked actions, and a third of trials under the strictest policy record at least one. | Shows agents try to reach the network constantly. Doesn't look at what they send. | Read |
| [Your Agent Is Mine](https://arxiv.org/abs/2604.08407) | Apr 2026 | Malicious intermediaries between client and model. | An attacker in the path. This topic has no attacker. | Read through [CoinDesk](https://www.coindesk.com/tech/2026/04/13/ai-agents-are-set-to-power-crypto-payments-but-a-hidden-flaw-could-expose-wallets) |
| [Open and Emergent Problems in Agentic Privacy and Security](https://research.google/blog/open-and-emergent-problems-in-agentic-privacy-and-security-a-contextual-angle/), Google Research | 5 Oct 2026 | A contextual-integrity framing of agent privacy. | Not opened. Read before fixing definitions. | In this repo's news feed |

## Evidence that data leaves by routes other than the model API

| Source | What it reports | Checked |
|---|---|---|
| [Claude Code: configure cloud environments](https://code.claude.com/docs/en/cloud-environments.md) | A telemetry export that doesn't pass through the agent proxy; connector traffic routed through the vendor's servers | Read |
| [SalesBleed](https://labs.zenity.io/post/salesbleed-0-click-data-exfiltration-on-agentforce), Zenity Labs | Customer data out through DNS and link previews, under attack | Digest (Adversa, Oct 2026) |
| [The shared clipboard inside the sandbox](https://research.checkpoint.com/2026/the-shared-clipboard-inside-the-sandbox-cross-account-data-leakage-in-chatgpt/), Check Point Research | Shared writable storage across accounts in hosted code containers | Digest (Adversa, Oct 2026) |
| [AI risk and resilience report 2026](https://cloud.google.com/security/resources/ai-risk-and-resilience-2026), Google Mandiant | A hijacked coding-assistant session that spread a worm across about 100 repositories | Digest (Adversa, Oct 2026) |

These three incident sources involve an attacker. They're here to show which channels exist, not to claim
the benign case leaks the same way.

## Demand evidence

| Source | What it says | Checked |
|---|---|---|
| [Cointelegraph via TradingView](https://www.tradingview.com/news/cointelegraph:f53e6b324094b:0-banks-are-banning-ai-agents-over-security-and-competition-concerns/) | 80% of surveyed UK firms have deployed agents; data security and third-party dependencies are named concerns; a US supervisory framework for agentic systems on 4 Nov 2026 | Read |
| [Tech Times](https://www.techtimes.com/articles/319549/20260702/half-finance-firms-run-autonomous-ai-traders-bank-england-proposes-market-kill-switch.htm) | 52% of finance firms run autonomous AI systems, mostly in research synthesis, data processing and document review | Read |
| [Man Group](https://www.man.com/insights/what-ai-can-do-for-alpha) | Token use up 86 times since January | Earlier |
| [Arrowstreet posting](https://www.tealhq.com/job/senior-ai-security-engineer_7ea1a804ecdf46d45cedece6212477c5ac707) | Secure execution environments for agents | Earlier |

## Searches run on 18 Nov 2026

- coding agents leak proprietary code identifiers to third parties web search queries telemetry network
  traffic measurement canary study
- network traffic analysis AI coding assistants what data is sent third parties privacy measurement mitmproxy
  study arXiv

The second query returned the scorecard above and a handful of blog posts in which someone put one assistant
behind a proxy. None was a cross-product measurement.

## Before starting, search again for

- "coding agent" or "AI coding assistant" with "traffic analysis", "data flow", "telemetry" or "canary" on
  arXiv and in the proceedings of privacy and measurement venues.
- Vendor trust-centre pages that publish per-product data-flow diagrams.
- Any update to the scorecard.

## Read in full before the detailed run

1. The privacy scorecard, to reuse its criteria as the document baseline the measurement is compared with.
2. The Compiler May Read It, for its route taxonomy.
3. Each product's own data-usage and network documentation, so that documented flows are separated from
   undocumented ones.
4. The Google Research post on contextual integrity.
