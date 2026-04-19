/**
 * Dish taxonomy  -  enriches each dish (meal or side) with structured,
 * orthogonal tags that describe *what makes it feel like what it feels like*:
 * protein, sauce family, technique, flavor, cuisine, form, and dairy level.
 *
 * Derived from name/aliases/description/tags via a small, explicit lookup  -
 * no LLM, no network, deterministic. Used by `findClosestDishes` for
 * semantic-ish matching on the craving input.
 *
 * If you ever think of adding a 10-level taste vector here: DON'T. Keep
 * this a handful of coarse, legible tags. The whole point is that we can
 * reason about why two dishes are close without opening a debugger.
 */

import { meals, sides } from "@/data";

export type Protein =
  | "chicken"
  | "beef"
  | "pork"
  | "lamb"
  | "fish"
  | "seafood"
  | "egg"
  | "tofu"
  | "paneer"
  | "vegetarian"
  | "vegan";

export type SauceFamily =
  | "tomato"
  | "cream"
  | "butter"
  | "curry"
  | "soy"
  | "citrus"
  | "broth"
  | "pesto"
  | "oil"
  | "vinegar"
  | "yogurt"
  | "none";

export type Technique =
  | "grilled"
  | "fried"
  | "roasted"
  | "steamed"
  | "braised"
  | "baked"
  | "simmered"
  | "raw"
  | "stir-fried"
  | "seared"
  | "boiled";

export type Flavor =
  | "spicy"
  | "creamy"
  | "rich"
  | "fresh"
  | "smoky"
  | "tangy"
  | "sweet"
  | "umami"
  | "herby"
  | "savory";

export type Form =
  | "pasta"
  | "noodle"
  | "rice"
  | "soup"
  | "salad"
  | "sandwich"
  | "pizza"
  | "bread"
  | "wrap"
  | "stew"
  | "bowl"
  | "plate";

export type DairyLevel = "heavy" | "light" | "none";

export interface DishTaxonomy {
  id: string;
  name: string;
  aliases: string[];
  cuisine: string;
  proteins: Protein[];
  sauces: SauceFamily[];
  techniques: Technique[];
  flavors: Flavor[];
  forms: Form[];
  dairy: DairyLevel;
  isMeal: boolean;
  /** Normalized keyword bag  -  used by the query matcher. */
  keywords: string[];
}

// --- Synonym + keyword tables ------------------------------------------------

const PROTEIN_WORDS: Record<Protein, string[]> = {
  chicken: ["chicken", "poultry", "hen", "murgh", "chook"],
  beef: ["beef", "steak", "brisket", "short rib", "bulgogi", "bolognese"],
  pork: ["pork", "bacon", "pancetta", "guanciale", "prosciutto", "ham"],
  lamb: ["lamb", "mutton"],
  fish: ["salmon", "cod", "tuna", "mackerel", "trout", "sea bass", "tilapia"],
  seafood: [
    "shrimp",
    "prawn",
    "scallop",
    "crab",
    "squid",
    "calamari",
    "mussel",
    "clam",
    "oyster",
  ],
  egg: ["egg", "frittata", "omelette", "carbonara"],
  tofu: ["tofu", "bean curd"],
  paneer: ["paneer"],
  vegetarian: ["paneer", "tofu", "egg"],
  vegan: [],
};

const SAUCE_WORDS: Record<SauceFamily, string[]> = {
  tomato: [
    "tomato",
    "marinara",
    "arrabbiata",
    "napoletana",
    "pomodoro",
    "bolognese",
    "pizzaiola",
    "tikka masala",
    "makhani",
  ],
  cream: [
    "alfredo",
    "carbonara",
    "cream",
    "béchamel",
    "bechamel",
    "white sauce",
    "cheese sauce",
    "cream of",
    "korma",
  ],
  butter: ["butter chicken", "makhani", "beurre blanc", "brown butter"],
  curry: [
    "curry",
    "masala",
    "vindaloo",
    "rogan josh",
    "korma",
    "jalfrezi",
    "madras",
    "green curry",
    "red curry",
  ],
  soy: ["soy", "teriyaki", "tamari", "ponzu", "shoyu"],
  citrus: ["lemon", "lime", "yuzu", "ponzu", "ceviche"],
  broth: [
    "broth",
    "soup",
    "stock",
    "ramen",
    "pho",
    "consommé",
    "bouillabaisse",
  ],
  pesto: ["pesto"],
  oil: ["aglio e olio", "olive oil"],
  vinegar: ["vinaigrette", "balsamic", "pickled", "adobo"],
  yogurt: ["raita", "tzatziki", "tikka"],
  none: [],
};

