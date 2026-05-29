import { describe, expect, it } from "vitest";
import { countQualifyingCooks } from "./active-challenge-banner";
import type { Challenge } from "@/lib/eco/seasonal-challenges";

const SPRING_GREENS: Challenge = {
  slug: "spring-greens-test",
  kind: "seasonal",
  title: "Spring Greens",
  subtitle: "test fixture",
  featuredIngredients: ["asparagus", "arugula", "spinach"],
  startsAt: "2026-03-20T00:00:00Z",
  endsAt: "2026-06-21T00:00:00Z",
  targetCooks: 3,
  estCo2eSavedPerCookKg: 0.5,
  sponsoredBy: null,
};

describe("countQualifyingCooks", () => {
  it("returns 0 for an empty cook list", () => {
    expect(
      countQualifyingCooks({
        cooks: [],
        challenge: SPRING_GREENS,
      }),
    ).toBe(0);
  });

  it("counts cooks whose recipe ingredients match featured slugs", () => {
    expect(
      countQualifyingCooks({
        cooks: [
          { recipeIngredients: ["asparagus-stir-fry"] },
          { recipeIngredients: ["spinach-pesto-pasta"] },
          { recipeIngredients: ["beef-bourguignon"] },
        ],
        challenge: SPRING_GREENS,
      }),
    ).toBe(2);
  });

  it("ignores cooks whose recipe ingredients do not match anything", () => {
    expect(
      countQualifyingCooks({
        cooks: [
          { recipeIngredients: ["beef-bourguignon"] },
          { recipeIngredients: ["chocolate-cake"] },
        ],
        challenge: SPRING_GREENS,
      }),
    ).toBe(0);
  });

  it("substring-matches conservatively (lemon zest → lemon)", () => {
    const lemonChallenge: Challenge = {
      ...SPRING_GREENS,
      slug: "lemon",
      featuredIngredients: ["lemon"],
    };
    expect(
      countQualifyingCooks({
        cooks: [
          { recipeIngredients: ["lemon-zest-pasta"] },
          { recipeIngredients: ["preserved-lemons"] },
        ],
        challenge: lemonChallenge,
      }),
    ).toBe(2);
  });

  it("counts each cook at most once even with multiple matches", () => {
    expect(
      countQualifyingCooks({
        cooks: [
          {
            // Single cook with two matching ingredients should count once.
            recipeIngredients: ["asparagus", "spinach"],
          },
        ],
        challenge: SPRING_GREENS,
      }),
    ).toBe(1);
  });
});
