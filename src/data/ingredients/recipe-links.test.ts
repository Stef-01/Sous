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

  // The cook page uses the LINK's servingsPerRecipe as the base for the serving
  // slider + diary log + ingredient scaling, while the NutrientSpotlight reads
  // the per-recipe nutrition SEED's per-serving macros. If the two disagree on
  // the serving base, those macros are keyed to a different yield than the
  // slider/diary — a single drink scaled ×4, or a per-fillet macro labelled as
  // a quarter-recipe. This guard keeps every dish that has BOTH a link and a
  // seed on one serving base. (Generalizes the single-serving-drinks regression
  // below; enabled once the 6 divergent dishes were reconciled.)
  it("link and seed agree on the serving base for every dish with both", () => {
    for (const [slug, link] of Object.entries(RECIPE_LINKS)) {
      const seed = getPerServingNutrition(slug);
      if (!seed) continue; // not every dish has a hand-authored nutrition seed
      expect(
        seed.servingsPerRecipe,
        `${slug}: link base ${link.servingsPerRecipe} ≠ seed base ${seed.servingsPerRecipe}`,
      ).toBe(link.servingsPerRecipe);
    }
  });

  // B1 regression — single-serving drinks. A single-glass smoothie that
  // inherits the side default (4) would open the slider at 4 and log 4 drinks.
  // The invariant above proves link == seed; this pins the absolute base to 1 so
  // a both-sides regression to 4 (override removed AND seed bumped) still fails.
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
