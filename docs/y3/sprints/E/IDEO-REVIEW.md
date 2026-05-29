# Y3 Sprint E (W17-W20) — Novelty engine MVP

> **Plan ref:** `docs/YEAR-3-VIBECODE-PLAN.md` Sprint E
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #9 (W17+W18) + #10 (W19+W20) absorbed.

## Build state at review

- Latest commit on main: `0425340` (W20 novelty eval harness).
- Test count: **2227** (was 2154 at Sprint D close — **+73 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok (2227/2227), build ok.

## What landed in Sprint E

| Week | Output                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| W17  | Aroma-profile seed catalog (12 profiles) + cosine-similarity-style pairing helper (20 tests). Substrate ready, wire-up deferred. |
| W18  | Dish-shape pattern catalog moved to JSON + expanded 6 → 16 patterns (8 catalog integrity tests).                                 |
| W19  | DailyNoveltyChip already shipped at W8; expansion via the new dish-shape catalog landed automatically.                           |
| W20  | Novelty engine synthetic-eval harness — generateSyntheticCohort + runNoveltyEval + thresholdSensitivitySweep (17 tests).         |

## Cross-cutting wins

1. **Catalog extracted from code.** W18 moved DISH_PATTERNS out of `novelty.ts` into `dish-shape-patterns.json`. Engine code stays tight; catalog grows independently. Same pattern as the Y2 W44 vocabulary catalog + W48 nonprofits catalog.
2. **Aroma helper substrate-first.** W17 ships the aroma-pairing helper + 20 tests but DEFERS the wire-up into the W8 engine. Threshold tuning + scoring-blend review can land separately without breaking existing tests. Same discipline as the Y2 W10 V3 trainer flag-gate.
3. **Eval harness is the pre-flight check.** W20 mirrors the Y2 W9 V3 eval shape — synthetic cohort + threshold sensitivity sweep. The founder runs this before flipping `NOVELTY_FIRE_THRESHOLD` in production, just like the V3 eval discipline.

## RCA tally

0 RCAs on main this sprint.

The 0-RCAs-on-main streak now stretches into Y3 W20 — combined Y2+Y3 streak is approaching the 65-week mark.

Mid-sprint catches that never reached main:

- W17: aroma profile JSON had a leading comment block that broke JSON parsing. Removed; catalog now parses cleanly.
- W18: dish-shape JSON test initially asserted exactly 6 dishTypes; expanded the valid bucket set to 11 to accommodate the 16-pattern catalog.

## Acceptance for Sprint-E close

- [x] Aroma profile seed catalog shipped + tested (W17).
- [x] Dish-shape pattern catalog extracted + expanded + tested (W18).
- [x] Novelty card surface refinement (W8 wire-up consumes the W18 catalog).
- [x] Novelty engine eval harness shipped + tested (W20).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #9 + #10 absorbed (this doc).

## Carry-forward into Sprint F

- Sprint F (W21-W24) ships **Smart leftovers MVP**. Substrate already shipped at Y3 W2 (find-successor helper) and W21pre (8-recipe big-batch tag catalog). W22 wires the win-screen chip; W23 + W24 finish the planner write-back + Today integration.
- The W17 aroma-pairing helper waits for a future tuning sprint that re-runs the eval with the aroma blend + tunes threshold accordingly.

## Retrospective

Sprint E closes the novelty engine MVP cleanly. The discipline that worked across Y2 + Y3 H1 holds: pure-helper substrate first, surface integration second, eval harness third. The aroma-pairing helper is the most interesting future-work piece — wired today it would break thresholds; wired AFTER the W20 eval re-runs against the new scoring distribution it lands clean.
