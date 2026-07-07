import { describe, expect, it } from "vitest";
import {
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
