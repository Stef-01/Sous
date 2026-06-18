import { describe, expect, it } from "vitest";
import { mascotMood } from "./mascot-mood";

describe("mascotMood (header Doberman expression)", () => {
  it("a 3+ day streak makes the Dobe happy, even at night", () => {
    expect(mascotMood({ hour: 14, streak: 3 })).toBe("happy");
    expect(mascotMood({ hour: 23, streak: 9 })).toBe("happy");
    expect(mascotMood({ hour: 2, streak: 5, nudge: true })).toBe("happy");
  });

  it("a cook completed today makes the Dobe proud — the strongest signal", () => {
    expect(mascotMood({ hour: 19, streak: 0, cookedToday: true })).toBe(
      "proud",
    );
    // Proud outranks a streak, a nudge, and the late-night doze.
    expect(
      mascotMood({ hour: 23, streak: 9, cookedToday: true, nudge: true }),
    ).toBe("proud");
  });

  it("an active week (2+ cooks) keeps it happy even without a streak", () => {
    expect(mascotMood({ hour: 14, streak: 0, cooksThisWeek: 2 })).toBe("happy");
    expect(mascotMood({ hour: 10, streak: 1, cooksThisWeek: 4 })).toBe("happy");
    // A single cook this week is below the threshold → falls through.
    expect(mascotMood({ hour: 14, streak: 0, cooksThisWeek: 1 })).toBe("idle");
  });

  it("a pending nudge perks it alert (below the streak threshold)", () => {
    expect(mascotMood({ hour: 14, streak: 0, nudge: true })).toBe("alert");
    expect(mascotMood({ hour: 10, streak: 2, nudge: true })).toBe("alert");
  });

  it("dozes late at night when nothing else applies", () => {
    expect(mascotMood({ hour: 22, streak: 0 })).toBe("sleepy");
    expect(mascotMood({ hour: 5, streak: 1 })).toBe("sleepy");
    expect(mascotMood({ hour: 0, streak: 2 })).toBe("sleepy");
  });

  it("idles by day with no streak or nudge", () => {
    expect(mascotMood({ hour: 6, streak: 0 })).toBe("idle");
    expect(mascotMood({ hour: 13, streak: 2 })).toBe("idle");
    expect(mascotMood({ hour: 21, streak: 0 })).toBe("idle");
  });

  it("wraps out-of-range / fractional hours safely", () => {
    expect(mascotMood({ hour: 24, streak: 0 })).toBe("sleepy"); // → 0
    expect(mascotMood({ hour: -1, streak: 0 })).toBe("sleepy"); // → 23
    expect(mascotMood({ hour: 13.9, streak: 0 })).toBe("idle"); // → 13
  });
});
