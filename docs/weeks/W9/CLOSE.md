# W9 close — tag-cloud landing for Content home

**Sprint:** B (Stage-4 W2 cross-cutting infra)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint B W9
**Date closed:** 2026-05-02
**Scope:** add a "Browse by topic" tag-cloud to the Content home,
pairing with the article tag-filter view that shipped earlier
(commit b48173a).

## Shipped commits

- `1ca42e4` feat(stage-4-w9): tag-cloud landing for Content home
  discovery. New `<TagCloud>` component + `topTagsByCount` pure
  helper + 7-test suite + integration into `/community`.

## Surfaces touched

| File                                             | Change                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `src/components/content/tag-cloud.tsx` (NEW)     | Pure-render component + exported pure helper. Pills scaled by article-count tertile.                                      |
| `src/components/content/tag-cloud.test.ts` (NEW) | 7 vitest cases: empty, no-tags, aggregation, count-desc + tag-asc tiebreaker, alpha tie, limit respect, case-sensitivity. |
| `src/app/(community)/community/page.tsx`         | Renders TagCloud below the existing sections, only on `!tagFilterActive && filter === "for-you"`.                         |

## Stress test

**Test type:** Long-content stress + 375×667 viewport sweep.
**Result:**

- With the current 25-article corpus, the cloud surfaces 12 tags
  ranging from `stanford` (12 occurrences) down to `behaviour`
  (1). The top-tertile bold/14px treatment makes the dominant
  tags visually obvious without crowding the rest.
- At 375×667 the 12-pill cloud wraps to 4 rows; the layout
  doesn't push the disclaimer below a usable scroll bound.

## Acceptance

- [x] Cloud sources tags from the FULL article corpus (`ARTICLES`),
      not the parent-mode-ranked subset — so the cloud reflects the
      catalog regardless of the user's current PM state.
- [x] Cloud hides when a tag filter is already active (avoids
      self-referential surface).
- [x] Cloud hides on category-isolated views (Articles / Research
      / etc.) where the user has already narrowed.
- [x] Each pill links to `/community?tag=<encoded>` — the existing
      tag-filter view consumes the param.
- [x] pnpm lint ✓ / pnpm test 432/432 ✓ / pnpm build ✓.

## Residuals

- The cloud's font-size scaling is "tertile" not "linear" — chosen
  for visual clarity over numerical fidelity. If a future audit
  finds the visual hierarchy too aggressive, swap the `sizeFor`
  helper for a smoother scale.
- Reels / Research / Forum surfaces don't have tags at all today
  (only Article carries `tags: string[]`). If a future content
  expansion adds tags to those types, generalise `topTagsByCount`
  to accept any item with a `tags` array.

## Retrospective (1 paragraph)

The tag-cloud closes the loop on the article-tag affordance: tap a
tag chip on any article-detail page and you go to the filter view;
return to /community and you see the cloud as a discovery surface.
The pure-helper pattern (export `topTagsByCount` + 7 tests) is the
same shape used in W8's `groupReplies` — both let the
"how does this look on the page" question stay separate from the
"is the data shaped correctly" question. That separation is paying
off as the test count climbs (411 → 432 in two weeks) without any
test feeling like infrastructure for its own sake.
