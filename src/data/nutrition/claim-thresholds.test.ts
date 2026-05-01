/**
 * Tests for FDA nutrient-content threshold logic.
 *
 * Boundary correctness is load-bearing for legal defensibility — every
 * tier transition is exercised here. If any of these break, do NOT loosen
 * the threshold; re-read 21 CFR 101.54 first.
 */

import { describe, expect, it } from "vitest";
import { computeNutrientClaim, getNutrientAmount } from "./claim-thresholds";
import { FDA_DV_4PLUS } from "./fda-dv";
import type { PerServingNutrition } from "@/types/nutrition";

function makeServing(
  overrides: Partial<PerServingNutrition>,
): PerServingNutrition {
  return {
    recipeSlug: "test",
    servingsPerRecipe: 1,
    calories: 0,
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
    provenance: "manual-estimate",
    confidence: "approximated",
    ingestedAt: "2026-05-04T00:00:00.000Z",
    ...overrides,
  };
}

describe("computeNutrientClaim — boundary tiers", () => {
  it("zero amount → below-threshold", () => {
    const result = computeNutrientClaim(makeServing({}), "calcium");
    expect(result.tier).toBe("below-threshold");
    expect(result.percentDV).toBe(0);
  });

  it("just under 10% DV → below-threshold (calcium 129/1300 = 9.92%)", () => {
    const result = computeNutrientClaim(
      makeServing({ calcium_mg: 129 }),
      "calcium",
    );
    expect(result.tier).toBe("below-threshold");
    expect(result.percentDV).toBe(10); // display rounds 9.92→10 but tier is on raw
  });

  it("exactly 10% DV → good-source (calcium 130/1300)", () => {
    const result = computeNutrientClaim(
      makeServing({ calcium_mg: 130 }),
      "calcium",
    );
    expect(result.tier).toBe("good-source");
  });

  it("19.99% DV → good-source (calcium 259/1300 = 19.92%)", () => {
    const result = computeNutrientClaim(
      makeServing({ calcium_mg: 259 }),
      "calcium",
    );
    expect(result.tier).toBe("good-source");
  });

  it("exactly 20% DV → high-in (calcium 260/1300)", () => {
    const result = computeNutrientClaim(
      makeServing({ calcium_mg: 260 }),
      "calcium",
    );
    expect(result.tier).toBe("high-in");
  });

  it("100% DV → high-in (calcium 1300/1300)", () => {
    const result = computeNutrientClaim(
      makeServing({ calcium_mg: 1300 }),
      "calcium",
    );
    expect(result.tier).toBe("high-in");
    expect(result.percentDV).toBe(100);
  });

  it("over 100% DV is fine — no clamp", () => {
    const result = computeNutrientClaim(
      makeServing({ calcium_mg: 2600 }),
      "calcium",
    );
    expect(result.tier).toBe("high-in");
    expect(result.percentDV).toBe(200);
  });

  it("negative amount clamps to 0 (defensive vs noisy ingest)", () => {
    const result = computeNutrientClaim(makeServing({ iron_mg: -3 }), "iron");
    expect(result.tier).toBe("below-threshold");
    expect(result.percentDV).toBe(0);
    expect(result.perServingAmount).toBe(0);
  });
});

describe("computeNutrientClaim — works across every tracked nutrient", () => {
  it("hits high-in for every nutrient at exactly 20% of its DV", () => {
    const nutrients = Object.keys(FDA_DV_4PLUS) as Array<
      keyof typeof FDA_DV_4PLUS
    >;
    for (const n of nutrients) {
      const dv = FDA_DV_4PLUS[n].dv4plus;
      const amount = dv * 0.2;
      const serving = makeServing({});
      // Set the right field via the same map the engine uses
      const result = computeNutrientClaim(
        { ...serving, ...amountFor(n, amount) },
        n,
      );
      expect(result.tier, `${n} at 20% DV`).toBe("high-in");
    }
  });
});

describe("getNutrientAmount — defensive read", () => {
  it("returns the underlying field value", () => {
    const serving = makeServing({ fiber_g: 7 });
    expect(getNutrientAmount(serving, "fiber")).toBe(7);
  });
});

// Helper: build a partial PerServingNutrition with a single nutrient set.
function amountFor(
  nutrient: keyof typeof FDA_DV_4PLUS,
  amount: number,
): Partial<PerServingNutrition> {
  switch (nutrient) {
    case "calcium":
      return { calcium_mg: amount };
    case "iron":
      return { iron_mg: amount };
    case "vitaminD":
      return { vitaminD_mcg: amount };
    case "vitaminA":
      return { vitaminA_mcg_rae: amount };
    case "fiber":
      return { fiber_g: amount };
    case "potassium":
      return { potassium_mg: amount };
    case "omega3":
      return { omega3_g: amount };
    case "zinc":
      return { zinc_mg: amount };
    case "magnesium":
      return { magnesium_mg: amount };
    case "vitaminB12":
      return { vitaminB12_mcg: amount };
    case "choline":
      return { choline_mg: amount };
  }
}
