import { describe, it, expect } from "vitest";
import {
  searchDishes,
  lookupDish,
  customDishSlug,
  isCustomDishSlug,
} from "./dish-lookup";

describe("searchDishes", () => {
  it("returns nothing for queries under 2 characters", () => {
    expect(searchDishes("")).toEqual([]);
    expect(searchDishes("a")).toEqual([]);
  });

  it("returns catalog dishes whose name matches the query", () => {
    const hits = searchDishes("salmon");
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) expect(h.name.toLowerCase()).toContain("salmon");
  });

  it("ranks a name-prefix match ahead of a mid-name match", () => {
    const hits = searchDishes("pasta");
    expect(hits.length).toBeGreaterThan(0);
    // the top hit should start with the query, not merely contain it
    expect(hits[0].name.toLowerCase().startsWith("pasta")).toBe(true);
  });

  it("respects the result limit", () => {
    expect(searchDishes("e", 5).length).toBeLessThanOrEqual(5); // 1 char → []
    expect(searchDishes("chicken", 3).length).toBeLessThanOrEqual(3);
  });
});

describe("custom dish slugs", () => {
  it("round-trips a free-text title through the slug", () => {
    const slug = customDishSlug("Leftover Pad Thai");
    expect(isCustomDishSlug(slug)).toBe(true);
    expect(lookupDish(slug).name).toBe("Leftover Pad Thai");
    expect(lookupDish(slug).image).toBeNull();
  });

  it("caps the slug at the 80-char slot limit", () => {
    expect(customDishSlug("x".repeat(200)).length).toBeLessThanOrEqual(80);
  });

  it("treats a normal slug as non-custom", () => {
    expect(isCustomDishSlug("pasta-carbonara")).toBe(false);
  });
});
