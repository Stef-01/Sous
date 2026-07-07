import { describe, expect, it } from "vitest";
import { buildGrabShoppingAdditions } from "./grab-additions";

describe("buildGrabShoppingAdditions", () => {
  it("keeps unchecked ingredient names and quantities", () => {
    const result = buildGrabShoppingAdditions({
      sections: [
        {
          ingredients: [
            { id: "rice", name: "jasmine rice", quantity: "200 g" },
            { id: "salt", name: "salt", quantity: "pinch" },
          ],
        },
      ],
      checkedIds: new Set(["salt"]),
    });

    expect(result).toEqual([{ name: "jasmine rice", quantity: "200 g" }]);
  });

  it("preserves per-section recipe source metadata for combined cooks", () => {
    const result = buildGrabShoppingAdditions({
      sections: [
        {
          sourceRecipeSlug: "butter-chicken",
          sourceRecipeName: "Butter Chicken",
          ingredients: [{ id: "cream", name: "cream", quantity: "100 ml" }],
        },
        {
          sourceRecipeSlug: "tabbouleh",
          sourceRecipeName: "Tabbouleh",
          ingredients: [{ id: "parsley", name: "parsley", quantity: "40 g" }],
        },
      ],
      checkedIds: new Set(),
      fallbackRecipeSlug: "combined",
      fallbackRecipeName: "Combined Cook",
    });

    expect(result).toEqual([
      {
        name: "cream",
        quantity: "100 ml",
        sourceRecipeSlug: "butter-chicken",
        sourceRecipeName: "Butter Chicken",
      },
      {
        name: "parsley",
        quantity: "40 g",
        sourceRecipeSlug: "tabbouleh",
        sourceRecipeName: "Tabbouleh",
      },
    ]);
  });

  it("falls back to the current recipe source for single-dish sections", () => {
    const result = buildGrabShoppingAdditions({
      sections: [
        {
          ingredients: [
            { id: "tomato", name: "tomatoes", quantity: "2 medium" },
          ],
        },
      ],
      checkedIds: new Set(),
      fallbackRecipeSlug: "pasta",
      fallbackRecipeName: "Tomato Pasta",
    });

    expect(result).toEqual([
      {
        name: "tomatoes",
        quantity: "2 medium",
        sourceRecipeSlug: "pasta",
        sourceRecipeName: "Tomato Pasta",
      },
    ]);
  });

  it("omits blank rows and trims copied source text", () => {
    const result = buildGrabShoppingAdditions({
      sections: [
        {
          sourceRecipeSlug: "  tacos  ",
          sourceRecipeName: "  Tacos  ",
          ingredients: [
            { id: "blank", name: "   ", quantity: "1 cup" },
            { id: "onion", name: "  onion  ", quantity: " 1/2 cup " },
          ],
        },
      ],
      checkedIds: new Set(),
    });

    expect(result).toEqual([
      {
        name: "onion",
        quantity: "1/2 cup",
        sourceRecipeSlug: "tacos",
        sourceRecipeName: "Tacos",
      },
    ]);
  });
});
