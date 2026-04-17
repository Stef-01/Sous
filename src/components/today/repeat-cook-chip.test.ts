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
    const result = pickRepeatCandidate(
      [session({ rating: 5, completedAt: undefined })],
      now,
    );
    expect(result).toBeNull();
  });

  it("ignores sessions rated below 4 stars", () => {
    const result = pickRepeatCandidate(
      [session({ rating: 3, completedAt: "2025-01-10T00:00:00Z" })],
      now,
    );
    expect(result).toBeNull();
  });

  it("ignores sessions older than 14 days", () => {
    const result = pickRepeatCandidate(
      [session({ rating: 5, completedAt: "2024-12-01T00:00:00Z" })],
      now,
    );
    expect(result).toBeNull();
  });

  it("returns the most recent qualifying session", () => {
    const older = session({
      recipeSlug: "masala-dal",
      dishName: "Masala Dal",
      rating: 5,
      completedAt: "2025-01-05T00:00:00Z",
    });
    const newer = session({
      recipeSlug: "garlic-green-beans",
      dishName: "Garlic Green Beans",
      rating: 4,
      completedAt: "2025-01-12T00:00:00Z",
    });
    const result = pickRepeatCandidate([older, newer], now);
    expect(result?.recipeSlug).toBe("garlic-green-beans");
  });

  it("treats 4-star cooks as eligible", () => {
    const result = pickRepeatCandidate(
      [session({ rating: 4, completedAt: "2025-01-13T00:00:00Z" })],
      now,
    );
    expect(result).not.toBeNull();
  });
});