const TECHNIQUE_WORDS: Record<Technique, string[]> = {
  grilled: ["grilled", "grill", "tandoori", "yakitori", "kebab"],
  fried: ["fried", "fry", "katsu", "schnitzel", "crispy", "tempura"],
  roasted: ["roast", "roasted"],
  steamed: ["steamed", "steam"],
  braised: ["braised", "braise", "birria", "ossobuco"],
  baked: ["baked", "bake", "lasagna", "casserole"],
  simmered: ["simmered", "stew", "chili", "curry"],
  raw: ["raw", "sashimi", "ceviche", "tartare", "carpaccio", "salad"],
  "stir-fried": ["stir fry", "stir-fry", "stir-fried", "wok", "chow mein"],
  seared: ["seared", "pan-seared", "blackened"],
  boiled: ["boiled", "poached"],
};

const FLAVOR_WORDS: Record<Flavor, string[]> = {
  spicy: [
    "spicy",
    "chili",
    "chilli",
    "hot",
    "vindaloo",
    "sichuan",
    "szechuan",
    "piri",
    "harissa",
  ],
  creamy: [
    "cream",
    "creamy",
    "alfredo",
    "carbonara",
    "korma",
    "makhani",
    "butter",
  ],
  rich: ["rich", "buttery", "decadent", "indulgent", "ragu", "braised"],
  fresh: ["fresh", "bright", "herby", "salad", "ceviche", "caprese"],
  smoky: ["smoky", "smoked", "grilled", "bbq", "chipotle"],
  tangy: ["tangy", "sour", "lemon", "lime", "vinegar", "pickled", "tzatziki"],
  sweet: ["sweet", "honey", "glaze", "teriyaki", "bourbon"],
  umami: ["umami", "mushroom", "soy", "miso", "parmesan", "anchovy"],
  herby: [
    "herb",
    "herby",
    "basil",
    "cilantro",
    "dill",
    "parsley",
    "thyme",
    "oregano",
    "mint",
  ],
  savory: ["savory", "savoury"],
};

const FORM_WORDS: Record<Form, string[]> = {
  pasta: [
    "pasta",
    "spaghetti",
    "fettuccine",
    "penne",
    "linguine",
    "rigatoni",
    "lasagna",
    "macaroni",
    "carbonara",
    "alfredo",
    "bolognese",
    "ravioli",
    "gnocchi",
  ],
  noodle: [
    "noodle",
    "ramen",
    "pho",
    "udon",
    "soba",
    "pad thai",
    "lo mein",
    "chow mein",
    "pad see ew",
  ],
  rice: [
    "rice",
    "risotto",
    "biryani",
    "paella",
    "pilaf",
    "fried rice",
    "bibimbap",
    "jambalaya",
  ],
  soup: ["soup", "broth", "chowder", "bisque", "stew", "chili", "gumbo"],
  salad: ["salad", "caesar", "cobb", "caprese", "niçoise", "slaw"],
  sandwich: [
    "sandwich",
    "banh mi",
    "burger",
    "panini",
    "grilled cheese",
    "sub",
  ],
  pizza: ["pizza", "flatbread", "focaccia", "calzone"],
  bread: ["bread", "naan", "roti", "paratha", "focaccia", "garlic bread"],
  wrap: ["wrap", "burrito", "taco", "quesadilla", "shawarma", "gyro"],
  stew: ["stew", "chili", "gumbo", "tagine", "cassoulet", "braise"],
  bowl: ["bowl", "bibimbap", "buddha bowl", "poke", "donburi"],
  plate: [],
};

function matchAny(haystack: string, needles: string[]): boolean {
  for (const n of needles) {
    if (!n) continue;
    if (haystack.includes(n)) return true;
  }
  return false;
}

