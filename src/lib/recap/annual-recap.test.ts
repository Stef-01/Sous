import { describe, expect, it } from "vitest";
import { buildAnnualRecap } from "./annual-recap";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

const NOW = new Date("2026-12-15T12:00:00Z");

function mkSession(
  overrides: Partial<CookSessionRecord> & {
    completedAt?: string;
    cuisineFamily?: string;
    rating?: number;
  } = {},
): CookSessionRecord {
  return {
    sessionId:
      overrides.sessionId ?? `s-${Math.random().toString(36).slice(2)}`,
    recipeSlug: overrides.recipeSlug ?? "x",
    dishName: overrides.dishName ?? "X",
    cuisineFamily: overrides.cuisineFamily ?? "italian",
    startedAt: overrides.completedAt ?? "2026-05-01T12:00:00Z",
    completedAt: overrides.completedAt ?? "2026-05-01T12:00:00Z",
    favorite: false,
    ...overrides,
  };
}

describe("buildAnnualRecap", () => {
  it("returns zero-state for an empty session list", () => {
    const r = buildAnnualRecap({ sessions: [], now: NOW });
    expect(r.year).toBe(2026);
    expect(r.totalCooks).toBe(0);
    expect(r.distinctCuisines).toBe(0);
    expect(r.distinctDishes).toBe(0);
    expect(r.avgRating).toBe(0);
    expect(r.topCuisines).toEqual([]);
    expect(r.topDishes).toEqual([]);
    expect(r.signatureDishSlug).toBeNull();
    expect(r.byMonth).toHaveLength(12);
    expect(r.byMonth.every((m) => m.cookCount === 0)).toBe(true);
  });

  it("scopes sessions to the target year (UTC)", () => {
    const r = buildAnnualRecap({
      sessions: [
        mkSession({ completedAt: "2025-12-31T23:00:00Z" }),
        mkSession({ completedAt: "2026-01-01T01:00:00Z" }),
        mkSession({ completedAt: "2026-12-31T23:00:00Z" }),
        mkSession({ completedAt: "2027-01-01T01:00:00Z" }),
      ],
      now: NOW,
    });
    expect(r.totalCooks).toBe(2);
  });

  it("groups by month using UTC", () => {
    const r = buildAnnualRecap({
      sessions: [
        mkSession({ completedAt: "2026-01-15T00:00:00Z" }),
        mkSession({ completedAt: "2026-05-15T00:00:00Z" }),
        mkSession({ completedAt: "2026-05-20T00:00:00Z" }),
        mkSession({ completedAt: "2026-12-31T23:00:00Z" }),
      ],
      now: NOW,
    });
    expect(r.byMonth[0].cookCount).toBe(1); // Jan
    expect(r.byMonth[4].cookCount).toBe(2); // May
    expect(r.byMonth[11].cookCount).toBe(1); // Dec
  });

  it("counts top cuisines case-insensitively", () => {
    const r = buildAnnualRecap({
      sessions: [
        mkSession({ cuisineFamily: "italian" }),
        mkSession({ cuisineFamily: "Italian" }),
        mkSession({ cuisineFamily: "indian" }),
      ],
      now: NOW,
    });
    expect(r.distinctCuisines).toBe(2);
    expect(r.topCuisines[0].label.toLowerCase()).toBe("italian");
    expect(r.topCuisines[0].count).toBe(2);
  });

  it("ranks dishes by count + tie-breaks alphabetically", () => {
    const r = buildAnnualRecap({
      sessions: [
        mkSession({ recipeSlug: "a", dishName: "A" }),
        mkSession({ recipeSlug: "a", dishName: "A" }),
        mkSession({ recipeSlug: "b", dishName: "B" }),
        mkSession({ recipeSlug: "c", dishName: "C" }),
        mkSession({ recipeSlug: "c", dishName: "C" }),
      ],
      now: NOW,
    });
    // A and C both at 2; alphabetical → A first.
    expect(r.topDishes[0].label).toBe("A");
    expect(r.topDishes[1].label).toBe("C");
    expect(r.topDishes[2].label).toBe("B");
    expect(r.signatureDishSlug).toBe("a");
  });

  it("computes avg rating only over rated cooks (1–5)", () => {
    const r = buildAnnualRecap({
      sessions: [
        mkSession({ rating: 5 }),
        mkSession({ rating: 4 }),
        mkSession({ rating: 0 }), // out-of-range, dropped
        mkSession({}), // unrated
      ],
      now: NOW,
    });
    expect(r.ratingCount).toBe(2);
    expect(r.avgRating).toBe(4.5);
  });

  it("drops sessions with malformed completedAt", () => {
    const r = buildAnnualRecap({
      sessions: [
        mkSession({ completedAt: "2026-05-01T00:00:00Z" }),
        mkSession({ completedAt: "not-a-date" }),
        { ...mkSession(), completedAt: undefined },
      ],
      now: NOW,
    });
    expect(r.totalCooks).toBe(1);
  });

  it("caps top lists at 5 entries", () => {
    const sessions: CookSessionRecord[] = [];
    for (let i = 0; i < 10; i++) {
      sessions.push(
        mkSession({
          recipeSlug: `slug-${i}`,
          dishName: `Dish${i}`,
          cuisineFamily: `cuisine-${i}`,
        }),
      );
    }
    const r = buildAnnualRecap({ sessions, now: NOW });
    expect(r.topCuisines).toHaveLength(5);
    expect(r.topDishes).toHaveLength(5);
  });

  it("share fractions sum to ≤1 over the top entries", () => {
    const r = buildAnnualRecap({
      sessions: [
        mkSession({ cuisineFamily: "italian" }),
        mkSession({ cuisineFamily: "italian" }),
        mkSession({ cuisineFamily: "indian" }),
      ],
      now: NOW,
    });
    const total = r.topCuisines.reduce((acc, e) => acc + e.share, 0);
    expect(total).toBeLessThanOrEqual(1.0001);
    expect(r.topCuisines[0].share).toBeCloseTo(2 / 3, 5);
  });
});
