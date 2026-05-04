import { describe, expect, it } from "vitest";
import {
  findMostRecentActiveTimer,
  formatSpeakableRemaining,
  speakableTimerAdd,
  speakableTimerCancel,
  speakableTimerSet,
  speakableTimerStatus,
} from "./timer-voice";
import type { TimerEntry } from "@/lib/hooks/use-cook-store";

function timer(overrides: Partial<TimerEntry> = {}): TimerEntry {
  return {
    id: "t-1",
    label: "Timer",
    totalSeconds: 300,
    remaining: 300,
    startedAt: 1_000_000,
    completedAt: null,
    ...overrides,
  };
}

describe("formatSpeakableRemaining", () => {
  it("formats minutes + seconds", () => {
    expect(formatSpeakableRemaining(220)).toBe("3 minutes 40 seconds");
  });

  it("singular minute", () => {
    expect(formatSpeakableRemaining(60)).toBe("1 minute");
  });

  it("singular second", () => {
    expect(formatSpeakableRemaining(1)).toBe("1 second");
  });

  it("seconds-only when under a minute", () => {
    expect(formatSpeakableRemaining(45)).toBe("45 seconds");
  });

  it("minutes-only when no remainder", () => {
    expect(formatSpeakableRemaining(120)).toBe("2 minutes");
  });

  it("returns 0 seconds for 0 / negative / NaN / Infinity", () => {
    expect(formatSpeakableRemaining(0)).toBe("0 seconds");
    expect(formatSpeakableRemaining(-5)).toBe("0 seconds");
    expect(formatSpeakableRemaining(Number.NaN)).toBe("0 seconds");
    expect(formatSpeakableRemaining(Number.POSITIVE_INFINITY)).toBe(
      "0 seconds",
    );
  });

  it("floors fractional seconds", () => {
    expect(formatSpeakableRemaining(60.7)).toBe("1 minute");
    expect(formatSpeakableRemaining(45.9)).toBe("45 seconds");
  });
});

describe("findMostRecentActiveTimer", () => {
  it("returns null on empty list", () => {
    expect(findMostRecentActiveTimer([])).toBe(null);
  });

  it("returns null when every timer is completed", () => {
    expect(
      findMostRecentActiveTimer([
        timer({ completedAt: 999 }),
        timer({ completedAt: 1000 }),
      ]),
    ).toBe(null);
  });

  it("returns the only active timer", () => {
    const t = timer();
    expect(findMostRecentActiveTimer([t])).toBe(t);
  });

  it("picks the most recently STARTED active timer", () => {
    const old = timer({ id: "old", startedAt: 100 });
    const recent = timer({ id: "recent", startedAt: 200 });
    expect(findMostRecentActiveTimer([old, recent])?.id).toBe("recent");
  });

  it("ignores completed timers when picking the recent one", () => {
    const completedRecent = timer({
      id: "done",
      startedAt: 300,
      completedAt: 500,
    });
    const active = timer({ id: "active", startedAt: 200 });
    expect(findMostRecentActiveTimer([completedRecent, active])?.id).toBe(
      "active",
    );
  });
});

describe("speakableTimerStatus", () => {
  it("returns 'no timer running' when nothing active", () => {
    expect(speakableTimerStatus([])).toBe("no timer running");
  });

  it("suppresses generic 'Timer' label", () => {
    expect(
      speakableTimerStatus([timer({ label: "Timer", remaining: 200 })]),
    ).toBe("3 minutes 20 seconds remaining");
  });

  it("includes labelled timer name", () => {
    expect(
      speakableTimerStatus([timer({ label: "Basmati rice", remaining: 60 })]),
    ).toBe("Basmati rice: 1 minute remaining");
  });
});

describe("speakableTimerSet", () => {
  it("includes the duration in the confirmation", () => {
    expect(speakableTimerSet(300)).toBe("Timer set for 5 minutes.");
  });
});

describe("speakableTimerCancel", () => {
  it("confirms when a timer was active", () => {
    expect(speakableTimerCancel(true)).toBe("Timers cancelled.");
  });

  it("explains nothing was running otherwise", () => {
    expect(speakableTimerCancel(false)).toBe("No timer to cancel.");
  });
});

describe("speakableTimerAdd", () => {
  it("confirms the addition when applied", () => {
    expect(speakableTimerAdd(60, true)).toBe("Added 1 minute.");
  });

  it("explains there's no timer to extend otherwise", () => {
    expect(speakableTimerAdd(60, false)).toBe("No active timer to extend.");
  });
});
