import { describe, expect, it } from "vitest";
import {
  applyCompassResult,
  COMPASS_STREAK_STORAGE_KEY,
  freshCompassStreak,
  isConsecutiveUtcDay,
  parseStoredCompassStreak,
} from "./use-compass-streak";
import {
  COMPASS_SCHEMA_VERSION,
  type CompassResult,
} from "@/types/cuisine-compass";

function mkResult(date: string, score = 4500): CompassResult {
  return {
    puzzleDate: date,
    dishSlug: "pad-thai",
    guess: { lat: 13.5, lng: 100.5 },
    distanceKm: 28,
    elapsedSec: 12,
    hintsUsed: 0,
    score,
  };
}

describe("COMPASS_STREAK_STORAGE_KEY", () => {
  it("uses the v1 namespaced key", () => {
    expect(COMPASS_STREAK_STORAGE_KEY).toBe("sous-compass-streak-v1");
  });
});

describe("parseStoredCompassStreak", () => {
  it("returns fresh state for null/undefined/empty", () => {
    expect(parseStoredCompassStreak(null)).toEqual(freshCompassStreak());
    expect(parseStoredCompassStreak(undefined).current).toBe(0);
    expect(parseStoredCompassStreak("").best).toBe(0);
  });

  it("returns fresh on malformed JSON", () => {
    expect(parseStoredCompassStreak("{not json").current).toBe(0);
  });

  it("returns fresh on non-object payload", () => {
    expect(parseStoredCompassStreak("[]").current).toBe(0);
    expect(parseStoredCompassStreak("42").current).toBe(0);
    expect(parseStoredCompassStreak("null").current).toBe(0);
  });

  it("returns fresh on schema-version mismatch", () => {
    const stale = JSON.stringify({
      schemaVersion: 99,
      current: 5,
      best: 10,
      lastPlayedDate: "2026-05-04",
      results: {},
    });
    expect(parseStoredCompassStreak(stale).current).toBe(0);
  });

  it("preserves valid streak round-trip", () => {
    const r = mkResult("2026-05-04");
    const valid = JSON.stringify({
      schemaVersion: COMPASS_SCHEMA_VERSION,
      current: 3,
      best: 7,
      lastPlayedDate: "2026-05-04",
      results: { "2026-05-04": r },
    });
    const parsed = parseStoredCompassStreak(valid);
    expect(parsed.current).toBe(3);
    expect(parsed.best).toBe(7);
    expect(parsed.results["2026-05-04"].score).toBe(r.score);
  });

  it("drops corrupt individual results without nuking the rest", () => {
    const valid = mkResult("2026-05-04");
    const stored = JSON.stringify({
      schemaVersion: COMPASS_SCHEMA_VERSION,
      current: 1,
      best: 1,
      lastPlayedDate: "2026-05-04",
      results: {
        "2026-05-04": valid,
        "2026-05-05": { not: "a result" }, // schema-fail → dropped
        "2026-05-06": null,
      },
    });
    const parsed = parseStoredCompassStreak(stored);
    expect(Object.keys(parsed.results)).toEqual(["2026-05-04"]);
  });

  it("clamps negative current/best to 0", () => {
    const stored = JSON.stringify({
      schemaVersion: COMPASS_SCHEMA_VERSION,
      current: -5,
      best: -2,
      lastPlayedDate: "",
      results: {},
    });
    const parsed = parseStoredCompassStreak(stored);
    expect(parsed.current).toBe(0);
    expect(parsed.best).toBe(0);
  });
});

describe("isConsecutiveUtcDay", () => {
  it("true for back-to-back days", () => {
    expect(isConsecutiveUtcDay("2026-05-04", "2026-05-05")).toBe(true);
    expect(isConsecutiveUtcDay("2026-12-31", "2027-01-01")).toBe(true);
    // Month rollover.
    expect(isConsecutiveUtcDay("2026-02-28", "2026-03-01")).toBe(true);
  });

  it("false for same-day or non-adjacent", () => {
    expect(isConsecutiveUtcDay("2026-05-04", "2026-05-04")).toBe(false);
    expect(isConsecutiveUtcDay("2026-05-04", "2026-05-06")).toBe(false);
    expect(isConsecutiveUtcDay("2026-05-04", "2026-05-03")).toBe(false);
  });

  it("false for empty / malformed", () => {
    expect(isConsecutiveUtcDay("", "2026-05-04")).toBe(false);
    expect(isConsecutiveUtcDay("not-a-date", "2026-05-04")).toBe(false);
  });
});

describe("applyCompassResult", () => {
  it("starts a streak from cold-start", () => {
    const next = applyCompassResult({
      prev: freshCompassStreak(),
      result: mkResult("2026-05-04"),
    });
    expect(next.current).toBe(1);
    expect(next.best).toBe(1);
    expect(next.lastPlayedDate).toBe("2026-05-04");
    expect(next.results["2026-05-04"]).toBeDefined();
  });

  it("bumps the streak on consecutive days", () => {
    const day1 = applyCompassResult({
      prev: freshCompassStreak(),
      result: mkResult("2026-05-04"),
    });
    const day2 = applyCompassResult({
      prev: day1,
      result: mkResult("2026-05-05"),
    });
    expect(day2.current).toBe(2);
    expect(day2.best).toBe(2);
  });

  it("resets the streak on a gap", () => {
    const day1 = applyCompassResult({
      prev: freshCompassStreak(),
      result: mkResult("2026-05-04"),
    });
    const day3 = applyCompassResult({
      prev: day1,
      result: mkResult("2026-05-06"),
    });
    expect(day3.current).toBe(1);
    expect(day3.best).toBe(1);
  });

  it("preserves best across a streak reset", () => {
    let streak = freshCompassStreak();
    streak = applyCompassResult({
      prev: streak,
      result: mkResult("2026-05-04"),
    });
    streak = applyCompassResult({
      prev: streak,
      result: mkResult("2026-05-05"),
    });
    streak = applyCompassResult({
      prev: streak,
      result: mkResult("2026-05-06"),
    });
    expect(streak.best).toBe(3);
    // Gap → reset to 1; best stays at 3.
    streak = applyCompassResult({
      prev: streak,
      result: mkResult("2026-05-10"),
    });
    expect(streak.current).toBe(1);
    expect(streak.best).toBe(3);
  });

  it("is idempotent on same-day resubmits (streak unchanged)", () => {
    const first = applyCompassResult({
      prev: freshCompassStreak(),
      result: mkResult("2026-05-04", 2000),
    });
    const second = applyCompassResult({
      prev: first,
      result: mkResult("2026-05-04", 4500),
    });
    expect(second.current).toBe(1);
    // Result is replaced, not duplicated.
    expect(second.results["2026-05-04"].score).toBe(4500);
  });
});
