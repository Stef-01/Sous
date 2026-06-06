/**
 * Canonical ingredient domain types — the foundation of the bottom-up
 * nutrition architecture (docs/INGREDIENT-NUTRITION-ARCHITECTURE-PLAN.md).
 *
 * Each ingredient is encoded ONCE: a USDA-sourced per-100g nutrient vector, a
 * food group, the therapeutic classes it realizes, and the mass conversions
 * needed to turn a recipe's "2 tbsp" / "3 cloves" into grams. Every recipe's
 * nutrition and every health signal is then DERIVED from these atoms by
 * composition — never hand-authored per recipe.
 *
 * The per-100g vector deliberately mirrors the nutrient set of
 * `PerServingNutrition` (src/types/nutrition.ts) so composition maps 1:1 onto
 * the existing claim / DRI / FDA scaffolding with no translation layer.
 */

import type { NutritionProvenance, NutritionConfidence } from "./nutrition";

/** Controlled food taxonomy — the spine of structured therapeutic matching. */
export type FoodGroup =
  | "vegetable"
  | "leafy-green"
  | "fruit"
  | "legume"
  | "grain"
  | "nut-seed"
  | "dairy"
  | "egg"
  | "red-meat"
  | "poultry"
  | "seafood"
  | "fat-oil"
  | "herb-spice"
  | "sweetener"
  | "condiment"
  | "beverage"
  | "other";

/**
 * Therapeutic classes an ingredient realizes — the structured signal the
 * evidence engine tests against, replacing brittle name substring matching.
 * These are food-identity facts (claim-neutral), NOT health claims.
 */
export type TherapeuticClass =
  | "soluble-fiber"
  | "beta-glucan"
  | "whole-grain"
  | "plant-protein"
  | "oily-fish"
  | "omega-3-source"
  | "olive-oil"
  | "nuts"
  | "cruciferous"
  | "fermented"
  | "coffee"
  | "added-sugar"
  | "refined-grain"
  | "high-sodium"
  | "saturated-fat-rich";

/**
 * Per-100g (as-eaten) nutrient vector. Same keys + units as the per-serving
 * nutrition shape, so `Σ vector × grams / 100` composes directly into
 * `PerServingNutrition`.
 */
export interface NutrientVector {
  /** kcal per 100 g. */
  calories: number;
  /** The three core macros — the headline numbers a nutrition panel must show. */
  protein_g: number;
  totalFat_g: number;
  totalCarbs_g: number;
  calcium_mg: number;
  iron_mg: number;
  vitaminD_mcg: number;
  vitaminA_mcg_rae: number;
  fiber_g: number;
  potassium_mg: number;
  omega3_g: number;
  zinc_mg: number;
  magnesium_mg: number;
  vitaminB12_mcg: number;
  choline_mg: number;
  sodium_mg: number;
  addedSugar_g: number;
  saturatedFat_g: number;
  // ── Expanded panel (USDA FDC SR Legacy, per 100 g). All required numbers;
  //    a genuinely-absent nutrient is 0. Grouped: general · fats · vitamins ·
  //    minerals · amino acids. ──
  water_g: number;
  alcohol_g: number;
  caffeine_mg: number;
  totalSugars_g: number;
  starch_g: number;
  monoFat_g: number;
  polyFat_g: number;
  transFat_g: number;
  cholesterol_mg: number;
  vitaminC_mg: number;
  vitaminE_mg: number;
  vitaminK_mcg: number;
  thiamin_mg: number;
  riboflavin_mg: number;
  niacin_mg: number;
  pantothenicAcid_mg: number;
  vitaminB6_mg: number;
  folate_mcg: number;
  phosphorus_mg: number;
  copper_mg: number;
  manganese_mg: number;
  selenium_mcg: number;
  histidine_g: number;
  isoleucine_g: number;
  leucine_g: number;
  lysine_g: number;
  methionine_g: number;
  phenylalanine_g: number;
  threonine_g: number;
  tryptophan_g: number;
  valine_g: number;
  cystine_g: number;
  tyrosine_g: number;
}

/** Which USDA FoodData Central dataset a mapped ingredient came from. */
export type FdcDataType = "foundation" | "sr-legacy" | "fndds";

export interface Ingredient {
  /** Canonical slug, e.g. "red-lentils". Stable; referenced by recipes. */
  id: string;
  /** Display name, e.g. "Red lentils". */
  name: string;
  /** Lowercased match keys, e.g. ["masoor dal", "masoor", "red lentil"]. */
  aliases: string[];
  /** USDA FoodData Central id; null for a manual estimate. */
  fdcId: number | null;
  /** Source dataset when fdcId is set. */
  fdcDataType: FdcDataType | null;
  foodGroup: FoodGroup;
  /** Food-identity classes the evidence engine matches on. */
  therapeuticClasses: TherapeuticClass[];
  /** Nutrients per 100 g, as-eaten basis. */
  per100g: NutrientVector;
  /** Grams per US cup, for volume quantities (null if not applicable). */
  densityGPerCup: number | null;
  /** Grams per countable piece (clove, egg, fillet), null if not applicable. */
  gramsPerPiece: number | null;
  provenance: NutritionProvenance;
  confidence: NutritionConfidence;
}

/** A recipe ingredient line resolved to a canonical id + a mass in grams. */
export interface ResolvedIngredientLine {
  ingredientId: string;
  grams: number;
  isOptional: boolean;
  /**
   * True when this is a deep-frying / cooking medium (oil listed for frying):
   * the recipe lists the whole bath but only a fraction is absorbed, so
   * composition applies an absorption factor instead of counting it all.
   */
  fryingMedium?: boolean;
}

/** The ordered, mass-resolved ingredient list for one recipe. */
export interface RecipeIngredientLink {
  recipeSlug: string;
  servingsPerRecipe: number;
  /** Total ingredient lines in the source recipe (resolved + unresolved). */
  originalLineCount: number;
  lines: ResolvedIngredientLine[];
}
