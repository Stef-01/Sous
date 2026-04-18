/**
 * findClosestDishes — nuanced, deterministic nearest-neighbour matching.
 *
 * The problem: keyword search returns "anything with chicken" when the user
 * types "chicken alfredo" — they see butter chicken before they see
 * chicken carbonara. That is the opposite of what they want.
 *
 * The fix here is boring-but-legible:
 *   1. Parse the query into the same axis tags as every dish
 *      (protein / sauce / technique / flavor / form / dairy).
 *   2. Score each dish as a weighted sum of axis overlaps.
 *   3. Bonus for direct substring match on name/alias, penalty for axis-level
 *      mismatch (e.g. user wants a cream sauce, dish has a curry sauce).
 *   4. Return top-k with a short human reason for the ranking.
 *
 * We deliberately avoid embeddings / TF-IDF / cosine similarity. A small
 * table of synonyms + deliberate weights beats a black-box score for this
 * surface — when a match looks wrong, we can read the scoring and fix it.
 */

import {
  getDishTaxonomyIndex,
  parseQueryTaxonomy,
  type DishTaxonomy,
  type Flavor,
  type Form,
  type Protein,
  type SauceFamily,
  type Technique,
} from "@/lib/engine/dish-taxonomy";

export interface DishMatch {
  dish: DishTaxonomy;
  score: number;
  reason: string;
}

// Axis weights. Form (pasta vs salad) is the strongest single signal because
// it shapes the dining experience most visibly. Sauce and protein matter
// almost as much. Flavor is a softer tiebreaker. Technique is weakest.
const WEIGHT = {
  exactName: 40,
  aliasHit: 28,
  nameToken: 14,
  form: 10,
  sauce: 8,
  protein: 8,
  flavor: 4,
  technique: 3,
  cuisine: 3,
  dairyMatch: 2,
  dairyMismatch: -4,
  formMismatch: -6, // user wants pasta, dish is a soup → big demotion
  sauceMismatch: -3,
} as const;

function reasonFor(
  matched: {
    forms: Form[];
    sauces: SauceFamily[];
    proteins: Protein[];
    flavors: Flavor[];
    techniques: Technique[];
  },
  exactName: boolean,
  aliasHit: boolean,
): string {
  if (exactName) return "Exact match";
  if (aliasHit) return "Known alias";

  const bits: string[] = [];
  if (matched.forms.length) bits.push(matched.forms[0]!);
  if (matched.sauces.length) {
    const s = matched.sauces[0]!;
    if (s !== "none") bits.push(`${s} sauce`);
  }
  if (matched.proteins.length) bits.push(`with ${matched.proteins[0]}`);
  if (bits.length === 0 && matched.flavors.length) {
    bits.push(`${matched.flavors[0]} vibe`);
  }
  if (bits.length === 0) return "Similar profile";
  return `Same ${bits.join(" · ")}`;
}

/**
 * Find the `k` dishes closest to a freeform craving query. Returns an
 * empty array when the query is too short or the scoring does not clear a
 * small minimum (avoids showing noise when the input is gibberish).
 */
export function findClosestDishes(
  query: string,
  k = 3,
  indexOverride?: DishTaxonomy[],
): DishMatch[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  const index = indexOverride ?? getDishTaxonomyIndex();
  const q = parseQueryTaxonomy(trimmed);

  const queryTokens = new Set(q.keywords);

  const matches: DishMatch[] = [];

  for (const dish of index) {
    let score = 0;

    const dishName = dish.name.toLowerCase();
    const exactName = dishName === trimmed || dishName.includes(trimmed);

    const aliasHit = dish.aliases.some((a) => {
      const al = a.toLowerCase();
      return al === trimmed || al.includes(trimmed) || trimmed.includes(al);
    });

    if (exactName) score += WEIGHT.exactName;
    else if (aliasHit) score += WEIGHT.aliasHit;

    // Token-level overlap on dish name — lighter signal that catches
    // partial queries like "carbonara" hitting "Pasta Carbonara".
    const nameTokens = dishName.split(/[^a-z]+/).filter(Boolean);
    for (const tok of nameTokens) {
      if (queryTokens.has(tok)) score += WEIGHT.nameToken;
    }

    // Axis overlaps
    const matchedForms = dish.forms.filter((f) => q.forms.includes(f));
    const matchedSauces = dish.sauces.filter((s) => q.sauces.includes(s));
    const matchedProteins = dish.proteins.filter((p) => q.proteins.includes(p));
    const matchedFlavors = dish.flavors.filter((f) => q.flavors.includes(f));
    const matchedTechniques = dish.techniques.filter((t) =>
      q.techniques.includes(t),
    );

    score += WEIGHT.form * matchedForms.length;
    score += WEIGHT.sauce * matchedSauces.length;
    score += WEIGHT.protein * matchedProteins.length;
    score += WEIGHT.flavor * matchedFlavors.length;
    score += WEIGHT.technique * matchedTechniques.length;

    // Light cuisine alignment bonus — cheap but useful when a user types
    // e.g. "italian chicken" and we have multiple chicken dishes.
    if (queryTokens.has(dish.cuisine.toLowerCase())) {
      score += WEIGHT.cuisine;
    }

    // Dairy agreement/disagreement. Only penalise when the user
    // explicitly used a creamy/buttery/cheesy word and the dish has
    // no dairy at all.
    const userWantsDairy = q.dairy === "heavy";
    if (userWantsDairy && dish.dairy === "heavy") {
      score += WEIGHT.dairyMatch;
    } else if (userWantsDairy && dish.dairy === "none") {
      score += WEIGHT.dairyMismatch;
    }

    // Form mismatch: if the user specified a form and the dish has NO
    // overlap with it, demote. Protects "chicken pasta" from pulling
    // up butter chicken.
    if (q.forms.length > 0 && matchedForms.length === 0) {
      const dishHasAnyForm = dish.forms.length > 0;
      if (dishHasAnyForm) score += WEIGHT.formMismatch;
    }

    if (
      q.sauces.length > 0 &&
      matchedSauces.length === 0 &&
      dish.sauces.length > 0
    ) {
      score += WEIGHT.sauceMismatch;
    }

    if (score <= 0) continue;

    matches.push({
      dish,
      score,
      reason: reasonFor(
        {
          forms: matchedForms,
          sauces: matchedSauces,
          proteins: matchedProteins,
          flavors: matchedFlavors,
          techniques: matchedTechniques,
        },
        exactName,
        aliasHit,
      ),
    });
  }

  matches.sort(
    (a, b) =>
      b.score - a.score ||
      // Deterministic tiebreaker: prefer meals (more useful as "main dish")
      Number(b.dish.isMeal) - Number(a.dish.isMeal) ||
      a.dish.name.localeCompare(b.dish.name),
  );

  // Require at least one positive signal above the nameToken threshold to
  // surface anything at all. This keeps random one-letter queries from
  // returning the full catalog sorted by alphabet.
  const best = matches[0];
  if (!best || best.score < WEIGHT.nameToken) return [];

  return matches.slice(0, k);
}