function pickMatches<K extends string>(
  haystack: string,
  table: Record<K, string[]>,
): K[] {
  const out: K[] = [];
  for (const key of Object.keys(table) as K[]) {
    if (matchAny(haystack, table[key])) out.push(key);
  }
  return out;
}

function deriveDairy(haystack: string): DairyLevel {
  if (
    /butter|cream|cheese|paneer|milk|yogurt|ricotta|mozzarella|parmesan|mascarpone|ghee|alfredo|carbonara|makhani|korma|bechamel/.test(
      haystack,
    )
  ) {
    return "heavy";
  }
  if (/tzatziki|raita|feta|yogurt/.test(haystack)) return "light";
  return "none";
}

function buildKeywords(
  name: string,
  aliases: string[],
  description: string,
  tags: string[],
): string[] {
  const tokens = new Set<string>();
  const push = (s: string) => {
    for (const tok of s
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter(Boolean)) {
      if (tok.length >= 3) tokens.add(tok);
    }
  };
  push(name);
  for (const a of aliases) push(a);
  push(description);
  for (const t of tags) push(t);
  return [...tokens];
}

function buildTaxonomyEntry(args: {
  id: string;
  name: string;
  aliases: string[];
  cuisine: string;
  description: string;
  tags: string[];
  isMeal: boolean;
}): DishTaxonomy {
  const haystack = [args.name, ...args.aliases, args.description, ...args.tags]
    .join(" ")
    .toLowerCase();

  return {
    id: args.id,
    name: args.name,
    aliases: args.aliases,
    cuisine: args.cuisine,
    proteins: pickMatches(haystack, PROTEIN_WORDS),
    sauces: pickMatches(haystack, SAUCE_WORDS),
    techniques: pickMatches(haystack, TECHNIQUE_WORDS),
    flavors: pickMatches(haystack, FLAVOR_WORDS),
    forms: pickMatches(haystack, FORM_WORDS),
    dairy: deriveDairy(haystack),
    isMeal: args.isMeal,
    keywords: buildKeywords(
      args.name,
      args.aliases,
      args.description,
      args.tags,
    ),
  };
}

// --- Public API --------------------------------------------------------------

let cachedIndex: DishTaxonomy[] | null = null;

/** Build (and memoise) the full dish taxonomy index across meals + sides. */
export function getDishTaxonomyIndex(): DishTaxonomy[] {
  if (cachedIndex) return cachedIndex;

  const index: DishTaxonomy[] = [];

  for (const meal of meals) {
    index.push(
      buildTaxonomyEntry({
        id: meal.id,
        name: meal.name,
        aliases: meal.aliases ?? [],
        cuisine: meal.cuisine,
        description: meal.description ?? "",
        tags: [],
        isMeal: true,
      }),
    );
  }

  for (const side of sides) {
    index.push(
      buildTaxonomyEntry({
        id: side.id,
        name: side.name,
        aliases: [],
        cuisine:
          side.tags.find((t) =>
            /italian|indian|japanese|korean|thai|chinese|mexican|mediterranean|vietnamese|filipino|american/.test(
              t.toLowerCase(),
            ),
          ) ?? "Classic",
        description: side.description ?? "",
        tags: side.tags,
        isMeal: false,
      }),
    );
  }

  cachedIndex = index;
  return index;
}

/** Reset the memoised index  -  exported for tests. */
export function _resetTaxonomyCache(): void {
  cachedIndex = null;
}

/** Parse a freeform query string into the same tag shape as a dish entry.
 *  This lets us score query-vs-dish on the same axes. */
export function parseQueryTaxonomy(query: string): Omit<
  DishTaxonomy,
  "id" | "name" | "aliases" | "cuisine" | "isMeal" | "keywords"
> & {
  keywords: string[];
} {
  const haystack = query.toLowerCase();
  return {
    proteins: pickMatches(haystack, PROTEIN_WORDS),
    sauces: pickMatches(haystack, SAUCE_WORDS),
    techniques: pickMatches(haystack, TECHNIQUE_WORDS),
    flavors: pickMatches(haystack, FLAVOR_WORDS),
    forms: pickMatches(haystack, FORM_WORDS),
    dairy: deriveDairy(haystack),
    keywords: haystack.split(/[^a-z]+/).filter((t) => t.length >= 3),
  };
}
