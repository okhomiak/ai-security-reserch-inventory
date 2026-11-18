# Prior work and search log: found credentials

Checked 18 Nov 2026.

How each entry was checked: **read** means the page was opened and read or summarised that day; **digest**
means it wasn't opened and the summary comes from a named secondary source; **title** means it appeared in
search results and wasn't opened; **earlier** means it was read on 2 to 4 Nov 2026.

## Closest work

| Work | Date | What it did | What it leaves open | Checked |
|---|---|---|---|---|
| [The Vulnerability With No CVE](https://arxiv.org/abs/2608.05884), Bluebear Security | Aug 2026 | Position paper separating an agent's mandate from its authority. One anonymised field vignette. | Measures nothing. Names dynamic credential discovery as open and asks for benchmarks. | Read |
| [SysAdmin](https://arxiv.org/abs/2607.18239) | 2026 | Power-seeking in Linux administration: 2,800 tasks, seven models, 1.82% naive rate, 0.00% to 5.56% after bias correction. Varies termination threat and anti-gaming framing. | Doesn't isolate use of found credentials. No controls evaluated. One LLM judge. | Read |
| [CredLeakBench](https://arxiv.org/abs/2610.08871), University of Central Florida | Oct 2026 | Agents leaking credentials they were given to phishing endpoints. 512 directed, 256 autonomous and 1,024 recovery scenarios. | The opposite direction: credentials the agent holds, not ones it finds. | Read |
| [Optional Traps](https://arxiv.org/abs/2611.19295) | 14 Nov 2026 | Decoy credentials against attacker agents. Small local models. Revocation within 303 ms of a canary alert in a cloud test. | Studies attackers. Notes one legitimate agent took the bait and stops there. | Read (abstract) |
| [API Secrets Should Never Become Tokens](https://arxiv.org/abs/2609.33371), Corvic | Sep 2026 | A vault that injects credentials at the request boundary. 16 probes, all passed. | No injection benchmark, no comparison of credential models, blast radius and revocation unmeasured. | Read |
| [PropensityBench](https://arxiv.org/abs/2511.20703) | Nov 2025 | By its title and abstract as recalled: whether models choose prohibited tools under operational pressure. | Not about credentials found in the environment, as far as is known. Read for its pressure design. | Title |
| [From Reactive Containment to Proactive Assurance](https://arxiv.org/abs/2610.12463) | Oct 2026 | Analysis of the 2026 incidents at three labs. Recommends synthetic secrets and honeytokens. | Conceptual. Its own framework is "not yet empirically validated". | Read |
| [Caught in the Act(ivation)](https://arxiv.org/abs/2606.04141) | Jun 2026 | By its title: detecting credential exfiltration by agents from activations. | Looks like detection of exfiltration, not propensity to use. | Title |
| [AuthGateBench](https://arxiv.org/abs/2610.16426) | Oct 2026 | By its title: models as authorisation gates. | Looks like the model as the gate, not the model as the actor. | Title |
| [Owner-Harm](https://arxiv.org/abs/2604.18658) | Apr 2026 | By its title: a threat model for agents harming their own principal. | Probably framing. Read before fixing definitions. | Title |

## Incident evidence

| Source | Date | What it reports | Checked |
|---|---|---|---|
| [SecurityWeek](https://www.securityweek.com/openai-says-its-models-hunted-github-for-leaked-api-keys-during-training/) on OpenAI's first six reports | 17 Sep 2026 | A model searched GitHub for leaked keys, used one, fabricated results, disclosed nothing. | Read |
| [Decrypt](https://decrypt.co/381123/openai-model-used-testnet-ethereum-wallet-without-permission-to-finish-coding-task) on the test-wallet report | 16 Oct 2026 | 362 addresses checked from public recovery phrases; test funds spent; payment omitted from the final report. | Read |
| [OpenAI's report on the test wallet](https://alignment.openai.com/misalignment-reports/using-a-funded-test-cryptocurrency-wallet-without-authorization/) | Updated 15 Oct 2026 | Primary source for the row above. | Could not open |
| [OpenAI's framework](https://openai.com/index/model-misalignment-reporting-framework/) | Sep 2026 | The reporting framework and its first reports. | Could not open |
| [Hugging Face timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline) | 2026 | Every credential the intruding agent used, from static keys to a signing key. | Read |
| [Adversa digest](https://adversa.ai/blog/top-ai-agent-security-resources-november-2026/) | 5 Nov 2026 | Summaries of seven OpenAI reports, including the 147,451-row download. | Read |

## Searches run on 18 Nov 2026

- benchmark do AI agents use credentials they find without authorization access denied workaround propensity
- agents opportunistically use discovered secrets leaked API keys honeytoken canary credential unauthorized
  use rate benchmark
- agent credential blast radius benchmark scoped tokens per-task capability vs shared service account
- OpenAI model misalignment reporting framework exposed API key without authorization
- OpenAI misalignment report funded test cryptocurrency wallet recovery phrases

None returned a benchmark of found-credential use by non-adversarial agents.

## Before starting, search again for

- New OpenAI, Anthropic and Google incident or misalignment reports. Each may ship with an evaluation.
- "credential" with "propensity", "opportunistic", "unauthorised use" or "honeytoken false positive" on arXiv
  from 14 Nov 2026 onward.
- Follow-ups to Optional Traps and SysAdmin.
- Output from Apollo Research, METR, Transluce and Palisade on boundary-pushing by agents.

## Read in full before the detailed run

1. The Vulnerability With No CVE, for the mandate and authority definitions.
2. SysAdmin, for its bias-corrected judging.
3. PropensityBench, for how it applies pressure.
4. Optional Traps, for the decoy placement finding.
5. OpenAI's individual reports, once they can be opened.
