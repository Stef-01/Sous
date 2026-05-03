import { describe, expect, it } from "vitest";
import {
  composeUserWeights,
  isV3TrainerEnabled,
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

const V3_ON = { SOUS_V3_TRAINER_ENABLED: "true" } as const;
const V3_OFF = {} as const;

// ── isV3TrainerEnabled ─────────────────────────────────────

describe("isV3TrainerEnabled", () => {
  it("SOUS_V3_TRAINER_ENABLED='true' → true", () => {
    expect(isV3TrainerEnabled({ SOUS_V3_TRAINER_ENABLED: "true" })).toBe(true);
  });

  it("NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED='true' → true", () => {
    expect(
      isV3TrainerEnabled({ NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED: "true" }),
    ).toBe(true);
  });

  it("either flag set → true even if the other is missing", () => {
    expect(
      isV3TrainerEnabled({
        SOUS_V3_TRAINER_ENABLED: "true",
        NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED: undefined,
      }),
    ).toBe(true);
  });

  it("empty env → false", () => {
    expect(isV3TrainerEnabled({})).toBe(false);
  });

  it("flag set to 'false' → false", () => {
    expect(isV3TrainerEnabled({ SOUS_V3_TRAINER_ENABLED: "false" })).toBe(
      false,
    );
  });

  it("strict-equality on 'true' — case-fold / coercion stays off", () => {
    expect(isV3TrainerEnabled({ SOUS_V3_TRAINER_ENABLED: "TRUE" })).toBe(false);
    expect(isV3TrainerEnabled({ SOUS_V3_TRAINER_ENABLED: "1" })).toBe(false);
    expect(isV3TrainerEnabled({ SOUS_V3_TRAINER_ENABLED: "yes" })).toBe(false);
    expect(isV3TrainerEnabled({ SOUS_V3_TRAINER_ENABLED: " true" })).toBe(
      false,
    );
  });
});

// ── pickTrainerMode ────────────────────────────────────────

describe("pickTrainerMode", () => {
  it("breakdownCount >= threshold + v3Enabled → v3", () => {
    expect(pickTrainerMode(V3_COLD_START_THRESHOLD, 100, true)).toBe("v3");
    expect(pickTrainerMode(20, 0, true)).toBe("v3");
  });

  it("breakdown insufficient but v2 eligible >= 5 → v2", () => {
    expect(pickTrainerMode(0, 5, true)).toBe("v2");
    expect(pickTrainerMode(V3_COLD_START_THRESHOLD - 1, 5, true)).toBe("v2");
    expect(pickTrainerMode(0, 5, false)).toBe("v2");
  });

  it("nothing eligible → default", () => {
    expect(pickTrainerMode(0, 0, true)).toBe("default");
    expect(pickTrainerMode(7, 4, true)).toBe("default");
    expect(pickTrainerMode(0, 0, false)).toBe("default");
  });

  it("v3Enabled=false + enough breakdowns + enough v2 → falls back to v2", () => {
    expect(pickTrainerMode(V3_COLD_START_THRESHOLD, 5, false)).toBe("v2");
    expect(pickTrainerMode(20, 100, false)).toBe("v2");
  });

  it("v3Enabled=false + enough breakdowns + no v2 → default", () => {
    expect(pickTrainerMode(V3_COLD_START_THRESHOLD, 0, false)).toBe("default");
    expect(pickTrainerMode(20, 4, false)).toBe("default");
  });

  it("v3Enabled defaults to false (production-safe)", () => {
    // No third arg → flag-off default → V2 even with V3-eligible counts
    expect(pickTrainerMode(V3_COLD_START_THRESHOLD, 100)).toBe("v2");
    expect(pickTrainerMode(V3_COLD_START_THRESHOLD, 0)).toBe("default");
  });
});

// ── composeUserWeights ─────────────────────────────────────

describe("composeUserWeights — cold start", () => {
  it("empty history → mode=default + DEFAULT_WEIGHTS", () => {
    const out = composeUserWeights([], { env: V3_OFF });
    expect(out.mode).toBe("default");
    expect(out.weights).toEqual(DEFAULT_WEIGHTS);
    expect(out.breakdownCookCount).toBe(0);
    expect(out.v2EligibleCookCount).toBe(0);
    expect(out.v3Enabled).toBe(false);
  });

  it("single completed cook → still default (below all thresholds)", () => {
    expect(composeUserWeights([fixtureSession()], { env: V3_OFF }).mode).toBe(
      "default",
    );
  });
});

describe("composeUserWeights — V2 mode", () => {
  it("5 V2-eligible + 0 breakdown → v2 mode", () => {
    const sessions = Array.from({ length: 5 }, (_, i) =>
      fixtureSession({ sessionId: `s-${i}` }),
    );
    const out = composeUserWeights(sessions, { env: V3_ON });
    expect(out.mode).toBe("v2");
    expect(out.v2EligibleCookCount).toBe(5);
    expect(out.breakdownCookCount).toBe(0);
  });

  it("v2 mode emits trainer-shaped weights (sums to 1)", () => {
    const sessions = Array.from({ length: 6 }, (_, i) =>
      fixtureSession({ sessionId: `s-${i}` }),
    );
    const out = composeUserWeights(sessions, { env: V3_OFF });
    const sum = Object.values(out.weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });
});

describe("composeUserWeights — V3 gate", () => {
  it("flag on + threshold breakdowns → v3 mode", () => {
    const sessions = [
      ...Array.from({ length: V3_COLD_START_THRESHOLD }, (_, i) =>
        withBreakdown({ sessionId: `b-${i}` }),
      ),
      ...Array.from({ length: 3 }, (_, i) =>
        fixtureSession({ sessionId: `v2-${i}` }),
      ),
    ];
    const out = composeUserWeights(sessions, { env: V3_ON });
    expect(out.mode).toBe("v3");
    expect(out.v3Enabled).toBe(true);
  });

  it("flag off + threshold breakdowns + v2 eligible → v2 mode (gate active)", () => {
    const sessions = Array.from({ length: V3_COLD_START_THRESHOLD }, (_, i) =>
      withBreakdown({ sessionId: `b-${i}` }),
    );
    const out = composeUserWeights(sessions, { env: V3_OFF });
    expect(out.mode).toBe("v2");
    expect(out.v3Enabled).toBe(false);
    expect(out.breakdownCookCount).toBe(V3_COLD_START_THRESHOLD);
  });

  it("flag on but breakdowns short → falls back to v2", () => {
    const sessions = Array.from({ length: 5 }, (_, i) =>
      fixtureSession({ sessionId: `s-${i}` }),
    );
    const out = composeUserWeights(sessions, { env: V3_ON });
    expect(out.mode).toBe("v2");
    expect(out.v3Enabled).toBe(true);
  });

  it("NEXT_PUBLIC variant of the flag also enables", () => {
    const sessions = Array.from({ length: V3_COLD_START_THRESHOLD }, (_, i) =>
      withBreakdown({ sessionId: `b-${i}` }),
    );
    const out = composeUserWeights(sessions, {
      env: { NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED: "true" },
    });
    expect(out.mode).toBe("v3");
    expect(out.v3Enabled).toBe(true);
  });

  it("breakdownCookCount counts only sessions with breakdown", () => {
    const sessions = [
      withBreakdown({ sessionId: "b-1" }),
      withBreakdown({ sessionId: "b-2" }),
      fixtureSession({ sessionId: "v-1" }),
    ];
    const out = composeUserWeights(sessions, { env: V3_OFF });
    expect(out.breakdownCookCount).toBe(2);
    expect(out.v2EligibleCookCount).toBe(3);
  });

  it("returns a fresh weights object — not the DEFAULT_WEIGHTS reference", () => {
    const out = composeUserWeights([], { env: V3_OFF });
    expect(out.weights).not.toBe(DEFAULT_WEIGHTS);
  });
});
