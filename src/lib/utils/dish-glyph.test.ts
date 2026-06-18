import { describe, expect, it } from "vitest";

import { FOOD_GLYPH_NAMES } from "@/components/icons/food-glyphs";
import {
  DISH_GLYPH_CUISINES,
  DISH_GLYPH_TYPE_RULES,
  getCuisineGlyph,
  getDishGlyph,
} from "./dish-glyph";

describe("getCuisineGlyph", () => {
  it("maps every known cuisine to a registered glyph", () => {
    for (const cuisine of DISH_GLYPH_CUISINES) {
      const glyph = getCuisineGlyph(cuisine);
      expect(glyph, cuisine).not.toBeNull();
      expect(FOOD_GLYPH_NAMES).toContain(glyph);
    }
  });

  it("is case- and whitespace-insensitive", () => {
    expect(getCuisineGlyph("  Japanese ")).toBe("sushi");
    expect(getCuisineGlyph("MEXICAN")).toBe("taco");
  });

  it("returns null for an unmapped cuisine", () => {
    expect(getCuisineGlyph("martian")).toBeNull();
    expect(getCuisineGlyph("")).toBeNull();
  });
});

describe("getDishGlyph precedence (dish-type first, cuisine fallback)", () => {
  it("dish-type tags win over the cuisine default (variety within a cuisine)", () => {
    expect(getDishGlyph(["soup"], "italian")).toBe("soup");
    expect(getDishGlyph(["grilled", "beef"], "thai")).toBe("flame");
    expect(getDishGlyph(["pizza"], "american")).toBe("pizza");
  });

  it("falls back to the cuisine glyph when no dish-type tag matches", () => {
    expect(getDishGlyph(["savory", "rich"], "italian")).toBe("pasta");
    expect(getDishGlyph([], "vietnamese")).toBe("pho");
    expect(getDishGlyph(["mystery"], "american")).toBe("burger");
  });

  it("uses dish type when the cuisine is unknown", () => {
    expect(getDishGlyph(["soup"], "")).toBe("soup");
    expect(getDishGlyph(["grilled"], "fusion")).toBe("flame");
    expect(getDishGlyph(["seafood"], "")).toBe("fish");
  });

  it("matches dish-type tags case-insensitively", () => {
    expect(getDishGlyph(["DESSERT"], "")).toBe("dessert");
  });

  it("returns null when nothing matches and the cuisine is unmapped", () => {
    expect(getDishGlyph(["mystery"], "")).toBeNull();
    expect(getDishGlyph([], "")).toBeNull();
  });
});

describe("registry completeness", () => {
  it("every type-rule glyph is registered", () => {
    for (const [, glyph] of DISH_GLYPH_TYPE_RULES) {
      expect(FOOD_GLYPH_NAMES, glyph).toContain(glyph);
    }
  });
});
