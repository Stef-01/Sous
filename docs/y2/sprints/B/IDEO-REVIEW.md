# Y2 Sprint B (W6-W10) — Pairing-engine V3 substrate close

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint B
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #3 (W7) + #4 (W9 V3-vs-V2 eval) absorbed
> into this sprint close.

## Build state at review

- Latest commit on main: HEAD (pre-W10 commit pending after this doc).
- Test count: **1209** (was 1121 at Sprint A close — **+88 this sprint**).
- Four-gate green: `pnpm lint` ✓, `pnpm exec tsc --noEmit` ✓, `pnpm test` ✓ (1209/1209), `pnpm build` ✓.

## What landed in Sprint B

| Week | Output                                                                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W6   | Score-breakdown attachment substrate — sessionStorage handoff between result-stack pick and cook-page session start, slug-match-gated, freshness-windowed |
| W7   | V3 per-dimension trainer — accepted/rejected/neutral classifier, per-dim delta, signed shifts capped at 0.10, renormalisation, cold-start at 8 breakdowns |
| W8   | V2↔V3 hybrid composer — pickTrainerMode, composeUserWeights, telemetry fields surfaced through useUserWeights                                             |
| W9   | V3 synthetic eval harness — generateSyntheticHistory, scoreTrainerAgainstHeldOut, runV3Eval; eval result honestly captured                                |
| W10  | **V3 opt-in gate** — `SOUS_V3_TRAINER_ENABLED` / `NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED` flag added; default V2 path active in production                   |

## V3-vs-V2 eval result (the load-bearing W9 finding)

Eval cohort: 100 synthetic users × 12 cooks-with-breakdowns × 60 held-out candidates per user, latent-weight model with one dominant dimension, 30% rejection rate. Seed 42 for reproducibility.

| Metric                 | V2 (cuisine + rating + favorite only) | V3 (per-dimension breakdown) | Delta   |
| ---------------------- | ------------------------------------- | ---------------------------- | ------- |
| Avg held-out agreement | 0.6230                                | 0.5785                       | -0.0445 |
| V3 wins?               | —                                     | —                            | **No**  |

V3 underperformed V2 by 4.5pp on the synthetic cohort. **This is the eval doing its job.** Per the W9 plan acceptance criterion + Y2 risk register, V3 ships behind an opt-in flag rather than auto-firing.

### Why V3 lost on this eval

V3 derives its weight shifts from the mean per-dimension score gap between accepted and rejected pools. With only 12 cooks per synthetic user and a 30% rejection rate (~3-4 rejected cooks), the per-dim deltas are noisy — the noise floor at 0.05 cuts off real signal alongside garbage. V2's metadata-only signal (cuisine family + rating + favorite) compresses to a stronger prior at 12 cooks because the cuisine dim alone carries most of the variance in the held-out scoring.

V3 is expected to win when:

- Cooks-per-user climbs past ~30 (more accepted/rejected samples per dim)
- The held-out scoring uses per-dim weights that match V3's output shape (current scorer uses ScoreBreakdown × weights, which V2 already aligns with)
- Hyperparameters (V3_MAX_DELTA, V3_NOISE_FLOOR, V3_COLD_START_THRESHOLD) get tuned on real cohort data

## W10 decision: gate without ripping

**V3 stays. Substrate stays. The flag stays off in production.**

- `pickTrainerMode(breakdownCount, v2EligibleCount, v3Enabled)` — `v3Enabled` defaults to false. V3 only fires when the third arg is true.
- `composeUserWeights(sessions, options)` — reads `process.env.SOUS_V3_TRAINER_ENABLED` and `process.env.NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED`; either equal to the literal string `"true"` flips the gate.
- `recipe_score_breakdowns` table continues to populate. `attachScoreBreakdown` continues to wire breakdowns into cook sessions. **The data flywheel runs even with V3 dormant**, so the V4 retune (when it lands) has the full backfill.
- `useUserWeights` exposes `v3Enabled` in its return shape so dev tools / IDEO tooling can observe the gate state without surfacing it in user-facing UI.

This matches the Karpathy "define success upfront" principle — the W9 acceptance criterion was "V3 must beat V2 by ≥ 5pp on the synthetic eval to default-on". It didn't; we honour the criterion + ship the gated alternative.

## Cross-cutting wins

1. **The eval harness is reusable.** `runV3Eval` is parameterised on cohort size, cooks-per-user, held-out count, seed, and win threshold. Future trainer iterations (V4 hyperparameter retune, V5 with embedding distances) plug into the same scorer. Reproducibility built in via the seeded RNG.
2. **The flag pattern compounds.** Same shape as Y1 W22 voice + Y1 W46 pod + Y2 W1 auth: env-var → real path vs default path. Three layers of gating today (auth-flag, photo-pipeline, V3-trainer) all share one mental model.
3. **Telemetry surfaces all the way to the hook.** `trainerMode`, `breakdownCookCount`, `v2EligibleCookCount`, `v3Enabled` flow from composer → hook → caller, so the IDEO retro can compare V2 vs V3 deltas across real cohorts the moment the flag flips for an experiment slice.

## RCA tally

0 RCAs on main this sprint.

The W9 eval result is **not** an RCA — the eval was designed to catch exactly this case before it shipped. The RCA standard for the H2 0-on-main streak holds: "the rule existed but wasn't enforced". W9 enforced its rule.

Mid-sprint catches that never reached main:

- W6: emoji-only-filename test had wrong expected — caught at first test run, fixed before commit.
- W7: TypeScript `as Record<string, unknown>` failed because ScoreBreakdown lacks index signature. Fixed with double-cast `as unknown as Record<...>`. Caught by typecheck, never built.
- W8: TypeScript navigator narrowing in share button — caught by typecheck.

## Carry-forward into Sprint C

- Sprint C (W11-W14) ships **Time-of-day reranker + Cook-again loop**. No dependency on V3 — the reranker reads time + cuisine, not per-dim weights.
- V3 + the eval harness stay in tree, dormant. When real-cohort data accumulates (post-Postgres unlock + ~30 cooks per user across a bake) the V4 retune cycle re-runs `runV3Eval` against the real distribution + tunes hyperparameters; the flag flips when V4 wins.
- The `useUserWeights` `v3Enabled` field is the IDEO observability hook for that future flag flip.

## Acceptance for Sprint-B close

- [x] Score-breakdown attachment shipped + tested (W6).
- [x] V3 trainer shipped + tested (W7).
- [x] Hybrid composer shipped + tested (W8).
- [x] V3 eval harness shipped + result honestly captured (W9).
- [x] V3 gate added; production default stays V2 (W10).
- [x] All four gates green throughout.
- [x] Eval delta and decision documented (this doc).

## Retrospective

Sprint B is the first sprint where a planned feature didn't outperform its predecessor on the agreed metric — and the discipline held. V3 stays in the tree, the data flywheel keeps running, but the flag stays off until real data + retuning prove the case. **The eval did the eval's job.** Year-2's Karpathy commitment ("define success upfront") earned its keep.

Sprint C opens with a different shape (rerank rules, not learned weights) so the V3 question doesn't block the next sprint. Bi-weekly IDEO #5 will land at W12 with the time-of-day reranker mid-build review.
