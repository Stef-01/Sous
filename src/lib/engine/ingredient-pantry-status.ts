/**
 * Ingredient → pantry status adapter (Y3 Sprint A W4 polish).
 *
 * Implements feature 1.3 from the pantry-novelty plan: render
 * each recipe ingredient line with a "you-have" / "low-or-stale"
 * / "missing" badge against the user's current pantry.
 *
 * Wraps the Y2 W15 pantry-coverage helper with a per-line status
 * decision. Three states:
 *   - "have": pantry has this ingredient + no staleness/low signal
 *   - "low":  pantry has it but expiring within
 *             LOW_FRESHNESS_WINDOW_DAYS, OR explicit quantity
 *             flagged "low"
 *   - "missing": not in pantry
 *
 * V1 pantry data has no per-item expiration or quantity. The
 * "low" path therefore stays defensive — only fires when the
 * caller passes an enriched PantryItemSnapshot with expiration
 * or quantity fields populated. Existing string-only pantry
 * data renders as "have" / "missing" only — backwards-compat.
 *
 * Pure / dependency-free / deterministic.
 */

import {
  normaliseIngredientName,
  pantryHasIngredient,
} from "./pantry-coverage";

export type IngredientStatus = "have" | "low" | "missing";

/** Window inside which a pantry item counts as "low". Default
 *  3 days — anything expiring sooner is worth flagging so the
 *  cook can decide whether to use it tonight or buy fresh. */
export const LOW_FRESHNESS_WINDOW_DAYS = 3;

/** Enriched pantry-item shape the W4 colorizer can read.
 *  Backwards-compatible: callers with only ingredient names can
 *  pass a flat string[] via `pantryNames` instead. */
export interface PantryItemSnapshot {
  /** Canonical pantry name (already normalised by the pantry
   *  hook on write). */
  canonicalName: string;
  /** ISO timestamp when this item is estimated to expire.
   *  Optional — V1 pantry doesn't track this; absent = treated
   *  as fresh. */
  expirationEstimate?: string;
  /** Coarse quantity bucket. Optional — absent = treated as
   *  medium (no nudge either way). */
  quantityEstimate?: "low" | "medium" | "high";
}

export interface IngredientStatusInput {
  /** Raw recipe ingredient line — "2 cups fresh basil leaves",
   *  "1 lemon", "olive oil to taste". */
  line: string;
  /** Whether this ingredient is marked optional. Optional
   *  ingredients still get a status badge but render with a
   *  lighter visual treatment in the consumer component. */
  optional?: boolean;
}

export interface IngredientStatusEntry {
  /** The original recipe line — unchanged. */
  line: string;
  /** Normalised name extracted from the line (W15 helper). */
  normalised: string;
  status: IngredientStatus;
  optional: boolean;
  /** Days-to-expiration when the matched pantry item is
   *  flagged low-freshness. Null when status !== "low" or
   *  expiration data is absent. */
  daysToExpiration?: number;
}

export interface ColorizeOptions {
  /** Reference "now" for freshness math. Tests inject; in
   *  production the caller passes `new Date()`. */
  now?: Date;
  /** Override the low-freshness window in days. */
  lowFreshnessWindowDays?: number;
}

/** Pure: backwards-compat overload. When the caller only has
 *  pantry names (no expiration/quantity), pass `pantryNames`
 *  directly. The status output never includes "low" in this
 *  mode (no signal data to base it on). */
export function colorizeIngredients(
  ingredients: ReadonlyArray<IngredientStatusInput>,
  pantryNames: ReadonlyArray<string>,
): IngredientStatusEntry[];

/** Pure: enriched overload. When the caller has freshness +
 *  quantity, "low" can fire. */
export function colorizeIngredients(
  ingredients: ReadonlyArray<IngredientStatusInput>,
  pantryItems: ReadonlyArray<PantryItemSnapshot>,
  options?: ColorizeOptions,
): IngredientStatusEntry[];

