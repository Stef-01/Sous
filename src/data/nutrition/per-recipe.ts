/**
 * Per-recipe nutrition seed.
 *
 * Stage 2 W12 sliver from the W3 "Per-recipe nutrition population
 * (wave 1)" deliverable. The full USDA-FDC ingest pipeline lands at
 * Week 3 of the actual timeline; this file is a starter set so the
 * NutrientSpotlight engine has REAL recipes to render against from W12
 * onward instead of being a no-op until W3.
 *
 * Each entry is per-serving and approximated from cooking-school
 * databases + USDA FoodData Central reference values for the canonical
 * recipe. Provenance is "manual-estimate" so the methodology tooltip
 * displays the right disclaimer; confidence is "approximated".
 *
 * When the W3 USDA pipeline runs, it overwrites these entries in
 * place (same recipeSlug keys) and bumps confidence to "mapped".
 */

import type { PerServingNutrition } from "@/types/nutrition";

const SEEDED_AT = "2026-05-04T00:00:00.000Z";

function seed(
  slug: string,
  data: Omit<
    PerServingNutrition,
    | "recipeSlug"
    | "ingestedAt"
    | "provenance"
    | "confidence"
    | "servingsPerRecipe"
  > & { servingsPerRecipe?: number },
): PerServingNutrition {
  const { servingsPerRecipe, ...rest } = data;
  // Spread `rest` so any provided field — including the optional macros
  // (protein_g / totalCarbs_g / totalFat_g) and expanded-panel micros —
  // passes through, not just the core required set.
  return {
    recipeSlug: slug,
    // Must equal the dish's ingredient-link serving base (DISH_SERVINGS /
    // meal-ingredients), else the slider/diary and these per-serving macros are
    // keyed to different yields. recipe-links.test.ts enforces link == seed for
    // every dish that has both; the 4 default is only safe for a yield-4 dish.
    servingsPerRecipe: servingsPerRecipe ?? 4,
    provenance: "manual-estimate",
    confidence: "approximated",
    ingestedAt: SEEDED_AT,
    ...rest,
  };
}

