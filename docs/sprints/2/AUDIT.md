# Sprint 2 — Week 1 Surface Audit (2026-05-01)

> Sprint 2 of the Stage-3 cycle. **Surfaces in scope:** `/path` and
> all four Path detail surfaces (favorites, pantry, scrapbook,
> shopping-list); `/games` hub and the four game pages. Sprint 1
> already lifted the four games' headers to a unified identity, so
> Sprint 2 focuses on (a) the games hub catching up to its children,
> and (b) Path detail surfaces graduating from "functional" to
> "first-class state treatment."
>
> Carry-forward from Sprint 1 IDEO drives the first 5 items in scope.
> The recursive-improvement guarantee in
> `STAGE-3-VIBECODE-AUTONOMOUS-6MO.md` requires those 5 to be
> addressed before any new deficiency.

## Carry-forward from Sprint 1 IDEO review

(Items 1–5 are mandatory; the rest are queued for later sprints by
explicit scheduling.)

1. **`/cook/combined`** density audit (3 weighted pts) — **deferred to
   Sprint 5** with documented rationale: refactoring the 1,122-line
   page in this sprint risks behavioural regression without dedicated
   test coverage. Scheduled for Sprint 5 (App-wide consistency +
   2nd-pass on Today/Cook/Win) where the regression budget is
   explicitly allocated.
2. **`/today` minimalism ceiling** — **addressed in Sprint 1** (peek
   rotation trim landed in `cef6fb5`). No further action this sprint;
   re-audit at Sprint 5's second-pass on Today.
3. **`/path` polish + intentionality** — **in scope this sprint**.
4. **`/path/pantry` first-class state treatment** — **in scope**.
5. **`/path/shopping-list` first-class state treatment** — **in scope**.

Plus carry-forward items 6, 7 from the Top-20:

6. **`/path/favorites` empty state + repeat-cook affordance** — **in
   scope**.
7. **`/games` hub identity match** — **in scope**.

## Surfaces audited this sprint (pre-Wave-A baseline)

Pulled from `docs/sprints/1/IDEO-REVIEW.md` post-Wave-A scorecard. The
games (whats-cooking, speed-chop, cuisine-compass, flavor-pairs) are
**not in this sprint's scope** — they were already lifted in Sprint 1
Wave A. They get re-audited only as a regression check.

| Route                    | I   | M   | C   | P   | Avg  | Top deficiency (≤1 line)                                                       |
| ------------------------ | --- | --- | --- | --- | ---- | ------------------------------------------------------------------------------ |
| `/path`                  | 3   | 3   | 3   | 3   | 3.00 | Skill-tree + cuisine grid don't share one visual rhythm                        |
| `/path/favorites`        | 3   | 3   | 3   | 3   | 3.00 | Empty state generic; no repeat-cook affordance on filled state                 |
| `/path/pantry`           | 3   | 3   | 3   | 3   | 3.00 | CRUD-functional, no celebratory empty / full state moments                     |
| `/path/scrapbook`        | 3   | 4   | 3   | 3   | 3.25 | Already strong; mainly a Sprint 4 typography retune target                     |
| `/path/shopping-list`    | 3   | 3   | 3   | 3   | 3.00 | Has Instacart placeholder; needs first-class empty / partial / complete states |
| `/games` (hub)           | 3   | 3   | 3   | 3   | 3.00 | Hub treatment doesn't match the lift the individual games have                 |
| `/games/whats-cooking`   | 4   | 3   | 4   | 4   | 3.75 | Sprint 1 Wave A — re-audit only                                                |
| `/games/speed-chop`      | 4   | 3   | 4   | 4   | 3.75 | Sprint 1 Wave A — re-audit only                                                |
| `/games/cuisine-compass` | 3   | 3   | 4   | 4   | 3.50 | Sprint 1 Wave A — re-audit only                                                |
| `/games/flavor-pairs`    | 3   | 3   | 4   | 4   | 3.50 | Sprint 1 Wave A — re-audit only                                                |

No bolded ≤2 cells. Sprint 2 starts with no sprint-blockers, only
deepening targets.

## Polish wave A (Sprint 2, Week 2 — top 60% in scope)

Ordered by surface weight × score-delta, prioritising the explicit
carry-forward items from Sprint 1 IDEO.

- **W2.1** `/games` hub: header gains "Kitchen Arcade" identity rhythm
  matching the per-game treatment (title + sub-line + featured-game
  affordance). Game card grid gets a "Last played" or streak hint
  when score history exists.
- **W2.2** `/path/pantry`: empty state with cooking-prompt CTA + first-
  class non-empty state with chips that visually distinguish staples
  vs. fresh. Sprint 4 dedicates a full polish pass to overlays/PM, so
  scope here stays in pantry-only.
- **W2.3** `/path/shopping-list`: empty / partial / complete state
  treatments. Instacart hint moves from a placeholder to a real chip
  with the 20-min ETA.
- **W2.4** `/path/favorites`: empty state + repeat-cook chip on each
  saved card.

## Polish wave B (Sprint 2, Week 3 — remaining 40% + Stanford content run #2)

- **W3.1** `/path` home: skill-tree section header + cuisine grid
  section header share one type/spacing rhythm. Surgical change only —
  no re-architecture.
- **W3.2** Stanford content run #2 — 8-10 items targeting family-meal
  - behavioural themes. Run from `healthier.stanfordchildrens.org`
    category page candidates queued in `STANFORD-SOURCES.md`.

## Notes

- Build state at audit start: pnpm lint ✓, pnpm test 398/398 ✓,
  pnpm build ✓. (Same as Sprint 1 close.)
- Open carry-forward to Sprint 2 IDEO Review: confirm all 4 Path
  detail surfaces score ≥ 3.5 across all axes after Wave A; confirm
  the games hub matches its children at ≥ 3.5.
- The `/cook/combined` density audit is the only Sprint 1 carry-
  forward intentionally deferred. Documented in the carry-forward
  block above with reason. Will re-appear in Sprint 5.
