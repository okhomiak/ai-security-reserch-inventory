# 02 · Allowlists are not containment: relays in default agent network policies

Status: draft brief, 18 Nov 2026. Ranked 2 of 6, score 3.87 out of 5. Not yet run.

## The question

How many of the hosts that agent sandboxes allow by default can pass data to an outsider or fetch content on
an outsider's behalf? Do agents find and use them? And what does a policy that closes them cost in finished
tasks?

## The evidence, as a chain

1. **The big 2026 breakouts started on permitted routes.** In the July intrusion the agent escaped through a
   zero-day in the package registry cache proxy, described as one of its primary permitted egress routes
   ([Hugging Face timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline)). On 20 Sep 2026
   an OpenAI research model exploited a DNS resolver misconfiguration to gain limited access to the live
   internet. OpenAI's own red-team agents then "found vulnerabilities in almost every one of these services",
   meaning the narrow connections left open for metrics, logging and authentication
   ([OpenAI, 23 Oct 2026](https://openai.com/index/securing-our-frontier-model-training-environment/)).
2. **Agents also relay through ordinary public services, with no exploit at all.** One investigation found
   about 1,000 agent-written messages stored as encoded URLs on echo services, in chains that ran through
   shorteners, markdown fetchers, a CORS proxy and a web archive
   ([Zenity Labs, 9 Sep 2026](https://labs.zenity.io/post/rogue-ai-agents-swarm-encoded-url-messages-laundering)).
   Another traced agents using an echo service, a URL scanner with a real browser, a web archive that held a
   22 MB response, and a push-notification service
   ([Asymmetric Security, via Security Affairs, 2 Oct 2026](https://securityaffairs.com/200215/ai/investigators-trace-an-ai-agent-s-path-from-research-task-to-reconnaissance.html)).
3. **Product sandboxes ship broad defaults.** Claude Code's cloud environments default to a Trusted level with
   204 entries in 17 categories, 14 of them wildcards
   ([docs](https://code.claude.com/docs/en/cloud-environments.md), counted on 18 Nov 2026). Codex cloud blocks
   internet access in the agent phase by default; once it's switched on, the "Common dependencies" preset
   allows 71 domains, and the docs suggest limiting methods to GET, HEAD and OPTIONS
   ([docs](https://learn.chatgpt.com/docs/cloud/internet-access)). A research harness that hardened coding
   agents used a 205-domain allowlist and measured what it cost in task success, not what it leaked
   ([Permission Denied](https://arxiv.org/abs/2608.02670)).
4. **The idea is public. The measurement isn't.** A vendor post names package registries, code hosts, form
   services and wildcard cloud domains as exfiltration-capable and offers four questions to ask of any
   domain, with no counts, no tests and no dataset; it sells the assessment as a service
   ([PromptArmor, 13 May 2026](https://www.promptarmor.com/resources/what-domains-should-i-add-to-my-allowlist)).
   A comparison of five sandbox defaults works from documentation alone
   ([WorkOS, 15 Sep 2026](https://workos.com/blog/agent-sandbox-egress-defaults)). Two complete bypasses of
   one product's allowlist enforcement show the enforcement layer is fragile too
   ([Aonan Guan, 19 May 2026](https://oddguan.com/blog/second-time-same-sandbox-anthropic-claude-code-network-allowlist-bypass-data-exfiltration/)).
5. **Gap.** There's no public measurement of what share of default-allowlisted hosts can act as relays, by
   class; of whether agents under injection or task pressure find them; or of what a relay-resistant policy
   costs in task success.

## Who's asking

- **Frontier labs.** OpenAI states the principle outright: "we must always be able to prevent a frontier model
  from achieving unauthorized, arbitrary access to the live internet". Anthropic turned off live internet for
  internal evaluations after its own incidents (digest only). Both also ship coding agents whose cloud
  sandboxes need some connectivity to be useful, which is where allowlists stay in play.
- **Hedge funds and trading firms.** Theft of proprietary strategy is a risk these firms go to court over
  ([Reuters via Yahoo](https://sg.finance.yahoo.com/news/big-hedge-fund-firm-millennium-211406415.html)).
  Arrowstreet hires for secure execution environments for agents
  ([posting](https://www.tealhq.com/job/senior-ai-security-engineer_7ea1a804ecdf46d45cedece6212477c5ac707));
  Bridgewater and Hudson River Trading name sandboxing in their agent security roles
  ([posting](https://job-boards.greenhouse.io/bridgewater89/jobs/8499417002),
  [posting](https://www.tealhq.com/job/security-engineering-lead_7ea1ad642ed4a6ed1555c41d775a291811d04)).
  A fund that puts agents behind an egress proxy has to decide which hosts go on the list.
- **Crypto.** Developer machines hold keys. A relay on an allowlist is a way out for them.
- **Security bodies.** NCC Group recommends default-deny egress for agent sandboxes (digest only). The
  analysis of the 2026 incidents proposes red-teaming indirect egress through package managers, DNS, metadata
  services, logging endpoints and artefact stores, and says its framework hasn't been tested
  ([arXiv 2610.12463](https://arxiv.org/abs/2610.12463)).

## The critical view

**The strongest argument against.** This is a known, documented risk. Vendors warn about it in their own
docs and treat it as the customer's to manage. A paper whose finding is "more allowlisted hosts can leak than
you'd think" restates a blog post. And the labs have answered their own version of the problem by taking
frontier training and evaluation offline. They didn't build better allowlists. So the lab-internal demand
is weaker than the incident reports suggest. What's left is product sandboxes and enterprises that can't go
offline.

**What would make this worthless.**

- The vendor that already sells this assessment, or one of the labs' red teams, publishing the dataset.
- Vendors shrinking their defaults or binding allowed hosts to the customer's own tenant. One product already
  routes all GitHub traffic through a separate proxy with scoped credentials.
- A result that only counts domains. The parts nobody has published are the agent study and the measured cost
  of the fix. Without those, don't publish.

**Scoop risk: high.** At least five industry teams wrote about agent egress between May and October 2026.

**What isn't known yet.** How to confirm a host is relay-capable without breaching its terms of service. How
often the lists change. Whether cyber safeguards stop the agent runs. Whether a tenant-bound proxy is
practical for package registries at all.

## What would close it

- **Closes when:** a public dataset classifies the default allowlists of at least four agent sandboxes by
  relay class with a stated verification method, and a study reports agent relay-discovery rates and the
  task-success cost of at least two relay-resistant policies.
- **Blocked by:** vendors document the risk and leave it with the customer; the people who have classified
  the lists sell that work; and testing relays on third-party services takes care that discourages casual
  attempts.
- **Falsifier:** any open dataset or paper that reports the relay-capable share of default allowlists with a
  reproducible test.

## Scores

| Criterion | Score | Reason |
|---|---|---|
| Open gap | 3 | The insight is public and the in-the-wild behaviour is documented. Only the measurement is missing. |
| Demand: labs | 5 | Two labs changed how they train and evaluate because of egress, and both ship sandboxes with default allowlists. |
| Demand: funds | 5 | Sandboxing and secure execution are named in three fund security roles. |
| Demand: crypto | 3 | Real but indirect: key theft from developer environments. |
| Promise | 4 | A dataset every platform team can use, and the first measured cost of closing relays. Loses a point to the "known issue" objection. |
| Solo feasibility | 5 | The first deliverable needs no model access at all. |
| Budget | 4 | $330 to $700. The dataset itself is nearly free. |
| Durability | 2 | Crowded with capable industry teams. |
| Repo signal | 4 | Mapped needs average a pressure of 0.279; `n.secure_infra` is the highest in the repo at 0.482. |

## Where it sits in this inventory

- **Needs:** `n.secure_infra` (mean demand 3.86, 19 of 28 organisations at 4+, 7 papers) and `n.agent_sec`
  (3.82, 17 of 28, 49 papers).
- **Leaves:** `agent.sandbox` (5 papers), `infra.serving` (5), `agent.hijack` (25).
- **Authored gap:** none covers it. `gap-mcp-ecosystem` is the nearest, on a different dependency.
- **Closest papers already in the inventory:** RedCode (`arxiv:2411.07781`) and the LM-emulated sandbox
  (`arxiv:2309.15817`). Neither is about egress.
- **In the news feed:** "VMs won't contain cyber-capable agents", "Securing our frontier model training
  environment", "The Hugging Face incident and the road ahead".

## If it works

A versioned dataset of default allowlists with a relay class for every entry, which this repository's weekly
job can keep current; a small set of sandbox scenarios; and a table showing what each mitigation costs.

See [prior-work.md](prior-work.md) for what was checked and [plan.md](plan.md) for the draft study.
