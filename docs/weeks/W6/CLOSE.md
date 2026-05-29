# W6 close — shared-component sweep wave 2

**Sprint:** B (Stage-4 W2 cross-cutting infra)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint B W6
**Date closed:** 2026-05-02
**Scope:** continue the Stage-4-W1 component-extraction sweep onto
the next batch of surfaces.

## Shipped commits

- `30e0457` feat(stage-4-w6): shared-component sweep wave 2 — 4 more
  surfaces (saved page, forum-thread-list, reels-rail, expert-voices-row)
  now adopt `<SectionKicker>` + drop their decorative right-aligned
  taglines. The saved-page empty-state uses `<EmptyStateCTA>`.

## Surfaces touched

| Route / file                                   | Component(s) adopted              | Net deletions                                     |
| ---------------------------------------------- | --------------------------------- | ------------------------------------------------- |
| `src/app/(community)/community/saved/page.tsx` | SectionKicker (×2), EmptyStateCTA | 2 inline kicker spans, 1 inline empty-state block |
| `src/components/content/forum-thread-list.tsx` | SectionKicker                     | 1 kicker, 1 decorative tagline                    |
| `src/components/content/reels-rail.tsx`        | SectionKicker                     | 1 kicker                                          |
| `src/components/content/expert-voices-row.tsx` | SectionKicker                     | 1 kicker, 1 decorative tagline                    |

## Stress test

**Test type:** 375×667 viewport sweep (per the W6 stress-test
assignment in the 12-month plan).
**Result:** All 4 surfaces render correctly at iPhone-SE size. SSR-
curl confirms `Browse Content`, `Nothing saved yet`, `Forum talk`,
`Reels worth watching`, `Expert voices` all serve via the new
shared components.

## Acceptance

- [x] Surfaces inherit shared components rather than re-declaring patterns.
- [x] No visual regression (decorative taglines were the only intentional drop).
- [x] pnpm lint ✓ / pnpm test 411/411 ✓ / pnpm build ✓.

## Residuals

- 8 more components in `src/components/content/*` and `src/components/path/*`
  still have inline kicker patterns; queued for W6.B / W7 follow-up.
- The new sous/reduced-motion-gate ESLint rule (W7) ended up flagging
  pre-existing violations across the codebase; remediation tracked in
  `docs/REDUCED-MOTION-GATE-TODO.md`.

## Retrospective (1 paragraph)

The shared-component pattern adoption is paying off — each new surface
that adopts `<SectionKicker>` deletes 3-4 lines of CSS class soup. The
"drop the decorative right-aligned taglines" delta from the polish
appraisal made it into the same commit cleanly because both changes
touched the same lines. Next batch should consolidate the
`MetaPill` adoption similarly.
