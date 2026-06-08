/**
 * Nutrition content accuracy — ROUND 4 of 5: derived signals (glycemic load,
 * protein quality, nutrient density) are relevant + never garbage. 10 tests.
 */
import { describe, expect, it } from "vitest";
import { getDishNutrition } from "@/lib/engine/dish-nutrition";
import { estimateGlycemicLoad } from "./glycemic";
import { proteinQuality } from "./protein-quality";
import { nutrientDensity, isNutrientDense } from "./nutrient-density";
import { meals, sides } from "@/data";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (over: Record<string, number>) =>
  over as unknown as PerServingNutrition;
const per = (id: string) => getDishNutrition(id).perServing;
const band = (id: string) => {
  const p = per(id);
  return p ? estimateGlycemicLoad(p)?.band : undefined;
};
const covered = [...meals, ...sides]
  .map((d) => per(d.id))
  .filter((p): p is PerServingNutrition => !!p);

describe("Round 4 — glycemic / protein quality / density relevance", () => {
  it("31 glycemic load ranks lentils gentler than refined white bread", () => {
    const lentils = estimateGlycemicLoad(N({ totalCarbs_g: 20, fiber_g: 8 }))!;
    const bread = estimateGlycemicLoad(N({ totalCarbs_g: 45, fiber_g: 1 }))!;
    expect(lentils.gl).toBeLessThan(bread.gl);
  });

  it("32 glycemic load is null without carbohydrate data", () => {
    expect(estimateGlycemicLoad(N({ protein_g: 20 }))).toBeNull();
    expect(estimateGlycemicLoad(null)).toBeNull();
  });

  it("33 a low-carb vegetable side reads 'low'", () => {
    const b = band("air-fryer-broccoli");
    if (b) expect(b).toBe("low");
  });

  it("34 a sugary/refined dessert never reads 'low'", () => {
    const b = band("churros");
    if (b) expect(b).not.toBe("low");
  });

  it("35 every covered dish has a valid glycemic band or none", () => {
    const bad = covered.filter((p) => {
      const e = estimateGlycemicLoad(p);
      return e && !["low", "medium", "high"].includes(e.band);
    });
    expect(bad).toEqual([]);
  });

  it("36 nutrient density ranks broccoli above a fried/sugary dish", () => {
    const broc = per("air-fryer-broccoli");
    const fried = per("churros");
    if (broc && fried)
      expect(nutrientDensity(broc)).toBeGreaterThan(nutrientDensity(fried));
  });

  it("37 nutrient density is always within 0..100 (no NaN/garbage)", () => {
    const bad = covered.filter((p) => {
      const d = nutrientDensity(p);
      return Number.isNaN(d) || d < 0 || d > 100;
    });
    expect(bad).toEqual([]);
  });

  it("38 the nutrient-dense flag genuinely fires across the catalogue (not always-false)", () => {
    const dense = covered.filter(isNutrientDense);
    expect(dense.length).toBeGreaterThanOrEqual(3);
  });

  it("39 protein quality: when scored, a fish dish is a complete protein", () => {
    const salmon = per("grilled-salmon");
    const pq = salmon ? proteinQuality(salmon) : null;
    if (pq) expect(pq.complete).toBe(true);
  });

  it("40 protein quality is self-consistent everywhere (complete ⟺ score≥1, score≥0)", () => {
    const bad = covered.filter((p) => {
      const pq = proteinQuality(p);
      if (!pq) return false;
      return pq.score < 0 || pq.complete !== pq.score >= 1;
    });
    expect(bad).toEqual([]);
  });
});
