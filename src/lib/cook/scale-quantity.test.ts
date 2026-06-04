import { describe, expect, it } from "vitest";
import { scaleQuantity, formatAmount } from "./scale-quantity";

describe("formatAmount", () => {
  it("renders cook-friendly fractions", () => {
    expect(formatAmount(2)).toBe("2");
    expect(formatAmount(0.5)).toBe("1/2");
    expect(formatAmount(1.5)).toBe("1 1/2");
    expect(formatAmount(0.25)).toBe("1/4");
    expect(formatAmount(0.75)).toBe("3/4");
    expect(formatAmount(2.5)).toBe("2 1/2");
  });
});

describe("scaleQuantity", () => {
  it("scales the leading amount, preserving the unit", () => {
    expect(scaleQuantity("2 cups", 2)).toBe("4 cups");
    expect(scaleQuantity("1 cup", 0.5)).toBe("1/2 cup");
    expect(scaleQuantity("1/2 tsp", 2)).toBe("1 tsp");
    expect(scaleQuantity("1 cup", 1.5)).toBe("1 1/2 cup");
    expect(scaleQuantity("200 g", 2)).toBe("400 g");
  });

  it("leaves non-quantities and the identity multiplier untouched", () => {
    expect(scaleQuantity("to taste", 2)).toBe("to taste");
    expect(scaleQuantity("a pinch", 3)).toBe("a pinch");
    expect(scaleQuantity("2 cups", 1)).toBe("2 cups");
  });

  it("scales count quantities", () => {
    expect(scaleQuantity("3 cloves", 2)).toBe("6 cloves");
    expect(scaleQuantity("2", 0.5)).toBe("1");
  });
});