const ENTRIES: PerServingNutrition[] = [
  // Salmon: high in omega-3, vitamin D, vitamin B12, protein.
  // Yield 2 (one fillet/serving) per the meal-ingredients source; 380 kcal is a
  // full-fillet portion, so the macros are already per-serving — no rescale.
  seed("grilled-salmon", {
    servingsPerRecipe: 2,
    calories: 380,
    protein_g: 34,
    totalCarbs_g: 2,
    totalFat_g: 26,
    calcium_mg: 30,
    iron_mg: 1.2,
    vitaminD_mcg: 14,
    vitaminA_mcg_rae: 60,
    fiber_g: 0,
    potassium_mg: 720,
    omega3_g: 2.3,
    zinc_mg: 0.7,
    magnesium_mg: 38,
    vitaminB12_mcg: 4.8,
    choline_mg: 110,
    sodium_mg: 360,
    addedSugar_g: 0,
    saturatedFat_g: 4.5,
  }),

  // Masoor dal: high in fiber, iron, folate-adjacent.
  seed("masoor-dal", {
    calories: 245,
    protein_g: 16,
    totalCarbs_g: 38,
    totalFat_g: 3,
    calcium_mg: 70,
    iron_mg: 4.5,
    vitaminD_mcg: 0,
    vitaminA_mcg_rae: 22,
    fiber_g: 9,
    potassium_mg: 730,
    omega3_g: 0.3,
    zinc_mg: 1.8,
    magnesium_mg: 70,
    vitaminB12_mcg: 0,
    choline_mg: 50,
    sodium_mg: 410,
    addedSugar_g: 0,
    saturatedFat_g: 1.5,
  }),

  // Butter chicken: calcium from cream/yogurt, B12 + zinc from chicken.
  seed("butter-chicken", {
    calories: 520,
    protein_g: 32,
    totalCarbs_g: 18,
    totalFat_g: 36,
    calcium_mg: 160,
    iron_mg: 2.2,
    vitaminD_mcg: 1.5,
    vitaminA_mcg_rae: 220,
    fiber_g: 3,
    potassium_mg: 580,
    omega3_g: 0.2,
    zinc_mg: 2.5,
    magnesium_mg: 45,
    vitaminB12_mcg: 0.6,
    choline_mg: 120,
    sodium_mg: 760,
    addedSugar_g: 4,
    saturatedFat_g: 12,
  }),

  // Pasta carbonara: protein + B12 from egg + cured pork; not a
  // micronutrient star but realistic.
  // Yield 2 (100 g dry pasta/serving) per the meal-ingredients source; 620 kcal
  // is a full plate, so the macros are already per-serving — no rescale.
  seed("pasta-carbonara", {
    servingsPerRecipe: 2,
    calories: 620,
    protein_g: 25,
    totalCarbs_g: 66,
    totalFat_g: 28,
    calcium_mg: 180,
    iron_mg: 3.0,
    vitaminD_mcg: 1.2,
    vitaminA_mcg_rae: 130,
    fiber_g: 3,
    potassium_mg: 320,
    omega3_g: 0.1,
    zinc_mg: 2.8,
    magnesium_mg: 50,
    vitaminB12_mcg: 1.4,
    choline_mg: 220,
    sodium_mg: 920,
    addedSugar_g: 1,
    saturatedFat_g: 11,
  }),

  // Chicken tikka masala: similar to butter chicken but slightly
  // higher iron from spices and tomato.
  seed("chicken-tikka-masala", {
    calories: 480,
    protein_g: 32,
    totalCarbs_g: 16,
    totalFat_g: 32,
    calcium_mg: 130,
    iron_mg: 2.8,
    vitaminD_mcg: 1.0,
    vitaminA_mcg_rae: 200,
    fiber_g: 4,
    potassium_mg: 620,
    omega3_g: 0.2,
    zinc_mg: 2.2,
    magnesium_mg: 50,
    vitaminB12_mcg: 0.6,
    choline_mg: 110,
    sodium_mg: 720,
    addedSugar_g: 5,
    saturatedFat_g: 9,
  }),

  // Mattar paneer: calcium from paneer, iron + fiber from peas.
  // Yield 3 (~67 g paneer/serving) per the meal-ingredients source; 360 kcal is
  // a full portion, so the macros are already per-serving — no rescale.
  seed("mattar-paneer", {
    servingsPerRecipe: 3,
    calories: 360,
    protein_g: 16,
    totalCarbs_g: 24,
    totalFat_g: 22,
    calcium_mg: 280,
    iron_mg: 3.2,
    vitaminD_mcg: 0.5,
    vitaminA_mcg_rae: 150,
    fiber_g: 6,
    potassium_mg: 540,
    omega3_g: 0.1,
    zinc_mg: 2.0,
    magnesium_mg: 60,
    vitaminB12_mcg: 0.5,
    choline_mg: 70,
    sodium_mg: 620,
    addedSugar_g: 3,
    saturatedFat_g: 8,
  }),

  // Bibimbap: vegetable + egg + rice; fiber, vitamin A from
  // sautéed greens, iron from beef + spinach.
  // Yield 2 (one bowl/serving) per the meal-ingredients source; 540 kcal is a
  // full bowl, so the macros are already per-serving — no rescale.
  seed("bibimbap", {
    servingsPerRecipe: 2,
    calories: 540,
    protein_g: 24,
    totalCarbs_g: 70,
    totalFat_g: 18,
    calcium_mg: 110,
    iron_mg: 4.0,
    vitaminD_mcg: 1.0,
    vitaminA_mcg_rae: 480,
    fiber_g: 7,
    potassium_mg: 720,
    omega3_g: 0.2,
    zinc_mg: 3.2,
    magnesium_mg: 80,
    vitaminB12_mcg: 1.2,
    choline_mg: 180,
    sodium_mg: 880,
    addedSugar_g: 2,
    saturatedFat_g: 5,
  }),

  // Falafel wrap: fiber from chickpeas + greens, magnesium + iron.
  // Yield 2 (one wrap/serving) per the meal-ingredients source; 420 kcal is a
  // full wrap, so the macros are already per-serving — no rescale.
  seed("falafel-wrap", {
    servingsPerRecipe: 2,
    calories: 420,
    protein_g: 14,
    totalCarbs_g: 50,
    totalFat_g: 18,
    calcium_mg: 130,
    iron_mg: 4.2,
    vitaminD_mcg: 0,
    vitaminA_mcg_rae: 90,
    fiber_g: 9,
    potassium_mg: 520,
    omega3_g: 0.2,
    zinc_mg: 2.5,
    magnesium_mg: 95,
    vitaminB12_mcg: 0,
    choline_mg: 60,
    sodium_mg: 740,
    addedSugar_g: 1,
    saturatedFat_g: 3,
  }),

  // ── Stefan-curated recipes (Simply Scratch; per the export nutrition) ──
  // Honey glazed salmon w/ mango salsa — 251 kcal/serving, 4 servings.
  seed("honey-glazed-salmon-mango-salsa", {
    servingsPerRecipe: 4,
    calories: 251,
    protein_g: 24,
    totalCarbs_g: 19,
    totalFat_g: 9,
    saturatedFat_g: 1,
    monoFat_g: 4,
    polyFat_g: 3,
    cholesterol_mg: 62,
    sodium_mg: 303,
    potassium_mg: 686,
    fiber_g: 1,
    totalSugars_g: 16,
    addedSugar_g: 4,
    vitaminC_mg: 22,
    vitaminA_mcg_rae: 203,
    calcium_mg: 27,
    iron_mg: 1,
    vitaminD_mcg: 11,
    omega3_g: 1.5,
    zinc_mg: 0.6,
    magnesium_mg: 32,
    vitaminB12_mcg: 3.2,
    choline_mg: 95,
  }),
  // Cheesy beef enchiladas verde — 598 kcal/serving (2 enchiladas), 4 servings.
  seed("cheesy-beef-enchiladas-verde", {
    servingsPerRecipe: 4,
    calories: 598,
    protein_g: 40,
    totalCarbs_g: 14,
    totalFat_g: 42,
    saturatedFat_g: 22,
    monoFat_g: 14,
    polyFat_g: 2,
    transFat_g: 1,
    cholesterol_mg: 156,
    sodium_mg: 1217,
    potassium_mg: 671,
    fiber_g: 2,
    totalSugars_g: 5,
    addedSugar_g: 0,
    vitaminC_mg: 9,
    vitaminA_mcg_rae: 395,
    calcium_mg: 491,
    iron_mg: 4,
    vitaminD_mcg: 0.3,
    omega3_g: 0.1,
    zinc_mg: 6,
    magnesium_mg: 40,
    vitaminB12_mcg: 2.5,
    choline_mg: 120,
  }),
  // Air fryer edamame — 155 kcal/serving, 5 servings.
  seed("air-fryer-edamame", {
    servingsPerRecipe: 5,
    calories: 155,
    protein_g: 13,
    totalCarbs_g: 12,
    totalFat_g: 8,
    saturatedFat_g: 1,
    monoFat_g: 2,
    polyFat_g: 3,
    cholesterol_mg: 0,
    sodium_mg: 195,
    potassium_mg: 505,
    fiber_g: 6,
    totalSugars_g: 2,
    addedSugar_g: 0,
    vitaminC_mg: 7,
    vitaminA_mcg_rae: 0,
    calcium_mg: 72,
    iron_mg: 3,
    vitaminD_mcg: 0,
    omega3_g: 0.3,
    zinc_mg: 1.5,
    magnesium_mg: 70,
    vitaminB12_mcg: 0,
    choline_mg: 80,
  }),
  // ── Viral recipes (founder-provided 2026-06-18; re-authored social methods) ──
  // Caramelized sweet potatoes — a beta-carotene (vitamin A) star; fat from the
  // rub oil. 4 servings (2 large potatoes ÷ 4).
  seed("viral-caramelized-sweet-potatoes", {
    servingsPerRecipe: 4,
    calories: 190,
    protein_g: 2.5,
    totalCarbs_g: 31,
    totalFat_g: 7,
    saturatedFat_g: 1,
    monoFat_g: 5,
    polyFat_g: 1,
    cholesterol_mg: 0,
    sodium_mg: 300,
    potassium_mg: 340,
    fiber_g: 4.5,
    totalSugars_g: 7,
    addedSugar_g: 0,
    vitaminC_mg: 20,
    vitaminA_mcg_rae: 710,
    calcium_mg: 30,
    iron_mg: 0.7,
    vitaminD_mcg: 0,
    omega3_g: 0,
    zinc_mg: 0.3,
    magnesium_mg: 27,
    vitaminB12_mcg: 0,
    choline_mg: 13,
  }),
  // Hot honey beef taco bowl — single-serving, high-protein; honey is the added
  // sugar, sweet potato + avocado drive fiber/potassium/vitamin A.
  seed("viral-hot-honey-beef-taco-bowls", {
    servingsPerRecipe: 1,
    calories: 645,
    protein_g: 48,
    totalCarbs_g: 62,
    totalFat_g: 23,
    saturatedFat_g: 7,
    monoFat_g: 11,
    polyFat_g: 3,
    cholesterol_mg: 100,
    sodium_mg: 650,
    potassium_mg: 1500,
    fiber_g: 10,
    totalSugars_g: 28,
    addedSugar_g: 17,
    vitaminC_mg: 25,
    vitaminA_mcg_rae: 950,
    calcium_mg: 120,
    iron_mg: 4.5,
    vitaminD_mcg: 0.1,
    omega3_g: 0.1,
    zinc_mg: 8,
    magnesium_mg: 110,
    vitaminB12_mcg: 2.6,
    choline_mg: 130,
  }),
  // Matcha pistachio chia pudding — 2 servings; chia + pistachios bring fiber,
  // omega-3 (ALA) and magnesium; yogurt + milk the calcium; maple the added sugar.
  seed("scoopable-matcha-pistachio-chia-pudding", {
    servingsPerRecipe: 2,
    calories: 460,
    protein_g: 21,
    totalCarbs_g: 49,
    totalFat_g: 26,
    saturatedFat_g: 4,
    monoFat_g: 9,
    polyFat_g: 11,
    cholesterol_mg: 8,
    sodium_mg: 165,
    potassium_mg: 520,
    fiber_g: 13,
    totalSugars_g: 28,
    addedSugar_g: 18,
    vitaminC_mg: 2,
    vitaminA_mcg_rae: 30,
    calcium_mg: 320,
    iron_mg: 2.5,
    vitaminD_mcg: 1,
    omega3_g: 4,
    zinc_mg: 2,
    magnesium_mg: 110,
    vitaminB12_mcg: 0.6,
    choline_mg: 40,
  }),
  // Turmeric Crush smoothie (Erewhon dupe) — 1 serving. Fruit-forward, a vit-C
  // + vit-A (carrot/mango) and fiber star; protein from the optional shake.
  seed("turmeric-crush-smoothie", {
    servingsPerRecipe: 1,
    calories: 330,
    protein_g: 23,
    totalCarbs_g: 53,
    totalFat_g: 5,
    saturatedFat_g: 1,
    monoFat_g: 1,
    polyFat_g: 1,
    transFat_g: 0,
    cholesterol_mg: 0,
    sodium_mg: 270,
    potassium_mg: 820,
    fiber_g: 9,
    totalSugars_g: 31,
    addedSugar_g: 0,
    vitaminC_mg: 103,
    vitaminA_mcg_rae: 664,
    calcium_mg: 120,
    iron_mg: 4,
    vitaminD_mcg: 0,
    omega3_g: 0.1,
    zinc_mg: 1.2,
    magnesium_mg: 60,
    vitaminB12_mcg: 0,
    choline_mg: 30,
  }),
  // Coconut Cloud smoothie (Erewhon dupe) — 1 serving. Rich and creamy:
  // coconut cream + avocado + almond butter drive the fat, shake the protein.
  seed("coconut-cloud-smoothie", {
    servingsPerRecipe: 1,
    calories: 640,
    protein_g: 30,
    totalCarbs_g: 43,
    totalFat_g: 43,
    saturatedFat_g: 21,
    monoFat_g: 12,
    polyFat_g: 3,
    transFat_g: 0,
    cholesterol_mg: 0,
    sodium_mg: 300,
    potassium_mg: 775,
    fiber_g: 10,
    totalSugars_g: 17,
    addedSugar_g: 0,
    vitaminC_mg: 79,
    vitaminA_mcg_rae: 10,
    calcium_mg: 480,
    iron_mg: 5,
    vitaminD_mcg: 2,
    omega3_g: 0.1,
    zinc_mg: 1.5,
    magnesium_mg: 110,
    vitaminB12_mcg: 0,
    choline_mg: 40,
  }),
];

const BY_SLUG: Map<string, PerServingNutrition> = new Map(
  ENTRIES.map((e) => [e.recipeSlug, e]),
);

/**
 * Returns per-serving nutrition for a recipe slug, or null when the
 * recipe is not yet covered. The NutrientSpotlight UI returns null in
 * that case — quiet by default.
 */
export function getPerServingNutrition(
  recipeSlug: string,
): PerServingNutrition | null {
  return BY_SLUG.get(recipeSlug) ?? null;
}

/** Number of recipes currently covered. Used by the W18 perf dashboard. */
export function nutritionCoverageCount(): number {
  return ENTRIES.length;
}

/** All seeded per-serving entries (read-only) — for tests / data audits. */
export function allSeededNutrition(): readonly PerServingNutrition[] {
  return ENTRIES;
}
