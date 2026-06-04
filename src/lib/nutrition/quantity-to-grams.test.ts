import { describe, expect, it } from "vitest";
import { parseLeadingAmount, quantityToGrams } from "./quantity-to-grams";

// olive-oil-like: density 216 g/cup; no per-piece.
const oil = { densityGPerCup: 216, gramsPerPiece: null };
// garlic-clove-like: 3 g/clove; no density.
const clove = { densityGPerCup: null, gramsPerPiece: 3 };
// flour-like: density 120 g/cup.
const flour = { densityGPerCup: 120, gramsPerPiece: null };

describe("parseLeadingAmount", () => {
  it("parses integers and decimals", () => {
    expect(parseLeadingAmount("2 cups").amount).toBe(2);
    expect(parseLeadingAmount("1.5 lb").amount).toBe(1.5);
  });
  it("parses simple and mixed fractions", () => {
    expect(parseLeadingAmount("1/2 cup").amount).toBe(0.5);
    expect(parseLeadingAmount("1 1/2 cups").amount).toBe(1.5);
  });
  it("parses unicode fractions, glued or spaced", () => {
    expect(parseLeadingAmount("½ tsp").amount).toBe(0.5);
    expect(parseLeadingAmount("1½ cups").amount).toBe(1.5);
  });
  it("averages a range", () => {
    expect(parseLeadingAmount("1-2 cloves").amount).toBe(1.5);
    expect(parseLeadingAmount("2 to 4 tbsp").amount).toBe(3);
  });
  it("returns null when there is no leading number", () => {
    expect(parseLeadingAmount("a pinch").amount).toBeNull();
  });
});

describe("quantityToGrams", () => {
  it("converts mass units directly", () => {
    expect(quantityToGrams("200 g", oil)).toBe(200);
    expect(quantityToGrams("1 kg", oil)).toBe(1000);
    expect(quantityToGrams("1 lb", oil)).toBeCloseTo(453.59, 1);
    expect(quantityToGrams("2 oz", oil)).toBeCloseTo(56.7, 1);
  });

  it("converts volume units via density", () => {
    // 1 cup oil = 216 g
    expect(quantityToGrams("1 cup", oil)).toBe(216);
    // 2 tbsp oil = 2/16 cup * 216 = 27 g
    expect(quantityToGrams("2 tbsp", oil)).toBe(27);
    // 1 cup flour = 120 g
    expect(quantityToGrams("1 cup", flour)).toBe(120);
  });

  it("converts count units via per-piece mass", () => {
    expect(quantityToGrams("3 cloves", clove)).toBe(9);
    // bare number, no unit → treated as count
    expect(quantityToGrams("2", clove)).toBe(6);
  });

  it("returns null for volume without density", () => {
    expect(quantityToGrams("1 cup", clove)).toBeNull();
  });

  it("returns null for count without per-piece mass", () => {
    expect(quantityToGrams("2 cloves", oil)).toBeNull();
  });

  it("returns null for non-quantities", () => {
    expect(quantityToGrams("to taste", oil)).toBeNull();
    expect(quantityToGrams("a pinch", oil)).toBeNull();
    expect(quantityToGrams("for garnish", oil)).toBeNull();
    expect(quantityToGrams("", oil)).toBeNull();
  });

  it("handles fl oz as a volume", () => {
    // 8 fl oz = 1 cup oil = 216 g
    expect(quantityToGrams("8 fl oz", oil)).toBe(216);
  });
});
