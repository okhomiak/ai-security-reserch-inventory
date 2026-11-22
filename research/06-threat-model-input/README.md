# 06 · Threat model as agent input: does it buy true positives per dollar?

Status: draft brief, 18 Nov 2026. Ranked 6 of 6, score 3.55 out of 5. Not yet run.

## The question

If the same vulnerability-finding agent is given a target-specific threat model first, does it find more
real bugs per dollar and raise fewer false alarms than without one? Does it matter who wrote the threat
model, or is any extra context as good?

## The evidence, as a chain

1. **The best-known AI scanner builds a threat model first, and nobody has isolated what that step is
   worth.** Codex Security "builds a repository-specific threat model" that security teams can edit, then
   validates findings in a sandbox. OpenAI reported false positives down 50% and over-reported severity down
   90% during its beta. A Cloud Security Alliance note points out those figures are unverified and that no
   ablation separates the threat model from everything else in the design
   ([CSA research note, 8 Mar 2026](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/03/CSA_research_note_ai_vulnerability_scanning_market_20260308-csa-styled.pdf)).
2. **Precision is the bottleneck at this scale.** The same note reports 1.2 million commits scanned in 30
   days, 792 critical and 10,561 high-severity findings, and 14 CVEs assigned. It also reports that
   Anthropic's two-week Firefox collaboration produced 112 reports and 22 CVEs. Anthropic is now cutting its disclosure deadline to 30 days
   for high and critical findings because other models rediscover them
   ([policy, 16 Nov 2026](https://www.anthropic.com/research/coordinated-vulnerability-disclosure-timelines)).
   Every false alarm costs a maintainer time that this pace no longer leaves.
3. **The closest experiment switches generic skills on and off, not target context.** On a smart-contract
   audit benchmark, giving one agent a corpus of 83 auditing skills raised its detection score from 79 to 97
   of 120 and its precision from 28.8% to 33.1%. Gains were smaller for three other configurations (3.2% to
   13.9%) and turned negative when the backend model was swapped; only one configuration loaded the skills
   in every audit. No condition gave the agent a threat model of the target, and the authors ask for
   per-skill causal benchmarks
   ([arXiv 2609.29454](https://arxiv.org/abs/2609.29454)).
4. **Threat-model research scores the artefact, not what it changes downstream.** Work on generating attack
   trees from requirements ([arXiv 2610.03820](https://arxiv.org/abs/2610.03820), title) and earlier
   threat-model benchmarks ([ACSE-Eval](https://arxiv.org/abs/2505.11565),
   [ASTRIDE](https://arxiv.org/abs/2512.04785), read earlier) ask whether the model is good, not whether
   having one finds more bugs.
5. **Gap.** There's no controlled ablation of a target-specific threat model as input to a
   vulnerability-finding agent, with a control for simply adding more context.

## Who's asking

- **Frontier labs.** OpenAI ships the design. Anthropic runs scanning at scale. A
  [field-wide agenda](https://arxiv.org/abs/2607.26069) lists threat modelling of AI attacking its host
  infrastructure as a priority, which is a different use of the term but shows the appetite. Either lab
  could use an independent answer on whether the step earns its tokens.
- **Hedge funds and trading firms.** Jane Street hires a threat-modelling engineer whose models turn into
  architectural fixes
  ([posting](https://resumegeni.com/jobs/cybersecurity-engineer-threat-modelling-janestreet-fab65ab964));
  Hudson River Trading hires to assess threats to the AI systems it uses
  ([posting](https://simplify.jobs/p/56a6cd5d-049e-497a-b76d-5c11d8d11384/Enterprise-Security-Engineer)).
- **Crypto.** Audit firms and contest platforms run AI auditors on protocols whose invariants are a threat
  model in all but name. The skills study above ran on their benchmark.
- **Practitioners.** Trail of Bits wrote in September 2026 about what the many posts on agentic code review
  leave out ([post](https://blog.trailofbits.com/2026/09/18/auditing-in-the-age-of-good-enough-ai/), in this
  repo's news feed, not opened).

## The critical view

**The strongest argument against.** This is one ablation of prompt context. A lab can run it in a week on
private data and may already have. The skills study shows the sign of such effects can flip between models
and harnesses, so a result on one scaffold won't generalise and a result on three costs three times as much.
Public benchmarks of known CVEs may be in the training data. And an expert who writes a threat model for a
target with a known bug can leak the answer without meaning to.

**The conflict of interest.** Anyone who builds or sells threat-modelling tools wants a positive result. If
that describes whoever runs this, the study has to be pre-registered, the expert threat models have to be
written by someone blind to the bugs or under a protocol that enforces it, and every artefact has to be
released. Without that, a positive result won't be believed and shouldn't be.

**What would make this worthless.**

- A lab publishing its own ablation.
- No placebo arm. Without one, any gain could be from extra tokens of context and not from the threat model.
- A judge that can't separate true from false findings reliably.
- An effect inside the noise for every model, with too few targets to say so with confidence.

**Scoop risk: medium.** It's an easy study for people with the scanner. It isn't a glamorous one, which is
why it hasn't been published.

**What isn't known yet.** What a scan really costs per target on current models. Whether the public
benchmarks have enough post-cutoff targets. Whether a time-boxed expert threat model is good enough to be a
fair test.

**It's the dearest topic here.** That's most of why it ranks last.

## What would close it

- **Closes when:** a pre-registered study reports true positives per dollar and false positives per true
  positive for the same scanner with and without a target-specific threat model, with a length-matched
  placebo, on at least 30 targets.
- **Blocked by:** the people with scanners sell them, the people with threat-modelling tools sell those, and
  an honest ablation risks an awkward answer for both.
- **Falsifier:** any published ablation of target-specific threat models in automated vulnerability finding.

## Scores

| Criterion | Score | Reason |
|---|---|---|
| Open gap | 4 | Three searches found no ablation. The closest study switches generic skills, not target context. |
| Demand: labs | 4 | One lab ships the design and reports gains without isolating it. |
| Demand: funds | 4 | Two trading firms hire for threat modelling. |
| Demand: crypto | 4 | AI auditing is an active market with its own benchmark. |
| Promise | 4 | Either answer changes how scanners are built and what they spend tokens on. |
| Solo feasibility | 4 | Public benchmarks and a blinded judge. Loses a point to the blind-authoring problem. |
| Budget | 2 | $700 to $1,800. Scanning real repositories under four conditions is expensive. |
| Durability | 3 | Easy for a lab, but unpublished so far. |
| Repo signal | 1 | Mapped needs average a pressure of 0.066. Evaluation is the best-covered area in the inventory. |

## Where it sits in this inventory

- **Needs:** `n.evals` (mean demand 3.29, 9 of 28 organisations at 4+, 61 papers) and `n.offensive` (3.21, 12
  of 28, 40 papers).
- **Leaves:** `cyber.vulndiscovery` (6 papers), `cyber.defense` (6), `eval.benchmark` (26).
- **Authored gap:** none. The nearest is `gap-offence-defence-asymmetry`, on the defender's side of the same
  tools.
- **Closest papers already in the inventory:** From Naptime to Big Sleep (`web:project-zero-big-sleep`) and an
  early study of models on smart-contract audits (`arxiv:2306.12338`).

## If it works

A paired dataset of scans with and without threat models, the threat models themselves, and one number that
scanner builders can act on. A null result with enough power is as useful as a positive one.

See [prior-work.md](prior-work.md) for what was checked and [plan.md](plan.md) for the draft study.
