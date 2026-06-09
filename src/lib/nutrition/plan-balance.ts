/**
 * Plan balance (W32) — the INTERNAL balance of a week's planned dishes, framed
 * to dodge the framing trap. A few planned dinners are not a full day, so we
 * never compare to DAILY targets. And per-serving macros are coverage-gated
 * (only ~70%-resolved dishes count), which skews a small plan toward whichever
 * dishes happen to resolve — so we DON'T headline a macro split either.
 *
 * Instead we surface the robust, serving-independent signal the codebase trusts
 * (see dish-nutrition's food-group composition): how many distinct whole-food
 * groups the plan spans, and whether it covers vegetables + a protein source.
 */

import { getDishCompositionGrams } from "@/lib/engine/dish-nutrition";
import type { FoodGroup } from "@/types/ingredient";

// PRIMARY protein groups only. Dairy + nuts/seeds carry some protein but are
// usually trace at side scale, and counting them would suppress a useful
// "add a protein" nudge for a genuinely protein-light week.
const PROTEIN_GROUPS: ReadonlySet<FoodGroup> = new Set([
  "legume",
  "seafood",
  "poultry",
  "egg",
  "red-meat",
]);

export interface FoodGroupRoles {
  hasVegetable: boolean;
  hasProtein: boolean;
}

/** Pure: which dietary roles a set of food groups covers. Shared by planBalance
 *  and sousRead so the two can't drift on what counts as veg / protein. */
export function foodGroupRoles(
  foodGroups: readonly FoodGroup[],
): FoodGroupRoles {
  return {
    hasVegetable: foodGroups.some(
      (g) => g === "vegetable" || g === "leafy-green",
    ),
    hasProtein: foodGroups.some((g) => PROTEIN_GROUPS.has(g)),
  };
}

export interface PlanBalance {
  /** Distinct whole-food groups present across the plan, most grams first. */
  foodGroups: FoodGroup[];
  hasVegetable: boolean;
  hasProtein: boolean;
}

export function planBalance(slugs: ReadonlyArray<string>): PlanBalance {
  const groupGrams: Partial<Record<FoodGroup, number>> = {};
  for (const slug of slugs) {
    const comp = getDishCompositionGrams(slug);
    for (const [g, grams] of Object.entries(comp.byGroup)) {
      groupGrams[g as FoodGroup] =
        (groupGrams[g as FoodGroup] ?? 0) + (grams ?? 0);
    }
  }

  const foodGroups = (Object.entries(groupGrams) as [FoodGroup, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g);

  return { foodGroups, ...foodGroupRoles(foodGroups) };
}
