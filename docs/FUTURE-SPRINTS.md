# Future phases & sprints (decision aid)

Scope note: **no expansion of scored pairings beyond the current Indian pre-compute set** until product explicitly reprioritizes engine breadth.

## Toasts & lightweight polish (near term)

| Item | Notes |
|------|--------|
| **Achievement toast** | Wired on Path; `useAchievements` + `AchievementToast`; E2E in `e2e/path-achievement-toast.spec.ts`. |
| **Level-up toast** | Component exists (`level-up-toast.tsx`); confirm where it mounts and same motion/visibility patterns as achievement toast. |
| **Save / Instacart toasts** | Quest “Saved for later” motion set to `initial={false}` for test visibility; Instacart is placeholder copy — decide real flow or hide until live. |
| **Unified toast hook** | Optional: single queue (achievement + level-up + save) with max one visible, dismiss order. |

## Product / UX sprints (medium term)

- **Guided cook E2E win path**: Dedicated spec that uses a **single** short side (e.g. known slug with few steps, no combined queue) and optional timer mock so full Mission → Win is automated without 90s flakes.
- **Combined cook**: Explicit UX test matrix (2 vs 3 sides, timer steps, back navigation) once E2E harness can stub timers.
- **Games**: Daily rotation already wired; add regression tests for rotation boundary (week rollover) if not covered.
- **Path**: Weekly challenge title list already matched in `path-features.spec.ts`; add fixture date if deterministic week is needed.

## Engine / data (explicitly later)

- **More `pairings.json` cuisine coverage** — parked per current directive; revisit with STRATEGY.md + pairing cost/benefit.

## Suggested sprint boundaries

1. **Sprint A — Toast pass**: Mount + audit all toasts; motion `initial={false}` where it affects a11y/tests; one E2E per toast type.
2. **Sprint B — Cook E2E hardening**: Single-recipe happy path to win + star rating; timer inject or shortest recipe only.
3. **Sprint C — Performance / bundle**: Follow ROADMAP “performance” themes; measure `/today` and `/path` TTFB + JS on 4G.
