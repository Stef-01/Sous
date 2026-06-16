/**
 * Dish source (provenance) — the data layer behind the Today filter's
 * "Source" facet. Pure module: no JSX, no hooks. Provenance is derived from a
 * dish's slug (Chef Tu recipes use the `tu-` convention; user creations use the
 * `custom-` convention; Stefan-curated + Clean Program recipes are enumerated),
 * so nothing in the cached quest pool has to be rebuilt and the predicate stays
 * a cheap string check.
 *
 * The filter is MULTI-SELECT: the user ticks any combination of facets and a
 * dish matches if it satisfies ANY ticked facet (OR semantics). An empty
 * selection means "any source". Provenance is ORTHOGONAL to the Nourish-
 * Verified quality badge (`isVerified`) — a recipe can be Chef Tu AND verified —
 * so `nourish-verified` is offered as its own tickable facet alongside the
 * provenance buckets.
 */

import type { FilterOption } from "@/components/shared/filter-dropdown";

/** Where a recipe came from. First-party Sous recipes are "original". */
export type RecipeSource =
  | "stefan"
  | "chef-tu"
  | "clean-program"
  | "custom"
  | "original";

/** A tickable facet in the Source filter: the verified badge + each provenance. */
export type SourceFacet = "nourish-verified" | RecipeSource;

/**
 * Recipes Stefan personally curated into the catalogue (real recipes from
 * reputable sources, hand-selected — see docs). This is the single place that
 * declares the curation tag; extend it as more curated recipes land.
 */
export const STEFAN_CURATED_SLUGS: ReadonlySet<string> = new Set([
  "cheesy-beef-enchiladas-verde",
  "honey-glazed-salmon-mango-salsa",
  "air-fryer-edamame",
  "black-bean-brownies",
]);

/**
 * Recipes ingested through the Clean Program / Kaitlyn Noble pipeline
 * (planning.md §6.1, Ledger L4). Empty for now — black-bean-brownies moved to
 * Stefan-curated at the founder's direction — but kept as the declared home for
 * that partner's future recipes.
 */
export const CLEAN_PROGRAM_SLUGS: ReadonlySet<string> = new Set([]);

/**
 * Derive a recipe's provenance from its slug. Stefan-curated recipes are
 * enumerated; Chef Tu David Phu recipes use the `tu-` convention; user
 * creations use the `custom-` convention; Clean Program recipes are enumerated;
 * everything else is a first-party Sous recipe. Pure.
 */
export function getRecipeSource(slug: string): RecipeSource {
  if (STEFAN_CURATED_SLUGS.has(slug)) return "stefan";
  if (slug.startsWith("tu-")) return "chef-tu";
  if (slug.startsWith("custom-")) return "custom";
  if (CLEAN_PROGRAM_SLUGS.has(slug)) return "clean-program";
  return "original";
}

/** A dish for source purposes — provenance is its explicit `source` when set
 *  (e.g. injected user creations), otherwise derived from the slug. */
export interface SourceDish {
  slug: string;
  isVerified: boolean;
  source?: RecipeSource;
}

/** The provenance of a dish: an explicit `source` wins over slug derivation. */
export function dishSource(dish: SourceDish): RecipeSource {
  return dish.source ?? getRecipeSource(dish.slug);
}

/**
 * Pure predicate: does a dish satisfy the active multi-select Source filter? An
 * empty selection passes everything. Otherwise the dish matches if it satisfies
 * ANY ticked facet (the `nourish-verified` facet keys off the badge; every
 * other facet keys off provenance).
 */
export function matchesSourceFilters(
  dish: SourceDish,
  selected: ReadonlyArray<SourceFacet>,
): boolean {
  if (selected.length === 0) return true;
  const source = dishSource(dish);
  return selected.some((facet) =>
    facet === "nourish-verified" ? dish.isVerified : source === facet,
  );
}

export const SOURCE_FACET_LABELS: Record<SourceFacet, string> = {
  "nourish-verified": "Nourish Verified",
  stefan: "Stefan (curated)",
  "chef-tu": "Chef Tu",
  "clean-program": "Clean Program",
  custom: "My creations",
  original: "Sous Original",
};

/** Curated display order (verified badge first, then curated/named partners,
 *  then the user's own creations, then first-party). */
export const SOURCE_FACET_ORDER: ReadonlyArray<SourceFacet> = [
  "nourish-verified",
  "stefan",
  "chef-tu",
  "clean-program",
  "custom",
  "original",
];

const SOURCE_FACET_VALUES: ReadonlySet<string> = new Set<SourceFacet>(
  SOURCE_FACET_ORDER,
);

/** Runtime guard for persisted/legacy values. */
export function isSourceFacet(value: unknown): value is SourceFacet {
  return typeof value === "string" && SOURCE_FACET_VALUES.has(value);
}

/** Coerce arbitrary persisted state into a clean facet array. Tolerates the
 *  legacy single-select shape (a string, incl. "any"). */
export function coerceSourceFacets(value: unknown): SourceFacet[] {
  if (Array.isArray(value)) {
    return value.filter(isSourceFacet);
  }
  // Legacy single-select: "any" → none; a valid facet → a one-element array.
  if (value === "any") return [];
  return isSourceFacet(value) ? [value] : [];
}

/**
 * Build the honest option list for the filter menu — a facet only appears when
 * at least one dish in the current feed actually carries it. Keeps the menu
 * role-aware: Chef Tu / Stefan sides never show while the feed is mains, so the
 * user is never handed a filter that would yield nothing.
 */
export function buildSourceFacetOptions(
  dishes: ReadonlyArray<SourceDish>,
): FilterOption<SourceFacet>[] {
  const present = new Set<SourceFacet>();
  for (const d of dishes) {
    if (d.isVerified) present.add("nourish-verified");
    present.add(dishSource(d));
  }
  return SOURCE_FACET_ORDER.filter((s) => present.has(s)).map((s) => ({
    value: s,
    label: SOURCE_FACET_LABELS[s],
  }));
}
