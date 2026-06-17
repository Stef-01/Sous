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

  it("derives remaining from elapsed wall-clock", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
      useCookStore.getState().startTimer(5, "A");
      useCookStore.getState().startTimer(10, "B");
      vi.setSystemTime(new Date(Date.now() + 1000)); // one second later
      useCookStore.getState().tickTimers();
      const remaining = useCookStore
        .getState()
        .timers.map((t) => [t.label, t.remaining]);
      expect(remaining).toEqual([
        ["A", 4],
        ["B", 9],
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does NOT drift when ticks are throttled (backgrounded tab)", () => {
    // The bug this guards: a tick-count countdown loses real time when
    // setInterval is suspended. One tick after a 5-minute gap must reflect the
    // full elapsed time, not a single -1.
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
      useCookStore.getState().startTimer(600, "Roast");
      vi.setSystemTime(new Date(Date.now() + 300_000)); // 5 min backgrounded
      useCookStore.getState().tickTimers(); // a single catch-up tick
      expect(useCookStore.getState().timers[0].remaining).toBe(300);
    } finally {
      vi.useRealTimers();
    }
  });

  it("marks a timer completed when the deadline passes", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
      useCookStore.getState().startTimer(1, "Quick");
      vi.setSystemTime(new Date(Date.now() + 1000));
      useCookStore.getState().tickTimers();
      const t = useCookStore.getState().timers[0];
      expect(t.remaining).toBe(0);
      expect(t.completedAt).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("prunes completed timers after the linger window elapses", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
      useCookStore.getState().startTimer(1, "Done");
      vi.setSystemTime(new Date(Date.now() + 1000));
      useCookStore.getState().tickTimers(); // deadline reached -> completedAt set
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

  it("nextDish keeps a still-running timer but drops a finished one", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
      useCookStore.getState().startCombinedSession([
        { slug: "a", name: "A", totalSteps: 2 },
        { slug: "b", name: "B", totalSteps: 2 },
      ]);
      useCookStore.getState().startTimer(600, "Roast"); // still cooking
      useCookStore.getState().startTimer(1, "Quick"); // about to finish
      vi.setSystemTime(new Date(Date.now() + 1000));
      useCookStore.getState().tickTimers(); // Quick completes
      useCookStore.getState().nextDish();
      // The long-running roast survives the dish boundary; the finished one is pruned.
      expect(useCookStore.getState().timers.map((t) => t.label)).toEqual([
        "Roast",
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("prevDish steps back into the previous dish's last step", () => {
    useCookStore.getState().startCombinedSession([
      { slug: "a", name: "A", totalSteps: 3 },
      { slug: "b", name: "B", totalSteps: 2 },
    ]);
    // already on the first dish → nothing to go back to
    expect(useCookStore.getState().prevDish()).toBe(false);
    useCookStore.getState().nextDish(); // → dish b, step 0
    expect(useCookStore.getState().currentDishIndex).toBe(1);
    expect(useCookStore.getState().prevDish()).toBe(true); // → dish a, last step
    expect(useCookStore.getState().currentDishIndex).toBe(0);
    expect(useCookStore.getState().currentStepIndex).toBe(2); // a.totalSteps - 1
    expect(useCookStore.getState().totalSteps).toBe(3);
  });
});
