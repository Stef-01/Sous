/**
 * Pure helpers for the recipe-authoring loop.
 *
 * W23 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint E recipe
 * authoring, slipped from W18-W19). Pairs with `react-hook-form`
 * adoption per `docs/LIBRARY-RECOMMENDATIONS.md` master pick
 * table (search-before-build policy applied).
 *
 * The form-management library is react-hook-form + @hookform/
 * resolvers/zod. This file holds the PURE side of the authoring
 * UX — default-draft factory, ingredient/step ID generation,
 * draft → final-recipe coercion. Pure functions stay testable
 * without rendering.
 */

import {
  SCHEMA_VERSION,
  slugifyTitle,
  type UserIngredient,
  type UserRecipe,
  type UserStep,
} from "@/types/user-recipe";

/**
 * A draft recipe is a UserRecipe with optional fields where the
 * authoring flow is allowed to leave gaps. `id` / `slug` /
 * `createdAt` / `updatedAt` get filled in by `commitDraft` at the
 * moment the user saves; `ingredients` / `steps` start with one
 * empty entry each so the form has something to render.
 */
export type RecipeDraft = Omit<
  UserRecipe,
  "id" | "slug" | "createdAt" | "updatedAt"
> & {
  id?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Defensive default-draft factory. New object every call so
 *  callers (or react-hook-form's defaultValues clone) don't share
 *  mutable state. Pattern from W15 RCA. */
export function defaultRecipeDraft(): RecipeDraft {
  return {
    schemaVersion: SCHEMA_VERSION,
    title: "",
    dishName: "",
    cuisineFamily: "",
    flavorProfile: [],
    dietaryFlags: [],
    temperature: "hot",
    skillLevel: "beginner",
    prepTimeMinutes: 0,
    cookTimeMinutes: 0,
    serves: 2,
    heroImageUrl: null,
    description: "",
    ingredients: [
      {
        id: "i-1",
        name: "",
        quantity: "",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        donenessCue: null,
      },
    ],
  };
}

/** Allocate the next ingredient id for an existing draft. Format
 *  is `i-<n>` where `n` is one greater than the highest existing
 *  numeric suffix. Defensive against non-numeric ids — those are
 *  preserved but not counted. */
export function nextIngredientId(
  ingredients: ReadonlyArray<UserIngredient>,
): string {
  let max = 0;
  for (const ing of ingredients) {
    const m = ing.id.match(/^i-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `i-${max + 1}`;
}

/** Append a blank ingredient entry to a draft's ingredient list. */
export function appendBlankIngredient(
  ingredients: ReadonlyArray<UserIngredient>,
): UserIngredient[] {
  return [
    ...ingredients,
    {
      id: nextIngredientId(ingredients),
      name: "",
      quantity: "",
      isOptional: false,
      substitution: null,
    },
  ];
}

/** Append a blank step. The new stepNumber is always
 *  `existing.length + 1` because `userRecipeSchema` validates
 *  1..N sequential numbering. */
export function appendBlankStep(steps: ReadonlyArray<UserStep>): UserStep[] {
  return [
    ...steps,
    {
      stepNumber: steps.length + 1,
      instruction: "",
      timerSeconds: null,
      mistakeWarning: null,
      quickHack: null,
      donenessCue: null,
    },
  ];
}

/** Remove a step at the given index AND renumber every step that
 *  follows so 1..N stays sequential. Caller is responsible for
 *  refusing to remove the last step (form-side guard). */
export function removeStepAt(
  steps: ReadonlyArray<UserStep>,
  index: number,
): UserStep[] {
  if (index < 0 || index >= steps.length) return [...steps];
  const next: UserStep[] = [];
  for (let i = 0; i < steps.length; i += 1) {
    if (i === index) continue;
    next.push({ ...steps[i], stepNumber: next.length + 1 });
  }
  return next;
}

/** Reorder a step from `from` index to `to` index, then renumber
 *  the entire list so stepNumber stays 1..N sequential. Used by
 *  the eventual drag-to-reorder UI; tested independently of any
 *  drag library. */
export function reorderSteps(
  steps: ReadonlyArray<UserStep>,
  from: number,
  to: number,
): UserStep[] {
  if (from === to) return [...steps];
  if (from < 0 || from >= steps.length) return [...steps];
  if (to < 0 || to >= steps.length) return [...steps];
  const next = [...steps];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((s, i) => ({ ...s, stepNumber: i + 1 }));
}

/** Convert a draft into a fully-realised `UserRecipe` ready for
 *  storage. Fills in the auto-managed fields (`id`, `slug`,
 *  `createdAt`, `updatedAt`) but does NOT validate — the caller
 *  is expected to pass the result through `userRecipeSchema.parse`
 *  or `parseUserRecipeJson` if it's coming from outside.
 *
 *  Idempotent on already-committed drafts — if the draft already
 *  has an `id` the function preserves it; only fills in what's
 *  missing. */
export function commitDraft(
  draft: RecipeDraft,
  now: string = new Date().toISOString(),
): UserRecipe {
  const slug = draft.slug ?? slugifyTitle(draft.title || "untitled");
  const id = draft.id ?? `rec-${slug || "new"}-${Date.now()}`;
  return {
    schemaVersion: SCHEMA_VERSION,
    id,
    slug: slug || "untitled",
    title: draft.title,
    dishName: draft.dishName || draft.title,
    cuisineFamily: draft.cuisineFamily,
    flavorProfile: draft.flavorProfile,
    dietaryFlags: draft.dietaryFlags,
    temperature: draft.temperature,
    skillLevel: draft.skillLevel,
    prepTimeMinutes: draft.prepTimeMinutes,
    cookTimeMinutes: draft.cookTimeMinutes,
    serves: draft.serves,
    heroImageUrl: draft.heroImageUrl,
    description: draft.description,
    ingredients: draft.ingredients,
    steps: draft.steps,
    createdAt: draft.createdAt ?? now,
    updatedAt: now,
  };
}
