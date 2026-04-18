import { describe, it, expect } from "vitest";
import { coalescePrepList, normalizePrepName } from "./prep-list";
import type { StaticDishData } from "@/data/guided-cook-steps";

function dish(
  name: string,
  ingredients: { id: string; name: string; quantity: string }[],
  steps: string[],
): StaticDishData {
  return {
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    description: "",
    cuisineFamily: "italian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: [],
    temperature: "hot",
    ingredients: ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      isOptional: false,
      substitution: null,
    })),
    steps: steps.map((instruction, idx) => ({
      phase: "cook",
      stepNumber: idx + 1,
      instruction,
      timerSeconds: null,
      mistakeWarning: null,
      quickHack: null,
      cuisineFact: null,
      donenessCue: null,
      imageUrl: null,
    })),
  };
}

describe("normalizePrepName", () => {
  it("strips descriptor words", () => {
    expect(normalizePrepName("Fresh Large Tomatoes")).toBe("tomatoes");
    expect(normalizePrepName("Diced red onion")).toBe("red onion");
  });

  it("is stable for distinct produce", () => {
    expect(normalizePrepName("Red Onion")).not.toBe(
      normalizePrepName("White Onion"),
    );
  });
});

describe("coalescePrepList", () => {
  it("merges duplicate ingredients across dishes", () => {
    const main = dish(
      "Carbonara",
      [
        { id: "c1", name: "Garlic", quantity: "2 cloves" },
        { id: "c2", name: "Pasta", quantity: "1 lb" },
      ],
      ["Mince the garlic.", "Boil the pasta in salted water."],
    );
    const side = dish(
      "Garlic Bread",
      [
        { id: "g1", name: "Garlic", quantity: "3 cloves" },
        { id: "g2", name: "Butter", quantity: "1/4 cup" },
      ],
      ["Chop the garlic.", "Spread butter and bake."],
    );

    const groups = coalescePrepList([main, side]);
    const allItems = groups.flatMap((g) => g.items);
    const garlic = allItems.find((i) =>
      i.name.toLowerCase().includes("garlic"),
    );
    expect(garlic).toBeDefined();
    expect(garlic?.sources).toHaveLength(2);
    expect(garlic?.quantity).toContain("2 cloves");
    expect(garlic?.quantity).toContain("3 cloves");
  });

  it("classifies stove, cutting board, and oven correctly", () => {
    const d = dish(
      "Roasted Veg",
      [
        { id: "r1", name: "Carrots", quantity: "3" },
        { id: "r2", name: "Onion", quantity: "1" },
        { id: "r3", name: "Broth", quantity: "2 cups" },
      ],
      [
        "Chop the carrots into coins.",
        "Dice the onion.",
        "Roast everything in the oven at 400°F.",
        "Simmer the broth on the stove.",
      ],
    );

    const groups = coalescePrepList([d]);
    const findItem = (name: string) =>
      groups.flatMap((g) => g.items).find((i) => i.name.includes(name));
    expect(findItem("Carrots")?.station).toBe("cutting-board");
    expect(findItem("Onion")?.station).toBe("cutting-board");
    expect(findItem("Broth")?.station).toBe("stove");
  });

  it("returns groups in a deterministic order and only populated ones", () => {
    const d = dish(
      "Salad",
      [{ id: "s1", name: "Lettuce", quantity: "1 head" }],
      ["Tear the lettuce into pieces."],
    );
    const groups = coalescePrepList([d]);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.every((g) => g.items.length > 0)).toBe(true);
  });
});
