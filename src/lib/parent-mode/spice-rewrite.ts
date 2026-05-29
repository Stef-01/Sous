/**
 * spice-rewrite — pure deterministic transform that adjusts a cook
 * step's chili language to match the household's spice tolerance.
 *
 * Stage 2 W10 deliverable. No AI; rule-based; testable in isolation.
 *
 * Heat detection keys (case-insensitive substring match):
 *   chili, chile, cayenne, sambal, sriracha, gochugaru, gochujang,
 *   harissa, jalapeño/jalapeno, serrano, habanero, scotch bonnet,
 *   bird's eye, thai chili, red pepper flakes, crushed red pepper
 *
 * Tolerance bucket → behaviour on the matched span:
 *   1 (no heat)        → strike the heat phrase out of the sentence
 *                        ("add cayenne" → "")
 *   2 (paprika only)   → swap to the closest mild aromatic
 *                        ("cayenne" → "smoked paprika")
 *   3 (mild chili)     → quarter the amount (handles "1 tsp" → "¼ tsp")
 *   4 (medium)         → halve the amount
 *   5 (full heat)      → leave unchanged
 *
 * The transform is intentionally conservative — when in doubt, fall
 * back to the original text rather than mutate it incorrectly.
 */

export type SpiceTolerance = 1 | 2 | 3 | 4 | 5;

export const HEAT_KEYWORDS: readonly string[] = [
  "cayenne",
  "sambal",
  "sriracha",
  "gochugaru",
  "gochujang",
  "harissa",
  "jalapeño",
  "jalapeno",
  "serrano",
  "habanero",
  "scotch bonnet",
  "bird's eye",
  "thai chili",
  "thai chile",
  "red pepper flakes",
  "crushed red pepper",
  "chili",
  "chile",
] as const;

const PAPRIKA_SWAP: Record<string, string> = {
  cayenne: "smoked paprika",
  sambal: "smoked paprika",
  sriracha: "smoked paprika and a splash of vinegar",
  gochugaru: "sweet paprika",
  gochujang: "tomato paste",
  harissa: "smoked paprika",
  "red pepper flakes": "a pinch of paprika",
  "crushed red pepper": "a pinch of paprika",
  jalapeño: "bell pepper",
  jalapeno: "bell pepper",
  serrano: "bell pepper",
  habanero: "bell pepper",
  "scotch bonnet": "bell pepper",
  "bird's eye": "bell pepper",
  "thai chili": "bell pepper",
  "thai chile": "bell pepper",
  chili: "paprika",
  chile: "paprika",
};

/**
 * Returns true when the text contains any heat-bearing keyword.
 * Cheap and case-insensitive; safe to call on every step render.
 */
export function containsChiliHeat(text: string): boolean {
  const lower = text.toLowerCase();
  for (const k of HEAT_KEYWORDS) {
    if (lower.includes(k)) return true;
  }
  return false;
}

/**
 * Halves a quantity expression in-place. Handles whole numbers and
 * common fractions ("1 tsp" → "½ tsp"; "2 tablespoons" → "1 tablespoon").
 * Returns null when no quantity is found near the keyword.
 */
function halveQuantityNearKeyword(
  text: string,
  keyword: string,
  factor: 0.5 | 0.25,
): string {
  const re = new RegExp(
    `(\\d+(?:\\.\\d+)?|½|¼|¾)(\\s*)(tsp|teaspoons?|tbsp|tablespoons?|cups?|pieces?|cloves?|sprigs?)?(\\s*)(of\\s+)?(${escapeRegExp(keyword)})`,
    "gi",
  );
  return text.replace(re, (_match, qty: string, sp1, unit, sp2, of, kw) => {
    const numeric = parseFractionish(qty);
    if (numeric === null) return _match;
    const scaled = numeric * factor;
    const formatted = formatScaledQuantity(scaled);
    return `${formatted}${sp1 ?? ""}${unit ?? ""}${sp2 ?? ""}${of ?? ""}${kw}`;
  });
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseFractionish(qty: string): number | null {
  if (qty === "½") return 0.5;
  if (qty === "¼") return 0.25;
  if (qty === "¾") return 0.75;
  const n = Number(qty);
  return Number.isFinite(n) ? n : null;
}

function formatScaledQuantity(n: number): string {
  if (Math.abs(n - 0.25) < 0.001) return "¼";
  if (Math.abs(n - 0.5) < 0.001) return "½";
  if (Math.abs(n - 0.75) < 0.001) return "¾";
  if (n < 0.25) return "a tiny pinch of";
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(/\.0$/, "");
}

/**
 * Strikes a heat phrase from the sentence. Removes the matched phrase
 * plus any conjunctive "and" / leading commas around it so the
 * resulting sentence still reads cleanly.
 */
function stripHeat(text: string, keyword: string): string {
  const stripPattern = new RegExp(
    `(?:,\\s*)?(?:and\\s+)?(?:a\\s+(?:pinch|sprinkle|dash)\\s+of\\s+)?(?:\\d+(?:\\.\\d+)?|½|¼|¾)?\\s*(?:tsp|teaspoons?|tbsp|tablespoons?|cups?|pieces?|cloves?|sprigs?)?\\s*(?:of\\s+)?${escapeRegExp(keyword)}\\b`,
    "gi",
  );
  return text
    .replace(stripPattern, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Swaps a heat keyword for the milder paprika-aligned alternative.
 *
 * Uses unicode-aware boundaries (?:^|[^a-zA-ZÀ-ſ]) instead of
 * \b because JS's \b is ASCII-only and would skip "jalapeño" / "café"
 * style keywords with extended-Latin characters.
 *
 * Pluralises the swap when the matched keyword is followed by an "s"
 * so "Slice 2 jalapeños." → "Slice 2 bell peppers." reads correctly.
 */
function swapForPaprika(text: string, keyword: string): string {
  const sub = PAPRIKA_SWAP[keyword];
  if (!sub) return text;
  const re = new RegExp(
    `(^|[^a-zA-Z\\u00C0-\\u017F])${escapeRegExp(keyword)}(s|es)?(?![a-zA-Z\\u00C0-\\u017F])`,
    "gi",
  );
  return text.replace(re, (_match, prefix: string, plural?: string) => {
    const out = plural ? pluralise(sub) : sub;
    return `${prefix}${out}`;
  });
}

function pluralise(s: string): string {
  if (/(s|sh|ch|x|z)$/i.test(s)) return `${s}es`;
  if (/[^aeiou]y$/i.test(s)) return `${s.slice(0, -1)}ies`;
  return `${s}s`;
}

/**
 * Public transform. Returns the rewritten text — same as input when
 * tolerance >= 5 or no heat is detected.
 */
export function rewriteForSpice(
  text: string,
  tolerance: SpiceTolerance,
): string {
  if (tolerance >= 5) return text;
  if (!containsChiliHeat(text)) return text;

  let out = text;
  for (const keyword of HEAT_KEYWORDS) {
    if (!out.toLowerCase().includes(keyword)) continue;
    if (tolerance === 1) {
      out = stripHeat(out, keyword);
    } else if (tolerance === 2) {
      out = swapForPaprika(out, keyword);
    } else if (tolerance === 3) {
      out = halveQuantityNearKeyword(out, keyword, 0.25);
    } else if (tolerance === 4) {
      out = halveQuantityNearKeyword(out, keyword, 0.5);
    }
  }

  // Tidy any leftover doubled punctuation from stripHeat.
  out = out
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .replace(/,\s*\./g, ".")
    .trim();

  // Defensive fallback — never return an empty string.
  return out.length > 0 ? out : text;
}
