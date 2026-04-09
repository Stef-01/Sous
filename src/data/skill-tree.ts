/**
 * Skill Tree — Sous cooking progression system.
 *
 * Five tiers based on real culinary school programs (Le Cordon Bleu, CIA, ICE, JWU, Escoffier):
 *   1. Foundation     — core fundamentals every cook needs
 *   2. Intermediate   — building on the basics with more technique
 *   3. Advanced       — professional-level skills
 *   4. Pre-Mastery    — capstone and creative skills
 *   5. Mastery        — branching cuisine specialization paths (parallel, not sequential)
 *
 * Positions use a coordinate system: x (0–100), y (row index).
 * Mastery nodes use placeholder positions — they render in a grid, not the tree.
 */

export interface SkillNode {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tier: "foundation" | "intermediate" | "advanced" | "pre-mastery" | "mastery";
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
    id: "knife-skills",
    name: "Knife Skills & Cuts",
    emoji: "🔪",
    description:
      "Master brunoise, julienne, chiffonade, and mince. Precise cuts cook evenly and look professional.",
    tier: "foundation",
    requiredSkills: [],
    associatedDishes: ["tabbouleh", "pico-de-gallo", "caesar-salad"],
    cooksRequired: 3,
    position: { x: 50, y: 0 },
  },
  {
    id: "mise-en-place",
    name: "Mise en Place",
    emoji: "🥡",
    description:
      "Everything in its place before you cook. Organize a stir-fry, pasta, or baking setup for stress-free cooking.",
    tier: "foundation",
    requiredSkills: ["knife-skills"],
    associatedDishes: ["stir-fried-rice", "pasta-primavera", "banana-bread"],
    cooksRequired: 2,
    position: { x: 50, y: 1 },
  },
  {
    id: "dry-heat-cooking",
    name: "Dry-Heat Cooking",
    emoji: "🔥",
    description:
      "Searing, roasting, and stir-frying — methods that develop color and crust through high heat and no added liquid.",
    tier: "foundation",
    requiredSkills: ["mise-en-place"],
    associatedDishes: [
      "pan-seared-chicken",
      "roasted-vegetables",
      "stir-fried-rice",
    ],
    cooksRequired: 3,
    position: { x: 25, y: 2 },
  },
  {
    id: "moist-heat-cooking",
    name: "Moist-Heat Cooking",
    emoji: "♨️",
    description:
      "Poaching, steaming, and simmering — gentle techniques that preserve texture and draw out flavor through liquid.",
    tier: "foundation",
    requiredSkills: ["mise-en-place"],
    associatedDishes: ["poached-eggs", "steamed-broccoli", "tomato-soup"],
    cooksRequired: 3,
    position: { x: 75, y: 2 },
  },
  {
    id: "vegetable-techniques",
    name: "Vegetable Techniques",
    emoji: "🥦",
    description:
      "Roast, blanch, and sauté vegetables with intention. Each method brings out a different character.",
    tier: "foundation",
    requiredSkills: ["dry-heat-cooking", "moist-heat-cooking"],
    associatedDishes: [
      "roasted-root-vegetables",
      "blanched-green-beans",
      "sauteed-mushrooms",
    ],
    cooksRequired: 2,
    position: { x: 25, y: 3 },
  },
  {
    id: "egg-cookery",
    name: "Egg Cookery",
    emoji: "🍳",
    description:
      "French omelettes, soft-boiled eggs, scrambled eggs, and frittata — eggs reveal the precision of a cook's hand.",
    tier: "foundation",
    requiredSkills: ["dry-heat-cooking"],
    associatedDishes: [
      "french-omelette",
      "soft-boiled-eggs",
      "scrambled-eggs",
      "frittata",
    ],
    cooksRequired: 3,
    position: { x: 50, y: 3 },
  },
  {
    id: "stock-making",
    name: "Stock Making",
    emoji: "🍲",
    description:
      "Build rich chicken, vegetable, and dashi stocks from scratch. Stock is the foundation of soups, sauces, and braises.",
    tier: "foundation",
    requiredSkills: ["moist-heat-cooking"],
    associatedDishes: ["chicken-stock", "miso-soup", "tomato-soup"],
    cooksRequired: 2,
    position: { x: 75, y: 3 },
  },
  {
    id: "mother-sauces",
    name: "Mother Sauces",
    emoji: "🥄",
    description:
      "Master béchamel, velouté, and tomato sauce — the classic French bases that underpin hundreds of dishes.",
    tier: "foundation",
    requiredSkills: ["stock-making"],
    associatedDishes: ["mac-and-cheese", "tomato-soup", "pan-gravy"],
    cooksRequired: 3,
    position: { x: 25, y: 4 },
  },
  {
    id: "seasoning-tasting",
    name: "Seasoning & Tasting",
    emoji: "🧂",
    description:
      "Salt levels, acid balance, and layering flavor as you cook. Tasting continuously is what separates good cooks from great ones.",
    tier: "foundation",
    requiredSkills: ["dry-heat-cooking"],
    associatedDishes: ["miso-soup", "guacamole", "tomato-soup"],
    cooksRequired: 2,
    position: { x: 75, y: 4 },
  },
];

