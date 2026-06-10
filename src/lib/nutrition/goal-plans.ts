/**
 * Goal plans (founder feature, 2026-06-10) — preset nutrient-focus bundles.
 * A plan STARS a set of nutrients (they pin to the top of Key nutrients) and
 * may carry a pattern note. Copy is bound by the therapeutics claim contract:
 * association/support framing only, never disease-claim verbs (the unit test
 * runs every string through assertNoMedicalClaim).
 */

export interface GoalPlan {
  id: string;
  label: string;
  /** PerServingNutrition keys to star. */
  nutrients: ReadonlyArray<string>;
  /** One claim-safe line of framing. */
  note: string;
  /** Optional pattern reminder (e.g. what many people ease off). */
  avoid?: string;
}

export const GOAL_PLANS: ReadonlyArray<GoalPlan> = [
  {
    id: "hair-skin",
    label: "Hair & skin",
    nutrients: ["iron_mg", "zinc_mg", "omega3_g"],
    note: "Nutrients commonly tracked for hair and skin support.",
  },
  {
    id: "steady-energy",
    label: "Steady energy",
    nutrients: ["iron_mg", "vitaminB12_mcg", "magnesium_mg"],
    note: "Commonly tracked when energy keeps dipping.",
  },
  {
    id: "calm-inflammation",
    label: "Low-inflammation",
    nutrients: ["omega3_g", "fiber_g", "magnesium_mg"],
    note: "A pattern focus: more omega-3 and fiber.",
    avoid:
      "Many people following this pattern also ease off refined grains — white bread, pastries.",
  },
  {
    id: "bones",
    label: "Bones",
    nutrients: ["calcium_mg", "vitaminD_mcg", "magnesium_mg"],
    note: "The bone-support trio most plans watch.",
  },
];

export function goalPlanById(id: string | null): GoalPlan | null {
  return GOAL_PLANS.find((p) => p.id === id) ?? null;
}
