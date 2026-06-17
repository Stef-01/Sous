import { describe, it, expect } from "vitest";
import { searchIngredients } from "./ingredient-search";

describe("searchIngredients", () => {
  it("returns nothing for queries under 2 characters", () => {
    expect(searchIngredients("")).toEqual([]);
    expect(searchIngredients(" ")).toEqual([]);
    expect(searchIngredients("a")).toEqual([]);
  });

  it("ranks a name-prefix match first", () => {
    const hits = searchIngredients("alm");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].name.toLowerCase().startsWith("alm")).toBe(true); // Almonds
  });

  it("every hit matches the query in name or alias", () => {
    for (const h of searchIngredients("carr")) {
      expect(h.name.toLowerCase()).toContain("carr"); // Carrot
    }
  });

  it("matches via an alias but returns the canonical name", () => {
    // "masoor" is an alias of Red lentils.
    const names = searchIngredients("masoor").map((h) => h.name.toLowerCase());
    expect(names).toContain("red lentils");
  });

  it("respects the result limit", () => {
    expect(searchIngredients("e", 6).length).toBeLessThanOrEqual(6); // 1 char → []
    expect(searchIngredients("oil", 2).length).toBeLessThanOrEqual(2);
  });

  it("dedupes by display name", () => {
    const hits = searchIngredients("rice");
    const names = hits.map((h) => h.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });
});
