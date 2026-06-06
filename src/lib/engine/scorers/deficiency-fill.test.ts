import { describe, expect, it } from "vitest";
import { scoreDeficiencyFill } from "./deficiency-fill";
import { computeDeficits, deficitWeightMap } from "@/lib/nutrition/deficits";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (over: Record<string, number>) =>
  over as unknown as PerServingNutrition;

describe("scoreDeficiencyFill", () => {
  it("is 0 when there are no deficits or no nutrition", () => {
    expect(scoreDeficiencyFill(new Map(), N({ iron_mg: 18 }))).toBe(0);
    expect(scoreDeficiencyFill(new Map([["iron_mg", 1]]), null)).toBe(0);
  });

  it("scores higher for a side richer in the deficient nutrient", () => {
    const d = new Map([["iron_mg", 1]]);
    const rich = scoreDeficiencyFill(d, N({ iron_mg: 18 })); // a full daily target
    const poor = scoreDeficiencyFill(d, N({ iron_mg: 1.8 })); // ~10% of it
    expect(rich).toBeGreaterThan(poor);
    expect(rich).toBeCloseTo(1, 5);
    expect(poor).toBeCloseTo(0.1, 5);
  });

  it("caps each nutrient's contribution at one daily target", () => {
    const d = new Map([["iron_mg", 1]]);
    expect(scoreDeficiencyFill(d, N({ iron_mg: 100 }))).toBe(1);
  });

  it("weights the most-deficient nutrient more", () => {
    // iron deficit 1.0, fiber deficit 0.1; a fiber-only side barely scores.
    const d = new Map([
      ["iron_mg", 1],
      ["fiber_g", 0.1],
    ]);
    const ironSide = scoreDeficiencyFill(d, N({ iron_mg: 18 }));
    const fiberSide = scoreDeficiencyFill(d, N({ fiber_g: 28 }));
    expect(ironSide).toBeGreaterThan(fiberSide);
  });
});

describe("computeDeficits / deficitWeightMap", () => {
  it("flags below-target nutrients by shortfall, most-deficient first", () => {
    const n = N({ iron_mg: 0, fiber_g: 28 }); // iron 0%, fiber 100%
    const ds = computeDeficits(n);
    expect(ds.find((d) => d.key === "fiber_g")).toBeUndefined(); // met → not a deficit
    const iron = ds.find((d) => d.key === "iron_mg");
    expect(iron?.weight).toBeCloseTo(1, 5);
    expect(ds[0]?.weight).toBeGreaterThanOrEqual(
      ds[ds.length - 1]?.weight ?? 0,
    );
  });

  it("returns empty for null", () => {
    expect(computeDeficits(null)).toEqual([]);
    expect(deficitWeightMap(null).size).toBe(0);
  });
});
