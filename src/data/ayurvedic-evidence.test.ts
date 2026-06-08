import { describe, expect, it } from "vitest";
import { AYURVEDIC_HERBS, ayurvedicHerbsForDish } from "./ayurvedic-evidence";

describe("ayurvedic evidence (validated-only mode)", () => {
  it("the v2 library is expanded (≥13 herbs) across all strength tiers", () => {
    expect(AYURVEDIC_HERBS.length).toBeGreaterThanOrEqual(13);
    const tiers = new Set(AYURVEDIC_HERBS.map((h) => h.strength));
    expect(tiers.has("strong")).toBe(true);
    expect(tiers.has("moderate")).toBe(true);
    expect(tiers.has("limited")).toBe(true);
    // the researched additions are present
    for (const id of ["garlic", "nigella", "saffron", "tulsi", "ashwagandha"]) {
      expect(
        AYURVEDIC_HERBS.some((h) => h.id === id),
        `${id} added`,
      ).toBe(true);
    }
  });

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
    expect(
      ayurvedicHerbsForDish(new Set(["onion", "rice", "chicken"])),
    ).toEqual([]);
    expect(ayurvedicHerbsForDish(undefined)).toEqual([]);
  });
});
