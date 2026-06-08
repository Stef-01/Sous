import { describe, expect, it } from "vitest";
import { estimateGlycemicLoad } from "./glycemic";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (over: Record<string, number>) =>
  over as unknown as PerServingNutrition;

describe("estimateGlycemicLoad", () => {
  it("ranks lentils gentler than white rice", () => {
    const lentils = estimateGlycemicLoad(
      N({ totalCarbs_g: 20, fiber_g: 8, totalSugars_g: 2 }),
    );
    const whiteRice = estimateGlycemicLoad(
      N({ totalCarbs_g: 45, fiber_g: 1, totalSugars_g: 0 }),
    );
    expect(lentils!.gl).toBeLessThan(whiteRice!.gl);
    expect(lentils!.band).toBe("low");
    expect(whiteRice!.band).toBe("high");
  });

  it("more fiber lowers the load for the same carbs", () => {
    const lowFiber = estimateGlycemicLoad(N({ totalCarbs_g: 40, fiber_g: 2 }))!;
    const highFiber = estimateGlycemicLoad(
      N({ totalCarbs_g: 40, fiber_g: 14 }),
    )!;
    expect(highFiber.gl).toBeLessThan(lowFiber.gl);
  });

  it("zero available carbs → load 0 / low", () => {
    expect(estimateGlycemicLoad(N({ totalCarbs_g: 0, fiber_g: 0 }))).toEqual({
      gl: 0,
      band: "low",
      gi: 0,
    });
    // all-fiber dish (carbs == fiber) → net 0
    expect(estimateGlycemicLoad(N({ totalCarbs_g: 10, fiber_g: 10 }))!.gl).toBe(
      0,
    );
  });

  it("returns null without carb data", () => {
    expect(estimateGlycemicLoad(N({ fiber_g: 3 }))).toBeNull();
    expect(estimateGlycemicLoad(null)).toBeNull();
    expect(estimateGlycemicLoad(undefined)).toBeNull();
  });

  it("a sugar-bomb reads higher than a starchy-but-unsweet dish of equal carbs", () => {
    const sugary = estimateGlycemicLoad(
      N({ totalCarbs_g: 30, fiber_g: 1, totalSugars_g: 28 }),
    )!;
    const starchy = estimateGlycemicLoad(
      N({ totalCarbs_g: 30, fiber_g: 1, totalSugars_g: 1 }),
    )!;
    expect(sugary.gi).toBeGreaterThan(starchy.gi);
  });
});
