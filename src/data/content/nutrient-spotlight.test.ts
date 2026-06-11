import { describe, expect, it } from "vitest";
import { NUTRIENT_SPOTLIGHT_ARTICLES } from "./nutrient-spotlight";
import { ARTICLES } from "./articles";

describe("nutrient-spotlight content (W46)", () => {
  it("has 3-4 entries, all sample-flagged and tagged", () => {
    expect(NUTRIENT_SPOTLIGHT_ARTICLES.length).toBeGreaterThanOrEqual(3);
    for (const a of NUTRIENT_SPOTLIGHT_ARTICLES) {
      expect(a.isPlaceholder, a.id).toBe(true);
      expect(a.category).toBe("articles");
      expect(a.tags, a.id).toContain("nutrient-spotlight");
      expect(a.coverImageUrl, a.id).toMatch(/^\/food_images\/\S+\.png$/);
      expect(a.body.length, a.id).toBeGreaterThan(1);
    }
  });

  it("never overstates — no cure / disease-prevention / treatment claims", () => {
    for (const a of NUTRIENT_SPOTLIGHT_ARTICLES) {
      const text = `${a.title} ${a.excerpt} ${a.body.join(" ")}`.toLowerCase();
      expect(text, a.id).not.toMatch(
        /\bcures?\b|\bprevents? (cancer|disease|diabetes)|\btreats? (cancer|disease|diabetes|illness)|\bheals?\b/,
      );
    }
  });

  it("is merged into the Content tab's article list", () => {
    const ids = new Set(ARTICLES.map((a) => a.id));
    for (const a of NUTRIENT_SPOTLIGHT_ARTICLES) {
      expect(ids.has(a.id), `${a.id} in ARTICLES`).toBe(true);
    }
  });
});

describe("spotlightForNutrient (Dobe's reading corner)", () => {
  it("maps deficit keys to their spotlight article", async () => {
    const { spotlightForNutrient } = await import("./nutrient-spotlight");
    expect(spotlightForNutrient("omega3_g")?.slug).toContain("omega-3");
    expect(spotlightForNutrient("iron_mg")?.tags).toContain("iron");
    expect(spotlightForNutrient("fiber_g")?.tags).toContain("fiber");
  });

  it("returns null for nutrients without a spotlight yet", async () => {
    const { spotlightForNutrient } = await import("./nutrient-spotlight");
    expect(spotlightForNutrient("magnesium_mg")).toBeNull();
  });
});
