# W31 close — Sprint F close-out

**Sprint:** F (W27-W31)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H2 W31
**Date closed:** 2026-05-02
**Scope:** User-recipe → cook flow integration (final Sprint-A→E
carry-forward) + Sprint F close-out + IDEO review.

## Shipped

| Commit  | Output                                                           |
| ------- | ---------------------------------------------------------------- |
| ce41edf | User-recipe → cook flow integration (adapter + cook page wiring) |
| 893b925 | W29 close doc (W29 carry-forward landings)                       |
| 060c7d3 | Pairing-engine V2 (W30 work)                                     |

Test count: **723 → 738** (+15). All four gates green.

## What landed

### User-recipe → cook flow integration

CLAUDE.md rule 4 ("every recipe — internal, user-created, or
externally retrieved — renders through the same Mission → Grab →
Cook → Win flow. No exceptions.") was technically violated
because authored recipes had no path to the cook step page. W31
closes that gap.

- **`adaptUserRecipeForCook(recipe)`** — pure adapter from
  `UserRecipe` (W17 schema) to the shape the cook page consumes
  from `trpc.cook.getSteps`. Steps gain a deterministic id
  (`<slug>-step-<n>`); fields not yet authored on user recipes
  (`cuisineFact`, `imageUrl`) collapse to null so the existing
  chip rendering stays hidden rather than showing empty chips.
- **`findUserRecipeBySlug(drafts, slug)`** — slug lookup helper.
- **Cook step page fallback** — when `trpc.cook.getSteps`
  returns `dish: null` for a slug, the page checks the user-
  drafts hook and adapts. Loading state holds until both the
  tRPC query AND `useRecipeDrafts` have hydrated, so a user-
  authored recipe doesn't briefly flash the "Cook steps coming
  soon" empty state.
- **List-view actions row** — `/path/recipes` cards now expose
  two action buttons: Cook (primary, → `/cook/<slug>`) and Edit
  (secondary, → `/path/recipes/<id>/edit`). The card body
  switched from a Link wrapper to a plain `<li>` because the
  previous nested-interactive structure (Link + buttons) would
  have been a hydration error if the new buttons landed inside.

15 unit tests cover the adapter (shape mapping, dishName/title
fallback, deterministic step ids, null normalisation, ingredient
field preservation, hero image passthrough, slug-lookup
hit/miss/empty/duplicate).

## Acceptance for W31 / Sprint F close-out

- [x] User-authored recipes navigable end-to-end: author →
      list → cook → win.
- [x] Adapter pure-tested without rendering React.
- [x] No regression in seed-catalog cook flow (`/cook/<seed-slug>`
      still routes through the tRPC path; user-recipe fallback
      only fires when the seed data has no match).
- [x] All four gates green throughout: lint ✓, typecheck ✓,
      test 738/738 ✓, build ✓.
- [x] All Sprint-A→E carry-forwards either landed or explicitly
      redeferred.

## Loop-2 RCA

0 RCA-worthy moments this week. The shape-equivalence between
`UserRecipe.steps` and `StaticCookStep` made the adapter a
straightforward field map, so the only edge cases were the
fields that don't yet exist on user recipes (`cuisineFact`,
`imageUrl`) — both null-defaulted intentionally per the comments.

## Sprint F summary

| Week | Commits                               | Output                                                                                                                                                   |
| ---- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W27  | 59f6dc9 + df8ae00                     | Recipe-authoring page LIVE at `/path/recipes/new` (Loop 2 RCA: dropped `@hookform/resolvers/zod` for manual validation) + visual-mode page-side adoption |
| W28  | 7c4d8a0 + f39112b + af7747d + e649a1a | `ParallelHintBanner` extracted from `/cook/combined` + `/path/recipes` list view + Path quick-link wiring + smoke spec coverage                          |
| W29  | c117cd4 + 44932da + f62e62a + 893b925 | Dual-track `DishProgressStrip` (combined density wave 2 final piece) + recipe edit view + shared `RecipeForm` + MVP 4 cook-nav SVG attention pointers    |
| W30  | 060c7d3                               | Pairing-engine V2 (per-user weight vector trained client-side)                                                                                           |
| W31  | ce41edf                               | User-recipe → cook flow integration (final Sprint-A→E carry-forward)                                                                                     |

13 production commits + 4 docs commits across the sprint.
**661 → 738 tests** (+77 over the sprint).

## Carry-forward into W32 / Sprint G

Sprint G (W32-W36) per the 12-month plan focuses on **household
memory** (per-member preferences + "who's at the table" picker +
weekly rhythm widget) — that was originally Sprint E in the
12-month plan but slipped because voice-cook live integration
took the bandwidth.

Mandatory carry-forward into Sprint G:

1. **Real attention-pointer content** for top dishes. The
   infrastructure shipped in W29 (MVP 4); it just needs
   per-step pointer authoring on the most-cooked recipes. Not
   load-bearing — content authoring exercise.
2. **Recipe-authoring schema migration** — `cuisineFact` +
   `imageUrl` on user steps to remove the W31 null-defaults.
   Trivial schema bump; deferred because no real content yet
   needs them.
3. **Pairing-engine V3 signal extensions** — per-dimension
   scores + decay + catalog-aware signals. Header comment in
   `user-weight-trainer.ts` enumerates them. Sprint H or I.
4. **`pnpm typecheck` in CI / pre-commit hook** — still pending.
   Local gate works; CI integration is a one-line Husky add.

## Retrospective

Sprint F closed every Sprint-A→E carry-forward without a single
RCA-worthy moment. The pattern that made this possible: each
carry-forward was infrastructure-ready by the time it shipped,
so each commit was a wiring exercise rather than a discovery
exercise. The recipe-authoring loop is the clearest example —
W17 schema + W23 helpers + W24 persistence + W23 form library
landed before the W27 page surface; W27 was a 1-day component
build. Same shape on visual-mode: W22 toggle + persisted pref
landed before the W27 page-side adoption. The structural pattern
"build the substrate, then the surface" turned every Sprint F
week into a low-risk wiring week.

The other quiet win: the custom `sous/reduced-motion-gate`
ESLint rule fired exactly once during W29 (caught a missing
`useReducedMotion` import on `DishProgressStrip` pre-commit) and
zero times after. The rule has reached propagation maturity —
it files no false positives, only real misses caught at edit
time. Sprint G can lean on it without thinking about motion
gating explicitly.

H2 opens cleanly with Sprint-A→E carry-forwards fully cleared
and the original 12-month plan back on schedule.
