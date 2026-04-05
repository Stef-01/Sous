/**
 * Static guided cook step data for V1.
 * Used when the database is not yet seeded.
 * Each entry provides full cook flow: ingredients + steps.
 */

export interface StaticCookStep {
  phase: "cook";
  stepNumber: number;
  instruction: string;
  timerSeconds: number | null;
  mistakeWarning: string | null;
  quickHack: string | null;
  cuisineFact: string | null;
  donenessCue: string | null;
  imageUrl: string | null;
}

export interface StaticIngredient {
  id: string;
  name: string;
  quantity: string;
  isOptional: boolean;
  substitution: string | null;
}

export interface StaticDishData {
  name: string;
  slug: string;
  description: string;
  cuisineFamily: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  skillLevel: string;
  heroImageUrl: string | null;
  flavorProfile: string[];
  temperature: string;
  ingredients: StaticIngredient[];
  steps: StaticCookStep[];
}

export const guidedCookData: Record<string, StaticDishData> = {
  "caesar-salad": {
    name: "Caesar Salad",
    slug: "caesar-salad",
    description: "Crisp romaine lettuce tossed with creamy Caesar dressing, shaved Parmesan, and crunchy garlic croutons.",
    cuisineFamily: "italian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/caesar_salad.png",
    flavorProfile: ["savory", "crunchy", "creamy"],
    temperature: "cold",
    ingredients: [
      { id: "cs-1", name: "Romaine lettuce", quantity: "1 large head", isOptional: false, substitution: null },
      { id: "cs-2", name: "Parmesan cheese", quantity: "1/3 cup shaved", isOptional: false, substitution: "Pecorino Romano" },
      { id: "cs-3", name: "Garlic", quantity: "2 cloves", isOptional: false, substitution: null },
      { id: "cs-4", name: "Lemon", quantity: "1 large", isOptional: false, substitution: "2 tbsp bottled lemon juice" },
      { id: "cs-5", name: "Olive oil", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "cs-6", name: "Dijon mustard", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "cs-7", name: "Anchovy paste", quantity: "1 tsp", isOptional: true, substitution: "1/2 tsp Worcestershire sauce" },
      { id: "cs-8", name: "Bread for croutons", quantity: "2 thick slices", isOptional: false, substitution: "Store-bought croutons" },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Wash the romaine, pat it dry, then tear it into bite-sized pieces. Cold, crisp lettuce is key to a great Caesar.",
        timerSeconds: null,
        mistakeWarning: "Don't chop the lettuce with a knife — tearing prevents bruised edges and keeps it crispy longer.",
        quickHack: "Buy pre-washed hearts of romaine to save 5 minutes.",
        cuisineFact: "The Caesar salad was invented in Tijuana, Mexico in the 1920s by Italian-American restaurateur Caesar Cardini.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction: "Make croutons: Cube the bread, toss with 1 tbsp olive oil and a pinch of salt. Toast in a dry pan over medium heat until golden on all sides.",
        timerSeconds: 300,
        mistakeWarning: "Keep tossing the croutons every 30 seconds — they go from golden to burnt fast.",
        quickHack: "Skip homemade croutons and use store-bought. No shame in it.",
        cuisineFact: null,
        donenessCue: "They should be golden brown and make a hollow sound when tapped.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction: "Make the dressing: Mince the garlic finely. In a bowl, whisk together the garlic, lemon juice, Dijon mustard, and anchovy paste (if using). Slowly drizzle in 2 tbsp olive oil while whisking.",
        timerSeconds: null,
        mistakeWarning: "Add the oil slowly while whisking, or the dressing will separate instead of getting creamy.",
        quickHack: null,
        cuisineFact: "Traditional Caesar dressing uses raw egg yolk for richness, but this version skips it for safety and simplicity.",
        donenessCue: "The dressing should look emulsified — creamy and slightly thick, not watery.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction: "Toss the torn lettuce with the dressing until every leaf is lightly coated. Add the Parmesan and croutons, toss once more gently. Serve immediately.",
        timerSeconds: null,
        mistakeWarning: "Don't overdress — start with half the dressing, taste, then add more. Soggy lettuce is sad lettuce.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Each leaf should glisten but not drip.",
        imageUrl: null,
      },
    ],
  },

  "garlic-bread": {
    name: "Garlic Bread",
    slug: "garlic-bread",
    description: "Golden-toasted baguette slices brushed with garlic butter and fresh herbs.",
    cuisineFamily: "italian",
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/garlic_bread.png",
    flavorProfile: ["savory", "rich", "warm"],
    temperature: "hot",
    ingredients: [
      { id: "gb-1", name: "Baguette or Italian bread", quantity: "1 loaf", isOptional: false, substitution: "Any crusty bread" },
      { id: "gb-2", name: "Butter", quantity: "4 tbsp, softened", isOptional: false, substitution: "Olive oil" },
      { id: "gb-3", name: "Garlic", quantity: "3 cloves, minced", isOptional: false, substitution: "1 tsp garlic powder" },
      { id: "gb-4", name: "Fresh parsley", quantity: "2 tbsp, chopped", isOptional: true, substitution: "1 tsp dried parsley" },
      { id: "gb-5", name: "Parmesan", quantity: "2 tbsp grated", isOptional: true, substitution: null },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Preheat your oven to 200°C (400°F). Mix the softened butter with minced garlic and chopped parsley until combined.",
        timerSeconds: null,
        mistakeWarning: "Make sure the butter is room temperature — cold butter won't mix evenly and you'll get garlic lumps.",
        quickHack: "Microwave the butter for 10 seconds if it's still cold from the fridge.",
        cuisineFact: "Garlic bread as we know it was popularized in the US in the 1940s, but garlic-rubbed bread exists in Italian, Spanish, and French traditions.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction: "Slice the baguette in half lengthwise. Spread the garlic butter generously on both cut sides.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: "For extra flavor, lightly sprinkle grated Parmesan on top of the butter.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction: "Place the bread butter-side up on a baking sheet. Bake until the edges are golden and the butter is bubbling.",
        timerSeconds: 480,
        mistakeWarning: "Watch closely after 6 minutes — the butter and garlic can burn quickly. Burnt garlic tastes bitter.",
        quickHack: "If you're in a rush, use the broiler for 2-3 minutes instead. Just watch it like a hawk.",
        cuisineFact: null,
        donenessCue: "The top should be golden brown with bubbling butter, and the bread should be crispy at the edges.",
        imageUrl: null,
      },
    ],
  },

  "tabbouleh": {
    name: "Tabbouleh",
    slug: "tabbouleh",
    description: "A vibrant herb salad with bulgur wheat, fresh parsley, mint, tomatoes, and a bright lemon-olive oil dressing.",
    cuisineFamily: "middle-eastern",
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tabbouleh.png",
    flavorProfile: ["fresh", "bright", "herby"],
    temperature: "cold",
    ingredients: [
      { id: "tb-1", name: "Fine bulgur wheat", quantity: "1/2 cup", isOptional: false, substitution: "Couscous or quinoa" },
      { id: "tb-2", name: "Fresh flat-leaf parsley", quantity: "2 large bunches (about 2 cups chopped)", isOptional: false, substitution: null },
      { id: "tb-3", name: "Fresh mint", quantity: "1/2 cup chopped", isOptional: false, substitution: "1 tsp dried mint" },
      { id: "tb-4", name: "Tomatoes", quantity: "2 medium, diced small", isOptional: false, substitution: "1 cup cherry tomatoes, halved" },
      { id: "tb-5", name: "Green onions", quantity: "3, thinly sliced", isOptional: false, substitution: "1/4 red onion, finely diced" },
      { id: "tb-6", name: "Lemon juice", quantity: "1/4 cup (about 2 lemons)", isOptional: false, substitution: null },
      { id: "tb-7", name: "Extra-virgin olive oil", quantity: "1/4 cup", isOptional: false, substitution: null },
      { id: "tb-8", name: "Salt", quantity: "to taste", isOptional: false, substitution: null },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Pour boiling water over the bulgur in a bowl — just enough to cover it by a finger's width. Cover and let it soak.",
        timerSeconds: 600,
        mistakeWarning: "Don't use too much water or the bulgur will be mushy. It should be tender but still have a slight chew.",
        quickHack: "Use couscous instead of bulgur — it soaks in just 5 minutes.",
        cuisineFact: "In Lebanon, a traditional tabbouleh is more herb than grain. The bulgur is a supporting player, not the star.",
        donenessCue: "The bulgur should be tender when you bite it, with no hard center.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction: "While the bulgur soaks, prep the herbs: wash and thoroughly dry the parsley and mint, then chop them finely.",
        timerSeconds: null,
        mistakeWarning: "Make sure the herbs are completely dry before chopping. Wet herbs turn to mush and make the salad watery.",
        quickHack: "Use a salad spinner to dry the herbs quickly. No spinner? Roll them in a clean kitchen towel.",
        cuisineFact: null,
        donenessCue: "The herbs should be uniformly fine but not paste-like. Think confetti, not powder.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction: "Drain any excess water from the bulgur, then fluff with a fork. Let it cool to room temperature.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: "Spread the drained bulgur on a plate — it cools in half the time.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction: "Dice the tomatoes small and thinly slice the green onions. Add them to a large bowl with the herbs and cooled bulgur.",
        timerSeconds: null,
        mistakeWarning: "Dice the tomatoes small (about 1cm cubes). Uneven chunks make for an unbalanced bite.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction: "Dress it: whisk together the lemon juice, olive oil, and salt. Pour over the salad and toss gently. Taste and adjust the lemon and salt.",
        timerSeconds: null,
        mistakeWarning: "Don't skimp on the lemon juice — it's the engine of tabbouleh. The salad should taste bright, not oily.",
        quickHack: null,
        cuisineFact: "In the Middle East, tabbouleh is traditionally served on a bed of romaine leaves and eaten by scooping with the lettuce.",
        donenessCue: "It should taste distinctly lemony and herby. If it tastes flat, it needs more lemon or salt.",
        imageUrl: null,
      },
    ],
  },

  "tomato-soup": {
    name: "Tomato Soup",
    slug: "tomato-soup",
    description: "A velvety smooth soup made from ripe tomatoes, onion, and a swirl of cream.",
    cuisineFamily: "comfort-classic",
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tomato_soup.png",
    flavorProfile: ["savory", "warm", "creamy"],
    temperature: "hot",
    ingredients: [
      { id: "ts-1", name: "Canned whole tomatoes", quantity: "2 cans (28 oz each)", isOptional: false, substitution: "6 large ripe tomatoes, halved" },
      { id: "ts-2", name: "Onion", quantity: "1 large, diced", isOptional: false, substitution: null },
      { id: "ts-3", name: "Garlic", quantity: "3 cloves, minced", isOptional: false, substitution: null },
      { id: "ts-4", name: "Butter", quantity: "2 tbsp", isOptional: false, substitution: "Olive oil" },
      { id: "ts-5", name: "Vegetable or chicken broth", quantity: "1 cup", isOptional: false, substitution: "Water" },
      { id: "ts-6", name: "Heavy cream", quantity: "1/4 cup", isOptional: true, substitution: "Coconut cream for dairy-free" },
      { id: "ts-7", name: "Fresh basil", quantity: "small handful", isOptional: true, substitution: "1 tsp dried basil" },
      { id: "ts-8", name: "Sugar", quantity: "1 tsp", isOptional: true, substitution: null },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Melt the butter in a large pot over medium heat. Add the diced onion and cook until it's soft and translucent.",
        timerSeconds: 300,
        mistakeWarning: "Don't rush the onions on high heat — you want them soft, not browned. Brown onions will make the soup taste different.",
        quickHack: null,
        cuisineFact: "Tomato soup became an American household staple when Campbell's introduced their condensed version in 1897.",
        donenessCue: "The onion should be glassy and soft, with no hard crunch when you press a piece.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction: "Add the minced garlic and cook for just 30 seconds until fragrant. Then pour in the canned tomatoes (with their juices) and broth.",
        timerSeconds: null,
        mistakeWarning: "Garlic burns in about 60 seconds over medium heat. Add it, stir, and move quickly to the tomatoes.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "You should smell the garlic immediately — that's when it's ready for the tomatoes.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction: "Bring to a gentle boil, then reduce heat and simmer. Break up the tomatoes with a spoon as they cook.",
        timerSeconds: 900,
        mistakeWarning: "Keep it at a simmer, not a rolling boil. Boiling can make the soup taste acidic.",
        quickHack: "Add a teaspoon of sugar to cut acidity — especially if using canned tomatoes.",
        cuisineFact: null,
        donenessCue: "The tomatoes should be completely broken down and the soup should be a uniform red.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction: "Use an immersion blender to purée the soup until smooth (or carefully transfer to a regular blender in batches). Stir in the cream and basil, season with salt and pepper.",
        timerSeconds: null,
        mistakeWarning: "If using a regular blender, never fill it more than half with hot liquid — steam builds pressure and can blow the lid off.",
        quickHack: "No blender? Mash vigorously with a potato masher for a rustic, chunky texture.",
        cuisineFact: null,
        donenessCue: "The soup should be velvety smooth with a rich orange-red color after the cream is stirred in.",
        imageUrl: null,
      },
    ],
  },

  "guacamole": {
    name: "Guacamole",
    slug: "guacamole",
    description: "A fresh, chunky avocado dip with lime, cilantro, onion, and a kick of jalapeño.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/guacamole.png",
    flavorProfile: ["fresh", "creamy", "bright"],
    temperature: "cold",
    ingredients: [
      { id: "gc-1", name: "Ripe avocados", quantity: "3 large", isOptional: false, substitution: null },
      { id: "gc-2", name: "Lime", quantity: "1 large, juiced", isOptional: false, substitution: "2 tbsp bottled lime juice" },
      { id: "gc-3", name: "Red onion", quantity: "1/4, finely diced", isOptional: false, substitution: "White onion" },
      { id: "gc-4", name: "Fresh cilantro", quantity: "1/4 cup, chopped", isOptional: false, substitution: "Flat-leaf parsley" },
      { id: "gc-5", name: "Jalapeño", quantity: "1 small, seeded and minced", isOptional: true, substitution: "Pinch of cayenne pepper" },
      { id: "gc-6", name: "Tomato", quantity: "1 medium, diced", isOptional: true, substitution: null },
      { id: "gc-7", name: "Salt", quantity: "to taste", isOptional: false, substitution: null },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Cut the avocados in half, remove the pits, and scoop the flesh into a bowl. Add the lime juice right away.",
        timerSeconds: null,
        mistakeWarning: "Add lime juice immediately — it slows browning AND seasons the base. Don't save it for the end.",
        quickHack: "Score the avocado flesh in a crosshatch while still in the skin, then scoop — instant chunks.",
        cuisineFact: "The Aztecs made the first guacamole (ahuaca-mulli, meaning 'avocado sauce') over 500 years ago.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction: "Mash the avocado to your preferred texture — chunky is traditional. Mix in the diced onion, cilantro, jalapeño (if using), and tomato.",
        timerSeconds: null,
        mistakeWarning: "Don't over-mash — guacamole should have texture. A few chunky bits of avocado are what makes it great.",
        quickHack: "No jalapeño? A tiny pinch of cayenne gives you heat without having to chop anything.",
        cuisineFact: null,
        donenessCue: "You want about 70% mashed, 30% chunky pieces visible.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction: "Season with salt, taste, and adjust. Add more lime if it needs brightness, more salt if it tastes flat. Serve immediately with chips or alongside your meal.",
        timerSeconds: null,
        mistakeWarning: "Salt is critical here — under-salted guac tastes bland even with good avocados. Taste as you go.",
        quickHack: "Press plastic wrap directly onto the surface of leftover guacamole (no air gaps) to prevent browning.",
        cuisineFact: "In Mexico, guacamole is considered a salsa, not a dip — it's served alongside grilled meats and tacos as a condiment.",
        donenessCue: "Taste a chip with the guac. It should be bright, slightly tangy, creamy, and well-seasoned.",
        imageUrl: null,
      },
    ],
  },
};

/**
 * Get guided cook data for a side dish by slug.
 * Returns null if no data exists for this dish.
 */
export function getStaticCookData(slug: string): StaticDishData | null {
  return guidedCookData[slug] ?? null;
}

/**
 * Get all slugs that have guided cook data.
 */
export function getAvailableCookSlugs(): string[] {
  return Object.keys(guidedCookData);
}
