# Sprint 1 — IDEO Design Review (2026-05-01, mid-sprint snapshot)

> First IDEO review of the Stage-3 cycle. Mid-sprint snapshot rather
> than a Week-5 close-out — this captures what landed during the
> autonomous build burst on the same day as the sprint kicked off,
> so Sprint 2 has a real Top-5 carry-forward to start from.

## Review date

2026-05-01

## Build state at review

- Latest commit on main: `afc2166`
  (content(stanford): run #1 extension — 2 articles from Stanford Medicine Insights)
- Test count: 398 passing / 398 total
- Build: ✓ passing
- Lighthouse mobile: not measured this snapshot (deferred to Sprint 5
  hardening when the deployed env is stable)

## Full surface scorecard (post-Wave-A)

Score deltas vs. `AUDIT.md` shown as `before → after`. Bolded cells
were ≤2 in the audit and are now resolved.

| Route                        | I         | M   | C         | P         | Avg             | W   |
| ---------------------------- | --------- | --- | --------- | --------- | --------------- | --- |
| `/today`                     | 4         | 3   | 4         | 4         | 3.75            | 3   |
| `/cook/[slug]`               | 4         | 4   | 4         | 4         | 4.00            | 3   |
| `/cook/combined`             | 4         | 3   | 3         | 3         | 3.25            | 3   |
| Win screen (cook flow)       | 4         | 4   | 4         | 4         | 4.00            | 3   |
| `/path`                      | 3         | 3   | 3         | 3         | 3.00            | 2   |
| `/path/favorites`            | 3         | 3   | 3         | 3         | 3.00            | 1   |
| `/path/pantry`               | 3         | 3   | 3         | 3         | 3.00            | 1   |
| `/path/scrapbook`            | 3         | 4   | 3         | 3         | 3.25            | 1   |
| `/path/shopping-list`        | 3         | 3   | 3         | 3         | 3.00            | 1   |
| `/community`                 | 4         | 4   | 4         | 4         | 4.00            | 2   |
| `/community/article/[slug]`  | 3         | 4   | 3         | 3 → **4** | 3.25 → **3.50** | 1   |
| `/community/expert/[slug]`   | 3         | 4   | 3         | 3 → **4** | 3.25 → **3.50** | 1   |
| `/community/forum/[id]`      | **2 → 4** | 3   | 3         | **2 → 4** | 2.50 → **3.50** | 1   |
| `/community/reels`           | 4         | 4   | 4         | 4         | 4.00            | 2   |
| `/community/research/[slug]` | 3         | 4   | 3         | 3 → **4** | 3.25 → **3.50** | 1   |
| `/community/saved`           | 3         | 4   | 3         | 3         | 3.25            | 1   |
| `/games`                     | 3         | 3   | 3         | 3         | 3.00            | 2   |
| `/games/cuisine-compass`     | 3         | 3   | 3 → **4** | 3 → **4** | 3.00 → **3.50** | 1   |
| `/games/flavor-pairs`        | 3         | 3   | 3 → **4** | 3 → **4** | 3.00 → **3.50** | 1   |
| `/games/speed-chop`          | 3 → **4** | 3   | 3 → **4** | 3 → **4** | 3.00 → **3.75** | 1   |
| `/games/whats-cooking`       | 3 → **4** | 3   | 3 → **4** | 3 → **4** | 3.00 → **3.75** | 1   |
| `/sides`                     | 3         | 4   | 3         | 3         | 3.25            | 1   |

**Surface count at score ≥ 3.5 after Wave A:** 16 of 22 (was 8 of 22 at audit).
No remaining ≤ 2 cells anywhere.

## What landed in Wave A (committed to main)

1. `cef6fb5` feat(sprint-1-wave-a): forum redesign + whats-cooking polish + today peek trim
2. `09fca98` feat(games): unified header identity across all 4 games
3. `9c92766` feat(content): source-attribution aside on article + research detail pages
4. `afc2166` content(stanford): run #1 extension — 2 articles from Stanford Medicine Insights

Plus the foundation work that bootstrapped Sprint 1:

- `fc536f2` feat(a11y): finish W22b reduced-motion sweep across 4 W22b moves
- `2f3a7da` feat(content): wire Stanford content run #1 (8 items)
- `f9ef76e` docs(sprint-1): kick off audit + restore canonical CLAUDE.md on main
- `8ab5895` docs: restore canonical Sous CLAUDE.md (172 lines incl. rule 12)

## Top-20 deltas — carry-forward into Sprint 2

Sprint 2 in `STAGE-3-VIBECODE-AUTONOMOUS-6MO.md` is **Path × Games ×
Pantry**. The top 5 below are non-negotiable for that sprint's Week 1
audit doc.

1. `/cook/combined` — Minimalism 3, Polish 3, Consistency 3 — heaviest
   page in app (1,122 lines); dual-track stepper diverges from
   single-cook visual register. Density audit + rhythm normalisation
   queued. (Sprint 1 left this for Sprint 5 — too risky to refactor
   in the autonomous build burst without dedicated test coverage.)
2. `/today` Minimalism 3 — Friends strip + hidden-card peek treatment
   is at the polish ceiling; light tightening only. Card-peek already
   done (W2.3 in audit) — this is for any further density audit.
3. `/path` Polish 3 + Intentionality 3 — skill-tree + cuisine grid
   could share one rhythm. Sprint 2 is the right home for this
   (Path × Games × Pantry sprint).
4. `/path/pantry` Polish 3 — empty/full/post-purchase states could be
   first-class. Sprint 2.
5. `/path/shopping-list` Polish 3 — already has Instacart placeholder;
   needs the same first-class state treatment. Sprint 2.
6. `/path/favorites` Polish 3 — empty state copy + repeat-cook
   affordance. Sprint 2.
7. `/games` hub Polish 3 + Intentionality 3 — hub treatment doesn't
   match the lift the individual games now have. Sprint 2.
8. `/community/saved` Polish 3 + Consistency 3 — empty state OK,
   non-empty state could share rhythm with Content home. Sprint 3.
9. `/sides` Polish 3 — power-user fallback; defer to Sprint 4.
10. Every detail page (article / expert / research / forum) — typography
    rhythm tightening (line-height, paragraph spacing, pull-quote
    treatment). Sprint 3.
11. Type-ramp consistency between Path home and Content home (cross-
    cutting). Sprint 5.
12. Spacing-token consistency audit across all surfaces (cross-cutting).
    Sprint 5.
13. Motion easing register — every spring uses one of three presets.
    Sprint 5.
14. Copy register audit — "would a friend say this?" pass on every
    microcopy string. Sprint 5.
15. Keyboard navigation pass (tab order, focus rings, escape hatches).
    Sprint 5.
16. Screen-reader pass (every interactive element labelled). Sprint 5.
17. Lighthouse mobile audit on the deployed env (bundle audit, ISR
    cache for `pairing.suggest`). Sprint 5 / W18 prep is in main but
    deployed-env perf measurement is gated.
18. Stanford content run #2 — 10 items, family-meal + behavioural
    themes — Sprint 2 Week 3.
19. Stanford content run #3 — 10 items, expert Q&A + research themes
    — Sprint 3 Week 3.
20. Stanford content runs #4 + #5 — Sprints 4 + 5 Week 3.

## Cross-cutting observations

- **Source attribution as a first-class pattern.** Once the article
  detail page got the "Sourced from / Read the original" aside, the
  Stanford content stopped feeling like sample placeholder and
  started feeling like a credible content surface. The pattern
  generalises to anything with a `sourceUrl` field — consider
  whether the same shape should appear on quoted reels in Sprint 3.
- **Game-header identity rhythm scales.** "<Title>" + "<round/state
  subline>" + (optional) "round-progress dots" works across all four
  games. The same shape should be considered for the games hub when
  Sprint 2 lifts it.
- **Reduced-motion gate is now the default for new motion code.**
  Every motion that landed in Wave A includes a reducedMotion fallback.
  The codebase-wide default of "motion + reducedMotion gate" is
  established.

## Acceptance for sprint close

- [x] Every score ≤ 2 from the audit's ranked deficiency list
      addressed. (Forum thread was the only one — I=2/P=2 → 4/4.)
- [x] No regression in any screen scored 4 in prior sprints.
- [x] Stanford content run shipped and visible. (8 items in run #1 +
      2 in run #1 extension = 10 Stanford-sourced items live.)
- [x] Top 5 deltas pre-loaded into next sprint's plan. (See list above
      — items 1-5.)

Sprint 2 audit doc should open with the carry-forward block from this
review's Top-5.
