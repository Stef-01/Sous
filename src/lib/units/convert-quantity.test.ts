import { describe, expect, it } from "vitest";
import {
  convertQuantity,
  niceFraction,
  normalizeFractionGlyphs,
  quantityUnit,
} from "./convert-quantity";
import type { Ingredient } from "@/types/ingredient";

const flour = {
  densityGPerCup: 120,
  per100g: {},
} as unknown as Ingredient;
const milk = {
  densityGPerCup: 245,
  per100g: {},
} as unknown as Ingredient;
const chicken = { per100g: {} } as unknown as Ingredient; // no density

describe("niceFraction", () => {
  it("snaps to cookbook fractions", () => {
    expect(niceFraction(0.33)).toBe("⅓");
    expect(niceFraction(1.5)).toBe("1 ½");
    expect(niceFraction(2)).toBe("2");
    expect(niceFraction(0.24)).toBe("¼");
  });
});

describe("quantityUnit", () => {
  it("extracts units and rejects countables", () => {
    expect(quantityUnit("2 cups")).toBe("cups");
    expect(quantityUnit("1 ½ cups")).toBe("cups");
    expect(quantityUnit("2 cloves")).toBe("cloves");
    expect(quantityUnit("for frying")).toBeNull();
  });
});

describe("convertQuantity → metric", () => {
  it("cups → grams through the ingredient's own density", () => {
    expect(convertQuantity("2 cups", flour, "metric")).toBe("240 g");
    expect(convertQuantity("1 ½ cups", milk, "metric")).toBe("368 g");
  });

  it("tbsp/tsp → grams (cup/16, cup/48)", () => {
    expect(convertQuantity("2 tablespoons", flour, "metric")).toBe("15 g");
    expect(convertQuantity("1 tsp", flour, "metric")).toBe("2.5 g");
  });

  it("lb/oz → grams without needing density", () => {
    expect(convertQuantity("1 pound", chicken, "metric")).toBe("454 g");
    expect(convertQuantity("1 pound", null, "metric")).toBe("454 g");
  });

  it("already-metric and countables stay untouched (null)", () => {
    expect(convertQuantity("200 g", flour, "metric")).toBeNull();
    expect(convertQuantity("2 cloves", flour, "metric")).toBeNull();
    expect(convertQuantity("for dusting", flour, "metric")).toBeNull();
  });
});

describe("convertQuantity → us", () => {
  it("grams → cups via density, with cookbook fractions", () => {
    expect(convertQuantity("240 g", flour, "us")).toBe("2 cups");
    expect(convertQuantity("60 g", flour, "us")).toBe(
      "½ cups".replace("½ cups", "½ cup"),
    );
  });

  it("small gram amounts land in tbsp/tsp", () => {
    expect(convertQuantity("15 g", flour, "us")).toBe("2 tbsp");
  });

  it("grams → oz when density is unknown", () => {
    expect(convertQuantity("454 g", chicken, "us")).toBe("16 oz");
  });

  it("already-US volumes stay untouched", () => {
    expect(convertQuantity("2 cups", flour, "us")).toBeNull();
    expect(convertQuantity("1 tbsp", flour, "us")).toBeNull();
  });
});

describe("normalizeFractionGlyphs", () => {
  it("turns seed-data glyphs into parseable fractions", () => {
    expect(normalizeFractionGlyphs("1 ½ cups")).toBe("1 1/2 cups");
    expect(normalizeFractionGlyphs("½ teaspoon")).toBe("1/2 teaspoon");
  });
});

describe("container quantities (black-bean-brownies regression)", () => {
  it("'1 15-oz can' is packaging — never converted in either direction", () => {
    expect(
      convertQuantity("1 15-oz can, rinsed and drained", flour, "us"),
    ).toBeNull();
    expect(
      convertQuantity("1 15-oz can, rinsed and drained", flour, "metric"),
    ).toBeNull();
    expect(convertQuantity("2 jars", flour, "metric")).toBeNull();
  });
});
