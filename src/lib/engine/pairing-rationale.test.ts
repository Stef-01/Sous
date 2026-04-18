import { describe, it, expect } from "vitest";
import {
  buildPairingRationale,
  RATIONALE_MIN_COOKS,
} from "@/lib/engine/pairing-rationale";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

function makeSession(
  overrides: Partial<CookSessionRecord> & {
    recipeSlug: string;
    dishName: string;
    completedAt: string;
  },
): CookSessionRecord {
  return {
    sessionId: overrides.sessionId ?? `s-${overrides.recipeSlug}`,
    cuisineFamily: overrides.cuisineFamily ?? "italian",
    startedAt: overrides.completedAt,
    favorite: overrides.favorite ?? false,
    ...overrides,
  } as CookSessionRecord;
}

describe("buildPairingRationale", () => {
  it("stays silent below the cook-count floor", () => {
    const sessions = Array.from({ length: RATIONALE_MIN_COOKS - 1 }, (_, i) =>
      makeSession({
        recipeSlug: `pasta-carbonara`,
        dishName: "Pasta Carbonara",
        completedAt: `2026-04-0${i + 1}T10:00:00Z`,
      }),
    );
    const result = buildPairingRationale({
      currentDishSlug: "pasta-alfredo",
      cookHistory: sessions,
      now: Date.parse("2026-04-10T00:00:00Z"),
    });
    expect(result).toBeNull();
  });

  it("returns null when no recent session overlaps enough axes", () => {
    const sessions = Array.from({ length: 6 }, (_, i) =>
      makeSession({
        recipeSlug: `korean-bibimbap`,
        dishName: "Bibimbap",
        cuisineFamily: "korean",
        completedAt: `2026-03-0${i + 1}T10:00:00Z`,
      }),
    );
    const result = buildPairingRationale({
      currentDishSlug: "pasta-carbonara",
      cookHistory: sessions,
      now: Date.parse("2026-04-01T00:00:00Z"),
    });
    // Bibimbap (korean bowl) vs carbonara (italian pasta) — different
    // axes, nothing to surface.
    expect(result).toBeNull();
  });

  it("is deterministic given identical inputs", () => {
    const sessions = [
      ...Array.from({ length: 4 }, (_, i) =>
        makeSession({
          recipeSlug: "pasta-carbonara",
          dishName: "Pasta Carbonara",
          cuisineFamily: "italian",
          completedAt: `2026-04-0${i + 1}T10:00:00Z`,
        }),
      ),
      makeSession({
        recipeSlug: "pasta-carbonara",
        dishName: "Pasta Carbonara",
        cuisineFamily: "italian",
        completedAt: `2026-04-10T10:00:00Z`,
      }),
    ];
    const now = Date.parse("2026-04-15T00:00:00Z");
    const a = buildPairingRationale({
      currentDishSlug: "pasta-alfredo",
      cookHistory: sessions,
      now,
    });
    const b = buildPairingRationale({
      currentDishSlug: "pasta-alfredo",
      cookHistory: sessions,
      now,
    });
    expect(a).toEqual(b);
  });
});
