import { describe, expect, it } from "vitest";
import { deriveConfidence } from "./confidence-dial";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

function makeSession(rating?: number): CookSessionRecord {
  return {
    sessionId: `s-${Math.random()}`,
    recipeSlug: "test",
    dishName: "Test",
    cuisineFamily: "italian",
    startedAt: "2025-01-01",
    completedAt: "2025-01-01",
    favorite: false,
    rating,
  };
}

describe("deriveConfidence", () => {
  it("returns Steady for a brand-new cook", () => {
    const reading = deriveConfidence(
      { completedCooks: 0, cuisinesCovered: [] },
      [],
    );
    expect(reading.tier).toBe("Steady");
    expect(reading.score).toBe(0);
  });

  it("keeps ratingScore at 0 when fewer than 3 cooks are rated", () => {
    // Even two five-star cooks shouldn't spike the rating portion.
    const reading = deriveConfidence(
      { completedCooks: 2, cuisinesCovered: ["italian"] },
      [makeSession(5), makeSession(5)],
    );
    expect(reading.breakdown.ratingScore).toBe(0);
  });

  it("climbs into Bold once cooks and cuisines accumulate", () => {
    const reading = deriveConfidence(
      { completedCooks: 10, cuisinesCovered: ["italian", "thai", "indian"] },
      [makeSession(5), makeSession(4), makeSession(3)],
    );
    // 0.4*(10/30) + 0.35*(3/10) + 0.25*(2/3) ≈ 0.133 + 0.105 + 0.167 = 0.405
    expect(reading.score).toBeGreaterThan(0.25);
    expect(reading.score).toBeLessThan(0.5);
    expect(reading.tier).toBe("Bold");
  });

  it("reaches Master with heavy cooking + diverse cuisines + strong ratings", () => {
    const sessions = Array.from({ length: 20 }, () => makeSession(5));
    const reading = deriveConfidence(
      {
        completedCooks: 30,
        cuisinesCovered: [
          "italian",
          "thai",
          "indian",
          "japanese",
          "mexican",
          "french",
          "chinese",
          "mediterranean",
          "korean",
          "american",
        ],
      },
      sessions,
    );
    expect(reading.tier).toBe("Master");
    expect(reading.score).toBeGreaterThanOrEqual(0.75);
  });

  it("caps the score at 1.0 even with excessive input", () => {
    const sessions = Array.from({ length: 50 }, () => makeSession(5));
    const reading = deriveConfidence(
      {
        completedCooks: 500,
        cuisinesCovered: Array.from({ length: 50 }, (_, i) => `c${i}`),
      },
      sessions,
    );
    expect(reading.score).toBeLessThanOrEqual(1);
  });
});
