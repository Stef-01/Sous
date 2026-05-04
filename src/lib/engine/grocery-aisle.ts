/**
 * Grocery aisle classifier — maps ingredient names to store sections.
 * Used on the Grab screen to group ingredients by aisle for easier shopping.
 *
 * Mealime's insight: grouping by store section makes the list feel manageable
 * and reduces the cognitive load of a flat ingredient list.
 */

export type GroceryAisle =
  | "produce"
  | "protein"
  | "dairy"
  | "pantry"
  | "spices"
  | "grains"
  | "canned"
  | "frozen"
  | "other";

export interface GroceryAisleInfo {
  id: GroceryAisle;
  label: string;
  emoji: string;
}

export const AISLE_INFO: Record<GroceryAisle, GroceryAisleInfo> = {
  produce: { id: "produce", label: "Produce", emoji: "🥬" },
  protein: { id: "protein", label: "Protein", emoji: "🥩" },
  dairy: { id: "dairy", label: "Dairy & Eggs", emoji: "🧈" },
  pantry: { id: "pantry", label: "Pantry", emoji: "🫙" },
  spices: { id: "spices", label: "Spices & Seasonings", emoji: "🧂" },
  grains: { id: "grains", label: "Grains & Bread", emoji: "🍞" },
  canned: { id: "canned", label: "Canned & Jarred", emoji: "🥫" },
  frozen: { id: "frozen", label: "Frozen", emoji: "🧊" },
  other: { id: "other", label: "Other", emoji: "🛒" },
};

/** Display order for aisles (matches a typical store walk-through). */
export const AISLE_ORDER: GroceryAisle[] = [
  "produce",
  "protein",
  "dairy",
  "grains",
  "canned",
  "pantry",
  "spices",
  "frozen",
  "other",
];

// ── Keyword maps ──────────────────────────────────────────────────────────────

const PRODUCE_KEYWORDS = [
  "lettuce", "tomato", "onion", "garlic", "ginger", "pepper", "chili",
  "cilantro", "parsley", "basil", "mint", "dill", "thyme", "rosemary",
  "oregano", "scallion", "green onion", "spring onion", "shallot",
  "carrot", "celery", "cucumber", "zucchini", "squash", "potato",
  "sweet potato", "broccoli", "cauliflower", "spinach", "kale",
  "cabbage", "mushroom", "corn", "avocado", "lemon", "lime", "orange",
  "apple", "banana", "berry", "berries", "mango", "pineapple",
  "coconut", "eggplant", "aubergine", "beet", "radish", "turnip",
  "asparagus", "artichoke", "leek", "fennel", "watercress", "arugula",
  "bok choy", "bean sprout", "snap pea", "snow pea", "green bean",
  "jalapeño", "serrano", "habanero", "poblano", "bell pepper",
  "fresh herb", "lemongrass", "galangal", "thai basil", "curry leaves",
  "pea", "okra",
];

const PROTEIN_KEYWORDS = [
  "chicken", "beef", "pork", "lamb", "turkey", "duck", "fish", "salmon",
  "tuna", "shrimp", "prawn", "crab", "lobster", "scallop", "mussel",
  "clam", "squid", "calamari", "tofu", "tempeh", "seitan",
  "ground meat", "steak", "breast", "thigh", "drumstick", "wing",
  "bacon", "sausage", "ham", "anchovy", "sardine", "cod", "tilapia",
  "halibut", "mahi", "snapper", "paneer",
];

const DAIRY_KEYWORDS = [
  "milk", "cream", "butter", "cheese", "yogurt", "yoghurt", "sour cream",
  "egg", "eggs", "mozzarella", "parmesan", "cheddar", "feta",
  "ricotta", "gouda", "brie", "cream cheese", "mascarpone",
  "half and half", "heavy cream", "whipping cream", "ghee",
  "buttermilk", "crème fraîche",
];

