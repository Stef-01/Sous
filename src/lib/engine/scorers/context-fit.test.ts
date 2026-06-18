import { describe, expect, it } from "vitest";
import {
  scoreContextFit,
  seasonFromMonth,
  daypartFromHour,
  CONTEXT_FIT_WEIGHT,
} from "./context-fit";

const side = (
  o: Partial<{
    temperature: string;
    tags: string[];
    prepTimeMinutes: number;
    cookTimeMinutes: number;
  }> = {},
) => ({
  temperature: o.temperature ?? "warm",
  tags: o.tags ?? [],
  prepTimeMinutes: o.prepTimeMinutes ?? 15,
  cookTimeMinutes: o.cookTimeMinutes ?? 15,
});

describe("seasonFromMonth", () => {
  it("maps northern months to seasons (mirrors inferSeason)", () => {
    expect(seasonFromMonth(0)).toBe("winter"); // Jan
    expect(seasonFromMonth(1)).toBe("winter");
    expect(seasonFromMonth(3)).toBe("spring");
    expect(seasonFromMonth(6)).toBe("summer");
    expect(seasonFromMonth(9)).toBe("autumn");
    expect(seasonFromMonth(11)).toBe("winter"); // Dec
  });

  it("flips for the southern hemisphere", () => {
    expect(seasonFromMonth(0, "southern")).toBe("summer");
    expect(seasonFromMonth(6, "southern")).toBe("winter");
    expect(seasonFromMonth(3, "southern")).toBe("autumn");
  });

  it("is pure (out-of-range months wrap, no throw)", () => {
    expect(seasonFromMonth(12)).toBe("winter"); // wraps to 0
    expect(seasonFromMonth(-1)).toBe("winter"); // wraps to 11
  });
});

describe("daypartFromHour", () => {
  it("buckets hours (mirrors inferTimeOfDay cutoffs)", () => {
    expect(daypartFromHour(3)).toBe("late-night");
    expect(daypartFromHour(23)).toBe("late-night");
    expect(daypartFromHour(8)).toBe("morning");
    expect(daypartFromHour(12)).toBe("midday");
    expect(daypartFromHour(15)).toBe("afternoon");
    expect(daypartFromHour(19)).toBe("evening");
  });
});

describe("scoreContextFit — STRATEGY §6.2 directional", () => {
  // spring (month 3) + midday (hour 13) is the neutral anchor.
  const NEUTRAL = { hour: 13, month: 3 };

  it("transition season + neutral hour → exactly 0.5 (no-op nudge)", () => {
    expect(scoreContextFit(side(), NEUTRAL)).toBe(0.5);
  });

  it("winter favors hot, penalizes cold", () => {
    const winter = { hour: 13, month: 0 };
    expect(
      scoreContextFit(side({ temperature: "hot" }), winter),
    ).toBeGreaterThan(0.5);
    expect(scoreContextFit(side({ temperature: "cold" }), winter)).toBeLessThan(
      0.5,
    );
  });

  it("summer favors cold, penalizes hot", () => {
    const summer = { hour: 13, month: 6 };
    expect(
      scoreContextFit(side({ temperature: "cold" }), summer),
    ).toBeGreaterThan(0.5);
    expect(scoreContextFit(side({ temperature: "hot" }), summer)).toBeLessThan(
      0.5,
    );
  });

  it("late-night favors quick/light over slow", () => {
    const lateNight = { hour: 23, month: 3 };
    const quick = scoreContextFit(
      side({ prepTimeMinutes: 5, cookTimeMinutes: 5 }),
      lateNight,
    );
    const slow = scoreContextFit(
      side({ prepTimeMinutes: 25, cookTimeMinutes: 25 }),
      lateNight,
    );
    expect(quick).toBeGreaterThan(0.5);
    expect(slow).toBeLessThan(0.5);
    expect(quick).toBeGreaterThan(slow);
  });

  it("morning favors quick/light", () => {
    const morning = { hour: 8, month: 3 };
    expect(
      scoreContextFit(
        side({ prepTimeMinutes: 5, cookTimeMinutes: 5 }),
        morning,
      ),
    ).toBeGreaterThan(0.5);
  });

  it("late-night comfort tag earns the comfort lane", () => {
    const lateNight = { hour: 23, month: 3 };
    // 30-min dish: no low-prep nudge (between 20 and 40), but the comfort tag
    // lifts it above neutral.
    const comfort = scoreContextFit(
      side({ prepTimeMinutes: 15, cookTimeMinutes: 15, tags: ["comfort"] }),
      lateNight,
    );
    const plain = scoreContextFit(
      side({ prepTimeMinutes: 15, cookTimeMinutes: 15 }),
      lateNight,
    );
    expect(comfort).toBeGreaterThan(plain);
  });

  it("stays a gentle, bounded signal (below taste)", () => {
    expect(CONTEXT_FIT_WEIGHT).toBeLessThan(0.22); // below cuisineFit/flavorContrast
    expect(CONTEXT_FIT_WEIGHT).toBeLessThanOrEqual(0.07); // at/under seasonal
    // every output stays within [0,1]
    for (const m of [0, 6, 3]) {
      for (const h of [3, 8, 13, 19, 23]) {
        const s = scoreContextFit(side({ temperature: "hot" }), {
          hour: h,
          month: m,
        });
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    }
  });
});
