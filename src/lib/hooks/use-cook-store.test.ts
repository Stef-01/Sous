import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCookStore, COMPLETED_TIMER_LINGER_MS } from "./use-cook-store";

describe("useCookStore timers", () => {
  beforeEach(() => {
    useCookStore.getState().reset();
  });

  it("starts a timer with the given label", () => {
    useCookStore.getState().startTimer(30, "Basmati rice");
    const { timers } = useCookStore.getState();
    expect(timers).toHaveLength(1);
    expect(timers[0].label).toBe("Basmati rice");
    expect(timers[0].remaining).toBe(30);
    expect(timers[0].totalSeconds).toBe(30);
    expect(timers[0].completedAt).toBeNull();
  });

  it("dedupes a double-tap on the same label", () => {
    useCookStore.getState().startTimer(30, "Rice");
    useCookStore.getState().startTimer(30, "Rice");
    expect(useCookStore.getState().timers).toHaveLength(1);
  });

  it("supports multiple concurrent timers with distinct labels", () => {
    useCookStore.getState().startTimer(600, "Curry · step 2");
    useCookStore.getState().startTimer(240, "Rice · step 1");
    const { timers } = useCookStore.getState();
    expect(timers).toHaveLength(2);
    expect(timers.map((t) => t.label).sort()).toEqual([
      "Curry · step 2",
      "Rice · step 1",
    ]);
  });

  it("tickTimers decrements every active timer by one second", () => {
    useCookStore.getState().startTimer(5, "A");
    useCookStore.getState().startTimer(10, "B");
    useCookStore.getState().tickTimers();
    const remaining = useCookStore
      .getState()
      .timers.map((t) => [t.label, t.remaining]);
    expect(remaining).toEqual([
      ["A", 4],
      ["B", 9],
    ]);
  });

  it("marks a timer completed when it hits zero", () => {
    useCookStore.getState().startTimer(1, "Quick");
    useCookStore.getState().tickTimers();
    const t = useCookStore.getState().timers[0];
    expect(t.remaining).toBe(0);
    expect(t.completedAt).not.toBeNull();
  });

  it("prunes completed timers after the linger window elapses", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
      useCookStore.getState().startTimer(1, "Done");
      useCookStore.getState().tickTimers(); // remaining -> 0, completedAt set
      expect(useCookStore.getState().timers).toHaveLength(1);

      // Advance past the linger window and tick again.
      vi.setSystemTime(new Date(Date.now() + COMPLETED_TIMER_LINGER_MS + 100));
      useCookStore.getState().tickTimers();
      expect(useCookStore.getState().timers).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("stopTimer removes a specific id and leaves others alone", () => {
    useCookStore.getState().startTimer(60, "A");
    useCookStore.getState().startTimer(60, "B");
    const idA = useCookStore.getState().timers[0].id;
    useCookStore.getState().stopTimer(idA);
    const labels = useCookStore.getState().timers.map((t) => t.label);
    expect(labels).toEqual(["B"]);
  });

  it("stopTimer with no id clears all timers", () => {
    useCookStore.getState().startTimer(60, "A");
    useCookStore.getState().startTimer(60, "B");
    useCookStore.getState().stopTimer();
    expect(useCookStore.getState().timers).toEqual([]);
  });

  it("nextDish clears timers so they don't bleed into the next dish", () => {
    useCookStore.getState().startCombinedSession([
      { slug: "a", name: "A", totalSteps: 2 },
      { slug: "b", name: "B", totalSteps: 2 },
    ]);
    useCookStore.getState().startTimer(60, "A timer");
    useCookStore.getState().nextDish();
    expect(useCookStore.getState().timers).toEqual([]);
  });
});
