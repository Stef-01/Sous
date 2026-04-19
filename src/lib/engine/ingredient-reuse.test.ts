import { describe, it, expect } from "vitest";
import { matchIngredientReuse, REUSE_WINDOW_MS } from "./ingredient-reuse";

const NOW = Date.UTC(2026, 3, 17, 19, 0, 0);

describe("matchIngredientReuse", () => {
  it("returns null when no overlap exists", () => {
    const hint = matchIngredientReuse({
      currentIngredientNames: ["cilantro", "lime"],
      pastSessions: [
        {
          slug: "butter-chicken",
          dishName: "Butter Chicken",
          completedAt: NOW - 24 * 60 * 60 * 1000,
          ingredients: new Set(["chicken", "tomato", "cream"]),
        },
      ],
      now: NOW,
    });
    expect(hint).toBeNull();
  });

  it("skips staple overlaps like salt or oil", () => {
    const hint = matchIngredientReuse({
      currentIngredientNames: ["salt", "olive oil", "garlic"],
      pastSessions: [
        {
          slug: "pasta",
          dishName: "Pasta",
          completedAt: NOW - 24 * 60 * 60 * 1000,
          ingredients: new Set(["salt", "olive oil"]),
        },
      ],
      now: NOW,
    });
    expect(hint).toBeNull();
  });

  it("surfaces the newest session's non-staple overlap", () => {
    const hint = matchIngredientReuse({
      currentIngredientNames: ["cilantro", "lime", "chicken"],
      pastSessions: [
        {
          slug: "tacos",
          dishName: "Chicken Tacos",
          completedAt: NOW - 24 * 60 * 60 * 1000,
          ingredients: new Set(["chicken", "cilantro", "lime"]),
        },
        {
          slug: "pasta",
          dishName: "Pasta",
          completedAt: NOW - 72 * 60 * 60 * 1000,
          ingredients: new Set(["chicken"]),
        },
      ],
      now: NOW,
    });
    expect(hint).not.toBeNull();
    expect(hint!.fromDishSlug).toBe("tacos");
    // Alphabetical tiebreak: "chicken" < "cilantro" < "lime"
    expect(hint!.ingredient).toBe("chicken");
    expect(hint!.text.toLowerCase()).toContain("chicken");
    expect(hint!.text.toLowerCase()).toContain("yesterday");
    expect(hint!.text.toLowerCase()).toContain("chicken tacos");
  });

  it("ignores sessions older than the reuse window", () => {
    const hint = matchIngredientReuse({
      currentIngredientNames: ["cilantro"],
      pastSessions: [
        {
          slug: "tacos",
          dishName: "Tacos",
          completedAt: NOW - REUSE_WINDOW_MS - 60_000,
          ingredients: new Set(["cilantro"]),
        },
      ],
      now: NOW,
    });
    expect(hint).toBeNull();
  });

  it("is deterministic  -  same input yields same output", () => {
    const input = {
      currentIngredientNames: ["cilantro", "lime"],
      pastSessions: [
        {
          slug: "tacos",
          dishName: "Tacos",
          completedAt: NOW - 48 * 60 * 60 * 1000,
          ingredients: new Set(["cilantro", "lime"]),
        },
      ],
      now: NOW,
    };
    const a = matchIngredientReuse(input);
    const b = matchIngredientReuse({
      ...input,
      pastSessions: [...input.pastSessions],
    });
    expect(a).toEqual(b);
  });
});
