# ADR 0002 — Swipe physics: build vs. library

**Date:** 2026-05-01
**Status:** Decided — keep hand-rolled, with explicit revisit gate
**Reviewer:** Stefan (asked: "for tinder swipe i am sure there are
github repos online that you can just take the component from instead
of reinventing the wheel, that is stronger i give you full permission")

## Context

The Today-page quest-card stack uses a Tinder-style swipe interaction.
After Stage 4's first iteration (commit `5687d9f`) introduced
velocity-aware commit, velocity-preserving exit, threshold haptic, and
snappier snap-back springs, a real user surfaced two complaints:

1. The card "accidentally goes in screen" (felt over-rubbery).
2. "Defaults to yes when I say no by swiping right" (directional
   misregister).

Stefan then asked whether we should adopt a battle-tested library
(`react-tinder-card`) instead of maintaining hand-rolled physics.

## Options considered

### A. Adopt `react-tinder-card`

**Pros:**

- Battle-tested in production by thousands of apps.
- No need to maintain custom swipe-decision math.
- Exposes a clean API (`swipeRequirementType="position"` + threshold
  - onSwipe / onCardLeftScreen).

**Cons:**

- Adds `@react-spring/web` as a peer dependency (~30 KB gzipped
  beyond what we already ship via framer-motion). The app would now
  load TWO animation libraries.
- The hand-rolled implementation has framer-motion `useMotionValue`
  bindings powering smooth opacity gradients on the LIKE/NOPE
  overlays, the drag-tied card scale + shadow envelope, and the
  drag-distance rotate. Replacing the wrapper with `<TinderCard>`
  hides the internal `x` value, so all of those smooth flourishes
  would either need to be dropped or re-derived via callbacks (which
  is a step-function, not a gradient — visibly worse).
- The library uses its own internal spring tuning. We'd lose direct
  control over the spring stiffness/damping that matches the rest
  of the app (SHEET / GLIDE / SNAPPY presets in `src/lib/utils/motion.ts`).
- The user's actual reported bugs are addressed by the RCA fix
  (commit `932624c`):
  - Direction is now always taken from offset (fixes the
    "swiped left, committed right" finger-lift artifact).
  - Threshold tightened 80 → 100px and dragElastic 0.7 → 0.55
    (fixes the "accidentally goes in screen").
  - Velocity threshold tightened 500 → 600 px/s (less twitchy).
    Switching libraries would not necessarily improve on these
    fixes — it would just trade hand-rolled bugs for library-default
    bugs.
- Last published 2024-02; not actively under heavy development.

### B. Keep hand-rolled (the RCA-fixed version)

**Pros:**

- 20 unit tests now pin the swipe-decision behaviour to specific
  cases (release-kick snap-back, sign agreement, threshold
  boundaries). Library swap would invalidate this test surface.
- All visual flourishes that ship today (smooth label fades, scale
  envelope, shadow envelope, route-aware exit velocity, threshold
  haptic) stay intact and inherit the codebase's reduced-motion
  gates from the same motion.tsx presets.
- Zero additional bundle weight.
- Tight integration with the rest of the framer-motion-based
  motion language in the app.

**Cons:**

- Maintenance burden of ~150 lines of custom swipe physics.
- Future bugs are ours to fix.

## Decision

**Keep the hand-rolled, RCA-fixed implementation.** The library
swap's tradeoffs aren't favourable for this specific app: we'd add
~30 KB of bundle, lose the smooth opacity flourishes that make the
cards feel polished, and the user's actual reported bugs are
already fixed without the swap.

## Revisit gate

Re-evaluate this decision if any of the following becomes true:

- A second material swipe-physics bug is reported that the hand-
  rolled implementation can't cleanly fix.
- We drop framer-motion from the rest of the app (then react-spring
  bundle weight is no longer additive).
- A new fork of react-tinder-card emerges that uses framer-motion as
  its physics engine (eliminates the dual-animation-library problem).
- A third use case for swipeable cards appears in the app — at that
  point an extracted shared component is justified.

## Audit trail

- `react-tinder-card@1.6.4` was installed via `pnpm add` and then
  uninstalled in the same session after this ADR was written. The
  install/uninstall is in the package-lock history.
- Hand-rolled implementation lives in `src/components/today/quest-card.tsx`
  (`SwipeCard` component, plus the pure `decideSwipe` and
  `exitDistanceFor` exports tested in `quest-card.test.ts`).
