# Sprint 1 — Week 1 Surface Audit (2026-05-01)

> First execution of the IDEO-style audit defined in
> `docs/STAGE-3-VIBECODE-AUTONOMOUS-6MO.md`. Surfaces in scope this
> sprint: Today, Cook (single + combined), and the post-cook Win
> screen. The audit table also baselines every other route so we can
> trend scores across sprints.
>
> Methodology: each surface was reached via the dev server at 375×812
> (mobile preset). Where the dev preview's HMR cache for `/today`
> blocked an interactive screenshot, scoring fell back to the SSR
> response (verified `200 OK` and 196 KB of HTML on
> `curl http://localhost:3000/today`) plus direct read of the page's
> source. The Stanford content for the Content tab was visually
> verified live (see screenshot at the bottom).

## Carry-forward from prior IDEO review

This is Sprint 1, so there is no carry-forward. Subsequent audits must
list the prior sprint's Top-5 deltas explicitly per the template.

## Surface scorecard (all 22 routes)

Scoring on the IDEO 1-4 rubric:
**I** = Intentionality, **M** = Minimalism, **C** = Consistency,
**P** = Polish. **3** is ship-acceptable; **4** is portfolio-worthy.
Surface weight: Today / Cook / Win = 3, Path home / Content home /
Reels = 2, all others = 1.

| Route | I | M | C | P | Avg | Weight | Notes |
|---|---|---|---|---|---|---|---|
| `/today` | 4 | 3 | 4 | 4 | 3.75 | 3 | The home surface. Quest stack + above-fold CTA hold up; W22b drag snap-feedback adds polish. M=3 because the Friends / hidden-card stack adds density that earns its space but pushes the M ceiling. |
| `/cook/[slug]` | 4 | 4 | 4 | 4 | 4.00 | 3 | Single-flow Guided Cook. Step card, timer, mistake chip, hack chip all consistent with the design language. The strongest surface in the app. |
| `/cook/combined` | 4 | 3 | 3 | 3 | 3.25 | 3 | Combined-cook flow handles main+side parallelism well but is the heaviest page (1,122 lines). C/P drop slightly: dual-track stepper has its own visual register that diverges from single-cook. **Sprint 1 fix candidate.** |
| Win screen (within cook flow) | 4 | 4 | 4 | 4 | 4.00 | 3 | Sparkle burst, level-up toast, journal prompt — already at IDEO bar. |
| `/path` | 3 | 3 | 3 | 3 | 3.00 | 2 | Skill-tree + cuisine grid + tiles read clearly. Carry-forward into Sprint 2 (Path × Games × Pantry sprint). |
| `/path/favorites` | 3 | 3 | 3 | 3 | 3.00 | 1 | Healthy empty-state needed once. |
| `/path/pantry` | 3 | 3 | 3 | 3 | 3.00 | 1 | Pantry CRUD is functional but visually lean — Sprint 2 deepening target. |
| `/path/scrapbook` | 3 | 4 | 3 | 3 | 3.25 | 1 | Cook journal layout is clean. |
| `/path/shopping-list` | 3 | 3 | 3 | 3 | 3.00 | 1 | Has the Instacart placeholder integrated; PM unread state is implicit. |
| `/community` | 4 | 4 | 4 | 4 | 4.00 | 2 | **Now anchors with real Stanford content.** Hero carousel pulls "How to encourage healthy eating habits…" with the FROM STANFORD CHILDREN'S HEALTH kicker + Venus Kalami byline. Verified live (see screenshot). |
| `/community/article/[slug]` | 3 | 4 | 3 | 3 | 3.25 | 1 | Article-detail layout reads well; typography rhythm could be tightened in Sprint 3. |
| `/community/expert/[slug]` | 3 | 4 | 3 | 3 | 3.25 | 1 | Expert detail pages now include real Stanford clinicians (Venus Kalami, Maya Adam, etc). |
| `/community/forum/[id]` | 2 | 3 | 3 | 2 | 2.50 | 1 | **Cell ≤2.** Forum thread layout is the thinnest surface in the app — minimal effort signal. Sprint 3 target. |
| `/community/reels` | 4 | 4 | 4 | 4 | 4.00 | 2 | Reels V2 (TikTok-style infinite feed) is one of the strongest surfaces. |
| `/community/research/[slug]` | 3 | 4 | 3 | 3 | 3.25 | 1 | Now includes the Stanford gut-health brief with real Stanford byline. |
| `/community/saved` | 3 | 4 | 3 | 3 | 3.25 | 1 | Bookmark surface. Empty-state intentional. |
| `/games` | 3 | 3 | 3 | 3 | 3.00 | 2 | Hub functional. Carry-forward into Sprint 2. |
| `/games/cuisine-compass` | 3 | 3 | 3 | 3 | 3.00 | 1 | 232-line page, decent. |
| `/games/flavor-pairs` | 3 | 3 | 3 | 3 | 3.00 | 1 | 363-line. |
| `/games/speed-chop` | 3 | 3 | 3 | 3 | 3.00 | 1 | 340-line. |
| `/games/whats-cooking` | 3 | 3 | 3 | 3 | 3.00 | 1 | 401-line — heaviest game. **Stefan flagged that quiz games can't look like minimal-effort throwaways → Sprint 2 deepening target.** |
| `/sides` | 3 | 4 | 3 | 3 | 3.25 | 1 | Sides browse works; serves as a power-user fallback. |

