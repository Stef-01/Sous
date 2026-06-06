/**
 * recipe-credit — surface a short creator credit for a recipe slug, so partner
 * chefs' dishes can be quietly attributed on their cards (e.g. a subtle
 * "Chef Tu" line) to promote them. Built once from the catalog's `source`
 * provenance (meals.json / sides.json `source: { creator }`).
 */

import mealsData from "@/data/meals.json";
import sidesData from "@/data/sides.json";

type WithSource = { id: string; source?: { creator?: string } };

/** Full creator name → short on-card credit. Extend as partners are added. */
const SHORT_CREDIT: Record<string, string> = {
  "Tu David Phu": "Chef Tu",
};

const _creditBySlug = new Map<string, string>();
for (const r of [...mealsData, ...sidesData] as WithSource[]) {
  const creator = r.source?.creator;
  if (creator && SHORT_CREDIT[creator]) {
    _creditBySlug.set(r.id, SHORT_CREDIT[creator]);
  }
}

/** Short on-card credit for a recipe (e.g. "Chef Tu"), or null if none. */
export function recipeCreditShort(slug: string): string | null {
  return _creditBySlug.get(slug) ?? null;
}

/** Whether a recipe is one of Chef Tu David Phu's. */
export function isChefTuRecipe(slug: string): boolean {
  return _creditBySlug.get(slug) === "Chef Tu";
}
