/**
 * W48 — scale test. Confirms the nutrition engine + content helpers stay fast and
 * correct under load: the full real catalogue, plus 1000+ synthetic dishes and
 * 500 synthetic ingredient sets. Budgets are generous (CI-safe); the point is
 * "no blow-up + no false positives at scale", not micro-benchmarking.
 */
import { describe, expect, it } from "vitest";
import { getDishNutrition } from "@/lib/engine/dish-nutrition";
import { bioavailabilityTip } from "./bioavailability";
import { estimateGlycemicLoad } from "./glycemic";
import { nutrientDensity } from "./nutrient-density";
import { ayurvedicHerbsForDish } from "@/data/ayurvedic-evidence";
import { meals, sides } from "@/data";
import type { PerServingNutrition } from "@/types/nutrition";

describe("scale test (W48)", () => {
  it("resolves nutrition for the whole real catalogue quickly", () => {
    const ids = [...meals, ...sides].map((d) => d.id);
    const t0 = performance.now();
    let ok = 0;
    for (const id of ids) if (getDishNutrition(id).perServing) ok++;
    expect(ok).toBeGreaterThan(100);
    expect(performance.now() - t0).toBeLessThan(4000);
  });

  it("runs every content helper over 1200 synthetic dishes without error", () => {
    const HERBS = ["turmeric", "garlic", "ginger", "tomato", "red-lentils", "black-pepper", "cinnamon"];
    const t0 = performance.now();
    for (let i = 0; i < 1200; i++) {
      const n = {
        calories: 100 + (i % 500),
        protein_g: i % 40,
        totalCarbs_g: i % 120,
        totalFat_g: i % 30,
        fiber_g: i % 15,
        iron_mg: i % 8,
        vitaminC_mg: i % 90,
        totalSugars_g: i % 20,
      } as unknown as PerServingNutrition;
      const ids = new Set([HERBS[i % HERBS.length], "onion"]);
      bioavailabilityTip(n, ids);
      estimateGlycemicLoad(n);
      nutrientDensity(n);
      ayurvedicHerbsForDish(ids);
    }
    expect(performance.now() - t0).toBeLessThan(3000);
  });

  it("herb matching stays exact (zero false positives) across 500 synthetic ingredient sets", () => {
    let phantom = 0;
    for (let i = 0; i < 500; i++) {
      const ids = new Set([`ing-${i}`, i % 3 === 0 ? "garlic" : `x-${i}`]);
      for (const h of ayurvedicHerbsForDish(ids))
        if (!ids.has(h.ingredientId)) phantom++;
    }
    expect(phantom).toBe(0);
  });
});
