# Sticky-banner audit + Round 4 recovery (2026-05-04)

> One-shot doc covering two concurrent items: the sticky "Sous" banner blocking
> content on scroll, and the recovery from the Round 3 + Round 4 broken commits
> that landed on main with truncated JSX + 458 deleted files.

## Part 1 — Sticky-banner RCA

### What the user reported

> "The Sous banner is distracting and gets stuck, blocking areas of the app as I
> scroll."

### Visual evidence

In the user's screenshot the brand bar (`Sous` + streak `1` + `…` + owl avatar)
sits pinned at the top of the viewport. As they scroll, the search bar behind
it ("What are you craving?") slides under the header and is clipped — the bar's
top edge is partially obscured. Even when the search bar isn't immediately
behind, the persistent brand strip occupies ~64px of vertical real-estate on a
small mobile viewport, which on a max-w-md layout reads as a heavy chrome.

### Root cause

The header used `position: sticky; top: 0; z-index: 100;` via the global
`.app-header` class. That keeps the banner permanently at the top of the
viewport while content scrolls underneath. On a home screen with several
follow-on cards (search bar + tip card + rhythm line + tonight chip + repeat-
cook chip + quest card + friends strip), the persistent header always covers
~10-15% of the viewport — content the user wanted to see is partially hidden.

The class was set globally, which is correct for screens with a back-button
header (cook flow, sub-routes), but wrong for the home page where the brand
bar isn't a navigational aid.

### Pattern research

Surveyed the dominant pattern across mobile-first wellness/recipe apps:
Headspace, Apple Music, Strava, NYT Cooking, Substack web. **All five** use
**hide-on-scroll-down + show-on-scroll-up** (Headroom.js-style behavior) on
their primary home screens. None keep a permanently sticky header on home —
it blocks too much viewport on mobile.

The two architectural alternatives:

| Pattern                      | Pros                                 | Cons                                  |
| ---------------------------- | ------------------------------------ | ------------------------------------- |
| Pure scroll-away             | Simplest; zero JS                    | User loses brand presence entirely    |
| **Headroom-style hide/show** | Brand returns the moment you pull up | ~80 lines of JS + scroll listener     |
| Permanent sticky (current)   | Always-visible streak + mascot       | Blocks content (the actual complaint) |

### Fix

New `<HeadroomHeader>` wrapper at `src/components/shared/headroom-header.tsx`:

- Sticky positioning lives on the wrapper.
- Inner content gets `transform: translateY(-100%)` when scrolling down past
  24px; reverses on any upward delta ≥ 4px.
- Always visible at top of page (scrollY ≤ 8px).
- Uses framer-motion's `motion.div` with `useReducedMotion()` gate — reduced-
  motion users get instantaneous transitions, not slide animations.
- requestAnimationFrame-throttled scroll listener; passive: true.

The Today page now wraps its `<header>` in `<HeadroomHeader>` and drops the
`app-header` class (which carried the `position: sticky`). Other screens keep
the global `.app-header` class unchanged — their back-button navigation still
benefits from being pinned.

8 unit tests on the threshold-classifier predicate cover top-of-page invariant,
hide-after-threshold, re-show on upward delta, ignore tiny upward deltas,
preserve hidden state at zero delta, custom thresholds.

## Part 2 — Round 3 + Round 4 recovery

### Sequence of breakage

1. **Round 3** (commit `166129b` — May 4): an external commit landed on main
   with truncated JSX in 4 files. Recovered in commit `c2a5ebf` by restoring
   the prior versions + adding reduced-motion gates to the new components.
2. **Round 4** (commit `14af19a` — May 4): another external commit landed.
   The commit ITSELF was clean (only added new lib/ files for craving-parser,
   seasonal scorer, anti-monotony, coach encouragement).
3. **Merge commit** (`ff5492f` — May 4): the merge integrating Round 4 with
   the Y4-Y5 cohort/push/editorial work landed with **8 truncated files** and
   **458 deleted files**, primarily the Parent Mode + nutrient-spotlight +
   pantry coverage stack.

### Recovery

This commit:

1. `git checkout b4393c7 -- .` — restores the working tree to the last known
   clean state (Y5 W5 V4 trainer commit, before Round 3 + Round 4).
2. Re-applies the result-stack redesign (`fed345d`) on top of the restored
   state for the 5 redesign files.
3. Re-applies pantry-coverage display in result-stack since the b4393c7
   `SideResult` shape carries `pantryCoverage` / `pantryHaveCount` /
   `pantryTotalCount`.
4. Cherry-picks Round 4's NEW substrate (craving-parser expansion, seasonal +
   anti-monotony scorers, coach-encouragement, types/ai.ts, modified
   pairing-engine + ranker + explainer + types.ts) since these add genuine
   value without breaking anything.
5. Marks `seasonal` + `antiMonotony` as **optional** in `ScoreBreakdown` so
   pre-Round-4 fixtures + breakdowns continue to compile. Trainer V3
   (`composeV3WeightsFromDeltas` + `perDimensionDelta`) returns Partial<>
   to ignore unset dimensions cleanly.
6. Updates the `parseStoredUserWeights` parser to treat the new dims as
   optional too — pre-Round-4 stored payloads inherit defaults instead of
   being rejected as "missing keys".
7. Restores all the Parent Mode + kid-friendliness + nutrient-spotlight files
   that the merge dropped.

### Test impact

- `ranker.test.ts > applies weights correctly` updated to include
  seasonal=0.5 + antiMonotony=0.9 default contributions (the ranker now scores
  8 dimensions per Round 4's intent).
- `user-weight-trainer-v3.test.ts > monotonic stronger signal → bigger shift`
  rewritten with deltas 0.06 vs 0.09 (both below the V3_MAX_DELTA cap of 0.10
  so monotonicity is observable; the prior test used 0.1 vs 0.9 which both
  saturated to the cap producing equal shifts).

## Part 3 — Other UX cleanups in this commit

1. **Household-members hint dropped.** The "Add household members for
   personalised pairings" dashed-border CTA on the Today page was distracting.
   Now the empty roster renders nothing; discovery still happens via
   `/path/household` in the Path tab.
2. **Cuisine-family badge removed from QuestCard hero image.** The dark
   `bg-black/30 backdrop-blur` "Thai" pill at bottom-left of the dish photo
   was visual noise. Cuisine is shown in the meta strip below the hero anyway.
   The bottom-edge gradient that supported it was dropped too.
3. **"Popular" pill consolidated onto the meta line.** Was rendering as its
   own row underneath, pushing everything down. Now inlined next to "X min ·
   Y ingredients" with the rest of the flavor tags filtered to exclude it.

## In one paragraph

The Sous header now hides on scroll-down + shows on scroll-up — the persistent
brand bar no longer covers content. The Round 3 + Round 4 truncation breakage

- 458-file deletion are recovered from `b4393c7`, with Round 4's new substrate
  (craving-parser, seasonal/anti-monotony scorers, coach-encouragement) merged in
  on top via Partial<ScoreBreakdown> so old fixtures + breakdowns continue to
  compile. Three small home-page cleanups (household-hint drop, cuisine-badge
  drop, Popular-inline) round out the visual minimalism work.
