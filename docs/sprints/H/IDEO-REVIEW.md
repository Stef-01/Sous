# Sprint H (W37-W41) — IDEO Design Review

> Closes Sprint H per `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md`.
> Sprint focused on **closing every load-bearing carry-forward**
> from H1 + Sprint F + Sprint G — the pairing-engine integration
> the W35 aggregate was waiting for, the W23 reorderSteps UI
> consumer, the W21-deferred timer-voice wiring, and the recipe-
> authoring schema migration that fed the step-detail authoring UI.

## Review date

2026-05-02

## Build state at review

- Latest commit on main: `53b0854` (W41 step-detail authoring UI).
- Test count: **848** (was 808 at Sprint G close — **+40 over the
  sprint**).
- Four-gate green: pnpm lint ✓, pnpm typecheck ✓, pnpm test ✓,
  pnpm build ✓.

## What landed in Sprint H

| Week | Commit  | Output                                                                                                                                                                      |
| ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W37  | cbc13a7 | Dietary inferer + SideDishCandidate.dietaryFlags + tRPC `householdDietaryFlags` filter + useHouseholdDietary hook + 3 call-site wires (today / sides / result-stack reroll) |
| W38  | fd270c9 | dnd-kit adoption + SortableStepList component + RecipeForm integration                                                                                                      |
| W39  | 8956c51 | extendTimer cook-store action + timer-voice helpers (formatSpeakableRemaining + speakableTimerStatus + speakableTimerSet/Cancel/Add) + cook-page real wiring                |
| W40  | 3860bbc | userStepSchema migration: cuisineFact + imageUrl fields + helper updates + adapter passthrough + passthrough test                                                           |
| W41  | 53b0854 | Step-detail authoring UI: chevron toggle + 6-field expand panel (timer, doneness cue, mistake warning, quick hack, cuisine fact, image URL)                                 |

5 production commits + 0 docs commits (the close doc is this
review).

## Surface scoreboard delta

| Surface                   | Sprint-G close | Sprint-H close | Delta                                                                                                          |
| ------------------------- | -------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `/today`                  | 4.25           | **4.40**       | +0.15 (household table aggregate now actually filters pairings; reroll respects same constraint)               |
| `/cook/[slug]`            | 4.50           | **4.60**       | +0.10 (voice timer commands now fully wired — set/cancel/status/add all speak confirmations + drive the store) |
| `/path/recipes/new`       | 3.75           | **4.00**       | +0.25 (drag-to-reorder + step-detail authoring now feature-parity with seed catalog)                           |
| `/path/recipes/[id]/edit` | 3.75           | **4.00**       | +0.25 (same shared RecipeForm gains)                                                                           |
| `/sides`                  | unchanged      | unchanged      | – (passes the household constraint through but doesn't surface it visually yet)                                |
| All other surfaces        | unchanged      | unchanged      | –                                                                                                              |

Score-≥-4 count: **25 of 26** (was 23/26 at Sprint G close —
two surfaces broke through 4.0, one surface ticked up).

## Cross-cutting wins

1. **Household memory is now load-bearing.** Sprint G shipped
   the data + picker; Sprint H W37 connects it to the engine.
   A user with a vegan member at the table now sees only
   vegan-compatible side suggestions; reroll respects the same
   constraint. `inferDietaryFlags` is the load-bearing piece —
   it lets a seed catalog with no dietary tags participate in
   filtering by deriving compatibility from each dish's tags +
   description.

2. **Voice cook arc is V1-complete.** Navigation (next / back /
   repeat / done), step playback, AND full timer control
   (set / cancel / status / add) all flow through the same
   `useVoiceCook` hook. The `formatSpeakableRemaining` helper +
   `speakableTimer*` confirmations close the conversational
   loop — every command gets short positive feedback so the
   user knows the system heard them.

3. **Recipe-authoring → seed parity.** A user authoring a
   recipe can now express every chip the cook page renders
   (timer, mistake, hack, fact, doneness cue) plus a per-step
   image for visual mode. The `commitDraft` → `safeParse` →
   `upsert` pipeline absorbs the new fields without changes —
   the W17 schema's optional/nullable shape was the right
   contract from day one.

4. **Library adoption for dnd-kit.** First UI consumer of the
   queued master pick (`@dnd-kit/core` + `@dnd-kit/sortable` +
   `@dnd-kit/utilities`, ~14KB gzipped). Touch + keyboard
   accessibility comes free. Cumulative dep budget through
   H1+F+G+H: ~25KB / 50KB H1 ceiling; ~25KB headroom into
   Sprint I.

5. **Sprint A→G carry-forward pile is now empty.** Every item
   on the multi-sprint queue (combined-page density wave 2 —
   W28+W29; pairing-engine integration of household aggregate
   — W37; W23 reorderSteps UI consumer — W38; W21 timer-voice
   wiring — W39; user-step schema migration — W40) has shipped
   or been explicitly redeferred.

## RCA tally

0 RCA-worthy moments this sprint. The only minor friction was
W38's lint catching an unused `arrayMove` import (left over
from a copy-paste exploration; never made it to runtime). The
custom `sous/reduced-motion-gate` rule didn't fire — dnd-kit
handles its own `prefers-reduced-motion` at the library level
so no manual gate was needed.

