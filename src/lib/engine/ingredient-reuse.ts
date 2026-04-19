/**
 * ingredient-reuse  -  derive a single "reuses X from Y" hint when a suggested
 * dish shares a named ingredient with a recent cook.
 *
 * Sprint D, Phase 2: Pair rationale says "because you cooked X"; this goes
 * one level deeper into the _why_: there is a concrete ingredient sitting in
 * the fridge that can be reused today.
 *
 * Deterministic: first match by session recency, then by ingredient
 * alphabetical order. Never fires when no overlap exists  -  zero false
 * positives.
 */

/**
 * Window in milliseconds. Outside this window the ingredient is likely
 * gone from the fridge.
 */
export const REUSE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Ingredients that almost everyone has in staples  -  suggesting reuse here
 * is useless noise. Keep deliberately short.
 */
const STAPLE_BLOCKLIST = new Set([
  "salt",
  "pepper",
  "black pepper",
  "water",
  "olive oil",
  "vegetable oil",
  "oil",
  "sugar",
  "butter",
]);

export interface IngredientReuseHint {
  /** Human-readable hint. No trailing period. */
  text: string;
  /** The matched ingredient (lowercase). */
  ingredient: string;
  /** The session slug whose ingredient we're reusing. */
  fromDishSlug: string;
  /** Display name of the session's dish. */
  fromDishName: string;
}

interface PastIngredientEntry {
  slug: string;
  dishName: string;
  completedAt: number;
  ingredients: Set<string>;
}

export interface MatchIngredientReuseInput {
  /** Normalized (lowercase, trimmed) ingredient names for the current dish. */
  currentIngredientNames: string[];
  /** All completed cook sessions, plus each session's known ingredients. */
  pastSessions: PastIngredientEntry[];
  /** Override for deterministic testing. */
  now?: number;
}

/**
 * @returns the single strongest ingredient-reuse hint, or `null` when
 * nothing honest can be said.
 */
export function matchIngredientReuse(
  input: MatchIngredientReuseInput,
): IngredientReuseHint | null {
  const { currentIngredientNames, pastSessions } = input;
  const now = input.now ?? Date.now();

  if (currentIngredientNames.length === 0 || pastSessions.length === 0) {
    return null;
  }

  const currentSet = new Set(
    currentIngredientNames.map((n) => n.trim().toLowerCase()).filter(Boolean),
  );
  if (currentSet.size === 0) return null;

  // Walk sessions newest-first. Return the first ingredient overlap that is
  // not a staple. Deterministic tiebreak: if multiple ingredients overlap
  // within the same session, pick alphabetically first.
  const sortedSessions = [...pastSessions].sort(
    (a, b) => b.completedAt - a.completedAt,
  );

  for (const session of sortedSessions) {
    if (now - session.completedAt > REUSE_WINDOW_MS) break;
    const overlaps: string[] = [];
    for (const ing of session.ingredients) {
      const norm = ing.trim().toLowerCase();
      if (!norm) continue;
      if (STAPLE_BLOCKLIST.has(norm)) continue;
      if (currentSet.has(norm)) overlaps.push(norm);
    }
    if (overlaps.length === 0) continue;
    overlaps.sort();
    const ingredient = overlaps[0];
    return {
      text: buildReuseSentence(
        ingredient,
        session.dishName,
        session.completedAt,
        now,
      ),
      ingredient,
      fromDishSlug: session.slug,
      fromDishName: session.dishName,
    };
  }

  return null;
}

function buildReuseSentence(
  ingredient: string,
  dishName: string,
  completedAt: number,
  now: number,
): string {
  const ageMs = now - completedAt;
  const days = Math.max(0, Math.round(ageMs / (24 * 60 * 60 * 1000)));
  const when =
    days <= 1
      ? "yesterday"
      : days <= 2
        ? "two days ago"
        : days <= 6
          ? `${days} days ago`
          : "last week";
  return `Reuses ${ingredient} from ${when}'s ${dishName.toLowerCase()}`;
}