// ── Tier 2: Intermediate ────────────────────────────────────

const intermediate: SkillNode[] = [
  {
    id: "meat-cookery",
    name: "Meat Cookery",
    emoji: "🥩",
    description:
      "Sear a steak, roast a pork tenderloin, and braise short ribs. Understand doneness, resting, and carryover cooking.",
    tier: "intermediate",
    requiredSkills: ["dry-heat-cooking", "seasoning-tasting"],
    associatedDishes: [
      "pan-seared-steak",
      "roast-pork-tenderloin",
      "braised-short-ribs",
    ],
    cooksRequired: 3,
    position: { x: 50, y: 5 },
  },
  {
    id: "soups",
    name: "Soups",
    emoji: "🍜",
    description:
      "From clear chicken noodle to velvety cream of mushroom to hearty minestrone — soup is a full lesson in balance.",
    tier: "intermediate",
    requiredSkills: ["stock-making", "vegetable-techniques"],
    associatedDishes: [
      "chicken-noodle-soup",
      "cream-of-mushroom",
      "minestrone",
    ],
    cooksRequired: 3,
    position: { x: 25, y: 5 },
  },
  {
    id: "salads-emulsions",
    name: "Salads & Emulsions",
    emoji: "🥗",
    description:
      "Build classic vinaigrettes, Caesar dressing, and composed salads. Learn what makes an emulsion hold.",
    tier: "intermediate",
    requiredSkills: ["seasoning-tasting", "knife-skills"],
    associatedDishes: ["caesar-salad", "mixed-green-salad", "fattoush"],
    cooksRequired: 2,
    position: { x: 75, y: 5 },
  },
  {
    id: "poultry",
    name: "Poultry",
    emoji: "🍗",
    description:
      "Roast a whole chicken, braise thighs to silky tenderness, and build confidence working with the most versatile protein.",
    tier: "intermediate",
    requiredSkills: ["meat-cookery"],
    associatedDishes: [
      "roast-chicken",
      "chicken-thigh-braise",
      "turkey-burger",
    ],
    cooksRequired: 3,
    position: { x: 25, y: 6 },
  },
  {
    id: "seafood",
    name: "Seafood",
    emoji: "🐟",
    description:
      "Pan-sear salmon perfectly, make shrimp scampi, and steam mussels open. Fish is unforgiving — nail it here.",
    tier: "intermediate",
    requiredSkills: ["meat-cookery"],
    associatedDishes: ["pan-seared-salmon", "shrimp-scampi", "steamed-mussels"],
    cooksRequired: 3,
    position: { x: 75, y: 6 },
  },
  {
    id: "grains-pasta",
    name: "Grains & Pasta",
    emoji: "🍝",
    description:
      "Creamy risotto, fresh pasta from scratch, and perfectly cooked pilaf. Carbs are a craft.",
    tier: "intermediate",
    requiredSkills: ["mise-en-place", "seasoning-tasting"],
    associatedDishes: ["risotto", "pasta-primavera", "basmati-rice"],
    cooksRequired: 3,
    position: { x: 50, y: 6 },
  },
  {
    id: "braising-stewing",
    name: "Braising & Stewing",
    emoji: "🫕",
    description:
      "Low and slow transforms tough cuts into silk. Beef stew, coq au vin, and ratatouille teach patience and depth.",
    tier: "intermediate",
    requiredSkills: ["moist-heat-cooking", "meat-cookery"],
    associatedDishes: ["beef-stew", "coq-au-vin", "ratatouille"],
    cooksRequired: 3,
    position: { x: 25, y: 7 },
  },
  {
    id: "pan-sauces-deglazing",
    name: "Pan Sauces & Deglazing",
    emoji: "🍷",
    description:
      "Those brown bits are gold. Deglaze with wine or stock to build red wine, lemon-butter, and mushroom sauces in minutes.",
    tier: "intermediate",
    requiredSkills: ["mother-sauces"],
    associatedDishes: [
      "pan-seared-steak",
      "pan-seared-salmon",
      "roast-chicken",
    ],
    cooksRequired: 3,
    position: { x: 75, y: 7 },
  },
  {
    id: "breakfast-cookery",
    name: "Breakfast Cookery",
    emoji: "🥞",
    description:
      "Fluffy pancakes, silky eggs benedict, and shakshuka. Breakfast demands timing and a gentle hand.",
    tier: "intermediate",
    requiredSkills: ["egg-cookery", "mise-en-place"],
    associatedDishes: ["pancakes", "eggs-benedict", "shakshuka"],
    cooksRequired: 2,
    position: { x: 50, y: 7 },
  },
  {
    id: "quick-breads",
    name: "Quick Breads",
    emoji: "🍌",
    description:
      "Banana bread, buttermilk biscuits, and cornbread — no yeast, fast results, and the foundation of baking intuition.",
    tier: "intermediate",
    requiredSkills: ["mise-en-place"],
    associatedDishes: ["banana-bread", "buttermilk-biscuits", "cornbread"],
    cooksRequired: 2,
    position: { x: 75, y: 8 },
  },
];

