import { describe, expect, it } from "vitest";
import {
  NUDGE_LEAD_MINUTES,
  missedLastWeeksTypicalDay,
  rhythmWeeksRunning,
  scheduleNextNudge,
} from "./schedule";
import type { RhythmPattern } from "@/lib/engine/rhythm-pattern";

function fixtureRhythm(over: Partial<RhythmPattern> = {}): RhythmPattern {
  return {
    typicalDays: [2], // Tuesday
    typicalHour: 18,
    confidence: 0.8,
    streakHistory: Array.from({ length: 28 }, (_, day) => ({
      day,
      cooked: false,
    })),
    ...over,
  };
}

// ── scheduleNextNudge ─────────────────────────────────────

describe("scheduleNextNudge — null when not warranted", () => {
  it("low confidence → null", () => {
    const now = new Date("2026-05-10T18:00:00"); // Sun
    expect(scheduleNextNudge(fixtureRhythm({ confidence: 0.3 }), now)).toBe(
      null,
    );
  });

  it("empty typicalDays → null", () => {
    const now = new Date("2026-05-10T18:00:00");
    expect(scheduleNextNudge(fixtureRhythm({ typicalDays: [] }), now)).toBe(
      null,
    );
  });

  it("typicalHour -1 (cold-start) → null", () => {
    const now = new Date("2026-05-10T18:00:00");
    expect(scheduleNextNudge(fixtureRhythm({ typicalHour: -1 }), now)).toBe(
      null,
    );
  });
});

describe("scheduleNextNudge — happy path", () => {
  it("Sunday → next Tuesday at typicalHour - lead minutes", () => {
    const now = new Date("2026-05-10T18:00:00"); // Sunday
    const out = scheduleNextNudge(fixtureRhythm(), now);
    expect(out).not.toBe(null);
    expect(out?.getDay()).toBe(2); // Tuesday
    expect(out?.getHours()).toBe(17); // 18 - 30min
    expect(out?.getMinutes()).toBe(30);
  });

  it("subtracts NUDGE_LEAD_MINUTES (30 min default)", () => {
    expect(NUDGE_LEAD_MINUTES).toBe(30);
  });

  it("Tuesday before nudge time → today", () => {
    const now = new Date("2026-05-12T10:00:00"); // Tuesday morning
    const out = scheduleNextNudge(fixtureRhythm(), now);
    expect(out).not.toBe(null);
    // Same day (Tuesday)
    expect(out?.getDate()).toBe(12);
    expect(out?.getHours()).toBe(17);
  });

  it("Tuesday after nudge time → next Tuesday", () => {
    const now = new Date("2026-05-12T20:00:00"); // Tuesday evening
    const out = scheduleNextNudge(fixtureRhythm(), now);
    expect(out).not.toBe(null);
    expect(out?.getDay()).toBe(2);
    // Should be NEXT Tuesday (May 19), not today
    expect(out?.getDate()).toBe(19);
  });

  it("twin pattern (Tue + Sat) → picks closest future occurrence", () => {
    const now = new Date("2026-05-13T20:00:00"); // Wednesday
    const out = scheduleNextNudge(
      fixtureRhythm({ typicalDays: [2, 6] }), // Tue + Sat
      now,
    );
    expect(out).not.toBe(null);
    expect(out?.getDay()).toBe(6); // Saturday is closer
  });
});

// ── missedLastWeeksTypicalDay ─────────────────────────────

describe("missedLastWeeksTypicalDay", () => {
  it("empty typicalDays → false", () => {
    const now = new Date("2026-05-15T18:00:00");
    expect(
      missedLastWeeksTypicalDay(fixtureRhythm({ typicalDays: [] }), now),
    ).toBe(false);
  });

  it("last typical day cooked → false (no missed-streak signal)", () => {
    const now = new Date("2026-05-15T18:00:00"); // Friday
    // Last Tuesday was day-offset 3 ago. Hmm, Fri to Tue is 3 days.
    // We need the previous Tuesday (offset 10) for "last week".
    const streakHistory = Array.from({ length: 28 }, (_, day) => ({
      day,
      cooked: day === 10, // last week's Tuesday cooked
    }));
    const rhythm = fixtureRhythm({ streakHistory });
    expect(missedLastWeeksTypicalDay(rhythm, now)).toBe(false);
  });

  it("last typical day NOT cooked → true (missed-streak signal)", () => {
    const now = new Date("2026-05-15T18:00:00"); // Friday
    const streakHistory = Array.from({ length: 28 }, (_, day) => ({
      day,
      cooked: false, // entire month skipped
    }));
    const rhythm = fixtureRhythm({ streakHistory });
    expect(missedLastWeeksTypicalDay(rhythm, now)).toBe(true);
  });
});

// ── rhythmWeeksRunning ────────────────────────────────────

describe("rhythmWeeksRunning", () => {
  it("empty typicalDays → 0", () => {
    const now = new Date("2026-05-15T18:00:00");
    expect(rhythmWeeksRunning(fixtureRhythm({ typicalDays: [] }), now)).toBe(0);
  });

  it("no cooks → 0", () => {
    const now = new Date("2026-05-15T18:00:00");
    expect(rhythmWeeksRunning(fixtureRhythm(), now)).toBe(0);
  });

  it("4 consecutive Tuesdays cooked → 4", () => {
    const now = new Date("2026-05-15T18:00:00"); // Friday
    // Tuesdays in the last 28d: Fri-to-prev-Tue = 3, then 10, 17, 24
    const tuesdayOffsets = [3, 10, 17, 24];
    const streakHistory = Array.from({ length: 28 }, (_, day) => ({
      day,
      cooked: tuesdayOffsets.includes(day),
    }));
    const rhythm = fixtureRhythm({ streakHistory });
    expect(rhythmWeeksRunning(rhythm, now)).toBe(4);
  });

  it("streak breaks at first miss", () => {
    const now = new Date("2026-05-15T18:00:00"); // Friday
    // Tuesdays in the last 28d at offsets 3, 10, 17, 24
    // Cook only the most recent + 2 weeks ago, miss 3 weeks ago
    const cookedOffsets = [3, 10]; // last Tuesday + previous, miss 17
    const streakHistory = Array.from({ length: 28 }, (_, day) => ({
      day,
      cooked: cookedOffsets.includes(day),
    }));
    const rhythm = fixtureRhythm({ streakHistory });
    expect(rhythmWeeksRunning(rhythm, now)).toBe(2);
  });
});
