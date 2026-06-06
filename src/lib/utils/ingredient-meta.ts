/**
 * ingredient-meta — classify a grocery item by name into an aisle category and
 * a food emoji, so the shopping list can group items under aisle headers and
 * give every row a visual anchor. Pure, keyword-based, deterministic. Unknown
 * items fall back to the "Other" aisle + a basket emoji.
 */

export type GroceryCategory =
  | "Produce"
  | "Meat & Seafood"
  | "Dairy & Eggs"
  | "Bakery"
  | "Pantry"
  | "Spices & Herbs"
  | "Frozen"
  | "Other";

/** Aisle display order (Produce first, Other last). */
export const GROCERY_CATEGORY_ORDER: readonly GroceryCategory[] = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Spices & Herbs",
  "Frozen",
  "Other",
];

const CATEGORY_FALLBACK_EMOJI: Record<GroceryCategory, string> = {
  Produce: "🥬",
  "Meat & Seafood": "🥩",
  "Dairy & Eggs": "🥛",
  Bakery: "🥖",
  Pantry: "🥫",
  "Spices & Herbs": "🌿",
  Frozen: "🧊",
  Other: "🧺",
};

/** [keyword, category, emoji] — first substring match wins (order matters: put
 *  more specific terms before generic ones, e.g. "olive oil" before "olive"). */
const RULES: ReadonlyArray<[string, GroceryCategory, string]> = [
  // Spices, sauces, oils, condiments (check before produce so "garlic powder"
  // ≠ produce, "chili flakes" ≠ produce).
  ["olive oil", "Pantry", "🫒"],
  ["sesame oil", "Pantry", "🪔"],
  ["vegetable oil", "Pantry", "🛢️"],
  ["fish sauce", "Pantry", "🐟"],
  ["soy sauce", "Pantry", "🍶"],
  ["oyster sauce", "Pantry", "🦪"],
  ["hoisin", "Pantry", "🥫"],
  ["tomato paste", "Pantry", "🥫"],
  ["vinegar", "Pantry", "🧴"],
  ["oil", "Pantry", "🛢️"],
  ["salt", "Spices & Herbs", "🧂"],
  ["pepper", "Spices & Herbs", "🧂"],
  ["sugar", "Pantry", "🍬"],
  ["honey", "Pantry", "🍯"],
  ["cinnamon", "Spices & Herbs", "🌿"],
  ["oregano", "Spices & Herbs", "🌿"],
  ["cumin", "Spices & Herbs", "🌿"],
  ["paprika", "Spices & Herbs", "🌶️"],
  ["turmeric", "Spices & Herbs", "🌿"],
  ["curry", "Spices & Herbs", "🌿"],
  ["spice", "Spices & Herbs", "🌿"],
  ["cilantro", "Spices & Herbs", "🌿"],
  ["basil", "Spices & Herbs", "🌿"],
  ["mint", "Spices & Herbs", "🌿"],
  ["parsley", "Spices & Herbs", "🌿"],
  ["lemongrass", "Spices & Herbs", "🌿"],
  ["herb", "Spices & Herbs", "🌿"],
  // Produce
  ["tomato", "Produce", "🍅"],
  ["onion", "Produce", "🧅"],
  ["shallot", "Produce", "🧅"],
  ["garlic", "Produce", "🧄"],
  ["ginger", "Produce", "🫚"],
  ["potato", "Produce", "🥔"],
  ["carrot", "Produce", "🥕"],
  ["daikon", "Produce", "🥕"],
  ["broccoli", "Produce", "🥦"],
  ["lettuce", "Produce", "🥬"],
  ["cabbage", "Produce", "🥬"],
  ["spinach", "Produce", "🥬"],
  ["greens", "Produce", "🥬"],
  ["bell pepper", "Produce", "🫑"],
  ["chili", "Produce", "🌶️"],
  ["jalapeno", "Produce", "🌶️"],
  ["avocado", "Produce", "🥑"],
  ["lemon", "Produce", "🍋"],
  ["lime", "Produce", "🍋"],
  ["mushroom", "Produce", "🍄"],
  ["corn", "Produce", "🌽"],
  ["cucumber", "Produce", "🥒"],
  ["eggplant", "Produce", "🍆"],
  ["banana", "Produce", "🍌"],
  ["apple", "Produce", "🍎"],
  ["scallion", "Produce", "🌿"],
  ["green onion", "Produce", "🌿"],
  ["taro", "Produce", "🥔"],
  // Meat & seafood
  ["chicken", "Meat & Seafood", "🍗"],
  ["beef", "Meat & Seafood", "🥩"],
  ["steak", "Meat & Seafood", "🥩"],
  ["pork", "Meat & Seafood", "🥓"],
  ["bacon", "Meat & Seafood", "🥓"],
  ["turkey", "Meat & Seafood", "🦃"],
  ["sausage", "Meat & Seafood", "🌭"],
  ["salmon", "Meat & Seafood", "🐟"],
  ["fish", "Meat & Seafood", "🐟"],
  ["shrimp", "Meat & Seafood", "🦐"],
  ["prawn", "Meat & Seafood", "🦐"],
  ["squid", "Meat & Seafood", "🦑"],
  ["crab", "Meat & Seafood", "🦀"],
  ["tofu", "Meat & Seafood", "🧊"],
  // Dairy & eggs
  ["egg", "Dairy & Eggs", "🥚"],
  ["milk", "Dairy & Eggs", "🥛"],
  ["cheese", "Dairy & Eggs", "🧀"],
  ["parmesan", "Dairy & Eggs", "🧀"],
  ["mozzarella", "Dairy & Eggs", "🧀"],
  ["butter", "Dairy & Eggs", "🧈"],
  ["yogurt", "Dairy & Eggs", "🥛"],
  ["cream", "Dairy & Eggs", "🥛"],
  ["mascarpone", "Dairy & Eggs", "🧀"],
  // Bakery / grains
  ["baguette", "Bakery", "🥖"],
  ["bread", "Bakery", "🍞"],
  ["roll", "Bakery", "🥖"],
  ["croissant", "Bakery", "🥐"],
  ["tortilla", "Bakery", "🫓"],
  ["ladyfinger", "Bakery", "🍰"],
  // Pantry / dry goods
  ["rice", "Pantry", "🍚"],
  ["noodle", "Pantry", "🍜"],
  ["pasta", "Pantry", "🍝"],
  ["spaghetti", "Pantry", "🍝"],
  ["vermicelli", "Pantry", "🍜"],
  ["flour", "Pantry", "🌾"],
  ["bean", "Pantry", "🫘"],
  ["chickpea", "Pantry", "🫘"],
  ["lentil", "Pantry", "🫘"],
  ["peanut", "Pantry", "🥜"],
  ["sesame", "Pantry", "🌰"],
  ["coconut", "Pantry", "🥥"],
  ["stock", "Pantry", "🥫"],
  ["broth", "Pantry", "🥫"],
  ["boba", "Pantry", "🧋"],
  ["coffee", "Pantry", "☕"],
];

function norm(name: string): string {
  return name.trim().toLowerCase();
}

/** Classify an item name into an aisle category. */
export function ingredientCategory(name: string): GroceryCategory {
  const n = norm(name);
  for (const [kw, cat] of RULES) if (n.includes(kw)) return cat;
  return "Other";
}

/** Pick a food emoji for an item name (falls back to its aisle's emoji). */
export function ingredientEmoji(name: string): string {
  const n = norm(name);
  for (const [kw, , emoji] of RULES) if (n.includes(kw)) return emoji;
  return CATEGORY_FALLBACK_EMOJI[ingredientCategory(name)];
}
