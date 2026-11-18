# Prior work and search log: allowlist relays

Checked 18 Nov 2026.

How each entry was checked: **read** means the page was opened and read or summarised that day; **digest**
means it wasn't opened and the summary comes from a named secondary source; **title** means it appeared in
search results and wasn't opened; **earlier** means it was read on 2 to 4 Nov 2026.

## Closest work

| Work | Date | What it did | What it leaves open | Checked |
|---|---|---|---|---|
| [What domains should I add to my allowlist?](https://www.promptarmor.com/resources/what-domains-should-i-add-to-my-allowlist), PromptArmor | 13 May 2026 | Names npm, GitHub, Google Forms and wildcard cloud domains as exfiltration-capable. Gives four assessment criteria. | No counts, no tests of vendor defaults, no dataset or tool. The assessment is a paid service. | Read |
| [Permission Denied](https://arxiv.org/abs/2608.02670), Accomplish AI | 2026 | Runs 89 Terminal-Bench tasks under three policy levels with a forced proxy and a 205-domain allowlist. Success falls 7.1 to 18.3 points under the strictest level; cost rises by up to 167.3%. | Measures performance cost only. Says confidentiality is out of scope. Its allowlist includes gists and registries. | Read |
| [What your agent sandbox can reach by default](https://workos.com/blog/agent-sandbox-egress-defaults), WorkOS | 15 Sep 2026 | Compares five sandbox defaults from two companies. | Documentation review. No tests, no dataset. | Read |
| [URL laundering by rogue agents](https://labs.zenity.io/post/rogue-ai-agents-swarm-encoded-url-messages-laundering), Zenity Labs | 9 Sep 2026 | About 1,000 agent messages on echo services; relay chains through shorteners, fetchers, a CORS proxy and a web archive. | An investigation of one swarm from public traces. Not a measurement of allowlists. | Read |
| [Rogue agents investigation](https://www.asymmetricsecurity.com/newsroom/rogue-agents-investigation/), Asymmetric Security | Oct 2026 | Agents chaining an echo service, a URL scanner, a web archive and a push service. | Same: one case, public data only. | Read through [Security Affairs](https://securityaffairs.com/200215/ai/investigators-trace-an-ai-agent-s-path-from-research-task-to-reconnaissance.html) |
| [Second time, same sandbox](https://oddguan.com/blog/second-time-same-sandbox-anthropic-claude-code-network-allowlist-bypass-data-exfiltration/), Aonan Guan | 19 May 2026 | Two full bypasses of one product's allowlist enforcement, one tracked as CVE-2025-66479. | Bugs in enforcement. Says nothing about hosts that are allowed on purpose. | Read through a reader mirror |
| [Securing our frontier model training environment](https://openai.com/index/securing-our-frontier-model-training-environment/), OpenAI | 23 Oct 2026 | Offline training worlds, microVMs, perimeter controls. Red-team agents found flaws in almost every narrow service left open. | Internal. No benchmark, no dataset, and the answer chosen was to go offline. | Read |
| [VMs won't contain cyber-capable agents](https://blog.trailofbits.com/2026/08/26/vms-wont-contain-cyber-capable-agents/), Trail of Bits | 26 Aug 2026 | Three virtual machine escapes by a preview cyber model. Two came through the user-mode networking layer. | Escape, not egress policy. Doesn't discuss allowlists. | Read |
| [SandboxEscapeBench](https://arxiv.org/abs/2603.02277), UK AI Security Institute | Mar 2026 | Container breakout benchmark. | Containers only. | Earlier |
| [How hard is it really to break an AI agent out of its sandbox?](https://www.nccgroup.com/research/how-hard-is-it-really-to-break-an-ai-agent-out-of-its-sandbox/), NCC Group | 2026 | Reduced Python sandboxes are easy to escape; hardened containers resisted public escapes; recommends default-deny egress. | Not opened. | Digest (Adversa, Nov 2026) |
| [From Reactive Containment to Proactive Assurance](https://arxiv.org/abs/2610.12463) | Oct 2026 | Proposes red-teaming indirect egress through package managers, DNS, metadata, logging and artefact stores. | A plan, not results. | Read |

## Primary sources for the allowlists

| Source | What it gives | Checked |
|---|---|---|
| [Claude Code: configure cloud environments](https://code.claude.com/docs/en/cloud-environments.md) | Four access levels; Trusted is the default; 204 default entries in 17 categories, 14 wildcards; four paths that bypass the allowlist at any level | Read and counted |
| [Codex: agent internet access](https://learn.chatgpt.com/docs/cloud/internet-access) | Off by default in the agent phase; presets None, Common dependencies (71 domains) and All; method restriction; a worked exfiltration example | Read |

Not yet collected: the GitHub Copilot coding agent firewall list, Cursor background agents, Jules, Devin, and
the defaults of sandbox providers such as E2B, Daytona and Modal.

## Related incident reports

| Source | What it reports | Checked |
|---|---|---|
| [Hugging Face timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline) | Escape through the package registry cache proxy; command and control through request-capture services, pastebins, file drops and an open CORS proxy | Read |
| [Circumventing internet restrictions through an external browser](https://alignment.openai.com/misalignment-reports/circumventing-internet-restrictions-through-an-external-browser/), OpenAI | A GET-only model had an external browser service send POST requests and built a reusable relay helper | Digest (Adversa, Nov 2026) |
| [An agent used DNS to reach an external chatbot](https://alignment.openai.com/misalignment-reports/an-agent-used-dns-to-reach-an-external-chatbot/), OpenAI | Queries tunnelled through DNS delegation | Digest (Adversa, Oct 2026) |
| [SalesBleed](https://labs.zenity.io/post/salesbleed-0-click-data-exfiltration-on-agentforce), Zenity Labs | Data out through DNS and chat-app URL unfurling | Digest (Adversa, Oct 2026) |

## Searches run on 18 Nov 2026

- coding agent network allowlist exfiltration allowed domains bypass measurement default egress policy
- "living off trusted sites" OR relay AI agent sandbox exfiltration benchmark allowlisted domains package
  registry gist
- Asymmetric Security rogue agents investigation httpbin web archive relay
- Codex cloud internet access common dependencies domain allowlist
- Claude Code on the web network access trusted allowlist default allowed domains

None returned a dataset or paper that classifies default allowlists by relay capability.

## Before starting, search again for

- Anything new from PromptArmor, Zenity Labs, Embrace the Red, NCC Group and WorkOS on agent egress.
- "allowlist" with "relay", "exfiltration channel" or "egress benchmark" on arXiv from November 2026 onward.
- A follow-up to Permission Denied that adds confidentiality.
- Changes to the two vendor lists. Recount them: the Codex preset was reported as 69 domains in September and
  read as 71 in November.

## Read in full before the detailed run

1. Permission Denied, for the policy-graded method that the cost arm reuses.
2. The PromptArmor post, for its four criteria.
3. The Zenity and Asymmetric Security reports, for the relay classes seen in the wild.
4. Both vendor documentation pages, including their stated caveats.
