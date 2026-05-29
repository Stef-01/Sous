import { describe, expect, it } from "vitest";
import {
  AROMA_PROFILES,
  combinationPairingScore,
  ingredientAromaSlug,
  profilePairingScore,
  type AromaProfile,
} from "./aroma-pairing";

describe("AROMA_PROFILES catalog", () => {
  it("loads at least 8 starter profiles", () => {
    expect(Object.keys(AROMA_PROFILES).length).toBeGreaterThanOrEqual(8);
  });

  it("every profile has tags array", () => {
    for (const slug of Object.keys(AROMA_PROFILES)) {
      const p = AROMA_PROFILES[slug];
      expect(p).toBeDefined();
      if (p) {
        expect(Array.isArray(p.tags)).toBe(true);
        expect(p.tags.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("ingredientAromaSlug", () => {
  it("ham → savoury-meaty", () => {
    expect(ingredientAromaSlug("ham")).toBe("savoury-meaty");
  });

  it("case + whitespace insensitive", () => {
    expect(ingredientAromaSlug("  HAM  ")).toBe("savoury-meaty");
  });

  it("multi-word ingredient match", () => {
    expect(ingredientAromaSlug("sharp cheese")).toBe("umami-deep");
  });

  it("unknown ingredient → null", () => {
    expect(ingredientAromaSlug("dragon fruit")).toBeNull();
  });

  it("empty string → null", () => {
    expect(ingredientAromaSlug("")).toBeNull();
  });
});

describe("profilePairingScore", () => {
  const a: AromaProfile = { label: "x", tags: ["fruity-sweet", "citrus-zest"] };
  const b: AromaProfile = { label: "y", tags: ["fruity-sweet", "earthy-deep"] };
  const c: AromaProfile = { label: "z", tags: ["umami-rich", "smoky-warm"] };

  it("identical sets → 1.0", () => {
    expect(profilePairingScore(a, a)).toBe(1);
  });

  it("partial overlap → between 0 and 1", () => {
    const score = profilePairingScore(a, b);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it("no overlap → 0", () => {
    expect(profilePairingScore(a, c)).toBe(0);
  });

  it("symmetric — score(a,b) == score(b,a)", () => {
    expect(profilePairingScore(a, b)).toBe(profilePairingScore(b, a));
  });

  it("empty tags → 0 (defensive)", () => {
    expect(profilePairingScore({ label: "e", tags: [] }, a)).toBe(0);
  });
});

describe("combinationPairingScore", () => {
  it("ham + sharp cheese + pear (the W8 argyle pattern) → high score", () => {
    const score = combinationPairingScore(["ham", "sharp cheese", "pear"]);
    expect(score).toBeGreaterThan(0);
  });

  it("ingredients without aroma mapping → neutral 0.5 fallback", () => {
    expect(combinationPairingScore(["dragon fruit", "klingon spice"])).toBe(
      0.5,
    );
  });

  it("single ingredient → 0.5 (no pair to score)", () => {
    expect(combinationPairingScore(["ham"])).toBe(0.5);
  });

  it("empty list → 0.5", () => {
    expect(combinationPairingScore([])).toBe(0.5);
  });

  it("score is in [0, 1]", () => {
    const score = combinationPairingScore(["tomato", "mozzarella", "basil"]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("partial mapping (1 of 3 mapped) → fallback 0.5 (need >= 2 resolved)", () => {
    expect(combinationPairingScore(["ham", "klingon", "vulcan"])).toBe(0.5);
  });

  it("case-insensitive ingredient lookup", () => {
    const a = combinationPairingScore(["HAM", "SHARP CHEESE", "PEAR"]);
    const b = combinationPairingScore(["ham", "sharp cheese", "pear"]);
    expect(a).toBe(b);
  });

  it("deterministic — same input → same score", () => {
    const ings = ["tomato", "mozzarella", "basil"];
    expect(combinationPairingScore(ings)).toBe(combinationPairingScore(ings));
  });
});
