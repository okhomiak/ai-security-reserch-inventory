# Critic review: Unprompted egress

Reviewed 22 Nov 2026 by an AI reviewer (Claude) in a fresh session with no access to the author's working notes. Most searches were run on 19 Nov 2026.

Files reviewed: the [brief](../../03-unprompted-egress/README.md), the [prior-work log](../../03-unprompted-egress/prior-work.md) and the [plan](../../03-unprompted-egress/plan.md), scored against [METHOD.md](../../METHOD.md).

## Verdict

**GO WITH CHANGES.**

The brief's novelty claim is wrong as written. A security firm published a decrypted traffic capture of seven coding agents on one shared playbook in November 2025, and a second researcher published a four-tool capture with a planted canary repository and a reusable harness in July 2026. That meets the brief's own falsifier. What's still open is narrower: how often coding agents, on routine tasks, put workspace-derived strings into web searches, fetches and package lookups, including tools that run on the provider's servers. Finance demand is real and better evidenced than the brief shows, but lab and crypto demand are inference. The plan as drafted can't deliver its headline number, so it should go ahead only as a narrowed study built on the existing captures.

## Is the gap still open?

| Work | Date | What it measured | Overlap with the proposed study | How checked |
|---|---|---|---|---|
| [What data do coding agents send, and where to?](https://chasersystems.com/blog/what-data-do-coding-agents-send-and-where-to/), Chaser Systems | 4 Nov 2025 | Decrypted traffic (transparent mitmproxy) of seven agents: Junie, Gemini CLI, Codex CLI, Claude Code, Zed, GitHub Copilot and Cursor. One eight-step playbook for all, one to three configurations each (telemetry opt-outs, Cursor Privacy Mode, blocked hosts). Lists hosts per product and what each carried, including third-party telemetry hosts (Statsig, Sentry, Microsoft Application Insights). No planted markers. Two playbook steps told the agent to upload a file and to read a credentials file. | Most of the gap statement. Some of the study. Products, settings and destinations are there, with two results of the kind H3 predicts: VS Code's telemetry switch didn't stop Copilot's telemetry hosts, and Cursor Privacy Mode showed the same telemetry as sharing mode. No markers, no rates, no look at agent-initiated search or fetch, and 2025 versions. | Opened |
| [cereblab/grok-build-exfil-repro](https://github.com/cereblab/grok-build-exfil-repro/blob/main/COMPARISON.md), reported by [The Hacker News](https://thehackernews.com/2026/07/grok-build-uploads-entire-git.html) | 12 to 14 Jul 2026 | All-hosts mitmproxy capture of Claude Code, Codex CLI, Gemini CLI and Grok Build on an identical canary repository: a never-read file with a unique marker, a gitignored `.env` with a fake secret, and a secret committed then deleted. Two headless prompts per tool (an idle control and "what does this project do?"). Captured bodies are searched for the marker. Harness published. Claude Code, Codex and Gemini sent nothing beyond the model provider and telemetry. Grok Build had uploaded the whole repository and its history to a cloud storage bucket. | Some. This is the planted-marker method the brief treats as new, across four tools. Only two prompts, one account per tool, no settings varied, and the Gemini task run was cut short by a quota error. | Opened (both) |
| [PII Leaks in Agentic Web Search](https://www.nimbleway.com/blog/we-analyzed-200k-agentic-web-search-queries-for-pii), Nimble | 18 Nov 2026 | Automated classification of 200,000 production search queries written by agents, seen from the search provider's side. 8.4% held personal data or company secrets, 1.8% held company-confidential information, 0.15% held credentials or internal system addresses. No breakdown by agent type or product. Classifier validation isn't described. The publisher sells the control it recommends. | Some, from a vantage point the proposed study can't reach. It's the first published rate for step 4 of the brief, though not for coding agents. | Opened |
| [Is your coding agent uploading all your code?](https://arize.com/?p=31636), Arize | Aug 2026 | A documentation review of five agents (Claude Code, Codex, Cursor, GitHub Copilot, Grok Build) as of 15 Jul 2026, plus a retelling of the cereblab captures. No captures of its own. | Little. A second document-based cross-product comparison, newer than the scorecard. | Opened |
| [Can You Trust Your Copilot?](https://arxiv.org/abs/2509.20388), University of Passau | 22 Sep 2025 | A document-based scorecard of five assistants on 14 criteria. "The evaluation is strictly document-focused." It rates OpenAI GPT models, Anthropic Claude, Google Gemini, GitHub Copilot and Amazon Q Developer. | Little. The brief describes it correctly. No later version found. It doesn't name traffic analysis as future work. | Opened |
| ["Impossible to hide secret ...": Uncovering Security and Privacy Issues in LLM-native IDEs](https://arxiv.org/abs/2607.26390) | 2026, data to Mar 2026 | 446 developer posts and 6,280 comments about 16 AI IDEs, coded into a taxonomy. Lack of transparency is 45.9% of privacy posts. Unauthorised transmission and collection is 11.9%. The authors captured no traffic themselves. | Little. Useful as evidence that developers ask the question. | Opened |
| [Teaching Code Agents to Ask Without Leaking Private Code](https://arxiv.org/abs/2610.24824) | 20 Oct 2026 | Counts private entities and verbatim code 5-grams in the questions a local agent sends to a remote expert model, in the authors' own harness. An untrained agent's questions averaged 4.42 private entities on SWE-bench Verified. No products and no third parties. | Little. Its disclosure metric is better than literal marker matching. | Opened |
| [AudAgent](https://www.petsymposium.org/popets/2026/popets-2026-0077.php), PoPETs 2026 issue 3 | 2026 | Runtime auditing of agents built with mainstream frameworks against their privacy policies. No coding products. | Little. Shows a privacy venue already publishes agent data-practice audits. | Abstract only |
| [ANT](https://arxiv.org/abs/2610.06514) | 5 Oct 2026 | A labelled dataset of agent network traffic (3,114 episodes, 276,417 flows) for classifying agent behaviour from flows. Not about what content leaves. | Little | Abstract only |
| [Unveiling Trae](https://blog.unit221b.com/dont-read-this-blog/unveiling-trae-bytedances-ai-ide-and-its-extensive-data-collection-system), Unit 221B, and [The Register](https://www.theregister.com/2025/07/28/bytedance_trae_telemetry/) | Jul 2025 | By headline: a telemetry analysis of one AI IDE that kept sending data after opt-out. | Little. One product. Shows the genre is 16 months older than the brief. | Search snippet only |
| Single-product captures and tooling: a [five-part series on Claude Code's traffic](https://patrickmccanna.net/?p=1605), and the PyPI packages [llm-interceptor](https://pypi.org/project/llm-interceptor/2.9.5/) and [claude-code-inspector](https://pypi.org/project/claude-code-inspector/1.3.0/) | 2025 to 2026 | By title: mitmproxy captures of one agent, and packaged tools to intercept coding-agent traffic. | Little each. Together they show the capture rig is a commodity. | Search snippet only |
| [Big Help or Big Brother?](https://arxiv.org/pdf/2503.16586), [Network-Level Prompt and Trait Leakage in Local Research Agents](https://arxiv.org/pdf/2508.20282), [Where the Evidence Lives](https://arxiv.org/abs/2611.20389) | 2025 to Nov 2026 | By title: traffic audits of browser AI assistants, network-level leakage from research agents, and privacy of exported agent traces. | Unknown. The first shows a measurement group has the tooling. The third is from November 2026 and may bear on telemetry exports. | Search snippet only |

"Opened" means I fetched the page and read a tool-made extract of it against set questions. Quotes come from those extracts.

Two checks came back empty. An NCC Group white paper on Claude Code, Cursor and Codex "focuses on arbitrary code and command execution rather than data exfiltration" ([IT Brief, 10 Jul 2026](https://itbrief.com.au/story/ncc-group-maps-security-gaps-across-ai-coding-agents)). A [November 2026 digest of coding-agent security work](https://adversa.ai/blog/top-ai-coding-agent-security-resources-november-2026/) lists no traffic, telemetry or canary study.

The brief's falsifier ("a cross-product traffic measurement of coding agents, from anyone") is met: the Chaser Systems capture predates the brief by a year. The stricter "Closes when" condition is not met in full: the seven-agent capture has a shared task set and reports by destination and setting but plants no markers, and the planted-canary capture covers four tools and two prompts. The gap is narrowed, not closed. I found no peer-reviewed traffic measurement of coding agents, and no measurement for coding agents of how often workspace-derived strings reach search, fetch or package services, which is the adjacent question still open.

## Is the demand real?

The three strongest claims are the regulator survey, the named-fund evidence and the token-growth figure.

| Claim in the brief | Status | What I found |
|---|---|---|
| A Bank of England and FCA survey found 80% of firms have deployed agents, with data security and third-party dependencies among the concerns | Confirmed, and stronger at source | The [primary report](https://www.bankofengland.co.uk/report/2026/artificial-intelligence-in-uk-financial-services-2026) (26 Oct 2026, 196 respondents) gives 80% with agents deployed and "Only 2% reported deploying agents with broad autonomy." The top current risks are "data protection and security" and "third-party and supply chain". 51.5% report current use of coding agents. For high-materiality third-party systems, 81% rely on vendor assurance and contracts and 24% have deep knowledge of the system. 34% rate limited transparency into third-party systems a major constraint. The brief cites only a [news piece](https://www.tradingview.com/news/cointelegraph:f53e6b324094b:0-banks-are-banning-ai-agents-over-security-and-competition-concerns/), which is about banks restricting consumer-facing agents. |
| Man Group reports token use up 86 times since January | Partly confirmed | The figure is real but the [cited page](https://www.man.com/insights/what-ai-can-do-for-alpha) doesn't hold it. It comes from a podcast: "Since January, I think token consumption has increased 86-fold" ([transcript](https://thetranscriptdesk.substack.com/p/one-of-the-worlds-largest-hedge-funds)). Neither source mentions data leaving the firm. It shows adoption, not demand for this study. |
| Arrowstreet hires for secure execution environments for agents | Confirmed as quoted | The [posting](https://www.tealhq.com/job/senior-ai-security-engineer_7ea1a804ecdf46d45cedece6212477c5ac707) is still up and says "Develop secure execution environments for open-source software, third-party tools, and AI agents." It lists data leakage as a threat. It doesn't mention coding tools or third-party data flows. |
| Citadel Securities has spoken about security and data permissions for agents | Could not check | The [page](https://www.citadelsecurities.com/news-and-insights/future-of-global-markets-2026-conference/technology-scale-execution/) failed twice with a site error. |

How strong is demand, group by group?

- **Funds and banks: a strong stated concern, an inferred need for this study.** The survey shows firms worry about data security and third-party transparency, use coding agents, and lean on vendor assurance. No fund, bank or regulator I found asks for an outside traffic measurement. Large firms can capture their own traffic on enterprise tiers. A reply written on Cursor's behalf told a DLP builder that inline inspection is feasible ([forum, May 2026](https://forum.cursor.com/t/does-cursor-client-implement-ssl-pinning-that-prevents-https-traffic-inspection/160355)). A public study on consumer tiers tells them less than their own proxy does.
- **Labs: inference.** No lab asks for it. Labs do react. The same Grok Build binary stopped uploading the day after the capture was published, when a server-side setting changed, and xAI responded publicly ([The Hacker News](https://thehackernews.com/2026/07/grok-build-uploads-entire-git.html)). That's reaction to being caught, not demand.
- **Crypto: inference with no source.** The brief gives one sentence. The nearest facts I found aren't from crypto organisations: 0.15% of agent search queries in Nimble's sample carried credentials or internal addresses, and Grok Build sent a tracked `.env` unredacted.

## Will the plan work?

**What's strong.** The no-attacker baseline is a clean framing. Fresh markers per run make hits traceable. The plan refuses to defeat pinning, uses own accounts and synthetic code, and offers vendors a review. It has kill criteria, and the first one anticipates the dull result. The work needs interception, proxies, DNS and Python and no ML research. The budget arithmetic is right (720 sessions, $216 to $720).

**Would it be publishable?** As a preprint or a practitioner write-up, yes. A full privacy or measurement venue would expect several accounts per product, versions over time and a task sample the author didn't write. Any reviewer will ask what it adds to the 2025 and 2026 captures. The draft doesn't know they exist.

**What can be observed.**

- Proxies and certificate authorities. Claude Code honours `HTTPS_PROXY` and `HTTP_PROXY`, trusts the OS store and `NODE_EXTRA_CA_CERTS`, and "does not support SOCKS proxies" ([docs](https://code.claude.com/docs/en/network-config.md)). For Cursor the sources conflict. The forum reply above says "Cursor does not implement SSL pinning", yet the poster still saw only auth and telemetry traffic after trying several settings. Cursor's [network page](https://cursor.com/docs/enterprise/network-configuration) lists "Certificate pinning for critical services" and advises excluding its domains from inspection.
- Prior captures settle most of it. Chaser decrypted all seven of its products, and cereblab all four. Chaser needed a transparent proxy because some components "wouldn't respect" proxy settings, per-product CA trust, HTTP/2 switched off for Cursor, and Protobuf decoding. Pinning is unlikely to trigger the second kill criterion. Opaque encodings are the real cost.
- Server-side tools. "Claude Code issues search requests to Anthropic's server-side `WebSearch` tool" ([analysis, Oct 2025](https://mikhail.io/2025/10/claude-code-web-tools/)). The local wire shows only the model provider. Which search service gets the query can't be seen from the user's machine. Whether the query text is readable in the decrypted model stream needs a pilot. I couldn't verify it.
- The planted-marker method fails for the main case. Marker links catch fetches. A search query that contains a marker string never touches the listener. So the plan's only instrument for server-side tools can't see the channel H2 predicts is commonest. An agent that fetches a link planted in a repository comment is also following repository content, which is close to an injection test and sits badly with "no attacker".
- Literal matching undercounts. A model writes search queries in its own words. The October 2026 paper in the table counts private entities and verbatim 5-grams instead.
- Server-side flags decide behaviour. The Grok Build binary changed behaviour overnight with no client update. One account per product on one day can't characterise a product, and "versions and dates recorded" doesn't capture it.

**Do vendors already document this?** Partly. Claude Code publishes a host table with purposes, including two Datadog telemetry hosts, the npm registry and GitHub. It publishes opt-out variables, a data-flow diagram and the WebFetch hostname check, and says "Metrics never include your code, prompts, or file paths" ([data usage](https://code.claude.com/docs/en/data-usage.md)). Cursor's page lists domains and little else. For a well-documented vendor a capture mostly confirms the documentation. What documentation can't cover is agent-initiated flows, because those depend on what the model decides to send. Vendor telemetry also drifts: Chaser saw Claude Code 1.0.85 send to Statsig and Sentry hosts, and the current docs list Datadog.

**Threats to validity.**

- The rate is an artefact of the task mix. Three of the seven task types (unfamiliar library documentation, an obscure build error, a new dependency) are chosen to trigger network use. "Share of tasks with a hit" then measures the author's choices.
- Synthetic markers don't look like what a model searches for. Real leaks are error strings, stack traces and hostnames in config. The brief admits this is unknown.
- Consumer tiers aren't what the audience runs. Zero data retention for Claude Code "is enabled on a per-organization basis by your account team". The hardened settings a fund uses are out of reach.
- "Hardened" differs per product, so cross-product comparison of that setting isn't like for like.
- Capture changes behaviour. Cursor has to drop HTTP/2 under inspection, and scripted runs need headless modes that skip editor features such as indexing.

**Missing controls.**

- A no-agent baseline. Package managers send package names to registries whether or not an agent is present. Without the same tasks run by script, toolchain traffic gets booked to the agent.
- An idle baseline. Both earlier captures used one.
- A forced-search positive control per product, to prove the pipeline can see a marker in a query end to end.
- A second account per product.

**Statistical power.**

- The plan's figure holds as arithmetic. At 10% and n = 60 the 95% half-width is 7.6 points. The Wilson interval for 6 hits in 60 is 4.7% to 20.1%.
- The 60 sessions aren't independent. They're 30 tasks run twice. With a within-task correlation of 0.7 the effective n is about 35 and the half-width about 10 points.
- H1's refuter can't be established. With 0 hits in 60 the one-sided 95% upper bound is 4.9%, above the 2% line. If the true rate is 2%, 30% of samples of 60 show no hits at all. Bounding a rate below 2% takes about 149 clean sessions per agent and setting.
- Default against hardened, per agent, 10% against 2%: about 45% power with a z-test and about 28% with Fisher's exact test (my simulation, 4,000 runs). Pooled over six agents it's above 99%. Setting effects are testable only when pooled.
- H4 can't be tested. The scorecard rates five provider-level products, not the plan's agents, and it's a mid-2025 snapshot. With five items only a perfect rank match is significant (exact two-sided p = 0.017). One adjacent swap gives p = 0.083.

**Budget.** A third-party tracker dated 17 Nov 2026 ([BenchLM](https://benchlm.ai/llm-pricing)) lists, per million tokens of input, output and cached input: Claude Sonnet 5.5 at $2, $10 and $0.10; Claude Opus 5.5 at $4, $20 and $0.20; GPT-5.6 Terra and Gemini 3.1 Pro at $2, $12 and $0.20; GPT-5.5 at $5, $30 and $0.50. I didn't check vendor price pages. On my assumptions (20 turns, a 50,000-token context, 8% new input per turn billed at 1.25 times the input price, 8,000 output tokens) a session costs $0.37 on Sonnet 5.5, $0.48 on Terra or Gemini 3.1 Pro, $0.74 on Opus 5.5 and $1.20 on GPT-5.5. So $0.30 to $1.00 holds for short cached sessions on mid-tier models. A 50-turn session with an 80,000-token context costs $1.40 to $4.40. The budget leaves out reruns, the larger sample H1 needs, a listener host and domain, search-tool fees and any business-tier seats. The $900 top has no margin for the plan as written.

**Timeline.** Weeks 4 and 5 give 20 hours for 720 sessions, which is 100 seconds of attention each. That works only unattended. Terminal agents have headless modes. Editor agents need UI automation the plan doesn't budget. Chaser's tests of seven agents on one playbook ran from July to September 2025. One week for review by six to eight vendors plus a write-up isn't realistic. My estimate is 12 to 16 weeks as written, or 8 to 10 for four or five headless agents.

**Legal and terms of service.** I found no clause that forbids intercepting your own traffic. Two things need care.

- Cursor's [terms](https://cursor.com/en-US/terms-of-service) (updated 3 Sep 2026), section 1.5, bar users from acts including "reverse engineer, disassemble, decompile, decode" and "probe, scan or attempt to penetrate the Service". Benchmark results may not go to third parties "unless you include all necessary information for others to replicate the tests". Publishing is allowed with full replication detail. Decoding Cursor's undocumented Protobuf could be argued to fall under "decode". Take advice before publishing that part.
- Anthropic's [consumer terms](https://www.anthropic.com/legal/consumer-terms) (effective 8 Oct 2025 as fetched), section 3, bar access "through automated or non-human means, whether through a bot, script, or otherwise" unless through an API key or where explicitly permitted. They also bar "bypassing any of our systems or protective measures". Hundreds of scripted sessions on a consumer subscription sit in a grey area. Run them under API keys. I didn't open the commercial terms.
- Ethics risk is low. Two small points: realistic-format fake secrets can trip abuse or secret scanners, and invented package names should be random per run so nobody can register a name the published repositories would then install.

**Dependencies.** mitmproxy served both earlier captures. The cereblab harness is public, but I saw no licence stated. The scorecard works as context, not as a rank baseline. No dataset is needed.

**Skills.** The plan underestimates three things: statistics for clustered binary outcomes, protocol decoding (Protobuf and WebSocket), and GUI automation for editor agents.

**Is step 4 supported?** Partly. For agents at large it's no longer speculation: Nimble reports queries where secrets were "copied straight from the agent's context into a search box". For coding agents the evidence points to a low rate for code content. On a simple task Claude Code, Codex and Gemini sent the canary nowhere but the model provider, and Chaser saw Codex CLI contact only `api.openai.com`. [Permission Denied](https://arxiv.org/abs/2608.02670) doesn't help: its denied destinations were package and model repositories, and about 62% of the egress volume was retries against a host already blocked.

**Most likely failure.** A null the design can't interpret. Mainstream agents show no third-party marker hits beyond package lookups, the sample can't separate that from 2%, the few hits trace back to the author's task choices, and readers ask what's new since the 2025 capture.

## Errors and overstatements in the brief

1. Brief, step 2: "The only cross-product evidence is a reading of the paperwork." Wrong. See the first two rows of the table. The same claim is in the shortlist [README](../../README.md).
2. Brief, step 5: "Nobody has published a network-level measurement, with planted markers, of what coding agents send to third parties during routine work, across products and settings." Overstated. Each element has been published. Only the full combination hasn't.
3. Prior-work log: "a handful of blog posts in which someone put one assistant behind a proxy. None was a cross-product measurement." Wrong. The Chaser post was in the results of my first two searches. The log lists two queries for this topic.
4. Brief, "Falsifier", and plan, third kill criterion ("A cross-product traffic study is published first"). Both were already met on the day they were written.
5. Brief, step 1: the Man Group link doesn't contain the 86 times figure. It's from a podcast.
6. Prior-work log on Permission Denied: "a third of trials under the strictest policy record at least one". As extracted from the paper, about a third (675 of 2,051) is trials with a blocked action of any kind. For egress it's 500 of 2,051, about 24%. "Shows agents try to reach the network constantly" also overstates it, for the reasons above.
7. Brief, step 4 and the critical view: search and package flows go "to someone who isn't the model provider and isn't covered by its contract". Overstated for provider-side search. The query goes to the provider first, and the search service may be its sub-processor. I couldn't verify that either way. A [vendor blog quoting provider documentation](https://safeguard.sh/resources/blog/ai-agent-web-search-leaks-your-data-to-search-engines) supports the weaker claim that retention terms differ for search and fetch.
8. Brief, step 3: the Claude Code telemetry example. The cited line is real: the export "doesn't go through the agent proxy" ([docs](https://code.claude.com/docs/en/cloud-environments.md)). But it sits in a list of cloud-session requests that never receive a stored network secret, and the page ties the export to `OTEL_*` variables set on the environment. It reads as an export the customer configures, from a hosted session a local capture can't observe. I didn't open the linked monitoring page, so this is a likely misreading, not a proven one.
9. Brief, "Who's asking": "US bank supervisors issued a framework". The cited article names one supervisor, the OCC, and says the framework "does not introduce new binding requirements for banks".
10. Brief, "Who's asking": "This is the first question a risk committee asks before approving a coding agent, and today the answer is a vendor's policy page." No source. The survey's 81% figure supports the second half. Nothing supports the first.
11. Plan, sample size: "a 10% rate is estimated to within about 8 points". True only if the 60 sessions are independent. They aren't.

Checked and found accurate: the scorecard description and its "strictly document-focused" quote; the [route study](https://arxiv.org/abs/2609.35557) (15 routes, 5 uncovered, 14 to 586 rules in five weeks, one harness); the survey's 80% figure and named concerns; the Arrowstreet line; the session and cost arithmetic.

## What would make it better

1. **Reframe to the open slice and build on the prior captures.** Ask how often coding agents put workspace-derived strings into web searches, fetches and package lookups on routine tasks, and which settings stop it. Cite the 2025 and 2026 captures as the baseline to replicate on current versions. Rewrite the falsifier and the closing condition for this slice. Use Nimble's 8.4% as the prior to test for coding agents.
2. **Rebuild the measurement around that channel.** Read queries and URLs from the decrypted model stream and the agent's own transcripts as well as the wire, and say plainly what stays invisible. Count private entities and verbatim n-grams, not only literal markers. Add the no-agent, idle and forced-search controls. Take tasks from a public benchmark and fix the mix before the pilot.
3. **Cut scope to fit the power and the hours.** Use four or five headless terminal agents under API keys. Run about 150 sessions per agent in the default setting and pool the hardened setting. That's roughly 1,050 sessions, or $390 to $780 at $0.37 to $0.74 each. Record server-side settings responses and use two accounts where affordable. Drop H4, and leave editor agents for a later round.

## Scores

| Criterion | Author | Reviewer | Reason |
|---|---|---|---|
| Open gap | 4 | 2 | The brief's falsifier was met in Nov 2025 and a planted-canary capture followed in Jul 2026. Only the agent-initiated slice is open. |
| Demand: labs | 3 | 3 | Agree. Nobody asks for it, but a lab changed behaviour within a day of a published capture. |
| Demand: funds | 5 | 4 | Regulator data shows a strong stated concern. No firm or regulator asks for this measurement, and large firms can capture their own traffic. |
| Demand: crypto | 3 | 2 | One unsourced sentence. I found no crypto organisation stating the need. |
| Promise | 3 | 3 | Agree. A capture can move a vendor, as Grok Build showed, but the likeliest result for mainstream agents confirms the documentation. |
| Solo feasibility | 5 | 4 | One person can do it for headless terminal agents. Editor agents, opaque encodings, server-side tools and enterprise-only settings don't fit the hours. |
| Budget | 3 | 3 | Agree on the bucket. $0.30 to $1.00 a session checks out for short cached sessions, with no margin for reruns or a larger sample. |
| Durability | 3 | 2 | The general study has appeared twice, the tooling is on PyPI, and a search vendor published query-leak rates on 18 Nov 2026. I saw no group on the narrowed slice. |

These rate the topic as written. Combined demand under the METHOD.md rule is 0.6 x 4 + 0.4 x (3 + 2) / 2 = 3.4, against the author's 4.2. Holding repo signal at the author's 4, the total falls from 3.79 to 2.98. Narrowed as set out above, I'd rate open gap 3 and durability 3, for a total of about 3.28.

## Searches run

19 Nov 2026, novelty (17 queries):

- measurement study network traffic AI coding assistants IDE extensions data sent to servers privacy leakage paper
- intercepted Cursor Copilot "Claude Code" traffic mitmproxy what it sends home telemetry analysis
- agentic coding tools web search queries leak source code snippets secrets to search provider privacy empirical
- arXiv 2026 "coding agents" "network traffic" OR "traffic analysis" OR "dynamic analysis" third-party endpoints telemetry data collection audit
- "honeytoken" OR "canary token" coding agent exfiltration benign task outbound requests study Cursor Windsurf Cline Aider Gemini CLI
- PoPETs OR IMC OR "USENIX Security" OR NDSS 2026 LLM-powered developer tools data flows privacy policy consistency traffic
- "coding agent" OR "coding assistant" phones home undisclosed uploads repository researchers found November 2026
- empirical study privacy leakage LLM agents benign tasks no adversary oversharing tool calls web search "inadvertent" disclosure coding agents arXiv 2026
- AI code editors comparison telemetry endpoints privacy mode verified packet capture Windsurf Cline Aider Amazon Q Kiro "Wireshark" OR "Burp" OR "mitmproxy" 2026
- cereblab Grok Build wire capture canary git bundle grok-code-session-traces Claude Code Codex Gemini comparison original analysis
- Unit 221B Trae ByteDance AI IDE data collection telemetry analysis endpoints findings
- "agentic" coding CLI tools privacy audit "data collection" telemetry opt-out compliance measurement paper Claude Code Codex Gemini CLI OpenCode 2610 OR 2611 arXiv
- AudAgent automated auditing privacy policy compliance AI agents PoPETs 2026 runtime data flows third-party tools
- Claude Code vs OpenCode what is sent before the prompt is read wire analysis system prompt telemetry comparison blog 2026
- coding agents leak internal package names hostnames to public registries pip npm lookups dependency confusion agent-initiated installs study 2026
- "coding agents" egress audit canary repository all-hosts capture comparison Claude Code Codex Cursor Copilot Gemini third-party hosts October 2026 OR November 2026
- independent security audit AI coding assistant data handling verified privacy mode zero data retention pentest report Trail of Bits OR "NCC Group" OR Cure53 OR "Bishop Fox" Cursor OR Windsurf OR Copilot

19 Nov 2026, vendor documentation and feasibility (5 queries):

- Claude Code enterprise network configuration proxy custom CA NODE_EXTRA_CA_CERTS required URLs allowlist docs
- Cursor network configuration proxy SSL inspection custom certificate HTTP/2 zscaler docs "certificate pinning"
- Codex CLI OR "Gemini CLI" OR Windsurf OR "Amazon Q Developer" corporate proxy TLS inspection custom CA certificate support firewall allowlist domains documentation
- Claude Code data usage telemetry services Datadog WebFetch domain safety check web search tool documentation
- Claude Code cloud environments network access proxy telemetry OTLP export bypass security proxy docs "cloud-environments"

19 Nov 2026, demand (5 queries):

- Man Group "What AI Can Do for Alpha" token use 86 times since January agents research
- Bank of England FCA survey 2026 AI agents 80% of firms deployed 2% broad autonomy data security third-party dependencies
- Citadel Securities Future of Global Markets 2026 conference technology scale execution AI agents security data permissions
- OCC supervisory framework "super intelligence" agentic systems banks November 4 2026
- Arrowstreet Capital "Senior AI Security Engineer" secure execution environments agents job posting

19 Nov 2026, terms and prices (3 queries):

- Cursor terms of service "benchmark" OR "reverse engineer" OR "competitive" restrictions publish results clause Anysphere
- Anthropic consumer terms of service "reverse engineer" "automated" access restrictions; GitHub Copilot terms "benchmark" disclose results; OpenAI terms "reverse" "extract"
- API pricing per million tokens November 2026 Claude Opus Sonnet Haiku GPT-5.5 Gemini input output price

22 Nov 2026, re-check for work published since 18 Nov (2 queries):

- coding agents data flows third parties wire capture study published this week "November 2026" Claude Code Codex Cursor Copilot what they transmit
- arXiv 2611 coding agent privacy measurement outbound traffic search queries leak workspace identifiers third-party services

The re-check found nothing that closes the narrowed gap. It surfaced the October 2026 paper on code agents' questions, which I opened, and one November 2026 title I couldn't open.

## Could not check

- The [Citadel Securities conference recap](https://www.citadelsecurities.com/news-and-insights/future-of-global-markets-2026-conference/technology-scale-execution/): site error on two attempts.
- [Where the Evidence Lives](https://arxiv.org/abs/2611.20389) (arXiv, Nov 2026): rate limited on two attempts. It may bear on what agent telemetry exports contain. Read it before starting.
- Whether the text of a provider-side search query is visible in the decrypted model stream. That needs a capture, and I ran none.
- Whether search services are contractual sub-processors of each model provider.
- Proxy, CA and pinning behaviour of Codex CLI, Gemini CLI, Windsurf, Cline, Aider and Amazon Q from vendor pages. I saw only third-party captures and page titles.
- Terms for OpenAI, Google, GitHub, Windsurf and Amazon, and Anthropic's commercial terms.
- Vendor price pages and subscription prices. API prices come from one third-party tracker.
- The licence of the cereblab harness.
- The OCC framework itself. I saw the [news release](https://occ.gov/news-issuances/news-releases/2026/nr-occ-2026-97.html) only as a search result.
- The Reuters item on the Millennium case, the Google Research post, arXiv 2604.02544, the Unit 221B post and the Claude Code monitoring page that defines the telemetry export. None was opened.
- Venue proceedings. I searched by venue name but didn't page through indexes for PoPETs, IMC, USENIX Security, NDSS, CCS, SOUPS or CHI. A paper with an unexpected title could be missed.
- Two pages (the Man Group article and Claude Code's data-usage page) were refused on first request and opened once a search returned them.
- Every "opened" page was read as a tool-made extract, not as raw text. Two extracts stopped at 100,000 characters, just short of the end of the page.
