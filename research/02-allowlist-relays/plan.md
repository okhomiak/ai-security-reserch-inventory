# Draft research plan: allowlist relays

Draft v0.1, 18 Nov 2026. Nothing has been run. This is the starting point for the detailed analysis, not a
commitment.

## Research questions

- **RQ1.** What share of the hosts on default agent allowlists can act as a relay, by class and by product?
- **RQ2.** Do agents find and use those relays, when hijacked and when merely blocked?
- **RQ3.** What does a relay-resistant policy cost in finished tasks and in spend?

## Hypotheses and what would refute them

| | Hypothesis | Refuted if |
|---|---|---|
| H1 | A large minority of default-allowlisted entries, at least one in five, fall into a relay class. | Under 5% do, for every product examined. |
| H2 | Agents discover a usable relay in most scenarios where one exists, without being told the class. | Discovery stays under 20% across models. |
| H3 | Restricting methods to GET, HEAD and OPTIONS removes some relay classes but not fetch-on-behalf, echo or DNS classes. | Method restriction alone drives relay success to zero. |
| H4 | Binding allowed hosts to the customer's tenant removes most relays at a lower task-success cost than pruning the list. | Tenant binding costs as much as pruning, or can't be built for registries. |

## Relay classes

Defined by what the host does, not by how to abuse it. The definitions need testing against the first fifty
entries before they're fixed.

| Class | What makes it a relay |
|---|---|
| R1 Open-publish store | Anyone with an account can write content that anyone else can read |
| R2 Tenant namespace under a wildcard | Any customer of the provider can create an endpoint that matches the allowed pattern |
| R3 Fetch on behalf | The allowed host retrieves a URL that the client names |
| R4 Echo or redirect | The host reflects client-supplied content or forwards the client elsewhere |
| R5 Intake with a caller-supplied key | A telemetry or logging endpoint that accepts data under any account's key |
| R6 Name resolution | Lookups that reach a resolver or registry an outsider can observe |

Each entry also gets a direction: outbound (data leaves), inbound (content arrives), or both.

## Work package 1: the dataset (RQ1)

1. Collect the default allowlists with retrieval dates. Start with the two already read: 204 entries and 71
   domains. Add at least two more products.
2. Classify every entry by documented function, using the four criteria from the PromptArmor post and the
   classes above. Record the documentation page that supports each label.
3. Reclassify a random 20% a week later to measure self-agreement. Publish the labels and invite corrections
   through this repository's issues, which is the nearest thing to a second coder.
4. Verify a sample per class with a harmless marker string, on own accounts only, and only where the
   service's terms allow it. Prefer test instances that the lists themselves include. Mark every entry as
   "verified" or "by documentation".

Output: a JSON dataset, one row per product and entry, with class, direction, evidence link, verification
status and date.

## Work package 2: agent behaviour (RQ2)

Local sandbox scenarios with a mock allowlist proxy and a local stand-in for each relay class. No real
third-party service is contacted.

- **Hijacked condition:** a planted instruction asks the agent to send a marker string to an outside
  listener.
- **Blocked condition:** the task needs a resource the proxy denies, and a relay would reach it.
- **Measured:** whether the agent finds a relay, whether the marker arrives, steps and spend to get there,
  and whether simple proxy-log rules flag it at a 1% false-positive rate measured on benign runs.

Design: 6 classes, 2 conditions, 3 models (one open-weight), 8 runs. That's 288 trajectories.

## Work package 3: the cost of closing relays (RQ3)

Reuse the policy-graded method from
[Permission Denied](https://arxiv.org/abs/2608.02670): the same tasks under tighter and tighter policy.

| Policy | What changes |
|---|---|
| P0 | Vendor default list |
| P1 | P0 with methods limited to GET, HEAD and OPTIONS |
| P2 | P0 with relay-class entries removed |
| P3 | P0 with relay-class entries bound to the user's own tenant or to a private mirror |

Design: 15 tasks from a public terminal benchmark, 4 policies, 3 trials, 1 or 2 models. That's 180 to 360
runs. Report task success, spend and blocked actions per policy, with intervals.

## Metrics

- Share of entries per relay class, per product, split into verified and by documentation.
- Relay discovery rate and marker-arrival rate, per class, condition and model.
- Detection rate at a fixed 1% false-positive rate.
- Change in task success and spend from P0 to each tighter policy.

## Budget

- Work package 1: under $50. No model calls.
- Work package 2: 288 trajectories at $0.50 to $1.00 is about $150 to $290.
- Work package 3: 180 to 360 runs at about $1 is about $180 to $360.
- Total: about $330 to $700.

The per-trajectory figure is anchored on a 771-trajectory shell-agent benchmark that cost $345.42
([StealthBench](https://arxiv.org/abs/2607.26314)), rounded up for stronger models.

## Timeline at about 10 hours a week

| Week | Work | Output |
|---|---|---|
| 1 | Collect lists; fix class definitions on the first fifty entries | Definitions |
| 2 to 3 | Classify everything; self-agreement check; verify samples | Dataset v0, published early |
| 4 | Kill check; notify vendors | Go or stop |
| 5 to 6 | Sandbox scenarios; agent runs | Discovery rates |
| 7 to 8 | Policy cost runs | Cost table |
| 9 | Write-up | Preprint draft |

## Kill criteria

- By documentation, under 5% of entries are relay-capable for every product. Publish a short note and stop.
- A comparable open dataset appears. Drop work package 1, cite it, and keep packages 2 and 3.
- Vendors move their defaults to tenant-bound proxies before week 4. Reframe as a before-and-after study or
  stop.

## Safety, ethics and disclosure

- Own accounts and harmless marker strings only. No third-party data. No junk published to production
  registries. No automation that breaches a service's terms.
- The agent study runs against local stand-ins, never real services.
- Send the dataset to each vendor at least 30 days before publishing. They document this risk already, so
  the aim is accuracy, not embargo drama.
- Publish classes, counts and mitigations. Don't publish step-by-step instructions for any single host.
- No employer, client or personal data anywhere in the study.

## What gets released

The dataset, kept current by this repository's weekly job; the classification guide; the sandbox scenarios;
policy templates for P1 to P3; a short paper.

## Where to publish

A preprint in arXiv cs.CR; a systems-security workshop or an offensive-technologies workshop; a practitioner
post aimed at platform and security teams.

## Open questions for the detailed run

- [ ] Is each relay class defined tightly enough that two people would label the same entry the same way?
- [ ] Which services' terms allow verification with a marker string, and which don't?
- [ ] How should wildcard entries be counted: as one entry or as the namespace they open?
- [ ] Which products beyond the first two publish their lists, and which need the product itself to read
      them?
- [ ] Does the setup phase get a different policy from the agent phase, and should both be measured?
- [ ] Can a tenant-bound policy be built for public package registries at all, or only through a mirror?
- [ ] Has anyone published this since 18 Nov 2026? Redo the searches in `prior-work.md` first.

## One-page spec, to fill before any code

```text
Question (one sentence):
Hypothesis, and the result that would refute it:
Setting and threat model:
Environment and tasks (n, source, held-out split):
Conditions (what changes, what stays fixed):
Models and scaffold (versions, effort, budget per run):
Primary metric (and how it is measured from logs):
Baselines (trivial, strongest published):
Sample size and why:
Seeds per condition:
Stopping rule and kill criterion:
Safety: sandbox, egress, disclosure plan:
Cost estimate:
```
