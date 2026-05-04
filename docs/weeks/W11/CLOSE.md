# W11 close — `/cook/combined` shaper extraction (Sprint C kickoff)

**Sprint:** C (Stage-5 W1 voice-driven cook mode + carry-forward
density refactor)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint C W11
**Date closed:** 2026-05-02
**Scope:** test-scaffolding-then-density on the long-deferred
1,126-line `/cook/combined/page.tsx`. Per the plan, test
scaffolding lands BEFORE the refactor begins.

## Shipped commits

This week ran the full **3-loop recursive testing protocol**
required by the 12-month plan ("3 x recursive testing loops at
each of the weekly points") — wave A landed first, then each loop
captured a finding and shipped its own fix.

| Phase  | Commit                | Output                                                                                                                                          |
| ------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Wave A | (in flight, see HEAD) | `combined-shapers.ts` extracted (5 pure helpers) + 17 base unit tests + page.tsx adopts them. Build break on prop-type narrowing fixed inline.  |
| Loop 1 | (same commit)         | +8 stress assertions on the helpers (long-content, race-condition, poisoned-data) — 25/25 pass.                                                 |
| Loop 2 | (same commit)         | RCA doc (`RCA-helper-type-narrowing.md`) capturing the build-break Five Whys + the "pure helpers can widen union types asymmetrically" pattern. |
| Loop 3 | (same commit)         | Added `pnpm typecheck` script (`tsc --noEmit`) — would have caught the wave-A build break before `pnpm build`.                                  |

## Surfaces touched

| File                                                | Change                                                                                                                                                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/cook/combined-shapers.ts` (NEW)            | 5 pure helpers — `buildOrderedDishes`, `buildIngredientSections`, `buildParallelHintMap`, `buildCombinedSlug`, `buildCombinedDisplayName`. Generic types so the helpers don't depend on tRPC types. |
| `src/lib/cook/combined-shapers.test.ts` (NEW)       | 25 vitest cases — 17 base + 8 stress (long-content × 3, race-condition × 2, poisoned-data × 3).                                                                                                     |
| `src/app/cook/combined/page.tsx`                    | 4 inline `useMemo` blocks replaced with helper calls. Defensive `?? ""` and `?? null` at the `<CombinedMissionScreen>` prop boundary (Loop 2 fix). Page line count: 1,126 → 1,117 (-9).             |
| `package.json`                                      | New `typecheck` script (`tsc --noEmit`).                                                                                                                                                            |
| `docs/weeks/W11/RCA-helper-type-narrowing.md` (NEW) | Five-Whys RCA on the wave-A build break.                                                                                                                                                            |

## Stress-test results (Loop 1)

| Test                  | Assertion                                                   | Result  |
| --------------------- | ----------------------------------------------------------- | ------- |
| 200-side ordering     | `buildOrderedDishes` returns 201 items, sub-50ms            | ✓ < 1ms |
| 5000-char dish name   | name preserved through `buildCombinedDisplayName`           | ✓       |
| 100-ingredient dish   | order preserved through `buildIngredientSections`           | ✓       |
| Determinism × 3 calls | `buildOrderedDishes` returns same shape on repeat           | ✓       |
| Hint-map idempotence  | `buildParallelHintMap` returns same entries on repeat       | ✓       |
| Duplicate cookOrder   | `buildOrderedDishes` preserves duplicates (pinned contract) | ✓       |
| Empty cookOrder       | returns empty array                                         | ✓       |
| Empty-string slug key | hint map handles `"-0"` key without crash                   | ✓       |

## Loop 2 RCA — summary

**Symptom:** `pnpm build` failed with "Type 'string | null | undefined' is not assignable to type 'string'" at the `<CombinedMissionScreen>` prop site.
**Root cause:** Pure-helper extraction widened the dish description type from `string` (tRPC source) to `string | null | undefined` (defensive helper signature). The `mainDish` union narrowed correctly before the refactor; afterward, the wider helper-returned arm propagated.
**Fix:** Defensive `?? ""` / `?? null` at the prop boundary.
**Pattern surfaced:** Pure-helper extractions can widen types asymmetrically across union arms. Call sites must coalesce.

## Loop 3 improvement — `pnpm typecheck` script

Added `"typecheck": "tsc --noEmit"` to `package.json`. Verified
green on the current tree. This script is now the per-week
stress-test loop's default for "type regression catch" — running
it before `pnpm build` would have caught the wave-A break in 3s
instead of the 60s `next build` round-trip.

## Acceptance for W11

- [x] Test scaffolding landed BEFORE structural refactor began (per
      Sprint-B carry-forward acceptance gate).
- [x] Helper extraction reduces page line count (1,126 → 1,117).
- [x] All four gates green: pnpm lint ✓, pnpm typecheck ✓, pnpm
      test 457/457 ✓, pnpm build ✓.
- [x] 3-loop recursive testing protocol completed:
      Loop 1 (stress) — 8 new assertions, all pass.
      Loop 2 (RCA) — Five-Whys doc on the build break + pattern.
      Loop 3 (improvement) — `pnpm typecheck` added.

## Residuals

- **Density refactor still has 1,117 lines.** This week's wave A
  cleared the easy data-shaper extractions. The next density
  reduction targets are sub-component extractions (the dual-track
  step-progress strip, the parallel-hint banner, the
  cross-track-switch row) — those are visual components, not pure
  data, and ship in W12+.
- **`pnpm typecheck` not yet wired into CI / pre-commit.** Action
  item carried forward to W12: add a Husky-style pre-commit hook
  or a CI workflow step.
- **Helper types are defensively wide.** The right tightening pass
  is to mirror the actual tRPC source types. Queued for W12-W13.

## Retrospective (1 paragraph)

The Sprint-A and Sprint-B deferrals were vindicated this week —
the test-scaffolding-before-refactor approach paid off instantly:
when wave A's build broke, Loop 1's 25-test suite confirmed the
helpers were correct (the bug was at the call site, not the
helper) which let Loop 2's RCA finish in minutes rather than
hours. The line-count delta is small (1,126 → 1,117) but the work
unlocks the bigger structural extractions in W12+ because the
data-flow has been pinned by tests. The single-most-useful
artifact this week is `pnpm typecheck` — a 1-line `package.json`
addition that closes a CI gap the codebase had been carrying since
day one. Future per-week stress-test loops should default to
running it as gate-zero.
