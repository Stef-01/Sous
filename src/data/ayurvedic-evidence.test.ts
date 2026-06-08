import { describe, expect, it } from "vitest";
import { AYURVEDIC_HERBS, ayurvedicHerbsForDish } from "./ayurvedic-evidence";

describe("ayurvedic evidence (validated-only mode)", () => {
  it("every herb is complete with a strength, a safety note, and real sources", () => {
    const ids = new Set<string>();
    const strengths = new Set(["strong", "moderate", "limited"]);
    for (const h of AYURVEDIC_HERBS) {
      expect(ids.has(h.id), `dup ${h.id}`).toBe(false);
      ids.add(h.id);
      expect(h.name && h.botanical && h.ayurvedicName, h.id).toBeTruthy();
      expect(h.ingredientId, h.id).toBeTruthy();
      expect(h.traditionalUse.length, h.id).toBeGreaterThan(0);
      expect(h.research.length, h.id).toBeGreaterThan(0);
      expect(strengths.has(h.strength), `${h.id} strength`).toBe(true);
      expect(h.safety.length, `${h.id} safety`).toBeGreaterThan(0);
      expect(h.sources.length, h.id).toBeGreaterThan(0);
      for (const s of h.sources) {
        expect(s.url, h.id).toMatch(/^https:\/\/\S+$/);
      }
    }
  });

  it("stays evidence-only: no dosha framework, no cure/disease claims", () => {
    for (const h of AYURVEDIC_HERBS) {
      const text =
        `${h.traditionalUse} ${h.research} ${h.safety}`.toLowerCase();
      expect(text, h.id).not.toMatch(/\bdosha|\bvata|\bpitta|\bkapha/);
      expect(text, h.id).not.toMatch(/\bcure|\bprevents? (cancer|disease)/);
    }
  });

  it("matches the evidence-backed herbs present in a dish", () => {
    const herbs = ayurvedicHerbsForDish(
      new Set(["turmeric", "black-pepper", "onion"]),
    );
    expect(herbs.map((h) => h.id).sort()).toEqual(["black-pepper", "turmeric"]);
    expect(ayurvedicHerbsForDish(new Set(["onion", "garlic"]))).toEqual([]);
    expect(ayurvedicHerbsForDish(undefined)).toEqual([]);
  });
});
