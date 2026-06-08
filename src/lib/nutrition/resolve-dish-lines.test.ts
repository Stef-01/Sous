import { describe, expect, it } from "vitest";
import { resolveDishLines } from "./resolve-dish-lines";
import { guidedCookData, guidedCookMeals } from "@/data/guided-cook-steps";
import { MEAL_INGREDIENTS } from "@/data/meal-ingredients";
import { SIDE_INGREDIENTS } from "@/data/side-ingredients";
import { sideServings } from "@/data/dish-servings";
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

  it("drops a negligible 'to taste' line and excludes it from coverage", () => {
    // A "to taste" pinch is intentionally massless — not a data gap. It is
    // dropped (no nutrition) AND removed from the coverage denominator, so a
    // garnish never penalises a dish whose real ingredients all resolved.
    const r = resolveDishLines([
      { name: "Chicken breast", quantity: "200 g" },
      { name: "Salt", quantity: "to taste" },
    ]);
    expect(r.lines).toEqual([
      { ingredientId: "chicken-breast", grams: 200, isOptional: false },
    ]);
    expect(r.originalLineCount).toBe(1); // the salt line is excluded
  });

  it("resolves '1 can' to a standard can mass (400 g)", () => {
    const r = resolveDishLines([{ name: "Black beans", quantity: "1 can" }]);
    expect(r.lines[0]?.grams).toBe(400);
  });
});

describe("recipe-links drift guard", () => {
  // The committed link table must equal a fresh resolve of the source data.
  // Edit the registry aliases / guided-cook data / quantity logic without
  // re-running scripts/nutrition/resolve-dishes.mjs → this fails loudly.
  it("committed links match a fresh resolve of every guided-cook dish", () => {
    for (const slug of Object.keys(guidedCookData)) {
      const fresh = resolveDishLines(guidedCookData[slug].ingredients ?? []);
      const committed = RECIPE_LINKS[slug];
      expect(committed, slug).toBeDefined();
      expect(committed.originalLineCount, slug).toBe(fresh.originalLineCount);
      expect(committed.lines, slug).toEqual(fresh.lines);
    }
  });

  it("committed links match a fresh resolve of every meal exemplar", () => {
    for (const slug of Object.keys(MEAL_INGREDIENTS)) {
      const meal = MEAL_INGREDIENTS[slug];
      const fresh = resolveDishLines(meal.ingredients);
      const committed = RECIPE_LINKS[slug];
      expect(committed, slug).toBeDefined();
      expect(committed.servingsPerRecipe, slug).toBe(meal.servings);
      expect(committed.lines, slug).toEqual(fresh.lines);
    }
  });

  it("committed links match a fresh resolve of every catalogue side", () => {
    for (const slug of Object.keys(SIDE_INGREDIENTS)) {
      if (guidedCookData[slug]) continue; // a cook flow wins in resolve-dishes
      const side = SIDE_INGREDIENTS[slug];
      const fresh = resolveDishLines(side.ingredients);
      const committed = RECIPE_LINKS[slug];
      expect(committed, slug).toBeDefined();
      expect(committed.servingsPerRecipe, slug).toBe(side.servings);
      expect(committed.lines, slug).toEqual(fresh.lines);
    }
  });

  it("committed links match a fresh resolve of every guided-cook meal", () => {
    for (const slug of Object.keys(guidedCookMeals)) {
      if (MEAL_INGREDIENTS[slug]) continue; // the curated exemplar wins
      const fresh = resolveDishLines(guidedCookMeals[slug].ingredients ?? []);
      const committed = RECIPE_LINKS[slug];
      expect(committed, slug).toBeDefined();
      expect(committed.servingsPerRecipe, slug).toBe(sideServings(slug));
      expect(committed.lines, slug).toEqual(fresh.lines);
    }
  });
});
