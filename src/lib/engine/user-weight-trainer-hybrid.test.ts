import { describe, expect, it } from "vitest";
import {
  composeUserWeights,
  pickTrainerMode,
} from "./user-weight-trainer-hybrid";
import { V3_COLD_START_THRESHOLD } from "./user-weight-trainer-v3";
import { DEFAULT_WEIGHTS } from "./types";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

function fixtureSession(
  over: Partial<CookSessionRecord> = {},
): CookSessionRecord {
  return {
    sessionId: "cs-x",
    recipeSlug: "x",
    dishName: "x",
    cuisineFamily: "indian",
    startedAt: "2026-01-01T00:00:00Z",
    completedAt: "2026-01-01T01:00:00Z",
    rating: 4,
    favorite: false,
    ...over,
  };
}

function withBreakdown(
  over: Partial<CookSessionRecord> = {},
): CookSessionRecord {
  return fixtureSession({
    engineScoreBreakdown: {
      cuisineFit: 0.5,
      flavorContrast: 0.5,
      nutritionBalance: 0.5,
      prepBurden: 0.5,
      temperature: 0.5,
      preference: 0.5,
      totalScore: 0.5,
    },
    ...over,
  });
}

// ── pickTrainerMode ────────────────────────────────────────

describe("pickTrainerMode", () => {
  it("breakdownCount >= V3_COLD_START_THRESHOLD → v3", () => {
    expect(pickTrainerMode(V3_COLD_START_THRESHOLD, 100)).toBe("v3");
    expect(pickTrainerMode(20, 0)).toBe("v3");
  });

  it("breakdown insufficient but v2 eligible >= 5 → v2", () => {
    expect(pickTrainerMode(0, 5)).toBe("v2");
    expect(pickTrainerMode(V3_COLD_START_THRESHOLD - 1, 5)).toBe("v2");
  });

  it("nothing eligible → default", () => {
    expect(pickTrainerMode(0, 0)).toBe("default");
    expect(pickTrainerMode(7, 4)).toBe("default");
  });
});

// ── composeUserWeights ─────────────────────────────────────

describe("composeUserWeights — cold start", () => {
  it("empty history → mode=default + DEFAULT_WEIGHTS", () => {
    const out = composeUserWeights([]);
    expect(out.mode).toBe("default");
    expect(out.weights).toEqual(DEFAULT_WEIGHTS);
    expect(out.breakdownCookCount).toBe(0);
    expect(out.v2EligibleCookCount).toBe(0);
  });

  it("single completed cook → still default (below all thresholds)", () => {
    expect(composeUserWeights([fixtureSession()]).mode).toBe("default");
  });
});

describe("composeUserWeights — V2 mode", () => {
  it("5 V2-eligible + 0 breakdown → v2 mode", () => {
    const sessions = Array.from({ length: 5 }, (_, i) =>
      fixtureSession({ sessionId: `s-${i}` }),
    );
    const out = composeUserWeights(sessions);
    expect(out.mode).toBe("v2");
    expect(out.v2EligibleCookCount).toBe(5);
    expect(out.breakdownCookCount).toBe(0);
  });

  it("v2 mode emits trainer-shaped weights (sums to 1)", () => {
    const sessions = Array.from({ length: 6 }, (_, i) =>
      fixtureSession({ sessionId: `s-${i}` }),
    );
    const out = composeUserWeights(sessions);
    const sum = Object.values(out.weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });
});

describe("composeUserWeights — V3 mode", () => {
  it("V3 threshold breakdowns + V2 eligible → v3 mode", () => {
    const sessions = [
      ...Array.from({ length: V3_COLD_START_THRESHOLD }, (_, i) =>
        withBreakdown({ sessionId: `b-${i}` }),
      ),
      ...Array.from({ length: 3 }, (_, i) =>
        fixtureSession({ sessionId: `v2-${i}` }),
      ),
    ];
    const out = composeUserWeights(sessions);
    expect(out.mode).toBe("v3");
  });

  it("breakdownCookCount counts only sessions with breakdown", () => {
    const sessions = [
      withBreakdown({ sessionId: "b-1" }),
      withBreakdown({ sessionId: "b-2" }),
      fixtureSession({ sessionId: "v-1" }),
    ];
    const out = composeUserWeights(sessions);
    expect(out.breakdownCookCount).toBe(2);
    expect(out.v2EligibleCookCount).toBe(3);
  });

  it("returns a fresh weights object — not the DEFAULT_WEIGHTS reference", () => {
    const out = composeUserWeights([]);
    expect(out.weights).not.toBe(DEFAULT_WEIGHTS);
  });
});
