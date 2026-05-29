# W51 close — Sprint J close-out

**Sprint:** J (W47-W51)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H2 W51 (V2 plan revision)
**Date closed:** 2026-05-03
**Scope:** Cook-deeplink sharing surface + Sprint J IDEO close +
founder-unlock-runbook updates.

## Shipped

| Output                            | File                                   |
| --------------------------------- | -------------------------------------- |
| `cook-deeplink` pure helper       | `src/lib/share/cook-deeplink.ts`       |
| 27 unit tests                     | `src/lib/share/cook-deeplink.test.ts`  |
| Share button on recipe list cards | `src/app/(path)/path/recipes/page.tsx` |
| Sprint-J IDEO review              | `docs/sprints/J/IDEO-REVIEW.md`        |
| Founder-unlock runbook updates    | `docs/FOUNDER-UNLOCK-RUNBOOK.md`       |

Test count: **1046 → 1073** (+27 from cook-deeplink). All four
gates green.

## What landed

The cook-deeplink helper is the foundation for both the Y1 W51
share affordance + Y2 W4 sharing-tier work. Three pure helpers
shipped:

- `sanitiseSlugForUrl(slug)` — collapses unsafe chars + multi-
  hyphen runs + leading/trailing hyphens; caps at 80 chars to
  match the schema.
- `sanitiseAuthorParam(name)` — URL-encodes after stripping
  control + special chars (preserves Unicode letters, apostrophes,
  hyphens); caps at 40 chars to match `authorDisplayName` field.
- `buildCookDeeplink(opts)` — composes
  `<origin>/cook/<slug>?author=<encoded>`. Returns null when the
  slug sanitises to empty.
- `buildSharePayload(opts)` — bundles url + 2-line clipboard text
  - system-share title.

The Share button on each `/path/recipes` card uses the Web Share
API when available (mobile native share sheet) and falls back to
`navigator.clipboard.writeText` + a success toast on desktop.
Origin is read from `window.location` at call time so dev links
target localhost.

## Acceptance

- [x] Share affordance on recipe cards.
- [x] Web Share API used on capable platforms.
- [x] Clipboard fallback on desktop.
- [x] Cook deeplink resolves correctly for Nourish-verified seed
      recipes (works on any device immediately) and user recipes
      (needs Y2 W1-W2 multi-device backend; falls back to
      "this recipe lives on the sharer's device" placeholder).
- [x] Author attribution shows in the URL when set.
- [x] Sprint-J IDEO review filed.
- [x] All four gates green: lint ✓, typecheck ✓, test 1073/1073 ✓,
      build ✓.

## Loop-2 RCA

1 RCA caught at typecheck pre-commit:

- TypeScript narrowed `navigator` to `never` after the
  `if ("share" in navigator)` branch took the early return. The
  subsequent `navigator.clipboard.writeText(...)` call failed to
  compile. **Fix:** cast `nav` to `Navigator | null` upfront +
  use `typeof nav.share === "function"` as the capability check
  (function-typed property check that doesn't narrow nav's type
  to "things-with-only-share").

Caught at edit time, never landed on main. The W26 typecheck-
in-build gate paid for itself again.

## Carry-forward into W52

W52 = Year-1 close doc. Plan:

1. `docs/YEAR-1-RETROSPECTIVE.md` covering all 52 weeks (W1-W26 H1
   already in `H1-RETROSPECTIVE.md`; W52 doc layers H2 + full-year
   summary).
2. Year-2 plan kickoff doc — already filed at
   `docs/YEAR-2-VIBECODE-PLAN.md` 2026-05-02.

## Retrospective

W51 closed clean. The cook-deeplink helper is the kind of pure
substrate that pays back in three places (W51 share button,
Y2 W4 attribution work, Y2 J viral-recipe surfacing). Writing
27 tests upfront made the share-handler refactor (after the
typecheck RCA) trivial because every behavioural assertion was
already pinned. Sprint J + Year-1 close cleanly; Year-2 begins
with the founder-unlock substrate sprint laid out in the Y2
plan doc.
