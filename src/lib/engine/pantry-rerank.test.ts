import { describe, expect, it } from "vitest";
import {
  PANTRY_HIGH_COVERAGE_FACTOR,
  PANTRY_HIGH_COVERAGE_THRESHOLD,
  PANTRY_LOW_COVERAGE_FACTOR,
  applyPantryRerank,
  pantryBoostFromCoverage,
} from "./pantry-rerank";
import type { CoverageIngredient } from "./pantry-coverage";
import type { ScoredCandidate, SideDishCandidate } from "./types";

function fixtureSide(over: Partial<SideDishCandidate> = {}): SideDishCandidate {
  return {
    id: "s",
    slug: "s",
    name: "S",
    cuisineFamily: "italian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    skillLevel: "easy",
    flavorProfile: [],
    temperature: "hot",
    proteinGrams: 5,
    fiberGrams: 2,
    caloriesPerServing: 200,
    bestPairedWith: [],
    tags: [],
    pairingReason: null,
    nutritionCategory: null,
    dietaryFlags: [],
    ...over,
  };
}

function scoredFixture(
  totalScore: number,
  side: Partial<SideDishCandidate> = {},
): ScoredCandidate {
  return {
    sideDish: fixtureSide(side),
    scores: {
      cuisineFit: 0.5,
      flavorContrast: 0.5,
      nutritionBalance: 0.5,
      prepBurden: 0.5,
      temperature: 0.5,
      preference: 0.5,
    },
    totalScore,
    explanation: "",
  };
}

// ── pantryBoostFromCoverage ────────────────────────────────

describe("pantryBoostFromCoverage", () => {
  it("coverage 0 → 0 boost", () => {
    expect(pantryBoostFromCoverage(0)).toBe(0);
  });

  it("coverage 0.5 → low-factor boost (0.05)", () => {
    expect(pantryBoostFromCoverage(0.5)).toBeCloseTo(0.05, 5);
  });

  it("coverage 0.69 (just below threshold) → low factor", () => {
    expect(pantryBoostFromCoverage(0.69)).toBeCloseTo(
      0.69 * PANTRY_LOW_COVERAGE_FACTOR,
      5,
    );
  });

  it("coverage 0.70 (at threshold) → high factor", () => {
    expect(pantryBoostFromCoverage(PANTRY_HIGH_COVERAGE_THRESHOLD)).toBeCloseTo(
      0.7 * PANTRY_HIGH_COVERAGE_FACTOR,
      5,
    );
  });

  it("coverage 1.0 → max boost (0.20)", () => {
    expect(pantryBoostFromCoverage(1.0)).toBeCloseTo(0.2, 5);
  });

  it("NaN coverage → 0", () => {
    expect(pantryBoostFromCoverage(NaN)).toBe(0);
  });

  it("negative coverage → 0", () => {
    expect(pantryBoostFromCoverage(-0.1)).toBe(0);
  });

  it("threshold creates a discontinuous jump at 0.70", () => {
    const just_below = pantryBoostFromCoverage(0.699);
    const at_threshold = pantryBoostFromCoverage(0.7);
    expect(at_threshold).toBeGreaterThan(just_below);
    // The jump should be meaningful (more than rounding noise)
    expect(at_threshold - just_below).toBeGreaterThan(0.05);
  });
});

// ── applyPantryRerank ─────────────────────────────────────

