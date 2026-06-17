/**
 * dish-lookup — resolve a recipe slug (meal OR side id) to its display name,
 * image, cuisine and tags, from the static catalog. Used by the planner
 * day-list (and anywhere a slug needs a name + thumbnail). Built once.
 */

import { meals, sides } from "@/data/index";

export interface DishRef {
  slug: string;
  name: string;
  /** Local image path or null (→ gradient+emoji fallback). */
  image: string | null;
  cuisine: string | null;
  tags: string[];
}

const _byId = new Map<string, DishRef>();
for (const m of meals) {
  _byId.set(m.id, {
    slug: m.id,
    name: m.name,
    image: m.heroImageUrl ?? null,
    cuisine: (m.cuisine as string) ?? null,
    tags: [],
  });
}
for (const s of sides) {
  if (_byId.has(s.id)) continue; // meal of same id wins
  _byId.set(s.id, {
    slug: s.id,
    name: s.name,
    image: s.imageUrl ?? null,
    cuisine: null,
    tags: s.tags ?? [],
  });
}

/** Prefix marking a free-text meal that isn't in the catalog (planner custom
 *  entries). The remainder is the raw title — recipeSlug allows any string. */
export const CUSTOM_DISH_PREFIX = "custom:";

/** Build a synthetic slug for a free-text meal. Capped to the 80-char slot
 *  limit (see mealPlanSlotSchema). */
export function customDishSlug(title: string): string {
  return `${CUSTOM_DISH_PREFIX}${title.trim()}`.slice(0, 80);
}

export function isCustomDishSlug(slug: string): boolean {
  return slug.startsWith(CUSTOM_DISH_PREFIX);
}

/** Resolve a slug → DishRef, or a humanised fallback when unknown. */
export function lookupDish(slug: string): DishRef {
  const hit = _byId.get(slug);
  if (hit) return hit;
  if (isCustomDishSlug(slug)) {
    const title = slug.slice(CUSTOM_DISH_PREFIX.length).trim();
    return {
      slug,
      name: title || "Custom meal",
      image: null,
      cuisine: null,
      tags: [],
    };
  }
  return {
    slug,
    name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    image: null,
    cuisine: null,
    tags: [],
  };
}

/** Lowest score = best name match. Infinity = no match. */
function scoreDishName(name: string, q: string): number {
  const n = name.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.split(/\s+/).some((w) => w.startsWith(q))) return 2;
  if (n.includes(q)) return 3;
  return Infinity;
}

/**
 * Search the meal + side catalog by name for the planner's search-to-add (so it
 * isn't stuck on swipe cards). Ranked exact → name-prefix → word-prefix →
 * substring. Returns [] for queries under 2 chars.
 */
export function searchDishes(query: string, limit = 8): DishRef[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const scored: Array<{ ref: DishRef; score: number }> = [];
  for (const ref of _byId.values()) {
    const score = scoreDishName(ref.name, q);
    if (score !== Infinity) scored.push({ ref, score });
  }
  scored.sort(
    (a, b) =>
      a.score - b.score ||
      a.ref.name.length - b.ref.name.length ||
      a.ref.name.localeCompare(b.ref.name),
  );
  return scored.slice(0, limit).map((s) => s.ref);
}
