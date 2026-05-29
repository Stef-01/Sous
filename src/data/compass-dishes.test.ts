import { describe, expect, it } from "vitest";
import { COMPASS_DISHES } from "./compass-dishes";
import { compassDishSchema } from "@/types/cuisine-compass";

describe("COMPASS_DISHES dataset", () => {
  it("ships at least the 50-dish Sprint N target", () => {
    expect(COMPASS_DISHES.length).toBeGreaterThanOrEqual(50);
  });

  it("every entry validates against the Zod schema", () => {
    for (const dish of COMPASS_DISHES) {
      const result = compassDishSchema.safeParse(dish);
      if (!result.success) {
        // Make the failure traceable by including the dish slug.
        throw new Error(
          `${dish.slug}: ${result.error.issues
            .map((i) => `${i.path.join(".")}=${i.message}`)
            .join("; ")}`,
        );
      }
      expect(result.success).toBe(true);
    }
  });

  it("slugs are unique", () => {
    const slugs = new Set<string>();
    for (const dish of COMPASS_DISHES) {
      expect(slugs.has(dish.slug)).toBe(false);
      slugs.add(dish.slug);
    }
  });

  it("dayIndex values are strictly increasing across the array", () => {
    for (let i = 1; i < COMPASS_DISHES.length; i++) {
      expect(COMPASS_DISHES[i].dayIndex).toBeGreaterThan(
        COMPASS_DISHES[i - 1].dayIndex,
      );
    }
  });

  it("origin coordinates are inside Earth's geographic bounds", () => {
    for (const dish of COMPASS_DISHES) {
      const { lat, lng } = dish.origin;
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
    }
  });

  it("history blurbs are non-trivial (≥40 chars)", () => {
    for (const dish of COMPASS_DISHES) {
      expect(dish.history.length).toBeGreaterThanOrEqual(40);
    }
  });

  it("cuisineFamily values cover at least 8 distinct cuisines", () => {
    const cuisines = new Set(COMPASS_DISHES.map((d) => d.cuisineFamily));
    expect(cuisines.size).toBeGreaterThanOrEqual(8);
  });
});
