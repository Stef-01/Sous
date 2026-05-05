import { describe, expect, it } from "vitest";
import { dishToFacets } from "./dish-to-facets";

describe("dishToFacets", () => {
  it("returns empty-but-valid facets when input is empty", () => {
    expect(dishToFacets({})).toEqual({
      cuisine: "",
      flavors: [],
      proteins: [],
      dishClass: "",
      ingredients: [],
    });
  });

  it("lowercases cuisine + tags + ingredients", () => {
    const f = dishToFacets({
      cuisineFamily: "Italian",
      tags: ["Spicy", "Chicken", "Pasta"],
      ingredients: ["Olive Oil", "Tomato"],
    });
    expect(f.cuisine).toBe("italian");
    expect(f.flavors).toContain("spicy");
    expect(f.proteins).toContain("chicken");
    expect(f.dishClass).toBe("pasta");
    expect(f.ingredients).toEqual(["olive oil", "tomato"]);
  });

  it("classifies tags into flavor / protein / dishClass axes", () => {
    const f = dishToFacets({
      cuisineFamily: "indian",
      tags: ["umami", "lentils", "curry", "spicy"],
    });
    expect(f.flavors.sort()).toEqual(["spicy", "umami"]);
    expect(f.proteins).toEqual(["lentils"]);
    expect(f.dishClass).toBe("curry");
  });

  it("dedupes per axis", () => {
    const f = dishToFacets({
      tags: ["spicy", "spicy", "Spicy"],
      ingredients: ["garlic", "garlic"],
    });
    expect(f.flavors).toEqual(["spicy"]);
    expect(f.ingredients).toEqual(["garlic"]);
  });

  it("respects an explicit dishClass override", () => {
    const f = dishToFacets({
      tags: ["pasta", "noodles"],
      dishClass: "bowl",
    });
    expect(f.dishClass).toBe("bowl");
  });

  it("ignores unknown tags rather than crashing", () => {
    const f = dishToFacets({
      tags: ["nonsense", "blue", "spicy"],
    });
    expect(f.flavors).toEqual(["spicy"]);
    expect(f.proteins).toEqual([]);
    expect(f.dishClass).toBe("");
  });

  it("handles null/undefined inputs gracefully", () => {
    const f = dishToFacets({
      cuisineFamily: null,
      tags: null,
      ingredients: null,
    });
    expect(f.cuisine).toBe("");
    expect(f.flavors).toEqual([]);
    expect(f.ingredients).toEqual([]);
  });
});
