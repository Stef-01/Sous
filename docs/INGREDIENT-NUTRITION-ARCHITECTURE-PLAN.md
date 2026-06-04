# Ingredient-Level Nutrition Architecture — Overhaul Plan

> **Status:** Proposed · 2026-06-04
> **Author:** Sous core
> **Supersedes the data-flow of:** the per-recipe-only nutrition model in
> `docs/adr/0001-nutrition-data-source.md` (the USDA _source_ decision still
> holds; what changes is the _grain_ — per-ingredient, not per-recipe).
> **Unblocks:** the swipe-up health panel (`docs/SWIPE-UP-HEALTH-PANEL-PLAN.md`),
> whose literal substring matching is the visible symptom this plan cures.
> **One founder decision required up front** — see §10. Everything else is
> AUTO-BUILD.

---

## 1. The problem, precisely

Today, ingredients exist only as **prose and loose name strings**:

- `meals.json` (76) / `sides.json` (205): a free-text `description`, no ingredient list, no nutrients.
- `guided-cook-steps.ts` (**127 dishes**): the one bright spot — real structured lines
  `StaticIngredient { id, name, quantity: string, isOptional, substitution }`
  (e.g. Caesar Salad → Romaine, Parmesan, Garlic, Lemon, Olive oil, Dijon, Anchovy, Bread).
- `src/types/nutrition.ts`: a **per-recipe** `PerServingNutrition` (11 nutrients
  - sodium/added-sugar/sat-fat + provenance/confidence) — but it is **top-down
    and hand-authored**: someone must compute and enter a full nutrient panel for
    every one of 281 dishes, and re-enter it whenever a recipe changes.
- `therapeutic-fit.ts`: matches interventions by **literal substring** over
  `name + tags + flavorProfile`. This is why **"Masoor Dal" misses the `legumes`
  evidence** while "Grilled Salmon" matches `salmon` — the engine reasons over
  spelling, not food identity.

Two structural faults follow:

1. **No single source of truth for what a food _is_.** "Red lentils" is a string
   in one place, absent in another, and unconnected to "legume / high-fiber /
   plant-protein" anywhere.
2. **Nutrition is authored at the wrong grain.** Per-recipe panels don't compose,
   don't reuse, and rot on every edit. 281 hand-mapped panels is ~80 hrs of work
   that must be _redone_ as the catalog grows.

## 2. Target architecture — three layers, derive don't author

The scalable shape is **bottom-up composition**: encode each _ingredient_ once;
_derive_ every recipe's nutrition and every health signal from it.

```
┌────────────────────────────────────────────────────────────────┐
│ LAYER 1 — Canonical Ingredient Registry  (the new foundation)   │
│ src/data/ingredients/*.ts  +  src/types/ingredient.ts           │
│                                                                  │
│ Ingredient {                                                     │
│   id: "red-lentils"                  // stable slug              │
│   name, aliases[]                    // "masoor dal", "masoor"   │
│   fdcId: 172420                      // USDA FoodData Central ref │
│   foodGroup: "legumes"              // controlled taxonomy       │
│   per100g: NutrientVector            // full panel, USDA-sourced │
│   densityGPerCup, gramsPerPiece?     // volume/count → mass      │
│   therapeuticClasses: ["soluble-fiber","plant-protein"]         │
│   provenance: "usda-foundation" | "usda-sr-legacy" | "estimate" │
│ }                                                                │
└───────────────┬──────────────────────────────────────────────--┘
                │ referenced by id
┌───────────────▼────────────────────────────────────────────────┐
│ LAYER 2 — Recipe = resolved ingredient lines                    │
│ extend StaticIngredient with the resolution result:             │
│   ingredientId: "red-lentils"        // FK into Layer 1          │
│   grams: 200                         // normalized from quantity │
│   (raw name + quantity string stay for display + audit)         │
└───────────────┬────────────────────────────────────────────────┘
                │ Σ over lines, deterministic
┌───────────────▼────────────────────────────────────────────────┐
│ LAYER 3 — Derived outputs (pure functions, no hand-authoring)   │
│  composeRecipeNutrition(recipe) → PerServingNutrition  ← reuses  │
│      the EXISTING claim-thresholds / dri-pediatric / fda-dv code │
│  resolveIngredientClasses(recipe) → Set<TherapeuticClass>       │
│      ← the therapeutics bridge that replaces substring matching  │
└────────────────────────────────────────────────────────────────┘
```

**Why this is the most scalable option on the table:**

- **Add-once semantics.** Encode "olive oil" one time → every current and future
  recipe that uses it gets correct fat/vitamin-E/polyphenol signals for free.
