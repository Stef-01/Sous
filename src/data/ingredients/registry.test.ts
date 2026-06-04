import { describe, expect, it } from "vitest";
import {
  INGREDIENT_LIST,
  getIngredient,
  resolveIngredientByName,
} from "./index";

describe("ingredient registry (real USDA SR Legacy data)", () => {
  it("every ingredient is USDA-mapped with an fdcId", () => {
    expect(INGREDIENT_LIST.length).toBeGreaterThanOrEqual(20);
    for (const ing of INGREDIENT_LIST) {
      expect(ing.fdcId, ing.id).toBeTypeOf("number");
      expect(ing.provenance).toBe("usda-fdc");
      expect(ing.confidence).toBe("mapped");
      expect(ing.fdcDataType).toBe("sr-legacy");
    }
  });

  it("carries real per-100g values (sanity spot-checks)", () => {
    const lentils = getIngredient("red-lentils")!;
    expect(lentils.per100g.calories).toBeCloseTo(352, 0);
    expect(lentils.per100g.fiber_g).toBeCloseTo(10.7, 1);

    const oil = getIngredient("olive-oil")!;
    expect(oil.per100g.calories).toBeCloseTo(884, 0);

    const salmon = getIngredient("salmon")!;
    expect(salmon.per100g.omega3_g).toBeGreaterThan(1); // oily fish
  });

  it("encodes claim-neutral food identity", () => {
    const lentils = getIngredient("red-lentils")!;
    expect(lentils.foodGroup).toBe("legume");
    expect(lentils.therapeuticClasses).toContain("soluble-fiber");

    expect(getIngredient("salmon")!.therapeuticClasses).toContain("oily-fish");
    expect(getIngredient("white-rice")!.therapeuticClasses).toContain(
      "refined-grain",
    );
  });

  it("resolves names + aliases to canonical ids (the substring fix)", () => {
    // THE headline case: "Masoor Dal" now resolves to red-lentils → legume.
    expect(resolveIngredientByName("Masoor Dal")).toBe("red-lentils");
    expect(resolveIngredientByName("masoor")).toBe("red-lentils");
    expect(resolveIngredientByName("Olive oil")).toBe("olive-oil");
    expect(resolveIngredientByName("2 cloves garlic, minced")).toBe("garlic");
    expect(resolveIngredientByName("Baby spinach")).toBe("spinach");
  });

  it("returns null for an unknown ingredient (never guesses)", () => {
    expect(resolveIngredientByName("unobtainium")).toBeNull();
    expect(resolveIngredientByName("")).toBeNull();
  });
});
