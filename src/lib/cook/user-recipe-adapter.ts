/**
 * User-recipe → cook page adapter.
 *
 * W31 follow-on to the W27 author surface. Closes the recipe-
 * authoring loop end-to-end by letting a user-authored recipe
 * render through the same Mission → Grab → Cook → Win shell as a
 * seed-catalog dish (CLAUDE.md rule 4: "Every recipe — internal,
 * user-created, or externally retrieved — renders through the
 * same Quest shell. No exceptions.")
 *
 * Pure / dependency-free: input is a UserRecipe (from
 * useRecipeDrafts), output mirrors the shape returned by
 * `trpc.cook.getSteps` so the cook step page consumes both
 * sources identically. The cook page wires the fallback at the
 * data layer; no UI branching downstream.
 */

import type { UserRecipe } from "@/types/user-recipe";

/** Output shape — matches the static-data branch of
 *  `cookRouter.getSteps` so the cook page's existing rendering
 *  works without conditional logic. Defined locally rather than
 *  exporting back from the cook router to avoid a server-only
 *  import landing in client code. */
export interface CookPageDishShape {
  dish: {
    id: string;
    name: string;
    slug: string;
    description: string;
    cuisineFamily: string;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    skillLevel: string;
    heroImageUrl: string | null;
    flavorProfile: string[];
    temperature: string;
  };
  steps: Array<{
    id: string;
    phase: "cook";
    stepNumber: number;
    instruction: string;
    timerSeconds: number | null;
    mistakeWarning: string | null;
    quickHack: string | null;
    cuisineFact: string | null;
    donenessCue: string | null;
    imageUrl: string | null;
  }>;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: string;
    isOptional: boolean;
    substitution: string | null;
  }>;
}

/** Adapt a UserRecipe to the cook page's expected shape. */
export function adaptUserRecipeForCook(recipe: UserRecipe): CookPageDishShape {
  return {
    dish: {
      id: recipe.id,
      // Prefer dishName so the Mission screen shows the cook-
      // facing label; falls back to title for older payloads
      // that may not have dishName populated.
      name: recipe.dishName || recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      cuisineFamily: recipe.cuisineFamily,
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      skillLevel: recipe.skillLevel,
      heroImageUrl: recipe.heroImageUrl ?? null,
      flavorProfile: recipe.flavorProfile,
      temperature: recipe.temperature,
    },
    steps: recipe.steps.map((s) => ({
      id: `${recipe.slug}-step-${s.stepNumber}`,
      phase: "cook" as const,
      stepNumber: s.stepNumber,
      instruction: s.instruction,
      timerSeconds: s.timerSeconds ?? null,
      mistakeWarning: s.mistakeWarning ?? null,
      quickHack: s.quickHack ?? null,
      // W40 schema migration: cuisineFact + imageUrl are now
      // first-class fields on user steps, so the adapter
      // passes them through instead of null-defaulting.
      cuisineFact: s.cuisineFact ?? null,
      donenessCue: s.donenessCue ?? null,
      imageUrl: s.imageUrl ?? null,
    })),
    ingredients: recipe.ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      isOptional: i.isOptional,
      substitution: i.substitution ?? null,
    })),
  };
}

/** Find a user recipe by slug from a list (typically
 *  `useRecipeDrafts().drafts`). Returns null when no match.
 *  Pure helper exported for unit testing. */
export function findUserRecipeBySlug(
  drafts: ReadonlyArray<UserRecipe>,
  slug: string,
): UserRecipe | null {
  return drafts.find((r) => r.slug === slug) ?? null;
}
