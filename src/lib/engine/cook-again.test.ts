import { describe, expect, it } from "vitest";
import {
  COOK_AGAIN_HIGHLIGHT_THRESHOLD,
  COOK_AGAIN_MAX_AGE_DAYS,
  COOK_AGAIN_MIN_AGE_DAYS,
  cookAgainHighlightTier,
  cuisineRotationScore,
  pickReSuggestion,
  recencyScore,
  seasonalityFitScore,
} from "./cook-again";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(now: Date, days: number): string {
  return new Date(now.getTime() - days * DAY_MS).toISOString();
}

function fixtureSession(
  over: Partial<CookSessionRecord> = {},
): CookSessionRecord {
  return {
    sessionId: "cs-x",
    recipeSlug: "x",
    dishName: "X",
    cuisineFamily: "italian",
    startedAt: "2026-01-01T00:00:00Z",
    completedAt: "2026-01-01T01:00:00Z",
    rating: 5,
    favorite: false,
    ...over,
  };
}

// ── recencyScore ───────────────────────────────────────────

describe("recencyScore", () => {
  it("below MIN window → 0", () => {
    expect(recencyScore(20)).toBe(0);
    expect(recencyScore(0)).toBe(0);
  });

  it("above MAX window → 0", () => {
    // Y3 W6: MAX tightened from 90d to 56d. Anything past 56d
    // collapses to 0.
    expect(recencyScore(57)).toBe(0);
    expect(recencyScore(91)).toBe(0);
    expect(recencyScore(365)).toBe(0);
  });

  it("at the peak (35d) → 1", () => {
    expect(recencyScore(35)).toBe(1);
  });

  it("at MIN edge (21d) → 0.3", () => {
    expect(recencyScore(COOK_AGAIN_MIN_AGE_DAYS)).toBeCloseTo(0.3, 5);
  });

  it("at MAX edge (56d post-W6) → 0.3", () => {
    expect(recencyScore(COOK_AGAIN_MAX_AGE_DAYS)).toBeCloseTo(0.3, 5);
  });

  it("monotonic ramp up from 21d to 35d", () => {
    const a = recencyScore(25);
    const b = recencyScore(30);
    const c = recencyScore(35);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  it("monotonic ramp down from 35d to MAX", () => {
    // Y3 W6: MAX tightened from 90d to 56d. Sample within the
    // new window so the ramp-down still has values to compare.
    const a = recencyScore(35);
    const b = recencyScore(45);
    const c = recencyScore(55);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
  });
});

// ── seasonalityFitScore ────────────────────────────────────

describe("seasonalityFitScore", () => {
  it("winter dish in winter → 1.0", () => {
    expect(seasonalityFitScore("Tomato Soup", "italian", "winter")).toBe(1.0);
  });

  it("summer dish in summer → 1.0", () => {
    expect(seasonalityFitScore("Caesar Salad", "italian", "summer")).toBe(1.0);
  });

  it("winter dish in summer → 0.5", () => {
    expect(seasonalityFitScore("Beef Stew", "french", "summer")).toBe(0.5);
  });

  it("neutral dish (no derivable season) → 0.7", () => {
    expect(seasonalityFitScore("Bread", "french", "winter")).toBe(0.7);
  });
});

// ── cuisineRotationScore ───────────────────────────────────

describe("cuisineRotationScore", () => {
  const now = new Date("2026-05-15T12:00:00Z");

  it("no recent same-cuisine cook → 1.0", () => {
    expect(cuisineRotationScore("italian", [], now)).toBe(1.0);
  });

  it("same cuisine cooked yesterday → 0.5 penalty", () => {
    const history: CookSessionRecord[] = [
      fixtureSession({
        cuisineFamily: "italian",
        completedAt: daysAgo(now, 1),
      }),
    ];
    expect(cuisineRotationScore("italian", history, now)).toBe(0.5);
  });

  it("different cuisine cooked yesterday → 1.0", () => {
    const history: CookSessionRecord[] = [
      fixtureSession({ cuisineFamily: "indian", completedAt: daysAgo(now, 1) }),
    ];
    expect(cuisineRotationScore("italian", history, now)).toBe(1.0);
  });

  it("same cuisine cooked 8d ago → 1.0 (outside lookback)", () => {
    const history: CookSessionRecord[] = [
      fixtureSession({
        cuisineFamily: "italian",
        completedAt: daysAgo(now, 8),
      }),
    ];
    expect(cuisineRotationScore("italian", history, now)).toBe(1.0);
  });

  it("case-insensitive cuisine match", () => {
    const history: CookSessionRecord[] = [
      fixtureSession({
        cuisineFamily: "Italian",
        completedAt: daysAgo(now, 1),
      }),
    ];
    expect(cuisineRotationScore("italian", history, now)).toBe(0.5);
  });
});

// ── pickReSuggestion ───────────────────────────────────────

describe("pickReSuggestion — eligibility gates", () => {
  const now = new Date("2026-05-15T12:00:00Z");

  it("empty history → null", () => {
    expect(pickReSuggestion([], now)).toBe(null);
  });

  it("session with rating 4 → null (below MIN_RATING)", () => {
    const history = [
      fixtureSession({
        rating: 4,
        completedAt: daysAgo(now, 30),
      }),
    ];
    expect(pickReSuggestion(history, now)).toBe(null);
  });

  it("session 10 days old → null (too recent)", () => {
    const history = [
      fixtureSession({ rating: 5, completedAt: daysAgo(now, 10) }),
    ];
    expect(pickReSuggestion(history, now)).toBe(null);
  });

  it("session 100 days old → null (too old)", () => {
    const history = [
      fixtureSession({ rating: 5, completedAt: daysAgo(now, 100) }),
    ];
    expect(pickReSuggestion(history, now)).toBe(null);
  });

  it("session without completedAt → null", () => {
    const history = [fixtureSession({ rating: 5, completedAt: undefined })];
    expect(pickReSuggestion(history, now)).toBe(null);
  });

  it("session without rating → null", () => {
    const history = [
      fixtureSession({ rating: undefined, completedAt: daysAgo(now, 30) }),
    ];
    expect(pickReSuggestion(history, now)).toBe(null);
  });

  it("invalid completedAt → null", () => {
    const history = [fixtureSession({ rating: 5, completedAt: "not-a-date" })];
    expect(pickReSuggestion(history, now)).toBe(null);
  });
});

describe("pickReSuggestion — happy path", () => {
  const now = new Date("2026-05-15T12:00:00Z");

  it("single eligible session → returned", () => {
    const history = [
      fixtureSession({
        recipeSlug: "carbonara",
        dishName: "Carbonara",
        rating: 5,
        completedAt: daysAgo(now, 30),
      }),
    ];
    const out = pickReSuggestion(history, now);
    expect(out).not.toBe(null);
    expect(out?.recipeSlug).toBe("carbonara");
    expect(out?.lastRating).toBe(5);
    expect(out?.daysSinceLastCook).toBe(30);
  });

  it("returned shape includes score", () => {
    const history = [
      fixtureSession({ rating: 5, completedAt: daysAgo(now, 35) }),
    ];
    const out = pickReSuggestion(history, now);
    expect(out?.score).toBeGreaterThan(0);
    expect(out?.score).toBeLessThanOrEqual(1);
  });

  it("higher score wins (35d sweet spot beats 80d)", () => {
    const history: CookSessionRecord[] = [
      fixtureSession({
        recipeSlug: "old",
        dishName: "Old",
        cuisineFamily: "french",
        rating: 5,
        completedAt: daysAgo(now, 80),
      }),
      fixtureSession({
        recipeSlug: "sweet",
        dishName: "Sweet",
        cuisineFamily: "french",
        rating: 5,
        completedAt: daysAgo(now, 35),
      }),
    ];
    const out = pickReSuggestion(history, now);
    expect(out?.recipeSlug).toBe("sweet");
  });

  it("no double-suggest: most-recent cook of same recipe wins", () => {
    const history: CookSessionRecord[] = [
      fixtureSession({
        recipeSlug: "carbonara",
        sessionId: "old",
        rating: 5,
        completedAt: daysAgo(now, 80),
      }),
      fixtureSession({
        recipeSlug: "carbonara",
        sessionId: "newer",
        rating: 5,
        completedAt: daysAgo(now, 10), // too recent — kills eligibility
      }),
    ];
    expect(pickReSuggestion(history, now)).toBe(null);
  });

  it("tie on score → recipeSlug ascending wins (deterministic)", () => {
    const history: CookSessionRecord[] = [
      fixtureSession({
        recipeSlug: "zebra",
        dishName: "Z",
        cuisineFamily: "french",
        rating: 5,
        completedAt: daysAgo(now, 35),
      }),
      fixtureSession({
        recipeSlug: "apple",
        dishName: "A",
        cuisineFamily: "french",
        rating: 5,
        completedAt: daysAgo(now, 35),
      }),
    ];
    const out = pickReSuggestion(history, now);
    expect(out?.recipeSlug).toBe("apple");
  });

  it("cuisine-rotation penalty applied when same cuisine cooked recently", () => {
    const history: CookSessionRecord[] = [
      // Eligible re-suggest candidate — italian, 35d ago
      fixtureSession({
        recipeSlug: "carbonara",
        dishName: "Carbonara",
        cuisineFamily: "italian",
        rating: 5,
        completedAt: daysAgo(now, 35),
      }),
      // Recent italian cook within lookback window
      fixtureSession({
        recipeSlug: "marinara",
        dishName: "Marinara",
        cuisineFamily: "italian",
        rating: 4,
        completedAt: daysAgo(now, 2),
      }),
    ];
    const out = pickReSuggestion(history, now);
    expect(out).not.toBe(null);
    // Score is recency(35) × seasonality × rotation(0.5)
    // recency(35) = 1.0; seasonality for "Carbonara"+"italian" in May (spring) is 0.7;
    // rotation = 0.5 because of the recent italian cook
    expect(out?.score).toBeCloseTo(1.0 * 0.7 * 0.5, 5);
  });

  it("seasonality applied — winter dish in winter beats summer dish in winter", () => {
    const winter = new Date("2026-01-15T12:00:00Z");
    const history: CookSessionRecord[] = [
      fixtureSession({
        recipeSlug: "soup",
        dishName: "Tomato Soup",
        cuisineFamily: "italian",
        rating: 5,
        completedAt: new Date(winter.getTime() - 35 * DAY_MS).toISOString(),
      }),
      fixtureSession({
        recipeSlug: "salad",
        dishName: "Caesar Salad",
        cuisineFamily: "french",
        rating: 5,
        completedAt: new Date(winter.getTime() - 35 * DAY_MS).toISOString(),
      }),
    ];
    const out = pickReSuggestion(history, winter);
    expect(out?.recipeSlug).toBe("soup");
  });
});

describe("pickReSuggestion — determinism", () => {
  const now = new Date("2026-05-15T12:00:00Z");

  it("same inputs → same output", () => {
    const history: CookSessionRecord[] = [
      fixtureSession({
        recipeSlug: "carbonara",
        rating: 5,
        completedAt: daysAgo(now, 30),
      }),
      fixtureSession({
        recipeSlug: "risotto",
        rating: 5,
        completedAt: daysAgo(now, 40),
      }),
    ];
    const a = pickReSuggestion(history, now);
    const b = pickReSuggestion(history, now);
    expect(a).toEqual(b);
  });
});

// ── cookAgainHighlightTier (Y3 W6) ────────────────────────

describe("cookAgainHighlightTier", () => {
  it("score above threshold → true", () => {
    expect(cookAgainHighlightTier(0.9)).toBe(true);
    expect(cookAgainHighlightTier(1.0)).toBe(true);
  });

  it("score at threshold → true (inclusive)", () => {
    expect(cookAgainHighlightTier(COOK_AGAIN_HIGHLIGHT_THRESHOLD)).toBe(true);
  });

  it("score just below threshold → false", () => {
    expect(cookAgainHighlightTier(COOK_AGAIN_HIGHLIGHT_THRESHOLD - 0.001)).toBe(
      false,
    );
  });

  it("score well below threshold → false", () => {
    expect(cookAgainHighlightTier(0.5)).toBe(false);
    expect(cookAgainHighlightTier(0)).toBe(false);
  });

  it("non-finite score → false (defensive)", () => {
    expect(cookAgainHighlightTier(Number.NaN)).toBe(false);
    expect(cookAgainHighlightTier(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("threshold constant is 0.85 per the W6 plan", () => {
    expect(COOK_AGAIN_HIGHLIGHT_THRESHOLD).toBe(0.85);
  });
});
