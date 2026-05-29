import { describe, expect, it } from "vitest";
import {
  summarizeMonthlySavings,
  summarizeYearlySavings,
} from "./summarize-savings";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

const NOW = new Date("2026-05-04T12:00:00Z");

function mkSession(
  daysAgo: number,
  completed: boolean = true,
  partial?: Partial<CookSessionRecord>,
): CookSessionRecord {
  const ts = new Date(NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    sessionId: `s-${daysAgo}`,
    recipeSlug: "x",
    dishName: "X",
    cuisineFamily: "y",
    startedAt: ts.toISOString(),
    completedAt: completed ? ts.toISOString() : undefined,
    favorite: false,
    ...partial,
  };
}

describe("summarizeMonthlySavings", () => {
  it("returns 0 cooks / 0 kg for empty input", () => {
    const r = summarizeMonthlySavings({ sessions: [], now: NOW });
    expect(r.cookCount).toBe(0);
    expect(r.savedKg).toBe(0);
    expect(r.windowLabel).toBe("this month");
  });

  it("counts only completed sessions inside the 30-day window", () => {
    const r = summarizeMonthlySavings({
      sessions: [
        mkSession(0),
        mkSession(15),
        mkSession(29),
        mkSession(31), // outside window
        mkSession(2, false), // started but not completed
      ],
      now: NOW,
    });
    expect(r.cookCount).toBe(3);
    expect(r.savedKg).toBeGreaterThan(0);
  });

  it("handles malformed completedAt by dropping the row", () => {
    const r = summarizeMonthlySavings({
      sessions: [mkSession(2), { ...mkSession(2), completedAt: "not-a-date" }],
      now: NOW,
    });
    expect(r.cookCount).toBe(1);
  });

  it("respects an explicit baseline override", () => {
    const sessions = [mkSession(1), mkSession(5)];
    const vsDelivery = summarizeMonthlySavings({
      sessions,
      now: NOW,
      baseline: "delivery",
    });
    const vsHomeMixed = summarizeMonthlySavings({
      sessions,
      now: NOW,
      baseline: "home-mixed",
    });
    // chosen=home-mixed, baseline=home-mixed → 0 saved
    expect(vsHomeMixed.savedKg).toBe(0);
    // chosen=home-mixed, baseline=delivery → positive saved
    expect(vsDelivery.savedKg).toBeGreaterThan(0);
  });

  it("never returns negative savings", () => {
    const r = summarizeMonthlySavings({
      sessions: [mkSession(1)],
      now: NOW,
      baseline: "home-plant-seasonal", // chosen=home-mixed is worse → 0 floor
    });
    expect(r.savedKg).toBe(0);
  });
});

describe("summarizeYearlySavings", () => {
  it("includes cooks within 365 days, excludes older", () => {
    const r = summarizeYearlySavings({
      sessions: [
        mkSession(10),
        mkSession(200),
        mkSession(364),
        mkSession(366), // outside window
      ],
      now: NOW,
    });
    expect(r.cookCount).toBe(3);
    expect(r.windowLabel).toBe("this year");
  });
});
