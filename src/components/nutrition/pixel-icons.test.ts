import { describe, expect, it } from "vitest";

import { PIXEL_ICONS, type PixelIconName } from "./pixel-icons";

const NAMES = Object.keys(PIXEL_ICONS) as PixelIconName[];

describe("PIXEL_ICONS", () => {
  it("defines all 12 icons", () => {
    expect(NAMES).toHaveLength(12);
  });

  describe.each(NAMES)("%s", (name) => {
    const { map, colors } = PIXEL_ICONS[name];

    it("is a 12×12 grid (12 rows, every row 12 chars)", () => {
      expect(map).toHaveLength(12);
      for (const row of map) {
        expect(row.length, `row "${row}"`).toBe(12);
      }
    });

    it("uses only legend chars or '.'", () => {
      const legend = new Set([...Object.keys(colors), "."]);
      for (const ch of new Set(map.join("").split(""))) {
        expect(legend.has(ch), `unknown char "${ch}" in ${name}`).toBe(true);
      }
    });

    it("draws at least 8 non-transparent cells", () => {
      const lit = map
        .join("")
        .split("")
        .filter((ch) => ch !== ".").length;
      expect(lit).toBeGreaterThanOrEqual(8);
    });
  });
});
