import { describe, expect, it } from "vitest";
import { suggestSides } from "./pairing-engine";
import type { MainDishIntent, SideDishCandidate } from "./types";
import type { CareProfile } from "@/types/care-profile";

const main: MainDishIntent = {
  dishName: "Grilled Chicken",
  cuisineSignals: ["american"],
  isHomemade: true,
  effortTolerance: "moderate",
  healthOrientation: "balanced",
  moodSignals: [],
};

function side(
  id: string,
  name: string,
  tags: string[],
  dietaryFlags?: string[],
): SideDishCandidate {
  return {
    id,
    slug: id,
    name,
    cuisineFamily: "american",
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    skillLevel: "easy",
    flavorProfile: ["savory"],
    temperature: "warm",
    proteinGrams: null,
    fiberGrams: null,
    caloriesPerServing: null,
    bestPairedWith: [],
    tags,
    pairingReason: null,
    nutritionCategory: "vegetable",
    dietaryFlags,
  };
}

const candidates: SideDishCandidate[] = [
  side("oat-pilaf", "Oat & Barley Pilaf", ["oats", "barley"]),
  side("nut-slaw", "Almond Crunch Slaw", ["nuts", "almond"]),
  side("white-rice", "Plain White Rice", ["white rice"]),
  side("garlic-bread", "Garlic Bread", ["bread"]),
];

const ldlCare: CareProfile = {
  v: 1,
  conditions: ["high-ldl"],
  avoid: [],
  fodmapPhase: null,
  updatedAt: "",
};

describe("suggestSides — therapeutic integration (CT-3)", () => {
  it("GOLDEN: omitting therapeutic context is byte-identical to before", () => {
    const baseline = suggestSides(main, candidates);
    const explicitNone = suggestSides(
      main,
      candidates,
      undefined,
      undefined,
      3,
    );
    expect(explicitNone).toEqual(baseline);
  });

  it("GOLDEN: an inactive care profile changes nothing", () => {
    const baseline = suggestSides(main, candidates);
    const inactive = suggestSides(main, candidates, undefined, undefined, 3, {
      care: ldlCare,
      active: false,
    });
    expect(inactive).toEqual(baseline);
    // and no therapeuticFit leaks into the breakdown
    if (inactive.success) {
      for (const s of inactive.data.sides) {
        expect("therapeuticFit" in s.scores).toBe(false);
      }
    }
  });

  it("dormant by default (registry unreviewed) even with a care profile", () => {
    const baseline = suggestSides(main, candidates);
    const defaulted = suggestSides(main, candidates, undefined, undefined, 3, {
      care: ldlCare,
    });
    expect(defaulted).toEqual(baseline); // active resolves false until gate G1
  });

  it("ACTIVE: re-ranks toward food-first evidence and sets therapeuticFit", () => {
    const res = suggestSides(main, candidates, undefined, undefined, 4, {
      care: ldlCare,
      active: true,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    const byId = Object.fromEntries(
      res.data.sides.map((s) => [s.sideDish.id, s.scores.therapeuticFit]),
    );
    expect(byId["oat-pilaf"]).toBeGreaterThan(0.5);
    expect(byId["nut-slaw"]).toBeGreaterThan(0.5);
    expect(byId["white-rice"]).toBe(0.5);
    // an evidence-bearing side outranks the neutral one
    const ids = res.data.sides.map((s) => s.sideDish.id);
    expect(ids.indexOf("oat-pilaf")).toBeLessThan(ids.indexOf("white-rice"));
  });

  it("ACTIVE: celiac hard-excludes gluten dishes before scoring", () => {
    const celiac: CareProfile = {
      v: 1,
      conditions: ["celiac"],
      avoid: [],
      fodmapPhase: null,
      updatedAt: "",
    };
    const withFlags = [
      side("gf-rice", "GF Rice", ["rice"], ["gluten-free"]),
      side("wheat-bread", "Wheat Bread", ["bread"], []), // no gluten-free flag
    ];
    const res = suggestSides(main, withFlags, undefined, undefined, 5, {
      care: celiac,
      active: true,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    const ids = res.data.sides.map((s) => s.sideDish.id);
    expect(ids).toContain("gf-rice");
    expect(ids).not.toContain("wheat-bread");
    expect(res.data.totalCandidates).toBe(1);
  });
});
