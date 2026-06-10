import { describe, expect, it } from "vitest";
import { dishesForDeficit, deficitFillFor } from "./deficit-fill-dishes";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (o: Record<string, number>) => o as unknown as PerServingNutrition;

describe("deficit-fill suggestions (#3)", () => {
  it("an iron deficit returns iron-rich dishes with sane % values", () => {
    const out = dishesForDeficit(
      { key: "iron_mg", label: "Iron", pct: 10, weight: 0.9 },
      3,
    );
    expect(out.length).toBe(3);
    for (const s of out) {
      expect(s.closesPct).toBeGreaterThan(0);
      expect(Number.isFinite(s.closesPct)).toBe(true);
      expect(s.slug).toBeTruthy();
    }
    // top suggestion should close a meaningful chunk of the day
    expect(out[0].closesPct).toBeGreaterThanOrEqual(15);
  });

  it("is deterministic", () => {
    const a = dishesForDeficit(
      { key: "vitaminC_mg", label: "Vitamin C", pct: 5, weight: 0.95 },
      3,
    );
    const b = dishesForDeficit(
      { key: "vitaminC_mg", label: "Vitamin C", pct: 5, weight: 0.95 },
      3,
    );
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("unknown nutrient key → empty (never throws)", () => {
    expect(
      dishesForDeficit({ key: "unobtainium", label: "X", pct: 0, weight: 1 }),
    ).toEqual([]);
  });

  it("deficitFillFor gates: null day → null; well-covered day → null", () => {
    expect(deficitFillFor(null)).toBeNull();
    // a day at 100% of everything has no <60% deficit
    const full: Record<string, number> = { calories: 2000 };
    for (const k of [
      "iron_mg",
      "calcium_mg",
      "potassium_mg",
      "magnesium_mg",
      "vitaminC_mg",
      "vitaminD_mcg",
      "vitaminA_mcg_rae",
      "folate_mcg",
      "vitaminB12_mcg",
      "zinc_mg",
      "omega3_g",
      "fiber_g",
    ])
      full[k] = 10000;
    expect(deficitFillFor(N(full))).toBeNull();
  });
});
