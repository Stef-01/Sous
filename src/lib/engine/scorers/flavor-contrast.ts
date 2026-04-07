import type { Scorer, MainDishIntent, SideDishCandidate } from "../types";

/**
 * Flavor Contrast Scorer
 *
 * Rewards sides that complement the main's flavor rather than duplicating it.
 * Bright sides pair well with rich mains. Crunchy sides complement saucy mains.
 */

// Complementary flavor pairs — each key is complemented by its values
const COMPLEMENTS: Record<string, string[]> = {
  rich: ["bright", "acidic", "fresh", "crunchy", "light"],
  heavy: ["bright", "fresh", "light", "crisp"],
  spicy: ["cooling", "creamy", "yogurt", "mild"],
  saucy: ["crunchy", "crisp", "bread", "grain"],
  fried: ["fresh", "acidic", "light", "salad"],
  grilled: ["fresh", "bright", "herby", "cool"],
  creamy: ["crunchy", "acidic", "bright", "spicy"],
  sweet: ["savory", "salty", "tangy"],
  bland: ["bold", "spicy", "tangy", "herby", "flavorful"],
};

// Infer main dish flavor profile from mood signals and name
function inferMainFlavors(main: MainDishIntent): string[] {
  const flavors: string[] = [...main.moodSignals];
  const name = main.dishName.toLowerCase();

  if (name.includes("curry") || name.includes("masala"))
    flavors.push("spicy", "rich", "saucy");
  if (name.includes("fried") || name.includes("tempura"))
    flavors.push("fried", "heavy");
  if (
    name.includes("grill") ||
    name.includes("bbq") ||
    name.includes("tandoori")
  )
    flavors.push("grilled", "smoky");
  if (name.includes("cream") || name.includes("butter"))
    flavors.push("creamy", "rich");
  if (name.includes("soup") || name.includes("stew"))
    flavors.push("saucy", "heavy");
  if (name.includes("salad") || name.includes("poke"))
    flavors.push("fresh", "light");
  if (name.includes("burger") || name.includes("pizza"))
    flavors.push("heavy", "rich");
  if (name.includes("pasta") || name.includes("carbonara"))
    flavors.push("rich", "creamy");
  if (name.includes("ramen") || name.includes("pho"))
    flavors.push("saucy", "rich");

  return [...new Set(flavors)];
}

export const flavorContrastScorer: Scorer = {
  name: "flavorContrast",

  score(main: MainDishIntent, side: SideDishCandidate): number {
    const mainFlavors = inferMainFlavors(main);
    const sideFlavors = side.flavorProfile;

    if (mainFlavors.length === 0 || sideFlavors.length === 0) return 0.5;

    let complementHits = 0;
    let sameHits = 0;

    for (const mainFlavor of mainFlavors) {
      const complements = COMPLEMENTS[mainFlavor] ?? [];
      for (const sideFlavor of sideFlavors) {
        if (complements.includes(sideFlavor)) complementHits++;
        if (sideFlavor === mainFlavor) sameHits++;
      }
    }

    // Reward complements, penalize duplicates
    const complementScore = Math.min(complementHits * 0.2, 0.8);
    const duplicationPenalty = Math.min(sameHits * 0.1, 0.3);

    return Math.max(0, Math.min(1, 0.3 + complementScore - duplicationPenalty));
  },
};
