/**
 * Nutrition content accuracy — ROUND 1 of 5: data integrity. Sweeps the WHOLE
 * covered catalogue and asserts no dish surfaces garbage numbers (calories that
 * don't reconcile with macros, negatives, impossible ratios). 10 tests.
 */
import { describe, expect, it } from "vitest";
import {
  getDishNutrition,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";
import { meals, sides } from "@/data";

const allIds = [...meals, ...sides].map((d) => d.id);
const covered = allIds
  .map((id) => ({ id, r: getDishNutrition(id) }))
  .filter(
    (x) => x.r.perServing && x.r.massedCoverage >= NUTRITION_COVERAGE_FLOOR,
  )
  .map((x) => ({ id: x.id, p: x.r.perServing! }));

const num = (v: number | undefined) => v ?? 0;

describe("Round 1 — nutrition data integrity", () => {
  it("01 there is a substantial covered catalogue to audit", () => {
    expect(covered.length).toBeGreaterThan(100);
  });

  it("02 calories reconcile with macros (Atwater, within 25%)", () => {
    const bad = covered.filter(({ p }) => {
      const at =
        4 * num(p.protein_g) + 4 * num(p.totalCarbs_g) + 9 * num(p.totalFat_g);
      return at > 60 && Math.abs(num(p.calories) - at) / at > 0.25;
    });
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("03 no negative macro/energy values anywhere", () => {
    const bad = covered.filter(
      ({ p }) =>
        num(p.calories) < 0 ||
        num(p.protein_g) < 0 ||
        num(p.totalCarbs_g) < 0 ||
        num(p.totalFat_g) < 0 ||
        num(p.fiber_g) < 0,
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("04 fibre never exceeds total carbohydrate", () => {
    const bad = covered.filter(
      ({ p }) => num(p.fiber_g) > num(p.totalCarbs_g) + 0.5,
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("05 total sugars never exceed total carbohydrate", () => {
    const bad = covered.filter(
      ({ p }) => num(p.totalSugars_g) > num(p.totalCarbs_g) + 0.5,
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("06 no absurd per-serving energy (every dish < 3000 kcal)", () => {
    const bad = covered.filter(({ p }) => num(p.calories) > 3000);
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("07 no absurd sodium (< 12000 mg/serving)", () => {
    const bad = covered.filter(({ p }) => num(p.sodium_mg) > 12000);
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("08 every covered dish has positive calories", () => {
    const bad = covered.filter(({ p }) => num(p.calories) <= 0);
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("09 a known vegetable dish (broccoli) is genuinely vitamin-C rich", () => {
    const broc = covered.find((d) => d.id === "air-fryer-broccoli");
    if (broc) expect(num(broc.p.vitaminC_mg)).toBeGreaterThan(40);
  });

  it("10 a known fish dish (grilled-salmon) carries real protein", () => {
    const salmon = covered.find((d) => d.id === "grilled-salmon");
    if (salmon) expect(num(salmon.p.protein_g)).toBeGreaterThan(15);
  });
});
