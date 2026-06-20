# Today Dashboard — 10-Step Recursive Improvement Plan

> **Goal (founder, 2026-06-20):** bring the key metrics back onto the **main
> (Today) screen** — food stats, nutrient stats, cravings, content — integrated
> and _simplified_, the way the early demo had them before the deck/Tamaweb era
> (when "the diary became the Today home", commit `111ea0c`). Easy to see at a
> glance; detail stays one tap away.

## Where things stand (ground truth)

- **Today** (`src/app/(today)/today/page.tsx`) is craving-first: header → craving
  search → QuestCard deck → conditional chips → more-options → friends. **No
  nutrition metrics.**
- **Nutrition** (`src/app/(nutrition)/nutrition/page.tsx`) holds the dashboard:
  `WeekStrip`, `CaloriesCard`, `MacrosCard`, `NutritionRingCard` (micros),
  the **biggest-gap → dishes-that-close-it** insight (`deficitFillFor`),
  `DiarySlotCard`, `WeeklyTrendCard`, `HydrationCard`.
- **Single source of truth** (every surface reads it): `useNutritionDiary(date)`
  → `dayNutrition` (`.calories`, `.totalCarbs_g`, `.totalFat_g`, `.protein_g`) +
  `cookedDayNutrition`; `usePersonalTargets()` → `{kcal, carbs_g, fat_g, protein_g}`;
  `deficitFillFor(cookedDayNutrition)` → `{deficit:{label}, suggestions:[{slug,name,closesPct}]}`.
- **Cravings** already live on Today (the search + the QuestCard deck).
- **Content** is the third tab (route id `community`, label `Content`).

## The shape we're building

A single, compact, glanceable **Today Nutrition Glance** under the craving
search that integrates the metrics, plus a quiet **Content** entry — without
breaking the meal-first hierarchy (rule 1), no-scroll (rule 10), or
simplicity/disclosure-on-demand (rules 6 + 13):

```
[ Sous · 🔥streak                      ⚙ ]   header (unchanged)
[ 🔎  what are you craving?              ]   cravings (existing)
┌─────────────────────────────────────────┐
│  1,240 / 2,000 kcal      760 left        │   ← NEW glance: food + nutrient
│  ▮▮▮▮▮▯▯  C 40%  F 55%  P 90%            │      stats, tappable → /nutrition
│  Biggest gap: Fiber →  [Lentil soup +40%]│      gap → craving (the tie-in)
└─────────────────────────────────────────┘
[ QuestCard deck — the meal IS the screen ]   cravings (existing, stays hero)
[ Read: <Content teaser>                → ]   ← NEW quiet content entry
[ Tonight / Who's at table ] (conditional)
[ More options · Friends ] (below fold)
```

Everything heavy (the week strip, full rings, diary slots, logging, hydration,
trends) stays on `/nutrition`; the glance is the _doorway_, not a copy.

---

## The 10 recursive steps

Each step builds on the last and then _re-reviews the whole screen_ (the
"recursive" part): after adding a piece, step back, re-apply rules 1/6/10/13, and
cut anything that stopped earning its pixels. Every step ends green
(`pnpm test && pnpm build`) and is verified in the preview.

1. **Data spine.** A pure `today-stats.ts` selector + `useTodayStats()` hook that
   read the _same_ stores (`useNutritionDiary`, `usePersonalTargets`,
   `deficitFillFor`) and expose exactly what the glance needs:
   `{ logged, kcal:{consumed,target,left,pct}, macros:[{key,grams,target,pct}], gap }`.
   Unit-tested, deterministic. _Re-review:_ nothing new on screen yet — confirm the
   numbers match the Nutrition page exactly.

2. **Glance card v1 — calories.** `today-nutrition-glance.tsx`: one compact card,
   calories consumed/target + "left", a single combined progress bar. Mount under
   the craving search. _Re-review:_ does it read in <2s? Is it visually quieter
   than the QuestCard hero (which must stay dominant, rule 2)?

3. **Macros.** Add the C/F/P mini-bars (reuse the MacrosCard grammar, compact
   single row). _Re-review:_ three bars + a number — still a glance, not a table?
   Trim labels per rule 13 (icon/letter + bar, no prose).

4. **Nutrient gap → craving (the integration).** Surface `gap.label` + 1–2
   dish chips from `deficitFillFor` linking straight to `/cook/<slug>`. This is the
   load-bearing tie: nutrient stats _become_ a craving. _Re-review:_ one gap, ≤2
   chips — resist showing the whole deficit list.

5. **Empty / first-run state.** When nothing's logged, the glance becomes a warm
   one-liner that points at the _existing_ primary (the craving search / "cook
   something"), never a rival CTA (rule 2). _Re-review:_ the empty state must feel
   like an invitation, not a scold.

6. **Content doorway.** A quiet, compact Content entry on Today (a single labeled
   card/row → the Content magazine), surfacing "the content that was there
   before." _Re-review:_ button-with-a-label, not a paragraph (rule 13).

7. **Recursive simplification #1.** Step fully back. Collapse the glance to its
   most minimal glanceable form; push any second-order detail behind the tap to
   `/nutrition`. Kill redundancy (if the gap chip duplicates a deck card, dedupe).
   Target: the whole metrics story told in ≤3 lines.

8. **No-scroll + hierarchy (rule 10).** On 375×667 (iPhone SE), confirm the
   craving search + the QuestCard primary action + the bottom nav are reachable
   without burying them. Tune order/spacing so meal-first holds with the glance
   present (glance is a thin strip, not a wall).

9. **Motion + reduced-motion + tokens.** Entrance (blur-in to match the hero),
   press feedback, `useReducedMotion()` gating on every animation, shared
   spacing/shadow/radius tokens. Consistency pass with the rest of Today.

10. **Recursive verification + the Sous Test.** Tests (data spine + glance render
    - empty state), `pnpm build`, screenshot proof at 375 + 390 widths, and the
      final gate: _"if this glance is the only thing the user sees, does it make
      them cook?"_ If any element fails it, cut it. Commit.

---

## Guardrails (carried through every step)

- **Rule 1 (Sous Test) + Rule 2 (one primary):** the QuestCard stays the hero;
  the glance is subordinate (quieter weight, smaller type, no rival CTA).
- **Rule 6 + 13 (simplicity / disclosure-on-demand):** the glance shows the
  fewest numbers that matter; everything else is one tap to `/nutrition`.
- **Rule 10 (no-scroll):** the glance is a compact strip; it must not push the
  primary action below the fold.
- **No new stores, no new math:** the glance reads the exact aggregate +
  personal-targets the Nutrition page reads — one source of truth, always in sync.
- **Rule 7 (no invented nutrition):** every number is computed from real logged
  entries; the gap suggestions are real catalogue dishes.
