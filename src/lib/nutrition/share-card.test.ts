import { describe, expect, it } from "vitest";
import { buildNutritionShareSVG, SHARE_FOOTER } from "./share-card";

describe("buildNutritionShareSVG (W45)", () => {
  const day = {
    title: "Grilled Salmon",
    calories: 520,
    protein_g: 41,
    carbs_g: 12,
    fat_g: 30,
    fiber_g: 4,
  };

  it("renders a card for a known day with the numbers + estimate footer", () => {
    const svg = buildNutritionShareSVG(day);
    expect(svg).toMatch(/^<svg[\s\S]+<\/svg>$/);
    expect(svg).toContain("Grilled Salmon");
    expect(svg).toContain("520");
    expect(svg).toContain("41g");
    expect(svg).toContain(SHARE_FOOTER);
  });

  it("an empty day yields a friendly empty card, still with the footer", () => {
    const svg = buildNutritionShareSVG(null);
    expect(svg).toContain("No nutrition yet");
    expect(svg).toContain(SHARE_FOOTER);
    expect(svg).toMatch(/^<svg[\s\S]+<\/svg>$/);
  });

  it("escapes XML in the title (no injection / broken SVG)", () => {
    const svg = buildNutritionShareSVG({ ...day, title: "Mac & <Cheese>" });
    expect(svg).toContain("Mac &amp; &lt;Cheese&gt;");
    expect(svg).not.toContain("<Cheese>");
  });
});
