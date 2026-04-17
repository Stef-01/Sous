import { describe, it, expect } from "vitest";
import { computePantryFit } from "./quest-card";
import { normalizePantryName } from "@/lib/hooks/use-pantry";

describe("computePantryFit", () => {
  it("returns 0 when ingredient list is empty", () => {
    expect(computePantryFit([], new Set(["salt"]))).toBe(0);
  });

  it("returns 0 when pantry is empty", () => {
    expect(computePantryFit(["salt", "pepper"], new Set())).toBe(0);
  });

  it("computes fraction of ingredients present in pantry", () => {
    const ingredients = ["salt", "pepper", "olive oil", "garlic"].map(
      normalizePantryName,
    );
    const pantry = new Set(["salt", "pepper"].map(normalizePantryName));
    expect(computePantryFit(ingredients, pantry)).toBe(0.5);
  });

  it("hits 100% when every ingredient is in the pantry", () => {
    const ingredients = ["rice", "scallion"].map(normalizePantryName);
    const pantry = new Set(["rice", "scallion"].map(normalizePantryName));
    expect(computePantryFit(ingredients, pantry)).toBe(1);
  });

  it("is case- and whitespace-insensitive via normalized input", () => {
    const ingredients = ["Olive Oil", "  Garlic  "].map(normalizePantryName);
    const pantry = new Set(["olive oil", "garlic"].map(normalizePantryName));
    expect(computePantryFit(ingredients, pantry)).toBe(1);
  });
});
