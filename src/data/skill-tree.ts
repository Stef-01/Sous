/**
 * Skill Tree — Sous cooking progression system.
 *
 * Three tiers:
 *   1. Foundation — core cooking fundamentals (linear path)
 *   2. Intermediate — bridging skills (slight branching)
 *   3. Specialization — cuisine-specific mastery (branches)
 *
 * Positions use a coordinate system: x (0–100), y (row index).
 * The visual tree renders nodes in an S-curve winding pattern.
 */

export interface SkillNode {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tier: "foundation" | "intermediate" | "specialization";
  cuisineFamily?: string;
  requiredSkills: string[];
  associatedDishes: string[];
  cooksRequired: number;
  /** x: 0–100 horizontal position, y: row index for vertical ordering */
  position: { x: number; y: number };
}

export type SkillNodeStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

// ── Tier 1: Foundation ──────────────────────────────────────

const foundation: SkillNode[] = [
  {
    id: "knife-basics",
    name: "Knife Basics",
    emoji: "🔪",
    description:
      "Learn to chop, dice, and mince with confidence. The foundation of every great cook.",
    tier: "foundation",
    requiredSkills: [],
    associatedDishes: ["caesar-salad", "tabbouleh", "pico-de-gallo"],
    cooksRequired: 2,
    position: { x: 50, y: 0 },
  },
  {
    id: "heat-control",
    name: "Heat Control",
    emoji: "🔥",
    description:
      "Master sauteing, boiling, and simmering. Know when to crank up the heat and when to back off.",
    tier: "foundation",
    requiredSkills: ["knife-basics"],
    associatedDishes: ["garlic-bread", "tomato-soup", "miso-soup"],
    cooksRequired: 2,
    position: { x: 30, y: 1 },
  },
  {
    id: "seasoning-101",
    name: "Seasoning 101",
    emoji: "🧂",
    description:
      "Salt, pepper, herbs, and spices — learn to season with purpose, not guesswork.",
    tier: "foundation",
    requiredSkills: ["heat-control"],
    associatedDishes: ["guacamole", "raita", "hummus"],
    cooksRequired: 2,
    position: { x: 70, y: 2 },
  },
  {
    id: "fresh-and-raw",
    name: "Fresh & Raw",
    emoji: "🥗",
    description:
      "Salads, dressings, and cold preparations. Fresh flavors that brighten any plate.",
    tier: "foundation",
    requiredSkills: ["seasoning-101"],
    associatedDishes: [
      "caesar-salad",
      "mixed-green-salad",
      "papaya-salad",
      "fattoush",
    ],
    cooksRequired: 2,
    position: { x: 35, y: 3 },
  },
  {
    id: "sauce-craft",
    name: "Sauce Craft",
    emoji: "🥄",
    description:
      "Basic sauces and emulsions. From vinaigrettes to pan sauces, the skill that ties dishes together.",
    tier: "foundation",
    requiredSkills: ["fresh-and-raw"],
    associatedDishes: ["guacamole", "baba-ganoush", "mango-chutney"],
    cooksRequired: 2,
    position: { x: 65, y: 4 },
  },
  {
    id: "grain-mastery",
    name: "Grain Mastery",
    emoji: "🍚",
    description:
      "Rice, pasta, bread basics. The backbone of meals across every cuisine.",
    tier: "foundation",
    requiredSkills: ["sauce-craft"],
    associatedDishes: [
      "basmati-rice",
      "mexican-rice",
      "garlic-bread",
      "naan-bread",
    ],
    cooksRequired: 2,
    position: { x: 30, y: 5 },
  },
  {
    id: "protein-prep",
    name: "Protein Prep",
    emoji: "🥩",
    description:
      "Handling meat, fish, and tofu. Marinating, searing, and knowing when it's done.",
    tier: "foundation",
    requiredSkills: ["grain-mastery"],
    associatedDishes: ["gyoza", "satay", "tempura", "samosa"],
    cooksRequired: 2,
    position: { x: 70, y: 6 },
  },
  {
    id: "plating-finish",
    name: "Plating & Finish",
    emoji: "🍽️",
    description:
      "Assembly, garnish, and presentation. Make your food look as good as it tastes.",
    tier: "foundation",
    requiredSkills: ["protein-prep"],
    associatedDishes: ["bruschetta", "caprese-salad", "edamame"],
    cooksRequired: 2,
    position: { x: 50, y: 7 },
  },
];

