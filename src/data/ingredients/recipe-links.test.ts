import { describe, expect, it } from "vitest";
import { RECIPE_LINKS } from "./recipe-links";
import { INGREDIENTS } from "./index";

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
});
