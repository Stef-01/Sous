import { describe, expect, it } from "vitest";

import { FOOD_GLYPHS, FOOD_GLYPH_NAMES } from "./food-glyphs";

const TAGS = ["path", "circle", "ellipse", "line", "rect"];

describe("FOOD_GLYPHS registry", () => {
  it("FOOD_GLYPH_NAMES matches the registry keys", () => {
    expect([...FOOD_GLYPH_NAMES].sort()).toEqual(
      Object.keys(FOOD_GLYPHS).sort(),
    );
  });

  it("registers the full set (W2 + the dish-type additions)", () => {
    expect(FOOD_GLYPH_NAMES.length).toBeGreaterThanOrEqual(23);
  });

  describe.each(FOOD_GLYPH_NAMES)("%s", (name) => {
    const parts = FOOD_GLYPHS[name];

    it("has at least one drawable part", () => {
      expect(parts.length).toBeGreaterThanOrEqual(1);
    });

    it("uses only known SVG tags with valid geometry", () => {
      for (const [tag, attrs] of parts) {
        expect(TAGS, `unknown tag in ${name}`).toContain(tag);
        if (tag === "path") {
          expect(typeof attrs.d, `path.d in ${name}`).toBe("string");
          expect((attrs.d as string).length).toBeGreaterThan(0);
        }
        if (tag === "circle") {
          for (const k of ["cx", "cy", "r"]) {
            expect(attrs[k], `circle.${k} in ${name}`).toBeDefined();
          }
        }
      }
    });
  });
});
