/**
 * Dietary display (W34) — a SAFE, honest dietary/allergen surface.
 *
 * Hard lessons from the safety review baked in here:
 * - Scan the recipe's ACTUAL INGREDIENT LIST, never the marketing blurb. With
 *   no ingredients we surface nothing — we never guess.
 * - NEVER assert a health-stakes "free" claim (gluten-free / dairy-free) from
 *   inference. Gluten (celiac) and dairy (allergy) appear ONLY as "may contain"
 *   warnings when a violation is detected — the safe over-warn direction, same
 *   asymmetry the inferer already uses for nuts/shellfish.
 * - Positive pills are limited to PREFERENCE diets (vegan / vegetarian), which
 *   are ingredient-derived and lower-harm; an under-claim there is harmless.
 */

import { inferDietaryFlags } from "@/lib/engine/dietary-inferer";

const DIET_LABELS = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
} as const;

// flag-the-dish-LACKS → the warning to show. Order is display order.
const WARNINGS = [
  ["gluten-free", "gluten"],
  ["dairy-free", "dairy"],
  ["nut-allergy", "nuts"],
  ["shellfish-allergy", "shellfish"],
] as const;

export interface DietaryDisplay {
  diets: string[];
  mayContain: string[];
}

export function dietaryDisplay(input: {
  tags: ReadonlyArray<string>;
  /** The recipe's real ingredient names (e.g. from getMealCookSummary). */
  ingredients: ReadonlyArray<string>;
}): DietaryDisplay {
  // No ingredient list ⇒ no signal we can stand behind ⇒ show nothing.
  if (input.ingredients.length === 0) return { diets: [], mayContain: [] };

  const flags = new Set(
    inferDietaryFlags({
      tags: [...input.tags],
      description: input.ingredients.join(" · "),
    }),
  );

  // Positive pills: preference diets only.
  const diets = (["vegan", "vegetarian"] as const)
    .filter((f) => flags.has(f))
    .map((f) => DIET_LABELS[f]);
  const deduped = diets.includes("Vegan")
    ? diets.filter((d) => d !== "Vegetarian")
    : diets;

  // Warnings: emitted when the dish is NOT compatible (a violation was found).
  const mayContain = WARNINGS.filter(([flag]) => !flags.has(flag)).map(
    ([, label]) => label,
  );

  return { diets: deduped, mayContain };
}
