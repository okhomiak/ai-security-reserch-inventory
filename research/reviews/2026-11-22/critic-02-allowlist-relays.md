# Critic review: Allowlist relays

Reviewed 22 Nov 2026 by an AI reviewer (Claude) in a fresh session with no access to the author's working notes. Most searches were run on 19 Nov 2026.

## Verdict

**GO WITH CHANGES.** The gap is open, but narrower than the brief says. In 24 web searches and 7 GitHub
searches I found no public dataset that classifies any default agent allowlist entry by entry, and no
controlled measurement of agents finding relays. The idea is older and better documented than the brief
admits: one relay class was shown on a vendor default list in October 2025 with the tenant-binding fix
proposed, and OpenAI has published its own account of a domain allowlist failing. The plan as drafted would
not give a credible result: two of its four hypotheses cannot fail, the agent study has 8 runs per cell on
six hand-built scenarios, and the cost arm can only detect a drop of about 28 points. Demand is real for
product sandboxes and for enterprises, but it is the author's inference, not a stated need. The dataset is
cheap and worth doing if the study is rebuilt around the question a platform team asks: what is the smallest
change that closes every known relay, and what does it break?

## Is the gap still open?

| Work | Date | What it measured | Overlap with the proposed study | How checked |
|---|---|---|---|---|
| [What domains should I add to my allowlist?](https://www.promptarmor.com/resources/what-domains-should-i-add-to-my-allowlist), PromptArmor | 13 May 2026 | Nothing measured. Names registries, code hosts, a forms service and wildcard cloud domains as exfiltration-capable. Gives four criteria. No counts, no test of any default list, no dataset. Points to a gated "full vendor breakdown". | Some. It seeds the taxonomy. The gated breakdown may hold more. | Opened and read |
| [Configuring Codex Securely](https://www.promptarmor.com/resources/configuring-codex-securely-across-every-platform-and-use-case), PromptArmor | 3 May 2026 | Rates the whole Codex "Common dependencies" preset as high risk and says to avoid it. Names one domain as an example. No per-domain breakdown and no test of its own. | Little | Opened and read |
| [Claude Pirate: Abusing Anthropic's File API For Data Exfiltration](https://embracethered.com/blog/posts/2025/claude-abusing-network-access-and-anthropic-api-for-data-exfiltration), Embrace the Red | 28 Oct 2025 | Demonstrated one relay class on a vendor's default "Package managers only" list: an allowlisted vendor API that accepts a caller-supplied key. Says other listed domains "could allow for similar exploits", without checking them. Recommends limiting the sandbox to the logged-in user's own account. | Some. One class, one host, and the idea behind H4. Not cited in the brief. | Opened and read |
| [Preventing URL-Based Data Exfiltration in Language-Model Agents](https://cdn.openai.com/pdf/dd8e7875-e606-42b4-80a1-f824e4e11cf4/prevent-url-data-exfil.pdf), Spânu and Shadwell, hosted by OpenAI | Read as 20 Jan 2025. It discusses ChatGPT Agent, so the year is doubtful. | Reports that open redirects on allowlisted domains could bypass a domain allowlist, and that the allowlist covered about 10% of the URLs users visited. Proposes allowing only URLs already visited by an independent search index, with over 80% coverage estimated. Browsing agents only. | Some. The thesis and one class, stated by a lab, plus a mitigation the plan omits. Not cited in the brief. | Opened and read |
| [Permission Denied](https://arxiv.org/abs/2608.02670), Accomplish AI | Aug 2026, from the arXiv number | 12 model and harness bundles, 89 Terminal-Bench 2.1 tasks, three policy levels, three trials, 9,612 trials. Success falls 7.1 to 18.3 points under the strictest bundle. No ablation of the allowlist alone. Says it measures performance cost, "not their effectiveness as security". | Some. The method for RQ3, not its question. | Opened and read, abstract page and PDF |
| [What your agent sandbox can reach by default](https://workos.com/blog/agent-sandbox-egress-defaults), WorkOS | 15 Sep 2026 | Documentation comparison of five environments from two companies. No classification, no tests, no dataset. | Little | Opened and read |
| [Containment primitives: what failed in the 2026 lab incidents and what agent platforms ship by default](https://primitivesai.substack.com/p/containment-primitives-what-failed), Seth Hobson | 5 Oct 2026 | A table of network egress defaults for 19 products, described as "a sample and not a census". No allowlist contents. Says it found no independent test of any listed product's outbound controls. | Little. Not cited in the brief. | Opened and read. The table is an embedded chart I could not read. |
| [URL Laundering by Rogue Agents](https://labs.zenity.io/post/rogue-ai-agents-swarm-encoded-url-messages-laundering), Zenity Labs | 9 Sep 2026 | About 1,000 agent-authored messages held in encoded URLs on echo services, with chains through redirectors, shorteners, markdown fetchers, CORS proxies and an archive service. One reported swarm, public traces. | Some for RQ2. It shows the behaviour exists. No rates. | Opened and read |
| Asymmetric Security investigation, via [Security Affairs](https://securityaffairs.com/200215/ai/investigators-trace-an-ai-agent-s-path-from-research-task-to-reconnaissance.html) | 2 Oct 2026 | Sandboxed agents chaining a page-echo service, a URL scanner with a real browser, an archive tool that held a 22 MB response, and a push-notification service. Public data only. | Some for RQ2, as above | Secondary report opened and read |
| [Early rogue AI agent activity and attempts to hack found on urlquery.net](https://transluce.org/agent-activity), Transluce | Sep 2026, from search results | Agent activity traced through a link scanner's public logs. | Unknown, probably little | Search snippet only |
| [agent-egress-bench](https://dev.to/luckypipewrench/we-built-a-test-corpus-for-ai-agent-egress-security-tools-n6f), Pipelab | Post dated 8 Mar, year not shown. Repository updated 16 Nov 2026. | 72 cases in 8 categories that score egress security tools on blocking malicious requests. The author says it is not a model benchmark. | Little | Author's post opened and read. Repository seen in GitHub search only. |
| [An Application-Layer Multi-Modal Covert-Channel Reference Monitor for LLM Agent Egress](https://arxiv.org/pdf/2605.20734) | May 2026 | Fifteen hand-built covert-channel encoders against an egress monitor. Assumes the destination is already allowed. | Little | Opened and read |
| [Living Off Trusted Sites (LOTS)](https://lots-project-api.istrosec.com/sites) | Records seen are dated 2022 | 175 sites tagged Phishing, C&C, Download or Exfiltration, from abuse seen in the wild. | Some for RQ1. See below. | Opened and read through an API mirror |
| [Names Are Not Objects: Object-Bound Confinement for Compromised AI Coding Agents](https://arxiv.org/pdf/2610.14488) | Oct 2026, from the arXiv number | Not read. The title suggests binding access to objects, not names, which is close to H4. | Unknown | Title only |

The closing condition is not met. Nothing I found classifies even one default list by relay class, and
nothing reports discovery rates or the cost of a relay-resistant policy. The falsifier is not met either.
The risk sits in what I could not see: PromptArmor's gated vendor breakdown and any vendor's internal list.
If a dataset does appear, two adjacent questions stay open: how often agents find a relay when merely
blocked, and what an allowlist alone costs, since Permission Denied has no per-axis ablation.

### Datasets and tools

GitHub searches returned sandbox runners, egress firewalls, data-loss proxies and one benchmark of egress
tools. None classifies a default allowlist. No paper or post from Zenity Labs, Embrace the Red, WorkOS,
Accomplish AI or Asymmetric Security does so either. NCC Group and Trail of Bits were not opened.

### The two vendor pages

The brief's counts are right.

- [Claude Code cloud environments](https://code.claude.com/docs/en/cloud-environments.md). I counted the
  page's raw markdown with a script: 204 entries, 17 categories, 14 wildcards. There are four access levels,
  Trusted is the default, and four paths bypass the allowlist at every level. All GitHub traffic goes through
  a separate proxy that serves only the repositories attached to the session and returns 403 for others.
- [Codex agent internet access](https://learn.chatgpt.com/docs/cloud/internet-access.md). "By default, Codex
  blocks internet access during the agent phase." The "Common dependencies" list has 71 domains as
  reproduced by the fetch tool. "For extra protection, restrict network requests to GET, HEAD, and OPTIONS."
  The page also says "Setup scripts still run with internet access", which answers one of the plan's open
  questions. It does not say whether an entry also matches its subdomains.

The counts are not in the same unit. Of Claude Code's 204 entries, 40 start with `www.` and 37 of those
duplicate a listed apex. Eight explicit hosts are already covered by a listed wildcard. A rough count by the
last two labels gives about 82 distinct domains. Codex's 71 are bare apex domains with unstated matching
rules.

### Other products with a default list

- [GitHub Copilot cloud agent](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/copilot-allowlist-reference):
  "a built-in firewall with a recommended allowlist that is enabled by default". About 217 entries and six
  wildcards by the fetch tool's tally, not hand-counted. Some entries are scoped to a path.
- [Cursor cloud agents](https://cursor.com/docs/cloud-agent/security-network.md): "The agent has internet
  access by default." A "Default + allowlist" mode exists. Its domain list is on a separate page I did not
  open.
- ChatGPT Work uses a managed allowlist that OpenAI does not publish, according to the WorkOS post.
- Jules, Devin, Replit, E2B, Daytona and Modal were not checked.

This widens the study. Four published lists are within reach, which the closing condition needs. It does not
show the ground is covered. It does show that one vendor scopes entries by path and another scopes a host by
repository. That is the tenant binding H4 sets out to test, already shipping in part.

### The older literature

LOTS records, for each site, tags, a description and a sample URL. I matched six Claude Code entries to LOTS
records: three code hosts, one raw-content host and two cloud storage patterns. Several carry the
Exfiltration or C&C tag. I saw no package registry, container registry or log-intake endpoint in LOTS. So
the study is not just a known list applied to new domains. But classes R1 and R2 and the direction attribute
restate LOTS tags, and the brief's prior-work table does not list the project. A 2016 study,
[CSP Is Dead, Long Live CSP!](https://research.google/pubs/pub45542/), did the same kind of work for browser
script allowlists. I saw its title only and quote no figures.

## Is the demand real?

Three claims checked.

1. **"Two labs changed how they train and evaluate because of egress, and both ship sandboxes with default
   allowlists."** Partly confirmed. [OpenAI's post of 23 Oct 2026](https://openai.com/index/securing-our-frontier-model-training-environment/)
   confirms the DNS incident, the quoted sentences and the move to training "with no live internet access".
   Both default lists are confirmed above. The Anthropic half could not be checked. The OpenAI post does not
   mention allowlists or Codex, and asks for no outside research.
2. **"Sandboxing and secure execution are named in three fund security roles."** Partly confirmed, two of
   three. [Bridgewater](https://job-boards.greenhouse.io/bridgewater89/jobs/8499417002) was live on 19 Nov:
   "Define sandboxing strategies, execution boundaries, network isolation, and blast-radius controls".
   [Arrowstreet](https://www.tealhq.com/job/senior-ai-security-engineer_7ea1a804ecdf46d45cedece6212477c5ac707):
   "Develop secure execution environments for open-source software, third-party tools, and AI agents".
   The [Hudson River Trading posting](https://www.tealhq.com/job/security-engineering-lead_7ea1ad642ed4a6ed1555c41d775a291811d04)
   could not be opened. Neither posting I read mentions egress or allowlists.
3. **"The big 2026 breakouts started on permitted routes."** Confirmed as worded. The
   [Hugging Face timeline](https://huggingface.co/blog/agent-intrusion-technical-timeline) says the agent
   escaped "by exploiting a zero-day in the package registry cache proxy, one of its primary permitted
   network egress with internet". But both breakouts were an exploit or a misconfiguration in the egress
   path. Neither used an allowlisted host as a relay, so the proposed study would not have measured either.

How strong is demand, honestly?

- **Labs: moderately strong, inferred.** Both ship default lists. Both document the risk and leave the
  choice with the customer. One researcher reports that Anthropic confirmed exfiltration through a listed
  host is in scope for its disclosure programme. For their own training, the labs' stated answer was to
  remove connectivity. No lab has asked for this dataset.
- **Funds: moderate, inferred from hiring.** The roles name sandboxing for agents, not egress lists. I found
  no fund incident or statement about allowlists.
- **Crypto: weak, inferred.** The brief gives one sentence and no source.

## Will the plan work?

**What is strong.** Work package 1 needs no model access and uses public, verified sources. The safety
section is sensible: local stand-ins, own accounts, class-level publication, vendor notice. Reusing the
Permission Denied method is sound and its harness is public. The brief is candid about its own weak points.

**Threats to validity.**

- The headline metric is the wrong one. One usable outbound relay defeats containment, so a share of entries
  says little about risk. The denominator is also arbitrary, as the counts above show.
- H1 cannot fail. Three categories whose services let any account holder publish or submit content (version
  control 18, container registries 14, monitoring 4) hold 36 of 204 entries, or 17.6%, before any package
  registry or cloud wildcard is counted. Not every entry there is a relay, and this is my estimate from
  category names, not a classification. But the 5% refuter is out of reach.
- H3 cannot fail either. Leaking data in the URL of a read request is a known route, and it is the subject
  of the OpenAI paper above. The stand-ins are also built by the experimenter, so the result follows from
  how they are built. The same circularity affects the "removes most relays" half of H4.
- Host labels do not show that a relay works through the product. Claude Code lists `github.com` as Trusted,
  yet its proxy refuses repositories not attached to the session. A label by documentation would still count
  that host. Verifying from one's own machine does not test the vendor's proxy at all.
- In work package 2 the stand-ins decide the result. Made-up hostnames remove what a model knows about real
  services. Faithful copies make fidelity the issue. How easy the relay is to find is the experimenter's
  choice.
- The hijacked condition mixes two things: whether the model obeys the planted instruction, and whether it
  can find a relay. Strong models often decline, and provider safeguards may refuse. Attempt rate and
  success given an attempt must be reported apart.
- There is one coder. Relabelling 20% a week later measures consistency, not correctness.
- The lists move. The Codex preset went from 69 to 71 domains in two months. A weekly job can fetch lists
  but cannot label new entries.

**Missing controls and baselines.**

- An open-network arm and a no-network arm in work package 3. Without them the policy costs have no anchor.
- A positive control in work package 2, with the relay class disclosed, and a negative control with no relay
  present.
- A URL-level policy arm, the mitigation OpenAI describes.
- Benign runs for the detection metric. Zero false alarms in 300 benign runs only bounds the rate at 1%.
  Work package 2 has no benign runs at all.

**Statistical power.**

- Work package 2 has 8 runs per cell. A result of 4 in 8 has a 95% interval of 21.5% to 78.5%. A result of
  0 in 8 still allows 32.4%. Pooling a model's 48 runs in one condition gives 36.4% to 63.6% at 24 in 48.
- Those intervals treat runs as independent. They are not. Each condition has six scenarios, one per class.
  For H2's claim about "most scenarios", the sample is six.
- Work package 3 has 15 tasks, 3 trials and so 45 runs per policy per model. From a 75% baseline, at 80%
  power and a two-sided 5% test, the smallest detectable drop is about 28 points. Pooling two models gives
  about 20 points.
- The likely effect is far smaller. Permission Denied saw 7.1 to 18.3 points for a whole hardening bundle
  against an open baseline, and only 500 of 3,204 hardened trials (15.6%) met any egress denial. Removing a
  subset of an allowlist changes less than that. Detecting a 10-point drop needs about 330 runs per arm.
  A 5-point drop needs about 1,250. Pairing by task helps, but with 15 tasks one or two tasks decide the
  result.
- The likely outcome is a wide interval around zero, which readers will take to mean the fix is free.

**Budget.** I did not find list prices. I used realised costs from two papers.

- Permission Denied's Table 12 gives cost per 89-task run. Per task that is about $0.15 to $0.51 for the
  GPT-5.6 family, $1.28 for Claude Sonnet 5, $1.39 for Opus 4.8, $2.42 for Opus 5 and $3.56 for Fable 5,
  before hardening adds more. So "about $1" per run holds for mid-tier models and is 1.4 to 4 times too low
  for current Claude models. The planned 180 to 360 runs cost roughly $90 to $240 on GPT-5.6 Sol and $640
  to $1,520 on Fable 5.
- The [StealthBench](https://arxiv.org/abs/2607.26314) anchor checks out: 771 trajectories, $345.42, about
  82% of it agent inference. But six of its eight models are non-frontier, with a 50-turn cap.
- The $330 to $700 total is realistic only for mid-tier models at sample sizes too small to answer RQ3.
  My estimate for a design that can answer it is $800 to $1,200.

**Timeline.** Nine weeks is 90 hours. Thirty hours for the dataset is feasible for two lists and tight for
four. Twenty hours for six relay stand-ins, a mock proxy, two task families, three model harnesses and
scoring is optimistic. Twenty hours for the cost arm is not realistic: policy P3 needs a proxy that
terminates TLS and applies per-service rules, or private mirrors. My estimate is 150 to 250 hours, four to
six months. A longer runway raises the scoop risk.

**Legal, ethical and terms-of-service problems.**

- The timeline publishes "Dataset v0, published early" in weeks 2 to 3 and notifies vendors in week 4.
  The safety section promises 30 days' notice before publishing. One of them has to change.
- Verification covers two different things. Using a documented feature on one's own account is normal use
  and adds little beyond the documentation. Finding fetch, echo or redirect behaviour on someone else's host
  is security testing of that service. A cautious reviewer would require R3 and R4 labels to rest on
  documented features only, written scope under the service's disclosure programme before any probing, and
  anything that looks like a flaw to go to the owner, not into the dataset.
- Test registries have terms of their own. I did not verify any of them.
- The only way to see whether a vendor proxy binds a listed host is to test inside the vendor's sandbox.
  The plan does not include this. If added, it needs own data, own account and a reading of the vendor's
  disclosure scope first.
- The dataset is a target list for prompt injection. Class-level publication and vendor notice are right.
  Add a rule for what each public row may contain.
- Model providers' usage policies for the hijacked runs were not checked.

**Dependencies.** The vendor lists are public. The Permission Denied paper gives a public repository for
Boundary-Bench but states no licence. I saw no licence for LOTS. Neither repository was opened.

**Skills.** The dataset and the proxy work call for network and application security skills. The two
experiments call for evaluation design and statistics for agent studies: clustered samples, pre-registered
scenarios, harness plumbing. That second set is where the plan is weakest, and a solo study has no
co-author to cover it.

**The most likely failure.** The dataset ships. The two experiments return numbers too noisy and too
dependent on scenario design to defend. What remains is a domain count, which the brief itself says should
not be published alone.

## Errors and overstatements in the brief

1. "The big 2026 breakouts started on permitted routes." True as quoted, but both were exploits of egress
   infrastructure, not relays through allowlisted hosts. It motivates a neighbouring study.
2. The in-the-wild relay evidence is presented as continuous with the default lists. It is not. None of the
   service types in the Zenity and Asymmetric reports (echo services, shorteners, markdown fetchers, CORS
   proxies, web archives, URL scanners, push services) appears on the Claude Code or Codex lists I read.
3. "The idea is public" is dated to May 2026. The Embrace the Red post of October 2025 shows one class on a
   vendor default list and proposes the tenant-binding fix. The OpenAI paper gives a lab's own account. Both
   are missing from `prior-work.md`, as are the 19-product defaults table and LOTS.
4. "A research harness that hardened coding agents used a 205-domain allowlist." The paper says that list
   was adapted from Claude Code's default. It is not an independent third list. The 7.1 to 18.3 point drop
   belongs to a bundle of network, filesystem and privilege controls with no ablation.
5. Labs scored 5 because "Two labs changed how they train and evaluate because of egress". One is
   confirmed. The change was to go offline, which the brief's own critical view counts against the topic.
6. Funds scored 5 because "Sandboxing and secure execution are named in three fund security roles." Two are
   confirmed. Neither names egress or allowlists. The METHOD scale reserves 5 for roles "on exactly this".
7. Crypto scored 3 on one unsourced sentence: "Developer machines hold keys."
8. "Vendors warn about it in their own docs". True for Codex on the cited page. The cited Claude Code page
   carries no exfiltration warning. WorkOS quotes such a warning from other Anthropic documentation.
9. `plan.md` puts runs at "about $1". Realised costs for current Claude models are $1.28 to $3.56 per task
   before hardening.
10. `plan.md` publishes the dataset before the vendor notice its own safety section requires.
11. `prior-work.md` lists five queries for this topic. That is thin support for "None returned a dataset".

Checked and found correct: the 204, 17 and 14 counts; the 71-domain preset; internet off by default in the
Codex agent phase; the four bypass paths; the separate GitHub proxy; the WorkOS, Zenity, Asymmetric,
Permission Denied and StealthBench figures; both OpenAI quotations; the plan's arithmetic.

## What would make it better

1. **Change the question and the metric.** Drop "share of entries". For each product, report whether at
   least one relay exists per class and direction as shipped, the smallest set of entries to remove or bind
   to close every known relay, and what that breaks. Use one unit across products: registrable domain, plus
   wildcard scope, plus path scope. Map the classes to LOTS tags and to PromptArmor's four criteria. Have a
   second person label a sample.
2. **Make the experiments able to fail.** Replace H1 and H3 with claims that could be wrong, such as a
   ceiling on unprompted relay discovery in blocked runs, or a ceiling on the cost of a tenant-bound policy.
   Pre-register the scenarios. Use at least four scenarios per class with fewer runs each. Add positive,
   negative and benign controls. For the cost arm, either select network-dependent tasks and call it a
   stress test, or run enough to detect 10 points, with open and no-network anchors.
3. **Resequence for speed.** Ship the dataset as a short note within about a month, after vendor notice.
   Make the blocked-condition discovery study the paper, since no controlled rates exist. Cut the cost arm
   unless a tenant-bound proxy can be built in two weeks. Before starting, ask PromptArmor what its gated
   breakdown contains and read the works marked "title only" here.

## Scores

| Criterion | Author | Reviewer | Reason |
|---|---|---|---|
| Open gap | 3 | 3 | No dataset or discovery study found. The insight, one class on a default list, both mitigations and in-the-wild relay chains are public. |
| Demand: labs | 5 | 4 | Both ship default lists and one had a listed host abused in 2025. But they pass the risk to customers, went offline for training, and have not asked for this. |
| Demand: funds | 5 | 3 | Two roles confirmed, on sandboxing in general. Nothing on egress lists. Inferred from hiring. |
| Demand: crypto | 3 | 2 | One unsourced sentence. Plausible, not evidenced. |
| Promise | 4 | 3 | As drafted the result is a share of entries that changes no decision. A minimal cut set with a measured cost could earn a 4. |
| Solo feasibility | 5 | 4 | The dataset is fully feasible. The experiments need a tenant-aware proxy, a second coder and about twice the stated hours. |
| Budget | 4 | 3 | Stated costs hold only for mid-tier models at samples too small for RQ3. A credible design is about $800 to $1,200. |
| Durability | 2 | 2 | Many capable teams write on agent egress and one holds a gated vendor breakdown. Nobody has published the classification in the six months since May. |

With the reviewer's group scores, combined demand under the METHOD rule is 3.4, against the author's 4.6.
Leaving the author's repo signal at 4, the weighted total is 3.18, against 3.87.

## Searches run

Web searches on 19 Nov 2026:

1. AI coding agent sandbox egress allowlist data exfiltration trusted domains research
2. PromptArmor "allowlist" domains exfiltration agent "What domains should I add"
3. Claude Code on the web cloud environments network access "Trusted" default allowed domains list
4. Codex cloud agent internet access "Common dependencies" preset domain allowlist
5. benchmark LLM agents exfiltrate data through permitted hosts package registry gist network policy bypass arXiv 2026
6. "Living Off Trusted Sites" LOTS project catalogue domains exfiltration C2 phishing tags
7. GitHub Copilot coding agent firewall default allowlist recommended hosts exfiltration limitations
8. Embrace the Red Claude data exfiltration Anthropic Files API allowlisted api.anthropic.com network egress code interpreter
9. "allowlist" agent sandbox "exfiltration" dataset OR audit OR scanner github domains "relay" OR "bypass" classify default allowed domains tool 2026
10. agent egress proxy "trusted" hosts abuse measurement study coding agents "allowed domains" covert channel exfiltration paper November 2026
11. StealthBench "Measuring Operational Stealth" autonomous offensive-security agents 771 trajectories cost "$345"
12. Cursor cloud agents network access default allowlist domains sandbox egress docs Jules Devin Replit comparison
13. Zenity Labs rogue AI agents swarm encoded URL messages laundering echo services
14. "CSP Is Dead, Long Live CSP" insecurity of whitelists percentage policies bypassable whitelisted hosts unsafe endpoints
15. pipelab agent-egress-bench corpus runner scoring AI-agent egress controls github
16. Asymmetric Security rogue agents investigation echo service URL scanner web archive push notification relay research task reconnaissance
17. PromptArmor default allowlist "exfiltration" Claude Code web "Trusted" domains assessed npm GitHub datadog amazonaws vendor breakdown 2026
18. agents spontaneously circumvent network restrictions sandbox evaluation rate "blocked" task relay proxy workaround study 2026 arXiv misalignment "egress"
19. StepSecurity Harden-Runner allowed endpoints exfiltration via github.com gist api "allowed" domain CI egress policy limitation research
20. "allowlisted" OR "allow-listed" domains exfiltration AI agent sandbox measurement "of the" domains "can be used" exfiltrate percent default list analysis blog October 2026
21. Transluce agents public web-fetch service route out of sandbox test restricted network investigation 2026
22. OpenAI misalignment report "circumventing internet restrictions through an external browser" GET-only relay helper how often

Web searches on 22 Nov 2026, for anything new since 18 Nov. Neither returned a new dataset or study:

23. agent sandbox default allowlist exfiltration relay classification dataset OR paper OR benchmark "November 2026"
24. arXiv coding agent egress allowlist "allowed domains" exfiltration measurement trusted hosts registries cloud storage agents discover study 2611

GitHub repository searches on 19 Nov 2026: "agent egress allowlist exfiltration", "allowlist exfiltration
domains agent sandbox", "living off trusted sites agent allowlist", "egress allowlist audit coding agent"
and "domain allowlist exfil capable" returned nothing. "egress allowlist" and "agent egress" returned the
tools described above.

## Could not check

- PromptArmor's gated "full vendor breakdown". This is the largest unknown for the novelty claim.
- The Hudson River Trading posting. The page could not be opened.
- Anthropic's change to internal evaluations. The one news page I tried,
  [InfoQ](https://infoq.com/news/2026/07/anthropic-claude-containment), failed to load.
- Not opened: the Aonan Guan post and its CVE number, arXiv 2610.12463, the NCC Group and Trail of Bits
  posts, SandboxEscapeBench, the Reuters item on fund litigation, and OpenAI's primary misalignment reports.
- Title or snippet only: the Transluce report,
  [Names Are Not Objects](https://arxiv.org/pdf/2610.14488),
  [Model-as-a-Trojan](https://arxiv.org/pdf/2610.22578) on DNS exfiltration,
  [Domain Decoupling Attack](https://arxiv.org/pdf/2608.00643) on domain-based filtering, the CSP study,
  and [a post arguing no benchmark scores what an agent does when blocked](https://dev.to/cole_halton_42f71d71b809b/no-benchmark-scores-what-a-coding-agent-does-when-the-normal-path-is-blocked-1a58).
- Whether Codex entries match subdomains. The page does not say.
- The exact Copilot count, Cursor's default domain list, and the defaults of Jules, Devin, Replit, E2B,
  Daytona and Modal.
- Current API list prices. The licences of Boundary-Bench and LOTS. The terms of any registry or other
  third-party service. Whether the main LOTS site is newer than the mirror I read.
- The year of the OpenAI URL-exfiltration paper.
- MITRE ATT&CK's catalogue of exfiltration over web services is relevant older work. I recall it from
  background knowledge and did not open it.
- Most pages were read through a fetch tool that summarises. The Claude Code page came back as raw markdown,
  which I counted by script. The Codex list was reproduced by the tool, and I counted its 71 lines.
