/**
 * Pre-cook prep-list coalescer.
 *
 * Given N guided-cook dishes (a main + sides), produce a single
 * consolidated mise-en-place view:
 *
 *   - Ingredients with the same normalised name are merged; their
 *     quantities are concatenated with " + " so the user still sees
 *     both contributions ("1 cup + 1/2 cup").
 *   - Each merged entry is classified into a station  -  cutting board,
 *     stove, oven, blender, or other  -  by scanning the cook steps for
 *     verbs and references to that ingredient.
 *
 * Deterministic by design. No recipe invention, no AI  -  just a
 * re-organisation of already-authored data.
 */

import type {
  StaticDishData,
  StaticIngredient,
  StaticCookStep,
} from "@/data/guided-cook-steps";

export type PrepStation =
  | "cutting-board"
  | "stove"
  | "oven"
  | "blender"
  | "other";

export const PREP_STATION_ORDER: PrepStation[] = [
  "cutting-board",
  "stove",
  "oven",
  "blender",
  "other",
];

export const PREP_STATION_LABEL: Record<PrepStation, string> = {
  "cutting-board": "Cutting board",
  stove: "Stove",
  oven: "Oven",
  blender: "Blender",
  other: "Other prep",
};

export interface PrepListItem {
  /** Stable id  -  the first source ingredient's id, prefixed with "prep-". */
  id: string;
  name: string;
  /** Combined quantity string ("1 cup + 1/2 cup"). Empty when none. */
  quantity: string;
  /** Dishes this ingredient appears in, by name. */
  sources: string[];
  station: PrepStation;
  isOptional: boolean;
}

export interface PrepListGroup {
  station: PrepStation;
  label: string;
  items: PrepListItem[];
}

// Regex tables for station classification. Applied against the step
// instructions that mention the ingredient.
const STATION_MATCHERS: Array<{
  station: PrepStation;
  re: RegExp;
}> = [
  {
    station: "oven",
    re: /\b(bake|baked|baking|roast|roasted|broil|broiled|oven|sheet pan)\b/i,
  },
  {
    station: "blender",
    re: /\b(blend|blended|blender|food processor|puree|puréed|purée|immersion|smoothie)\b/i,
  },
  {
    station: "stove",
    re: /\b(saut[eé]|fry|simmer|boil|boiling|boiled|steam|sear|skillet|pan|pot|wok|stir|stir[- ]fry|caramelise|caramelize|deglaze|reduce the sauce|reduce the liquid|whisk in)\b/i,
  },
  {
    station: "cutting-board",
    re: /\b(chop|chopped|dice|diced|mince|minced|slice|sliced|shave|shaved|tear|torn|zest|peel|peeled|grate|grated|cut into|thinly sliced|roughly chop)\b/i,
  },
];

/** Normalise an ingredient name into a merge key. Strips descriptors that
 *  the shopping-list treats as noise ("fresh", "large", "organic",
 *  "optional"). Keeps the grocery-word so "red onion" and "white onion"
 *  stay distinct. */
export function normalizePrepName(name: string): string {
  return name
    .toLowerCase()
    .replace(
      /\b(fresh|freshly|large|small|medium|organic|optional|diced|chopped|minced|sliced|grated)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function classifyStation(
  ingredient: StaticIngredient,
  steps: StaticCookStep[],
): PrepStation {
  const needle = normalizePrepName(ingredient.name);
  if (!needle) return "other";
  // Collect steps that actually mention this ingredient.
  const mentioned = steps.filter((s) =>
    s.instruction.toLowerCase().includes(needle),
  );
  const pool = mentioned.length > 0 ? mentioned : steps.slice(0, 2);
  for (const { station, re } of STATION_MATCHERS) {
    if (pool.some((s) => re.test(s.instruction))) return station;
  }
  return "other";
}

function mergeQuantity(a: string, b: string): string {
  const left = a.trim();
  const right = b.trim();
  if (!left) return right;
  if (!right) return left;
  if (left.toLowerCase() === right.toLowerCase()) return left;
  return `${left} + ${right}`;
}

export function coalescePrepList(dishes: StaticDishData[]): PrepListGroup[] {
  const byKey = new Map<
    string,
    PrepListItem & { _stationVotes: Record<PrepStation, number> }
  >();

  for (const dish of dishes) {
    for (const ing of dish.ingredients) {
      const key = normalizePrepName(ing.name);
      if (!key) continue;
      const station = classifyStation(ing, dish.steps);
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, {
          id: `prep-${ing.id}`,
          name: ing.name,
          quantity: ing.quantity,
          sources: [dish.name],
          station,
          isOptional: ing.isOptional,
          _stationVotes: {
            "cutting-board": 0,
            stove: 0,
            oven: 0,
            blender: 0,
            other: 0,
            [station]: 1,
          } as Record<PrepStation, number>,
        });
      } else {
        existing.quantity = mergeQuantity(existing.quantity, ing.quantity);
        if (!existing.sources.includes(dish.name)) {
          existing.sources.push(dish.name);
        }
        // An item is only "truly optional" if every source marks it so.
        existing.isOptional = existing.isOptional && ing.isOptional;
        existing._stationVotes[station] =
          (existing._stationVotes[station] ?? 0) + 1;
        // Take the most-voted station. Ties resolve by PREP_STATION_ORDER.
        let best = existing.station;
        let bestVotes = existing._stationVotes[best] ?? 0;
        for (const s of PREP_STATION_ORDER) {
          const v = existing._stationVotes[s] ?? 0;
          if (v > bestVotes) {
            bestVotes = v;
            best = s;
          }
        }
        existing.station = best;
      }
    }
  }

  const groups: PrepListGroup[] = PREP_STATION_ORDER.map((station) => ({
    station,
    label: PREP_STATION_LABEL[station],
    items: [],
  }));
  const groupIndex = new Map(groups.map((g, i) => [g.station, i]));

  for (const entry of byKey.values()) {
    // Strip the helper field before surfacing the public item.
    const { _stationVotes: _ignored, ...publicItem } = entry;
    void _ignored;
    const idx = groupIndex.get(publicItem.station);
    if (idx === undefined) continue;
    groups[idx]!.items.push(publicItem);
  }

  for (const group of groups) {
    group.items.sort((a, b) => a.name.localeCompare(b.name));
  }

  return groups.filter((g) => g.items.length > 0);
}