- **Derivation, not authoring.** `PerServingNutrition` stops being an input you
  maintain for 281 dishes and becomes an _output_ you compute. A recipe edit
  re-derives automatically; nothing to keep in sync.
- **One identity per food.** `red-lentils` carries its USDA id, food group, and
  therapeutic classes in one place — display, nutrition, and evidence all read
  the same entity, so they can never disagree (the same discipline that made the
  health-panel scorer and matcher share one predicate).
- **Bounded surface.** Sous cooks from raw ingredients; the long tail is small.
  The 281 dishes resolve to an estimated **~250–400 distinct canonical
  ingredients** — a registry a single ingest fills and rarely grows.

## 3. Data-source options (researched 2026-06-04)

Goal: a **whole-ingredient, per-100g, full-nutrient-panel** source with a license
compatible with a free public-good app. Branded/barcode coverage is _not_ the
need (we cook from scratch).

| Source                                                                    | What it is                                                                          | Granularity                               | License                                          | Size / format                                | Fit                                                                                                  |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **USDA Foundation Foods**                                                 | Gov gold-standard composition for whole foods, with sampling provenance             | per-100g full panel, raw ingredients      | **Public domain**                                | **~6.5 MB JSON** (semi-annual, Apr/Oct 2026) | ★★★ **Primary** — exactly raw cooking ingredients, claim-grade provenance, tiny                      |
| **USDA SR Legacy**                                                        | Prior Standard Reference, ~7,800 foods (frozen 2018)                                | per-100g, broadest common-food coverage   | **Public domain**                                | ~205 MB JSON unzipped, one-time              | ★★ **Breadth fallback** — fills anything Foundation lacks                                            |
| **USDA FNDDS**                                                            | Survey "as-eaten" foods incl. prepared mixtures                                     | per-100g, composite dishes                | **Public domain**                                | ~64 MB JSON                                  | ◐ optional — handy for composite items (e.g. "naan")                                                 |
| **Open Food Facts**                                                       | Crowdsourced **branded** products (barcodes)                                        | per-100g, product-level, variable quality | **ODbL** (share-alike + attribution obligations) | multi-GB, nightly (JSONL/Parquet/DuckDB)     | ◐ secondary — only when branded items enter scope; license adds duties                               |
| Curated repos (Nutrola, `EduardoAC/food-ingredients-database`, GroceryDB) | Convenience subsets/wrappers over USDA/OFF                                          | varies                                    | varies — must audit each                         | small                                        | ✗ shortcut, but inherits upstream + adds a dependency & its license; prefer ingesting USDA ourselves |
| **`strangetom/ingredient-parser`**                                        | NLP parser: line → {qty, unit, name, prep}; emits a `foundation_foods` mapping hint | tooling, not data                         | **MIT** (Python)                                 | —                                            | ★ **best parser** _if_ we must parse free text; run offline as a build step                          |

**Recommendation: USDA Foundation Foods as primary + SR Legacy as the breadth
fallback, self-hosted as a curated subset** (only the ~250–400 ingredients Sous
actually uses, not the whole DB). Rationale:

1. **Aligns with ADR-0001 and the immovable free/public-good posture** — public
   domain, no API key, no rate limit, no vendor lock, no recurring cost, FDA-grade
   provenance for claim substantiation.
2. **Whole-ingredient grain is the exact need.** Foundation/SR Legacy describe
   "lentils, raw" and "oil, olive", not "Brand X frozen lasagna" — the right
   atoms for a from-scratch cooking app.
3. **Tiny + offline.** A curated Foundation subset is single-digit MB; we vendor
   a frozen snapshot into the repo, so there is no runtime dependency and the
   build is hermetic.
4. **Open Food Facts is deferred, not rejected** — it's the right _secondary_ if
   we ever ingest branded items, but its ODbL share-alike obligations and
   product-level noise make it the wrong _primary_ for raw ingredients.

> Most of the "integration" is therefore **AUTO-BUILD** (download public-domain
> JSON, run an ingest script). The single founder decision is just confirming
> this pick vs. an alternative — §10.

## 4. Ingredient resolution pipeline

We already have structured lines for 127 dishes, so heavy NLP is the exception,
not the rule.

1. **Normalize the quantity string** (`"2 tbsp"`, `"1 cup, chopped"`, `"3 cloves"`)
   → `{ amount, unit }`. Small deterministic tokenizer; covers the closed set of
   units our data uses. Free-text-only edge cases fall back to the offline
   `ingredient-parser` (MIT) run as a build script — never at runtime.
2. **Resolve the name** → canonical `ingredientId` via the registry's
   `aliases[]` (exact + normalized match; "Masoor Dal" → `red-lentils`). A build
   step reports any unresolved name so the registry is filled deliberately, never
   silently guessed.
