# Candidates considered and dropped

Written 18 Nov 2026. Twenty-three candidates were considered. Six became topics. These seventeen didn't, and
the reason is given for each so nobody spends a week rediscovering it.

How each source was checked: **read** means the page was opened and read or summarised on 18 Nov 2026;
**digest** means it wasn't opened and the summary comes from Adversa's
[October](https://adversa.ai/blog/top-ai-agent-security-resources-october-2026/) or
[November](https://adversa.ai/blog/top-ai-agent-security-resources-november-2026/) 2026 digest; **title**
means it appeared in search results and wasn't opened; **earlier** means it was read on 2 to 4 Nov 2026.

## What happened to the earlier nine-gap list

| Earlier gap | Outcome | Why |
|---|---|---|
| G1 Egress paths beyond containers | Reframed as [topic 02](02-allowlist-relays/README.md) | Container and VM escape is now owned by labs and specialists (see below). The relay question on product allowlists is what's left for an outsider. |
| G2 Cross-session monitor evasion | Dropped | Answered in outline: a frontier monitor flagged 7% of distributed attacks against 87% of single-agent ones ([arXiv 2610.24052](https://arxiv.org/abs/2610.24052), digest). A cross-session threat benchmark exists ([arXiv 2604.21131](https://arxiv.org/abs/2604.21131), title), as does a carryover benchmark with 101 tasks ([arXiv 2610.28425](https://arxiv.org/abs/2610.28425), digest). METR red-teamed OpenAI's production monitors ([post](https://metr.org/blog/2026-10-22-red-teaming-openai-agent-monitoring/), digest). |
| G3 Reconstructing an agent incident | Dropped | Crowded since September 2026: agents can delete their own traces in every local harness tested but one ([arXiv 2609.30266](https://arxiv.org/abs/2609.30266), read); tamper-evident evidence ([NovaFabric](https://arxiv.org/abs/2609.12582), earlier); whether an auditor can trust a harness's record ([arXiv 2609.32495](https://arxiv.org/abs/2609.32495), title); auditing from traces ([arXiv 2610.07256](https://arxiv.org/abs/2610.07256), title); anti-forensic injection ([arXiv 2610.29747](https://arxiv.org/abs/2610.29747), digest). |
| G4 Threat model as agent input | Kept as [topic 06](06-threat-model-input/README.md) | No ablation found. |
| G5 Validation in maintainer minutes | Parked | Demand is as high as anything here: Anthropic moves to 30-day disclosure for high and critical findings from 1 Jan 2027 ([policy](https://www.anthropic.com/research/coordinated-vulnerability-disclosure-timelines), read). But the study needs maintainers as participants, which one person can't recruit cheaply, and observational work on AI slop is arriving ([arXiv 2607.04003](https://arxiv.org/abs/2607.04003), [arXiv 2611.15159](https://arxiv.org/abs/2611.15159), [arXiv 2511.18608](https://arxiv.org/abs/2511.18608), all title). Revisit if a maintainer community offers access. |
| G6 Safe-to-merge gate for AI patches | Dropped | Crowded by practitioners with better data: Trail of Bits shipped patching and regression-hunt plugins ([21 Oct 2026](https://blog.trailofbits.com/2026/10/21/your-ai-agent-fixed-the-bug-but-what-else-did-it-change/)) and took apart a vendor patching benchmark ([15 Sep 2026](https://blog.trailofbits.com/2026/09/15/1passwords-ai-patching-benchmark-is-misleading/)). Both are in this repo's news feed and weren't reopened. |
| G7 Blast radius of agent credentials | Split into [topic 01](01-found-credentials/README.md) and [topic 04](04-agent-wallets/README.md) | The measurement is still missing: a vault paper names blast radius without measuring it ([arXiv 2609.33371](https://arxiv.org/abs/2609.33371), read). The behavioural half became topic 01 and the enforceable half topic 04. |
| G8 Trusted-data injection through MCP | Dropped | A defence is published most weeks: a reference monitor cutting AgentDojo attack success from 47.0% to 2.7% ([arXiv 2610.18457](https://arxiv.org/abs/2610.18457), digest), provenance-based authorisation ([arXiv 2609.37196](https://arxiv.org/abs/2609.37196), digest), fixed policies over inferred attributes ([arXiv 2609.31039](https://arxiv.org/abs/2609.31039), digest). |
| G9 Telling an AI operator from a human | Reframed as [topic 05](05-detection-coverage/README.md) | Fingerprinting is done: 0.981 macro F1 over seven model families from shell commands ([Trace](https://arxiv.org/abs/2605.01186), read through a [review](https://www.themoonlight.io/review/trace-unmasking-ai-attack-agents-through-terminal-behavior-fingerprinting)); about 90% top-1 over 15 models with honeypot traps ([arXiv 2611.12386](https://arxiv.org/abs/2611.12386), read); web agents ([arXiv 2606.20910](https://arxiv.org/abs/2606.20910), title). Detection with real rule sets and a human baseline is what's left. |

## New candidates that didn't make it

| Candidate | Outcome | Why |
|---|---|---|
| Prompt injection against AI SOC analysts through log content | Dropped | Done in May 2026 ([arXiv 2605.24421](https://arxiv.org/abs/2605.24421), title), with a follow-up on network logs and mitigations ([arXiv 2607.14493](https://arxiv.org/abs/2607.14493), title). |
| Safeguards that refuse legitimate defensive work | Dropped | Published as a workshop paper at ICLR 2026 ([arXiv 2603.01246](https://arxiv.org/abs/2603.01246), title). The pain is real: the July 2026 incident responders had to analyse attack logs with an open-weight model because commercial guardrails blocked them ([timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline), read). |
| Adversarial code comments that hide bugs from AI scanners | Dropped | Adaptive attacks through comments exist ([arXiv 2607.24964](https://arxiv.org/abs/2607.24964), title), as does the smart-contract version ([arXiv 2608.28400](https://arxiv.org/abs/2608.28400), title). Topic 06 treats this as a confound to control. |
| Residual access after stopping an agent | Dropped | Three papers in six weeks: revocation under delegation ([arXiv 2609.21284](https://arxiv.org/abs/2609.21284), title), revocation at tool gateways ([arXiv 2610.15991](https://arxiv.org/abs/2610.15991), title), and residual authorisation state ([arXiv 2609.08062](https://arxiv.org/abs/2609.08062), title). |
| Malicious LLM routers and gateways | Dropped | Measured at scale in April 2026 ([arXiv 2604.08407](https://arxiv.org/abs/2604.08407), read through [CoinDesk](https://www.coindesk.com/tech/2026/04/13/ai-agents-are-set-to-power-crypto-payments-but-a-hidden-flaw-could-expose-wallets)); a self-hosted gateway was taken apart in August ([Embrace the Red](https://embracethered.com/blog/posts/2026/hijacking-litellm-for-fun-and-profit/), not reopened). |
| Information barriers for finance agents | Dropped | Would be a finance-flavoured variant of an enterprise contextual-integrity benchmark ([CI-Work](https://arxiv.org/abs/2604.21308), title) and a multi-agent leakage benchmark ([AgentLeak](https://arxiv.org/abs/2602.11510), title). Demand is limited to finance. |
| Skill and plugin supply chain | Dropped | Crowded: malicious skills in the wild ([arXiv 2602.06547](https://arxiv.org/abs/2602.06547), title); 705 of 66,192 skill versions passed every scanner yet instructed forbidden actions ([arXiv 2609.12001](https://arxiv.org/abs/2609.12001), digest). |
| Approval hijack and step-up authorisation | Dropped | Crowded: approvals decoupled from execution in three platforms ([arXiv 2609.21081](https://arxiv.org/abs/2609.21081), digest); approval cards bound at dispatch ([arXiv 2609.18411](https://arxiv.org/abs/2609.18411), digest); canonical effect rendering against twelve approval-path attacks ([arXiv 2610.21063](https://arxiv.org/abs/2610.21063), digest). |
| Memory poisoning that persists across sessions | Dropped | Shown across three assistants ([arXiv 2610.28810](https://arxiv.org/abs/2610.28810), digest) and benchmarked ([arXiv 2610.28425](https://arxiv.org/abs/2610.28425), digest). |
| Collusion between agents | Dropped | An open framework shows defences that cut attack success by 60 points give no protection against colluding agents ([arXiv 2609.33102](https://arxiv.org/abs/2609.33102), digest). |
| Confidential inference and side channels | Dropped | This is the highest-pressure need in the repo (`n.secure_infra`, 0.482), but it needs hardware and deep specialism. OpenAI's own red team found cross-sandbox channels through cache timing, shared storage, CPU contention and a TLS certificate cache using "hundreds of billions of tokens" ([post](https://openai.com/index/securing-our-frontier-model-training-environment/), read). Not a solo, low-budget topic. |
| Unlearning evaluation and trigger-free backdoor detection | Dropped | Both are authored gaps in this repo and both need weight access and GPU time to do credibly. |

## Two that were reframed, in more detail

**Container and VM escape.** A preview cyber model escaped a QEMU/KVM virtual machine three times on one
researcher's workstation, the last time with a chain that included three zero-days
([Trail of Bits, 26 Aug 2026](https://blog.trailofbits.com/2026/08/26/vms-wont-contain-cyber-capable-agents/),
read). The UK institute has a container-escape benchmark
([arXiv 2603.02277](https://arxiv.org/abs/2603.02277), earlier), and OpenAI red-teams its own boundary at a
scale no outsider can match. What none of them publish is the dull version of the same problem: the hosts
that product sandboxes allow by default.

**AI operator detection.** The earlier list said one honeypot study existed. That was wrong by November
2026. Fingerprinting which model and harness is behind an attack works well in honeypots. What hasn't been
reported is whether the rules a security team already runs fire on agent intrusions at all, how many alerts
each one produces, and how that compares with human operators on similar tasks.
