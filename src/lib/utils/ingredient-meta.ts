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
  ["thyme", "Spices & Herbs", "🌿"],
  ["rosemary", "Spices & Herbs", "🌿"],
  ["nutmeg", "Spices & Herbs", "🌿"],
  ["cardamom", "Spices & Herbs", "🌿"],
  ["coriander", "Spices & Herbs", "🌿"],
  ["bay leaf", "Spices & Herbs", "🌿"],
  ["garam masala", "Spices & Herbs", "🌿"],
  ["herb", "Spices & Herbs", "🌿"],
  // Spice powders/flakes — MUST precede the produce garlic/onion/ginger/chili
  // rules below, or "garlic powder" etc. get mis-filed as fresh produce.
  ["garlic powder", "Spices & Herbs", "🧄"],
  ["onion powder", "Spices & Herbs", "🧅"],
  ["chili powder", "Spices & Herbs", "🌶️"],
  ["chili flakes", "Spices & Herbs", "🌶️"],
  ["red pepper flakes", "Spices & Herbs", "🌶️"],
  ["ground ginger", "Spices & Herbs", "🫚"],
  ["ginger powder", "Spices & Herbs", "🫚"],
  // Cornstarch/cornmeal precede the produce "corn" rule for the same reason.
  ["cornstarch", "Pantry", "🌽"],
  ["cornmeal", "Pantry", "🌽"],
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
  ["mango", "Produce", "🥭"],
  ["pineapple", "Produce", "🍍"],
  ["orange", "Produce", "🍊"],
  ["strawberry", "Produce", "🍓"],
  ["blueberry", "Produce", "🫐"],
  ["raspberry", "Produce", "🫐"],
  ["berry", "Produce", "🫐"],
  ["grape", "Produce", "🍇"],
  ["peach", "Produce", "🍑"],
  ["pear", "Produce", "🍐"],
  ["cherry", "Produce", "🍒"],
  ["watermelon", "Produce", "🍉"],
  ["kiwi", "Produce", "🥝"],
  // "peas" (plural) is collision-safe vs the pantry "peanut" rule.
  ["peas", "Produce", "🫛"],
  ["mattar", "Produce", "🫛"],
  ["edamame", "Produce", "🫛"],
  ["zucchini", "Produce", "🥒"],
  ["celery", "Produce", "🥬"],
  ["kale", "Produce", "🥬"],
  ["cauliflower", "Produce", "🥦"],
  ["asparagus", "Produce", "🥬"],
  ["pumpkin", "Produce", "🎃"],
  ["beet", "Produce", "🥬"],
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
  // Nut butters are pantry, not dairy — must precede the "butter" rule below.
  ["peanut butter", "Pantry", "🥜"],
  ["almond butter", "Pantry", "🥜"],
  ["cashew butter", "Pantry", "🥜"],
  ["nut butter", "Pantry", "🥜"],
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
  // Nuts (plant-milk forms already caught by the dairy "milk" rule above).
  ["almond", "Pantry", "🌰"],
  ["walnut", "Pantry", "🌰"],
  ["cashew", "Pantry", "🌰"],
  ["pistachio", "Pantry", "🌰"],
  // Grains
  ["oats", "Pantry", "🌾"],
  ["oat", "Pantry", "🌾"],
  ["quinoa", "Pantry", "🌾"],
  ["couscous", "Pantry", "🌾"],
  ["barley", "Pantry", "🌾"],
  // Baking / sweets
  ["chocolate", "Pantry", "🍫"],
  ["cocoa", "Pantry", "🍫"],
  ["cacao", "Pantry", "🍫"],
  ["maple", "Pantry", "🍁"],
  ["vanilla", "Pantry", "🌰"],
  ["baking soda", "Pantry", "🧂"],
  ["baking powder", "Pantry", "🧂"],
  ["raisin", "Pantry", "🍇"],
  // Condiments / jars
  ["ketchup", "Pantry", "🍅"],
  ["mustard", "Pantry", "🥫"],
  ["mayo", "Pantry", "🥫"],
  ["sriracha", "Pantry", "🌶️"],
  ["miso", "Pantry", "🍲"],
  ["nori", "Pantry", "🍙"],
  ["seaweed", "Pantry", "🌿"],
  ["water", "Pantry", "💧"],
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
