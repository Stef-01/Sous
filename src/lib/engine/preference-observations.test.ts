import { describe, it, expect } from "vitest";
import {
  PREFERENCE_MIN_COOKS,
  derivePreferenceObservations,
} from "@/lib/engine/preference-observations";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

function makeSession(
  overrides: Partial<CookSessionRecord> & { completedAt: string },
): CookSessionRecord {
  return {
    sessionId:
      overrides.sessionId ?? `s-${Math.random().toString(36).slice(2)}`,
    recipeSlug: overrides.recipeSlug ?? "pasta-carbonara",
    dishName: overrides.dishName ?? "Pasta Carbonara",
    cuisineFamily: overrides.cuisineFamily ?? "italian",
    startedAt: overrides.startedAt ?? overrides.completedAt,
    completedAt: overrides.completedAt,
    rating: overrides.rating,
    favorite: overrides.favorite ?? false,
    ...overrides,
  } as CookSessionRecord;
}

describe("derivePreferenceObservations", () => {
  it("returns nothing below the min-cooks floor", () => {
    const sessions = Array.from({ length: PREFERENCE_MIN_COOKS - 1 }, (_, i) =>
      makeSession({ completedAt: `2026-04-0${i + 1}T12:00:00Z` }),
    );
    expect(derivePreferenceObservations(sessions)).toEqual([]);
  });

  it("surfaces cuisine concentration when one cuisine dominates", () => {
    const sessions: CookSessionRecord[] = [
      ...Array.from({ length: 5 }, (_, i) =>
        makeSession({
          cuisineFamily: "indian",
          completedAt: `2026-03-1${i}T12:00:00Z`,
        }),
      ),
      makeSession({
        cuisineFamily: "italian",
        completedAt: `2026-03-20T12:00:00Z`,
      }),
    ];
    const obs = derivePreferenceObservations(
      sessions,
      Date.parse("2026-04-01"),
    );
    expect(obs.length).toBeGreaterThan(0);
    expect(obs[0]!.text).toContain("Indian");
  });

  it("is deterministic across repeat calls", () => {
    const sessions = Array.from({ length: 8 }, (_, i) =>
      makeSession({
        cuisineFamily: i % 2 === 0 ? "indian" : "italian",
        completedAt: `2026-04-0${i + 1}T10:00:00Z`,
        rating: i % 3 === 0 ? 5 : 4,
      }),
    );
    const now = Date.parse("2026-04-15");
    const a = derivePreferenceObservations(sessions, now);
    const b = derivePreferenceObservations(sessions, now);
    expect(a).toEqual(b);
    expect(a.length).toBeLessThanOrEqual(3);
  });

  it("returns at most 3 observations", () => {
    const sessions: CookSessionRecord[] = Array.from({ length: 20 }, (_, i) =>
      makeSession({
        cuisineFamily: "indian",
        completedAt: `2026-04-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
        rating: 5,
      }),
    );
    const obs = derivePreferenceObservations(
      sessions,
      Date.parse("2026-04-25"),
    );
    expect(obs.length).toBeLessThanOrEqual(3);
  });
});
