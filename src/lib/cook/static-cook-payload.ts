import type { StaticDishData } from "@/data/guided-cook-steps";

/** Shapes bundled guided-cook data exactly like `cook.getSteps`. */
export function formatStaticCookPayload(staticData: StaticDishData) {
  return {
    dish: {
      id: staticData.slug,
      name: staticData.name,
      slug: staticData.slug,
      description: staticData.description,
      cuisineFamily: staticData.cuisineFamily,
      prepTimeMinutes: staticData.prepTimeMinutes,
      cookTimeMinutes: staticData.cookTimeMinutes,
      skillLevel: staticData.skillLevel,
      heroImageUrl: staticData.heroImageUrl,
      flavorProfile: staticData.flavorProfile,
      temperature: staticData.temperature,
    },
    steps: staticData.steps.map((step, index) => ({
      id: `${staticData.slug}-step-${index + 1}`,
      ...step,
      attentionPointers: null,
    })),
    ingredients: staticData.ingredients,
  };
}
