import { describe, it, expect } from "vitest";
import {
  scorePantryReuse,
  PANTRY_REUSE_WEIGHT,
  BUDGET_PANTRY_REUSE_WEIGHT,
  type PantryReuseContext,
} from "./pantry-reuse";
import { suggestSides } from "../pairing-engine";
import type { MainDishIntent, SideDishCandidate } from "../types";

describe("scorePantryReuse", () => {
  const set = (...xs: string[]) => new Set(xs);

  it("returns 0 when nothing is on hand", () => {
    expect(scorePantryReuse(set(), ["garlic", "onion"])).toBe(0);
  });

  it("returns 0 when the side has no ingredients", () => {
    expect(scorePantryReuse(set("garlic"), [])).toBe(0);
  });

  it("returns 0 when there is no overlap", () => {
    expect(scorePantryReuse(set("garlic"), ["lemon", "mint"])).toBe(0);
  });

  it("returns 1 when every non-staple side ingredient is on hand", () => {
    expect(scorePantryReuse(set("garlic", "onion"), ["garlic", "onion"])).toBe(
      1,
    );
  });

  it("returns the matched fraction for partial overlap", () => {
    expect(
      scorePantryReuse(set("garlic"), ["garlic", "onion", "mint", "lemon"]),
    ).toBe(0.25);
  });

  it("ignores staples on both sides (salt/oil are noise, not signal)", () => {
    // side = [salt, garlic]; only garlic is counted, and it's on hand → 1.
    expect(scorePantryReuse(set("garlic", "salt"), ["salt", "garlic"])).toBe(1);
    // a side that is ALL staples has no signal → 0.
    expect(
      scorePantryReuse(set("salt", "olive oil"), ["salt", "olive oil"]),
    ).toBe(0);
  });

  it("dedupes repeated ingredients within a side", () => {
    // counted non-staples = {garlic, onion} = 2; matched = {garlic} = 1 → 0.5
    expect(scorePantryReuse(set("garlic"), ["garlic", "garlic", "onion"])).toBe(
      0.5,
    );
  });

  it("normalizes case + whitespace on both sides", () => {
    expect(scorePantryReuse(set(" Garlic "), ["GARLIC", "onion"])).toBe(0.5);
  });
});

// ── End-to-end reblend through suggestSides ───────────────────────────────

const main: MainDishIntent = {
  dishName: "Grilled Chicken",
  cuisineSignals: ["mediterranean"],
  isHomemade: true,
  effortTolerance: "moderate",
  healthOrientation: "balanced",
  moodSignals: ["fresh"],
};

function side(slug: string): SideDishCandidate {
  return {
    id: slug,
    slug,
    name: slug,
    cuisineFamily: "mediterranean",
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    flavorProfile: ["bright", "fresh"],
    temperature: "cold",
    proteinGrams: 4,
    fiberGrams: 4,
    caloriesPerServing: 120,
    bestPairedWith: [],
    tags: ["vegan"],
    pairingReason: null,
    nutritionCategory: "vegetable",
    dietaryFlags: ["vegan"],
  };
}

const candidates = [side("alpha"), side("beta")];

