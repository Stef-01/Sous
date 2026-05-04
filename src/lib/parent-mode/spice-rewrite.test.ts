/**
 * Tests for the deterministic spice-rewrite transform.
 *
 * Coverage targets the boundary behaviour each tolerance bucket
 * commits to. Defensive cases (empty inputs, multiple keywords,
 * no-heat text) ensure the transform is safe to call on every step
 * render without surprising mutations.
 */

import { describe, expect, it } from "vitest";
import {
  containsChiliHeat,
  HEAT_KEYWORDS,
  rewriteForSpice,
} from "./spice-rewrite";

describe("containsChiliHeat", () => {
  it("flags every documented keyword", () => {
    for (const k of HEAT_KEYWORDS) {
      expect(containsChiliHeat(`Add a pinch of ${k} to the pan.`)).toBe(true);
    }
  });
  it("is case-insensitive", () => {
    expect(containsChiliHeat("Sprinkle CAYENNE last.")).toBe(true);
  });
  it("returns false when no heat keyword is present", () => {
    expect(containsChiliHeat("Stir the rice.")).toBe(false);
  });
});

describe("rewriteForSpice — tolerance 5 (full heat)", () => {
  it("is a no-op", () => {
    const original = "Add 1 tsp of cayenne and 2 thai chiles.";
    expect(rewriteForSpice(original, 5)).toBe(original);
  });
});

describe("rewriteForSpice — tolerance 4 (medium)", () => {
  it("halves whole-number quantities", () => {
    expect(rewriteForSpice("Add 2 tsp of cayenne.", 4)).toBe(
      "Add 1 tsp of cayenne.",
    );
  });
  it("halves a unicode fraction", () => {
    expect(rewriteForSpice("Add ½ tsp of chili.", 4)).toBe(
      "Add ¼ tsp of chili.",
    );
  });
});

describe("rewriteForSpice — tolerance 3 (mild)", () => {
  it("quarters the amount", () => {
    expect(rewriteForSpice("Add 1 tsp of cayenne.", 3)).toBe(
      "Add ¼ tsp of cayenne.",
    );
  });
  it("uses 'a tiny pinch' for fractions below ¼", () => {
    expect(rewriteForSpice("Add ½ tsp of cayenne.", 3)).toContain(
      "a tiny pinch of",
    );
  });
});

describe("rewriteForSpice — tolerance 2 (paprika only)", () => {
  it("swaps cayenne to smoked paprika", () => {
    expect(rewriteForSpice("Add cayenne to the pot.", 2)).toBe(
      "Add smoked paprika to the pot.",
    );
  });
  it("swaps fresh chiles to bell pepper", () => {
    expect(rewriteForSpice("Slice 2 jalapeños.", 2)).toBe(
      "Slice 2 bell peppers.",
    );
  });
});

describe("rewriteForSpice — tolerance 1 (no heat)", () => {
  it("strips the heat phrase from the sentence", () => {
    const result = rewriteForSpice(
      "Stir in 1 tsp of cayenne and the cumin.",
      1,
    );
    expect(result.toLowerCase()).not.toContain("cayenne");
    expect(result.toLowerCase()).toContain("cumin");
  });
  it("never returns an empty string (defensive)", () => {
    expect(rewriteForSpice("cayenne", 1)).toBeTruthy();
  });
});

describe("rewriteForSpice — defensive paths", () => {
  it("returns input unchanged when no heat is present", () => {
    expect(rewriteForSpice("Stir the rice gently.", 1)).toBe(
      "Stir the rice gently.",
    );
  });
  it("returns input unchanged for tolerance 5 even with no heat", () => {
    expect(rewriteForSpice("Stir the rice gently.", 5)).toBe(
      "Stir the rice gently.",
    );
  });
  it("handles multiple distinct keywords in one sentence", () => {
    const result = rewriteForSpice(
      "Add cayenne and red pepper flakes to the broth.",
      2,
    );
    expect(result).toContain("smoked paprika");
    expect(result).toContain("a pinch of paprika");
  });
});
