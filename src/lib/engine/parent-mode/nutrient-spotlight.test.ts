/**
 * Tests for the nutrient spotlight engine.
 *
 * Coverage:
 *   - All 11 nutrients individually pass through pickSpotlight()
 *   - Priority order: tier 1 (calcium / vitD / iron) wins over tier 2
 *     (fiber / potassium) wins over tier 3 (everything else)
 *   - Within a priority bucket, high-in beats good-source
 *   - null per-serving → null result
 *   - all-zero per-serving → null result
 *   - Safe phrasings: every (nutrient, tier) pair returns a non-empty
 *     SAFE template; below-threshold returns null
 */

import { describe, expect, it } from "vitest";
import { pickSpotlight, listQualifyingNutrients } from "./nutrient-spotlight";
import { getSafePhrasing } from "@/data/nutrition/safe-phrasings";
import { FDA_DV_4PLUS } from "@/data/nutrition/fda-dv";
import type { NutrientKey, PerServingNutrition } from "@/types/nutrition";

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

const NUTRIENT_FIELDS: Record<NutrientKey, keyof PerServingNutrition> = {
  calcium: "calcium_mg",
  iron: "iron_mg",
  vitaminD: "vitaminD_mcg",
  vitaminA: "vitaminA_mcg_rae",
  fiber: "fiber_g",
  potassium: "potassium_mg",
  omega3: "omega3_g",
  zinc: "zinc_mg",
  magnesium: "magnesium_mg",
  vitaminB12: "vitaminB12_mcg",
  choline: "choline_mg",
};

describe("pickSpotlight — null and empty paths", () => {
  it("returns null for null per-serving", () => {
    expect(pickSpotlight(null, "4-8")).toBeNull();
  });
  it("returns null for undefined per-serving", () => {
    expect(pickSpotlight(undefined, "4-8")).toBeNull();
  });
  it("returns null when nothing meets threshold", () => {
    expect(pickSpotlight(makeServing({}), "4-8")).toBeNull();
  });
});

describe("pickSpotlight — single-nutrient correctness across all 11 nutrients", () => {
  for (const nutrient of Object.keys(FDA_DV_4PLUS) as NutrientKey[]) {
    it(`picks ${nutrient} when only ${nutrient} qualifies (high-in)`, () => {
      const dv = FDA_DV_4PLUS[nutrient].dv4plus;
      const serving = makeServing({ [NUTRIENT_FIELDS[nutrient]]: dv * 0.25 });
      const result = pickSpotlight(serving, "4-8");
      expect(result?.nutrient).toBe(nutrient);
      expect(result?.tier).toBe("high-in");
    });

    it(`picks ${nutrient} when only ${nutrient} qualifies (good-source)`, () => {
      const dv = FDA_DV_4PLUS[nutrient].dv4plus;
      const serving = makeServing({ [NUTRIENT_FIELDS[nutrient]]: dv * 0.12 });
      const result = pickSpotlight(serving, "4-8");
      expect(result?.nutrient).toBe(nutrient);
      expect(result?.tier).toBe("good-source");
    });
  }
});

describe("pickSpotlight — priority ordering", () => {
  it("tier-1 calcium beats tier-2 fiber when both qualify", () => {
    const serving = makeServing({
      calcium_mg: 200, // 200/1300 = 15.4% → good-source
      fiber_g: 6, // 6/28 = 21.4% → high-in (but fiber is tier 2)
    });
    const result = pickSpotlight(serving, "4-8");
    expect(result?.nutrient).toBe("calcium");
    expect(result?.tier).toBe("good-source");
  });

  it("tier-1 vitamin D beats tier-3 zinc even when both are high-in", () => {
    const serving = makeServing({
      vitaminD_mcg: 5, // 5/20 = 25% → high-in (tier 1)
      zinc_mg: 3, // 3/11 = 27% → high-in (tier 3)
    });
    const result = pickSpotlight(serving, "4-8");
    expect(result?.nutrient).toBe("vitaminD");
  });

  it("within a tier, high-in beats good-source", () => {
    const serving = makeServing({
      calcium_mg: 150, // 150/1300 = 11.5% → good-source
      vitaminD_mcg: 5, // 5/20 = 25% → high-in
      // iron not set
    });
    // calcium and vitaminD both tier 1 — vitaminD is high-in so it wins
    const result = pickSpotlight(serving, "4-8");
    expect(result?.nutrient).toBe("vitaminD");
    expect(result?.tier).toBe("high-in");
  });

  it("tier-2 fiber beats tier-3 omega3 when only those qualify", () => {
    const serving = makeServing({
      fiber_g: 4, // 4/28 = 14.3% → good-source (tier 2)
      omega3_g: 0.5, // 0.5/1.6 = 31% → high-in (tier 3)
    });
    const result = pickSpotlight(serving, "4-8");
    expect(result?.nutrient).toBe("fiber");
  });
});

describe("pickSpotlight — age band threading", () => {
  it("threads ageBand through the result unchanged", () => {
    const serving = makeServing({ calcium_mg: 300 });
    expect(pickSpotlight(serving, "1-3")?.ageBand).toBe("1-3");
    expect(pickSpotlight(serving, "9-13")?.ageBand).toBe("9-13");
    expect(pickSpotlight(serving, "mix")?.ageBand).toBe("mix");
  });
});

describe("listQualifyingNutrients — tooltip data", () => {
  it("returns empty for an unqualified serving", () => {
    expect(listQualifyingNutrients(makeServing({}), "4-8")).toHaveLength(0);
  });

  it("returns all qualifying nutrients in priority order", () => {
    const serving = makeServing({
      calcium_mg: 300, // tier 1, high-in
      fiber_g: 6, // tier 2, high-in
      omega3_g: 0.5, // tier 3, high-in
    });
    const result = listQualifyingNutrients(serving, "4-8");
    expect(result.map((f) => f.nutrient)).toEqual([
      "calcium",
      "fiber",
      "omega3",
    ]);
  });
});

describe("safe phrasings — every (nutrient, tier) returns a non-empty template", () => {
  for (const nutrient of Object.keys(FDA_DV_4PLUS) as NutrientKey[]) {
    it(`${nutrient} high-in`, () => {
      const phrasing = getSafePhrasing(nutrient, "high-in");
      expect(phrasing).not.toBeNull();
      expect(phrasing!.lead.length).toBeGreaterThan(0);
      expect(phrasing!.whyItMatters.length).toBeGreaterThan(0);
    });
    it(`${nutrient} good-source`, () => {
      const phrasing = getSafePhrasing(nutrient, "good-source");
      expect(phrasing).not.toBeNull();
      expect(phrasing!.lead.length).toBeGreaterThan(0);
      expect(phrasing!.whyItMatters.length).toBeGreaterThan(0);
    });
  }

  it("below-threshold returns null", () => {
    expect(getSafePhrasing("calcium", "below-threshold")).toBeNull();
  });

  it("no SAFE phrasing contains UNSAFE trigger words", () => {
    const banned = [
      "prevent",
      "treat",
      "cure",
      "boost",
      "fight",
      "protect",
      "reduce risk",
      "lower risk",
      "diagnose",
      "medication",
    ];
    for (const nutrient of Object.keys(FDA_DV_4PLUS) as NutrientKey[]) {
      for (const tier of ["high-in", "good-source"] as const) {
        const p = getSafePhrasing(nutrient, tier)!;
        const text = `${p.lead} ${p.whyItMatters}`.toLowerCase();
        for (const word of banned) {
          expect(text, `${nutrient}/${tier}: "${text}"`).not.toContain(word);
        }
      }
    }
  });
});
