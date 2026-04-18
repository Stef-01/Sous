import { describe, it, expect } from "vitest";
import { deriveWelcomeLine } from "./welcome-line";

const NOW = Date.UTC(2026, 3, 17, 12, 0, 0);

describe("deriveWelcomeLine", () => {
  it("returns null for a brand-new user", () => {
    expect(
      deriveWelcomeLine({ streak: 0, lastCookIso: null, now: NOW }),
    ).toBeNull();
  });

  it("greets a mid-streak user", () => {
    expect(
      deriveWelcomeLine({
        streak: 4,
        lastCookIso: new Date(NOW - 12 * 60 * 60 * 1000).toISOString(),
        now: NOW,
      }),
    ).toBe("Day 4 of cooking.");
  });

  it("greets a 7-day streak", () => {
    expect(
      deriveWelcomeLine({
        streak: 7,
        lastCookIso: new Date(NOW - 12 * 60 * 60 * 1000).toISOString(),
        now: NOW,
      }),
    ).toBe("A full week. Day 7.");
  });

  it("greets a returning user (≥7 days since last cook) before streak logic", () => {
    expect(
      deriveWelcomeLine({
        streak: 0,
        lastCookIso: new Date(NOW - 8 * 24 * 60 * 60 * 1000).toISOString(),
        now: NOW,
      }),
    ).toBe("Back after a week.");
  });

  it("says 'good to see you again' after 14+ days away", () => {
    expect(
      deriveWelcomeLine({
        streak: 0,
        lastCookIso: new Date(NOW - 21 * 24 * 60 * 60 * 1000).toISOString(),
        now: NOW,
      }),
    ).toBe("Good to see you again.");
  });

  it("returns null for streak below 3 and recent cook (nothing to say)", () => {
    expect(
      deriveWelcomeLine({
        streak: 2,
        lastCookIso: new Date(NOW - 24 * 60 * 60 * 1000).toISOString(),
        now: NOW,
      }),
    ).toBeNull();
  });
});
