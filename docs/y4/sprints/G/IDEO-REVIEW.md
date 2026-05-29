# Y4 Sprint G (W25-W28) — V3 trainer retune substrate

> **Plan ref:** `docs/YEAR-4-VIBECODE-PLAN.md` Sprint G
> **Date closed:** 2026-11-15
> **Bi-weekly IDEOs:** #13 (W25+W26) + #14 (W27+W28) absorbed.

## Build state at review

- Latest commit on main: `ae0265e` (W27 drift evaluator).
- Test count: **2538** (was 2512 at Sprint F close — **+26 this sprint**).
- Four-gate green throughout.

## What landed in Sprint G

| Week | Output                                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------- |
| W25  | `trainer-feedback-log.ts` — per-recommendation feedback aggregator with dimension deltas. 11 tests.                       |
| W26  | `trainer-retune.ts` — cohort weight-update proposal generator with cold-start gate + signal floor + per-dim cap. 7 tests. |
| W27  | `trainer-drift.ts` — drift evaluator + dashboard summary helper. 8 tests.                                                 |
| W28  | Sprint G close + retro (this doc).                                                                                        |

## V3 trainer retune cycle (Sprint G view)

The full cycle now consists of:

1. **Y2 W6 ScoreBreakdown persistence** — captures per-dim scores at pick time.
2. **Y2 W7 V3 trainer** — personal-level per-dim weight learning.
3. **Y4 W25 feedback log** — captures cooked / scheduled / rerolled / dismissed signal per shown side.
4. **Y4 W26 retune proposer** — pure helper composing aggregate → CohortWeights proposal with rate-limit guards.
5. **Y4 W27 drift evaluator** — quantifies the retune's L1 distance + categorises (stable / minor / moderate / major).
6. **Y4 W27 dashboard summary** — composes proposal + feedback into a dashboard-ready bundle.

The actual offline retune job runs founder-gated (needs real cohort data from production users); this sprint locked the deterministic pure transformations so when the data arrives, the math is already baked + tested.

## Cross-cutting wins

1. **Two-tier rate limiting.** Personal V3 trainer caps at ±0.10 per dim per cycle (Y2 W7). Cohort retune (W26) caps at the same ±0.10 plus a 30-cook minimum sample. Conservative on top of conservative — cohort changes affect every user, so the threshold is intentionally raised.
2. **Drift category surfaces signal strength.** A "major" drift (L1 ≥ 0.15) means at least two dimensions are at cap simultaneously — strong cohort-wide signal. "Stable" (< 0.02) means even with 30+ cooks, no measurable cohort preference shift. The dashboard chip turns this into an at-a-glance KPI.
3. **Same substrate pattern, fourth instance.** The aggregator + summary + dashboard pattern from Sprint A (LLM spend), Sprint B (charity), Sprint F (push delivery) repeats here in Sprint G. Sprint H carries the pattern to its fifth instance with editorial publication metrics.

## RCA tally

0 RCAs on main this sprint. Streak at **~123 weeks**.

Mid-sprint catches:

- W25: First `dimensionDeltas` implementation divided by length even when zero — would have produced NaN in tests. Added the cooked-and-rerolled both-non-zero gate.
- W26: First proposal returned the input weights raw without renormalising. Added the renormaliseWeights call so the proposed vector still sums to 1.
- W27: Drift category threshold draft used `L1 < 0.05 → minor` which would have flagged every retune as moderate at the cap. Tightened to L1 < 0.02 stable / < 0.06 minor / < 0.15 moderate.

## Acceptance for Sprint-G close

- [x] Trainer feedback log shipped (W25).
- [x] Cohort retune proposal shipped (W26).
- [x] Drift evaluator + summary shipped (W27).
- [x] Sprint G close doc filed (W28, this doc).
- [x] All four gates green throughout.

## Carry-forward into Sprint H

- Sprint H (W29-W30 portion) ships **editorial content schema + clinician credit + publication queue + content tab wire-up**. The Y4 dashboard pattern lands its fifth instance with the editorial publication metrics surface.
