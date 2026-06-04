import { describe, expect, it } from "vitest";
import { getDishNutrition } from "./dish-nutrition";

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
