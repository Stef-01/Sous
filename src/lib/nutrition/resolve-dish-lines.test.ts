import { describe, expect, it } from "vitest";
import { resolveDishLines } from "./resolve-dish-lines";
import { guidedCookData } from "@/data/guided-cook-steps";
import { RECIPE_LINKS } from "@/data/ingredients/recipe-links";

describe("resolveDishLines", () => {
  it("resolves known ingredients to id + grams, drops unknowns", () => {
    const r = resolveDishLines([
      { name: "Olive oil", quantity: "2 tbsp" },
      { name: "Red lentils", quantity: "1 cup" },
      { name: "Unobtainium dust", quantity: "1 tsp" },
    ]);
    expect(r.originalLineCount).toBe(3);
    expect(r.lines.map((l) => l.ingredientId)).toEqual([
      "olive-oil",
      "red-lentils",
    ]);
    expect(r.unresolved).toEqual(["Unobtainium dust"]);
    expect(r.lines[0].grams).toBeGreaterThan(0);
  });

  it("flags an oil listed for frying as a frying medium", () => {
    const r = resolveDishLines([
      { name: "Vegetable oil for deep frying", quantity: "4 cups" },
    ]);
    expect(r.lines[0].fryingMedium).toBe(true);
  });

  it("does not flag a normal oil line", () => {
    const r = resolveDishLines([{ name: "Olive oil", quantity: "2 tbsp" }]);
    expect(r.lines[0].fryingMedium).toBeUndefined();
  });

  it("keeps a resolved-but-unmassed line at 0 g (e.g. 'to taste')", () => {
    const r = resolveDishLines([{ name: "Salt", quantity: "to taste" }]);
    expect(r.lines).toEqual([
      { ingredientId: "table-salt", grams: 0, isOptional: false },
    ]);
  });
});

describe("recipe-links drift guard", () => {
  // The committed link table must equal a fresh resolve of the source data.
  // Edit the registry aliases / guided-cook data / quantity logic without
  // re-running scripts/nutrition/resolve-dishes.mjs → this fails loudly.
  it("committed links match a fresh resolve of every dish", () => {
    for (const slug of Object.keys(guidedCookData)) {
      const fresh = resolveDishLines(guidedCookData[slug].ingredients ?? []);
      const committed = RECIPE_LINKS[slug];
      expect(committed, slug).toBeDefined();
      expect(committed.originalLineCount, slug).toBe(fresh.originalLineCount);
      expect(committed.lines, slug).toEqual(fresh.lines);
    }
  });
});