// ── Tier 3: Advanced ────────────────────────────────────────

const advanced: SkillNode[] = [
  {
    id: "butchery",
    name: "Butchery",
    emoji: "🪓",
    description:
      "Break down a whole chicken, portion a fish fillet, and trim a pork loin. Whole-animal thinking saves money and wastes nothing.",
    tier: "advanced",
    requiredSkills: ["meat-cookery", "seafood"],
    associatedDishes: [
      "roast-chicken",
      "pan-seared-salmon",
      "roast-pork-tenderloin",
    ],
    cooksRequired: 3,
    position: { x: 25, y: 9 },
  },
  {
    id: "garde-manger",
    name: "Garde Manger",
    emoji: "🧀",
    description:
      "The cold kitchen: pâté, pickled vegetables, and a simple charcuterie board. The art of preserved and prepared foods.",
    tier: "advanced",
    requiredSkills: ["salads-emulsions", "seasoning-tasting"],
    associatedDishes: ["charcuterie-board", "pickled-vegetables", "pate"],
    cooksRequired: 3,
    position: { x: 75, y: 9 },
  },
  {
    id: "palate-development",
    name: "Palate Development",
    emoji: "👅",
    description:
      "Blind tasting exercises and acid-fat-salt-heat balance drills. Train your palate to diagnose and fix a dish by taste alone.",
    tier: "advanced",
    requiredSkills: ["seasoning-tasting", "soups"],
    associatedDishes: ["miso-soup", "caesar-salad", "tomato-soup"],
    cooksRequired: 2,
    position: { x: 50, y: 9 },
  },
  {
    id: "yeast-breads",
    name: "Yeast Breads",
    emoji: "🍞",
    description:
      "Focaccia, sandwich bread, and pizza dough — learn to work with living yeast and understand fermentation timing.",
    tier: "advanced",
    requiredSkills: ["quick-breads"],
    associatedDishes: ["focaccia", "sandwich-bread", "pizza-dough"],
    cooksRequired: 3,
    position: { x: 25, y: 10 },
  },
  {
    id: "pastry-fundamentals",
    name: "Pastry Fundamentals",
    emoji: "🥐",
    description:
      "Flaky pie crust, pâte à choux for cream puffs, and a crisp tart shell. Pastry is precision — every gram matters.",
    tier: "advanced",
    requiredSkills: ["quick-breads"],
    associatedDishes: ["pie-crust", "cream-puffs", "tart-shell"],
    cooksRequired: 3,
    position: { x: 75, y: 10 },
  },
  {
    id: "global-flavor-profiles",
    name: "Global Flavor Profiles",
    emoji: "🌍",
    description:
      "Build Thai curry paste from scratch, a Mexican mole base, and an Indian tadka. Understanding flavor architecture across cultures.",
    tier: "advanced",
    requiredSkills: ["seasoning-tasting", "soups"],
    associatedDishes: ["thai-green-curry", "mole-base", "tadka-dal"],
    cooksRequired: 3,
    position: { x: 50, y: 10 },
  },
  {
    id: "plating-presentation",
    name: "Plating & Presentation",
    emoji: "🍽️",
    description:
      "Compose three different plating styles for the same dish. Learn how height, color, and negative space change the experience.",
    tier: "advanced",
    requiredSkills: ["salads-emulsions", "meat-cookery"],
    associatedDishes: ["pan-seared-salmon", "roast-chicken", "beef-stew"],
    cooksRequired: 2,
    position: { x: 25, y: 11 },
  },
  {
    id: "fermentation",
    name: "Fermentation",
    emoji: "🫙",
    description:
      "Make kimchi, sauerkraut, and yogurt. Fermentation is patience rewarded — and one of the oldest cooking methods on earth.",
    tier: "advanced",
    requiredSkills: ["seasoning-tasting", "vegetable-techniques"],
    associatedDishes: ["kimchi", "sauerkraut", "yogurt"],
    cooksRequired: 2,
    position: { x: 75, y: 11 },
  },
  {
    id: "advanced-sauces",
    name: "Advanced Sauces",
    emoji: "🫗",
    description:
      "Hollandaise, béarnaise, and beurre blanc — the emulsified butter sauces that separate home cooks from professionals.",
    tier: "advanced",
    requiredSkills: ["mother-sauces", "pan-sauces-deglazing"],
    associatedDishes: [
      "eggs-benedict",
      "grilled-asparagus",
      "pan-seared-salmon",
    ],
    cooksRequired: 3,
    position: { x: 50, y: 11 },
  },
  {
    id: "live-fire-cooking",
    name: "Live-Fire Cooking",
    emoji: "🔥",
    description:
      "Grilled fish, smoked ribs, and campfire vegetables. Learn to read and control live fire — a fundamentally different heat source.",
    tier: "advanced",
    requiredSkills: ["meat-cookery", "seafood"],
    associatedDishes: ["grilled-fish", "smoked-ribs", "grilled-vegetables"],
    cooksRequired: 3,
    position: { x: 50, y: 12 },
  },
];

