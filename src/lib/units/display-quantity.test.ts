import { describe, expect, it } from "vitest";

import {
  displayQuantity,
  quantityHasAlternativeDisplay,
} from "./display-quantity";

describe("displayQuantity", () => {
  it("converts known volume quantities to metric through the ingredient registry", () => {
    expect(displayQuantity("1 cup", "olive oil", "metric")).toBe("216 g");
  });

  it("converts known metric quantities to US volume through the same registry", () => {
    expect(displayQuantity("216 g", "olive oil", "us")).toBe("1 cup");
  });

  it("leaves countable quantities untouched", () => {
    expect(displayQuantity("2 cloves", "garlic", "metric")).toBe("2 cloves");
    expect(displayQuantity("2 cloves", "garlic", "us")).toBe("2 cloves");
  });
});

describe("quantityHasAlternativeDisplay", () => {
  it("detects whether a row can honestly show another unit system", () => {
    expect(quantityHasAlternativeDisplay("1 cup", "olive oil")).toBe(true);
    expect(quantityHasAlternativeDisplay("2 cloves", "garlic")).toBe(false);
    expect(quantityHasAlternativeDisplay(undefined, "garlic")).toBe(false);
  });
});
