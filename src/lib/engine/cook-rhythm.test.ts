import { describe, it, expect } from "vitest";
import { deriveCookRhythm, RHYTHM_MIN_COOKS } from "./cook-rhythm";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

function make(
  completedAt: string,
  overrides: Partial<CookSessionRecord> = {},
): CookSessionRecord {
  return {
    sessionId: `s-${completedAt}`,
    recipeSlug: "test",
    dishName: "Test",
    cuisineFamily: "italian",
    startedAt: completedAt,
    completedAt,
    favorite: false,
    ...overrides,
  };
}

describe("deriveCookRhythm", () => {
  it("returns null below MIN_COOKS", () => {
    const sessions = Array.from({ length: RHYTHM_MIN_COOKS - 1 }, (_, i) =>
      make(`2026-04-0${i + 1}T19:00:00Z`),
    );
    expect(deriveCookRhythm(sessions)).toBeNull();
  });

  it("detects a dominant weekday + evening pattern", () => {
    // 2026-04-07 is a Tuesday. Three Tuesdays in a row at 19:00 local.
    const sessions = [
      make("2026-03-24T19:00:00"),
      make("2026-03-31T19:00:00"),
      make("2026-04-07T19:00:00"),
    ];
    const result = deriveCookRhythm(sessions);
    expect(result).not.toBeNull();
    expect(result!.sentence.toLowerCase()).toContain("tuesday");
    expect(result!.sentence).toContain("evenings");
    expect(result!.sampleSize).toBe(3);
  });

  it("returns null when cooks are spread evenly across the week", () => {
    const sessions = [
      make("2026-03-23T19:00:00"), // Mon
      make("2026-03-24T19:00:00"), // Tue
      make("2026-03-25T19:00:00"), // Wed
      make("2026-03-26T19:00:00"), // Thu
      make("2026-03-27T19:00:00"), // Fri
      make("2026-03-28T19:00:00"), // Sat
      make("2026-03-29T19:00:00"), // Sun
    ];
    expect(deriveCookRhythm(sessions)).toBeNull();
  });

  it("uses the midday bucket when lunch is dominant", () => {
    // Three Tuesdays at 12:30 — same day-of-week, so peak count is high.
    const sessions = [
      make("2026-03-24T12:30:00"),
      make("2026-03-31T13:00:00"),
      make("2026-04-07T12:45:00"),
    ];
    const result = deriveCookRhythm(sessions);
    expect(result).not.toBeNull();
    expect(result!.sentence).toContain("around midday");
  });

  it("is deterministic — same input yields same output", () => {
    const sessions = [
      make("2026-03-24T19:00:00"),
      make("2026-03-31T19:00:00"),
      make("2026-04-07T19:00:00"),
    ];
    const a = deriveCookRhythm(sessions);
    const b = deriveCookRhythm([...sessions]);
    expect(a).toEqual(b);
  });
});
