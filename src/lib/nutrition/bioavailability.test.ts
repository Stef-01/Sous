import { describe, expect, it } from "vitest";
import { bioavailabilityTip } from "./bioavailability";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (over: Record<string, number>) =>
  over as unknown as PerServingNutrition;

describe("bioavailabilityTip", () => {
  it("suggests vitamin C for an iron-rich, low-vitamin-C dish", () => {
    const t = bioavailabilityTip(N({ iron_mg: 6, vitaminC_mg: 0 }));
    expect(t?.tip).toMatch(/iron/i);
  });

  it("does not fire the iron tip when the dish already has vitamin C", () => {
    const t = bioavailabilityTip(N({ iron_mg: 6, vitaminC_mg: 50 }));
    expect(t?.tip ?? "").not.toMatch(/absorb the iron/i);
  });

  it("suggests a little fat for fat-soluble vitamins in a very low-fat dish", () => {
    const t = bioavailabilityTip(N({ vitaminA_mcg_rae: 400, totalFat_g: 0 }));
    expect(t?.tip).toMatch(/fat|A, D, E/i);
  });

  it("does not fire the fat tip when the dish already has fat", () => {
    const t = bioavailabilityTip(N({ vitaminA_mcg_rae: 400, totalFat_g: 12 }));
    expect(t).toBeNull();
  });

  it("returns null when no tip applies", () => {
    expect(bioavailabilityTip(N({ calories: 100 }))).toBeNull();
  });
});
