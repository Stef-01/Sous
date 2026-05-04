# Year-3 Retrospective — Sous

> **Filed:** 2026-05-03 (Y3 W50).
> **Period covered:** Y3 W1-W52, twelve polish sprints + close.
> **Headline:** **2293 passing tests, 0 RCAs on main across the full year, 11+ founder-unlock substrates ready for Y4 wire-up day, polish-year discipline held throughout.**

## The single-sentence summary

Year-3 took Sous from "Y2 substrate complete" to "every surface polished to competitor-app level + working MVPs of the four pantry-novelty plan features in stub mode + zero founder-unlock dependencies in production paths."

## Test count progression

| Milestone          | Tests     | Delta                    |
| ------------------ | --------- | ------------------------ |
| Y2 close           | 1988      | (baseline)               |
| Y3 W2 (start)      | 2025      | +37                      |
| Y3 W20             | 2227      | +202                     |
| Y3 W30             | 2280      | +53                      |
| Y3 W44             | 2293      | +13                      |
| **Y3 close (W52)** | **~2310** | **+322 across the year** |

(Final number lands on the close-week commit; W47 design-system doc is doc-only.)

## What shipped — by sprint

| Sprint | Weeks   | Theme                                | Key surfaces / substrates                                                                                            |
| ------ | ------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| A      | W1-W4   | Foundation polish                    | Cuisine grid, Pod ring strip, design tokens + dark-mode prep, search results, ingredient pantry dots, RecipeHeroCard |
| B      | W5-W8   | Today page polish                    | Cook-again recency tightening, WhosAtTable snap-scroll, novelty engine MVP scaffold, DailyNoveltyChip live           |
| C      | W9-W12  | Cook flow polish                     | Mission step polish (eyebrow + 16:10 hero); Grab/Cook/Win mostly already polished                                    |
| D      | W13-W16 | Pantry MVP                           | Photo pipeline substrate + /path/pantry/scan stub flow + ItemClass taxonomy + freshness helpers                      |
| E      | W17-W20 | Novelty engine MVP                   | Aroma profile catalog + cosine-similarity helper + dish-shape catalog (16 patterns) + eval harness                   |
| F      | W21-W24 | Smart leftovers MVP                  | LeftoverChip + MealPlanWeek schema + persistent hook + TodayPlannedSlot                                              |
| G      | W25-W28 | Swipe planner MVP                    | Swipe pool generator + /path/plan surface + WeekCalendar + /path/plan/week review                                    |
| H      | W29-W32 | Path tab polish                      | Recipes pantry-coverage glance, EmptyState reusable, household + shopping already polished                           |
| I      | W33-W36 | Community tab polish                 | Pod home cross-checked from W2; Content + friends already polished                                                   |
| J      | W37-W40 | Motion design system                 | Motion tokens + TapFeedback / ChipFeedback primitives                                                                |
| K      | W41-W44 | Empty / loading / error + WCAG audit | SkeletonCard + ErrorState + Sprint K WCAG 2.1 AA audit checklist                                                     |
| L      | W45-W48 | Performance + design-system docs     | Design system canonical reference doc                                                                                |

## Substrate inventory at Y3 close

**Y3-added pure helpers (~30 modules):**

- Foundation: tokens.ts, motion.ts, useTheme hook
- Visual primitives: MadeItRing, IngredientPantryDot, RecipeHeroCard, EmptyState, SkeletonCard, ErrorState, TapFeedback, ChipFeedback, WeekCalendar
- Pantry layer: photo-pipeline, item-class taxonomy + freshness, ingredient-pantry-status
- Engine layer: novelty engine + 16-pattern catalog, aroma-pairing + 12-profile catalog, novelty-eval harness
- Recipe layer: big-batch helper + 8-recipe catalog
- Planner layer: meal-plan Zod schemas, useMealPlanWeek hook, swipe-pool generator
- Community: pod-week-rings, cuisine-stats

**Y3-added surfaces (visible MVPs):**

