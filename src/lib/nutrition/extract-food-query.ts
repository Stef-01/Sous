/**
 * extract-food-query — turn raw OCR text (a package front, a menu line) into
 * a searchable food name. No vision model: the camera just READS, and the
 * existing search does the understanding.
 *
 * Heuristics, in plain terms: drop nutrition-label boilerplate and
 * number-dominated lines, then prefer early, short, letter-dense lines —
 * that's where product names live on packaging. Returns the best line plus
 * alternates so the UI can offer "not this? try …".
 */

/** Boilerplate that never names a food (labels, panels, legal). */
const LABEL_NOISE =
  /nutrition\s*facts|ingredients?\b|serving|daily\s*value|calories|total\s+(fat|sugars?|carbohydrate)|saturated|trans\s*fat|cholesterol|sodium|dietary|protein\b|vitamin|calcium|iron\b|potassium|allergen|contains|may\s+contain|best\s+(before|by)|use\s+by|keep\s+(refrigerated|frozen)|net\s*(wt|weight)|per\s*100\s*g|%\s*dv|amount\s+per|store\s+in|distributed|manufactured|www\.|\.com/i;

/** Units & pack-size vocabulary — a line of these is a size, not a name. */
const SIZE_ONLY =
  /^[\d\s.,/()-]*(oz|fl\s*oz|g|kg|ml|l|lb|lbs|ct|count|pack|servings?|cal|kcal|kj)?[\d\s.,/()%-]*$/i;

export interface FoodQueryResult {
  /** Best guess at the food's name, cleaned for search. Null = nothing readable. */
  query: string | null;
  /** Next-best candidate lines (cleaned), for "try instead" chips. */
  alternates: string[];
}

/** Strip sizes/calories/punctuation tails: "Big Mac 590 cal" → "Big Mac". */
export function cleanFoodLine(line: string): string {
  return line
    .replace(/[|_=*•·~<>[\]{}]+/g, " ")
    .replace(
      /\b\d[\d.,/]*\s*(fl\s*oz|oz|g|kg|ml|l|lb|lbs|ct|cal|kcal|kj)\b.*$/i,
      " ",
    )
    .replace(/\(\s*\)/g, " ")
    .replace(/(\s+\d[\d.,/]*)+\s*$/g, " ") // trailing bare numbers (prices)
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s\-–—.,:;]+|[\s\-–—.,:;]+$/g, "")
    .trim();
}

function letterRatio(s: string): number {
  const letters = (s.match(/[a-z]/gi) ?? []).length;
  return s.length === 0 ? 0 : letters / s.length;
}

export function extractFoodQuery(raw: string): FoodQueryResult {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const scored: Array<{ cleaned: string; score: number }> = [];
  lines.forEach((line, idx) => {
    if (LABEL_NOISE.test(line)) return;
    if (SIZE_ONLY.test(line)) return;
    const cleaned = cleanFoodLine(line);
    if (cleaned.length < 3) return;
    const words = cleaned.split(/\s+/);
    if (words.length > 6) return; // paragraphs aren't names
    let score = 0;
    score += letterRatio(cleaned) * 4; // letter-dense
    score += words.length >= 2 && words.length <= 4 ? 2 : 0; // name-shaped
    score += Math.max(0, 3 - idx) * 0.75; // package fronts lead with the name
    if (cleaned === cleaned.toUpperCase() && /[A-Z]/.test(cleaned))
      score += 0.5; // hero text
    if (letterRatio(cleaned) < 0.55) return; // still number-dominated
    scored.push({ cleaned, score });
  });

  scored.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const unique = scored.filter(({ cleaned }) => {
    const k = cleaned.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    query: unique[0]?.cleaned ?? null,
    alternates: unique.slice(1, 4).map((u) => u.cleaned),
  };
}
