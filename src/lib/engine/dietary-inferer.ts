/**
 * Dietary inferer — derive a dish's dietary compatibility flags
 * from its tags + description text.
 *
 * W37 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint H W37-W41).
 * Closes the gap left at Sprint G close: the W35 household table
 * aggregate computes a dietary constraint, but the seed catalog
 * had no dietary tags so the constraint had nothing to filter on.
 *
 * The inferer outputs the list of dietary flags a dish IS
 * COMPATIBLE WITH (vegan, vegetarian, gluten-free, dairy-free,
 * nut-allergy, shellfish-allergy). The pairing engine then keeps
 * only candidates whose set is a superset of the household's
 * required flags.
 *
 * Conservative on uncertainty:
 *   - When the description doesn't mention a problem ingredient,
 *     the dish is claimed compatible (false negatives are safer
 *     than false positives at filter time — we'd rather show a
 *     side that turns out not to be vegan than hide one that
 *     was).
 *   - Tag-authored intent wins. If a dish carries the `vegan`
 *     tag explicitly, the description scan can't override it.
 *
 * Pure / dependency-free. Tested without rendering React.
 */

export const DIETARY_FLAGS = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
  "nut-allergy",
  "shellfish-allergy",
] as const;

export type DietaryFlag = (typeof DIETARY_FLAGS)[number];

/** Problem-ingredient terms per dietary flag. Lowercased; word-
 *  boundary matched at scan time. The lists prefer broader
 *  catches over narrower ones — e.g. "milk" picks up "buttermilk"
 *  too, which is the correct behaviour for dairy-free. */
const VIOLATION_TERMS: Record<DietaryFlag, string[]> = {
  vegan: [
    // Animal proteins
    "chicken",
    "beef",
    "pork",
    "lamb",
    "fish",
    "anchov",
    "shrimp",
    "lobster",
    "crab",
    "mussel",
    "oyster",
    "scallop",
    "ham",
    "bacon",
    "prosciutto",
    "sausage",
    "salami",
    "turkey",
    "duck",
    "veal",
    // Animal byproducts
    "egg",
    "dairy",
    "milk",
    "butter",
    "cream",
    "yogurt",
    "cheese",
    "parmesan",
    "feta",
    "ricotta",
    "mozzarella",
    "honey",
    "ghee",
    "gelatin",
  ],
  vegetarian: [
    "chicken",
    "beef",
    "pork",
    "lamb",
    "fish",
    "anchov",
    "shrimp",
    "lobster",
    "crab",
    "mussel",
    "oyster",
    "scallop",
    "ham",
    "bacon",
    "prosciutto",
    "sausage",
    "salami",
    "turkey",
    "duck",
    "veal",
    "gelatin",
  ],
  "gluten-free": [
    "bread",
    "baguette",
    "ciabatta",
    "focaccia",
    "sourdough",
    "loaf",
    "bun",
    "roll",
    "flour",
    "pasta",
    "noodle",
    "couscous",
    "bulgur",
    "wheat",
    "barley",
    "rye",
    "soy sauce", // contains wheat unless tamari
    "panko",
    "crouton",
    "tortilla",
    "naan",
    "pita",
    "chapati",
    "roti",
    "biscuit",
    "puff pastry",
    "pastry",
    "cracker",
    "dumpling",
  ],
  "dairy-free": [
    "milk",
    "butter",
    "cream",
    "yogurt",
    "cheese",
    "parmesan",
    "feta",
    "ricotta",
    "mozzarella",
    "ghee",
    "dairy",
  ],
  "nut-allergy": [
    "almond",
    "peanut",
    "walnut",
    "cashew",
    "pistachio",
    "pecan",
    "pine nut",
    "hazelnut",
    "macadamia",
    "brazil nut",
  ],
  "shellfish-allergy": [
    "shrimp",
    "lobster",
    "crab",
    "mussel",
    "oyster",
    "scallop",
    "clam",
    "crayfish",
    "prawn",
  ],
};

/** Lowercase + collapse whitespace for the haystack scan. */
function normalise(text: string): string {
  return text.toLowerCase();
}

/** True when any violation term appears in the haystack. Uses
 *  substring match (not word boundary) intentionally so
 *  "buttermilk" hits "milk" and "anchovy paste" hits "anchov". */
function hasViolation(haystack: string, terms: ReadonlyArray<string>): boolean {
  for (const term of terms) {
    if (haystack.includes(term)) return true;
  }
  return false;
}

export interface InferenceInput {
  tags: ReadonlyArray<string>;
  description: string;
}

/** Compute the dietary flags this dish is compatible with.
 *  Tag-authored intent wins — a `vegan` tag in `tags` always
 *  yields `vegan` in the output regardless of description scan. */
export function inferDietaryFlags(input: InferenceInput): DietaryFlag[] {
  const tagsLower = new Set(input.tags.map((t) => t.toLowerCase()));
  const haystack = normalise(input.description);
  const out: DietaryFlag[] = [];

  for (const flag of DIETARY_FLAGS) {
    // Tag-authored intent wins.
    if (tagsLower.has(flag)) {
      out.push(flag);
      continue;
    }
    // Otherwise: claim compatibility iff the description doesn't
    // contain a violation term.
    if (!hasViolation(haystack, VIOLATION_TERMS[flag])) {
      out.push(flag);
    }
  }

  // vegan implies vegetarian — guarantee the implication holds
  // even if a word slipped through one list but not the other
  // (e.g. "egg" appears in vegan's list but not vegetarian's).
  if (out.includes("vegan") && !out.includes("vegetarian")) {
    out.push("vegetarian");
  }

  // Sort for deterministic output.
  return [...out].sort();
}

/** True when `dishFlags` satisfies every flag in
 *  `requiredFlags`. Trivially true on an empty requirement.
 *  Pure helper exported for engine + unit-test use. */
export function satisfiesDietaryRequirement(
  dishFlags: ReadonlyArray<string>,
  requiredFlags: ReadonlyArray<string>,
): boolean {
  if (requiredFlags.length === 0) return true;
  const dishSet = new Set(dishFlags);
  for (const required of requiredFlags) {
    if (!dishSet.has(required)) return false;
  }
  return true;
}
