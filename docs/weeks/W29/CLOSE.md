# W29 close — Sprint F continued

**Sprint:** F (W27-W31)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H2 W29
**Date closed:** 2026-05-02
**Scope:** Final `/cook/combined` density wave 2 piece + recipe
edit view + MVP 4 of cook-nav (SVG attention pointers).

## Shipped

| Commit  | Output                                                                       |
| ------- | ---------------------------------------------------------------------------- |
| c117cd4 | Dual-track DishProgressStrip on `/cook/combined` (12 tests)                  |
| 44932da | Recipe edit view at `/path/recipes/[id]/edit` + shared RecipeForm extraction |
| f62e62a | MVP 4 cook-nav: SVG attention pointers + StepCard wiring (12 tests)          |

Tests **683 → 695** (+12 from attention-pointer; the 12 dish-
progress tests landed in c117cd4 which spans W28→W29). All four
gates green throughout.

## What landed

### 1. Dual-track step-progress strip (final density wave 2 piece)

`DishProgressStrip` shows every dish in a combined session
simultaneously: name + completedSteps/totalSteps + filled bar
per dish. Active dish is solid green; done dishes are translucent
green; pending are neutral. Replaces the standalone "current dish
name" label so the active dish surfaces inside the strip itself.

Pure helper `buildDishProgress` ships separately in
`src/lib/cook/dish-progress.ts` so the per-dish completion logic
(before-active = full, active = clamped step index, after = zero)
is unit-tested without touching React.

`/cook/combined` density wave 2 is now fully complete — both
queued extractions (W28 ParallelHintBanner + W29 DishProgressStrip)
shipped. Sprint-A through Sprint-E carried this forward through
five sprints; W28→W29 finally pinned it.

### 2. Recipe edit view + shared form extraction

`/path/recipes/[id]/edit` resolves a recipe by id from
`useRecipeDrafts` and feeds it as `initialValues` to a shared
`<RecipeForm>` component. The form body (~270 lines of fields +
field arrays + submit pipeline) was extracted from the W27
new-recipe page and is now single-source between both modes.

Submit pipeline is identical because `commitDraft` is idempotent
on already-committed drafts:

- `id` / `slug` / `createdAt` preserved verbatim.
- `updatedAt` always bumped.
- The validated payload goes through `drafts.upsert`, which does
  id-keyed update-or-insert.

The list-view cards (`/path/recipes`) are now Link wrappers
pointing at the edit page, so the loop closes:

```
/path → My recipes → tap card → /path/recipes/[id]/edit → save → /path
```

### 3. MVP 4 cook-nav: SVG attention pointers

W28 plan entry, slid to W29. Each step can carry an
`attentionPointers: AttentionPointer[]` array; the overlay component
renders one SVG per pointer absolutely-positioned over the
visual-mode step image. Two shapes shipped: pulsing circle (for
"look here") and gentle-bob arrow (for "stir from this side").
Optional 24-char label sits next to the pointer for cases the
visual alone can't disambiguate ("watch for sizzle").

Both shapes' animations are gated by `useReducedMotion` per the
W7 ESLint rule. The container is `role="presentation"` and the
SVGs are `aria-hidden`; labels carry `aria-live="polite"` so a
screen reader announces them once on step change.

Pure layer (`src/lib/cook/attention-pointer.ts`) defines the
type, clamps coords to [0,1] (NaN/Infinity/null/undefined →
0.5 — visible-but-obviously-wrong beats off-screen-invisible),
and trims+caps the label. 12 tests cover the clamp matrix +
trim/cap + empty-label-null + shape preservation + purity.

Wired into StepCard's visual-mode image block; renders nothing
when `attentionPointers` is null/empty so all existing call sites
(none populate this prop yet) are unchanged. Real per-step pointer
data is content-authoring work and a separate ship.

## Acceptance

- [x] `/cook/combined` density wave 2 fully complete — both
      extractions (parallel-hint banner + dual-track strip) shipped.
- [x] Recipe-authoring loop fully closed (list → edit → save).
- [x] MVP 4 of cook-nav initiative shipped (per the 12-month
      plan W28 entry).
- [x] All four gates green throughout: lint ✓, typecheck ✓,
      test 695/695 ✓, build ✓.
- [x] No regression in any score-≥-4 surface.

## Loop-2 RCA

0 RCA-worthy moments this week. The W7 reduced-motion ESLint rule
fired once during W29 (the first DishProgressStrip commit forgot
the `useReducedMotion` import) but lint caught it pre-commit, so
it never landed on main and the same pattern was correct on first
attempt for the AttentionPointerOverlay. That's exactly the
regression-prevention shape the rule was added for, and it's
maturing into "the rule files no false positives, only real misses
caught at edit time."

## Carry-forward into W30-W31

1. **Pairing-engine V2** (W29-W31 per the original plan, now W30+
   in practice). Per-user weight vector trained client-side from
   cook-history signals (cuisine fit, flavor contrast preference,
   prep tolerance, temperature complement, served-with-meal
   accept-rate). Replaces the W6-era hand-tuned weight constants.
   Will need:
   - `src/lib/engine/user-weight-vector.ts` (pure trainer)
   - localStorage-backed `useUserWeights` hook (W15/W22 pattern)
   - Wiring into `src/lib/engine/pairing-rationale.ts`
   - Stress tests for cold-start (no history) and small-history
     (1-3 cooks) cases.
2. **Real attention-pointer content** for top dishes. Authoring
   exercise — not load-bearing infrastructure. Queued.
3. **Recipe authoring → cook flow integration.** A user who
   authors a recipe should be able to cook it through the same
   Mission → Grab → Cook → Win shell. The schema already mirrors
   seed-shape; what's missing is a route resolver that picks
   user recipes by id when the seed catalog doesn't have the
   slug.

## Retrospective

W29 closed three load-bearing carry-forwards (combined-page
density wave 2 final piece, recipe edit view, MVP 4 cook-nav)
without a single RCA. The reduced-motion gate rule fired once
at lint time and saved a regression — the pattern of "custom
ESLint rule that codifies a recurring pattern" is paying for
itself sprint over sprint. The shared-form extraction was the
right call: refactoring at edit-1 (when only one consumer
existed) means only one page changed; doing it at edit-2 (after
both pages drifted) would have been a bigger refactor with
behavioural risk. Sprint F closes ahead of schedule on Sprint-
A→E carry-forwards, leaving W30-W31 cleanly bounded for the
pairing-engine V2 work that's the original W29-W31 plan entry.
