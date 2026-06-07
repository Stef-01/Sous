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

/** Resolve a slug → DishRef, or a humanised fallback when unknown. */
export function lookupDish(slug: string): DishRef {
  const hit = _byId.get(slug);
  if (hit) return hit;
  return {
    slug,
    name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    image: null,
    cuisine: null,
    tags: [],
  };
}
