/**
 * Nutrition domain types — Parent Mode foundation.
 *
 * Schema is the on-disk shape for per-recipe nutrition data ingested
 * from USDA FoodData Central per ADR 0001. The 11 keys cover the
 * under-consumed pediatric priorities flagged in the DGA 2020-2025
 * (calcium, vitamin D, potassium, fiber, iron) plus the secondary
 * nutrients with credible structure-function framings.
 */

export type NutrientKey =
  | "calcium"
  | "iron"
  | "vitaminD"
  | "vitaminA"
  | "fiber"
  | "potassium"
  | "omega3"
  | "zinc"
  | "magnesium"
  | "vitaminB12"
  | "choline";

export type AgeBand = "1-3" | "4-8" | "9-13" | "14-18" | "mix";

/** FDA nutrient-content claim tier per 21 CFR 101.54. */
export type ClaimTier = "high-in" | "good-source" | "below-threshold";

/** Provenance + confidence tags per ADR 0001 implementation contract. */
export type NutritionProvenance =
  | "usda-fdc"
  | "manual-estimate"
  | "third-party";
export type NutritionConfidence = "mapped" | "approximated";

/** Per-serving nutrition for a single recipe. Units: mg unless noted. */
export interface PerServingNutrition {
  recipeSlug: string;
  servingsPerRecipe: number;
  /** Calories per serving — non-claim, displayed only on the methodology tooltip. */
  calories: number;
  /** Core macros (optional: legacy hand-authored entries predate them; the
   *  composition engine always supplies them). */
  protein_g?: number;
  totalFat_g?: number;
  totalCarbs_g?: number;
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
  /** Over-consumed nutrients — used for substitution-style framing, not warnings. */
  sodium_mg: number;
  addedSugar_g: number;
  saturatedFat_g: number;
  // ── Expanded panel (composed from USDA FDC). Optional: legacy hand-authored
  //    entries predate them; the composition engine always supplies them. ──
  water_g?: number;
  alcohol_g?: number;
  caffeine_mg?: number;
  totalSugars_g?: number;
  starch_g?: number;
  monoFat_g?: number;
  polyFat_g?: number;
  transFat_g?: number;
  cholesterol_mg?: number;
  vitaminC_mg?: number;
  vitaminE_mg?: number;
  vitaminK_mcg?: number;
  thiamin_mg?: number;
  riboflavin_mg?: number;
  niacin_mg?: number;
  pantothenicAcid_mg?: number;
  vitaminB6_mg?: number;
  folate_mcg?: number;
  phosphorus_mg?: number;
  copper_mg?: number;
  manganese_mg?: number;
  selenium_mcg?: number;
  histidine_g?: number;
  isoleucine_g?: number;
  leucine_g?: number;
  lysine_g?: number;
  methionine_g?: number;
  phenylalanine_g?: number;
  threonine_g?: number;
  tryptophan_g?: number;
  valine_g?: number;
  cystine_g?: number;
  tyrosine_g?: number;
  provenance: NutritionProvenance;
  confidence: NutritionConfidence;
  /** ISO timestamp of the ingest run that produced this entry. */
  ingestedAt: string;
}

/**
 * Single-nutrient claim result. Returned by computeNutrientClaim().
 *
 * `percentDV` is the per-serving percentage of the FDA Daily Value for
 * children ages 4 and older. It is the legally defensible number; the
 * age-banded DRI from NASEM is informational only and lives in
 * `dri-pediatric.ts`.
 */
export interface NutrientFlag {
  nutrient: NutrientKey;
  perServingAmount: number;
  /** FDA DV percent, rounded to nearest integer. */
  percentDV: number;
  tier: ClaimTier;
  /** Pediatric age band the spotlight UI is targeting (drives copy choice). */
  ageBand: AgeBand;
}

export interface NutrientUnitMeta {
  /** Display unit — appears in the methodology tooltip. */
  unit: "mg" | "mcg" | "g" | "IU";
  /** Per-serving DV for children 4+ per FDA 21 CFR 101.9. */
  dv4plus: number;
  /** Display name for UI. */
  displayName: string;
}