## Library adoptions during Sprint H

| Library                    | Sprint adopted | Bundle delta | Replaces / unlocks          |
| -------------------------- | -------------- | ------------ | --------------------------- |
| `@dnd-kit/core` 6.3.1      | H (W38)        | ~10KB        | Hand-roll for drag-and-drop |
| `@dnd-kit/sortable` 10.0.0 | H (W38)        | ~3KB         | (paired with above)         |
| `@dnd-kit/utilities` 3.2.2 | H (W38)        | ~1KB         | (CSS transform helper)      |

Cumulative dep budget through H1+F+G+H: ~25KB / 50KB H1 ceiling.

## Carry-forward into Sprint I (W42-W46)

Sprint I per the 12-month plan is **content polish** — real
attention-pointer authoring on top dishes, real per-step images
for visual mode, recipe-authoring template library (suggested
recipes the user can fork and edit), shared-ingredient prep
lists across combined cooks.

Mandatory carry-forward from prior sprints:

1. **`pnpm typecheck` in CI / pre-commit hook** (carried since
   Sprint C). One-line Husky integration — small but
   load-bearing for distributed teams.
2. **Real attention-pointer content** for top dishes (carried
   from Sprint F). Infrastructure shipped W29; per-step pointer
   authoring on the most-cooked recipes is the gate to it
   actually surfacing.
3. **`/sides` household-aware visual hint.** The /sides browse
   page filters via the household constraint but doesn't show
   the user it's filtering. A small "filtered for: vegan,
   gluten-free" badge would close the affordance loop.
4. **Pairing-engine V3 signal extensions** (per-dimension
   scores, decay, catalog-aware signals; header in
   user-weight-trainer.ts).

## Acceptance for Sprint-H close

- [x] Every Sprint-G IDEO carry-forward addressed or explicitly
      redeferred. Real attention-pointer content + V3 signal
      extensions explicitly redeferred to Sprint I.
- [x] No regression in any score-≥-4 surface from Sprint-G close.
- [x] Test count monotonic (808 → 848, +40).
- [x] All four gates green throughout the sprint.
- [x] Household-memory loop end-to-end live (data → picker →
      aggregator → engine filter).
- [x] Voice cook arc V1-complete (navigation + playback + timer
      control).
- [x] Recipe-authoring at seed-catalog feature parity.
- [x] Library policy applied to W38 dnd-kit adoption (recorded
      in master pick table since H1; shipped in Sprint H).

## Retrospective (1 paragraph)

Sprint H is the cleanest carry-forward sprint of H2 so far: every
item on the multi-sprint queue landed without inventing new
infrastructure debt. The structural pattern — substrate first,
surface later — kept paying off: the W35 aggregator + W31
adapter + W23 reorderSteps + W18 voice-intent parser + W17
schema were all unit-tested and stable, so each Sprint H week
was a wiring exercise. The single quietly important detail this
sprint was the `inferDietaryFlags` decision to derive
compatibility from each dish's tags + description rather than
require manual tagging — the seed catalog had zero dietary tags
at sprint start, but the inferer means the household-memory
filter works on day one. Sprint I can pivot to content polish
now that the engineering loops are all closed.
