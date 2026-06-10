# Mockup Polish Plan — grocery list + meal plan to ad-grade

**Source:** 4 AI-generated advertisement mockups supplied 2026-06-10 (Crouton-style
grocery list, "My Meal Plan" week view, and two app-store-ad frames: "healthy meal
plan" and "automated grocery lists"). This doc records the critical appraisal, what
shipped, and the remaining road to that polish bar.

## Appraisal — what the mockups get right (and wrong)

Ad mockups sell an _information grammar_, not a spec. Copy the grammar; reject the
parts that are ad-gloss or violate Sous rules.

**Worth copying (now copied):**

- Grocery row grammar: checkbox left · name left · **bold quantity right-aligned** ·
  food image/emoji far right · dashed separators. Scan-speed comes from the
  two-column alignment, not decoration.
- Category-grouped list with light section headers ("Fruit & Veg") — Sous already
  grouped by aisle; kept.
- Meal-plan day sections with "No recipes yet" empties, per-day [+], Today
  highlight, week pager — Sous already had all of it (task #55).
- Per-meal "Breakfast · 550 kCal" line — engine-true in Sous, coverage-gated.
- [+] → slot popover (Breakfast/Lunch/Dinner with time-of-day icons) instead of a
  context-losing page hop.

**Rejected, with reasons:**

- **The mockups' own data bugs** (instructive): mockup 1 lists _granulated sugar
  2 tbsp_ AND _sugar ⅓ cup_ as separate rows — the "automated" list doesn't
  aggregate across a single recipe; _eggs 2_ (unitless) and _vegetable oil — for
  frying_ (unquantifiable) sit unresolved. The ad fails its own pitch. Sous's
  registry (densities, gramsPerPiece) can genuinely merge these — see roadmap.
- Two equally-weighted CTAs ("Get Ingredients" + "Add to List") — violates rule 2
  (one primary action). Sous keeps the quiet Instacart hint.
- 5-tab nav, FAB _plus_ per-day [+] (duplicate affordance), scissors mystery-icon,
  social reaction emojis on plan rows, "@AmericaAguilar" creator handles — ad
  texture, rejected under rules 6/13. (Sous has real creator bylines where earned.)
- **Snack slot**: the mockup popover has 4 slots. The Sous week model is
  deliberately 3×7 (validated SlotKey union); snacks belong to the Nutrition
  diary's quick-log, not the plan. Adding it = schema migration + rule discussion.
  Deferred as a founder decision.

## Shipped (commit f22bb82, verified live)

1. **Grocery rows** rewritten to the reference grammar (all states incl. bought
   strikethrough + filled check), dashed dividers on both lists.
2. **Plan rows**: `Breakfast · 260 kcal` via `getDishNutrition`, gated at
   `NUTRITION_COVERAGE_FLOOR` — no number is shown over a made-up one.
3. **Slot popover** on the week view ([+] and empty rows), green planned-dot per
   filled slot, routes `/path/plan?slot=thu-dinner`; the swipe planner honours the
   slot for the first Schedule then falls back to next-empty.
   Live proof: `thu-dinner:garlic-oil-spaghetti` landed on the pointed slot.

## Roadmap to full ad-grade (sequenced; rule-12 classified)

| #   | Deliverable                                                                             | Class            | Notes                                                                                     |
| --- | --------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| 1   | **Cross-recipe quantity aggregation** in shopping list (2 cups + ⅓ cup flour → one row) | AUTO-BUILD       | Registry units + `parseAmount` exist; beats the mockup's own failure. Highest-value next. |
| 2   | Day kcal subtotal in week view (sum of planned meals, gated)                            | AUTO-BUILD       | One line under each day header; only when ≥1 meal has a vector.                           |
| 3   | Move/swap a planned meal between slots (long-press → same popover)                      | AUTO-BUILD       | Reuses MEAL_PICKER; store already keyed by slot.                                          |
| 4   | Real product photography on grocery rows                                                | FOUNDER-GATED    | Rule 11: images come from the separate AI pipeline; emoji is the honest fallback.         |
| 5   | Instacart / Amazon Fresh deep-links ("Get Ingredients")                                 | FOUNDER-GATED    | Affiliate accounts + URL contracts; keep hint UI until then (rule 2: stays subordinate).  |
| 6   | Snack slot (4th meal)                                                                   | FOUNDER DECISION | Schema migration + product call; diary quick-log covers the need today.                   |
| 7   | Plan-row reactions / pod visibility                                                     | FOUNDER DECISION | Social layer is demo-grade until Clerk; revisit with Community V2.                        |

Per the founder's 2026-06-10 call, micro loose-ends (combined-cook per-dish
servings, dormant `/today/search`, `LeftoverChip`, sync realtime/LWW refinements)
are explicitly **not** being optimised further.