// ── Tier 4: Pre-Mastery ─────────────────────────────────────

const preMastery: SkillNode[] = [
  {
    id: "menu-design",
    name: "Menu Design",
    emoji: "📋",
    description:
      "Plan a 3-course dinner with balance and flow. Understand how contrast, season, and pacing shape a complete meal.",
    tier: "pre-mastery",
    requiredSkills: [
      "grains-pasta",
      "soups",
      "salads-emulsions",
      "meat-cookery",
    ],
    associatedDishes: [
      "three-course-dinner",
      "seasonal-menu",
      "prix-fixe-menu",
    ],
    cooksRequired: 3,
    position: { x: 25, y: 13 },
  },
  {
    id: "recipe-development",
    name: "Recipe Development",
    emoji: "✍️",
    description:
      "Create an original dish, then test and iterate until it's repeatable. The creative and analytical work of the working chef.",
    tier: "pre-mastery",
    requiredSkills: ["palate-development", "global-flavor-profiles"],
    associatedDishes: [
      "original-dish",
      "flavor-experiment",
      "ingredient-substitution",
    ],
    cooksRequired: 4,
    position: { x: 75, y: 13 },
  },
  {
    id: "laminated-doughs",
    name: "Laminated Doughs",
    emoji: "🥐",
    description:
      "Croissants and rough puff pastry — hundreds of layers of butter folded in. The most technical skill in the pastry kitchen.",
    tier: "pre-mastery",
    requiredSkills: ["yeast-breads", "pastry-fundamentals"],
    associatedDishes: ["croissants", "rough-puff-pastry", "danish-pastry"],
    cooksRequired: 4,
    position: { x: 25, y: 14 },
  },
  {
    id: "contemporary-techniques",
    name: "Contemporary Techniques",
    emoji: "🧪",
    description:
      "Sous vide chicken, infused oils, and herb salts. Modern techniques that deliver precision and new flavor dimensions.",
    tier: "pre-mastery",
    requiredSkills: ["meat-cookery", "seafood", "advanced-sauces"],
    associatedDishes: ["sous-vide-chicken", "infused-oil", "herb-salt"],
    cooksRequired: 3,
    position: { x: 75, y: 14 },
  },
  {
    id: "kitchen-orchestration",
    name: "Kitchen Orchestration",
    emoji: "🎼",
    description:
      "Cook a 3-course meal with synchronized timing so everything lands hot and at its peak simultaneously.",
    tier: "pre-mastery",
    requiredSkills: ["menu-design", "plating-presentation", "braising-stewing"],
    associatedDishes: [
      "synchronized-three-course",
      "dinner-party-menu",
      "tasting-menu",
    ],
    cooksRequired: 4,
    position: { x: 50, y: 15 },
  },
];

