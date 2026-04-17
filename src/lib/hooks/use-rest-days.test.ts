import { describe, it, expect } from "vitest";
import {
  canTakeRestDay,
  computeStreakWithRest,
  toDateKey,
} from "./use-rest-days";

/** Construct a local-calendar Date without timezone ambiguity.
 *  `toDateKey` serializes using local calendar components, so tests must do
 *  the same to stay stable across the runner's timezone. */
function localDate(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

describe("toDateKey", () => {
  it("zero-pads month and day for stable lexicographic ordering", () => {
    expect(toDateKey(localDate(2025, 1, 3))).toBe("2025-01-03");
  });
});

describe("canTakeRestDay", () => {
  const today = localDate(2025, 1, 14);

  it("allows a rest day when none has been used in the last 7 days", () => {
    expect(canTakeRestDay([], today)).toBe(true);
  });

  it("blocks when a rest day sits inside the 7-day window", () => {
    expect(canTakeRestDay([toDateKey(localDate(2025, 1, 10))], today)).toBe(
      false,
    );
  });

  it("allows when the last rest day is older than 7 days", () => {
    expect(canTakeRestDay([toDateKey(localDate(2025, 1, 1))], today)).toBe(
      true,
    );
  });
});

describe("computeStreakWithRest", () => {
  const today = localDate(2025, 1, 14);
  const todayKey = toDateKey(today);

  it("returns 0 when there is no last cook date", () => {
    expect(computeStreakWithRest(null, 0, [], today)).toBe(0);
  });

  it("preserves the streak when the user cooked today", () => {
    expect(computeStreakWithRest(todayKey, 5, [], today)).toBe(5);
  });

  it("preserves the streak when the user cooked yesterday", () => {
    expect(
      computeStreakWithRest(toDateKey(localDate(2025, 1, 13)), 5, [], today),
    ).toBe(5);
  });

  it("resets the streak when two days are missed with no rest day", () => {
    expect(
      computeStreakWithRest(toDateKey(localDate(2025, 1, 12)), 5, [], today),
    ).toBe(0);
  });

  it("keeps the streak alive when the missed day is a rest day", () => {
    const rest = [toDateKey(localDate(2025, 1, 13))];
    expect(
      computeStreakWithRest(toDateKey(localDate(2025, 1, 12)), 5, rest, today),
    ).toBe(5);
  });

  it("resets if any intervening day is not covered by a rest day", () => {
    const rest = [toDateKey(localDate(2025, 1, 13))];
    expect(
      computeStreakWithRest(toDateKey(localDate(2025, 1, 11)), 5, rest, today),
    ).toBe(0);
  });
});
