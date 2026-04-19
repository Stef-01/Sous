import { describe, it, expect, beforeEach } from "vitest";
import { findClosestDishes } from "./find-closest-dishes";
import { _resetTaxonomyCache } from "./dish-taxonomy";

describe("findClosestDishes", () => {
  beforeEach(() => {
    _resetTaxonomyCache();
  });

  it("returns nothing for empty or one-char queries", () => {
    expect(findClosestDishes("")).toEqual([]);
    expect(findClosestDishes("a")).toEqual([]);
  });

  it("matches an exact dish name with highest score", () => {
    const matches = findClosestDishes("butter chicken");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]!.dish.name.toLowerCase()).toContain("butter chicken");
  });

  it("ranks chicken alfredo-like pastas above butter chicken for 'chicken alfredo'", () => {
    // Alfredo is a white/cream pasta sauce. Butter chicken is a curry.
    // The form + sauce axes should pull pasta dishes ahead.
    const matches = findClosestDishes("chicken alfredo pasta", 5);
    expect(matches.length).toBeGreaterThan(0);
    const top = matches[0]!.dish;
    const topIsPasta = top.forms.includes("pasta");
    expect(topIsPasta).toBe(true);

    // Butter chicken, if present, must rank strictly lower than the top pasta.
    const alfredoIdx = matches.findIndex((m) => m.dish.forms.includes("pasta"));
    const butterIdx = matches.findIndex((m) =>
      m.dish.name.toLowerCase().includes("butter chicken"),
    );
    if (alfredoIdx !== -1 && butterIdx !== -1) {
      expect(alfredoIdx).toBeLessThan(butterIdx);
    }
  });

  it("matches aliases  -  'makhani' should find butter chicken", () => {
    const matches = findClosestDishes("makhani");
    const names = matches.map((m) => m.dish.name.toLowerCase());
    expect(names.some((n) => n.includes("butter chicken"))).toBe(true);
  });

  it("returns a human-readable reason for every match", () => {
    const matches = findClosestDishes("spicy pasta");
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(typeof m.reason).toBe("string");
      expect(m.reason.length).toBeGreaterThan(0);
    }
  });

  it("respects the k limit", () => {
    const matches = findClosestDishes("chicken", 3);
    expect(matches.length).toBeLessThanOrEqual(3);
  });

  it("surfaces curry dishes for curry-family queries like 'tikka masala'", () => {
    const matches = findClosestDishes("tikka masala", 5);
    expect(matches.length).toBeGreaterThan(0);
    // At least one curry-tagged dish in the top 3
    const top3 = matches.slice(0, 3);
    const hasCurry = top3.some((m) => m.dish.sauces.includes("curry"));
    expect(hasCurry).toBe(true);
  });

  it("is deterministic", () => {
    const a = findClosestDishes("chicken alfredo pasta", 5);
    const b = findClosestDishes("chicken alfredo pasta", 5);
    expect(a.map((m) => m.dish.id)).toEqual(b.map((m) => m.dish.id));
  });
});
