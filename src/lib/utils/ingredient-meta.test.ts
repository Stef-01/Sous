import { describe, expect, it } from "vitest";
import {
  ingredientCategory,
  ingredientEmoji,
  GROCERY_CATEGORY_ORDER,
  type GroceryCategory,
} from "./ingredient-meta";

describe("ingredientCategory", () => {
  it("classifies representative items into the right aisle", () => {
    const cases: [string, GroceryCategory][] = [
      ["Roma tomato", "Produce"],
      ["mango", "Produce"],
      ["chicken breast", "Meat & Seafood"],
      ["wild salmon", "Meat & Seafood"],
      ["firm tofu", "Meat & Seafood"],
      ["large eggs", "Dairy & Eggs"],
      ["whole milk", "Dairy & Eggs"],
      ["sourdough bread", "Bakery"],
      ["jasmine rice", "Pantry"],
      ["olive oil", "Pantry"],
      ["dark chocolate", "Pantry"],
      ["ground cumin", "Spices & Herbs"],
      ["kosher salt", "Spices & Herbs"],
    ];
    for (const [name, cat] of cases) {
      expect(ingredientCategory(name), name).toBe(cat);
    }
  });

  it("files spice powders under Spices, not Produce (order-bug regression)", () => {
    for (const p of [
      "garlic powder",
      "onion powder",
      "chili powder",
      "chili flakes",
      "ground ginger",
    ]) {
      expect(ingredientCategory(p), p).toBe("Spices & Herbs");
    }
    // the FRESH forms stay Produce.
    expect(ingredientCategory("garlic")).toBe("Produce");
    expect(ingredientCategory("fresh ginger")).toBe("Produce");
  });

  it("resolves substring collisions by rule order", () => {
    expect(ingredientCategory("peanut butter")).toBe("Pantry"); // not peas→Produce
    expect(ingredientCategory("frozen peas")).toBe("Produce");
    expect(ingredientCategory("watermelon")).toBe("Produce"); // not water→Pantry
    expect(ingredientCategory("water")).toBe("Pantry");
    expect(ingredientCategory("almond milk")).toBe("Dairy & Eggs"); // milk beats almond
    expect(ingredientCategory("cornstarch")).toBe("Pantry"); // not corn→Produce
    expect(ingredientCategory("grapeseed oil")).toBe("Pantry"); // oil beats grape
  });

  it("falls back to Other for unknown / empty names", () => {
    expect(ingredientCategory("xyzzy")).toBe("Other");
    expect(ingredientCategory("")).toBe("Other");
  });

  it("normalizes case + surrounding whitespace", () => {
    expect(ingredientCategory("  CHICKEN  ")).toBe("Meat & Seafood");
  });
});

describe("ingredientEmoji", () => {
  it("returns the item-specific emoji when a rule matches", () => {
    expect(ingredientEmoji("mango")).toBe("🥭");
    expect(ingredientEmoji("garlic powder")).toBe("🧄");
    expect(ingredientEmoji("dark chocolate")).toBe("🍫");
    expect(ingredientEmoji("kosher salt")).toBe("🧂");
  });

  it("falls back to the basket emoji for unknown items", () => {
    expect(ingredientEmoji("xyzzy")).toBe("🧺");
  });
});

describe("GROCERY_CATEGORY_ORDER", () => {
  it("is Produce-first, Other-last, with no duplicates", () => {
    expect(GROCERY_CATEGORY_ORDER[0]).toBe("Produce");
    expect(GROCERY_CATEGORY_ORDER.at(-1)).toBe("Other");
    expect(new Set(GROCERY_CATEGORY_ORDER).size).toBe(
      GROCERY_CATEGORY_ORDER.length,
    );
  });
});
