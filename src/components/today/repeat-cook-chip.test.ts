import { describe, it, expect } from "vitest";
import { pickRepeatCandidate } from "./repeat-cook-chip";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

function session(overrides: Partial<CookSessionRecord>): CookSessionRecord {
  return {
    sessionId: overrides.sessionId ?? `s-${Math.random()}`,
    recipeSlug: overrides.recipeSlug ?? "masala-dal",
    dishName: overrides.dishName ?? "Masala Dal",
    cuisineFamily: overrides.cuisineFamily ?? "indian",
    startedAt: overrides.startedAt ?? "2025-01-01T00:00:00Z",
    completedAt: overrides.completedAt,
    rating: overrides.rating,
    favorite: overrides.favorite ?? false,
  };
}

describe("pickRepeatCandidate", () => {
  const now = new Date("2025-01-14T12:00:00Z").getTime();

  it("returns null for empty input", () => {
    expect(pickRepeatCandidate([], now)).toBeNull();
  });

  it("ignores sessions without a completedAt", () => {
    expect(
      pickRepeatCandidate(
        [session({ rating: 5, completedAt: undefined })],
        now,
      ),
    ).toBeNull();
  });

  it("ignores sessions rated below 4 stars", () => {
    expect(
      pickRepeatCandidate(
        [session({ rating: 3, completedAt: "2025-01-10T00:00:00Z" })],
        now,
      ),
    ).toBeNull();
  });

  it("ignores sessions older than 90 days", () => {
    expect(
      pickRepeatCandidate(
        [session({ rating: 5, completedAt: "2024-06-01T00:00:00Z" })],
        now,
      ),
    ).toBeNull();
  });

  it("prefers recent window candidates over revive window", () => {
    const older = session({
      recipeSlug: "masala-dal",
      dishName: "Masala Dal",
      rating: 5,
      completedAt: "2024-12-10T00:00:00Z", // ~35 days ago → revive
    });
    const newer = session({
      recipeSlug: "garlic-green-beans",
      dishName: "Garlic Green Beans",
      rating: 4,
      completedAt: "2025-01-12T00:00:00Z", // ~2 days ago → recent
    });
    const result = pickRepeatCandidate([older, newer], now);
    expect(result?.variant).toBe("recent");
    expect(result?.record.recipeSlug).toBe("garlic-green-beans");
  });

  it("surfaces a revive candidate when no recent love exists", () => {
    const revive = session({
      recipeSlug: "pasta-carbonara",
      dishName: "Pasta Carbonara",
      rating: 5,
      completedAt: "2024-12-20T00:00:00Z", // ~25 days ago → inside 21-90d
    });
    const result = pickRepeatCandidate([revive], now);
    expect(result).not.toBeNull();
    expect(result?.variant).toBe("revive");
    expect(result?.daysAgo).toBeGreaterThanOrEqual(21);
    expect(result?.daysAgo).toBeLessThanOrEqual(90);
  });

  it("treats 4-star cooks as eligible", () => {
    const result = pickRepeatCandidate(
      [session({ rating: 4, completedAt: "2025-01-13T00:00:00Z" })],
      now,
    );
    expect(result).not.toBeNull();
  });

  it("is silent in the 14-21 day dead zone", () => {
    // 17 days ago — between the recent window and revive window.
    const dead = session({
      rating: 5,
      completedAt: "2024-12-28T12:00:00Z",
    });
    expect(pickRepeatCandidate([dead], now)).toBeNull();
  });
});
