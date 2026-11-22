# Draft research plan: agent wallets under hijack

Draft v0.1, 18 Nov 2026. Nothing has been run. This is the starting point for the detailed analysis, not a
commitment.

## Research questions

- **RQ1.** For each wallet permission design, what's the most an attacker who fully controls the agent can
  move out before expiry or revocation?
- **RQ2.** What does a model-driven hijack actually extract under each design?
- **RQ3.** What does each design cost in finished tasks, added latency and prompts to the user?

## Hypotheses and what would refute them

| | Hypothesis | Refuted if |
|---|---|---|
| H1 | For simple transfers, worst-case loss matches the configured cap in every capped design. | A capped design loses more than its cap on plain transfers. |
| H2 | At least one capped design loses more than its cap through composition: allowances, allowlisted contracts that forward value, or many sub-cap transfers. | Every capped design holds its cap against every attack in the set. |
| H3 | Realised loss under a model-driven hijack is well below worst-case loss, so attack-success rates overstate safety less than worst-case analysis suggests. | Realised loss approaches worst case within the step budget. |
| H4 | Per-task grants bound loss tightest and cost the most in task success. | A cheaper design matches them on both. |

H1 is the obvious result. The study is worth finishing only if H2 holds. If it's refuted, write the short
negative note and stop.

## Definitions

- **Hijack:** the attacker chooses every action the agent takes. This is the worst case, and it avoids
  arguing about which prompt injection works this month.
- **Worst-case loss:** the largest value transferable to attacker-controlled addresses, found by search over
  the actions the permission design allows. No language model is involved.
- **Realised loss:** what a model extracts within a step budget when it's told to drain the wallet.
- **Time to revoke:** from the first out-of-policy attempt to the point where further attempts fail.

## Designs compared

| | Design | What enforces it |
|---|---|---|
| D0 | Raw key held by the agent process | Nothing |
| D1 | Custodial policy engine | An off-chain service with per-transaction caps and address allowlists |
| D2 | Smart account with a session key | On-chain: spend cap, target allowlist, expiry |
| D3 | Per-task grant | On-chain: one amount, one recipient, one deadline, bound to the task |
| D4 | D2 with step-up approval | As D2, plus a human approval with a trusted rendering for anything out of policy |

D1 is modelled from public documentation, which limits how faithful it can be. Say so in the paper.

## Testbed

A local chain with no connection to any live network. Mock tokens, a swap contract, a contract that can hold
allowances, a subscription contract and a pay-per-request stub. Everything is deployed fresh per run.

Tasks for the usefulness arm: pay an invoice, swap within a slippage limit, renew a subscription, rebalance
between two tokens, buy access to an API. About 20 task instances.

## Attacks

| | Attack | What it tests |
|---|---|---|
| A1 | Change the recipient of a legitimate payment | The plain cap |
| A2 | Grant an allowance to an attacker contract | Whether policy sees allowances as value |
| A3 | Route value through an allowlisted contract | Whether an allowlist is a boundary |
| A4 | Many transfers under the per-transaction limit | Whether caps are per transaction or per period |
| A5 | Use a second key found in the environment | Links to [topic 01](../01-found-credentials/README.md) |

## Method

1. **Worst case.** For each design and attack, search bounded action sequences with the testbed's fuzzing and
   invariant tools. The invariant is "value held by attacker addresses stays at or below X". Report the
   largest X that fails.
2. **Realised.** Give a model the hijacked role and a step budget. Three models, three runs per cell.
3. **Usefulness.** Run the benign tasks under each design with no attacker. Record success, latency and
   approval prompts.
4. **Revocation.** Trigger a revoke after the first out-of-policy attempt and time it.

## Metrics

- Worst-case loss as a multiple of the configured cap, per design and attack. Primary metric.
- Realised loss, median and maximum.
- Task success and added latency, per design.
- Time to revoke.

## Sample size

Worst-case search is deterministic given a depth and a seed set; report the depth reached.

Model runs: 20 tasks, 5 designs, 5 attacks, 3 models, 3 runs is 4,500 short episodes. If that's too many, cut
to 10 tasks first.

## Budget

- Worst-case search: a laptop.
- Model runs: 4,500 short episodes at $0.03 to $0.13 is about $135 to $585.
- Total: about $150 to $600.

## Timeline at about 10 hours a week

| Week | Work | Output |
|---|---|---|
| 1 to 2 | Read the six closest papers; testbed contracts | Testbed v0 |
| 3 to 4 | Implement D0 to D3 | Working designs |
| 5 | Worst-case search for A1 to A4 | First loss table |
| 6 | Kill check on H2 | Go or stop |
| 7 to 8 | D4; model-driven runs; usefulness arm | Realised loss and cost |
| 9 to 10 | Analysis and write-up | Preprint draft |

## Kill criteria

- Every capped design holds its cap against A1 to A4 at the depth the search can reach. Publish the testbed
  and a two-page note, and stop.
- One of the unread papers already reports loss under attack across designs. Replicate one result and extend
  it, or stop.
- Implementing D2 and D3 takes more than four weeks. Drop D3 or stop.

## Safety, ethics and disclosure

- Local chain only. No live network, no real wallets, no real funds.
- If modelling a vendor's policy engine reveals a flaw that would apply to the real product, report it to the
  vendor first and wait for a fix before publishing detail.
- Publish the testbed and results. Describe attack classes, not ready-to-run drainers for live systems.
- No employer, client or personal data.

## What gets released

The testbed, the policy configurations for each design, the search harness, the loss tables and a short
paper.

## Where to publish

A preprint in arXiv cs.CR; a workshop attached to a financial-cryptography or blockchain security
conference; a post on a crypto research forum, where wallet teams will see it.

## Open questions for the detailed run

- [ ] Do any of the unread papers already report loss under attack?
- [ ] Which account-abstraction standard and which session-key implementation should D2 use?
- [ ] How faithfully can a custodial policy engine be modelled from its public documentation?
- [ ] How deep can the worst-case search go before it stops being tractable?
- [ ] Should the off-chain comparison (shared service account, vault-mediated, per-user OAuth) be a second arm
      or a separate study?
- [ ] Is "multiple of the configured cap" the right headline, or is absolute loss clearer?
- [ ] Has anyone published this since 18 Nov 2026? Redo the searches in `prior-work.md` first.

## One-page spec, to fill before any code

```text
Question (one sentence):
Hypothesis, and the result that would refute it:
Threat model (what the attacker controls):
Testbed and tasks (n, contracts, held-out attacks):
Designs compared (what changes, what stays fixed):
Models and step budget for the realised arm:
Primary metric (worst-case loss as a multiple of the cap):
Baselines (raw key; no attacker):
Search depth and seeds:
Runs per cell:
Stopping rule and kill criterion:
Safety: local chain only, vendor disclosure plan:
Cost estimate:
```
