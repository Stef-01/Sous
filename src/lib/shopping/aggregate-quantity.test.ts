import { describe, expect, it } from "vitest";
import { canonicalIngredientId, combineQuantities } from "./aggregate-quantity";

describe("canonicalIngredientId", () => {
  it("resolves aliases to one id (the reference mockup's failure case)", () => {
    expect(canonicalIngredientId("granulated sugar")).toBe("sugar");
    expect(canonicalIngredientId("sugar")).toBe("sugar");
    expect(canonicalIngredientId("all-purpose flour")).toBe(
      canonicalIngredientId("flour"),
    );
  });

  it("returns null for names outside the registry (no merge — honest rows)", () => {
    expect(canonicalIngredientId("fresh strawberries")).toBeNull();
    expect(canonicalIngredientId("xyzzy")).toBeNull();
  });
});

describe("combineQuantities", () => {
  it("masses both sides via the registry: 2 tbsp + ⅓ cup sugar ≈ 92 g", () => {
    expect(combineQuantities("2 tablespoons", "1/3 cup", "sugar")).toBe(
      "≈ 92 g",
    );
  });

  it("sums bare counts (eggs): 2 + 4 → 6", () => {
    expect(combineQuantities("2", "4", "egg")).toBe("6");
  });

  it("joins honestly when a side cannot be massed", () => {
    expect(combineQuantities("2 cups", "a pinch", "sugar")).toBe(
      "2 cups + a pinch",
    );
  });

  it("missing sides: the present quantity wins; both missing → undefined", () => {
    expect(combineQuantities(undefined, "1 cup", "sugar")).toBe("1 cup");
    expect(combineQuantities("1 cup", undefined, "sugar")).toBe("1 cup");
    expect(combineQuantities(undefined, undefined, "sugar")).toBeUndefined();
  });
});
