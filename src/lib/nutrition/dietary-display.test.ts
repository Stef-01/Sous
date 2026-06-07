import { describe, expect, it } from "vitest";
import { dietaryDisplay } from "./dietary-display";

describe("dietaryDisplay", () => {
  it("surfaces positive diet compatibilities, deduping vegan→vegetarian", () => {
    const d = dietaryDisplay({
      tags: ["vegan"],
      description: "A fresh salad.",
    });
    expect(d.diets).toContain("Vegan");
    expect(d.diets).not.toContain("Vegetarian"); // vegan already implies it
  });

  it("warns 'may contain nuts' only when a nut term is detected", () => {
    const withNuts = dietaryDisplay({
      tags: [],
      description: "Tossed with toasted almonds and a handful of walnuts.",
    });
    expect(withNuts.mayContain).toContain("nuts");

    const noNuts = dietaryDisplay({
      tags: [],
      description: "A simple green salad with lemon.",
    });
    expect(noNuts.mayContain).not.toContain("nuts");
  });

  it("never asserts a dish is nut/shellfish FREE (warnings are the only channel)", () => {
    const d = dietaryDisplay({
      tags: [],
      description: "A simple green salad with lemon.",
    });
    // The positive diet pills must never include an allergen-free safety claim.
    expect(d.diets.join(" ")).not.toMatch(/nut|shellfish/i);
  });
});
