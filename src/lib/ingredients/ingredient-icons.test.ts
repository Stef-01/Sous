import { describe, expect, it } from "vitest";

import { guidedCookData } from "@/data/guided-cook-steps";
import {
  normalizeIngredientName,
  resolveIngredientIcon,
} from "./ingredient-icons";

describe("normalizeIngredientName", () => {
  it("removes quantities, units, punctuation, and preparation words", () => {
    expect(normalizeIngredientName("1 tsp sriracha")).toBe("sriracha");
    expect(
      normalizeIngredientName("150 g ground beef, 95% lean / 5% fat"),
    ).toBe("beef fat");
    expect(normalizeIngredientName("lemons, optional, squeeze")).toBe("lemons");
  });
});

describe("resolveIngredientIcon", () => {
  it("maps common ingredient-list examples to recognizable food families", () => {
    expect(resolveIngredientIcon("red chili flakes, pinch")).toMatchObject({
      label: "chile pepper",
      family: "spice",
    });
    expect(resolveIngredientIcon("1 tsp sriracha")).toMatchObject({
      label: "chile pepper",
      family: "spice",
    });
    expect(resolveIngredientIcon("lemons, optional, squeeze")).toMatchObject({
      label: "citrus",
      family: "fruit",
    });
    expect(
      resolveIngredientIcon(
        "1/2 tsp paprika, onion powder, garlic powder, chilli powder",
      ),
    ).toMatchObject({ label: "chile pepper", family: "spice" });
    expect(
      resolveIngredientIcon("150 g ground beef, 95% lean / 5% fat"),
    ).toMatchObject({
      label: "beef",
      family: "protein",
    });
    expect(resolveIngredientIcon("60 g avocados")).toMatchObject({
      label: "avocado",
      family: "vegetable",
    });
    expect(resolveIngredientIcon("200 g sweet potatoes")).toMatchObject({
      label: "sweet potato",
      family: "vegetable",
    });
    expect(
      resolveIngredientIcon("1 tbsp honey, for the hot honey"),
    ).toMatchObject({
      label: "honey",
      family: "sweetener",
    });
    expect(resolveIngredientIcon("1 tsp tomato puree")).toMatchObject({
      label: "tomato",
      family: "vegetable",
    });
    expect(resolveIngredientIcon("non-fat greek yogurt")).toMatchObject({
      label: "yogurt",
      family: "dairy",
    });
  });

  it("covers the current combined cook route ingredients", () => {
    expect(resolveIngredientIcon("boneless chicken thighs")).toMatchObject({
      label: "chicken",
      family: "protein",
    });
    expect(resolveIngredientIcon("garam masala")).toMatchObject({
      label: "salt and seasoning",
      family: "spice",
    });
    expect(resolveIngredientIcon("pita bread")).toMatchObject({
      label: "bread",
      family: "grain",
    });
    expect(resolveIngredientIcon("bulgur wheat")).toMatchObject({
      label: "grain or flour",
      family: "grain",
    });
    expect(
      resolveIngredientIcon("kasuri methi (dried fenugreek leaves)"),
    ).toMatchObject({
      label: "fresh herbs",
      family: "herb",
    });
    expect(resolveIngredientIcon("radishes")).toMatchObject({
      label: "carrot",
      family: "vegetable",
    });
    expect(resolveIngredientIcon("sumac")).toMatchObject({
      label: "salt and seasoning",
      family: "spice",
    });
  });

  it("prefers specific pantry liquids over broader food words", () => {
    expect(resolveIngredientIcon("rice vinegar")).toMatchObject({
      label: "sauce or vinegar",
      family: "sauce",
    });
    expect(resolveIngredientIcon("chicken or vegetable broth")).toMatchObject({
      label: "stock or broth",
      family: "pantry",
    });
  });

  it("returns a stable fallback for unknown ingredients", () => {
    expect(resolveIngredientIcon("mystery pantry pebble")).toEqual({
      emoji: "\u{1F37D}\uFE0F",
      label: "ingredient",
      family: "unknown",
    });
  });

  it("covers every guided-cook ingredient with a non-generic icon", () => {
    const unknowns = Object.values(guidedCookData).flatMap((dish) =>
      dish.ingredients
        .filter(
          (ingredient) =>
            resolveIngredientIcon(ingredient.name).family === "unknown",
        )
        .map((ingredient) => `${dish.slug}: ${ingredient.name}`),
    );

    expect(unknowns).toEqual([]);
  });
});