describe("suggestSides pantry reblend", () => {
  it("is byte-identical to the default path when nothing is on hand", () => {
    const base = suggestSides(main, candidates);
    const emptyCtx: PantryReuseContext = {
      onHand: new Set(),
      ingredientsBySlug: new Map(),
    };
    const withEmpty = suggestSides(
      main,
      candidates,
      undefined,
      undefined,
      3,
      undefined,
      emptyCtx,
    );
    expect(base.success && withEmpty.success).toBe(true);
    if (!base.success || !withEmpty.success) return;
    // same order, same totals, no pantryReuse key written.
    expect(withEmpty.data.sides.map((s) => s.sideDish.slug)).toEqual(
      base.data.sides.map((s) => s.sideDish.slug),
    );
    for (let i = 0; i < base.data.sides.length; i++) {
      expect(withEmpty.data.sides[i].totalScore).toBe(
        base.data.sides[i].totalScore,
      );
      expect(withEmpty.data.sides[i].scores.pantryReuse).toBeUndefined();
    }
  });

  it("raises a fully-reused side and lowers a non-reused one", () => {
    const base = suggestSides(main, candidates);
    const ctx: PantryReuseContext = {
      onHand: new Set(["chickpeas", "parsley"]),
      ingredientsBySlug: new Map<string, readonly string[]>([
        ["beta", ["chickpeas", "parsley"]], // 100% on hand → pantryReuse 1
        ["alpha", ["bacon", "cream"]], // 0% on hand → pantryReuse 0
      ]),
    };
    const out = suggestSides(
      main,
      candidates,
      undefined,
      undefined,
      3,
      undefined,
      ctx,
    );
    expect(base.success && out.success).toBe(true);
    if (!base.success || !out.success) return;

    const bySlug = (r: typeof out) =>
      r.success
        ? Object.fromEntries(r.data.sides.map((s) => [s.sideDish.slug, s]))
        : {};
    const b0 = bySlug(base);
    const b1 = bySlug(out);

    expect(b1.beta.scores.pantryReuse).toBe(1);
    expect(b1.alpha.scores.pantryReuse).toBe(0);
    // reused side's total went UP, non-reused side's total went DOWN.
    expect(b1.beta.totalScore).toBeGreaterThan(b0.beta.totalScore);
    expect(b1.alpha.totalScore).toBeLessThan(b0.alpha.totalScore);
    // the gap moved by exactly the reblend math for a 0-vs-1 split.
    const expectedBetaTotal =
      (1 - PANTRY_REUSE_WEIGHT) * b0.beta.totalScore + PANTRY_REUSE_WEIGHT * 1;
    expect(b1.beta.totalScore).toBeCloseTo(expectedBetaTotal, 6);
  });

  it("budget weight (W5) boosts a fully-reused side more than the default", () => {
    const base = suggestSides(main, candidates);
    const mk = (weight?: number): PantryReuseContext => ({
      onHand: new Set(["chickpeas", "parsley"]),
      ingredientsBySlug: new Map<string, readonly string[]>([
        ["beta", ["chickpeas", "parsley"]], // 100% on hand → pantryReuse 1
        ["alpha", ["bacon", "cream"]], // 0% on hand → pantryReuse 0
      ]),
      ...(weight !== undefined ? { weight } : {}),
    });
    const call = (ctx: PantryReuseContext) =>
      suggestSides(main, candidates, undefined, undefined, 3, undefined, ctx);
    const dflt = call(mk());
    const boosted = call(mk(BUDGET_PANTRY_REUSE_WEIGHT));
    expect(base.success && dflt.success && boosted.success).toBe(true);
    if (!base.success || !dflt.success || !boosted.success) return;

    const beta = (r: typeof boosted) =>
      r.success
        ? r.data.sides.find((s) => s.sideDish.slug === "beta")!.totalScore
        : 0;
    const b0 = base.data.sides.find(
      (s) => s.sideDish.slug === "beta",
    )!.totalScore;
    // base < default-weight < budget-weight — the boost ranks pantry reuse higher.
    expect(beta(dflt)).toBeGreaterThan(b0);
    expect(beta(boosted)).toBeGreaterThan(beta(dflt));
    // exact reblend math at the boosted weight (beta is 100% reused → reuse=1).
    const expected =
      (1 - BUDGET_PANTRY_REUSE_WEIGHT) * b0 + BUDGET_PANTRY_REUSE_WEIGHT * 1;
    expect(beta(boosted)).toBeCloseTo(expected, 6);
    // and the boost is strictly larger than the default weight.
    expect(BUDGET_PANTRY_REUSE_WEIGHT).toBeGreaterThan(PANTRY_REUSE_WEIGHT);
  });
});
