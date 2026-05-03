/**
 * Pantry coverage helper (Y2 Sprint D W15).
 *
 * Cross-references a recipe's required ingredients against the
 * user's local pantry set + reports how much of the recipe is
 * already in stock. Foundation for Sprint D's "use what you
 * have" engine modifier (W16) + UI badge ("7/9 from your
 * pantry") (W17).
 *
 * Why a separate helper, not a method on `usePantry`:
 *   - Pure / dependency-free / deterministic — testable without
 *     mocking the hook + its localStorage.
 *   - Engine code (`pairing-engine.ts`) needs coverage scoring
 *     server-side too; the hook is client-only.
 *   - Normalisation logic + fuzzy matching is sharper logic
 *     than the hook should carry.
 *
 * Pure / dependency-free.
 */

/** Recipe ingredient shape — minimal contract; callers pass
 *  whatever shape they have as long as it has `name` (string)
 *  + optional `optional` (boolean, defaults to false). */
export interface CoverageIngredient {
  name: string;
  /** When true, the ingredient is excluded from the denominator
   *  + matching. Recipe authors flag rosemary garnishes,
   *  optional crème fraîche, etc. */
  optional?: boolean;
}

export interface PantryCoverageResult {
  /** Count of required ingredients the user has. */
  haveCount: number;
  /** Count of required ingredients (optional excluded). */
  totalCount: number;
  /** haveCount / totalCount, or 0 when totalCount is 0. */
  coverage: number;
  /** The required ingredients still missing — useful for the
   *  shopping-list affordance. Lowercased + stripped, same shape
   *  the pantry uses internally. */
  missingNames: string[];
}

/** Qualifier words that don't carry semantic meaning for pantry
 *  matching. "fresh basil leaves" → "basil". The list is small +
 *  conservative — overly aggressive stripping turns "olive oil"
 *  into "oil" which is a false-positive against a pantry that
 *  has sesame oil. */
const QUALIFIER_WORDS: ReadonlyArray<string> = [
  "fresh",
  "freshly",
  "dried",
  "ground",
  "minced",
  "chopped",
  "sliced",
  "diced",
  "grated",
  "shredded",
  "whole",
  "halved",
  "quartered",
  "leaves",
  "leaf",
  "stem",
  "stems",
  "ripe",
  "raw",
  "cooked",
  "large",
  "small",
  "medium",
  "extra",
  "virgin",
  "smoked",
  "to taste",
  "for serving",
  "for garnish",
  "optional",
];

/** Pure helper: strip leading numeric quantity + unit fragments
 *  from an ingredient name. "1 cup chopped basil" → "chopped
 *  basil". Conservative — only strips a single leading
 *  number-and-unit pair. */
function stripLeadingQuantity(name: string): string {
  // Match a leading number (with optional fraction / decimal) +
  // optional unit word, leave the rest.
  return name
    .replace(/^\s*\d+([\/.]\d+)?\s*(cups?|tbsp|tsp|oz|lb|g|kg|ml|l)?\s*/i, "")
    .trim();
}

/** Pure helper: strip parenthesised aside text. "olive oil
 *  (extra virgin)" → "olive oil". */
function stripParens(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
}

/** Pure helper: normalise an ingredient name for pantry matching.
 *  Lowercase + collapse whitespace + drop punctuation + strip
 *  leading quantity + drop qualifier words. The output is the
 *  same shape the pantry hook uses internally. */
export function normaliseIngredientName(raw: string): string {
  let s = raw.toLowerCase().trim();
  s = stripParens(s);
  s = stripLeadingQuantity(s);
  s = s.replace(/[.,;:!?]/g, "");
  s = s.replace(/\s+/g, " ");
  // Drop qualifier words. Matching is whole-word so "minced"
  // is removed but "mincemeat" survives.
  for (const q of QUALIFIER_WORDS) {
    const re = new RegExp(`(^|\\s)${escapeRegex(q)}(\\s|$)`, "g");
    s = s.replace(re, "$1$2");
  }
  return s.replace(/\s+/g, " ").trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Pure helper: does the pantry cover this ingredient?
 *  Two-pass: exact-normalised match first (fast, sound), fuzzy
 *  substring match second ("lemon" in pantry covers "lemon zest"
 *  in recipe; "olive oil" in pantry covers "olive oil to taste").
 *
 *  Substring direction: pantry-name CONTAINED in ingredient-name,
 *  or ingredient-name CONTAINED in pantry-name. Bidirectional
 *  because users add either "lemon" or "lemons" — both should
 *  satisfy a recipe calling for either form. */
export function pantryHasIngredient(
  ingredientName: string,
  pantrySet: ReadonlySet<string>,
): boolean {
  const n = normaliseIngredientName(ingredientName);
  if (n.length === 0) return false;
  // Exact normalised match
  if (pantrySet.has(n)) return true;
  // Bidirectional substring match
  for (const p of pantrySet) {
    if (p.length === 0) continue;
    if (n.includes(p)) return true;
    if (p.includes(n)) return true;
  }
  return false;
}

/** Pure helper: compute pantry coverage for a recipe.
 *  Returns `{haveCount, totalCount, coverage, missingNames}`.
 *
 *  Optional ingredients are excluded from BOTH the numerator AND
 *  the denominator — they don't help coverage when present + don't
 *  hurt it when absent.
 *
 *  When totalCount is 0 (recipe has only optional ingredients,
 *  or empty list), coverage is 0 (avoid NaN from division by 0). */
export function computePantryCoverage(
  recipe: { ingredients: ReadonlyArray<CoverageIngredient> },
  pantry: ReadonlySet<string> | ReadonlyArray<string>,
): PantryCoverageResult {
  const pantrySet =
    pantry instanceof Set
      ? (pantry as ReadonlySet<string>)
      : new Set(
          (pantry as ReadonlyArray<string>).map((p) =>
            normaliseIngredientName(p),
          ),
        );

  let haveCount = 0;
  let totalCount = 0;
  const missingNames: string[] = [];

  for (const ing of recipe.ingredients) {
    if (ing.optional) continue;
    totalCount += 1;
    const has = pantryHasIngredient(ing.name, pantrySet);
    if (has) {
      haveCount += 1;
    } else {
      missingNames.push(normaliseIngredientName(ing.name));
    }
  }

  const coverage = totalCount === 0 ? 0 : haveCount / totalCount;
  return { haveCount, totalCount, coverage, missingNames };
}
