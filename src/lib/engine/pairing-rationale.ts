/**
 * pairing-rationale — build "Because you cooked X, we picked Y" lines.
 *
 * Sprint C, Phase 2. Silent until the user has enough history (≥5 completed
 * cooks) and the pick is meaningfully close to something they loved in the
 * last 21 days (≥2 taxonomy axes overlap on cuisine, form, sauce, protein,
 * or flavor). When both thresholds are met we return a single short
 * sentence — never more than one — to the QuestCard caller.
 *
 * Deterministic: same inputs → same sentence, zero randomness.
 */

import {
  getDishTaxonomyIndex,
  type DishTaxonomy,
} from "@/lib/engine/dish-taxonomy";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

/** Don't speak below this many completed cooks. */
export const RATIONALE_MIN_COOKS = 5;
/** Only consider sessions inside this window. */
export const RATIONALE_LOOKBACK_DAYS = 21;
/** Number of overlapping taxonomy axes required to surface a rationale. */
export const RATIONALE_MIN_OVERLAP = 2;

const LOOKBACK_MS = RATIONALE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;

export interface PairingRationale {
  /** The dish the user cooked recently that drove this rationale. */
  priorDishName: string;
  /** One-line rationale, e.g. "Because you loved Carbonara, this shares
   *  the pasta + cream feel." — ready to render. No trailing period. */
  text: string;
  /** Which axes overlapped. Useful for tests / debugging. */
  matchedAxes: string[];
}

function indexBySlug(): Map<string, DishTaxonomy> {
  const map = new Map<string, DishTaxonomy>();
  for (const t of getDishTaxonomyIndex()) {
    map.set(t.id.toLowerCase(), t);
  }
  return map;
}

function axisOverlap(a: string[], b: string[]): string[] {
  if (a.length === 0 || b.length === 0) return [];
  const set = new Set(a);
  return b.filter((x) => set.has(x));
}

function countOverlap(
  current: DishTaxonomy,
  prior: DishTaxonomy,
): {
  axes: string[];
  labels: string[];
} {
  const axes: string[] = [];
  const labels: string[] = [];

  if (
    current.cuisine &&
    prior.cuisine &&
    current.cuisine.toLowerCase() === prior.cuisine.toLowerCase()
  ) {
    axes.push("cuisine");
    labels.push(current.cuisine);
  }

  const forms = axisOverlap(current.forms, prior.forms);
  if (forms.length > 0) {
    axes.push("form");
    labels.push(forms[0]!);
  }

  const sauces = axisOverlap(current.sauces, prior.sauces).filter(
    (s) => s !== "none",
  );
  if (sauces.length > 0) {
    axes.push("sauce");
    labels.push(`${sauces[0]} sauce`);
  }

  const proteins = axisOverlap(current.proteins, prior.proteins);
  if (proteins.length > 0) {
    axes.push("protein");
    labels.push(proteins[0]!);
  }

  const flavors = axisOverlap(current.flavors, prior.flavors);
  if (flavors.length > 0) {
    axes.push("flavor");
    labels.push(flavors[0]!);
  }

  return { axes, labels };
}

interface BuildOpts {
  /** Slug of the dish we're offering right now (QuestCard current card). */
  currentDishSlug: string;
  /** Display name — used as a fallback when taxonomy lookup fails. */
  currentDishName?: string;
  /** All cook sessions (completed ones will be considered). */
  cookHistory: CookSessionRecord[];
  /** Defaults to `Date.now()` — passed in for tests. */
  now?: number;
}

/**
 * Build at most one short rationale sentence, or `null` if the inputs
 * don't clear the "speak-now" threshold. Pure, deterministic.
 */
export function buildPairingRationale({
  currentDishSlug,
  currentDishName,
  cookHistory,
  now = Date.now(),
}: BuildOpts): PairingRationale | null {
  const completed = cookHistory.filter((s) => Boolean(s.completedAt));
  if (completed.length < RATIONALE_MIN_COOKS) return null;

  const index = indexBySlug();
  const currentLookup = index.get(currentDishSlug.toLowerCase());
  if (!currentLookup) return null;

  // Gather recent sessions inside the lookback window, newest first,
  // skipping the dish itself (no "because you cooked X we picked X").
  const recent = completed
    .filter((s) => s.completedAt)
    .map((s) => ({
      session: s,
      ts: new Date(s.completedAt!).getTime(),
    }))
    .filter(({ ts }) => Number.isFinite(ts) && now - ts <= LOOKBACK_MS)
    .filter(
      ({ session }) =>
        session.recipeSlug.toLowerCase() !== currentDishSlug.toLowerCase(),
    )
    .sort((a, b) => b.ts - a.ts);

  // Find the first recent session that clears the overlap threshold and
  // has a taxonomy entry we can read from. Take the first match — callers
  // treat the rationale as secondary information, so the most recent
  // qualifying cook is the kindest anchor.
  for (const { session } of recent) {
    const priorLookup = index.get(session.recipeSlug.toLowerCase());
    if (!priorLookup) continue;
    const { axes, labels } = countOverlap(currentLookup, priorLookup);
    if (axes.length < RATIONALE_MIN_OVERLAP) continue;

    const label = labels[0] ?? priorLookup.cuisine;
    const text = `Because you cooked ${session.dishName}, this shares the ${label} feel`;
    return {
      priorDishName: session.dishName,
      text,
      matchedAxes: axes,
    };
  }

  // No rationale available. If we have a display name we could fall back
  // to a generic line — but the Phase 2 brief explicitly asks us to stay
  // silent below the threshold, so we do.
  void currentDishName;
  return null;
}
