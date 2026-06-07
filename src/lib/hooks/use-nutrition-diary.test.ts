import { describe, expect, it } from "vitest";
import { aggregateDay } from "./use-nutrition-diary";

const entry = (slug: string, servings: number) => ({
  slug,
  name: slug,
  servings,
  at: "",
});

describe("aggregateDay", () => {
  it("returns null when nothing resolves", () => {
    expect(aggregateDay([])).toBeNull();
    // 'naan' has 0 composition coverage → excluded → null if it's the only one
    expect(aggregateDay([entry("naan", 1)])).toBeNull();
  });

  it("sums a dish's nutrition scaled by servings", () => {
    const one = aggregateDay([entry("guacamole", 1)]);
    const two = aggregateDay([entry("guacamole", 2)]);
    expect(one).not.toBeNull();
    expect(two).not.toBeNull();
    if (one && two) {
      expect(two.calories).toBeCloseTo(one.calories * 2, 0);
      expect(two.fiber_g ?? 0).toBeCloseTo((one.fiber_g ?? 0) * 2, 1);
    }
  });

  it("combines multiple dishes additively (coverage-gated)", () => {
    const combined = aggregateDay([entry("guacamole", 1), entry("raita", 1)]);
    const g = aggregateDay([entry("guacamole", 1)]);
    const r = aggregateDay([entry("raita", 1)]);
    expect(combined).not.toBeNull();
    if (combined && g && r) {
      expect(combined.calories).toBeCloseTo(g.calories + r.calories, 0);
    }
  });

  it("drops only the uncovered dishes, keeps the rest", () => {
    const mixed = aggregateDay([entry("guacamole", 1), entry("naan", 1)]);
    const g = aggregateDay([entry("guacamole", 1)]);
    expect(mixed).not.toBeNull();
    if (mixed && g) expect(mixed.calories).toBeCloseTo(g.calories, 0);
  });

  it("uses a branded entry's embedded nutrition (W20), scaled by servings", () => {
    const branded = {
      slug: "off:123",
      name: "Yogurt",
      servings: 2,
      at: "",
      nutrition: { calories: 100, protein_g: 10 } as unknown as ReturnType<
        typeof aggregateDay
      >,
    };
    const r = aggregateDay([branded as never]);
    expect(r?.calories).toBe(200); // 100 × 2 servings, no registry lookup
    expect(r?.protein_g).toBe(20);
  });
});
