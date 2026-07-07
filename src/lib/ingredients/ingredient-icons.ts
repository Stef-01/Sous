export type IngredientIconFamily =
  | "protein"
  | "vegetable"
  | "fruit"
  | "dairy"
  | "grain"
  | "spice"
  | "sauce"
  | "oil"
  | "sweetener"
  | "herb"
  | "drink"
  | "pantry"
  | "unknown";

export interface IngredientIcon {
  emoji: string;
  label: string;
  family: IngredientIconFamily;
}

interface IngredientIconDefinition extends IngredientIcon {
  keywords: readonly string[];
  priority?: number;
}

const QUANTITY_WORDS = [
  "a",
  "an",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

const UNIT_WORDS = [
  "bag",
  "bunch",
  "can",
  "clove",
  "cloves",
  "cup",
  "cups",
  "dash",
  "g",
  "gram",
  "grams",
  "head",
  "kg",
  "lb",
  "lbs",
  "liter",
  "liters",
  "ml",
  "oz",
  "ounce",
  "ounces",
  "packet",
  "packets",
  "pinch",
  "piece",
  "pieces",
  "scoop",
  "scoops",
  "serving",
  "servings",
  "slice",
  "slices",
  "sprig",
  "sprigs",
  "tbsp",
  "tablespoon",
  "tablespoons",
  "tsp",
  "teaspoon",
  "teaspoons",
];

const DESCRIPTOR_WORDS = [
  "and",
  "around",
  "boneless",
  "bottled",
  "chopped",
  "cubed",
  "diced",
  "dried",
  "extra",
  "finely",
  "fresh",
  "frozen",
  "grated",
  "ground",
  "halved",
  "large",
  "lean",
  "melted",
  "minced",
  "non",
  "optional",
  "or",
  "peeled",
  "ripe",
  "roughly",
  "shaved",
  "sliced",
  "small",
  "soft",
  "split",
  "squeeze",
  "thinly",
  "toasted",
  "whole",
];

const ICON_DEFINITIONS: readonly IngredientIconDefinition[] = [
  {
    emoji: "\u{1F336}\uFE0F",
    label: "chile pepper",
    family: "spice",
    priority: 20,
    keywords: [
      "gochugaru",
      "red chili flakes",
      "chili flakes",
      "chilli flakes",
      "chili powder",
      "chilli powder",
      "red chili powder",
      "paprika",
      "cayenne",
      "sriracha",
      "hot sauce",
      "jalapeno",
      "jalape\u00f1o",
      "bird's eye chilies",
      "thai chilies",
      "green chili",
      "dried red chili",
      "chili",
      "chilli",
    ],
  },
  {
    emoji: "\u{1F9C4}",
    label: "garlic",
    family: "vegetable",
    priority: 12,
    keywords: ["garlic powder", "garlic cloves", "garlic"],
  },
  {
    emoji: "\u{1F9C5}",
    label: "onion",
    family: "vegetable",
    priority: 10,
    keywords: [
      "green onions",
      "green onion",
      "scallions",
      "scallion",
      "shallots",
      "shallot",
      "red onion",
      "white onion",
      "onion",
    ],
  },
  {
    emoji: "\u{1FADA}",
    label: "ginger",
    family: "vegetable",
    priority: 10,
    keywords: ["fresh ginger", "ginger"],
  },
  {
    emoji: "\u{1F33F}",
    label: "fresh herbs",
    family: "herb",
    priority: 8,
    keywords: [
      "cilantro",
      "coriander leaves",
      "fresh coriander",
      "parsley",
      "basil",
      "mint",
      "dill",
      "curry leaves",
      "kasuri methi",
      "fenugreek leaves",
      "fenugreek",
      "herbs",
      "herb",
    ],
  },
  {
    emoji: "\u{1F34B}",
    label: "citrus",
    family: "fruit",
    priority: 8,
    keywords: [
      "lemon juice",
      "lime juice",
      "fresh lime juice",
      "lemon wedges",
      "lemons",
      "lemon",
      "limes",
      "lime",
    ],
  },
  {
    emoji: "\u{1F345}",
    label: "tomato",
    family: "vegetable",
    priority: 10,
    keywords: [
      "tomato puree",
      "tomato paste",
      "tomato sauce",
      "canned whole tomatoes",
      "canned diced tomatoes",
      "cherry tomatoes",
      "roma tomatoes",
      "tomatoes",
      "tomato",
    ],
  },
  {
    emoji: "\u{1F951}",
    label: "avocado",
    family: "vegetable",
    keywords: ["avocados", "avocado"],
  },
  {
    emoji: "\u{1F360}",
    label: "sweet potato",
    family: "vegetable",
    priority: 12,
    keywords: ["sweet potatoes", "sweet potato", "yams", "yam"],
  },
  {
    emoji: "\u{1F954}",
    label: "potato",
    family: "vegetable",
    keywords: ["potatoes", "potato"],
  },
  {
    emoji: "\u{1F96C}",
    label: "leafy greens",
    family: "vegetable",
    keywords: [
      "romaine lettuce",
      "napa cabbage",
      "green cabbage",
      "cabbage",
      "lettuce",
      "spinach",
      "kale",
      "greens",
    ],
  },
  {
    emoji: "\u{1F955}",
    label: "carrot",
    family: "vegetable",
    keywords: ["carrots", "carrot", "radishes", "radish"],
  },
  {
    emoji: "\u{1F952}",
    label: "cucumber",
    family: "vegetable",
    priority: 6,
    keywords: [
      "english cucumber",
      "cucumber",
      "zucchini",
      "courgette",
      "pickles",
      "pickle",
    ],
  },
  {
    emoji: "\u{1F966}",
    label: "broccoli",
    family: "vegetable",
    keywords: ["broccoli", "cauliflower"],
  },
  {
    emoji: "\u{1F344}",
    label: "mushroom",
    family: "vegetable",
    keywords: ["shiitake mushrooms", "mushrooms", "mushroom"],
  },
  {
    emoji: "\u{1FAD8}",
    label: "beans",
    family: "vegetable",
    keywords: [
      "cannellini beans",
      "black beans",
      "kidney beans",
      "beans",
      "lentils",
      "dal",
      "tofu",
    ],
  },
  {
    emoji: "\u{1F969}",
    label: "beef",
    family: "protein",
    priority: 12,
    keywords: ["ground beef", "beef", "steak"],
  },
  {
    emoji: "\u{1F357}",
    label: "chicken",
    family: "protein",
    priority: 10,
    keywords: [
      "boneless chicken thighs",
      "chicken thighs",
      "chicken breast",
      "chicken",
    ],
  },
  {
    emoji: "\u{1F953}",
    label: "pork",
    family: "protein",
    keywords: ["ground pork", "guanciale", "pancetta", "bacon", "pork"],
  },
  {
    emoji: "\u{1F41F}",
    label: "fish",
    family: "protein",
    priority: 8,
    keywords: [
      "bonito flakes",
      "katsuobushi",
      "anchovy paste",
      "anchovy",
      "salmon",
      "tuna",
      "fish sauce",
      "fish",
    ],
  },
  {
    emoji: "\u{1F95A}",
    label: "egg",
    family: "protein",
    priority: 10,
    keywords: ["eggs", "egg"],
  },
  {
    emoji: "\u{1F35A}",
    label: "rice",
    family: "grain",
    priority: 10,
    keywords: [
      "short-grain japanese rice",
      "long-grain white rice",
      "basmati rice",
      "rice vinegar",
      "rice",
    ],
  },
  {
    emoji: "\u{1F35D}",
    label: "pasta",
    family: "grain",
    priority: 10,
    keywords: [
      "spaghetti",
      "glass noodles",
      "rice noodles",
      "noodles",
      "noodle",
      "small pasta",
      "pasta",
    ],
  },
  {
    emoji: "\u{1F35E}",
    label: "bread",
    family: "grain",
    priority: 8,
    keywords: [
      "bread for croutons",
      "italian bread",
      "baguette",
      "breadcrumbs",
      "bread crumbs",
      "naan",
      "pita",
      "bread",
    ],
  },
  {
    emoji: "\u{1F32F}",
    label: "flatbread",
    family: "grain",
    keywords: ["tortillas", "tortilla", "wraps", "wrap"],
  },
  {
    emoji: "\u{1F33E}",
    label: "grain or flour",
    family: "grain",
    keywords: [
      "all-purpose flour",
      "whole wheat flour",
      "flour",
      "bulgur",
      "quinoa",
      "couscous",
      "cornstarch",
      "starch",
    ],
  },
  {
    emoji: "\u{1F9C0}",
    label: "cheese",
    family: "dairy",
    priority: 10,
    keywords: [
      "parmesan cheese",
      "parmesan",
      "mozzarella",
      "cotija cheese",
      "pecorino",
      "feta",
      "cheese",
    ],
  },
  {
    emoji: "\u{1F95B}",
    label: "milk or cream",
    family: "dairy",
    priority: 6,
    keywords: ["coconut milk", "heavy cream", "cream", "milk"],
  },
  {
    emoji: "\u{1F963}",
    label: "yogurt",
    family: "dairy",
    priority: 10,
    keywords: ["greek yogurt", "yogurt", "sour cream", "mayonnaise", "mayo"],
  },
  {
    emoji: "\u{1F9C8}",
    label: "butter",
    family: "dairy",
    priority: 8,
    keywords: ["peanut butter", "ghee or butter", "ghee", "butter"],
  },
  {
    emoji: "\u{1FAD2}",
    label: "oil",
    family: "oil",
    priority: 8,
    keywords: [
      "extra virgin olive oil",
      "extra-virgin olive oil",
      "olive oil",
      "sesame oil",
      "neutral oil",
      "vegetable oil",
      "coconut oil",
      "oil",
    ],
  },
  {
    emoji: "\u{1F36F}",
    label: "honey",
    family: "sweetener",
    priority: 10,
    keywords: ["hot honey", "honey", "maple syrup"],
  },
  {
    emoji: "\u{1F36C}",
    label: "sugar",
    family: "sweetener",
    priority: 8,
    keywords: ["palm sugar", "brown sugar", "sugar"],
  },
  {
    emoji: "\u{1F9C2}",
    label: "salt and seasoning",
    family: "spice",
    priority: 8,
    keywords: [
      "garam masala",
      "sumac",
      "cumin",
      "coriander",
      "turmeric",
      "black salt",
      "flaky sea salt",
      "kosher salt",
      "salt and pepper",
      "black pepper",
      "white pepper",
      "pepper",
      "salt",
    ],
  },
  {
    emoji: "\u{1F330}",
    label: "nuts or seeds",
    family: "pantry",
    priority: 8,
    keywords: [
      "roasted peanuts",
      "peanut",
      "sesame seeds",
      "sesame",
      "mustard seeds",
      "cumin seeds",
      "seeds",
      "nuts",
    ],
  },
  {
    emoji: "\u{1F376}",
    label: "sauce or vinegar",
    family: "sauce",
    priority: 18,
    keywords: [
      "soy sauce",
      "fish sauce",
      "oyster sauce",
      "hoisin sauce",
      "balsamic glaze",
      "dijon mustard",
      "mustard",
      "worcestershire sauce",
      "apple cider vinegar",
      "rice vinegar",
      "white wine vinegar",
      "black vinegar",
      "vinegar",
      "mirin",
      "sake",
      "dashi",
      "sauce",
    ],
  },
  {
    emoji: "\u{1F372}",
    label: "stock or broth",
    family: "pantry",
    priority: 12,
    keywords: [
      "chicken or vegetable broth",
      "vegetable or chicken broth",
      "chicken broth",
      "vegetable broth",
      "dashi stock",
      "stock",
      "broth",
    ],
  },
  {
    emoji: "\u{1F96B}",
    label: "paste or pantry tin",
    family: "pantry",
    priority: 5,
    keywords: [
      "miso paste",
      "tomato puree",
      "tomato paste",
      "tahini",
      "paste",
      "canned",
    ],
  },
  {
    emoji: "\u{1F4A7}",
    label: "water",
    family: "drink",
    keywords: ["water"],
  },
  {
    emoji: "\u{1F37D}\uFE0F",
    label: "ingredient",
    family: "unknown",
    keywords: [],
  },
];

const FALLBACK_ICON = ICON_DEFINITIONS[ICON_DEFINITIONS.length - 1];

const cleanupPattern = new RegExp(
  `\\b(?:${[...QUANTITY_WORDS, ...UNIT_WORDS, ...DESCRIPTOR_WORDS].join("|")})\\b`,
  "g",
);

export const INGREDIENT_ICON_LIBRARY: readonly IngredientIcon[] =
  ICON_DEFINITIONS.map(({ emoji, label, family }) => ({
    emoji,
    label,
    family,
  }));

export function normalizeIngredientName(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u00bc]/g, " 1/4 ")
    .replace(/[\u00bd]/g, " 1/2 ")
    .replace(/[\u00be]/g, " 3/4 ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[%]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\b\d+(?:\.\d+)?\b/g, " ")
    .replace(cleanupPattern, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveIngredientIcon(input: string): IngredientIcon {
  const normalized = normalizeIngredientName(input);
  if (!normalized) return stripDefinition(FALLBACK_ICON);

  let best: { definition: IngredientIconDefinition; score: number } | null =
    null;

  for (const definition of ICON_DEFINITIONS) {
    for (const keyword of definition.keywords) {
      const normalizedKeyword = normalizeIngredientName(keyword);
      if (!normalizedKeyword) continue;
      if (!containsIngredientKeyword(normalized, normalizedKeyword)) continue;

      const score =
        normalizedKeyword.length +
        (normalized === normalizedKeyword ? 100 : 0) +
        (definition.priority ?? 0);

      if (!best || score > best.score) {
        best = { definition, score };
      }
    }
  }

  return stripDefinition(best?.definition ?? FALLBACK_ICON);
}

function containsIngredientKeyword(input: string, keyword: string): boolean {
  return ` ${input} `.includes(` ${keyword} `);
}

function stripDefinition(definition: IngredientIconDefinition): IngredientIcon {
  return {
    emoji: definition.emoji,
    label: definition.label,
    family: definition.family,
  };
}