// ── Tier 2: Intermediate ────────────────────────────────────

const intermediate: SkillNode[] = [
  {
    id: "flavor-pairing",
    name: "Flavor Pairing",
    emoji: "🎨",
    description:
      "Understand complementary and contrasting flavors. Build plates that sing.",
    tier: "intermediate",
    requiredSkills: ["plating-finish"],
    associatedDishes: [
      "tabbouleh",
      "kimchi",
      "lotus-root-salad",
      "elote",
    ],
    cooksRequired: 3,
    position: { x: 30, y: 9 },
  },
  {
    id: "timing-flow",
    name: "Timing & Flow",
    emoji: "⏱️",
    description:
      "Coordinate multi-component meals so everything lands hot and on time.",
    tier: "intermediate",
    requiredSkills: ["plating-finish"],
    associatedDishes: ["tom-yum-soup", "minestrone", "congee"],
    cooksRequired: 3,
    position: { x: 70, y: 9 },
  },
  {
    id: "one-pot-wonders",
    name: "One-Pot Wonders",
    emoji: "🥘",
    description:
      "Efficient cooking techniques — stews, braises, and one-pan meals.",
    tier: "intermediate",
    requiredSkills: ["flavor-pairing"],
    associatedDishes: ["tomato-soup", "pinakbet", "ginisang-munggo"],
    cooksRequired: 3,
    position: { x: 25, y: 10 },
  },
  {
    id: "global-pantry",
    name: "Global Pantry",
    emoji: "🌍",
    description:
      "Core ingredients across world cuisines. Stock your pantry for any adventure.",
    tier: "intermediate",
    requiredSkills: ["timing-flow"],
    associatedDishes: ["spring-rolls", "bao-buns", "naan-bread"],
    cooksRequired: 3,
    position: { x: 75, y: 10 },
  },
];

// ── Tier 3: Cuisine Specializations ─────────────────────────