describe("applyPantryRerank — regression guards", () => {
  it("empty pantry → output bit-identical to input (no-pantry user)", () => {
    const ranked: ScoredCandidate[] = [
      scoredFixture(0.7, { id: "a", slug: "a" }),
      scoredFixture(0.6, { id: "b", slug: "b" }),
    ];
    const out = applyPantryRerank(ranked, {
      pantry: new Set<string>(),
      ingredientsBySlug: new Map([
        ["a", [{ name: "tomato" }]],
        ["b", [{ name: "basil" }]],
      ]),
    });
    expect(out.map((c) => c.totalScore)).toEqual([0.7, 0.6]);
    expect(out.map((c) => c.sideDish.id)).toEqual(["a", "b"]);
  });

  it("no ingredient data for any candidate → totalScore unchanged", () => {
    const ranked: ScoredCandidate[] = [
      scoredFixture(0.7, { id: "a", slug: "a" }),
    ];
    const out = applyPantryRerank(ranked, {
      pantry: new Set(["tomato"]),
      ingredientsBySlug: new Map(),
    });
    expect(out[0]?.totalScore).toBe(0.7);
  });

  it("does NOT mutate input array", () => {
    const ranked: ScoredCandidate[] = [
      scoredFixture(0.7, { id: "a", slug: "a" }),
    ];
    const ingredientsBySlug = new Map<
      string,
      ReadonlyArray<CoverageIngredient>
    >([["a", [{ name: "tomato" }]]]);
    const out = applyPantryRerank(ranked, {
      pantry: new Set(["tomato"]),
      ingredientsBySlug,
    });
    expect(out).not.toBe(ranked);
    expect(ranked[0]?.totalScore).toBe(0.7);
  });

  it("preserves per-dim scores (only totalScore changes)", () => {
    const original = scoredFixture(0.6, { id: "a", slug: "a" });
    const out = applyPantryRerank([original], {
      pantry: new Set(["tomato"]),
      ingredientsBySlug: new Map([["a", [{ name: "tomato" }]]]),
    });
    expect(out[0]?.scores).toEqual(original.scores);
  });
});

describe("applyPantryRerank — reordering", () => {
  it("high-coverage candidate climbs above barely-higher base score", () => {
    const high = scoredFixture(0.6, { id: "high-cov", slug: "high-cov" });
    const top = scoredFixture(0.65, { id: "top", slug: "top" });
    const out = applyPantryRerank([top, high], {
      pantry: new Set(["tomato", "basil", "olive oil"]),
      ingredientsBySlug: new Map([
        // top: 0/3 coverage → 0 boost
        [
          "top",
          [{ name: "saffron" }, { name: "truffle" }, { name: "anchovy" }],
        ],
        // high-cov: 3/3 coverage → +0.20 boost
        [
          "high-cov",
          [{ name: "tomato" }, { name: "basil" }, { name: "olive oil" }],
        ],
      ]),
    });
    // top: 0.65 (no change). high-cov: 0.6 + 0.20 = 0.80. high-cov wins.
    expect(out[0]?.sideDish.id).toBe("high-cov");
    expect(out[0]?.totalScore).toBeCloseTo(0.8, 5);
  });

  it("partial coverage (below threshold) gets smaller bump", () => {
    const c = scoredFixture(0.5, { id: "c", slug: "c" });
    const out = applyPantryRerank([c], {
      pantry: new Set(["tomato"]),
      ingredientsBySlug: new Map([
        // 1/4 = 0.25 coverage → low factor: 0.25 * 0.10 = 0.025
        [
          "c",
          [
            { name: "tomato" },
            { name: "basil" },
            { name: "garlic" },
            { name: "olive oil" },
          ],
        ],
      ]),
    });
    expect(out[0]?.totalScore).toBeCloseTo(0.5 + 0.025, 5);
  });

  it("clamps totalScore at 1.0", () => {
    const c = scoredFixture(0.95, { id: "c", slug: "c" });
    const out = applyPantryRerank([c], {
      pantry: new Set(["tomato", "basil"]),
      ingredientsBySlug: new Map([
        ["c", [{ name: "tomato" }, { name: "basil" }]],
      ]),
    });
    // 0.95 + 0.20 = 1.15 → clamped to 1.0
    expect(out[0]?.totalScore).toBeLessThanOrEqual(1);
  });
});

describe("applyPantryRerank — determinism", () => {
  it("same inputs → same output", () => {
    const ranked: ScoredCandidate[] = [
      scoredFixture(0.6, { id: "a", slug: "a" }),
      scoredFixture(0.5, { id: "b", slug: "b" }),
    ];
    const ctx = {
      pantry: new Set(["tomato"]),
      ingredientsBySlug: new Map([
        ["a", [{ name: "tomato" }]],
        ["b", [{ name: "saffron" }]],
      ]),
    };
    const a = applyPantryRerank(ranked, ctx);
    const b = applyPantryRerank(ranked, ctx);
    expect(a.map((c) => c.totalScore)).toEqual(b.map((c) => c.totalScore));
    expect(a.map((c) => c.sideDish.id)).toEqual(b.map((c) => c.sideDish.id));
  });
});
