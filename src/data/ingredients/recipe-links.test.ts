import { describe, expect, it } from "vitest";
import { RECIPE_LINKS } from "./recipe-links";
import { INGREDIENTS } from "./index";
import { getPerServingNutrition } from "@/data/nutrition/per-recipe";

const links = Object.values(RECIPE_LINKS);
const allLines = links.flatMap((l) => l.lines);

describe("recipe ingredient links", () => {
  it("covers the guided-cook dishes", () => {
    expect(links.length).toBeGreaterThanOrEqual(100);
  });

  it("every resolved line points at a real registry ingredient (drift guard)", () => {
    for (const line of allLines) {
      expect(INGREDIENTS[line.ingredientId], line.ingredientId).toBeDefined();
    }
  });

  it("every link has a positive serving count", () => {
    for (const l of links) expect(l.servingsPerRecipe).toBeGreaterThan(0);
  });

  // Coverage ratchet — raise the floor as the registry grows; never let it
  // regress. 22 ingredients → ~290 lines; 106 ingredients → ~844 lines.
  it("meets the resolved-line coverage floor", () => {
    expect(allLines.length).toBeGreaterThanOrEqual(840);
  });

  it("fully resolves (every line massed) a meaningful share of dishes", () => {
    const full = Object.values(RECIPE_LINKS).filter(
      (l) => l.lines.length > 0 && l.lines.every((x) => x.grams > 0),
    );
    expect(full.length).toBeGreaterThanOrEqual(28);
  });

  // B1 regression — single-serving drinks. The cook page uses the LINK's
  // servingsPerRecipe as the base for the serving slider + diary log + scaling.
  // A single-glass smoothie that inherits the side default (4) would open the
  // slider at 4 and log 4 drinks. Each single-serving recipe needs a
  // DISH_SERVINGS override so its link base is 1 and matches its nutrition seed.
  it("single-serving drinks have a serving base of 1 (link and seed)", () => {
    const SINGLE_SERVING = [
      "turmeric-crush-smoothie",
      "coconut-cloud-smoothie",
    ];
    for (const slug of SINGLE_SERVING) {
      expect(RECIPE_LINKS[slug]?.servingsPerRecipe, `${slug} link`).toBe(1);
      expect(
        getPerServingNutrition(slug)?.servingsPerRecipe,
        `${slug} seed`,
      ).toBe(1);
    }
  });
});
