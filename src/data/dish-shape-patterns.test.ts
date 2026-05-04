import { describe, expect, it } from "vitest";
import patternsRaw from "./dish-shape-patterns.json";

interface DishShapePattern {
  requiredAny: string[][];
  dishName: string;
  dishType: string;
  prepTimeMinutes: number;
  pairingExplanation: string;
}

const patterns = patternsRaw as DishShapePattern[];

describe("dish-shape-patterns.json — seed data integrity", () => {
  it("parses as an array", () => {
    expect(Array.isArray(patterns)).toBe(true);
  });

  it("has at least 12 starter patterns", () => {
    expect(patterns.length).toBeGreaterThanOrEqual(12);
  });

  it("every pattern has all required fields", () => {
    for (const p of patterns) {
      expect(typeof p.dishName).toBe("string");
      expect(p.dishName.length).toBeGreaterThan(0);
      expect(typeof p.dishType).toBe("string");
      expect(p.dishType.length).toBeGreaterThan(0);
      expect(typeof p.prepTimeMinutes).toBe("number");
      expect(p.prepTimeMinutes).toBeGreaterThan(0);
      expect(typeof p.pairingExplanation).toBe("string");
      expect(p.pairingExplanation.length).toBeGreaterThan(20);
      expect(Array.isArray(p.requiredAny)).toBe(true);
      expect(p.requiredAny.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("every requiredAny slot has at least one acceptable substitute", () => {
    for (const p of patterns) {
      for (const slot of p.requiredAny) {
        expect(Array.isArray(slot)).toBe(true);
        expect(slot.length).toBeGreaterThanOrEqual(1);
        for (const ing of slot) {
          expect(typeof ing).toBe("string");
          expect(ing.length).toBeGreaterThan(0);
          // Lowercase + space-only convention so the matcher's
          // pantry-set lookups are predictable.
          expect(ing).toBe(ing.toLowerCase());
        }
      }
    }
  });

  it("no duplicate dishName across the catalog", () => {
    const names = patterns.map((p) => p.dishName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("dishType is one of the known buckets (sandwich/salad/toast/...)", () => {
    const validTypes = new Set([
      "sandwich",
      "salad",
      "snack-board",
      "skillet",
      "dip",
      "toast",
      "pasta",
      "plate",
      "breakfast",
      "bowl",
      "wrap",
    ]);
    for (const p of patterns) {
      expect(validTypes.has(p.dishType)).toBe(true);
    }
  });

  it("prep times are realistic (3-45 min)", () => {
    for (const p of patterns) {
      expect(p.prepTimeMinutes).toBeGreaterThanOrEqual(3);
      expect(p.prepTimeMinutes).toBeLessThanOrEqual(45);
    }
  });

  it("pairing explanations passed FOMO-rejection (no must/should/everyone)", () => {
    for (const p of patterns) {
      const lower = p.pairingExplanation.toLowerCase();
      expect(lower).not.toContain("must");
      expect(lower).not.toContain("should");
      expect(lower).not.toContain("everyone");
    }
  });
});
