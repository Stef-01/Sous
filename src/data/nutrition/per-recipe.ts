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
  return {
    recipeSlug: slug,
    servingsPerRecipe: data.servingsPerRecipe ?? 4,
    calories: data.calories,
    calcium_mg: data.calcium_mg,
    iron_mg: data.iron_mg,
    vitaminD_mcg: data.vitaminD_mcg,
    vitaminA_mcg_rae: data.vitaminA_mcg_rae,
    fiber_g: data.fiber_g,
    potassium_mg: data.potassium_mg,
    omega3_g: data.omega3_g,
    zinc_mg: data.zinc_mg,
    magnesium_mg: data.magnesium_mg,
    vitaminB12_mcg: data.vitaminB12_mcg,
    choline_mg: data.choline_mg,
    sodium_mg: data.sodium_mg,
    addedSugar_g: data.addedSugar_g,
    saturatedFat_g: data.saturatedFat_g,
    provenance: "manual-estimate",
    confidence: "approximated",
    ingestedAt: SEEDED_AT,
  };
}

const ENTRIES: PerServingNutrition[] = [
  // Salmon: high in omega-3, vitamin D, vitamin B12, protein.
  seed("grilled-salmon", {
    calories: 380,
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
  seed("pasta-carbonara", {
    calories: 620,
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
  seed("mattar-paneer", {
    calories: 360,
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
  seed("bibimbap", {
    calories: 540,
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
  seed("falafel-wrap", {
    calories: 420,
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
