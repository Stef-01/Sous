import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { STANFORD_VENUES, demoDishToBrandedFood } from "./stanford-demo";

describe("Stanford eat-out demo data", () => {
  it("includes Zareen's (founder-named) and a real spread of venues", () => {
    expect(STANFORD_VENUES.find((v) => v.name === "Zareen's")).toBeDefined();
    expect(STANFORD_VENUES.length).toBeGreaterThanOrEqual(12);
  });

  it("every venue sits within the 20 km demo radius", () => {
    for (const v of STANFORD_VENUES) {
      expect(v.distanceKm, v.name).toBeGreaterThan(0);
      expect(v.distanceKm, v.name).toBeLessThanOrEqual(20);
    }
  });

  it("every dish photo is a REAL file in public/ (no broken demo images)", () => {
    for (const v of STANFORD_VENUES)
      for (const dish of v.dishes) {
        const p = join(process.cwd(), "public", dish.image);
        expect(existsSync(p), `${v.name}: ${dish.image}`).toBe(true);
      }
  });

  it("dish slugs are globally unique; macros are plausible plates", () => {
    const seen = new Set<string>();
    for (const v of STANFORD_VENUES)
      for (const dish of v.dishes) {
        expect(seen.has(dish.slug), dish.slug).toBe(false);
        seen.add(dish.slug);
        expect(dish.kcal).toBeGreaterThanOrEqual(150);
        expect(dish.kcal).toBeLessThanOrEqual(1200);
        // 4/4/9 sanity: macro kcal within ±25% of the stated kcal.
        const macroKcal =
          dish.protein_g * 4 + dish.carbs_g * 4 + dish.fat_g * 9;
        expect(
          Math.abs(macroKcal - dish.kcal) / dish.kcal,
          `${dish.slug} macros vs kcal`,
        ).toBeLessThan(0.25);
      }
  });

  it("converts to a loggable BrandedFood with honest provenance", () => {
    const venue = STANFORD_VENUES[0];
    const food = demoDishToBrandedFood(venue.dishes[0], venue);
    expect(food.brand).toBe(venue.name);
    expect(food.nutrition.provenance).toBe("manual-estimate");
    expect(food.nutrition.confidence).toBe("approximated");
    expect(food.nutrition.calories).toBe(venue.dishes[0].kcal);
  });
});
