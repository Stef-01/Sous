import { describe, expect, it } from "vitest";
import {
  AVG_AMERICAN_FOOD_AWAY_KG_CO2E_PER_YEAR,
  buildEncouragementCopy,
  CO2E_PER_MEAL_KG,
  mealCo2eSavingsKg,
  pctOfAvgAmericanAvoided,
  pickCarbonAnalogy,
  totalCo2eSavedKg,
} from "./carbon-math";

describe("CO2E_PER_MEAL_KG midpoints", () => {
  it("orders contexts from lowest to highest carbon", () => {
    // Plant-seasonal home is the floor; delivery is the ceiling.
    expect(CO2E_PER_MEAL_KG["home-plant-seasonal"]).toBeLessThan(
      CO2E_PER_MEAL_KG["home-mixed"],
    );
    expect(CO2E_PER_MEAL_KG["home-mixed"]).toBeLessThan(
      CO2E_PER_MEAL_KG["restaurant-dine-in"],
    );
    expect(CO2E_PER_MEAL_KG["restaurant-dine-in"]).toBeLessThan(
      CO2E_PER_MEAL_KG["takeout-pickup"],
    );
    expect(CO2E_PER_MEAL_KG["takeout-pickup"]).toBeLessThan(
      CO2E_PER_MEAL_KG["delivery"],
    );
  });

  it("home-red-meat exceeds plant + mixed home-cooked", () => {
    expect(CO2E_PER_MEAL_KG["home-red-meat"]).toBeGreaterThan(
      CO2E_PER_MEAL_KG["home-mixed"],
    );
  });
});

describe("mealCo2eSavingsKg", () => {
  it("returns positive savings for plant-home over delivery", () => {
    expect(
      mealCo2eSavingsKg({
        chosen: "home-plant-seasonal",
        baseline: "delivery",
      }),
    ).toBeCloseTo(4.9, 1);
  });

  it("clamps to 0 when chosen is more carbon-heavy than baseline", () => {
    // Red-meat home cook vs takeout — red meat is heavier; never
    // shame the cook with negative savings.
    expect(
      mealCo2eSavingsKg({
        chosen: "home-red-meat",
        baseline: "takeout-pickup",
      }),
    ).toBe(0);
  });

  it("returns 0 when chosen equals baseline", () => {
    expect(
      mealCo2eSavingsKg({
        chosen: "home-mixed",
        baseline: "home-mixed",
      }),
    ).toBe(0);
  });
});

describe("totalCo2eSavedKg", () => {
  it("returns 0 for empty event list", () => {
    expect(totalCo2eSavedKg({ events: [] })).toBe(0);
  });

  it("sums per-event savings against default delivery baseline", () => {
    const events = [
      {
        cookedAt: "2026-05-01T10:00:00Z",
        context: "home-plant-seasonal" as const,
      },
      { cookedAt: "2026-05-02T10:00:00Z", context: "home-mixed" as const },
    ];
    // 4.9 + 3.8 = 8.7
    expect(totalCo2eSavedKg({ events })).toBeCloseTo(8.7, 1);
  });

  it("respects an explicit baseline override", () => {
    const events = [
      { cookedAt: "2026-05-01T10:00:00Z", context: "home-mixed" as const },
    ];
    // home-mixed=2.5 vs restaurant-dine-in=4.7 → savings 2.2
    expect(
      totalCo2eSavedKg({
        events,
        baseline: "restaurant-dine-in",
      }),
    ).toBeCloseTo(2.2, 1);
  });

  it("rounds total to 0.1 kg precision (no false precision)", () => {
    const events = Array.from({ length: 7 }, () => ({
      cookedAt: "2026-05-01T10:00:00Z",
      context: "home-plant-seasonal" as const,
    }));
    const total = totalCo2eSavedKg({ events });
    // Should be a multiple of 0.1.
    expect(total * 10).toBe(Math.round(total * 10));
  });
});

describe("pctOfAvgAmericanAvoided", () => {
  it("returns 0 for non-positive saved kg", () => {
    expect(pctOfAvgAmericanAvoided({ savedKg: 0 })).toBe(0);
    expect(pctOfAvgAmericanAvoided({ savedKg: -50 })).toBe(0);
    expect(pctOfAvgAmericanAvoided({ savedKg: Number.NaN })).toBe(0);
  });

  it("computes percentage of the 1000 kg/year baseline", () => {
    expect(pctOfAvgAmericanAvoided({ savedKg: 100 })).toBe(10);
    expect(pctOfAvgAmericanAvoided({ savedKg: 250 })).toBe(25);
  });

  it("caps at 100 even for outsized savings", () => {
    expect(
      pctOfAvgAmericanAvoided({
        savedKg: AVG_AMERICAN_FOOD_AWAY_KG_CO2E_PER_YEAR * 5,
      }),
    ).toBe(100);
  });

  it("rounds to 1 decimal place", () => {
    expect(pctOfAvgAmericanAvoided({ savedKg: 25 })).toBe(2.5);
  });
});

describe("pickCarbonAnalogy", () => {
  it("returns 0-miles label for non-positive input", () => {
    expect(pickCarbonAnalogy(0).value).toBe(0);
    expect(pickCarbonAnalogy(-5).label).toMatch(/0 miles/);
  });

  it("uses miles-avoided framing for sub-5kg savings", () => {
    const out = pickCarbonAnalogy(2);
    expect(out.label).toMatch(/miles avoided/);
    // 2 / 0.34 ≈ 6 miles
    expect(out.value).toBe(6);
  });

  it("uses miles-avoided framing through medium range (< 110 kg)", () => {
    const out = pickCarbonAnalogy(50);
    expect(out.label).toMatch(/miles avoided/);
  });

  it("uses tree-equivalent framing for large savings (≥ 110 kg)", () => {
    const out = pickCarbonAnalogy(220);
    expect(out.label).toMatch(/tree/);
    // 220 / 22 = 10 trees
    expect(out.value).toBe(10);
  });

  it("uses singular 'tree' grammar at 22 kg = 1 tree", () => {
    const out = pickCarbonAnalogy(110);
    // 110 / 22 = 5 → uses plural
    expect(out.label).toMatch(/trees/);
  });
});

describe("buildEncouragementCopy", () => {
  it("cold-start invitation when nothing saved yet", () => {
    expect(
      buildEncouragementCopy({ savedKg: 0, windowLabel: "this week" }),
    ).toMatch(/first cook/i);
  });

  it("renders kg CO₂e + analogy for a meaningful saving", () => {
    const out = buildEncouragementCopy({
      savedKg: 8.7,
      windowLabel: "this week",
    });
    expect(out).toMatch(/8\.7 kg CO₂e/);
    expect(out).toMatch(/this week/);
    expect(out).toMatch(/miles avoided/);
  });

  it("renders grams (not 0.0 kg) for sub-1kg savings", () => {
    const out = buildEncouragementCopy({
      savedKg: 0.4,
      windowLabel: "today",
    });
    expect(out).toMatch(/400g CO₂e/);
  });

  it("never shames — always positive framing", () => {
    const out = buildEncouragementCopy({
      savedKg: 5,
      windowLabel: "this week",
    });
    expect(out).not.toMatch(/should|missed|behind|less than/i);
  });
});
