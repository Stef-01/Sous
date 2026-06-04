import { describe, expect, it } from "vitest";
import { getDishNutrition, getDishCompositionGrams } from "./dish-nutrition";
import { gramsForSignal } from "./therapeutic-fit";

describe("getDishNutrition", () => {
  it("composes per-serving nutrition for a well-resolved dish", () => {
    const n = getDishNutrition("mexican-rice");
    expect(n.perServing).not.toBeNull();
    expect(n.perServing!.calories).toBeGreaterThan(0);
    expect(n.massedCoverage).toBeGreaterThan(0.5);
  });

  it("reports mass coverage so callers can gate display", () => {
    const n = getDishNutrition("caesar-salad");
    expect(n.massedCoverage).toBeGreaterThan(0);
    expect(n.massedCoverage).toBeLessThanOrEqual(1);
  });

  it("is empty + null for undefined / unknown slugs (safe fallback)", () => {
    expect(getDishNutrition(undefined)).toEqual({
      perServing: null,
      massedCoverage: 0,
    });
    expect(getDishNutrition("no-such-dish")).toEqual({
      perServing: null,
      massedCoverage: 0,
    });
  });
});

describe("getDishCompositionGrams + gramsForSignal", () => {
  it("gives per-serving grams of a realizing food group", () => {
    const masoor = getDishCompositionGrams("masoor-dal");
    // 1 cup lentils over 4 servings → tens of grams of legume per serving.
    expect(gramsForSignal("legumes", masoor)).toBeGreaterThan(20);
    expect(gramsForSignal("salmon", masoor)).toBe(0); // no fish
  });

  it("maps a class signal to its grams (salmon → oily-fish)", () => {
    const salmon = getDishCompositionGrams("grilled-salmon");
    expect(gramsForSignal("salmon", salmon)).toBeGreaterThan(50);
  });

  it("is empty for unlinked slugs + 0 for unmapped signals", () => {
    expect(getDishCompositionGrams(undefined)).toEqual({
      byGroup: {},
      byClass: {},
    });
    expect(gramsForSignal("nonsense", { byGroup: {}, byClass: {} })).toBe(0);
  });
});
