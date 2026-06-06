import { describe, expect, it } from "vitest";
import { computeWeeklyTrend, strongestNutrient } from "./weekly-trend";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (over: Record<string, number>) =>
  over as unknown as PerServingNutrition;

describe("computeWeeklyTrend", () => {
  it("counts only logged days; nulls are skipped", () => {
    const t = computeWeeklyTrend([N({ iron_mg: 18 }), null, N({ iron_mg: 0 })]);
    expect(t.daysWithCooks).toBe(2);
  });

  it("counts days short (< 70% of target) per nutrient", () => {
    // iron: 100% then 0% → short 1 day; fiber: 0% both days → short 2 days.
    const t = computeWeeklyTrend([
      N({ iron_mg: 18, fiber_g: 0 }),
      N({ iron_mg: 0, fiber_g: 0 }),
    ]);
    expect(t.trend.find((x) => x.key === "iron_mg")?.daysShort).toBe(1);
    expect(t.trend.find((x) => x.key === "fiber_g")?.daysShort).toBe(2);
    // most-short sorts first
    const iFiber = t.trend.findIndex((x) => x.key === "fiber_g");
    const iIron = t.trend.findIndex((x) => x.key === "iron_mg");
    expect(iFiber).toBeLessThan(iIron);
  });

  it("avgPct is the mean percent of target across logged days", () => {
    const t = computeWeeklyTrend([N({ iron_mg: 18 }), N({ iron_mg: 9 })]);
    expect(t.trend.find((x) => x.key === "iron_mg")?.avgPct).toBe(75);
  });

  it("is empty when nothing is logged", () => {
    const t = computeWeeklyTrend([null, null]);
    expect(t.daysWithCooks).toBe(0);
    expect(t.trend).toEqual([]);
    expect(strongestNutrient(t)).toBeNull();
  });
});
