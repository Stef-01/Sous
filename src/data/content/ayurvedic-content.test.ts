import { describe, expect, it } from "vitest";
import { AYURVEDIC_ARTICLES } from "./ayurvedic-content";
import { ARTICLES } from "./articles";

describe("Ayurvedic Kitchen content (W12)", () => {
  it("is sample-flagged, tagged, with real food_images covers", () => {
    expect(AYURVEDIC_ARTICLES.length).toBeGreaterThanOrEqual(3);
    for (const a of AYURVEDIC_ARTICLES) {
      expect(a.isPlaceholder, a.id).toBe(true);
      expect(a.tags, a.id).toContain("ayurvedic-kitchen");
      expect(a.coverImageUrl, a.id).toMatch(/^\/food_images\/\S+\.png$/);
    }
  });

  it("never overstates — no cure / disease / dosha-as-fact claims", () => {
    for (const a of AYURVEDIC_ARTICLES) {
      const text = `${a.title} ${a.excerpt} ${a.body.join(" ")}`.toLowerCase();
      expect(text, a.id).not.toMatch(
        /\bcures?\b|\bprevents? (cancer|disease|diabetes)|\btreats? (cancer|disease|diabetes)/,
      );
    }
  });

  it("is merged into the Content tab", () => {
    const ids = new Set(ARTICLES.map((a) => a.id));
    for (const a of AYURVEDIC_ARTICLES) expect(ids.has(a.id), a.id).toBe(true);
  });
});
