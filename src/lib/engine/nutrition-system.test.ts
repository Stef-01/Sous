/**
 * End-to-end integration guard for the ingredient-nutrition system. Locks the
 * invariants that span the layers (registry → links → bridge → compose) so a
 * regression in any one surfaces here, not in production.
 */
import { describe, expect, it } from "vitest";
import { INGREDIENT_LIST } from "@/data/ingredients";
import { RECIPE_LINKS } from "@/data/ingredients/recipe-links";
import { getDishTherapeuticProfile } from "./dish-therapeutic-profile";
import { getDishNutrition } from "./dish-nutrition";
import { matchInterventionsForDish } from "./therapeutic-fit";

const NUTRIENT_KEYS = [
  "calories",
  "fiber_g",
  "iron_mg",
  "sodium_mg",
  "saturatedFat_g",
  "omega3_g",
] as const;

describe("nutrition system — integration invariants", () => {
  it("every registry ingredient is well-formed (USDA, non-negative)", () => {
    for (const ing of INGREDIENT_LIST) {
      expect(ing.foodGroup, ing.id).toBeTruthy();
      for (const k of NUTRIENT_KEYS) {
        expect(ing.per100g[k], `${ing.id}.${k}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("a representative whole-food dish flows end to end", () => {
    // caesar-salad → olive-oil class → Mediterranean evidence + a 'Built on'.
    const profile = getDishTherapeuticProfile("caesar-salad");
    expect(profile.therapeuticClasses).toContain("olive-oil");
    const matches = matchInterventionsForDish({
      name: "caesar salad",
      tags: [],
      resolvedClasses: profile.therapeuticClasses,
      resolvedGroups: profile.foodGroups,
    });
    expect(matches.length).toBeGreaterThan(0);
    expect(getDishNutrition("caesar-salad").perServing).not.toBeNull();
  });

  it("the bridge lights a meaningful share of the catalog by food identity", () => {
    let lit = 0;
    for (const slug of Object.keys(RECIPE_LINKS)) {
      const p = getDishTherapeuticProfile(slug);
      const m = matchInterventionsForDish({
        name: "x", // neutral name → only structural matches count
        tags: [],
        resolvedClasses: p.therapeuticClasses,
        resolvedGroups: p.foodGroups,
      });
      if (m.length) lit++;
    }
    // Round 3 baseline was 48; never let the bridge silently go dark.
    expect(lit).toBeGreaterThanOrEqual(40);
  });

  it("is deterministic + well-formed across the entire catalog", () => {
    for (const slug of Object.keys(RECIPE_LINKS)) {
      // Run the full pipeline twice — pure functions must agree byte-for-byte.
      const a = {
        profile: getDishTherapeuticProfile(slug),
        nutrition: getDishNutrition(slug),
      };
      const b = {
        profile: getDishTherapeuticProfile(slug),
        nutrition: getDishNutrition(slug),
      };
      expect(JSON.stringify(a), slug).toBe(JSON.stringify(b));

      // Composed nutrition, where present, is finite + non-negative.
      if (a.nutrition.perServing) {
        for (const v of Object.values(a.nutrition.perServing)) {
          if (typeof v === "number") {
            expect(Number.isFinite(v), slug).toBe(true);
            expect(v, slug).toBeGreaterThanOrEqual(0);
          }
        }
      }
      // Coverage is a valid fraction.
      expect(a.nutrition.massedCoverage, slug).toBeGreaterThanOrEqual(0);
      expect(a.nutrition.massedCoverage, slug).toBeLessThanOrEqual(1);
    }
  });
});
