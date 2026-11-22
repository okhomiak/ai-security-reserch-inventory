# Draft research plan: threat model as agent input

Draft v0.1, 18 Nov 2026. Nothing has been run. This is the starting point for the detailed analysis, not a
commitment.

## Research question

Holding the scanner, the model and the budget fixed, does a target-specific threat model given as input change
true positives per dollar and false positives per true positive? Is any effect due to the threat model, or
just to more context?

## Hypotheses and what would refute them

| | Hypothesis | Refuted if |
|---|---|---|
| H1 | A target-specific threat model raises true positives per dollar over no threat model. | The paired difference is zero or negative within its interval. |
| H2 | It lowers false positives per true positive. | No change, or more false positives. |
| H3 | The gain exceeds that of a length-matched generic security checklist. | The placebo does as well. |
| H4 | A threat model written for a different target does worse than none, which would show content matters. | The wrong threat model helps as much as the right one. |
| H5 | An expert-written threat model beats a model-generated one. | No difference, or the generated one wins. |

H3 is the one that matters. If the placebo matches the threat model, the honest headline is "more context
helps", and threat modelling as such gets no credit.

## Design in one paragraph

A paired ablation on a public benchmark. Every target is scanned under four conditions by the same scanner,
and a subset under a fifth. Findings are scored by a judge that can't see the condition, and by executable ground truth where the
benchmark has it. The primary metric and the analysis are registered before the full run.

## Conditions

| | Condition | What the scanner receives before scanning |
|---|---|---|
| C0 | None | The repository only |
| C1 | Generated | A threat model the same model writes from the repository, in a separate call |
| C2 | Expert | A threat model written by a person from documentation and architecture only, time-boxed, blind to the known bug |
| C3 | Placebo | A generic secure-coding checklist of the same length |
| C4 | Wrong | The C1 threat model of a different target |

Run C0, C1, C3 and C4 on every target. C2 costs human hours, so run it on a subset.

## Keeping C2 honest

Whoever writes the expert threat models must not know which vulnerability the benchmark holds for that
target. Options, in order of preference: a second person writes them; they're written before the target's
ground truth is looked up, with a signed and dated log; or C2 is dropped. If the author has a commercial
interest in threat modelling, the first option is the only one a reviewer will accept.

## Targets

- Thirty targets from a benchmark of AI-found CVEs pinned at the vulnerable commit
  ([HoF-Bench](https://arxiv.org/abs/2607.27030)), with executable checks where a second benchmark supplies
  them ([CyberGym](https://arxiv.org/abs/2506.02548)).
- A second arm of ten smart-contract audits, where a protocol's stated invariants play the role of the threat
  model.
- Prefer vulnerabilities disclosed after the scanner model's training cutoff. Report results split by that
  date.
- Strip or neutralise code comments that address a reviewer, to control a known steering effect.

## Scanner and models

One open scaffold for every condition, with fixed tools and a fixed spend cap per scan. Two models: one
frontier and one small, since small models are reported to rediscover many AI-found bugs. Two seeds per cell
in the full run.

## Scoring

- A judge blind to condition marks each finding as matching the known vulnerability, a different real issue,
  or false. Validate the judge on 100 hand-labelled findings before the full run.
- Where a proof of concept exists, reproduction is the ground truth and overrides the judge.
- Run a published benchmark checklist on the scoring. A scanner that returns nothing must score zero.

## Metrics

- True positives per dollar. Primary metric, registered in advance.
- False positives per true positive.
- Severity calibration against the recorded severity.
- Tokens and wall-clock time per scan, including the cost of producing the threat model.

## Statistics

Paired across targets: each target is its own control. Bootstrap the paired differences, clustered by target.
Correct for the four planned comparisons against C0.

## Sample size

- **Pilot:** 5 targets, 4 conditions, 1 model, 2 seeds. That's 40 scans.
- **Full:** 30 targets, 4 conditions, 2 models, 2 seeds. That's 480 scans. C2 on 10 targets adds 40.

Thirty paired targets detect a large effect and miss a small one. Say so in the paper. If the pilot's
variance suggests thirty isn't enough, raise the target count before the full run, not after.

## Budget

Cost per scan is the biggest unknown. Assume three to seven times the $0.45 that a 50-turn shell trajectory
cost in one published benchmark ([StealthBench](https://arxiv.org/abs/2607.26314)), so about $1.30 to $3.20.

- Pilot: 40 scans is about $50 to $130.
- Full: 520 scans is about $680 to $1,660.
- Total: about $700 to $1,800. Replace the assumption with the pilot's measured cost before the full run.

## Timeline at about 10 hours a week

| Week | Work | Output |
|---|---|---|
| 1 | Registration document; scanner scaffold; judge prompt | Registered plan |
| 2 | Generate C1, C3 and C4 inputs; arrange C2 authorship | Inputs |
| 3 | Pilot; validate the judge | Real cost per scan |
| 4 | Kill check; adjust target count | Go or stop |
| 5 to 7 | Full runs | Raw results |
| 8 | Analysis | Tables |
| 9 to 10 | Write-up; release | Preprint draft |

## Kill criteria

- The judge agrees with hand labels at a kappa below 0.7 and can't be fixed.
- The pilot's cost per scan is more than twice the assumption and can't be capped.
- A lab publishes its own ablation. Replicate it independently on public targets or stop.
- No blind author can be found for C2. Run without it and say so.

## Safety, ethics and disclosure

- Only vulnerabilities that are already public and fixed. No hunting for new ones in the main study.
- Any new finding that turns up goes to the maintainers through coordinated disclosure before anything is
  published.
- Declare any commercial interest in threat modelling in the paper.
- No employer, client or personal data.

## What gets released

The registration, every threat model, the scanner scaffold, the judge prompt and its validation set, all
findings and scores, and a short paper.

## Where to publish

A preprint in arXiv cs.CR with cs.SE cross-listing; a security or software-engineering venue; a post that
leads with the paired difference and its interval.

## Open questions for the detailed run

- [ ] Which benchmark has enough targets after the model cutoffs?
- [ ] What does one scan cost on each model, measured, not assumed?
- [ ] Who writes the expert threat models, and how is blindness shown?
- [ ] What format should the threat model take: free text, data-flow list, trust boundaries, abuse cases?
- [ ] Is a length-matched checklist a fair placebo, or should it be a neutral architecture summary?
- [ ] Does the smart-contract arm need its own scaffold?
- [ ] Has anyone published this since 18 Nov 2026? Redo the searches in `prior-work.md` first.

## One-page spec, to fill before any code

```text
Question (one sentence):
Hypothesis, and the result that would refute it:
Targets (n, source, share after model cutoff):
Conditions (what changes, what stays fixed):
Scanner, models and spend cap per scan:
Primary metric (registered before the full run):
Baselines (no threat model; placebo; wrong threat model):
Sample size and why:
Seeds per cell:
Judge validation result:
Stopping rule and kill criterion:
Safety: public vulnerabilities only, disclosure plan, conflicts declared:
Cost estimate:
```
