import { describe, it, expect } from "vitest";
import {
  detectCuisineStreak,
  type CravingHistoryEntry,
} from "./use-craving-history";

function makeEntry(
  query: string,
  cuisine: string | null,
  daysAgo = 0,
): CravingHistoryEntry {
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return { query, cuisine, usedAt: date.toISOString() };
}

describe("detectCuisineStreak", () => {
  it("returns null when fewer than 3 entries", () => {
    const entries = [
      makeEntry("tikka masala", "indian"),
      makeEntry("biryani", "indian"),
    ];
    expect(detectCuisineStreak(entries)).toBeNull();
  });

  it("returns null when cuisines are mixed", () => {
    const entries = [
      makeEntry("tikka masala", "indian"),
      makeEntry("pad thai", "thai"),
      makeEntry("biryani", "indian"),
    ];
    expect(detectCuisineStreak(entries)).toBeNull();
  });

  it("detects a 3-entry streak of same cuisine", () => {
    const entries = [
      makeEntry("tikka masala", "indian"),
      makeEntry("biryani", "indian"),
      makeEntry("dal", "indian"),
    ];
    const result = detectCuisineStreak(entries);
    expect(result).not.toBeNull();
    expect(result!.repeatedCuisine).toBe("indian");
    expect(result!.streak).toBe(3);
    expect(result!.suggestion).toBe("thai");
    expect(result!.message).toContain("Indian");
  });

  it("counts full streak length beyond threshold", () => {
    const entries = [
      makeEntry("tikka masala", "indian"),
      makeEntry("biryani", "indian"),
      makeEntry("dal", "indian"),
      makeEntry("samosa", "indian"),
      makeEntry("pad thai", "thai"),
    ];
    const result = detectCuisineStreak(entries);
    expect(result!.streak).toBe(4);
  });

  it("ignores entries with null cuisine", () => {
    const entries = [
      makeEntry("something spicy", null),
      makeEntry("tikka masala", "indian"),
      makeEntry("biryani", "indian"),
    ];
    expect(detectCuisineStreak(entries)).toBeNull();
  });
});