// ── Tier 5: Cuisine Mastery — parallel branching paths ──────
// These render as a grid, not a tree. Prerequisites gate access but
// paths are independent — users can work multiple cuisines at once.
// Position values are placeholders (not used for tree rendering).

const mastery: SkillNode[] = [
  {
    id: "italian-mastery",
    name: "Italian Mastery",
    emoji: "🇮🇹",
    description:
      "Master the fundamentals of Italian cooking — simplicity, quality ingredients, and perfect technique.",
    tier: "mastery",
    cuisineFamily: "italian",
    requiredSkills: ["global-flavor-profiles"],
    associatedDishes: [
      "fresh-pasta-carbonara",
      "risotto-alla-milanese",
      "osso-buco",
      "tiramisu",
      "caprese-salad",
    ],
    cooksRequired: 5,
    position: { x: 25, y: 17 },
  },
  {
    id: "japanese-mastery",
    name: "Japanese Mastery",
    emoji: "🇯🇵",
    description:
      "Learn the precision and balance of Japanese cuisine — umami, knife work, and seasonal respect.",
    tier: "mastery",
    cuisineFamily: "japanese",
    requiredSkills: ["global-flavor-profiles", "seafood"],
    associatedDishes: [
      "miso-soup",
      "teriyaki-salmon",
      "tempura",
      "gyoza",
      "tamagoyaki",
    ],
    cooksRequired: 5,
    position: { x: 75, y: 17 },
  },
  {
    id: "french-mastery",
    name: "French Mastery",
    emoji: "🇫🇷",
    description:
      "The foundation of Western cuisine — sauces, technique, and classical preparation.",
    tier: "mastery",
    cuisineFamily: "french",
    requiredSkills: ["advanced-sauces", "global-flavor-profiles"],
    associatedDishes: [
      "coq-au-vin",
      "creme-brulee",
      "ratatouille",
      "french-onion-soup",
      "tarte-tatin",
    ],
    cooksRequired: 5,
    position: { x: 25, y: 18 },
  },
  {
    id: "mexican-mastery",
    name: "Mexican Mastery",
    emoji: "🇲🇽",
    description:
      "Bold flavors, ancient techniques, and the art of building complex salsas and moles.",
    tier: "mastery",
    cuisineFamily: "mexican",
    requiredSkills: ["global-flavor-profiles"],
    associatedDishes: [
      "mole-poblano",
      "carnitas",
      "elote",
      "churros",
      "pozole",
    ],
    cooksRequired: 5,
    position: { x: 75, y: 18 },
  },
  {
    id: "indian-mastery",
    name: "Indian Mastery",
    emoji: "🇮🇳",
    description:
      "Master spice layering, tempering, and the diverse regional traditions of Indian cooking.",
    tier: "mastery",
    cuisineFamily: "indian",
    requiredSkills: ["global-flavor-profiles"],
    associatedDishes: [
      "chicken-tikka-masala",
      "dal-tadka",
      "biryani",
      "naan-bread",
      "palak-paneer",
    ],
    cooksRequired: 5,
    position: { x: 25, y: 19 },
  },
  {
    id: "thai-mastery",
    name: "Thai Mastery",
    emoji: "🇹🇭",
    description:
      "Balance sweet, sour, salty, and spicy — the four pillars of Thai flavor.",
    tier: "mastery",
    cuisineFamily: "thai",
    requiredSkills: ["global-flavor-profiles"],
    associatedDishes: [
      "pad-thai",
      "thai-green-curry",
      "tom-yum-soup",
      "papaya-salad",
      "mango-sticky-rice",
    ],
    cooksRequired: 5,
    position: { x: 75, y: 19 },
  },
  {
    id: "chinese-mastery",
    name: "Chinese Mastery",
    emoji: "🇨🇳",
    description:
      "Wok mastery, dumpling craft, and the vast regional diversity of Chinese cooking.",
    tier: "mastery",
    cuisineFamily: "chinese",
    requiredSkills: ["global-flavor-profiles", "dry-heat-cooking"],
    associatedDishes: [
      "kung-pao-chicken",
      "mapo-tofu",
      "xiaolongbao",
      "dan-dan-noodles",
      "peking-duck",
    ],
    cooksRequired: 5,
    position: { x: 25, y: 20 },
  },
  {
    id: "mediterranean-mastery",
    name: "Mediterranean Mastery",
    emoji: "🫒",
    description:
      "Olive oil, fresh herbs, and the sun-drenched flavors of the Mediterranean coast.",
    tier: "mastery",
    cuisineFamily: "mediterranean",
    requiredSkills: ["global-flavor-profiles"],
    associatedDishes: [
      "greek-moussaka",
      "falafel",
      "shakshuka",
      "hummus",
      "lamb-kofta",
    ],
    cooksRequired: 5,
    position: { x: 75, y: 20 },
  },
];

