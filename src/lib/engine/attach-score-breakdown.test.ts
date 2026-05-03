import { describe, expect, it } from "vitest";
import {
  attachScoreBreakdown,
  buildPendingBreakdown,
  parsePendingBreakdown,
  sessionsWithBreakdown,
} from "./attach-score-breakdown";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import type { ScoreBreakdown } from "./types";

function fixtureBreakdown(over: Partial<ScoreBreakdown> = {}): ScoreBreakdown {
  return {
    cuisineFit: 0.8,
    flavorContrast: 0.7,
    nutritionBalance: 0.6,
    prepBurden: 0.5,
    temperature: 0.55,
    preference: 0.65,
    ...over,
  };
}

function fixtureSession(
  over: Partial<CookSessionRecord> = {},
): CookSessionRecord {
  return {
    sessionId: "cs-1",
    recipeSlug: "caesar-salad",
    dishName: "Caesar Salad",
    cuisineFamily: "italian",
    startedAt: "2026-05-02T18:00:00Z",
    favorite: false,
    ...over,
  };
}

// ── parsePendingBreakdown ──────────────────────────────────

describe("parsePendingBreakdown — short-circuits", () => {
  it("returns null on null / undefined / empty", () => {
    expect(parsePendingBreakdown(null)).toBe(null);
    expect(parsePendingBreakdown(undefined)).toBe(null);
    expect(parsePendingBreakdown("")).toBe(null);
  });

  it("returns null on non-JSON", () => {
    expect(parsePendingBreakdown("{not-json")).toBe(null);
  });

  it("returns null on JSON null / array / primitive", () => {
    expect(parsePendingBreakdown("null")).toBe(null);
    expect(parsePendingBreakdown("[]")).toBe(null);
    expect(parsePendingBreakdown("42")).toBe(null);
  });

  it("returns null on missing required field", () => {
    const partial = JSON.stringify({ recipeSlug: "x", totalScore: 1 });
    expect(parsePendingBreakdown(partial)).toBe(null);
  });

  it("returns null on missing breakdown dimension", () => {
    const incomplete = JSON.stringify({
      recipeSlug: "x",
      totalScore: 1,
      stashedAt: Date.now(),
      breakdown: {
        cuisineFit: 0.5,
        flavorContrast: 0.5,
        nutritionBalance: 0.5,
        prepBurden: 0.5,
        temperature: 0.5,
        // missing preference
      },
    });
    expect(parsePendingBreakdown(incomplete)).toBe(null);
  });

  it("returns null on NaN dimension", () => {
    const bad = JSON.stringify({
      recipeSlug: "x",
      totalScore: 1,
      stashedAt: Date.now(),
      breakdown: {
        cuisineFit: 0.5,
        flavorContrast: 0.5,
        nutritionBalance: 0.5,
        prepBurden: 0.5,
        temperature: 0.5,
        preference: "garbage",
      },
    });
    expect(parsePendingBreakdown(bad)).toBe(null);
  });

  it("returns null on stale stash (> 10 min)", () => {
    const ancient = JSON.stringify({
      recipeSlug: "x",
      totalScore: 1,
      stashedAt: 0,
      breakdown: fixtureBreakdown(),
    });
    expect(parsePendingBreakdown(ancient, 11 * 60 * 1000)).toBe(null);
  });
});

describe("parsePendingBreakdown — happy path", () => {
  it("round-trips a valid stash within the freshness window", () => {
    const now = 1714579200000;
    const built = buildPendingBreakdown(
      "caesar-salad",
      fixtureBreakdown(),
      0.7,
      now,
    );
    const raw = JSON.stringify(built);
    const parsed = parsePendingBreakdown(raw, now + 1000);
    expect(parsed).toEqual(built);
  });

  it("preserves total score and breakdown values exactly", () => {
    const now = 1714579200000;
    const built = buildPendingBreakdown(
      "x",
      fixtureBreakdown({ cuisineFit: 0.123 }),
      0.42,
      now,
    );
    const parsed = parsePendingBreakdown(JSON.stringify(built), now);
    expect(parsed?.totalScore).toBe(0.42);
    expect(parsed?.breakdown.cuisineFit).toBe(0.123);
  });
});

// ── buildPendingBreakdown ──────────────────────────────────

describe("buildPendingBreakdown", () => {
  it("composes a pending payload with stash timestamp", () => {
    const result = buildPendingBreakdown(
      "x",
      fixtureBreakdown(),
      0.5,
      1714579200000,
    );
    expect(result.recipeSlug).toBe("x");
    expect(result.totalScore).toBe(0.5);
    expect(result.stashedAt).toBe(1714579200000);
  });

  it("clones the breakdown (no shared mutable reference)", () => {
    const source = fixtureBreakdown();
    const result = buildPendingBreakdown("x", source, 0.5);
    expect(result.breakdown).not.toBe(source);
    expect(result.breakdown).toEqual(source);
  });
});

// ── attachScoreBreakdown ───────────────────────────────────

describe("attachScoreBreakdown", () => {
  it("attaches breakdown when slugs match", () => {
    const session = fixtureSession({ recipeSlug: "caesar-salad" });
    const pending = buildPendingBreakdown(
      "caesar-salad",
      fixtureBreakdown(),
      0.7,
    );
    const result = attachScoreBreakdown(session, pending);
    expect(result.engineScoreBreakdown).toBeDefined();
    expect(result.engineScoreBreakdown?.totalScore).toBe(0.7);
    expect(result.engineScoreBreakdown?.cuisineFit).toBe(0.8);
  });

  it("returns session unchanged when slugs don't match (defensive)", () => {
    const session = fixtureSession({ recipeSlug: "naan" });
    const pending = buildPendingBreakdown(
      "caesar-salad",
      fixtureBreakdown(),
      0.7,
    );
    const result = attachScoreBreakdown(session, pending);
    expect(result.engineScoreBreakdown).toBeUndefined();
    expect(result).toEqual(session);
  });

  it("does not mutate the input session", () => {
    const session = fixtureSession({ recipeSlug: "caesar-salad" });
    const pending = buildPendingBreakdown(
      "caesar-salad",
      fixtureBreakdown(),
      0.7,
    );
    attachScoreBreakdown(session, pending);
    expect(session.engineScoreBreakdown).toBeUndefined();
  });
});

// ── sessionsWithBreakdown ──────────────────────────────────

describe("sessionsWithBreakdown", () => {
  it("filters out sessions without breakdown (V2-era legacy)", () => {
    const a = fixtureSession({ sessionId: "a" });
    const b = fixtureSession({
      sessionId: "b",
      engineScoreBreakdown: {
        ...fixtureBreakdown(),
        totalScore: 0.5,
      },
    });
    expect(sessionsWithBreakdown([a, b]).map((s) => s.sessionId)).toEqual([
      "b",
    ]);
  });

  it("treats null breakdown as absent", () => {
    const a = fixtureSession({
      sessionId: "a",
      engineScoreBreakdown: null,
    });
    expect(sessionsWithBreakdown([a])).toEqual([]);
  });

  it("returns empty on empty list", () => {
    expect(sessionsWithBreakdown([])).toEqual([]);
  });
});
