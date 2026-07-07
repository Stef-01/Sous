import { describe, expect, it } from "vitest";
import {
  removeRecipeSourceFromShoppingItem,
  shoppingContributionForSource,
  shoppingItemHasRecipeSource,
  shoppingRecipeSourceSlugs,
} from "./recipe-sources";

describe("shoppingRecipeSourceSlugs", () => {
  it("returns primary source recipe slugs in first-seen order", () => {
    expect(
      shoppingRecipeSourceSlugs([
        { sourceRecipeSlug: "butter-chicken" },
        { sourceRecipeSlug: "tabbouleh" },
        { sourceRecipeSlug: "butter-chicken" },
      ]),
    ).toEqual(["butter-chicken", "tabbouleh"]);
  });

  it("includes merged contributors so recipe chips do not disappear", () => {
    expect(
      shoppingRecipeSourceSlugs([
        {
          sourceRecipeSlug: "butter-chicken",
          contributedBy: ["butter-chicken", "tabbouleh"],
        },
        {
          sourceRecipeSlug: "fattoush",
          contributedBy: ["fattoush", "tabbouleh", "pico-de-gallo"],
        },
      ]),
    ).toEqual(["butter-chicken", "tabbouleh", "fattoush", "pico-de-gallo"]);
  });

  it("trims slugs and skips blank source values", () => {
    expect(
      shoppingRecipeSourceSlugs([
        { sourceRecipeSlug: "  " },
        { sourceRecipeSlug: "  masoor-dal  ", contributedBy: ["", " naan "] },
      ]),
    ).toEqual(["masoor-dal", "naan"]);
  });
});

describe("shoppingItemHasRecipeSource", () => {
  it("matches both primary and merged recipe contributors", () => {
    const item = {
      sourceRecipeSlug: "butter-chicken",
      contributedBy: ["butter-chicken", "tabbouleh"],
    };

    expect(shoppingItemHasRecipeSource(item, "butter-chicken")).toBe(true);
    expect(shoppingItemHasRecipeSource(item, "tabbouleh")).toBe(true);
    expect(shoppingItemHasRecipeSource(item, "fattoush")).toBe(false);
  });
});

describe("shoppingContributionForSource", () => {
  it("trims source metadata and ignores entries without a recipe slug", () => {
    expect(
      shoppingContributionForSource({
        sourceRecipeSlug: "  tabbouleh  ",
        sourceRecipeName: "  Tabbouleh  ",
        quantity: " 40 g ",
      }),
    ).toEqual({
      sourceRecipeSlug: "tabbouleh",
      sourceRecipeName: "Tabbouleh",
      quantity: "40 g",
    });

    expect(shoppingContributionForSource({ sourceRecipeSlug: " " })).toBeNull();
  });
});

describe("removeRecipeSourceFromShoppingItem", () => {
  it("removes rows that only belong to the removed recipe", () => {
    expect(
      removeRecipeSourceFromShoppingItem(
        {
          key: "cream",
          name: "cream",
          quantity: "100 ml",
          sourceRecipeSlug: "butter-chicken",
          contributedBy: ["butter-chicken"],
        },
        "butter-chicken",
      ),
    ).toBeNull();
  });

  it("keeps shared rows and recalculates quantity from concrete contributions", () => {
    const result = removeRecipeSourceFromShoppingItem(
      {
        key: "sugar",
        name: "sugar",
        quantity: "≈ 92 g",
        sourceRecipeSlug: "brownies",
        sourceRecipeName: "Brownies",
        contributedBy: ["brownies", "pancakes"],
        contributions: [
          {
            sourceRecipeSlug: "brownies",
            sourceRecipeName: "Brownies",
            quantity: "2 tablespoons",
          },
          {
            sourceRecipeSlug: "pancakes",
            sourceRecipeName: "Pancakes",
            quantity: "1/3 cup",
          },
        ],
      },
      "pancakes",
    );

    expect(result).toMatchObject({
      quantity: "2 tablespoons",
      sourceRecipeSlug: "brownies",
      sourceRecipeName: "Brownies",
      contributedBy: ["brownies"],
      contributions: [
        {
          sourceRecipeSlug: "brownies",
          sourceRecipeName: "Brownies",
          quantity: "2 tablespoons",
        },
      ],
    });
  });

  it("keeps legacy shared rows when per-recipe quantities are unavailable", () => {
    const result = removeRecipeSourceFromShoppingItem(
      {
        key: "parsley",
        name: "parsley",
        quantity: "40 g + 20 g",
        sourceRecipeSlug: "tabbouleh",
        contributedBy: ["tabbouleh", "fattoush"],
      },
      "fattoush",
    );

    expect(result).toMatchObject({
      quantity: "40 g + 20 g",
      sourceRecipeSlug: "tabbouleh",
      contributedBy: ["tabbouleh"],
    });
  });

  it("preserves displayed quantity for partially ledgered migrated rows", () => {
    const result = removeRecipeSourceFromShoppingItem(
      {
        key: "tomatoes",
        name: "tomatoes",
        quantity: "300 g + 1 cup",
        sourceRecipeSlug: "tabbouleh",
        contributedBy: ["tabbouleh", "fattoush", "pico-de-gallo"],
        contributions: [
          {
            sourceRecipeSlug: "pico-de-gallo",
            sourceRecipeName: "Pico de gallo",
            quantity: "1 cup",
          },
        ],
      },
      "tabbouleh",
    );

    expect(result).toMatchObject({
      quantity: "300 g + 1 cup",
      sourceRecipeSlug: "fattoush",
      contributedBy: ["fattoush", "pico-de-gallo"],
      contributions: [
        {
          sourceRecipeSlug: "pico-de-gallo",
          sourceRecipeName: "Pico de gallo",
          quantity: "1 cup",
        },
      ],
    });
  });
});
