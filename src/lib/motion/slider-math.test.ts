import { describe, it, expect } from "vitest";
import { fractionToValue, valueToFraction } from "./slider-math";

describe("fractionToValue", () => {
  it("maps the midpoint to the middle step", () => {
    expect(fractionToValue(0.5, 0, 10, 1)).toBe(5);
  });

  it("snaps to the nearest integer stop (magnetic)", () => {
    expect(fractionToValue(0.04, 0, 10, 1)).toBe(0);
    expect(fractionToValue(0.46, 0, 10, 1)).toBe(5);
    expect(fractionToValue(0.96, 0, 10, 1)).toBe(10);
  });

  it("clamps out-of-range fractions to the bounds", () => {
    expect(fractionToValue(-0.5, 0, 10, 1)).toBe(0);
    expect(fractionToValue(1.5, 0, 10, 1)).toBe(10);
  });

  it("honours a non-1 step", () => {
    expect(fractionToValue(0.3, 0, 10, 0.5)).toBe(3);
    expect(fractionToValue(0.27, 1, 4, 0.5)).toBe(2); // 1 + round(0.81/0.5)*0.5 = 2
  });
});

describe("valueToFraction", () => {
  it("is the inverse of the midpoint", () => {
    expect(valueToFraction(5, 0, 10)).toBe(0.5);
  });

  it("clamps + handles a degenerate range", () => {
    expect(valueToFraction(-2, 0, 10)).toBe(0);
    expect(valueToFraction(99, 0, 10)).toBe(1);
    expect(valueToFraction(5, 3, 3)).toBe(0);
  });
});