- `/path/cuisines` — fluency rings grid
- `/today/search` — eyebrow + filter chips
- `/today` DailyNoveltyChip — engine-driven daily suggestion
- `/today` TodayPlannedSlot — meal-plan write-back
- `/path/pantry/scan` — haul-shot stub flow
- `/path/plan` — 90-second swipe planner
- `/path/plan/week` — week calendar review

## Founder-unlock contract status (final)

11 inherited Y2 substrates + Y3-added items, all in stub mode through Y3:

| Slot                       | Founder action                            | Y4 sprint that lights it |
| -------------------------- | ----------------------------------------- | ------------------------ |
| Clerk auth                 | `CLERK_SECRET_KEY`                        | Y4 A                     |
| Postgres                   | `DATABASE_URL` + `pnpm db:push`           | Y4 C                     |
| R2 photo storage           | 4 R2 env vars                             | Y4 B                     |
| V3 trainer real-mode       | retune + flag flip                        | Y4 G (post-cohort data)  |
| Push notifications         | VAPID keys                                | Y4 F (also APNs / FCM)   |
| Voice conversational LLM   | `ANTHROPIC_API_KEY`                       | Y4 A                     |
| Voice-to-draft pipe        | shares `ANTHROPIC_API_KEY`                | Y4 A                     |
| Pod agentic recipe pick    | shares `ANTHROPIC_API_KEY`                | Y4 A                     |
| Agentic web search         | `TAVILY_API_KEY` (or Brave / SerpAPI)     | Y4 A                     |
| Viral recipe extraction    | shares `ANTHROPIC_API_KEY`                | Y4 A                     |
| Charity Stripe charges     | `STRIPE_SECRET_KEY` + verified nonprofits | Y4 B                     |
| Pantry vision detection    | shares `ANTHROPIC_API_KEY`                | Y4 A                     |
| Native distribution        | Apple Developer + Play Console            | Y4 D + E                 |
| Editorial partnerships     | clinician + creator outreach              | Y4 H                     |
| Bilingual translator hires | translator engagement                     | Y4 I                     |

Six unique config edits unlock 11+ substrates: Clerk + DB + R2 + VAPID + Anthropic + Tavily + Stripe.

## Behavioural overlay tracker (final at Y3 close)

All 6 NOOM-inspired overlays from the Y2 plan plus 3 bonus patterns continue active. Y3 added one new variable-reward surface (DailyNoveltyChip) that maintains the curiosity-styled discipline (no FOMO).

| #   | Pattern                     | Origin | Y3 status                             |
| --- | --------------------------- | ------ | ------------------------------------- |
| 1   | Anchoring                   | Y2 C   | Cook-again chip refined W6 (recency)  |
| 2   | Implementation intentions   | Y2 E   | Unchanged                             |
| 3   | Streak forgiveness          | Y2 E   | Unchanged                             |
| 4   | Identity reinforcement      | Y2 E   | Unchanged                             |
| 5   | Peak-end anchoring          | Y2 F   | Unchanged                             |
| 6   | Reflection journaling       | Y2 G   | Unchanged                             |
| +   | Tiny goals                  | Y2 I   | Unchanged                             |
| +   | Identity-streak             | Y2 I   | Unchanged                             |
| +   | Variable-reward (curiosity) | Y2 J   | DailyNoveltyChip extends pattern (W8) |

## RCAs on main: zero

**Full Y3: 0 RCAs on main.** Combined Y2+Y3 streak now in the ~95-week range at Y3 close.

Mid-sprint catches across Y3 (sample, never reached main):

