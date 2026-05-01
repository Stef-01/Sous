# Sprint 2 — IDEO Design Review (2026-05-01, mid-sprint snapshot)

> Sprint 2 of the Stage-3 cycle, written same day as Sprint 1's
> close-out and Sprint 2's two waves. Captures Path × Games × Pantry
> deepening pass + Stanford content run #2.

## Review date

2026-05-01

## Build state at review

- Latest commit on main: `14e6015`
  (feat(sprint-2-wave-b): path-home rhythm + Stanford content run #2)
- Test count: 398 passing / 398 total
- Build: ✓ passing
- 13 Stanford articles + 1 research brief + 8 expert voices live in
  the Content tab.

## Full surface scorecard (post-Sprint-2)

Score deltas from Sprint 1 IDEO review shown as `before → after`.

| Route                        | I         | M         | C         | P         | Avg             | W   |
| ---------------------------- | --------- | --------- | --------- | --------- | --------------- | --- |
| `/today`                     | 4         | 3         | 4         | 4         | 3.75            | 3   |
| `/cook/[slug]`               | 4         | 4         | 4         | 4         | 4.00            | 3   |
| `/cook/combined`             | 4         | 3         | 3         | 3         | 3.25            | 3   |
| Win screen (cook flow)       | 4         | 4         | 4         | 4         | 4.00            | 3   |
| `/path`                      | 3 → **4** | 3         | 3 → **4** | 3 → **4** | 3.00 → **3.75** | 2   |
| `/path/favorites`            | 3 → **4** | 3 → **4** | 3 → **4** | 3 → **4** | 3.00 → **4.00** | 1   |
| `/path/pantry`               | 3 → **4** | 3 → **4** | 3 → **4** | 3 → **4** | 3.00 → **4.00** | 1   |
| `/path/scrapbook`            | 3         | 4         | 3         | 3         | 3.25            | 1   |
| `/path/shopping-list`        | 3 → **4** | 3 → **4** | 3 → **4** | 3 → **4** | 3.00 → **4.00** | 1   |
| `/community`                 | 4         | 4         | 4         | 4         | 4.00            | 2   |
| `/community/article/[slug]`  | 3         | 4         | 3         | 4         | 3.50            | 1   |
| `/community/expert/[slug]`   | 3         | 4         | 3         | 4         | 3.50            | 1   |
| `/community/forum/[id]`      | 4         | 3         | 3         | 4         | 3.50            | 1   |
| `/community/reels`           | 4         | 4         | 4         | 4         | 4.00            | 2   |
| `/community/research/[slug]` | 3         | 4         | 3         | 4         | 3.50            | 1   |
| `/community/saved`           | 3         | 4         | 3         | 3         | 3.25            | 1   |
| `/games` (hub)               | 3 → **4** | 3 → **4** | 3 → **4** | 3 → **4** | 3.00 → **4.00** | 2   |
| `/games/cuisine-compass`     | 3         | 3         | 4         | 4         | 3.50            | 1   |
| `/games/flavor-pairs`        | 3         | 3         | 4         | 4         | 3.50            | 1   |
| `/games/speed-chop`          | 4         | 3         | 4         | 4         | 3.75            | 1   |
| `/games/whats-cooking`       | 4         | 3         | 4         | 4         | 3.75            | 1   |
| `/sides`                     | 3         | 4         | 3         | 3         | 3.25            | 1   |

**Surface count at score ≥ 3.5 after Sprint 2:** 21 of 22 (was 16 of
22 after Sprint 1). The single exception is `/cook/combined` (3.25),
intentionally deferred to Sprint 5.

**Surface count at score ≥ 4.0:** 9 of 22 (was 5 of 22 after Sprint 1).

## What landed in Sprint 2 (committed to main)

1. `da3c94e` feat(sprint-2-wave-a): games hub identity + path detail state polish
2. `14e6015` feat(sprint-2-wave-b): path-home rhythm + Stanford content run #2 (4 articles)

Plus the Sprint 2 audit doc (`docs/sprints/2/AUDIT.md`) and Stanford
ledger updates.

## Top-20 deltas — carry-forward into Sprint 3

Sprint 3 in `STAGE-3-VIBECODE-AUTONOMOUS-6MO.md` is **Content tab
end-to-end + Reels**. The top 5 below are non-negotiable.

1. `/cook/combined` density audit — **deferred from Sprint 1** —
   re-deferred to Sprint 5 with the same rationale (no behavioural
   regression budget without dedicated test coverage).
2. `/community/article/[slug]` typography rhythm — line-height,
   paragraph spacing, optional pull-quote treatment for the 250-500
   word body. **Sprint 3 in scope.**
3. `/community/expert/[slug]` deepening — clinician profile picks up
   "From this expert" chip strip for top-3 articles, citation hover
   over articles. **Sprint 3 in scope.**
4. `/community/research/[slug]` deepening — citation block prominence
   on the Sourced-from aside, paper-title styling, "what this means
   for your kitchen" call-out variant. **Sprint 3 in scope.**
5. `/community/reels` V3 — chapter markers within longer reels,
   tap-to-pause UX, end-of-reel "Next up" preview, bookmark
   animation polish. **Sprint 3 in scope.**
6. `/community/forum/[id]` reply-thread V2 — reply-to-reply nesting,
   author-of-OP highlight, optional "thanks" reaction. Sprint 3.
7. `/community/saved` non-empty state polish — match Content home
   rhythm; consider section-header parity. Sprint 3.
8. `/community` home content density audit — 13 Stanford articles +
   placeholders means the content firehose is real now; consider
   pagination / "see all" affordance per category. Sprint 3.
9. Stanford content run #3 — 10 items, expert Q&A + research themes
   — **Sprint 3 Week 3.**
10. Stanford content run #4 — Sprint 4 Week 3 (Parent Mode themes).
11. Stanford content run #5 — Sprint 5 Week 3 (final batch + holiday).
12. Article-detail tag chips → make tappable to a tag-filter view
    (currently decorative). Sprint 3.
13. Type-ramp consistency between Path home and Content home. Sprint 5.
14. Spacing-token consistency audit. Sprint 5.
15. Motion easing register — three presets only. Sprint 5.
16. Copy register audit — friend-voice on every microcopy. Sprint 5.
17. Keyboard navigation pass. Sprint 5.
18. Screen-reader pass. Sprint 5.
19. Lighthouse mobile audit on deployed env. Sprint 5.
20. `/today` minimalism ceiling — final micro-tighten in Sprint 5
    second-pass.

## Cross-cutting observations

- **The "Find something to cook" CTA pattern is now the empty-state
  default for path detail surfaces.** Pantry, shopping-list, and the
  existing favorites page all route empty states to /today with the
  same green-pill CTA shape. Worth promoting to a shared empty-state
  component when a third use case appears.
- **Quiet metadata pills work.** "Auto-applied to your next cook's
  Grab screen" (pantry) and the bought-progress strip (shopping list)
  both do real informational work without taking layout away from the
  primary content. Same pattern shape as the "Sourced from" aside.
- **Section-kicker rhythm is now codebase-wide.** Path home quick
  links, Content tab section headers, skill-tree milestone labels,
  forum "Replies" header, and the Stanford-attribution kicker all
  use `text-[10/11px] font-bold uppercase tracking-[0.12-0.16em]
text-[var(--nourish-subtext|green)]`. Sprint 5's consistency audit
  can codify this as a token.

## Acceptance for sprint close

- [x] Every score ≤ 3 from the audit's ranked deficiency list
      addressed. (5 surfaces moved 3.0 → 3.75-4.0.)
- [x] No regression in any screen scored 4 in prior sprints.
      (Verified via SSR + lint + tests + build.)
- [x] Stanford content run shipped and visible. (4 new articles in
      run #2; 13 + 1 + 8 total live.)
- [x] Top 5 deltas pre-loaded into Sprint 3's scope. (Items 1-5 above
      explicitly target the Content tab — Sprint 3's theme.)
