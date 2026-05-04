import { describe, expect, it } from "vitest";
import { planNotificationSchedule } from "./schedule-planner";

const rhythmWindow = { startHour: 16, endHour: 20 }; // 4-8pm

describe("planNotificationSchedule", () => {
  it("preferredAt overrides everything", () => {
    const out = planNotificationSchedule({
      intent: "rhythm-nudge",
      now: new Date(2026, 4, 3, 10, 0),
      rhythmWindow,
      preferredAt: new Date(2026, 4, 3, 19, 0),
    });
    expect(out.scheduledFor).toBe(new Date(2026, 4, 3, 19, 0).toISOString());
    expect(out.rationale).toMatch(/preferredAt/);
  });

  it("rhythm-nudge clamps before-window into start of window", () => {
    const out = planNotificationSchedule({
      intent: "rhythm-nudge",
      now: new Date(2026, 4, 3, 10, 0),
      rhythmWindow,
    });
    // Should be 4pm same day.
    expect(out.scheduledFor).toBe(
      new Date(2026, 4, 3, 16, 0, 0, 0).toISOString(),
    );
  });

  it("rhythm-nudge bumps after-window into next day's start", () => {
    const out = planNotificationSchedule({
      intent: "rhythm-nudge",
      now: new Date(2026, 4, 3, 22, 0),
      rhythmWindow,
    });
    expect(out.scheduledFor).toBe(
      new Date(2026, 4, 4, 16, 0, 0, 0).toISOString(),
    );
  });

  it("rhythm-nudge keeps in-window time as-is", () => {
    const out = planNotificationSchedule({
      intent: "rhythm-nudge",
      now: new Date(2026, 4, 3, 17, 30),
      rhythmWindow,
    });
    // Same now reflected back (clampIntoRhythmWindow is a no-op
    // when within window).
    const expected = new Date(2026, 4, 3, 17, 30);
    expect(out.scheduledFor).toBe(expected.toISOString());
  });

  it("pod-reveal adds 1h", () => {
    const now = new Date(2026, 4, 3, 17, 0);
    const out = planNotificationSchedule({
      intent: "pod-reveal",
      now,
      rhythmWindow,
    });
    expect(out.scheduledFor).toBe(new Date(2026, 4, 3, 18, 0).toISOString());
  });

  it("viral-recipe-saved debounces 5 minutes (clamped to rhythm)", () => {
    const out = planNotificationSchedule({
      intent: "viral-recipe-saved",
      now: new Date(2026, 4, 3, 17, 0),
      rhythmWindow,
    });
    expect(out.scheduledFor).toBe(new Date(2026, 4, 3, 17, 5).toISOString());
  });

  it("viral-recipe-saved outside window bumps to next day start", () => {
    const out = planNotificationSchedule({
      intent: "viral-recipe-saved",
      now: new Date(2026, 4, 3, 22, 0),
      rhythmWindow,
    });
    expect(out.scheduledFor).toBe(
      new Date(2026, 4, 4, 16, 0, 0, 0).toISOString(),
    );
  });

  it("charity-progress schedules next-day rhythm start", () => {
    const out = planNotificationSchedule({
      intent: "charity-progress",
      now: new Date(2026, 4, 3, 17, 0),
      rhythmWindow,
    });
    expect(out.scheduledFor).toBe(
      new Date(2026, 4, 4, 16, 0, 0, 0).toISOString(),
    );
  });

  it("cook-reminder uses 10m lead", () => {
    const out = planNotificationSchedule({
      intent: "cook-reminder",
      now: new Date(2026, 4, 3, 17, 0),
      rhythmWindow,
    });
    expect(out.scheduledFor).toBe(new Date(2026, 4, 3, 17, 10).toISOString());
  });

  it("every plan returns maxAttempts >= 2 + non-empty rationale", () => {
    const intents = [
      "rhythm-nudge",
      "pod-reveal",
      "viral-recipe-saved",
      "charity-progress",
      "cook-reminder",
    ] as const;
    for (const intent of intents) {
      const out = planNotificationSchedule({
        intent,
        now: new Date(2026, 4, 3, 17, 0),
        rhythmWindow,
      });
      expect(out.maxAttempts).toBeGreaterThanOrEqual(2);
      expect(out.rationale.length).toBeGreaterThan(0);
    }
  });
});
