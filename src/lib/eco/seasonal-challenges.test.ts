import { describe, expect, it } from "vitest";
import {
  activeChallenges,
  computeChallengeProgress,
  daysRemaining,
  recipeMatchesChallenge,
  SEASONAL_CHALLENGES_2026,
  type Challenge,
} from "./seasonal-challenges";

const springGreens = SEASONAL_CHALLENGES_2026.find(
  (c) => c.slug === "spring-greens-2026",
) as Challenge;

describe("activeChallenges", () => {
  it("returns the spring-greens challenge during May 2026", () => {
    const out = activeChallenges({ now: new Date("2026-05-04T00:00:00Z") });
    expect(out.some((c) => c.slug === "spring-greens-2026")).toBe(true);
  });

  it("excludes a challenge whose end has passed", () => {
    const out = activeChallenges({ now: new Date("2026-07-01T00:00:00Z") });
    expect(out.some((c) => c.slug === "spring-greens-2026")).toBe(false);
  });

  it("excludes a challenge before its start", () => {
    const out = activeChallenges({ now: new Date("2026-01-01T00:00:00Z") });
    expect(out.some((c) => c.slug === "spring-greens-2026")).toBe(false);
    // Winter citrus IS active in January.
    expect(out.some((c) => c.slug === "winter-citrus-2026")).toBe(true);
  });

  it("returns empty for a non-finite now", () => {
    expect(activeChallenges({ now: new Date("not a date") })).toEqual([]);
  });

  it("end date is exclusive (last second of last day excluded)", () => {
    // spring-greens ends 2026-06-21T00:00:00Z exclusive.
    const out = activeChallenges({ now: new Date("2026-06-21T00:00:00Z") });
    expect(out.some((c) => c.slug === "spring-greens-2026")).toBe(false);
  });

  it("start date is inclusive (first second included)", () => {
    const out = activeChallenges({ now: new Date("2026-03-20T00:00:00Z") });
    expect(out.some((c) => c.slug === "spring-greens-2026")).toBe(true);
  });
});

describe("daysRemaining", () => {
  it("counts whole days left to end", () => {
    expect(
      daysRemaining({
        challenge: springGreens,
        now: new Date("2026-05-22T00:00:00Z"),
      }),
    ).toBe(30); // May 22 → June 21 = 30 days
  });

  it("returns 0 once the end has passed", () => {
    expect(
      daysRemaining({
        challenge: springGreens,
        now: new Date("2026-07-01T00:00:00Z"),
      }),
    ).toBe(0);
  });

  it("returns 0 for non-finite now", () => {
    expect(
      daysRemaining({
        challenge: springGreens,
        now: new Date("nope"),
      }),
    ).toBe(0);
  });
});

describe("recipeMatchesChallenge", () => {
  it("matches when a recipe ingredient contains a featured term", () => {
    expect(
      recipeMatchesChallenge({
        recipeIngredients: ["fresh spinach", "olive oil"],
        challenge: springGreens,
      }),
    ).toBe(true);
  });

  it("matches case-insensitively + on substring", () => {
    expect(
      recipeMatchesChallenge({
        recipeIngredients: ["Lemon Zest", "ASPARAGUS spears"],
        challenge: springGreens,
      }),
    ).toBe(true);
  });

  it("returns false when no ingredient matches", () => {
    expect(
      recipeMatchesChallenge({
        recipeIngredients: ["chicken thigh", "rice"],
        challenge: springGreens,
      }),
    ).toBe(false);
  });

  it("survives non-string entries in the ingredient list", () => {
    expect(
      recipeMatchesChallenge({
        recipeIngredients: [
          null as unknown as string,
          undefined as unknown as string,
          "peas",
        ],
        challenge: springGreens,
      }),
    ).toBe(true);
  });

  it("returns false for empty recipe ingredients", () => {
    expect(
      recipeMatchesChallenge({
        recipeIngredients: [],
        challenge: springGreens,
      }),
    ).toBe(false);
  });
});

describe("computeChallengeProgress", () => {
  it("returns zero progress when no qualifying cooks", () => {
    const out = computeChallengeProgress({
      challenge: springGreens,
      qualifyingCookCount: 0,
    });
    expect(out.completedCooks).toBe(0);
    expect(out.progressFraction).toBe(0);
    expect(out.completed).toBe(false);
    expect(out.totalCo2eSavedKg).toBe(0);
  });

  it("clamps progressFraction at 1 when over-target", () => {
    const out = computeChallengeProgress({
      challenge: springGreens,
      qualifyingCookCount: 99,
    });
    expect(out.progressFraction).toBe(1);
    expect(out.completed).toBe(true);
  });

  it("computes CO2e saved as cooks × per-cook estimate (rounded)", () => {
    const out = computeChallengeProgress({
      challenge: springGreens,
      qualifyingCookCount: 3,
    });
    // 3 × 2.6 = 7.8 kg
    expect(out.totalCo2eSavedKg).toBeCloseTo(7.8, 1);
  });

  it("completed flag flips at exactly the target", () => {
    const out = computeChallengeProgress({
      challenge: springGreens,
      qualifyingCookCount: springGreens.targetCooks,
    });
    expect(out.completed).toBe(true);
  });

  it("clamps negative cook counts to 0", () => {
    const out = computeChallengeProgress({
      challenge: springGreens,
      qualifyingCookCount: -5,
    });
    expect(out.completedCooks).toBe(0);
    expect(out.totalCo2eSavedKg).toBe(0);
  });
});