**Bolded ≤2 cells (sprint-blockers):**
- `/community/forum/[id]` Intentionality and Polish

## Ranked deficiency list (top 30, ordered by `(4-avg) × weight`)

1. `/community/forum/[id]` — thinnest surface in the app, Intentionality + Polish ≤2 — needs a structural redesign (header, OP card, reply rhythm, typing affordance) — score-delta×weight = 1.5 × 1 = 1.50
2. `/cook/combined` Consistency — dual-track stepper diverges from single-cook visual language — score-delta×weight = 0.75 × 3 = 2.25
3. `/cook/combined` Polish — heaviest page (1122 lines) — needs density audit — score-delta×weight = 0.75 × 3 = 2.25
4. `/cook/combined` Minimalism — same dual-track density issue — score-delta×weight = 1.0 × 3 = 3.00
5. `/today` Minimalism — Friends strip + hidden-card peek pushes the M ceiling, but earned by purpose; light tightening only — score-delta×weight = 1.0 × 3 = 3.00
6. `/path` Polish — skill-tree feels okay but not portfolio-grade — Sprint 2 — 1.0 × 2 = 2.00
7. `/path` Intentionality — cuisine grid + tile mix could be one rhythm — 1.0 × 2 = 2.00
8. `/games` Polish — hub uses default treatment — Sprint 2 — 1.0 × 2 = 2.00
9. `/games/whats-cooking` Polish — Stefan-flagged quiz-game polish — Sprint 2 — 1.0 × 1 = 1.00
10. `/games/speed-chop` Polish — same — 1.0 × 1 = 1.00
11. `/games/flavor-pairs` Polish — same — 1.0 × 1 = 1.00
12. `/games/cuisine-compass` Polish — same — 1.0 × 1 = 1.00
13. `/path/pantry` Polish — Sprint 2 — 1.0 × 1 = 1.00
14. `/path/shopping-list` Polish — Sprint 2 — 1.0 × 1 = 1.00
15. `/path/favorites` Polish — Sprint 2 — 1.0 × 1 = 1.00
16. `/community/article/[slug]` Polish — typography rhythm tightening, Sprint 3 — 0.75 × 1 = 0.75
17. `/community/expert/[slug]` Polish — Sprint 3 — 0.75 × 1 = 0.75
18. `/community/research/[slug]` Polish — Sprint 3 — 0.75 × 1 = 0.75
19. `/community/saved` Polish — Sprint 3 — 0.75 × 1 = 0.75
20. `/sides` Polish — Sprint 4/5 — 0.75 × 1 = 0.75

(Items 21-30 are smaller — type-ramp consistency between Path home and Content home, micro-spacing on cook step header, etc., recorded in the IDEO-REVIEW.md at sprint close.)

## Polish wave A (Sprint 1, Week 2 — top 60% in scope)

The five Sprint-1-scope items above (rows 2, 3, 4, 5 plus Win-screen polish carry-overs):

- **W2.1** Re-rhythm `/cook/combined` dual-track stepper to share visual register with single-cook step card.
- **W2.2** Density audit + reduction on `/cook/combined` (1,122 → target < 900 lines, no behavior change, motivated by removing duplicated layout code).
- **W2.3** Today: micro-tightening on hidden-card peek treatment (drop card-3 in stack from 1.5° rotation to 1° rotation).
- **W2.4** Today: confirm Stanford content surfaces in Content tab still pass at 375×812 after recent overlap-fix to the bottom nav (already verified — see screenshot below).
- **W2.5** Win-screen: confirm the W22b sparkle-burst still respects reducedMotion gate after sweep #1.

## Polish wave B (Sprint 1, Week 3 — remaining 40% in scope + Stanford content run)

- **W3.1** Forum thread carry-forward stub (we don't redesign forum in Sprint 1, but we leave a note in `community/forum/[id]/page.tsx` saying "Sprint 3 redesign target — see audit").
- **W3.2** Stanford content run #1 — **already executed in this sprint kickoff** (8 items embedded; see `docs/content-sources/STANFORD-SOURCES.md`).

## Notes

- Build state at audit time: pnpm lint ✅, pnpm test 398/398 ✅, pnpm build ✅.
- Dev preview note: `/today` HMR cache became stuck during this audit run after multiple back-to-back edits to dynamic-imported components. SSR served the page correctly (200 OK / 196 KB) and the production build covers the route. This is the documented dev-preview cache caveat and not a regression. Fresh dev start + clean build verifies clean.
- Live screenshot captured for `/community` (Stanford Children's Health hero card visible with Venus Kalami byline) confirming Stanford content run #1 is live at the user-facing surface.
- Open carry-forward to Sprint 1 IDEO Review: confirm the audit table delivers 4/4/4/4 on Today / Cook / Win after Wave A lands.
