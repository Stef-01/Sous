import { describe, expect, it } from "vitest";
import { dietaryDisplay } from "./dietary-display";

describe("dietaryDisplay", () => {
  it("shows nothing without an ingredient list (never guesses)", () => {
    const d = dietaryDisplay({ tags: [], ingredients: [] });
    expect(d.diets).toEqual([]);
    expect(d.mayContain).toEqual([]);
  });

  it("surfaces Vegan from a clean ingredient list, deduping Vegetarian", () => {
    const d = dietaryDisplay({
      tags: [],
      ingredients: ["avocado", "lime", "cilantro", "salt", "onion"],
    });
    expect(d.diets).toContain("Vegan");
    expect(d.diets).not.toContain("Vegetarian"); // vegan already implies it
  });

  it("NEVER shows a positive gluten-free or dairy-free pill (safety)", () => {
    const clean = dietaryDisplay({ tags: [], ingredients: ["rice", "water"] });
    expect(clean.diets.join(" ")).not.toMatch(/gluten|dairy/i);
  });

  it("warns 'may contain' when a violation ingredient is present", () => {
    const d = dietaryDisplay({
      tags: [],
      ingredients: ["wheat flour", "milk", "shrimp paste", "peanuts"],
    });
    expect(d.mayContain).toContain("gluten");
    expect(d.mayContain).toContain("dairy");
    expect(d.mayContain).toContain("shellfish");
    expect(d.mayContain).toContain("nuts");
    // animal ingredients ⇒ not vegan
    expect(d.diets).not.toContain("Vegan");
  });
});