// ── Exports ─────────────────────────────────────────────────

export const skillTreeNodes: SkillNode[] = [
  ...foundation,
  ...intermediate,
  ...advanced,
  ...preMastery,
  ...mastery,
];

/** Look up a node by ID */
export function getSkillNode(id: string): SkillNode | undefined {
  return skillTreeNodes.find((n) => n.id === id);
}

/** Find the skill node that counts a given dish slug toward its progress */
export function findSkillNodeForDish(dishSlug: string): SkillNode | undefined {
  return skillTreeNodes.find((n) => n.associatedDishes.includes(dishSlug));
}

/** Get all nodes grouped by tier */
export function getNodesByTier() {
  return {
    foundation: skillTreeNodes.filter((n) => n.tier === "foundation"),
    intermediate: skillTreeNodes.filter((n) => n.tier === "intermediate"),
    advanced: skillTreeNodes.filter((n) => n.tier === "advanced"),
    "pre-mastery": skillTreeNodes.filter((n) => n.tier === "pre-mastery"),
    mastery: skillTreeNodes.filter((n) => n.tier === "mastery"),
  };
}

/** XP values per tier */
export const XP_PER_COOK = {
  foundation: 10,
  intermediate: 15,
  advanced: 25,
  "pre-mastery": 40,
  mastery: 60,
} as const;

/** Compute level from total XP */
export function computeLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/**
 * Find all skill nodes that list a given dish slug in their associatedDishes.
 * Returns node IDs, used to record progress when a cook is completed.
 */
export function getSkillNodesForDish(dishSlug: string): string[] {
  return skillTreeNodes
    .filter((node) => node.associatedDishes.includes(dishSlug))
    .map((node) => node.id);
}
