import { describe, expect, it } from "vitest";
import { composeRecipeNutrition } from "./compose";
import type { Ingredient, NutrientVector } from "@/types/ingredient";

function vec(partial: Partial<NutrientVector>): NutrientVector {
  return {
    calories: 0,
    protein_g: 0,
    totalFat_g: 0,
    totalCarbs_g: 0,
    calcium_mg: 0,
    iron_mg: 0,
    vitaminD_mcg: 0,
    vitaminA_mcg_rae: 0,
    fiber_g: 0,
    potassium_mg: 0,
    omega3_g: 0,
    zinc_mg: 0,
    magnesium_mg: 0,
    vitaminB12_mcg: 0,
    choline_mg: 0,
    sodium_mg: 0,
    addedSugar_g: 0,
    saturatedFat_g: 0,
    water_g: 0,
    alcohol_g: 0,
    caffeine_mg: 0,
    totalSugars_g: 0,
    starch_g: 0,
    monoFat_g: 0,
    polyFat_g: 0,
    transFat_g: 0,
    cholesterol_mg: 0,
    vitaminC_mg: 0,
    vitaminE_mg: 0,
    vitaminK_mcg: 0,
    thiamin_mg: 0,
    riboflavin_mg: 0,
    niacin_mg: 0,
    pantothenicAcid_mg: 0,
    vitaminB6_mg: 0,
    folate_mcg: 0,
    phosphorus_mg: 0,
    copper_mg: 0,
    manganese_mg: 0,
    selenium_mcg: 0,
    histidine_g: 0,
    isoleucine_g: 0,
    leucine_g: 0,
    lysine_g: 0,
    methionine_g: 0,
    phenylalanine_g: 0,
    threonine_g: 0,
    tryptophan_g: 0,
    valine_g: 0,
    cystine_g: 0,
    tyrosine_g: 0,
    ...partial,
  };
}

function ing(
  id: string,
  per100g: Partial<NutrientVector>,
  over: Partial<Ingredient> = {},
): Ingredient {
  return {
    id,
    name: id,
    aliases: [],
    fdcId: 1,
    fdcDataType: "foundation",
    foodGroup: "other",
    therapeuticClasses: [],
    per100g: vec(per100g),
    densityGPerCup: null,
    gramsPerPiece: null,
    provenance: "usda-fdc",
    confidence: "mapped",
    ...over,
  };
}

const AT = "2026-06-04T00:00:00.000Z";

describe("composeRecipeNutrition", () => {
  it("sums per-100g vectors by grams and divides by servings", () => {
    const registry = {
      a: ing("a", { calories: 100, fiber_g: 10, iron_mg: 2 }),
      b: ing("b", { calories: 200, fiber_g: 5, sodium_mg: 400 }),
    };
    // 200 g of a + 100 g of b, 2 servings.
    // a: cal 200, fiber 20, iron 4 ; b: cal 200, fiber 5, sodium 400
    // totals: cal 400, fiber 25, iron 4, sodium 400 → /2 servings
    const r = composeRecipeNutrition(
      "test",
      2,
      [
        { ingredientId: "a", grams: 200, isOptional: false },
        { ingredientId: "b", grams: 100, isOptional: false },
      ],
      registry,
      AT,
    );
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.calories).toBe(200);
    expect(r.data.fiber_g).toBe(12.5);
    expect(r.data.iron_mg).toBe(2);
    expect(r.data.sodium_mg).toBe(200);
    expect(r.data.recipeSlug).toBe("test");
    expect(r.data.servingsPerRecipe).toBe(2);
    expect(r.data.ingestedAt).toBe(AT);
  });

  it("is mapped/usda when every ingredient is mapped+usda", () => {
    const registry = { a: ing("a", { calories: 50 }) };
    const r = composeRecipeNutrition(
      "t",
      1,
      [{ ingredientId: "a", grams: 100, isOptional: false }],
      registry,
      AT,
    );
    expect(r.success && r.data.provenance).toBe("usda-fdc");
    expect(r.success && r.data.confidence).toBe("mapped");
  });

  it("downgrades to estimate/approximated if ANY line is weak", () => {
    const registry = {
      a: ing("a", { calories: 50 }),
      b: ing(
        "b",
        { calories: 50 },
        { provenance: "manual-estimate", confidence: "approximated" },
      ),
    };
    const r = composeRecipeNutrition(
      "t",
      1,
      [
        { ingredientId: "a", grams: 100, isOptional: false },
        { ingredientId: "b", grams: 100, isOptional: false },
      ],
      registry,
      AT,
    );
    expect(r.success && r.data.provenance).toBe("manual-estimate");
    expect(r.success && r.data.confidence).toBe("approximated");
  });

  it("counts a frying medium at the absorbed fraction only", () => {
    const registry = { oil: ing("oil", { calories: 800 }) };
    const full = composeRecipeNutrition(
      "t",
      1,
      [{ ingredientId: "oil", grams: 100, isOptional: false }],
      registry,
      AT,
    );
    const fry = composeRecipeNutrition(
      "t",
      1,
      [
        {
          ingredientId: "oil",
          grams: 100,
          isOptional: false,
          fryingMedium: true,
        },
      ],
      registry,
      AT,
    );
    expect(full.success && full.data.calories).toBe(800);
    expect(fry.success && fry.data.calories).toBe(80); // 800 * 0.10
  });

  it("errors on an unknown ingredient instead of silently zeroing", () => {
    const r = composeRecipeNutrition(
      "t",
      1,
      [{ ingredientId: "ghost", grams: 100, isOptional: false }],
      {},
      AT,
    );
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error).toContain("ghost");
  });

  it("rejects a non-positive serving count", () => {
    const r = composeRecipeNutrition("t", 0, [], {}, AT);
    expect(r.success).toBe(false);
  });

  it("is deterministic", () => {
    const registry = { a: ing("a", { calories: 123, fiber_g: 4.5 }) };
    const call = () =>
      composeRecipeNutrition(
        "t",
        3,
        [{ ingredientId: "a", grams: 250, isOptional: false }],
        registry,
        AT,
      );
    expect(JSON.stringify(call())).toBe(JSON.stringify(call()));
  });
});
