# Sprint 3 — IDEO Design Review (2026-05-01)

> Sprint 3 close-out review. Captures the Content tab deepening pass +
> Stanford content run #3 + the Tailwind-JIT bug fix.

## Build state at review

- Latest commit on main: `0d8f96c`
  (feat(sprint-3): content tab deepening + Stanford run #3)
- Test count: 398 passing / 398 total
- Build: ✓ passing
- Total Stanford-attributed content: 15 articles + 1 research brief +
  9 expert voices (was 13 / 1 / 8 at Sprint 2 close).

## Surface scorecard (post-Sprint-3)

Score deltas from Sprint 2 IDEO shown as `before → after`.

| Route                        | I         | M   | C         | P         | Avg             | W   |
| ---------------------------- | --------- | --- | --------- | --------- | --------------- | --- |
| `/today`                     | 4         | 3   | 4         | 4         | 3.75            | 3   |
| `/cook/[slug]`               | 4         | 4   | 4         | 4         | 4.00            | 3   |
| `/cook/combined`             | 4         | 3   | 3         | 3         | 3.25            | 3   |
| Win screen                   | 4         | 4   | 4         | 4         | 4.00            | 3   |
| `/path`                      | 4         | 3   | 4         | 4         | 3.75            | 2   |
| `/path/favorites`            | 4         | 4   | 4         | 4         | 4.00            | 1   |
| `/path/pantry`               | 4         | 4   | 4         | 4         | 4.00            | 1   |
| `/path/scrapbook`            | 3         | 4   | 3         | 3         | 3.25            | 1   |
| `/path/shopping-list`        | 4         | 4   | 4         | 4         | 4.00            | 1   |
| `/community`                 | 4         | 4   | 4         | 4         | 4.00            | 2   |
| `/community/article/[slug]`  | 3 → **4** | 4   | 3 → **4** | 4         | 3.50 → **3.75** | 1   |
| `/community/expert/[slug]`   | 3 → **4** | 4   | 3 → **4** | 4         | 3.50 → **4.00** | 1   |
| `/community/forum/[id]`      | 4         | 3   | 3         | 4         | 3.50            | 1   |
| `/community/reels`           | 4         | 4   | 4         | 4         | 4.00            | 2   |
| `/community/research/[slug]` | 3 → **4** | 4   | 3 → **4** | 4 → **4** | 3.50 → **4.00** | 1   |
| `/community/saved`           | 3         | 4   | 3         | 3         | 3.25            | 1   |
| `/games` (hub)               | 4         | 4   | 4         | 4         | 4.00            | 2   |
| `/games/cuisine-compass`     | 3         | 3   | 4         | 4         | 3.50            | 1   |
| `/games/flavor-pairs`        | 3         | 3   | 4         | 4         | 3.50            | 1   |
| `/games/speed-chop`          | 4         | 3   | 4         | 4         | 3.75            | 1   |
| `/games/whats-cooking`       | 4         | 3   | 4         | 4         | 3.75            | 1   |
| `/sides`                     | 3         | 4   | 3         | 3         | 3.25            | 1   |

**Surface count at score ≥ 3.5 after Sprint 3:** 21 of 22 (no change
from Sprint 2 — the lone exception remains `/cook/combined`).
**Surface count at score ≥ 4.0:** 12 of 22 (was 9 of 22 at Sprint 2
close).

## What landed in Sprint 3

1. `0d8f96c` feat(sprint-3): content tab deepening + Stanford run #3

Five sub-landings inside that commit:

- Article-detail typography rhythm (excerpt-as-lede + body cadence)
- Expert-detail "From X" header gains `{N} articles` count
- Research-brief detail "Source paper" card replaces italic line
- 2 new Stanford articles (Holiday rhythm + Celiac plain-English)
- Sprint 2 IDEO doc bug fix (Tailwind JIT extracting invalid class
  from prose)

## Top-20 deltas — carry-forward into Sprint 4

Sprint 4 in `STAGE-3-VIBECODE-AUTONOMOUS-6MO.md` is **Parent Mode +
Settings + Overlays**. The top 5 below are non-negotiable.

1. `/cook/combined` density audit — **re-deferred to Sprint 5** (third
   deferral; Sprint 5 is the explicit home for it).
2. **Parent Mode toggle UX** — re-audit the entire PM-on flow at
   375×812. Check kid-friendly hint, kid-swap chip, spice slider,
   component split toggle, kids-ate-it prompt, lunchbox suggest,
   nutrient spotlight render rhythm. Sprint 4 in scope.
3. **Profile & Settings sheet redesign** — currently utilitarian;
   needs the IDEO bar. Sprint 4 in scope.
4. **Toast variant audit** — all 4 variants (achievement, level-up,
   success, info) lined up at 375×812 with consistent corner radius,
   spacing, motion. Sprint 4 in scope.
5. **Coach surfaces consolidation** — quiz, win-screen line, vibe
   prompt all carry the same persona register. Sprint 4 in scope.
6. `/community/forum/[id]` reply-thread V2 (deeper than Sprint 3
   stub). Sprint 4 if time permits, otherwise Sprint 5.
7. `/community/saved` non-empty state mirror Content home rhythm.
   Sprint 4 if time permits.
8. Stanford content run #4 — 8-10 items, picky eating + lunchbox +
   allergens themes. **Sprint 4 Week 3.**
9. Stanford content run #5 — Sprint 5 Week 3 (final batch).
10. Article-detail tag chips → tappable to a tag-filter view. Sprint 5.
11. `/path/scrapbook` polish (still at 3.25 — Sprint 5 typography
    retune). Sprint 5.
12. `/community/saved` polish (still at 3.25). Sprint 5.
13. `/sides` polish (3.25). Sprint 5.
14. Type-ramp consistency token. Sprint 5.
15. Spacing-token consistency. Sprint 5.
16. Motion easing register codify. Sprint 5.
17. Copy register audit. Sprint 5.
18. Keyboard navigation pass. Sprint 5.
19. Screen-reader pass. Sprint 5.
20. Lighthouse mobile audit on deployed env. Sprint 5.

## Cross-cutting observations

- **The "Stanford permission scope" pattern is now mature.** Source
  attribution renders consistently on article + research detail
  pages with three load-bearing components: kicker ("Sourced from"),
  source title (semibold), and "Read the original" pill + paraphrase
  disclaimer. Pattern is ready to lift to a shared component in
  Sprint 5 if a third surface adopts it (likely the reels caption
  for sourced video content).
- **Tailwind JIT scans markdown.** This sprint surfaced a real risk:
  any `text-[…]` notation in prose docs will be extracted as a class
  candidate. Going forward, IDEO docs that need to discuss arbitrary-
  value classes must split the bracket apart in prose (e.g.
  "`text-[var(--nourish-subtext)]` or `text-[var(--nourish-green)]`")
  rather than combine them with `|`.
- **Content density on `/community` home is becoming a real concern.**
  15 Stanford articles + 6 placeholder articles + research +
  reels + experts + forum is starting to feel like a firehose. The
  Sprint 3 audit flagged section pagination as carry-forward; Sprint
  4 / 5 should pick this up if a "see all by category" view doesn't
  already exist.

## Acceptance for sprint close

- [x] Every Sprint-3 in-scope surface scored 4.0 (Article 3.75,
      Expert 4.0, Research 4.0).
- [x] No regression in any 4-scored screen from prior sprints.
- [x] Stanford content run #3 shipped and visible.
- [x] Top 5 deltas pre-loaded into Sprint 4 scope (PM toggle,
      Settings, toasts, coach surfaces).