const specializations: SkillNode[] = [
  {
    id: "italian-mastery",
    name: "Italian Mastery",
    emoji: "🇮🇹",
    description:
      "Master the art of Italian cooking — fresh pastas, rich sauces, and elegant simplicity.",
    tier: "specialization",
    cuisineFamily: "italian",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "caesar-salad",
      "garlic-bread",
      "bruschetta",
      "minestrone",
      "caprese-salad",
    ],
    cooksRequired: 4,
    position: { x: 15, y: 12 },
  },
  {
    id: "japanese-precision",
    name: "Japanese Precision",
    emoji: "🇯🇵",
    description:
      "Precise cuts, clean flavors, and presentation mastery. The way of Japanese cooking.",
    tier: "specialization",
    cuisineFamily: "japanese",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "gyoza",
      "edamame",
      "tempura",
      "miso-soup",
      "takoyaki",
    ],
    cooksRequired: 4,
    position: { x: 40, y: 12 },
  },
  {
    id: "indian-spice-road",
    name: "Indian Spice Road",
    emoji: "🇮🇳",
    description:
      "Spice blending, slow cooking, and bold flavors. Journey through India's regional cuisines.",
    tier: "specialization",
    cuisineFamily: "indian",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "naan-bread",
      "basmati-rice",
      "raita",
      "samosa",
      "mango-chutney",
    ],
    cooksRequired: 4,
    position: { x: 65, y: 12 },
  },
  {
    id: "mexican-fiesta",
    name: "Mexican Fiesta",
    emoji: "🇲🇽",
    description:
      "Fresh salsas, bold spices, and vibrant plates. The heart of Mexican cooking.",
    tier: "specialization",
    cuisineFamily: "mexican",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "guacamole",
      "mexican-rice",
      "elote",
      "pico-de-gallo",
      "refried-beans",
    ],
    cooksRequired: 4,
    position: { x: 85, y: 12 },
  },
  {
    id: "thai-balance",
    name: "Thai Balance",
    emoji: "🇹🇭",
    description:
      "Sweet, sour, salty, spicy — the four pillars of Thai flavor harmony.",
    tier: "specialization",
    cuisineFamily: "thai",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "spring-rolls",
      "tom-yum-soup",
      "papaya-salad",
      "satay",
      "thai-iced-tea",
    ],
    cooksRequired: 4,
    position: { x: 15, y: 14 },
  },
  {
    id: "korean-craft",
    name: "Korean Craft",
    emoji: "🇰🇷",
    description:
      "Fermentation, bold marinades, and communal dining. The soul of Korean cooking.",
    tier: "specialization",
    cuisineFamily: "korean",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "kimchi",
      "korean-pancake",
      "japchae",
      "mandu",
      "bean-sprout-salad",
    ],
    cooksRequired: 4,
    position: { x: 40, y: 14 },
  },
  {
    id: "mediterranean-sun",
    name: "Mediterranean Sun",
    emoji: "🌊",
    description:
      "Olive oil, fresh herbs, and sun-ripened produce. The diet that's also a lifestyle.",
    tier: "specialization",
    cuisineFamily: "mediterranean",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "hummus",
      "tabbouleh",
      "baba-ganoush",
      "fattoush",
      "stuffed-grape-leaves",
    ],
    cooksRequired: 4,
    position: { x: 65, y: 14 },
  },
  {
    id: "chinese-wok",
    name: "Chinese Wok",
    emoji: "🇨🇳",
    description:
      "Wok hei, dim sum, and the art of stir-fry. Thousands of years of culinary wisdom.",
    tier: "specialization",
    cuisineFamily: "chinese",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "bao-buns",
      "crispy-wontons",
      "congee",
      "sesame-balls",
      "turnip-cake",
    ],
    cooksRequired: 4,
    position: { x: 85, y: 14 },
  },
  {
    id: "vietnamese-fresh",
    name: "Vietnamese Fresh",
    emoji: "🇻🇳",
    description:
      "Fresh herbs, delicate broths, and the balance of five elements in every dish.",
    tier: "specialization",
    cuisineFamily: "vietnamese",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "banh-mi",
      "summer-rolls",
      "lotus-root-salad",
      "goi-cuon",
      "vietnamese-coffee",
    ],
    cooksRequired: 4,
    position: { x: 30, y: 16 },
  },
  {
    id: "filipino-home",
    name: "Filipino Home",
    emoji: "🇵🇭",
    description:
      "Hearty, soulful dishes rooted in family tradition. The warmth of Filipino cooking.",
    tier: "specialization",
    cuisineFamily: "filipino",
    requiredSkills: ["one-pot-wonders", "global-pantry"],
    associatedDishes: [
      "ensaladang-talong",
      "atchara",
      "pinakbet",
      "ginisang-munggo",
      "tortang-talong",
    ],
    cooksRequired: 4,
    position: { x: 70, y: 16 },
  },
];

// ── Exports ─────────────────────────────────────────────────

export const skillTreeNodes: SkillNode[] = [
  ...foundation,
  ...intermediate,
  ...specializations,
];

/** Look up a node by ID */
export function getSkillNode(id: string): SkillNode | undefined {
  return skillTreeNodes.find((n) => n.id === id);
}

/** Get all nodes grouped by tier */
export function getNodesByTier() {
  return {
    foundation: skillTreeNodes.filter((n) => n.tier === "foundation"),
    intermediate: skillTreeNodes.filter((n) => n.tier === "intermediate"),
    specialization: skillTreeNodes.filter((n) => n.tier === "specialization"),
  };
}

/** XP values per tier */
export const XP_PER_COOK = {
  foundation: 10,
  intermediate: 15,
  specialization: 25,
} as const;

/** Compute level from total XP */
export function computeLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}