const SPICE_KEYWORDS = [
  "salt", "pepper", "cumin", "coriander", "turmeric", "paprika",
  "cayenne", "cinnamon", "nutmeg", "clove", "cardamom", "star anise",
  "bay leaf", "bay leaves", "chili powder", "chili flakes",
  "red pepper flakes", "black pepper", "white pepper",
  "garam masala", "curry powder", "five spice", "za'atar",
  "sumac", "saffron", "mustard seed", "fennel seed", "fenugreek",
  "dried oregano", "dried thyme", "dried basil", "dried parsley",
  "onion powder", "garlic powder", "smoked paprika", "allspice",
  "msg", "seasoning",
];

const GRAIN_KEYWORDS = [
  "rice", "pasta", "noodle", "bread", "flour", "tortilla", "pita",
  "naan", "couscous", "quinoa", "oat", "barley", "bulgur",
  "farro", "polenta", "cornmeal", "panko", "breadcrumb",
  "ramen", "udon", "soba", "vermicelli", "lasagna", "spaghetti",
  "penne", "fusilli", "macaroni", "linguine", "fettuccine",
  "wrap", "bun", "roll",
];

const CANNED_KEYWORDS = [
  "canned", "tinned", "tomato paste", "tomato sauce", "crushed tomato",
  "diced tomato", "coconut milk", "coconut cream", "bean", "chickpea",
  "lentil", "broth", "stock", "bouillon", "paste", "jam",
  "peanut butter", "almond butter", "tahini", "harissa",
  "chipotle in adobo", "salsa",
];

const PANTRY_KEYWORDS = [
  "oil", "olive oil", "vegetable oil", "sesame oil", "coconut oil",
  "vinegar", "soy sauce", "fish sauce", "oyster sauce", "hoisin",
  "worcestershire", "hot sauce", "sriracha", "ketchup", "mustard",
  "mayo", "mayonnaise", "honey", "maple syrup", "sugar",
  "brown sugar", "powdered sugar", "cornstarch", "baking powder",
  "baking soda", "vanilla", "extract", "wine", "mirin", "sake",
  "sherry", "marsala", "nut", "almond", "walnut", "cashew",
  "pine nut", "sesame seed", "sunflower seed", "pumpkin seed",
  "dried fruit", "raisin", "date", "chocolate", "cocoa",
];

const FROZEN_KEYWORDS = [
  "frozen", "ice cream", "ice",
];

function matchesAny(name: string, keywords: string[]): boolean {
  const lower = name.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Classify an ingredient name into a grocery store aisle.
 * Uses keyword matching with priority ordering — more specific categories
 * (spices, dairy) are checked before broad ones (pantry, other).
 */
export function classifyAisle(ingredientName: string): GroceryAisle {
  const name = ingredientName.toLowerCase().trim();
  if (!name) return "other";

  // Check in priority order (most specific first)
  if (matchesAny(name, SPICE_KEYWORDS)) return "spices";
  if (matchesAny(name, DAIRY_KEYWORDS)) return "dairy";
  if (matchesAny(name, PROTEIN_KEYWORDS)) return "protein";
  if (matchesAny(name, FROZEN_KEYWORDS)) return "frozen";
  if (matchesAny(name, CANNED_KEYWORDS)) return "canned";
  if (matchesAny(name, GRAIN_KEYWORDS)) return "grains";
  if (matchesAny(name, PRODUCE_KEYWORDS)) return "produce";
  if (matchesAny(name, PANTRY_KEYWORDS)) return "pantry";

  return "other";
}

/**
 * Group a flat ingredient list by grocery aisle, maintaining display order.
 * Only returns aisles that have at least one ingredient.
 */
export function groupByAisle<T extends { name: string }>(
  ingredients: T[],
): { aisle: GroceryAisleInfo; items: T[] }[] {
  const groups = new Map<GroceryAisle, T[]>();

  for (const item of ingredients) {
    const aisle = classifyAisle(item.name);
    const arr = groups.get(aisle) ?? [];
    arr.push(item);
    groups.set(aisle, arr);
  }

  return AISLE_ORDER.filter((a) => groups.has(a)).map((a) => ({
    aisle: AISLE_INFO[a],
    items: groups.get(a)!,
  }));
}