3. **Convert to grams** using `densityGPerCup` / `gramsPerPiece` on the
   ingredient (volume & count → mass), so nutrient math is always mass-based.
4. **Vendor the result.** Resolution runs at build time and is committed as data
   (`src/data/ingredients/recipe-ingredient-links.ts`), drift-guarded like
   `guided-cook-summary` — no resolution at runtime, fully deterministic.

## 5. Derived outputs (Layer 3)

- **`composeRecipeNutrition(recipeId)`** — pure: Σ over lines of
  `per100g × grams / 100`, divided by `servingsPerRecipe`. Emits the **existing**
  `PerServingNutrition` shape, so `claim-thresholds.ts`, `dri-pediatric.ts`,
  `fda-dv.ts`, `safe-phrasings.ts` are **reused unchanged** — they just consume a
  derived value instead of a hand-authored one. `provenance` becomes
  `"usda-composed"`; `confidence` reflects the weakest line (any `estimate`
  ingredient ⇒ `approximated`).
- **`resolveIngredientClasses(recipeId)` → `Set<TherapeuticClass>`** — the bridge
  in §6.
- **Coverage guard.** `nutrition-coverage.test.ts` (already specced in ADR-0001)
  flips on: the build fails if a quest-eligible dish has an unresolved ingredient
  or a missing nutrient vector. Silent gaps become loud.

## 6. Therapeutics engine overhaul (the substring fix)

Interventions today carry `recipeSignals: string[]` matched by substring. We add a
**structured predicate** without breaking the existing scorer:

- Each intervention gains an optional, additive
  `appliesTo: { foodGroups?: FoodGroup[]; therapeuticClasses?: TherapeuticClass[];
nutrientThresholds?: {key, op, value}[] }`.
- `matchInterventionsForDish` / `scoreTherapeuticFit` resolve the dish's
  **ingredient set + composed nutrients** and test `appliesTo` against them — so
  "Masoor Dal" matches `legumes` because `red-lentils.foodGroup === "legumes"`,
  not because a string happened to contain "legumes".
- **Backward-compatible & safer.** `recipeSignals` substring matching stays as a
  fallback during migration; the shared-predicate discipline (one
  `matchedSignalsFor`) is preserved, so the scorer and the health panel still
  can't diverge. The claim-safety spine is untouched: education-only / non-benefit
  records remain unscorable, guarded by the existing test.
- **Provenance unchanged (rule 11).** Structured matching changes _recall_, not
  _claims_ — every surfaced row is still graded, food-first-hedged, and
  `Educational` until clinician review (gate G1).

## 7. Build sequence — AUTO-BUILD vs FOUNDER-GATED (rule 12)

Source pick (§10) is the only gate; once made, the rest is autonomous.

| Phase                              | Deliverable                                                                                                                                                                           | Class                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **0 — schema (source-agnostic)**   | `src/types/ingredient.ts` (`Ingredient`, `NutrientVector`, `FoodGroup`, `TherapeuticClass`), the food-group + therapeutic-class taxonomies, empty registry module + drift-guard test  | **AUTO-BUILD**                                                    |
| **1 — composition engine**         | `composeRecipeNutrition` + unit/density normalizer, pure + unit-tested against the existing `PerServingNutrition`/claim code (hand-seed 3–5 ingredients to prove the math end-to-end) | **AUTO-BUILD**                                                    |
| **2 — ingest pipeline**            | `scripts/nutrition/usda-ingest.ts`: read the curated USDA Foundation/SR-Legacy JSON → emit `src/data/ingredients/*.ts` for the names our recipes use; unresolved-name report          | **AUTO-BUILD** _(after §10 pick)_                                 |
| **3 — resolution + backfill**      | resolve the 127 structured dishes → `recipe-ingredient-links.ts`; coverage guard turns on for those; report the gap list for the prose-only dishes                                    | **AUTO-BUILD**                                                    |
| **4 — therapeutics bridge**        | add `appliesTo`, wire structured matching behind the existing predicate, expand the health panel's recall, regression-guard                                                           | **AUTO-BUILD**                                                    |
| **5 — prose-dish backfill**        | structure ingredients for the meals/sides that only have descriptions (uses the offline parser where needed)                                                                          | **AUTO-BUILD**, incremental                                       |
| FDC **live API** (optional, later) | only if user-authored custom recipes need on-the-fly lookups                                                                                                                          | **FOUNDER-GATED** (API key) — stub the adapter + env contract now |

## 8. Migration & backfill

