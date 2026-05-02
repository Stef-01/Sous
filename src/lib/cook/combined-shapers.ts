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
): { label: string; ingredients: TIngredient[] }[] {
  return orderedDishes.map((d) => ({
    label: `For ${d.dish.name}`,
    ingredients: d.ingredients as TIngredient[],
  }));
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
