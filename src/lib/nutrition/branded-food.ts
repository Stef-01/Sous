/**
 * Branded-food engine (W20-W21) — search packaged foods from Open Food Facts
 * (ODbL) and map a product to Sous's per-serving nutrition shape so it can be
 * logged in the diary alongside cooked dishes.
 *
 * OFF reports nutriments per 100 g; we scale to one serving (its serving_size,
 * or 100 g when unknown). Branded foods rarely carry micros/amino acids, so the
 * mapped vector is intentionally PARTIAL — the panel shows what's reported and
 * the usual "an estimate" framing covers the rest. provenance = third-party.
 */

import type { PerServingNutrition } from "@/types/nutrition";

export interface BrandedFood {
  /** OFF barcode — the stable id. */
  barcode: string;
  name: string;
  brand: string | null;
  /** Grams in one serving (parsed from serving_size, default 100). */
  servingSizeG: number;
  /** Nutrition for ONE serving. */
  nutrition: PerServingNutrition;
}

/** Parse OFF's free-text serving_size ("110g", "1 cup (240 ml)") → grams. */
export function parseServingGrams(raw: unknown): number {
  if (typeof raw !== "string") return 100;
  const m = raw.match(/([\d.]+)\s*(g|gram|ml)/i);
  if (m) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 100;
}

const num = (v: unknown): number =>
  typeof v === "number" && Number.isFinite(v) ? v : 0;

/** Build a per-serving PerServingNutrition from OFF per-100g nutriments. */
function brandedNutrition(
  nutriments: Record<string, unknown>,
  servingG: number,
  barcode: string,
): PerServingNutrition {
  const f = servingG / 100; // per-100g → per-serving scale
  // OFF sodium is grams/100g; ×1000 → mg. Salt → sodium if sodium absent.
  const sodiumG =
    nutriments["sodium_100g"] != null
      ? num(nutriments["sodium_100g"])
      : num(nutriments["salt_100g"]) * 0.393;
  return {
    recipeSlug: `off:${barcode}`,
    servingsPerRecipe: 1,
    calories: Math.round(num(nutriments["energy-kcal_100g"]) * f),
    protein_g: round1(num(nutriments["proteins_100g"]) * f),
    totalCarbs_g: round1(num(nutriments["carbohydrates_100g"]) * f),
    totalFat_g: round1(num(nutriments["fat_100g"]) * f),
    fiber_g: round1(num(nutriments["fiber_100g"]) * f),
    totalSugars_g: round1(num(nutriments["sugars_100g"]) * f),
    saturatedFat_g: round1(num(nutriments["saturated-fat_100g"]) * f),
    sodium_mg: Math.round(sodiumG * 1000 * f),
    calcium_mg: Math.round(num(nutriments["calcium_100g"]) * 1000 * f),
    iron_mg: round1(num(nutriments["iron_100g"]) * 1000 * f),
    // Branded foods rarely report these — honest zeros.
    addedSugar_g: 0,
    vitaminD_mcg: 0,
    vitaminA_mcg_rae: 0,
    potassium_mg: Math.round(num(nutriments["potassium_100g"]) * 1000 * f),
    omega3_g: 0,
    zinc_mg: 0,
    magnesium_mg: 0,
    vitaminB12_mcg: 0,
    choline_mg: 0,
    provenance: "third-party",
    confidence: "approximated",
    ingestedAt: "",
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Map a raw OFF product → BrandedFood, or null if it lacks usable nutrition. */
export function mapOffProduct(p: Record<string, unknown>): BrandedFood | null {
  const barcode = typeof p["code"] === "string" ? p["code"] : null;
  const name =
    (typeof p["product_name"] === "string" && p["product_name"].trim()) || null;
  const nutriments = (p["nutriments"] as Record<string, unknown>) ?? {};
  if (!barcode || !name) return null;
  // Require at least calories to be useful.
  if (num(nutriments["energy-kcal_100g"]) <= 0) return null;
  const servingSizeG = parseServingGrams(p["serving_size"]);
  return {
    barcode,
    name,
    brand:
      typeof p["brands"] === "string" && p["brands"].trim()
        ? p["brands"].split(",")[0].trim()
        : null,
    servingSizeG,
    nutrition: brandedNutrition(nutriments, servingSizeG, barcode),
  };
}
