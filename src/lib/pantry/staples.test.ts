import { describe, it, expect } from "vitest";
import { isStaple, countMissingNonStaple, prioritizeByPantry } from "./staples";

describe("isStaple", () => {
  it("treats staples as staples, including whole words + phrases", () => {
    expect(isStaple("salt")).toBe(true);
    expect(isStaple("Kosher Salt")).toBe(true); // whole-word match
    expect(isStaple("Olive oil, divided")).toBe(true); // phrase + descriptor
    expect(isStaple("garlic powder")).toBe(true);
    expect(isStaple("cumin")).toBe(true);
    expect(isStaple("water")).toBe(true);
    expect(isStaple("butter")).toBe(true);
  });

  it("does not treat real shopping ingredients as staples", () => {
    expect(isStaple("chicken breast")).toBe(false);
    expect(isStaple("broccoli")).toBe(false);
    expect(isStaple("salted caramel")).toBe(false); // "salted" is not "salt"
    expect(isStaple("")).toBe(false);
  });
});

describe("countMissingNonStaple", () => {
  it("ignores staples and pantry items", () => {
    const pantry = new Set(["chicken breast"]);
    const ingredients = [
      "chicken breast", // in pantry
      "salt", // staple
      "olive oil", // staple
      "broccoli", // MISSING
      "lemon", // MISSING
    ];
    expect(countMissingNonStaple(ingredients, pantry)).toBe(2);
  });

  it("is 0 when everything is a staple or in the pantry", () => {
    expect(countMissingNonStaple(["salt", "water", "butter"], new Set())).toBe(
      0,
    );
  });
});

describe("prioritizeByPantry", () => {
  const d = (slug: string, ingredientNames: string[]) => ({
    slug,
    ingredientNames,
  });

  it("floats makeable dishes (fewest missing) above the rest, stably", () => {
    const pantry = new Set(["chicken breast", "rice"]);
    const dishes = [
      d("a", ["chicken breast", "rice", "saffron", "peas", "stock"]), // missing 3
      d("b", ["chicken breast", "salt"]), // missing 0
      d("c", ["rice", "soy sauce"]), // missing 0 (soy sauce is a staple)
      d("noinfo", []), // unknown → beyond
    ];
    const out = prioritizeByPantry(dishes, pantry, 2).map((x) => x.slug);
    expect(out).toEqual(["b", "c", "a", "noinfo"]);
  });

  it("never promotes a dish with no known ingredient list", () => {
    const out = prioritizeByPantry(
      [d("x", []), d("y", ["salt"])],
      new Set(),
      5,
    ).map((x) => x.slug);
    expect(out).toEqual(["y", "x"]);
  });
});