- **No big-bang.** Layer 1 + the engine ship first with a small hand-seed; the
  ingest then fills the registry; resolution backfills recipes in waves
  (guided-cook 127 first — they're already structured — then prose-only dishes).
- **Old per-recipe panels, if any exist, are reconciled,** not deleted: a test
  asserts composed values land within ±15 % of any legacy hand value (the ADR's
  accepted approximation band), surfacing data errors on either side.
- **Reversible at every step** — committed to `main` in small slices, each
  green-gated; nothing here touches runtime behavior until the bridge in Phase 4,
  which is itself additive behind the existing matcher.

## 9. Risks & mitigations

| Risk                                               | Mitigation                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name → canonical mismatch (silent wrong nutrition) | resolution is **build-time + reported**, never runtime-guessed; unresolved names fail the coverage guard                                         |
| Volume→mass density error                          | densities sourced from USDA/標準 references and stored per-ingredient; mass-based math only; ±15 % band is claim-tier-safe                       |
| Registry sprawl                                    | bounded by what recipes use (~250–400 atoms); ingest is demand-driven, not "import all of USDA"                                                  |
| USDA Foundation gaps                               | SR Legacy fallback, then a clearly-flagged `estimate` provenance that downgrades `confidence` and shows the methodology note                     |
| Overclaim creep via richer matching                | matching changes recall only; grading, food-first hedge, and G1/G5 gates unchanged; claim-safety regression test extended to the structured path |
| Scope vs. the swipe-up panel                       | the panel already consumes `matchInterventionsForDish`; the bridge upgrades it in place — no UI rework                                           |

## 10. The one decision for Stefan

**Confirm the canonical nutrient source** (drives Phase 2; everything else is
already AUTO-BUILD and source-agnostic):

- **A — USDA Foundation Foods + SR Legacy fallback (recommended).** Public
  domain, whole-ingredient, tiny, ADR-0001-aligned, zero recurring cost.
- **B — USDA + Open Food Facts** for eventual branded coverage (adds ODbL
  obligations; defer unless branded items are in scope).
- **C — a curated GitHub subset** (Nutrola / `EduardoAC/food-ingredients-database`)
  for speed (inherits upstream license + adds a dependency to audit).

Sources: USDA FoodData Central download datasets; Open Food Facts data/license;
`strangetom/ingredient-parser`; curated nutrition repos — all linked in the
research notes accompanying this plan.

---

## 11. Build status (2026-06-04) + a real-data finding

Stefan picked **Option A (USDA Foundation + SR Legacy)**. Building it surfaced a
correction worth recording:

> **Finding — SR Legacy is the primary, not Foundation.** Foundation Foods is
> _analytically_ measured and therefore **incomplete**: "Lentils, dry" (fdcId 2644283) carries minerals but **no fiber** and energy only via Atwater
> (957/958), not `208`. SR Legacy "Lentils, raw" (172420) has the **complete**
> panel — 352 kcal, 10.7 g fiber, standard nutrient numbers. So the ingest uses
> **SR Legacy as the workhorse**, with Foundation available as a fresher
> per-nutrient override later. (Foundation alone would have shipped lentils
> showing 0 g fiber — exactly the kind of silent wrong-data the coverage guard
> exists to prevent.)

| Phase                                                                                       | Status         | Commit    |
| ------------------------------------------------------------------------------------------- | -------------- | --------- |
| 0 — `types/ingredient.ts` (schema, taxonomies)                                              | ✅ shipped     | `3f31ecd` |
| 1 — `composeRecipeNutrition` + `quantityToGrams` (+18 tests)                                | ✅ shipped     | `3f31ecd` |
| 2 — `scripts/nutrition/usda-ingest.mjs` + real 22-ingredient registry + resolver (+5 tests) | ✅ shipped     | `5445d99` |
| 3 — resolve the 127 guided-cook dishes → composed per-serving nutrition                     | ⏭ next        |           |
| 4 — therapeutics bridge (`appliesTo` food-class predicate replaces substring)               | ⏭ next        |           |
| 5 — grow the registry from 22 → full dish coverage (~250 ingredients)                       | ⏭ incremental |           |

**Proven now:** real USDA values (red-lentils 352 kcal / 10.7 g fiber, salmon
1.73 g omega-3, olive-oil 884 kcal) and the structural fix —
`resolveIngredientByName("Masoor Dal") → red-lentils → legume`. The registry is a
**22-ingredient starter**; the machinery (ingest → resolve → compose → match) is
complete and grows by adding spec rows, not by changing code.

**Data hygiene:** the multi-hundred-MB USDA source is downloaded at ingest time
and never committed — only the small generated registry is vendored. Re-run the
ingest per the script header to refresh.
