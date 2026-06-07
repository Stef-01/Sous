/**
 * Dietary display (W34) — turn the dietary-inferer's flags into a safe,
 * honest surface. Two asymmetric halves, on purpose:
 *
 * - `diets`: positive preference/needs compatibilities (vegan, vegetarian,
 *   gluten-free, dairy-free) the recipe APPEARS to meet. Shown as soft pills,
 *   always under a "based on the recipe" caveat.
 * - `mayContain`: acute-allergen WARNINGS (nuts, shellfish) — emitted ONLY when
 *   the inferer detects a violation term. We never assert a dish is nut/
 *   shellfish FREE from a text scan (a hidden nut would make that dangerous);
 *   over-warning is the safe direction, and the caveat covers the rest.
 */

import { inferDietaryFlags } from "@/lib/engine/dietary-inferer";

const DIET_LABELS = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  "gluten-free": "Gluten-free",
  "dairy-free": "Dairy-free",
} as const;

const ALLERGEN_LABELS = {
  "nut-allergy": "nuts",
  "shellfish-allergy": "shellfish",
} as const;

export interface DietaryDisplay {
  diets: string[];
  mayContain: string[];
}

export function dietaryDisplay(input: {
  tags: ReadonlyArray<string>;
  description: string;
}): DietaryDisplay {
  const flags = new Set(
    inferDietaryFlags({
      tags: [...input.tags],
      description: input.description,
    }),
  );

  const diets = (["vegan", "vegetarian", "gluten-free", "dairy-free"] as const)
    .filter((f) => flags.has(f))
    .map((f) => DIET_LABELS[f]);
  // Vegan already implies vegetarian — don't show both (rule 13: no restatement).
  const deduped = diets.includes("Vegan")
    ? diets.filter((d) => d !== "Vegetarian")
    : diets;

  const mayContain = (["nut-allergy", "shellfish-allergy"] as const)
    .filter((f) => !flags.has(f)) // a violation was detected → warn
    .map((f) => ALLERGEN_LABELS[f]);

  return { diets: deduped, mayContain };
}
