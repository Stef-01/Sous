/**
 * Big-batch + smart-leftovers helper (Y3 feature 1.5 substrate).
 *
 * Implements the smart-leftovers flow from the pantry-novelty
 * plan: when a user finishes cooking a "big batch" recipe
 * (rotisserie chicken, large pot of soup, sheet-pan veg), the
 * win-screen surfaces a one-tap suggestion for tomorrow's lunch
 * derived from the leftover protein + current pantry.
 *
 * The substrate has three parts:
 *   1. A static lookup table of big-batch recipes + their
 *      leftover item-classes + 2-4 successor recipe slugs.
 *      Hand-curated; ships as `src/data/big-batch-tags.json`.
 *   2. `findSuccessorRecipe(recipeSlug, currentPantry, history)`
 *      — picks the best successor given pantry coverage + recent
 *      cook history (avoid back-to-back same successor).
 *   3. `formatLeftoverChipCopy(opts)` — curiosity-styled
 *      tomorrow's-lunch nudge for the win screen.
 *
 * Pure / dependency-free / deterministic.
 */

import { pantryHasIngredient } from "@/lib/engine/pantry-coverage";

export interface BigBatchTag {
  /** The big-batch recipe slug (matches the seed catalog). */
  recipeSlug: string;
  /** Plain-English label for the leftover ('rotisserie chicken
   *  meat', 'leftover marinara', 'sheet-pan roasted veg'). Used
   *  in the chip copy + telemetry. */
  leftoverLabel: string;
  /** Item-class slugs that survive for the next-day cook. The
   *  successor recipes draw from this list. */
  expectedLeftoverItems: ReadonlyArray<string>;
  /** Slugs of 2-4 follow-on recipes that consume this leftover. */
  successorRecipeSlugs: ReadonlyArray<string>;
}

export interface SuccessorCandidate {
  recipeSlug: string;
  /** Required ingredient names for the successor — the picker
   *  filters by current-pantry coverage. */
  requiredIngredients: ReadonlyArray<string>;
  /** Optional ingredients are not pantry-gated. */
  optionalIngredients?: ReadonlyArray<string>;
}

export interface FindSuccessorInput {
  /** The just-completed big-batch recipe's slug. */
  cookedSlug: string;
  /** Current pantry — ingredient names. */
  pantry: ReadonlyArray<string>;
  /** Recently completed cook slugs (last 7 days). The picker
   *  avoids picking a slug from this list. */
  recentCookSlugs: ReadonlyArray<string>;
  /** Static big-batch tag table. Caller supplies — usually
   *  imported from `src/data/big-batch-tags.json`. */
  tagTable: ReadonlyArray<BigBatchTag>;
  /** Static successor-recipe metadata. Caller supplies. */
  successorTable: ReadonlyArray<SuccessorCandidate>;
}

export type FindSuccessorResult =
  | {
      ok: true;
      slug: string;
      leftoverLabel: string;
      reason: string;
      pantryCoverage: number;
    }
  | { ok: false; reason: string };

/** Pure: is this recipe tagged as big-batch in the lookup
 *  table? */
export function isBigBatchRecipe(
  slug: string,
  tagTable: ReadonlyArray<BigBatchTag>,
): boolean {
  return tagTable.some((t) => t.recipeSlug === slug);
}

/** Pure: pick the best successor recipe for this big-batch
 *  cook. Logic:
 *    1. Look up the big-batch tag for cookedSlug.
 *    2. Filter the successor list to candidates referenced
 *       in tag.successorRecipeSlugs.
 *    3. Drop any successor in recentCookSlugs (last-week
 *       repeat-avoidance).
 *    4. For each remaining, compute pantry coverage on
 *       requiredIngredients.
 *    5. Pick highest-coverage; tie-break alphabetical.
 *    6. Reject when top coverage < 0.7 (don't suggest a
 *       successor that requires a shopping trip). */
export function findSuccessorRecipe(
  input: FindSuccessorInput,
): FindSuccessorResult {
  const tag = input.tagTable.find((t) => t.recipeSlug === input.cookedSlug);
  if (!tag) {
    return {
      ok: false,
      reason: "cooked recipe not tagged as big-batch",
    };
  }

  const recent = new Set(input.recentCookSlugs);
  const slugSet = new Set(tag.successorRecipeSlugs);
  const pantrySet = new Set(input.pantry.map((p) => p.toLowerCase()));

  const candidates = input.successorTable.filter(
    (c) => slugSet.has(c.recipeSlug) && !recent.has(c.recipeSlug),
  );

  if (candidates.length === 0) {
    return {
      ok: false,
      reason: "no successor available (all in recent-cook history)",
    };
  }

  const scored = candidates.map((c) => {
    const required = c.requiredIngredients;
    if (required.length === 0) {
      return { candidate: c, coverage: 1 };
    }
    let have = 0;
    for (const ing of required) {
      if (pantryHasIngredient(ing, pantrySet)) have += 1;
    }
    return { candidate: c, coverage: have / required.length };
  });

  scored.sort((a, b) => {
    if (b.coverage !== a.coverage) return b.coverage - a.coverage;
    return a.candidate.recipeSlug.localeCompare(b.candidate.recipeSlug);
  });

  const top = scored[0];
  if (!top) {
    return { ok: false, reason: "no successor scored" };
  }
  if (top.coverage < 0.7) {
    return {
      ok: false,
      reason: `top successor coverage ${(top.coverage * 100).toFixed(0)}% below 70% threshold`,
    };
  }

  return {
    ok: true,
    slug: top.candidate.recipeSlug,
    leftoverLabel: tag.leftoverLabel,
    reason: `pantry covers ${(top.coverage * 100).toFixed(0)}% of required ingredients`,
    pantryCoverage: top.coverage,
  };
}

/** Pure: format the win-screen chip copy.
 *
 *  Curiosity-styled, not FOMO-styled — same discipline as the
 *  Y2 W42 viral chip. Names the leftover concretely so the
 *  user can picture the path forward in one read. */
export function formatLeftoverChipCopy(opts: {
  leftoverLabel: string;
  successorDisplayName: string;
}): string {
  const label = opts.leftoverLabel.trim();
  const dish = opts.successorDisplayName.trim();
  if (label.length === 0) {
    return `Tomorrow's lunch: ${dish} →`;
  }
  return `${label} for tomorrow's ${dish}? →`;
}
