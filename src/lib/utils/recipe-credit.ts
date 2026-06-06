/**
 * recipe-credit — surface a creator credit for a recipe slug, so partner chefs'
 * dishes can be attributed on their cards (a subtle "Chef Tu" chip on small
 * cards, or a full "by Chef Tu" byline with an avatar on large ones) to promote
 * them. Built once from the catalog's `source` provenance (meals.json /
 * sides.json `source: { creator }`).
 */

import mealsData from "@/data/meals.json";
import sidesData from "@/data/sides.json";

type WithSource = { id: string; source?: { creator?: string } };

export interface RecipeCreator {
  /** Full name, e.g. "Tu David Phu". */
  name: string;
  /** Short on-card credit, e.g. "Chef Tu". */
  short: string;
  /** Portrait URL when we have one; null → chef-hat avatar fallback. */
  avatarUrl: string | null;
  /** Content-tab Expert profile slug to deep-link to, when present. */
  profileSlug: string | null;
}

/** Full creator name → display metadata. Extend as partners are added. */
const CREATORS: Record<string, RecipeCreator> = {
  "Tu David Phu": {
    name: "Tu David Phu",
    short: "Chef Tu",
    avatarUrl: null, // chef-hat fallback until a partner portrait is supplied
    profileSlug: "tu-david-phu",
  },
};

const _creatorBySlug = new Map<string, RecipeCreator>();
for (const r of [...mealsData, ...sidesData] as WithSource[]) {
  const creator = r.source?.creator;
  if (creator && CREATORS[creator]) _creatorBySlug.set(r.id, CREATORS[creator]);
}

/** Full creator metadata for a recipe, or null when uncredited. */
export function recipeCreator(slug: string): RecipeCreator | null {
  return _creatorBySlug.get(slug) ?? null;
}

/** Short on-card credit for a recipe (e.g. "Chef Tu"), or null if none. */
export function recipeCreditShort(slug: string): string | null {
  return _creatorBySlug.get(slug)?.short ?? null;
}

/** Whether a recipe is one of Chef Tu David Phu's. */
export function isChefTuRecipe(slug: string): boolean {
  return _creatorBySlug.get(slug)?.short === "Chef Tu";
}
