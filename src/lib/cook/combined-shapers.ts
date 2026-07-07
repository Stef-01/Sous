/**
 * Pure shape helpers for /cook/combined.
 *
 * Stage-4 W11 (Sprint C kickoff). Test-scaffolding-before-refactor
 * for the 1,126-line `/cook/combined/page.tsx` density audit. These
 * helpers do the data-permutation + structural reshape that the page
 * inlines today; pulling them out gives us:
 *   - real unit tests against the reshape math (no DOM, no tRPC),
 *   - smaller surface area on the page itself for the eventual
 *     density refactor,
 *   - one place to change if the wire shape evolves.
 *
 * Generic types are used for the inputs because the upstream tRPC
 * shape lives in a router file and we don't want a cross-package
 * type dependency. The structural minimum is captured below.
 */

import type { StaticDishData } from "@/data/guided-cook-steps";

/** Structural minimum for a dish-with-ingredients-and-steps payload. */
export interface CombinedDishLike<TStep, TIngredient> {
  dish: {
    slug: string;
    name: string;
    cuisineFamily: string;
    description?: string | null;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    skillLevel?: string | null;
    heroImageUrl?: string | null;
    flavorProfile?: string[] | null;
    temperature?: string | null;
  };
  ingredients: TIngredient[];
  steps: TStep[];
}

/** Structural minimum for prep-view ingredient rows. */
export interface CombinedPrepIngredientLike {
  id: string;
  name: string;
  quantity: string;
  isOptional?: boolean | null;
  substitution?: string | null;
}

/** Structural minimum for authored cook steps used by the prep coalescer. */
export interface CombinedPrepStepLike {
  phase?: string;
  stepNumber?: number | null;
  instruction: string;
  timerSeconds?: number | null;
  mistakeWarning?: string | null;
  quickHack?: string | null;
  cuisineFact?: string | null;
  donenessCue?: string | null;
  imageUrl?: string | null;
}

/** Sequencer hint shape (parallel-cook prompts). */
export interface CombinedSequencerHint {
  dishSlug: string;
  stepIndex: number;
  hint: string;
}

/**
 * Order the dishes (main + sides) according to the cook-order plan,
 * filtering out any slugs not present in the lookup. Pure: same
 * inputs → same outputs.
 */
export function buildOrderedDishes<TStep, TIngredient>(
  main: CombinedDishLike<TStep, TIngredient> | null | undefined,
  sides: ReadonlyArray<CombinedDishLike<TStep, TIngredient>>,
  cookOrder: ReadonlyArray<string>,
): CombinedDishLike<TStep, TIngredient>[] {
  const lookup = new Map<string, CombinedDishLike<TStep, TIngredient>>();
  if (main) lookup.set(main.dish.slug, main);
  for (const s of sides) lookup.set(s.dish.slug, s);
  const out: CombinedDishLike<TStep, TIngredient>[] = [];
  for (const slug of cookOrder) {
    const found = lookup.get(slug);
    if (found) out.push(found);
  }
  return out;
}

/**
 * Build segmented ingredient sections (one per dish) for the Grab
 * phase. Each section gets a "For <dish name>" label + the dish's
 * ingredient list verbatim.
 */
export function buildIngredientSections<TStep, TIngredient>(
  orderedDishes: ReadonlyArray<CombinedDishLike<TStep, TIngredient>>,
): {
  label: string;
  ingredients: TIngredient[];
  sourceRecipeSlug: string;
  sourceRecipeName: string;
}[] {
  return orderedDishes.map((d) => ({
    label: `For ${d.dish.name}`,
    ingredients: d.ingredients as TIngredient[],
    sourceRecipeSlug: d.dish.slug,
    sourceRecipeName: d.dish.name,
  }));
}

/**
 * Build StaticDishData-compatible dishes for the IngredientList prep-station
 * view. When scaled ingredient sections are supplied, use those quantities
 * instead of the raw dish payload so "By station" stays aligned with the
 * serving slider.
 */
export function buildPrepDishesForCombinedCook<
  TStep extends CombinedPrepStepLike,
  TIngredient extends CombinedPrepIngredientLike,
>(
  orderedDishes: ReadonlyArray<CombinedDishLike<TStep, TIngredient>>,
  ingredientSections?: ReadonlyArray<{
    ingredients: ReadonlyArray<CombinedPrepIngredientLike>;
  }>,
): StaticDishData[] {
  return orderedDishes.map((d, index) => {
    const ingredients =
      ingredientSections?.[index]?.ingredients ?? d.ingredients;
    return {
      name: d.dish.name,
      slug: d.dish.slug,
      description: d.dish.description ?? "",
      cuisineFamily: d.dish.cuisineFamily,
      prepTimeMinutes: d.dish.prepTimeMinutes,
      cookTimeMinutes: d.dish.cookTimeMinutes,
      skillLevel: d.dish.skillLevel ?? "beginner",
      heroImageUrl: d.dish.heroImageUrl ?? null,
      flavorProfile: (d.dish.flavorProfile ?? []) as string[],
      temperature: d.dish.temperature ?? "hot",
      ingredients: ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        isOptional: !!i.isOptional,
        substitution: i.substitution ?? null,
      })),
      steps: d.steps.map((s) => ({
        phase: "cook" as const,
        stepNumber: s.stepNumber ?? 0,
        instruction: s.instruction,
        timerSeconds: s.timerSeconds ?? null,
        mistakeWarning: s.mistakeWarning ?? null,
        quickHack: s.quickHack ?? null,
        cuisineFact: s.cuisineFact ?? null,
        donenessCue: s.donenessCue ?? null,
        imageUrl: s.imageUrl ?? null,
      })),
    };
  });
}

/**
 * Build the parallel-hint lookup map keyed by "<dishSlug>-<stepIndex>".
 * When the sequencer hint table is empty/undefined, returns an empty
 * Map.
 */
export function buildParallelHintMap(
  hints: ReadonlyArray<CombinedSequencerHint> | null | undefined,
): Map<string, string> {
  const map = new Map<string, string>();
  if (!hints) return map;
  for (const h of hints) {
    map.set(`${h.dishSlug}-${h.stepIndex}`, h.hint);
  }
  return map;
}

/**
 * Compose the storage slug for a combined cook session.
 *
 * - 0 dishes → empty string (defensive; caller should not commit).
 * - 1 dish  → that dish's slug.
 * - 2+      → slugs joined by '+', preserving cookOrder.
 *
 * History queries can distinguish single-dish vs multi-dish runs by
 * looking for the '+' separator (see AUDIT-2026-04-17 P1-10).
 */
export function buildCombinedSlug(
  orderedDishes: ReadonlyArray<{ dish: { slug: string } }>,
): string {
  if (orderedDishes.length === 0) return "";
  if (orderedDishes.length === 1) return orderedDishes[0].dish.slug;
  return orderedDishes.map((d) => d.dish.slug).join("+");
}

/**
 * Compose the human-readable display name for a combined cook
 * session. Same shape as buildCombinedSlug but with " + " spacing
 * and dish names.
 */
export function buildCombinedDisplayName(
  orderedDishes: ReadonlyArray<{ dish: { name: string } }>,
): string {
  return orderedDishes.map((d) => d.dish.name).join(" + ");
}
