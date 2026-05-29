/**
 * Seed-fork adapter — convert a seed-catalog `StaticDishData`
 * into a `RecipeDraft` the user can edit in the W27 authoring
 * form.
 *
 * W43 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint I W42-W46
 * content polish). The recipe-authoring template library: a user
 * can pick a popular seed recipe (Caesar Salad, etc.), tap "Start
 * from this recipe", land on /path/recipes/new pre-filled with
 * the seed's data, then edit and save as their own user recipe.
 *
 * The user's saved fork is independent from the seed — editing
 * the fork doesn't affect the seed catalog. Same shape as a
 * user-authored recipe so it round-trips through the
 * `userRecipeSchema` / `commitDraft` / `useRecipeDrafts` pipeline.
 *
 * Pure / dependency-free.
 */

import type { StaticDishData } from "@/data/guided-cook-steps";
import { SCHEMA_VERSION, type UserStep } from "@/types/user-recipe";
import type { RecipeDraft } from "./recipe-draft";

/**
 * Adapt a seed dish to a RecipeDraft. Strategy:
 *
 *   - Drop the id / slug / createdAt / updatedAt fields (RecipeDraft
 *     leaves them undefined; commitDraft fills new values when the
 *     user saves the fork — they're authoring a new recipe, not
 *     editing the seed).
 *   - Filter the seed's steps to phase=cook (matches the user
 *     schema's expectation; prep/finish phases drop into the
 *     description's mental model).
 *   - Renumber steps 1..N so the userRecipeSchema's sequence
 *     refinement passes.
 *   - Title prefixed "My " so the fork is visibly distinct from
 *     the seed in the user's "My recipes" list. The user can edit
 *     the title before saving.
 *   - skillLevel coerced to the union the user schema accepts;
 *     unknown seed values default to "intermediate".
 */
export function seedToRecipeDraft(seed: StaticDishData): RecipeDraft {
  const cookSteps = seed.steps.filter((s) => s.phase === "cook");
  const userSteps: UserStep[] = cookSteps.map((s, idx) => ({
    stepNumber: idx + 1,
    instruction: s.instruction,
    timerSeconds: s.timerSeconds,
    mistakeWarning: s.mistakeWarning,
    quickHack: s.quickHack,
    cuisineFact: s.cuisineFact,
    donenessCue: s.donenessCue,
    imageUrl: s.imageUrl,
  }));

  return {
    schemaVersion: SCHEMA_VERSION,
    // W47 — a fork of a Nourish-verified seed becomes a "user"
    // recipe when saved. The user authored the customisation;
    // they can later opt into the community-submission flow if
    // they want admin verification.
    source: "user",
    nourishApprovedAt: null,
    nourishApprovedBy: null,
    authorDisplayName: null,
    title: `My ${seed.name}`,
    dishName: seed.name,
    cuisineFamily: seed.cuisineFamily,
    flavorProfile: [...seed.flavorProfile],
    dietaryFlags: [],
    temperature: coerceTemperature(seed.temperature),
    skillLevel: coerceSkillLevel(seed.skillLevel),
    prepTimeMinutes: seed.prepTimeMinutes,
    cookTimeMinutes: seed.cookTimeMinutes,
    serves: 2,
    heroImageUrl: seed.heroImageUrl ?? null,
    description: seed.description,
    ingredients: seed.ingredients.map((i, idx) => ({
      // Reset ids to the canonical `i-<n>` so future
      // appendBlankIngredient calls don't collide.
      id: `i-${idx + 1}`,
      name: i.name,
      quantity: i.quantity,
      isOptional: i.isOptional,
      substitution: i.substitution,
    })),
    steps: userSteps.length > 0 ? userSteps : [emptyStep()],
  };
}

function emptyStep(): UserStep {
  return {
    stepNumber: 1,
    instruction: "",
    timerSeconds: null,
    mistakeWarning: null,
    quickHack: null,
    cuisineFact: null,
    donenessCue: null,
    imageUrl: null,
  };
}

function coerceTemperature(v: string): "hot" | "cold" | "room-temp" {
  if (v === "hot" || v === "cold" || v === "room-temp") return v;
  return "hot";
}

function coerceSkillLevel(v: string): "beginner" | "intermediate" | "advanced" {
  if (v === "beginner" || v === "intermediate" || v === "advanced") return v;
  return "intermediate";
}
