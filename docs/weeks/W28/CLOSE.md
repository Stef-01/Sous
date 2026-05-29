# W28 close — Sprint F continued

**Sprint:** F (W27-W31)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H2 W28
**Date closed:** 2026-05-02
**Scope:** Sprint-A through Sprint-E carry-forward landings:
`/cook/combined` density wave 2 (first piece) + recipe-authoring
list view + Path quick-link wiring + smoke-spec coverage.

## Shipped

| Commit  | Output                                                                   |
| ------- | ------------------------------------------------------------------------ |
| 7c4d8a0 | `ParallelHintBanner` extracted from `/cook/combined` (1117 → 1098 lines) |
| f39112b | `/path/recipes` list view (skeleton + empty state + card stack)          |
| af7747d | "My recipes" tile added to Path "Your kitchen" quick-links grid          |
| e649a1a | `/path/recipes` + `/path/recipes/new` added to all-routes smoke spec     |

Tests **671 → 671** (no new unit tests this week — the work was
component extraction + list view + smoke coverage). All four
gates green throughout: lint ✓, typecheck ✓, test 671/671 ✓,
build ✓.

## What landed

### 1. `/cook/combined` density wave 2 — first extraction

`ParallelHintBanner` lifted out of the 1117-line page surface.
The amber "while X simmers, start Y" callout above the active
StepCard was 21 lines of inline JSX with its own motion + colours.
Pulling it into `src/components/guided-cook/parallel-hint-banner.tsx`:

- Owns its motion + `useReducedMotion` gate (per the W7 ESLint
  rule — every motion site goes through the gate).
- Renders nothing when `hint` is null/empty, so callers stop
  branching themselves: `<ParallelHintBanner hint={x} />` is the
  whole call site.
- Page surface drops 19 lines net (1117 → 1098); the unused
  `Timer` icon import comes out as well.

This is the first of two queued extractions per the H1 retro
("dual-track step-progress strip, parallel-hint banner"). The
step-progress strip extraction is queued for W29 — the strip
isn't yet a distinct UI element on the combined page, so that
work is "extract-and-ship-the-component" rather than just
"extract-existing-block".

### 2. Recipe-authoring list view + Path entry point

`/path/recipes` (the list view) reads `useRecipeDrafts` and
renders three states:

- **Pre-hydration:** a single skeleton card matching post-hydration
  height so the page doesn't jump.
- **Empty:** dashed-border card with "Add your first recipe" CTA.
- **Populated:** stack of cards (cuisine kicker, title, truncated
  description, ingredients/steps/serves meta).

The "+ New" button in the header links straight to
`/path/recipes/new`, completing the loop: `/path → My recipes →

- New → /path/recipes/new → save → /path` (and the W27 success
  toast finally points to a destination that exists).

A 5th tile ("My recipes" with the `ChefHat` icon) added to the
Path "Your kitchen" quick-links grid alongside Scrapbook, Pantry,
Shopping list, and Favorites.

### 3. Smoke-spec coverage

`e2e/all-routes-smoke.spec.ts` now includes both new routes
(`/path/recipes` + `/path/recipes/new`) so future regressions
(Tailwind-JIT misextract, hydration error, missing import) get
caught at the same gate as the rest of the route list.

## Acceptance

- [x] First piece of `/cook/combined` density wave 2 shipped
      (ParallelHintBanner extraction). Sprint-A→E carry-forward.
- [x] Recipe-authoring list view live at `/path/recipes`.
- [x] Recipe-authoring loop end-to-end navigable from `/path`
      without typing URLs by hand.
- [x] Smoke spec covers both new routes.
- [x] All four gates green throughout: lint ✓, typecheck ✓,
      test 671/671 ✓, build ✓.

## Carry-forward into W29

1. **`/cook/combined` density wave 2 — second piece:** dual-track
   step-progress strip. Currently the combined page renders a
   single linear progress bar inside the StepCard; the strip
   should show all dishes' progress simultaneously so the user
   sees they're 60% through dish A and 0% through dish B at a
   glance. Component extraction-and-introduce, not extraction-of-existing.
2. **Recipe-authoring edit view** at `/path/recipes/[id]/edit`.
   The author surface `/path/recipes/new` is generic enough that
   we can reuse it with a `useEffect` that hydrates form values
   from `getById(id)` on mount.
3. **MVP 4 of cook-nav initiative** — SVG attention pointers
   per the 12-month plan W28 entry. This was the _plan_'s W28
   item; it slid to W29 because Sprint-A→E carry-forward took
   priority.
4. **Pairing-engine V2** (W29-W31 per the original plan) remains
   queued.

## Retrospective

W28 closed three load-bearing carry-forwards in a single week:
the recipe-authoring loop is now fully navigable from /path, the
visual-mode toggle is end-to-end live (W27), and the first
`/cook/combined` extraction landed after carrying forward through
five sprints. The combined-page extraction was a 19-line net
reduction with zero behaviour change — the kind of low-risk move
the codebase has been ready for since Sprint A but kept slipping
because the "next feature" always took priority. Sprint F is the
right time to clear these because the H1 acceptance bar is
already met and the W22-W24 infrastructure absorbed the W27 page
work in a single day, freeing bandwidth for housekeeping. W29
opens with one more `/cook/combined` extraction (the dual-track
strip — extraction-and-introduce, not extraction-only) before
pivoting to MVP 4 of cook-nav (SVG attention pointers) and the
pairing-engine V2 work.
