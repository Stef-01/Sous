import { describe, expect, it } from "vitest";
import { bioavailabilityTip } from "./bioavailability";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (over: Record<string, number>) =>
  over as unknown as PerServingNutrition;

describe("bioavailabilityTip", () => {
  it("suggests vitamin C for an iron-rich, low-vitamin-C dish", () => {
    const t = bioavailabilityTip(N({ iron_mg: 6, vitaminC_mg: 0 }));
    expect(t?.tip).toMatch(/citrus|iron/i);
  });

  it("suggests black pepper for a turmeric dish without pepper", () => {
    const t = bioavailabilityTip(N({}), new Set(["turmeric", "onion"]));
    expect(t?.tip).toMatch(/black pepper/i);
  });

  it("does NOT suggest pepper when the dish already has black pepper", () => {
    const t = bioavailabilityTip(N({}), new Set(["turmeric", "black-pepper"]));
    expect(t?.tip ?? "").not.toMatch(/black pepper/i);
  });

  it("nudges tea/coffee timing for an iron-rich dish that already has vitamin C", () => {
    const t = bioavailabilityTip(N({ iron_mg: 6, vitaminC_mg: 50 }));
    expect(t?.tip).toMatch(/tea|coffee/i);
  });

  it("pairs vitamin D with calcium when both are present (and fat is adequate)", () => {
    const t = bioavailabilityTip(
      N({ calcium_mg: 400, vitaminD_mcg: 6, totalFat_g: 10 }),
    );
    expect(t?.tip).toMatch(/vitamin D|calcium/i);
  });

  it("suggests soaking for a legume dish carrying iron/zinc", () => {
    const t = bioavailabilityTip(
      N({ iron_mg: 3, vitaminC_mg: 50 }),
      new Set(["chickpeas", "onion"]),
    );
    expect(t?.tip).toMatch(/soak|sprout/i);
  });

  it("notes lycopene for a dish containing tomato", () => {
    const t = bioavailabilityTip(N({}), new Set(["tomato", "garlic"]));
    expect(t?.tip).toMatch(/lycopene|tomato/i);
  });

  it("the add-fat cue takes priority over the calcium pairing when fat is low", () => {
    const t = bioavailabilityTip(N({ calcium_mg: 400, vitaminD_mcg: 6 }));
    expect(t?.tip).toMatch(/fat|A, D, E/i);
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
