/**
 * Dish source (provenance) — the data layer behind the Today filter's
 * "Source" facet. Pure module: no JSX, no hooks. Provenance is derived from a
 * dish's slug (Chef Tu recipes use the `tu-` convention; Clean Program recipes
 * are enumerated), so nothing in the cached quest pool has to be rebuilt and
 * the predicate stays a cheap string check.
 *
 * Provenance is ORTHOGONAL to the Nourish-Verified quality badge
 * (`isVerified`) — a recipe can be a Chef Tu recipe AND verified. The single-
 * select filter below flattens the two dimensions into one picker, mirroring
 * the existing /path/recipes RecipeFilter ("mine"/"community"/"nourish-verified").
 */

import type { FilterOption } from "@/components/shared/filter-dropdown";

/** Where a recipe came from. First-party Sous recipes are "original". */
export type RecipeSource = "chef-tu" | "clean-program" | "original";

/** The single-select Source facet on the Today quest filter. */
export type SourceFilter =
  | "any"
  | "nourish-verified"
  | "chef-tu"
  | "clean-program"
  | "original";

/**
 * Recipes ingested through the Clean Program / Kaitlyn Noble pipeline
 * (planning.md §6.1, Ledger L4). Extend this set as the smoothie dupes land —
 * that is the single place provenance for that partner is declared.
 */
export const CLEAN_PROGRAM_SLUGS: ReadonlySet<string> = new Set([
  "black-bean-brownies",
]);

/**
 * Derive a recipe's provenance from its slug. Chef Tu David Phu recipes use
 * the `tu-` slug convention (planning.md §4.10); Clean Program recipes are
 * enumerated above; everything else is a first-party Sous recipe. Pure.
 */
export function getRecipeSource(slug: string): RecipeSource {
  if (slug.startsWith("tu-")) return "chef-tu";
  if (CLEAN_PROGRAM_SLUGS.has(slug)) return "clean-program";
  return "original";
}

/**
 * Pure predicate: does a dish satisfy the active Source filter? The
 * `nourish-verified` option keys off the orthogonal badge; every other option
 * keys off provenance. "any" passes everything.
 */
export function matchesSourceFilter(
  dish: { slug: string; isVerified: boolean },
  filter: SourceFilter,
): boolean {
  switch (filter) {
    case "any":
      return true;
    case "nourish-verified":
      return dish.isVerified;
    default:
      return getRecipeSource(dish.slug) === filter;
  }
}

export const SOURCE_FILTER_LABELS: Record<SourceFilter, string> = {
  any: "Any source",
  "nourish-verified": "Nourish Verified",
  "chef-tu": "Chef Tu",
  "clean-program": "Clean Program",
  original: "Sous Original",
};

/** Curated display order (verified badge first, then named partners, then
 *  first-party). "any" is prepended separately and always shown. */
const SOURCE_ORDER: ReadonlyArray<Exclude<SourceFilter, "any">> = [
  "nourish-verified",
  "chef-tu",
  "clean-program",
  "original",
];

const SOURCE_FILTER_VALUES: ReadonlySet<string> = new Set<SourceFilter>([
  "any",
  ...SOURCE_ORDER,
]);

/** Runtime guard for persisted/legacy values. */
export function isSourceFilter(value: unknown): value is SourceFilter {
  return typeof value === "string" && SOURCE_FILTER_VALUES.has(value);
}

/**
 * Build the honest option list for the filter menu — a source only appears
 * when at least one dish in the current feed actually carries it (besides
 * "Any", which is always offered). This keeps the menu role-aware: Chef Tu and
 * Clean Program (both sides) never show while the feed is mains, so the user is
 * never handed a filter that would yield nothing.
 */
export function buildSourceOptions(
  dishes: ReadonlyArray<{ slug: string; isVerified: boolean }>,
): FilterOption<SourceFilter>[] {
  const present = new Set<SourceFilter>();
  for (const d of dishes) {
    if (d.isVerified) present.add("nourish-verified");
    present.add(getRecipeSource(d.slug));
  }
  return [
    { value: "any", label: SOURCE_FILTER_LABELS.any, pillLabel: "Source" },
    ...SOURCE_ORDER.filter((s) => present.has(s)).map((s) => ({
      value: s,
      label: SOURCE_FILTER_LABELS[s],
    })),
  ];
}