export function colorizeIngredients(
  ingredients: ReadonlyArray<IngredientStatusInput>,
  pantryArg: ReadonlyArray<string> | ReadonlyArray<PantryItemSnapshot>,
  options: ColorizeOptions = {},
): IngredientStatusEntry[] {
  const enriched = isEnrichedPantry(pantryArg);
  const now = options.now ?? new Date();
  const windowDays =
    options.lowFreshnessWindowDays ?? LOW_FRESHNESS_WINDOW_DAYS;

  // Build a normalised pantry-name set + (when enriched) a
  // lookup from normalised name → snapshot for the staleness
  // check.
  const pantryNameSet = new Set<string>();
  const pantryByName = new Map<string, PantryItemSnapshot>();
  if (enriched) {
    for (const item of pantryArg) {
      const norm = normaliseIngredientName(item.canonicalName);
      if (norm.length === 0) continue;
      pantryNameSet.add(norm);
      pantryByName.set(norm, item);
    }
  } else {
    for (const name of pantryArg) {
      const norm = normaliseIngredientName(name);
      if (norm.length === 0) continue;
      pantryNameSet.add(norm);
    }
  }

  return ingredients.map((ing) => {
    const normalised = normaliseIngredientName(ing.line);
    const matched = pantryHasIngredient(ing.line, pantryNameSet);
    if (!matched) {
      return {
        line: ing.line,
        normalised,
        status: "missing" as const,
        optional: ing.optional ?? false,
      };
    }

    if (!enriched) {
      return {
        line: ing.line,
        normalised,
        status: "have" as const,
        optional: ing.optional ?? false,
      };
    }

    // Enriched: figure out which pantry item matched + check
    // its low-freshness signals.
    const matchedSnapshot = findMatchedSnapshot(normalised, pantryByName);
    if (!matchedSnapshot) {
      return {
        line: ing.line,
        normalised,
        status: "have" as const,
        optional: ing.optional ?? false,
      };
    }

    if (matchedSnapshot.quantityEstimate === "low") {
      return {
        line: ing.line,
        normalised,
        status: "low" as const,
        optional: ing.optional ?? false,
      };
    }

    if (matchedSnapshot.expirationEstimate) {
      const expTs = new Date(matchedSnapshot.expirationEstimate).getTime();
      if (Number.isFinite(expTs)) {
        const days = (expTs - now.getTime()) / (24 * 60 * 60 * 1000);
        if (days <= windowDays) {
          return {
            line: ing.line,
            normalised,
            status: "low" as const,
            optional: ing.optional ?? false,
            daysToExpiration: Math.max(0, Math.round(days)),
          };
        }
      }
    }

    return {
      line: ing.line,
      normalised,
      status: "have" as const,
      optional: ing.optional ?? false,
    };
  });
}

/** Pure: summarise a colorized list — useful for hero strips
 *  ("you have 6 of 8 ingredients"). */
export function summariseColorizedIngredients(
  entries: ReadonlyArray<IngredientStatusEntry>,
): {
  haveCount: number;
  lowCount: number;
  missingCount: number;
  totalCount: number;
  /** Excludes optional ingredients from totalCount + haveCount
   *  in the same way the W15 coverage helper handles them. */
  requiredCoverage: number;
} {
  let have = 0;
  let low = 0;
  let missing = 0;
  let requiredHave = 0;
  let requiredTotal = 0;
  for (const e of entries) {
    if (e.status === "have") have += 1;
    else if (e.status === "low") low += 1;
    else missing += 1;

    if (!e.optional) {
      requiredTotal += 1;
      // "low" still counts as "have" for coverage — you can
      // cook with it, just maybe today rather than next week.
      if (e.status === "have" || e.status === "low") requiredHave += 1;
    }
  }
  return {
    haveCount: have,
    lowCount: low,
    missingCount: missing,
    totalCount: entries.length,
    requiredCoverage: requiredTotal === 0 ? 0 : requiredHave / requiredTotal,
  };
}

function isEnrichedPantry(
  arg: ReadonlyArray<string> | ReadonlyArray<PantryItemSnapshot>,
): arg is ReadonlyArray<PantryItemSnapshot> {
  if (arg.length === 0) return false;
  const first = arg[0];
  return (
    typeof first === "object" && first !== null && "canonicalName" in first
  );
}

function findMatchedSnapshot(
  ingredientNormalised: string,
  pantryByName: ReadonlyMap<string, PantryItemSnapshot>,
): PantryItemSnapshot | null {
  // Exact match first
  const exact = pantryByName.get(ingredientNormalised);
  if (exact) return exact;
  // Bidirectional substring fallback (mirror of pantryHasIngredient)
  for (const [name, snap] of pantryByName) {
    if (name.length === 0) continue;
    if (ingredientNormalised.includes(name)) return snap;
    if (name.includes(ingredientNormalised)) return snap;
  }
  return null;
}