- W3: tokens duplicate-name test conflicted with intent-aliasing → reframed as documentation rather than enforcement.
- W6: cook-again "monotonic ramp down" test used 60d/85d samples that all collapsed to 0 with the new 56d MAX → samples updated to 35d/45d/55d.
- W8: novelty engine react-hooks/purity flagged Date.now() in useMemo → wrapped in eslint-disable with rationale + lifted to a single new Date() call.
- W14: pod-week-rings test fixtures used a stale Pod schema → refreshed.
- W18: dish-shape JSON test asserted exactly 6 dishTypes → expanded valid bucket set to 11 for the 16-pattern catalog.
- W20: novelty-eval cohort fixture deduplication.
- W23: parseStoredMealPlanWeek week-key cross-stale guard.
- W25: computePantryCoverage signature is `(recipe, pantry)` not bundled-object.
- W26: pool's strict 0.7 coverage floor matched zero candidates against W18 catalog → V1 lowered to 0.4.
- W40: TapFeedback typecheck conflict (ButtonHTMLAttributes vs motion's onDrag) → switched to HTMLMotionProps.
- W42: SkeletonCard initial draft animated regardless of prefers-reduced-motion → gated before commit.

Eleven catches across the year, all before commit. The four-gate discipline (lint + typecheck + test + build) is the load-bearing layer; per-week 3-loop testing surfaces the rest.

## UX-recon framework — final coverage

| #   | Pattern               | Status at Y3 close                                         |
| --- | --------------------- | ---------------------------------------------------------- |
| 1   | Hero card             | RecipeHeroCard reusable; Mission step inline               |
| 2   | Eyebrow caps          | Across cuisines / search / Mission / pantry-coverage badge |
| 3   | Meta strip            | Hero card built-in + recipes list                          |
| 4   | Save corner           | RecipeHeroCard built-in                                    |
| 5   | Servings stepper      | Deferred — Y4 polish week                                  |
| 6   | Step-by-step progress | Pre-Y3 (Y2 W23-W25)                                        |
| 7   | Step-locked progress  | Linked to #6                                               |
| 8   | Ingredient checklist  | IngredientList with pantry dots                            |
| 9   | Filter chips          | Search results page                                        |
| 10  | Made-it ring          | Cuisines + Pod gallery; 2 more carries forward             |
| 11  | Identity strip        | Cuisines page + Today rhythm widget                        |
| 12  | Variable-reward       | Daily novelty + cook-again highlight tier                  |

10 of 12 patterns landed; 2 (servings stepper, additional made-it ring surfaces) carry to Y4.

## Cross-cutting wins

1. **Audit-by-construction.** Routing every empty / loading / error state through W30/W42/W43 primitives meant the Sprint K WCAG check became one-time per primitive. The discipline compounded: design tokens (W3) → motion tokens (W37) → state primitives (W42/W43) → audit-once contract.
2. **Substrate compounds across years.** The W25 swipe-pool generator uses Y2 W15 pantry-coverage + Y3 W23 MealPlanWeek + Y3 W18 dish-shape catalog + Y3 W4 ingredient color dots. Three prior commits chain into one new feature without new dependencies.
3. **0 RCAs across two years.** Y2 closed at 44 weeks; Y3 closed extending the streak past 95 weeks. The cumulative pattern: every catch lands BEFORE main, never AFTER.

## What's next — Y4

Filed alongside this retro at `docs/YEAR-4-VIBECODE-PLAN.md` (W51 deliverable).

Y4 is the reach phase. Six unique founder-key config edits unlock 11+ substrates simultaneously. Native distribution (iOS + Android) lights up real-cohort data accumulation. Editorial partnerships fill the Stage-3 Content tab. Bilingual launch widens the audience. The polish discipline that defined Y3 carries unchanged.

## In one paragraph

Year-3's headline: **the polish year worked.** Every surface in the app has competitor-app-level visual rhythm. The four pantry-novelty MVPs ship as working stub-mode demos. Zero founder-unlock dependencies in production paths means Stefan can ship Y3-as-is with stub modes if the keys aren't ready, OR flip the keys at any point during Y4 to light up the next layer. The substrate-first discipline that worked across Y2 worked again across Y3 — pure helpers first, surface integration second, audit by construction. **Two consecutive years of 0 RCAs on main.**
