# Y5 Sprint A (W1-W4) — Cohort segmentation substrate

> **Plan ref:** `docs/YEAR-5-VIBECODE-PLAN.md` Sprint A
> **Date closed:** 2026-12-27
> **Bi-weekly IDEOs:** #15 (W1+W2) + #16 (W3+W4) absorbed.

## Build state at review

- Latest commit on main: `db94e7f` (W3 dashboard summary).
- Test count: **2595** (was 2561 at Y5 open — **+34 this sprint**).
- Four-gate green throughout.

## What landed in Sprint A

| Week | Output                                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| W1   | `segmentation.ts` — UTC-based ISO-week-key + 4-tier classifier + buildSegmentLabel + rollupCohorts + totalsByTier. 17 tests. |
| W2   | `snapshot-ledger.ts` — buildSnapshot + buildTierTrend + diffSnapshots + pickSnapshotAt. 9 tests.                             |
| W3   | `dashboard-summary.ts` — summariseCohortDashboard composing W1 + W2 into a Y4-style summary bundle. 8 tests.                 |
| W4   | Sprint A close + retro (this doc).                                                                                           |

## Cohort phase opens

Y5 Sprint A lands the substrate that every later Y5 sprint pivots on:

- The 4-tier engagement classifier (dormant / casual / regular / core) gives the V4 trainer (W5-W8 Sprint B) a stable per-segment vector.
- The (acquisitionWeek × engagementTier) segment key is what the retention analytics (W9-W12 Sprint C) joins against.
- The snapshot ledger drives the dashboard's growth-over-time line + the W26 retention curves.

## Cross-cutting wins

1. **Y4 dashboard pattern repeated.** The W3 summary helper is the fifth instance of the Y4 W3/W7/W22/W27 pattern (latest snapshot strip + delta vs previous + per-key rollup). Predictable shape across all monitoring surfaces.
2. **Substrate-first held at year boundary.** Y5 W1 didn't ship UI; it shipped the pure helper. Y5 W2 added the snapshot ledger; Y5 W3 added the summary. The dashboard route lands later in the year as a thin presenter, the same way Y4 W3 + W7 + W22 + W27 did.
3. **One mid-week catch held the streak.** W1 had a UTC-vs-local bug in the ISO week-key math (`date.getFullYear()` vs `date.getUTCFullYear()`). Caught by the test gate, fixed before commit; never reached main.

## RCA tally

0 RCAs on main this sprint. Combined Y2+Y3+Y4+Y5 streak now ~129 weeks.

Mid-sprint catches that never reached main:

- W1: ISO week-key used local-time getters; UTC test inputs hit the local-zone boundary and produced W18 instead of W19. Switched to `getUTCFullYear() / getUTCMonth() / getUTCDate()`.
- W2: First `buildSnapshot` re-imported `buildSegmentLabel` from W1, creating a future circular import once the storage layer lands. Inlined the ISO week-key helper to keep W2 self-contained.

## Acceptance for Sprint-A close

- [x] Cohort segmentation pure helper shipped (W1).
- [x] Snapshot ledger shipped (W2).
- [x] Dashboard summary helper shipped (W3).
- [x] Sprint A close doc filed (W4, this doc).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #15 + #16 absorbed.

## Carry-forward into Sprint B

- Sprint B (W5-W8) ships **V4 trainer (cohort + temporal)**: time-windowed retune of the Y4 W26 cohort retune; recency weighting; per-segment weight vectors that the W1 segment label keys into.
