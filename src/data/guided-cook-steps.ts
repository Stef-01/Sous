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
    description:
      "Crisp romaine lettuce tossed with creamy Caesar dressing, shaved Parmesan, and crunchy garlic croutons.",
    cuisineFamily: "italian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/caesar_salad.png",
    flavorProfile: ["savory", "crunchy", "creamy"],
    temperature: "cold",
    ingredients: [
      {
        id: "cs-1",
        name: "Romaine lettuce",
        quantity: "1 large head",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cs-2",
        name: "Parmesan cheese",
        quantity: "1/3 cup shaved",
        isOptional: false,
        substitution: "Pecorino Romano",
      },
      {
        id: "cs-3",
        name: "Garlic",
        quantity: "2 cloves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cs-4",
        name: "Lemon",
        quantity: "1 large",
        isOptional: false,
        substitution: "2 tbsp bottled lemon juice",
      },
      {
        id: "cs-5",
        name: "Olive oil",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cs-6",
        name: "Dijon mustard",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cs-7",
        name: "Anchovy paste",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "1/2 tsp Worcestershire sauce",
      },
      {
        id: "cs-8",
        name: "Bread for croutons",
        quantity: "2 thick slices",
        isOptional: false,
        substitution: "Store-bought croutons",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Wash the romaine, pat it dry, then tear it into bite-sized pieces. Cold, crisp lettuce is key to a great Caesar.",
        timerSeconds: null,
        mistakeWarning:
          "Don't chop the lettuce with a knife — tearing prevents bruised edges and keeps it crispy longer.",
        quickHack: "Buy pre-washed hearts of romaine to save 5 minutes.",
        cuisineFact:
          "The Caesar salad was invented in Tijuana, Mexico in the 1920s by Italian-American restaurateur Caesar Cardini.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Make croutons: Cube the bread, toss with 1 tbsp olive oil and a pinch of salt. Toast in a dry pan over medium heat until golden on all sides.",
        timerSeconds: 300,
        mistakeWarning:
          "Keep tossing the croutons every 30 seconds — they go from golden to burnt fast.",
        quickHack:
          "Skip homemade croutons and use store-bought. No shame in it.",
        cuisineFact: null,
        donenessCue:
          "They should be golden brown and make a hollow sound when tapped.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Make the dressing: Mince the garlic finely. In a bowl, whisk together the garlic, lemon juice, Dijon mustard, and anchovy paste (if using). Slowly drizzle in 2 tbsp olive oil while whisking.",
        timerSeconds: null,
        mistakeWarning:
          "Add the oil slowly while whisking, or the dressing will separate instead of getting creamy.",
        quickHack: null,
        cuisineFact:
          "Traditional Caesar dressing uses raw egg yolk for richness, but this version skips it for safety and simplicity.",
        donenessCue:
          "The dressing should look emulsified — creamy and slightly thick, not watery.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Toss the torn lettuce with the dressing until every leaf is lightly coated. Add the Parmesan and croutons, toss once more gently. Serve immediately.",
        timerSeconds: null,
        mistakeWarning:
          "Don't overdress — start with half the dressing, taste, then add more. Soggy lettuce is sad lettuce.",
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
    description:
      "Golden-toasted baguette slices brushed with garlic butter and fresh herbs.",
    cuisineFamily: "italian",
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/garlic_bread.png",
    flavorProfile: ["savory", "rich", "warm"],
    temperature: "hot",
    ingredients: [
      {
        id: "gb-1",
        name: "Baguette or Italian bread",
        quantity: "1 loaf",
        isOptional: false,
        substitution: "Any crusty bread",
      },
      {
        id: "gb-2",
        name: "Butter",
        quantity: "4 tbsp, softened",
        isOptional: false,
        substitution: "Olive oil",
      },
      {
        id: "gb-3",
        name: "Garlic",
        quantity: "3 cloves, minced",
        isOptional: false,
        substitution: "1 tsp garlic powder",
      },
      {
        id: "gb-4",
        name: "Fresh parsley",
        quantity: "2 tbsp, chopped",
        isOptional: true,
        substitution: "1 tsp dried parsley",
      },
      {
        id: "gb-5",
        name: "Parmesan",
        quantity: "2 tbsp grated",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Preheat your oven to 200°C (400°F). Mix the softened butter with minced garlic and chopped parsley until combined.",
        timerSeconds: null,
        mistakeWarning:
          "Make sure the butter is room temperature — cold butter won't mix evenly and you'll get garlic lumps.",
        quickHack:
          "Microwave the butter for 10 seconds if it's still cold from the fridge.",
        cuisineFact:
          "Garlic bread as we know it was popularized in the US in the 1940s, but garlic-rubbed bread exists in Italian, Spanish, and French traditions.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Slice the baguette in half lengthwise. Spread the garlic butter generously on both cut sides.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "For extra flavor, lightly sprinkle grated Parmesan on top of the butter.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Place the bread butter-side up on a baking sheet. Bake until the edges are golden and the butter is bubbling.",
        timerSeconds: 480,
        mistakeWarning:
          "Watch closely after 6 minutes — the butter and garlic can burn quickly. Burnt garlic tastes bitter.",
        quickHack:
          "If you're in a rush, use the broiler for 2-3 minutes instead. Just watch it like a hawk.",
        cuisineFact: null,
        donenessCue:
          "The top should be golden brown with bubbling butter, and the bread should be crispy at the edges.",
        imageUrl: null,
      },
    ],
  },

  tabbouleh: {
    name: "Lebanese Tabbouleh",
    slug: "tabbouleh",
    description:
      "A bright, herb-forward salad of fine bulgur, parsley, mint, tomatoes, and a tangy lime-olive oil dressing.",
    cuisineFamily: "mediterranean",
    prepTimeMinutes: 20,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["fresh", "herby", "tangy"],
    temperature: "cold",
    ingredients: [
      {
        id: "tb-1",
        name: "Fine bulgur wheat",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tb-2",
        name: "Roma tomatoes",
        quantity: "4 medium",
        isOptional: false,
        substitution: "Cherry tomatoes",
      },
      {
        id: "tb-3",
        name: "English cucumber",
        quantity: "1 whole",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tb-4",
        name: "Flat-leaf parsley",
        quantity: "2 bunches",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tb-5",
        name: "Fresh mint",
        quantity: "12-15 leaves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tb-6",
        name: "Green onions",
        quantity: "4 stalks",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tb-7",
        name: "Extra virgin olive oil",
        quantity: "3-4 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tb-8",
        name: "Lime juice",
        quantity: "3-4 tbsp",
        isOptional: false,
        substitution: "Lemon juice",
      },
      {
        id: "tb-9",
        name: "Kosher salt",
        quantity: "to taste",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Wash bulgur and soak in water for 5-7 minutes, then drain and squeeze out all excess water.",
        timerSeconds: 420,
        mistakeWarning: "Do not over-soak or bulgur turns mushy.",
        quickHack: null,
        cuisineFact:
          "Tabbouleh originated in the mountains of Lebanon and Syria.",
        donenessCue: "Grains tender but not soft.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Dice tomatoes small, place in colander to drain excess juice for a few minutes.",
        timerSeconds: null,
        mistakeWarning: "Watery tomatoes make tabbouleh soggy.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction: "Finely chop the parsley, mint leaves, and green onions.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: "Pulse in food processor 3-4 times to speed up chopping.",
        cuisineFact:
          "In authentic Lebanese tabbouleh, parsley-to-bulgur ratio is 7:1.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Combine drained bulgur, tomatoes, parsley, mint, and green onions in a large bowl.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Dress with olive oil and lime juice, season with salt, toss gently.",
        timerSeconds: null,
        mistakeWarning:
          "Add dressing just before serving to keep herbs vibrant.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Everything glistens lightly without pooling.",
        imageUrl: null,
      },
    ],
  },

  "tomato-soup": {
    name: "Tomato Soup",
    slug: "tomato-soup",
    description:
      "A velvety smooth soup made from ripe tomatoes, onion, and a swirl of cream.",
    cuisineFamily: "comfort-classic",
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tomato_soup.png",
    flavorProfile: ["savory", "warm", "creamy"],
    temperature: "hot",
    ingredients: [
      {
        id: "ts-1",
        name: "Canned whole tomatoes",
        quantity: "2 cans (28 oz each)",
        isOptional: false,
        substitution: "6 large ripe tomatoes, halved",
      },
      {
        id: "ts-2",
        name: "Onion",
        quantity: "1 large, diced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ts-3",
        name: "Garlic",
        quantity: "3 cloves, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ts-4",
        name: "Butter",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Olive oil",
      },
      {
        id: "ts-5",
        name: "Vegetable or chicken broth",
        quantity: "1 cup",
        isOptional: false,
        substitution: "Water",
      },
      {
        id: "ts-6",
        name: "Heavy cream",
        quantity: "1/4 cup",
        isOptional: true,
        substitution: "Coconut cream for dairy-free",
      },
      {
        id: "ts-7",
        name: "Fresh basil",
        quantity: "small handful",
        isOptional: true,
        substitution: "1 tsp dried basil",
      },
      {
        id: "ts-8",
        name: "Sugar",
        quantity: "1 tsp",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Melt the butter in a large pot over medium heat. Add the diced onion and cook until it's soft and translucent.",
        timerSeconds: 300,
        mistakeWarning:
          "Don't rush the onions on high heat — you want them soft, not browned. Brown onions will make the soup taste different.",
        quickHack: null,
        cuisineFact:
          "Tomato soup became an American household staple when Campbell's introduced their condensed version in 1897.",
        donenessCue:
          "The onion should be glassy and soft, with no hard crunch when you press a piece.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add the minced garlic and cook for just 30 seconds until fragrant. Then pour in the canned tomatoes (with their juices) and broth.",
        timerSeconds: null,
        mistakeWarning:
          "Garlic burns in about 60 seconds over medium heat. Add it, stir, and move quickly to the tomatoes.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You should smell the garlic immediately — that's when it's ready for the tomatoes.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Bring to a gentle boil, then reduce heat and simmer. Break up the tomatoes with a spoon as they cook.",
        timerSeconds: 900,
        mistakeWarning:
          "Keep it at a simmer, not a rolling boil. Boiling can make the soup taste acidic.",
        quickHack:
          "Add a teaspoon of sugar to cut acidity — especially if using canned tomatoes.",
        cuisineFact: null,
        donenessCue:
          "The tomatoes should be completely broken down and the soup should be a uniform red.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Use an immersion blender to purée the soup until smooth (or carefully transfer to a regular blender in batches). Stir in the cream and basil, season with salt and pepper.",
        timerSeconds: null,
        mistakeWarning:
          "If using a regular blender, never fill it more than half with hot liquid — steam builds pressure and can blow the lid off.",
        quickHack:
          "No blender? Mash vigorously with a potato masher for a rustic, chunky texture.",
        cuisineFact: null,
        donenessCue:
          "The soup should be velvety smooth with a rich orange-red color after the cream is stirred in.",
        imageUrl: null,
      },
    ],
  },

  guacamole: {
    name: "Guacamole",
    slug: "guacamole",
    description:
      "A fresh, chunky avocado dip with lime, cilantro, onion, and a kick of jalapeño.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/guacamole.png",
    flavorProfile: ["fresh", "creamy", "bright"],
    temperature: "cold",
    ingredients: [
      {
        id: "gc-1",
        name: "Ripe avocados",
        quantity: "3 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gc-2",
        name: "Lime",
        quantity: "1 large, juiced",
        isOptional: false,
        substitution: "2 tbsp bottled lime juice",
      },
      {
        id: "gc-3",
        name: "Red onion",
        quantity: "1/4, finely diced",
        isOptional: false,
        substitution: "White onion",
      },
      {
        id: "gc-4",
        name: "Fresh cilantro",
        quantity: "1/4 cup, chopped",
        isOptional: false,
        substitution: "Flat-leaf parsley",
      },
      {
        id: "gc-5",
        name: "Jalapeño",
        quantity: "1 small, seeded and minced",
        isOptional: true,
        substitution: "Pinch of cayenne pepper",
      },
      {
        id: "gc-6",
        name: "Tomato",
        quantity: "1 medium, diced",
        isOptional: true,
        substitution: null,
      },
      {
        id: "gc-7",
        name: "Salt",
        quantity: "to taste",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Cut the avocados in half, remove the pits, and scoop the flesh into a bowl. Add the lime juice right away.",
        timerSeconds: null,
        mistakeWarning:
          "Add lime juice immediately — it slows browning AND seasons the base. Don't save it for the end.",
        quickHack:
          "Score the avocado flesh in a crosshatch while still in the skin, then scoop — instant chunks.",
        cuisineFact:
          "The Aztecs made the first guacamole (ahuaca-mulli, meaning 'avocado sauce') over 500 years ago.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Mash the avocado to your preferred texture — chunky is traditional. Mix in the diced onion, cilantro, jalapeño (if using), and tomato.",
        timerSeconds: null,
        mistakeWarning:
          "Don't over-mash — guacamole should have texture. A few chunky bits of avocado are what makes it great.",
        quickHack:
          "No jalapeño? A tiny pinch of cayenne gives you heat without having to chop anything.",
        cuisineFact: null,
        donenessCue: "You want about 70% mashed, 30% chunky pieces visible.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Season with salt, taste, and adjust. Add more lime if it needs brightness, more salt if it tastes flat. Serve immediately with chips or alongside your meal.",
        timerSeconds: null,
        mistakeWarning:
          "Salt is critical here — under-salted guac tastes bland even with good avocados. Taste as you go.",
        quickHack:
          "Press plastic wrap directly onto the surface of leftover guacamole (no air gaps) to prevent browning.",
        cuisineFact:
          "In Mexico, guacamole is considered a salsa, not a dip — it's served alongside grilled meats and tacos as a condiment.",
        donenessCue:
          "Taste a chip with the guac. It should be bright, slightly tangy, creamy, and well-seasoned.",
        imageUrl: null,
      },
    ],
  },

  bruschetta: {
    name: "Bruschetta",
    slug: "bruschetta",
    description:
      "Toasted ciabatta topped with a vibrant mix of diced tomatoes, fresh basil, garlic, and a drizzle of balsamic glaze.",
    cuisineFamily: "italian",
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/bruschetta.png",
    flavorProfile: ["fresh", "bright", "savory"],
    temperature: "room-temp",
    ingredients: [
      {
        id: "br-1",
        name: "Ripe tomatoes",
        quantity: "1 lb (3-4 medium)",
        isOptional: false,
        substitution: "Cherry tomatoes, halved",
      },
      {
        id: "br-2",
        name: "Crusty Italian bread",
        quantity: "8 slices, 1/2-inch thick",
        isOptional: false,
        substitution: "Baguette slices",
      },
      {
        id: "br-3",
        name: "Garlic",
        quantity: "3 cloves (2 minced, 1 halved)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "br-4",
        name: "Fresh basil",
        quantity: "8-10 large leaves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "br-5",
        name: "Extra-virgin olive oil",
        quantity: "5 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "br-6",
        name: "Kosher salt",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "br-7",
        name: "Balsamic glaze",
        quantity: "1 tbsp",
        isOptional: true,
        substitution: "Reduce 1/4 cup balsamic vinegar by half",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Core and dice tomatoes into 1/2-inch pieces. Place in a colander, sprinkle with 3/4 tsp salt, and let drain for 15 minutes. This prevents soggy bread.",
        timerSeconds: 900,
        mistakeWarning:
          "Skipping the drain step is the #1 bruschetta mistake — watery tomatoes make the bread fall apart.",
        quickHack:
          "Short on time? Squeeze diced tomatoes gently in your hands over the sink after 5 minutes.",
        cuisineFact:
          "Bruschetta comes from the Italian verb 'bruscare' meaning 'to roast over coals' — it's really about the bread, not the topping.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Make garlic oil: combine 3 tbsp olive oil and 2 minced garlic cloves in a small pan. Warm over low heat for 5 minutes until garlic softens. Don't let it brown.",
        timerSeconds: 300,
        mistakeWarning:
          "Keep the heat LOW. Browned garlic turns bitter and ruins the oil.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Garlic should be soft and fragrant, still pale — never golden or brown.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Stack basil leaves, roll tightly lengthwise, and slice into thin ribbons (chiffonade). Set aside.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Brush both sides of bread with remaining 2 tbsp olive oil. Toast in oven at 400°F for 4-5 minutes per side until golden. Immediately rub the cut garlic clove across the hot surface.",
        timerSeconds: 300,
        mistakeWarning:
          "Watch the bread closely — it goes from golden to burnt in under a minute.",
        quickHack:
          "Use the broiler for 2-3 minutes per side instead of baking for even faster results.",
        cuisineFact: null,
        donenessCue:
          "Bread should be golden, crispy on the edges, but still have a soft interior.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Combine drained tomatoes with cooled garlic oil, basil ribbons, and remaining 1/4 tsp salt. Spoon generously onto toasts and serve immediately.",
        timerSeconds: null,
        mistakeWarning:
          "Assemble right before serving — topped bruschetta gets soggy within 10 minutes.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Each toast should be loaded but not dripping. The bread should still crunch when you bite it.",
        imageUrl: null,
      },
    ],
  },

  gyoza: {
    name: "Gyoza",
    slug: "gyoza",
    description:
      "Japanese pan-fried dumplings with a crispy golden bottom and juicy pork-and-cabbage filling, served with soy-vinegar dip.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 45,
    cookTimeMinutes: 8,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/gyoza.png",
    flavorProfile: ["savory", "crispy", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "gy-1",
        name: "Green cabbage",
        quantity: "6 oz, finely minced",
        isOptional: false,
        substitution: "Napa cabbage",
      },
      {
        id: "gy-2",
        name: "Ground pork",
        quantity: "4 oz",
        isOptional: false,
        substitution: "Ground chicken",
      },
      {
        id: "gy-3",
        name: "Green onion",
        quantity: "1, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gy-4",
        name: "Garlic",
        quantity: "1 clove, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gy-5",
        name: "Fresh ginger",
        quantity: "1/2 tsp, grated",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gy-6",
        name: "Soy sauce",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gy-7",
        name: "Toasted sesame oil",
        quantity: "1 1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gy-8",
        name: "Sake",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "Dry sherry",
      },
      {
        id: "gy-9",
        name: "Gyoza wrappers",
        quantity: "26 round wrappers",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gy-10",
        name: "Neutral oil",
        quantity: "1/2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gy-11",
        name: "Rice vinegar",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Mince cabbage finely, toss with 1/2 tsp salt, and massage until wilted. Squeeze out all excess water firmly — the cabbage should feel almost dry.",
        timerSeconds: null,
        mistakeWarning:
          "Not squeezing out enough water from the cabbage creates a soggy filling that leaks during cooking.",
        quickHack:
          "Use a clean kitchen towel to wring out the cabbage — much faster than squeezing by hand.",
        cuisineFact:
          "Gyoza came to Japan after WWII when soldiers returning from Manchuria recreated Chinese jiaozi with a Japanese twist — the crispy pan-fried bottom.",
        donenessCue:
          "No more moisture should come out when you squeeze a handful.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Combine ground pork, green onion, garlic, ginger, soy sauce, sesame oil, and sake in a bowl. Knead with your hand for 2-3 minutes until sticky and pale. Add squeezed cabbage and knead again.",
        timerSeconds: null,
        mistakeWarning:
          "Knead until the mixture becomes sticky and slightly pale — this develops the protein structure that holds the filling together.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The filling should hold together when you press it and feel sticky, not crumbly.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Place 1 scant tbsp filling on each wrapper. Moisten edges with water, fold in half, and create 3-4 pleats on each side pressing firmly to seal. Shape a flat bottom.",
        timerSeconds: null,
        mistakeWarning:
          "Don't overstuff — more than 1 tbsp per wrapper and they'll burst open during cooking.",
        quickHack:
          "New to folding? Simply fold in half and press edges with a fork for a sealed crescent shape.",
        cuisineFact: null,
        donenessCue:
          "Each gyoza should sit flat on its own with no gaps in the seal.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Heat 1/2 tbsp neutral oil in a nonstick skillet over medium heat. Arrange gyoza flat-side down without crowding. Cook undisturbed until bottoms are golden brown.",
        timerSeconds: 180,
        mistakeWarning:
          "Don't move the gyoza once placed — you want an unbroken crispy crust on the bottom.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Lift one edge to check — the bottom should be deep golden, not pale or dark brown.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Add 2 tbsp water to the pan and immediately cover with a tight lid. Steam until the water evaporates and wrappers turn translucent.",
        timerSeconds: 180,
        mistakeWarning:
          "Don't lift the lid during steaming — you'll release the steam needed to cook the wrappers through.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You'll hear sizzling return when the water is gone — that's your cue to check.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Remove lid, drizzle 1/2 tsp sesame oil around gyoza, and cook uncovered for 2 minutes until bottoms are extra crispy. Serve browned-side up with soy-vinegar dipping sauce.",
        timerSeconds: 120,
        mistakeWarning: null,
        quickHack:
          "Dipping sauce: mix 1 tbsp rice vinegar + 1 tbsp soy sauce + a drop of chili oil.",
        cuisineFact: null,
        donenessCue:
          "The bottoms should be deep golden and audibly crispy when you tap them with chopsticks.",
        imageUrl: null,
      },
    ],
  },

  elote: {
    name: "Elote (Mexican Street Corn)",
    slug: "elote",
    description:
      "Chargrilled corn on the cob slathered with creamy mayo-crema, cotija cheese, chili powder, and a squeeze of lime.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/elote.png",
    flavorProfile: ["smoky", "creamy", "tangy", "spicy"],
    temperature: "hot",
    ingredients: [
      {
        id: "el-1",
        name: "Ears of corn",
        quantity: "4",
        isOptional: false,
        substitution: null,
      },
      {
        id: "el-2",
        name: "Mayonnaise",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "Kewpie mayo",
      },
      {
        id: "el-3",
        name: "Sour cream",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "Mexican crema",
      },
      {
        id: "el-4",
        name: "Cotija cheese",
        quantity: "1/2 cup crumbled",
        isOptional: false,
        substitution: "Feta",
      },
      {
        id: "el-5",
        name: "Chili powder",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: "Tajin",
      },
      {
        id: "el-6",
        name: "Fresh cilantro",
        quantity: "2 tbsp chopped",
        isOptional: false,
        substitution: null,
      },
      {
        id: "el-7",
        name: "Lime",
        quantity: "1 quartered",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Heat grill or grill pan over medium-high heat until hot.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Elote vendors are a fixture of Mexican street life, grilling corn on portable carts called carritos.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction: "Shuck corn, remove silk, pat dry.",
        timerSeconds: null,
        mistakeWarning: "Wet corn steams instead of chars.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction: "Mix mayo and sour cream in a small bowl until smooth.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: "Add a pinch of garlic powder to the mayo mixture.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Place corn on grill, cook 10 minutes total, rotating every 2-3 minutes.",
        timerSeconds: 600,
        mistakeWarning:
          "Don't walk away—corn goes from perfect char to burnt quickly.",
        quickHack: "No grill? Broil on a sheet pan 6 inches from element.",
        cuisineFact: null,
        donenessCue: "Light golden-brown char marks.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Squeeze lime juice over hot corn, brush with mayo-crema, roll in cotija, sprinkle chili powder and cilantro.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Lime juice penetrating hot kernels gives elote its signature brightness.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "miso-soup": {
    name: "Miso Soup",
    slug: "miso-soup",
    description:
      "A warming dashi broth enriched with fermented miso paste, silky tofu cubes, and wisps of wakame seaweed.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 5,
    cookTimeMinutes: 25,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/miso_soup.png",
    flavorProfile: ["umami", "warm", "savory"],
    temperature: "hot",
    ingredients: [
      {
        id: "ms-1",
        name: "Water",
        quantity: "4 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ms-2",
        name: "Kombu (dried kelp)",
        quantity: "1 piece, 4x4 inches",
        isOptional: false,
        substitution: "1 tsp dashi powder",
      },
      {
        id: "ms-3",
        name: "Katsuobushi (bonito flakes)",
        quantity: "1 cup, packed",
        isOptional: false,
        substitution: "1 tsp dashi powder",
      },
      {
        id: "ms-4",
        name: "Miso paste",
        quantity: "4 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ms-5",
        name: "Soft tofu",
        quantity: "7 oz, cubed 1/2-inch",
        isOptional: false,
        substitution: "Silken tofu",
      },
      {
        id: "ms-6",
        name: "Dried wakame seaweed",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ms-7",
        name: "Green onion",
        quantity: "1, thinly sliced",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Add 4 cups water and kombu to a saucepan. Slowly bring to a near-boil over medium-low heat — this should take about 10 minutes. Remove kombu just before it boils.",
        timerSeconds: 600,
        mistakeWarning:
          "Don't let the kombu actually boil — boiled kombu releases a slimy, bitter substance that clouds the dashi.",
        quickHack:
          "Skip homemade dashi: dissolve 1 tsp dashi powder in 4 cups hot water for 90% of the flavor in 10% of the time.",
        cuisineFact:
          "Dashi is considered one of the foundational stocks in world cuisine — its umami discovery led to the identification of the fifth taste.",
        donenessCue:
          "Small bubbles should form around the edges of the pot — remove the kombu right at this point.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add bonito flakes to the pot and bring back to a boil. Simmer for just 30 seconds, then turn off heat. Let flakes settle naturally for 10 minutes.",
        timerSeconds: 30,
        mistakeWarning:
          "Only simmer bonito for 30 seconds — longer makes the dashi bitter and fishy.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The broth should be clear amber with a clean, sea-like aroma.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Strain dashi through a fine-mesh sieve into a clean pot. Discard the bonito flakes. Heat dashi over medium until just below boiling, then turn off heat.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The strained dashi should be clear and golden — if it's cloudy, that's okay, it still tastes great.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Dissolve miso: scoop 1 tbsp miso into a ladle, dip into the warm dashi, and whisk with chopsticks until smooth. Pour back into pot. Repeat for all 4 tbsp. Never add miso directly.",
        timerSeconds: null,
        mistakeWarning:
          "Never boil miso soup — boiling kills the beneficial probiotics and makes it taste flat and lifeless.",
        quickHack: null,
        cuisineFact:
          "Miso paste is a living fermented food — some varieties age for over 3 years, developing deeper umami with time.",
        donenessCue:
          "The soup should be evenly cloudy with no lumps of undissolved miso visible.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Gently add tofu cubes, dried wakame, and sliced green onion. The residual heat will warm everything through. Serve immediately.",
        timerSeconds: null,
        mistakeWarning:
          "Don't stir vigorously or the tofu will break apart. Gentle is key.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The wakame should have rehydrated and expanded. The soup is ready when it's warm but not bubbling.",
        imageUrl: null,
      },
    ],
  },

  "garlic-naan": {
    name: "Garlic Naan",
    slug: "garlic-naan",
    description:
      "Soft, pillowy Indian flatbread cooked on a screaming-hot skillet, brushed with garlic butter and fresh cilantro.",
    cuisineFamily: "indian",
    prepTimeMinutes: 20,
    cookTimeMinutes: 10,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/garlic_naan.png",
    flavorProfile: ["warm", "savory", "rich"],
    temperature: "hot",
    ingredients: [
      {
        id: "gn-1",
        name: "Instant yeast",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gn-2",
        name: "Warm water",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gn-3",
        name: "Sugar",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gn-4",
        name: "Milk",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gn-5",
        name: "Egg",
        quantity: "1/2 whisked",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gn-6",
        name: "Bread flour",
        quantity: "1 3/4 cups",
        isOptional: false,
        substitution: "All-purpose flour",
      },
      {
        id: "gn-7",
        name: "Salt",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gn-8",
        name: "Ghee or butter",
        quantity: "4 tbsp melted",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gn-9",
        name: "Garlic",
        quantity: "1 clove minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gn-10",
        name: "Fresh cilantro",
        quantity: "chopped",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Mix yeast with warm water and sugar, cover, leave 10 minutes until foamy.",
        timerSeconds: 600,
        mistakeWarning:
          "Water above 50°C/120°F kills the yeast—should feel like a warm bath.",
        quickHack: null,
        cuisineFact:
          "Traditional naan is baked in a tandoor at 480°C—this skillet method replicates the char.",
        donenessCue: "Bubbly and foamy on top.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Whisk milk and egg, sift flour and salt into a bowl, make a well. Pour yeast and milk-egg mixtures in, stir with spatula then bring together into a ball.",
        timerSeconds: null,
        mistakeWarning: "Do not knead—over-working makes naan tough.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Slightly sticky and shaggy, not smooth.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Cover with cling wrap, leave in warm place 1-1.5 hours until doubled.",
        timerSeconds: 5400,
        mistakeWarning: null,
        quickHack: "Place bowl in oven with just the light on for warmth.",
        cuisineFact: null,
        donenessCue: "Puffy, doubled, springs back slowly when poked.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Divide dough into 6 pieces, shape into balls, rest 15 minutes, then roll each 3-4mm thick.",
        timerSeconds: 900,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Heat cast iron skillet on high until wisps of smoke appear, cook dough 1-1.5 minutes until large bubbles form, flip, cook 1 more minute.",
        timerSeconds: 150,
        mistakeWarning:
          "If pan isn't hot enough you get flat bread instead of bubbly naan.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Large charred bubbles, deep golden-brown spots.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction: "Brush immediately with garlic butter, sprinkle cilantro.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Make double batch and freeze—reheat on hot skillet 30 seconds per side.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "spring-rolls": {
    name: "Spring Rolls",
    slug: "spring-rolls",
    description:
      "Crispy, golden-fried rolls filled with vegetables and glass noodles, served with a sweet chili dipping sauce.",
    cuisineFamily: "thai",
    prepTimeMinutes: 30,
    cookTimeMinutes: 25,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/spring_rolls.png",
    flavorProfile: ["crispy", "savory", "fresh"],
    temperature: "hot",
    ingredients: [
      {
        id: "sr-1",
        name: "Spring roll wrappers",
        quantity: "12 sheets (8-inch square)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sr-2",
        name: "Glass noodles",
        quantity: "50g (1.7 oz)",
        isOptional: false,
        substitution: "Thin rice noodles",
      },
      {
        id: "sr-3",
        name: "Napa cabbage",
        quantity: "2 cups, shredded",
        isOptional: false,
        substitution: "Green cabbage",
      },
      {
        id: "sr-4",
        name: "Carrot",
        quantity: "1 medium, shredded",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sr-5",
        name: "Shiitake mushrooms",
        quantity: "1/2 cup, sliced",
        isOptional: false,
        substitution: "Any mushroom",
      },
      {
        id: "sr-6",
        name: "Fresh ginger",
        quantity: "2 tsp, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sr-7",
        name: "Oyster sauce",
        quantity: "1 1/2 tbsp",
        isOptional: false,
        substitution: "Hoisin sauce",
      },
      {
        id: "sr-8",
        name: "Soy sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sr-9",
        name: "Vegetable oil",
        quantity: "3 cups (for frying)",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Soak glass noodles in room temperature water for 10 minutes until pliable. Drain and cut into 2-inch pieces.",
        timerSeconds: 600,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Glass noodles are called 'glass' because they turn translucent when cooked — they're made from mung bean starch, making them naturally gluten-free.",
        donenessCue: "Noodles should be soft and bendable, not crunchy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Heat 1 tbsp oil in a wok over high heat. Add ginger and cook 15 seconds. Add cabbage, carrot, and mushrooms. Stir-fry 3 minutes until wilted but still crunchy.",
        timerSeconds: 180,
        mistakeWarning:
          "Don't overcook the vegetables — they should still have some crunch. They'll cook more when fried in the wrapper.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Vegetables should be wilted and reduced by half, but still have a visible crunch when you bite one.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add glass noodles, oyster sauce, soy sauce, and sesame oil. Stir-fry 1 minute until liquid evaporates. Spread filling on a plate and refrigerate 15 minutes until cool.",
        timerSeconds: 60,
        mistakeWarning:
          "The filling MUST be completely cool before wrapping — hot filling makes wrappers soggy and they'll burst during frying.",
        quickHack:
          "Spread filling thin on a baking sheet for faster cooling — ready in 10 minutes instead of 15.",
        cuisineFact: null,
        donenessCue:
          "No liquid should pool when you tilt the plate. The filling should be tacky, not wet.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Place wrapper diamond-style. Add 2-3 tbsp filling near bottom corner. Roll up tightly, folding in sides like an envelope. Seal the top corner with flour-water paste.",
        timerSeconds: null,
        mistakeWarning:
          "Roll tightly with no air pockets — trapped air expands during frying and bursts the wrapper.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Each roll should be firm and tight, about the size of a cigar, with a sealed tip.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Heat 3 cups oil in a heavy pot to 325°F. Fry 3-4 rolls at a time for 4-5 minutes, turning occasionally, until deep golden brown. Drain on a wire rack.",
        timerSeconds: 270,
        mistakeWarning:
          "Don't crowd the pot — too many rolls at once drops the oil temperature, making them greasy instead of crispy.",
        quickHack:
          "Test oil temp with a wooden chopstick — steady small bubbles means it's ready.",
        cuisineFact: null,
        donenessCue:
          "Rolls should be uniformly deep golden — not pale (undercooked) or dark brown (overcooked).",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Serve immediately with sweet chili sauce for dipping. The rolls are best within 15 minutes of frying.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Freeze uncooked rolls on a baking sheet, then bag them. Fry from frozen at 310°F for 6-7 minutes for instant appetizers anytime.",
        cuisineFact: null,
        donenessCue:
          "You should hear a satisfying crunch when you bite through the wrapper.",
        imageUrl: null,
      },
    ],
  },

  "caprese-salad": {
    name: "Caprese Salad",
    slug: "caprese-salad",
    description:
      "Fresh bocconcini and cherry tomatoes tossed with torn basil and a simple mustard vinaigrette, finished with balsamic glaze.",
    cuisineFamily: "italian",
    prepTimeMinutes: 15,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/caprese_salad.png",
    flavorProfile: ["fresh", "creamy", "bright", "herby"],
    temperature: "room-temp",
    ingredients: [
      {
        id: "cp-1",
        name: "Bocconcini or fresh mozzarella",
        quantity: "220g halved",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cp-2",
        name: "Cherry tomatoes",
        quantity: "500g halved",
        isOptional: false,
        substitution: "Heirloom sliced",
      },
      {
        id: "cp-3",
        name: "Fresh basil",
        quantity: "1/2 cup torn",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cp-4",
        name: "Extra virgin olive oil",
        quantity: "2.5 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cp-5",
        name: "White wine vinegar",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Red wine vinegar",
      },
      {
        id: "cp-6",
        name: "Garlic",
        quantity: "1 small clove minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cp-7",
        name: "Dijon mustard",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cp-8",
        name: "Balsamic glaze",
        quantity: "for drizzling",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Remove mozzarella from fridge 30 minutes before serving.",
        timerSeconds: null,
        mistakeWarning:
          "Cold mozzarella tastes rubbery—room temperature releases full flavor.",
        quickHack: null,
        cuisineFact:
          "Caprese originates from the island of Capri and represents the colors of the Italian flag.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction: "Halve tomatoes and mozzarella, tear basil by hand.",
        timerSeconds: null,
        mistakeWarning:
          "Cutting basil with a knife bruises it and turns it black.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Combine olive oil, vinegar, garlic, mustard, salt and pepper in a jar and shake to emulsify.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Dressing slightly thickened and cohesive.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Place tomatoes, mozzarella, and basil in a bowl, drizzle vinaigrette, toss gently.",
        timerSeconds: null,
        mistakeWarning: "Do not make ahead—best assembled right before eating.",
        quickHack:
          "Buy pre-made balsamic glaze instead of reducing vinegar 30 minutes.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "baingan-bharta": {
    name: "Baingan Bharta",
    slug: "baingan-bharta",
    description:
      "Fire-roasted eggplant mashed and cooked with onions, tomatoes, green chilies, and aromatic spices for a smoky, hearty dish.",
    cuisineFamily: "indian",
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/baingan_bharta.png",
    flavorProfile: ["smoky", "savory", "warm"],
    temperature: "hot",
    ingredients: [
      {
        id: "bb-1",
        name: "Large eggplants",
        quantity: "2 (about 1.5 lb total)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-2",
        name: "Onion",
        quantity: "1 large, finely chopped",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-3",
        name: "Tomatoes",
        quantity: "3 medium, finely chopped",
        isOptional: false,
        substitution: "1 can diced tomatoes",
      },
      {
        id: "bb-4",
        name: "Garlic",
        quantity: "8-10 cloves, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-5",
        name: "Green chili",
        quantity: "1 tsp, chopped",
        isOptional: true,
        substitution: "1/4 tsp cayenne pepper",
      },
      {
        id: "bb-6",
        name: "Red chili powder",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-7",
        name: "Oil",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "Mustard oil for authenticity",
      },
      {
        id: "bb-8",
        name: "Fresh cilantro",
        quantity: "2 tbsp, chopped",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Make 4 vertical slits in each eggplant from base to 1 inch from stem. Place directly on a medium gas flame. Roast, turning every 2-3 minutes with tongs, until completely charred and tender.",
        timerSeconds: 900,
        mistakeWarning:
          "Don't use oven-only roasting — the direct flame gives bharta its essential smoky flavor. No gas stove? Use the broiler 4 inches from heat.",
        quickHack:
          "Wrap roasted eggplant in wet paper towel for 10 minutes — the steam makes peeling effortless.",
        cuisineFact:
          "Baingan bharta means 'smashed eggplant' in Hindi. The dish originated in Punjab where mustard oil and open-fire cooking are central to the cuisine.",
        donenessCue:
          "A knife should slide through the eggplant with zero resistance. The skin should be completely blackened and papery.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Cool the roasted eggplant briefly, then peel away all charred skin under running water. Roughly chop or mash the soft flesh. Set aside.",
        timerSeconds: null,
        mistakeWarning:
          "Remove every bit of charred skin — even small pieces taste bitter and ruin the texture.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The flesh should be soft, smoky-smelling, and pale greenish-brown. No black skin bits remaining.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Heat oil in a skillet over medium heat. Add onions and garlic, sauté until translucent and softened.",
        timerSeconds: 240,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Onions should be soft and glassy, not browned.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add green chili and tomatoes. Cook, stirring often, until the tomatoes break down completely and oil starts to separate from the masala.",
        timerSeconds: 480,
        mistakeWarning:
          "Don't skip the 'oil separating' stage — this is the sign that the raw tomato taste is fully cooked out. It's the foundation of good Indian cooking.",
        quickHack: null,
        cuisineFact:
          "The moment oil separates from tomato masala is called 'bhuno' — it's the most important technique in Indian cooking.",
        donenessCue:
          "You'll see shiny oil pooling at the edges of the masala, and the tomatoes will look like a paste, not chunks.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Add red chili powder and stir. Mix in the mashed eggplant and salt. Sauté on low-medium heat for 4-5 minutes until flavors meld. Garnish with cilantro and serve hot.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The bharta should be thick and cohesive, not watery. It should taste deeply smoky with layers of spice.",
        imageUrl: null,
      },
    ],
  },

  karaage: {
    name: "Karaage",
    slug: "karaage",
    description:
      "Bite-sized chicken thigh pieces marinated in soy, ginger, and garlic, then double-fried to an ultra-crispy, juicy finish.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/karaage.png",
    flavorProfile: ["crispy", "savory", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "ka-1",
        name: "Boneless chicken thighs",
        quantity: "1.5 lb, skin-on, cut into 2-inch pieces",
        isOptional: false,
        substitution: "Boneless thighs without skin",
      },
      {
        id: "ka-2",
        name: "Soy sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ka-3",
        name: "Sake",
        quantity: "1/2 tbsp",
        isOptional: false,
        substitution: "Dry sherry",
      },
      {
        id: "ka-4",
        name: "Fresh ginger",
        quantity: "1/2 tsp, grated",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ka-5",
        name: "Garlic",
        quantity: "1 clove, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ka-6",
        name: "Toasted sesame oil",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ka-7",
        name: "Potato starch",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "Cornstarch",
      },
      {
        id: "ka-8",
        name: "All-purpose flour",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ka-9",
        name: "Neutral oil",
        quantity: "3-4 cups (for frying)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ka-10",
        name: "Lemon wedges",
        quantity: "for serving",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Season chicken with salt and pepper. Combine soy sauce, sake, ginger, garlic, and sesame oil. Toss with chicken, cover, and refrigerate for 30 minutes.",
        timerSeconds: 1800,
        mistakeWarning:
          "Don't skip the marinade time — even 30 minutes lets the soy and ginger penetrate deep into the chicken for maximum flavor.",
        quickHack: null,
        cuisineFact:
          "Karaage originated in Nakatsu city in Oita Prefecture, Japan, which still holds an annual fried chicken festival every year.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Heat 3-4 cups oil in a heavy pot to 325°F. Mix potato starch and flour in a shallow dish. Coat each marinated piece lightly, shaking off excess.",
        timerSeconds: null,
        mistakeWarning:
          "A light dusting is key — too much coating makes the crust thick and bready instead of shatteringly crispy.",
        quickHack:
          "Let coated chicken rest 5 minutes before frying — the surface dries slightly for extra crispiness.",
        cuisineFact: null,
        donenessCue:
          "Each piece should have a thin, even coating with no clumps of starch.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "First fry: cook 3-5 pieces at 325°F for 90 seconds until light golden. Transfer to a wire rack. Don't crowd the pot.",
        timerSeconds: 90,
        mistakeWarning:
          "Overcrowding drops oil temperature dramatically — fry in small batches to keep oil hot and results crispy.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Pieces should be pale golden — they'll look slightly undercooked. That's correct for the first fry.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Let all chicken pieces rest on the rack for 3-5 minutes. During this rest, the residual heat continues cooking the interior. Raise oil temperature to 350°F.",
        timerSeconds: 240,
        mistakeWarning:
          "Don't skip the rest — this is the secret of the double-fry method. The interior finishes cooking while the surface dries out for the second fry.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Second fry: cook the rested pieces at 350°F for 45 seconds until deep golden and shatteringly crispy. Drain on rack and serve immediately with lemon wedges.",
        timerSeconds: 45,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "The double-fry technique was perfected at Japanese izakayas — the first fry cooks the inside, the second fry crisps the outside to perfection.",
        donenessCue:
          "The coating should be deep golden brown and make a loud crunch when you bite through it. Juice should run clear.",
        imageUrl: null,
      },
    ],
  },

  edamame: {
    name: "Edamame",
    slug: "edamame",
    description:
      "Steamed young soybeans tossed with flaky sea salt — the perfect snack or starter that's ready in minutes.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 2,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/edamame.png",
    flavorProfile: ["savory", "fresh", "snacky"],
    temperature: "hot",
    ingredients: [
      {
        id: "ed-1",
        name: "Frozen edamame in pods",
        quantity: "1 lb bag",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ed-2",
        name: "Flaky sea salt",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Kosher salt",
      },
      {
        id: "ed-3",
        name: "Toasted sesame oil",
        quantity: "1 tsp",
        isOptional: true,
        substitution: null,
      },
      {
        id: "ed-4",
        name: "Chili flakes",
        quantity: "pinch",
        isOptional: true,
        substitution: "Shichimi togarashi",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Bring a large pot of salted water to a rolling boil. Add frozen edamame pods straight from the bag — no thawing needed.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Microwave method: place edamame in a microwave-safe bowl with 2 tbsp water, cover, and microwave 3-4 minutes.",
        cuisineFact:
          "Edamame means 'stem bean' in Japanese — they were traditionally sold still attached to their stems at markets.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Boil for 4-5 minutes until the beans inside are tender but still have a slight bite. Drain immediately.",
        timerSeconds: 270,
        mistakeWarning:
          "Don't overcook — mushy edamame loses its satisfying pop. They should be bright green and firm-tender.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Squeeze a pod — the bean should slip out easily and taste tender, not starchy or hard.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Toss hot edamame with flaky sea salt and a drizzle of sesame oil if using. Add chili flakes for heat. Serve warm in a bowl with an empty dish for pods.",
        timerSeconds: null,
        mistakeWarning:
          "Salt while they're still hot and wet — the salt sticks better to damp pods.",
        quickHack: null,
        cuisineFact:
          "In Japan, edamame are the go-to beer snack at izakayas — they're to Japanese bars what peanuts are to American ones.",
        donenessCue:
          "The pods should glisten slightly and taste well-seasoned when you bite one.",
        imageUrl: null,
      },
    ],
  },

  "pico-de-gallo": {
    name: "Pico de Gallo",
    slug: "pico-de-gallo",
    description:
      "A chunky fresh salsa of diced tomatoes, onion, cilantro, jalapeño, and lime — the essential Mexican table condiment.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 15,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/pico_de_gallo.png",
    flavorProfile: ["fresh", "bright", "spicy"],
    temperature: "cold",
    ingredients: [
      {
        id: "pg-1",
        name: "Roma tomatoes",
        quantity: "6 medium, diced",
        isOptional: false,
        substitution: "Any firm, ripe tomatoes",
      },
      {
        id: "pg-2",
        name: "White onion",
        quantity: "1/2 medium, finely diced",
        isOptional: false,
        substitution: "Red onion",
      },
      {
        id: "pg-3",
        name: "Fresh cilantro",
        quantity: "1/2 cup, chopped",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pg-4",
        name: "Jalapeño",
        quantity: "1-2, seeded and finely diced",
        isOptional: false,
        substitution: "Serrano pepper",
      },
      {
        id: "pg-5",
        name: "Fresh lime juice",
        quantity: "2 tbsp (about 1 lime)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pg-6",
        name: "Salt",
        quantity: "3/4 tsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Core the tomatoes and dice into 1/4-inch pieces. Transfer to a colander and let excess juice drain for 5 minutes. This keeps your pico from being watery.",
        timerSeconds: 300,
        mistakeWarning:
          "Use Roma tomatoes — they have less juice and more flesh than other varieties. Watery tomatoes make watery pico.",
        quickHack:
          "Gently squeeze diced tomatoes in your hand over the sink to speed up draining.",
        cuisineFact:
          "Pico de gallo means 'rooster's beak' in Spanish — possibly because it was originally eaten pinched between thumb and finger, like a beak pecking.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Finely dice the onion. For milder flavor, rinse the diced onion under cold water and pat dry. Finely dice the jalapeño — remove seeds and ribs for less heat, keep them for more.",
        timerSeconds: null,
        mistakeWarning:
          "Wash your hands after handling jalapeño — touching your eyes with pepper oils is memorably painful.",
        quickHack:
          "Soak diced onion in ice water for 5 minutes to remove the sharp bite while keeping the crunch.",
        cuisineFact: null,
        donenessCue:
          "All pieces should be roughly the same small size — uniformity matters for even flavor in every bite.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Combine drained tomatoes, onion, cilantro, and jalapeño in a bowl. Add lime juice and salt. Stir gently — don't mash. Taste and adjust salt and lime. Let it sit 15 minutes before serving for flavors to meld.",
        timerSeconds: null,
        mistakeWarning:
          "Don't stir aggressively — you want distinct chunks, not a mushy salsa. Fold gently.",
        quickHack: null,
        cuisineFact:
          "In Mexico, pico de gallo is called 'salsa fresca' or 'salsa cruda' — it's never cooked, and it's on every table.",
        donenessCue:
          "It should taste bright, balanced, and slightly spicy. If it's flat, add more salt. If it's dull, add more lime.",
        imageUrl: null,
      },
    ],
  },

  onigiri: {
    name: "Onigiri",
    slug: "onigiri",
    description:
      "Japanese rice balls shaped by hand, filled with savory ingredients, and wrapped in crisp nori — the perfect portable snack.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/onigiri.png",
    flavorProfile: ["savory", "umami", "comforting"],
    temperature: "room-temp",
    ingredients: [
      {
        id: "on-1",
        name: "Short-grain Japanese rice",
        quantity: "2 cups, uncooked",
        isOptional: false,
        substitution: "Sushi rice",
      },
      {
        id: "on-2",
        name: "Water",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "on-3",
        name: "Salt",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "on-4",
        name: "Nori sheets",
        quantity: "4 sheets, cut in thirds",
        isOptional: false,
        substitution: null,
      },
      {
        id: "on-5",
        name: "Tuna (canned)",
        quantity: "1 small can, drained",
        isOptional: true,
        substitution: "Salmon flakes, pickled plum (umeboshi), or kombu",
      },
      {
        id: "on-6",
        name: "Mayonnaise",
        quantity: "1 tbsp (for tuna filling)",
        isOptional: true,
        substitution: null,
      },
      {
        id: "on-7",
        name: "Soy sauce",
        quantity: "1 tsp (for tuna filling)",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Rinse rice in cold water 3-4 times until the water runs mostly clear. Cook in a rice cooker or pot with 2 cups water. Let it steam with the lid on for 10 minutes after cooking.",
        timerSeconds: null,
        mistakeWarning:
          "Don't skip rinsing — unwashed rice has excess surface starch that makes onigiri gummy instead of tender.",
        quickHack:
          "Use a rice cooker — perfect rice every time with zero monitoring.",
        cuisineFact:
          "Onigiri date back over 2,000 years in Japan. Samurai carried them as portable battlefield rations wrapped in bamboo leaves.",
        donenessCue:
          "Rice should be tender, slightly sticky, and hold together when pressed, but not mushy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Prepare the filling: mix drained tuna with mayo and soy sauce. If using umeboshi or kombu, no extra prep needed. Set a small bowl of salted water nearby for wetting your hands.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Buy pre-seasoned tuna pouches to skip the mixing step entirely.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Wet your hands with salted water (this prevents sticking and seasons the outside). Take a tennis-ball-sized scoop of warm rice, flatten in your palm, press a dent in the center, and add 1 tsp filling.",
        timerSeconds: null,
        mistakeWarning:
          "The rice must be warm — cold rice won't stick together and hot rice burns your hands. Wait until it's comfortably warm to touch.",
        quickHack:
          "Use plastic wrap: place rice on wrap, add filling, gather corners and twist to shape — no sticky hands.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Close the rice over the filling and shape into a triangle by cupping both hands at right angles, pressing gently but firmly. Rotate and press 3-4 times per side. Wrap a strip of nori around the base.",
        timerSeconds: null,
        mistakeWarning:
          "Press firmly enough to hold together but don't squeeze — over-compressed rice is dense and unpleasant.",
        quickHack: null,
        cuisineFact:
          "The triangular shape isn't just tradition — it represents mountain shapes, which are considered sacred in Japanese culture.",
        donenessCue:
          "Each onigiri should hold its shape when set down, feel firm but not hard, and the nori should crinkle slightly.",
        imageUrl: null,
      },
    ],
  },

  minestrone: {
    name: "Minestrone",
    slug: "minestrone",
    description:
      "A hearty Italian vegetable soup loaded with beans, pasta, and seasonal vegetables in a rich tomato broth.",
    cuisineFamily: "italian",
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/minestrone.png",
    flavorProfile: ["savory", "warm", "herby"],
    temperature: "hot",
    ingredients: [
      {
        id: "mn-1",
        name: "Olive oil",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mn-2",
        name: "Onion",
        quantity: "1 large, diced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mn-3",
        name: "Carrots",
        quantity: "2 medium, diced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mn-4",
        name: "Celery",
        quantity: "2 stalks, diced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mn-5",
        name: "Garlic",
        quantity: "4 cloves, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mn-6",
        name: "Canned diced tomatoes",
        quantity: "1 can (14 oz)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mn-7",
        name: "Vegetable broth",
        quantity: "6 cups",
        isOptional: false,
        substitution: "Chicken broth",
      },
      {
        id: "mn-8",
        name: "Cannellini beans",
        quantity: "1 can (15 oz), drained",
        isOptional: false,
        substitution: "Kidney beans or chickpeas",
      },
      {
        id: "mn-9",
        name: "Small pasta",
        quantity: "1/2 cup (ditalini or elbow)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mn-10",
        name: "Zucchini",
        quantity: "1 medium, diced",
        isOptional: false,
        substitution: "Green beans",
      },
      {
        id: "mn-11",
        name: "Fresh spinach",
        quantity: "2 cups",
        isOptional: false,
        substitution: "Kale",
      },
      {
        id: "mn-12",
        name: "Parmesan rind",
        quantity: "1 piece (optional)",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Heat olive oil in a large pot over medium heat. Add onion, carrots, and celery (the classic soffritto). Cook, stirring occasionally, until vegetables are softened.",
        timerSeconds: 420,
        mistakeWarning:
          "Don't rush the soffritto — these 7 minutes build the flavor foundation of the entire soup. Low and slow.",
        quickHack: null,
        cuisineFact:
          "Every Italian nonna has a different minestrone recipe. There is no 'authentic' version — it literally means 'big soup' and uses whatever vegetables are in season.",
        donenessCue:
          "The onion should be translucent and the carrots slightly softened but not mushy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add garlic and cook 30 seconds until fragrant. Pour in diced tomatoes and broth. Add the Parmesan rind if using. Bring to a boil, then reduce to a simmer.",
        timerSeconds: null,
        mistakeWarning:
          "Don't forget the Parmesan rind — it melts into the broth and adds incredible depth. Save rinds in the freezer for soup days.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The broth should be actively simmering with gentle bubbles, not a rolling boil.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add beans and zucchini. Simmer for 10 minutes. Then add the pasta directly into the soup. Cook until pasta is al dente.",
        timerSeconds: 600,
        mistakeWarning:
          "Cook pasta IN the soup, not separately — the starch thickens the broth and the pasta absorbs flavor. But watch it closely: overcooked pasta turns the soup gluey.",
        quickHack:
          "If making ahead, cook pasta separately and add when reheating — it won't get mushy.",
        cuisineFact: null,
        donenessCue:
          "Pasta should be tender but with a slight firmness in the center — it will continue cooking from residual heat.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Stir in spinach and let it wilt for 1-2 minutes. Remove Parmesan rind. Season with salt and pepper. Serve with a drizzle of olive oil and grated Parmesan on top.",
        timerSeconds: null,
        mistakeWarning:
          "Add the spinach at the very end — it only needs 1-2 minutes. Overcooked spinach turns slimy and drab.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The soup should be thick and chunky — more stew than broth. The spinach should be bright green and just wilted.",
        imageUrl: null,
      },
    ],
  },

  esquites: {
    name: "Esquites",
    slug: "esquites",
    description:
      "Mexican street corn salad — charred corn kernels tossed with mayo, cotija, lime, and chili in a cup. All the flavor of elote, no cob required.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/esquites.png",
    flavorProfile: ["smoky", "creamy", "tangy"],
    temperature: "warm",
    ingredients: [
      {
        id: "eq-1",
        name: "Corn kernels",
        quantity: "4 cups (from 4 ears or 2 bags frozen)",
        isOptional: false,
        substitution: "Canned corn, drained",
      },
      {
        id: "eq-2",
        name: "Butter",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Olive oil",
      },
      {
        id: "eq-3",
        name: "Mayonnaise",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "Mexican crema",
      },
      {
        id: "eq-4",
        name: "Cotija cheese",
        quantity: "1/3 cup, crumbled",
        isOptional: false,
        substitution: "Feta cheese",
      },
      {
        id: "eq-5",
        name: "Fresh lime juice",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "eq-6",
        name: "Chili powder",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Tajin seasoning",
      },
      {
        id: "eq-7",
        name: "Fresh cilantro",
        quantity: "2 tbsp, chopped",
        isOptional: true,
        substitution: null,
      },
      {
        id: "eq-8",
        name: "Jalapeño",
        quantity: "1, seeded and diced",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "If using fresh corn, cut kernels off the cobs by standing each ear upright in a large bowl and slicing downward. If using frozen, thaw and pat completely dry with paper towels.",
        timerSeconds: null,
        mistakeWarning:
          "Dry the corn thoroughly — wet kernels steam instead of char, and you need that smoky charred flavor.",
        quickHack:
          "Frozen corn works great here — just make sure it's bone-dry before it hits the pan.",
        cuisineFact:
          "Esquites is the off-the-cob version of elote — same flavors, easier to eat. Street vendors in Mexico City serve it in styrofoam cups with a spoon.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Melt butter in a large skillet over high heat until it just starts to brown. Add corn in a single layer. Let it sit undisturbed for 2-3 minutes to develop char marks.",
        timerSeconds: 180,
        mistakeWarning:
          "Resist stirring — let the corn sit and make contact with the hot pan. Constant stirring prevents charring.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You should hear popping and see some kernels starting to turn golden-brown and slightly blackened.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Stir and cook 2-3 more minutes until corn is charred in spots but still bright yellow overall. Remove from heat and let cool for 2 minutes.",
        timerSeconds: 150,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "About 20-30% of kernels should have char marks. The corn should smell smoky and nutty.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Toss warm corn with mayo, lime juice, half the cotija, chili powder, and jalapeño if using. Serve in cups or bowls, topped with remaining cotija, cilantro, and an extra squeeze of lime.",
        timerSeconds: null,
        mistakeWarning:
          "Mix while the corn is still warm — the heat melts the mayo slightly and creates a creamy coating.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Every kernel should be lightly coated. It should taste smoky, tangy, creamy, and slightly spicy all at once.",
        imageUrl: null,
      },
    ],
  },

  "masoor-dal": {
    name: "Masoor Dal",
    slug: "masoor-dal",
    description:
      "Comforting red lentils simmered until velvety smooth, finished with a fragrant tadka of cumin, garlic, and dried chilies.",
    cuisineFamily: "indian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/masoor_dal.png",
    flavorProfile: ["warm", "savory", "comforting"],
    temperature: "hot",
    ingredients: [
      {
        id: "md-1",
        name: "Red lentils (masoor dal)",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "md-2",
        name: "Water",
        quantity: "3 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "md-3",
        name: "Turmeric",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "md-4",
        name: "Salt",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "md-5",
        name: "Ghee or oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Butter",
      },
      {
        id: "md-6",
        name: "Cumin seeds",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "md-7",
        name: "Garlic",
        quantity: "4 cloves, thinly sliced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "md-8",
        name: "Dried red chilies",
        quantity: "2 whole",
        isOptional: false,
        substitution: "1/4 tsp red chili flakes",
      },
      {
        id: "md-9",
        name: "Tomato",
        quantity: "1 medium, chopped",
        isOptional: false,
        substitution: null,
      },
      {
        id: "md-10",
        name: "Fresh cilantro",
        quantity: "for garnish",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Rinse lentils in cold water 2-3 times until the water runs clear. Add to a pot with 3 cups water, turmeric, and salt. Bring to a boil.",
        timerSeconds: null,
        mistakeWarning:
          "Skim off any foam that rises to the surface during boiling — it keeps the dal clear and clean-tasting.",
        quickHack: null,
        cuisineFact:
          "Red lentils are the fastest-cooking legume — they don't need soaking and break down naturally into a creamy consistency.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Reduce heat to medium-low and simmer partially covered, stirring occasionally, until lentils are completely soft and broken down into a porridge-like consistency.",
        timerSeconds: 1200,
        mistakeWarning:
          "Keep the lid slightly ajar — fully covered dal tends to boil over, making a huge mess on your stove.",
        quickHack:
          "Use a pressure cooker for 3 whistles (about 8 minutes) — same result in a third of the time.",
        cuisineFact: null,
        donenessCue:
          "The lentils should be completely dissolved. No individual lentil shapes should be visible — it should look like a thick, creamy soup.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Make the tadka: heat ghee in a small pan over medium heat. Add cumin seeds — they should sizzle immediately. Add sliced garlic and dried chilies. Fry until garlic is golden.",
        timerSeconds: 90,
        mistakeWarning:
          "Watch the garlic like a hawk — it goes from golden to burnt in seconds. The moment it turns light gold, add the tomato immediately.",
        quickHack: null,
        cuisineFact:
          "Tadka (tempering) is the signature technique of Indian cooking — hot fat blooms whole spices, releasing flavors that infusing cold oil cannot achieve.",
        donenessCue:
          "Cumin should be darkened and fragrant, garlic slices golden at the edges, chilies puffed and darker.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add chopped tomato to the tadka pan. Cook until softened, about 2 minutes. Pour the entire tadka — oil, spices, and all — into the simmering dal. Stir to combine. Garnish with cilantro and serve hot with rice or roti.",
        timerSeconds: null,
        mistakeWarning:
          "Pour the tadka into the dal, not the other way around. The sizzle when hot oil hits the dal is essential — it's both dramatic and functional, infusing the spice flavor throughout.",
        quickHack: null,
        cuisineFact:
          "In Indian households, the sound of tadka crackling into dal is the audible signal that dinner is almost ready.",
        donenessCue:
          "The dal should be creamy with a sheen of spiced oil on top. It should taste earthy, garlicky, and warming.",
        imageUrl: null,
      },
    ],
  },

  "mexican-rice": {
    name: "Mexican Rice",
    slug: "mexican-rice",
    description:
      "Toasted rice simmered in tomato broth with onion, garlic, and cumin — the essential side to any Mexican meal.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/mexican_rice.png",
    flavorProfile: ["savory", "warm", "tomato-y"],
    temperature: "hot",
    ingredients: [
      {
        id: "mr-1",
        name: "Long-grain white rice",
        quantity: "1.5 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mr-2",
        name: "Vegetable oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Canola oil",
      },
      {
        id: "mr-3",
        name: "Onion",
        quantity: "1/2 medium, finely diced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mr-4",
        name: "Garlic",
        quantity: "2 cloves, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mr-5",
        name: "Tomato sauce",
        quantity: "1 cup (8 oz can)",
        isOptional: false,
        substitution: "2 blended Roma tomatoes",
      },
      {
        id: "mr-6",
        name: "Chicken broth",
        quantity: "1.5 cups",
        isOptional: false,
        substitution: "Vegetable broth",
      },
      {
        id: "mr-7",
        name: "Cumin",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mr-8",
        name: "Salt",
        quantity: "3/4 tsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Rinse rice under cold water until water runs clear. Drain well and let sit 5 minutes — the rice must be dry before toasting or it will steam instead of fry.",
        timerSeconds: 300,
        mistakeWarning:
          "Wet rice in hot oil splatters dangerously and steams instead of toasting. Pat it dry if needed.",
        quickHack:
          "Spread rinsed rice on a sheet pan for 3 minutes — it dries faster with more surface area.",
        cuisineFact:
          "Toasting rice before simmering is called 'arroz a la mexicana' — the Maillard reaction on each grain creates a nutty depth that plain rice can't match.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Heat oil in a medium saucepan over medium heat. Add the dry rice and toast, stirring frequently, until the grains turn golden and smell nutty.",
        timerSeconds: 420,
        mistakeWarning:
          "Stir constantly during toasting — rice at the bottom burns while the top stays white if you don't keep it moving.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The rice should be evenly golden — not white (undertoasted) and not dark brown (burnt). It should smell like popcorn.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add diced onion and garlic to the toasted rice. Cook 1-2 minutes until fragrant. Stir in tomato sauce, broth, cumin, and salt. Bring to a boil.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The liquid should come to a full rolling boil before you cover it.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Once boiling, reduce heat to the lowest setting, cover with a tight-fitting lid, and cook undisturbed. Do not lift the lid during cooking.",
        timerSeconds: 1080,
        mistakeWarning:
          "Do NOT lift the lid — every peek releases steam and extends cooking time. Trust the process.",
        quickHack:
          "If your lid isn't tight, place a sheet of foil between the pot and lid to trap steam.",
        cuisineFact: null,
        donenessCue:
          "After 18 minutes, the liquid should be fully absorbed. You'll stop hearing bubbling sounds.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Remove from heat and let rest with the lid on for 5 minutes. Fluff with a fork — never stir with a spoon, which crushes the grains. Taste for salt and serve.",
        timerSeconds: 300,
        mistakeWarning:
          "Fluff with a fork, not a spoon or spatula — stirring compacts the rice into a gluey mass.",
        quickHack: null,
        cuisineFact:
          "The crispy rice layer at the bottom of the pot is called 'pegado' and is considered the best part by many Mexican cooks.",
        donenessCue:
          "Each grain should be separate and fluffy, tinted orange-red from the tomato, with a slight nuttiness from the toasting.",
        imageUrl: null,
      },
    ],
  },

  arancini: {
    name: "Arancini",
    slug: "arancini",
    description:
      "Golden-fried Sicilian rice balls stuffed with mozzarella, coated in crispy breadcrumbs — molten cheese in every bite.",
    cuisineFamily: "italian",
    prepTimeMinutes: 30,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/arancini.png",
    flavorProfile: ["crispy", "savory", "cheesy"],
    temperature: "hot",
    ingredients: [
      {
        id: "ar-1",
        name: "Arborio rice",
        quantity: "1.5 cups",
        isOptional: false,
        substitution: "Any short-grain rice",
      },
      {
        id: "ar-2",
        name: "Chicken or vegetable broth",
        quantity: "3.5 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ar-3",
        name: "Parmesan",
        quantity: "1/2 cup, grated",
        isOptional: false,
        substitution: "Pecorino Romano",
      },
      {
        id: "ar-4",
        name: "Eggs",
        quantity: "3 (1 for rice, 2 for coating)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ar-5",
        name: "Mozzarella",
        quantity: "4 oz, cut into 1/2-inch cubes",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ar-6",
        name: "All-purpose flour",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ar-7",
        name: "Breadcrumbs",
        quantity: "2 cups (Italian-style)",
        isOptional: false,
        substitution: "Panko",
      },
      {
        id: "ar-8",
        name: "Vegetable oil",
        quantity: "4 cups (for frying)",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Bring broth to a simmer. Add rice and cook over medium heat, stirring occasionally, until all liquid is absorbed and rice is tender. Stir in Parmesan and 1 beaten egg. Spread on a baking sheet and refrigerate until completely cold.",
        timerSeconds: 1200,
        mistakeWarning:
          "The rice MUST be cold before shaping — warm rice is too sticky to form into balls and falls apart during frying.",
        quickHack:
          "Cook the rice the night before and refrigerate — cold rice shapes perfectly and saves 30 minutes of waiting.",
        cuisineFact:
          "Arancini means 'little oranges' in Italian — named for their golden color and round shape after frying.",
        donenessCue:
          "Rice should be sticky and creamy, not dry. Once spread on the sheet, it should set firm in the fridge.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Scoop a golf-ball amount of cold rice into your palm. Press a cube of mozzarella into the center. Close the rice around it and roll into a smooth ball. Repeat to make about 12 balls.",
        timerSeconds: null,
        mistakeWarning:
          "Make sure the mozzarella is completely enclosed — any exposed cheese will leak out during frying and burn in the oil.",
        quickHack:
          "Wet your hands lightly with water to prevent rice from sticking while shaping.",
        cuisineFact: null,
        donenessCue:
          "Each ball should be smooth with no cracks, about the size of a tennis ball.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Set up a breading station: flour in one dish, 2 beaten eggs in another, breadcrumbs in a third. Roll each ball in flour, then egg, then breadcrumbs, pressing gently to adhere.",
        timerSeconds: null,
        mistakeWarning:
          "Use one hand for dry ingredients and one for wet — this prevents your fingers from getting coated in a thick, clumpy mess.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Each ball should be evenly coated with no bald spots. The breadcrumb layer should feel firm.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Heat oil to 350°F in a heavy pot (at least 3 inches deep). Fry 3-4 arancini at a time, turning occasionally, until deep golden brown all over.",
        timerSeconds: 270,
        mistakeWarning:
          "Don't crowd the pot — too many at once drops the oil temperature, resulting in greasy, soggy arancini instead of crispy ones.",
        quickHack:
          "Test oil temperature with a small piece of bread — it should sizzle immediately and turn golden in 30 seconds.",
        cuisineFact: null,
        donenessCue:
          "The outside should be a deep, uniform golden brown. When you cut one open, the mozzarella inside should be melted and stretchy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Drain on a wire rack for 2 minutes. Serve hot with warm marinara sauce for dipping. The mozzarella inside should be molten and stretchy.",
        timerSeconds: null,
        mistakeWarning:
          "Let them rest 2 minutes — the mozzarella inside is lava-hot right out of the fryer.",
        quickHack: null,
        cuisineFact:
          "In Sicily, arancini are traditional street food sold at every corner — they're considered the national snack of the island.",
        donenessCue:
          "When you bite in, you should see the stretchy mozzarella pull. The rice should be creamy inside the crispy shell.",
        imageUrl: null,
      },
    ],
  },

  "cucumber-raita": {
    name: "Cucumber Raita",
    slug: "cucumber-raita",
    description:
      "Cool, creamy yogurt dip with grated cucumber, cumin, and fresh mint — the essential cooling companion to any spicy Indian meal.",
    cuisineFamily: "indian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/cucumber_raita.png",
    flavorProfile: ["cool", "creamy", "refreshing"],
    temperature: "cold",
    ingredients: [
      {
        id: "cr-1",
        name: "Plain yogurt",
        quantity: "1.5 cups (full-fat)",
        isOptional: false,
        substitution: "Greek yogurt (thin with 2 tbsp water)",
      },
      {
        id: "cr-2",
        name: "Cucumber",
        quantity: "1 medium",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cr-3",
        name: "Cumin powder",
        quantity: "1/2 tsp (roasted)",
        isOptional: false,
        substitution: "Toast whole cumin seeds and grind",
      },
      {
        id: "cr-4",
        name: "Fresh mint",
        quantity: "2 tbsp, finely chopped",
        isOptional: false,
        substitution: "Fresh cilantro",
      },
      {
        id: "cr-5",
        name: "Salt",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cr-6",
        name: "Black salt (kala namak)",
        quantity: "pinch",
        isOptional: true,
        substitution: "Regular salt",
      },
      {
        id: "cr-7",
        name: "Green chili",
        quantity: "1 small, finely minced",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Peel the cucumber, then grate it on the large holes of a box grater. Squeeze the grated cucumber firmly in your hands over the sink to remove excess water. This is the most important step.",
        timerSeconds: null,
        mistakeWarning:
          "If you skip squeezing, the water from the cucumber will make your raita thin and watery within minutes. Squeeze until almost dry.",
        quickHack:
          "Place grated cucumber in a clean kitchen towel, gather the corners, and wring it out — much faster than hand-squeezing.",
        cuisineFact:
          "Raita has been served alongside Indian meals for over a thousand years — it's specifically designed to cool the palate between bites of spicy food.",
        donenessCue:
          "The grated cucumber should be almost dry when you open your fist — no dripping.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Whisk the yogurt in a bowl until smooth and creamy — break up any lumps. Add the squeezed cucumber, cumin powder, chopped mint, salt, and green chili if using. Mix gently.",
        timerSeconds: null,
        mistakeWarning:
          "Whisk the yogurt smooth BEFORE adding cucumber — lumpy yogurt won't blend properly once the cucumber is in.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The raita should be creamy, speckled with green mint and cucumber, and thick enough to coat a spoon.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Taste and adjust salt and cumin. For best flavor, refrigerate for at least 15 minutes before serving — the flavors develop as it chills. Finish with a pinch of black salt and a sprinkle of cumin on top.",
        timerSeconds: null,
        mistakeWarning:
          "Don't add black salt until serving — its distinctive sulfurous flavor fades if mixed in too early.",
        quickHack:
          "No roasted cumin? Dry-toast whole cumin seeds in a pan for 60 seconds until fragrant, then crush with a rolling pin.",
        cuisineFact:
          "Black salt (kala namak) has a unique egg-like aroma from sulfur compounds — a tiny pinch transforms raita from good to authentic.",
        donenessCue:
          "It should taste cool, tangy, subtly spiced, and refreshing. If it's bland, it needs more salt or cumin.",
        imageUrl: null,
      },
    ],
  },

  "pad-thai": {
    name: "Pad Thai",
    slug: "pad-thai",
    description:
      "Stir-fried rice noodles with shrimp, egg, bean sprouts, and crushed peanuts in a sweet-sour tamarind sauce — Thailand's most famous street dish.",
    cuisineFamily: "thai",
    prepTimeMinutes: 20,
    cookTimeMinutes: 10,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/pad_thai.png",
    flavorProfile: ["sweet", "sour", "savory", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "pt-1",
        name: "Flat rice noodles",
        quantity: "8 oz (pad thai noodles)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-2",
        name: "Shrimp",
        quantity: "8 oz, peeled and deveined",
        isOptional: false,
        substitution: "Firm tofu, cubed",
      },
      {
        id: "pt-3",
        name: "Eggs",
        quantity: "2 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-4",
        name: "Tamarind paste",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "1.5 tbsp lime juice + 1 tsp Worcestershire",
      },
      {
        id: "pt-5",
        name: "Fish sauce",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Soy sauce",
      },
      {
        id: "pt-6",
        name: "Palm sugar",
        quantity: "1.5 tbsp",
        isOptional: false,
        substitution: "Brown sugar",
      },
      {
        id: "pt-7",
        name: "Bean sprouts",
        quantity: "1.5 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-8",
        name: "Garlic",
        quantity: "3 cloves, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-9",
        name: "Roasted peanuts",
        quantity: "1/4 cup, crushed",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-10",
        name: "Green onions",
        quantity: "3, cut into 1-inch pieces",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-11",
        name: "Lime wedges",
        quantity: "for serving",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-12",
        name: "Vegetable oil",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Soak rice noodles in room temperature water for 30 minutes until pliable but still firm — they should bend without breaking. Drain well. Mix tamarind paste, fish sauce, and palm sugar in a small bowl until sugar dissolves.",
        timerSeconds: 1800,
        mistakeWarning:
          "Do NOT soak noodles in hot water — they'll overcook and turn mushy in the wok. Room temperature only.",
        quickHack:
          "Some brands of pad thai noodles only need 15 minutes — check the package and test a noodle by bending it.",
        cuisineFact:
          "Pad Thai was promoted as Thailand's national dish in the 1930s by Prime Minister Phibunsongkhram as part of a campaign to build national identity.",
        donenessCue:
          "Noodles should be flexible and bendy but still have a white, firm center — they finish cooking in the wok.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Heat 2 tbsp oil in a wok or large skillet over high heat until smoking. Cook shrimp 1 minute per side until pink. Push to the side. Crack eggs into the wok and scramble roughly for 30 seconds.",
        timerSeconds: null,
        mistakeWarning:
          "Your wok must be screaming hot before anything goes in. Pad thai cooked over low heat steams instead of fries and tastes completely wrong.",
        quickHack:
          "If your stove can't get hot enough, cook in two batches — half the noodles at a time — for better char.",
        cuisineFact: null,
        donenessCue:
          "Shrimp should be pink and slightly charred. Eggs should be set but still soft — not dry.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add remaining 1 tbsp oil and garlic. Stir 10 seconds. Add drained noodles and pour the sauce over them. Toss constantly with tongs for 2-3 minutes until noodles absorb the sauce and turn glossy.",
        timerSeconds: 150,
        mistakeWarning:
          "Use tongs, not a spatula — tongs lift and separate the noodles. A spatula smashes them into clumps.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Noodles should be tender, glossy, and evenly coated in the caramel-colored sauce. No white noodles visible.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add bean sprouts and green onions. Toss 30 seconds — just enough to warm them without wilting. Transfer to plates. Top with crushed peanuts, extra bean sprouts, and lime wedges. Serve immediately.",
        timerSeconds: null,
        mistakeWarning:
          "Don't cook the bean sprouts more than 30 seconds — they should be crunchy and fresh, providing contrast to the soft noodles.",
        quickHack: null,
        cuisineFact:
          "In Thailand, street vendors customize each plate — more sugar, more lime, more chili flakes, more fish sauce. The condiment tray is essential.",
        donenessCue:
          "The pad thai should glisten, taste equally sweet, sour, salty, and savory. Squeeze the lime over — it should brighten everything.",
        imageUrl: null,
      },
    ],
  },

  gomaae: {
    name: "Japanese Sesame Spinach (Gomaae)",
    slug: "gomaae",
    description:
      "Blanched spinach dressed in a nutty, savory sesame sauce — a classic Japanese side dish.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["nutty", "savory", "umami"],
    temperature: "cold",
    ingredients: [
      {
        id: "gm-1",
        name: "Fresh spinach",
        quantity: "1 bunch/8oz",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gm-2",
        name: "White sesame seeds",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gm-3",
        name: "Soy sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Tamari",
      },
      {
        id: "gm-4",
        name: "Sugar",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Mirin 1.5 tbsp",
      },
      {
        id: "gm-5",
        name: "Kosher salt",
        quantity: "1 tsp for blanching",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Toast sesame seeds in dry skillet over medium heat, shaking constantly until fragrant and golden.",
        timerSeconds: 120,
        mistakeWarning: "Sesame seeds burn in seconds—keep pan moving.",
        quickHack: "Buy pre-toasted sesame seeds to skip this step.",
        cuisineFact: null,
        donenessCue: "Fragrant with light golden color.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Grind half the seeds in a mortar, leaving some whole for texture.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: "Use a zip-lock bag and rolling pin if no mortar.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Stir soy sauce and sugar into ground sesame to make dressing.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Blanch spinach in boiling salted water stem-first for 30-45 seconds.",
        timerSeconds: 45,
        mistakeWarning: "Over-blanching makes spinach slimy.",
        quickHack: null,
        cuisineFact: "Blanching with salt keeps green color vibrant.",
        donenessCue: "Bright green and just wilted.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Plunge into ice bath 1 minute, squeeze out all water firmly, cut into 1-inch pieces and toss with dressing.",
        timerSeconds: 60,
        mistakeWarning: "Failing to squeeze water dilutes the dressing.",
        quickHack: null,
        cuisineFact:
          "Goma-ae means 'dressed in sesame'—one of the most common Japanese family dinner sides.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  tzatziki: {
    name: "Greek Tzatziki",
    slug: "tzatziki",
    description:
      "A cool, creamy yogurt dip with cucumber, dill, and garlic — essential alongside grilled meats and pita.",
    cuisineFamily: "mediterranean",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["creamy", "cooling", "tangy", "herby"],
    temperature: "cold",
    ingredients: [
      {
        id: "tz-1",
        name: "Greek yogurt full fat",
        quantity: "1.5 cups",
        isOptional: false,
        substitution: "Strained plain yogurt",
      },
      {
        id: "tz-2",
        name: "Cucumber",
        quantity: "1 medium",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tz-3",
        name: "Fresh dill",
        quantity: "2 tbsp chopped",
        isOptional: false,
        substitution: "Fresh mint",
      },
      {
        id: "tz-4",
        name: "Garlic cloves",
        quantity: "2 minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tz-5",
        name: "Extra virgin olive oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tz-6",
        name: "Lemon juice",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tz-7",
        name: "Kosher salt",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Peel cucumber, grate on large holes of box grater.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Tzatziki dates back to Ottoman cuisine and appears in nearly every Greek taverna.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Press grated cucumber firmly to extract as much liquid as possible.",
        timerSeconds: null,
        mistakeWarning:
          "Skipping this step is the #1 cause of watery tzatziki.",
        quickHack: "Wrap in a clean kitchen towel and wring out.",
        cuisineFact: null,
        donenessCue: "Pulp should feel dry and compact.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Combine drained cucumber, yogurt, dill, garlic, olive oil, lemon juice, and salt. Stir until incorporated.",
        timerSeconds: null,
        mistakeWarning:
          "Use fresh garlic, not jarred—noticeable flavor difference.",
        quickHack: "Let rest 30 minutes for milder garlic flavor.",
        cuisineFact: null,
        donenessCue: "Thick and creamy, not runny.",
        imageUrl: null,
      },
    ],
  },

  "oi-muchim": {
    name: "Korean Cucumber Salad (Oi Muchim)",
    slug: "oi-muchim",
    description:
      "Thinly sliced cucumbers tossed in a spicy, tangy gochugaru dressing with sesame — a refreshing Korean banchan.",
    cuisineFamily: "korean",
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["spicy", "crunchy", "tangy", "fresh"],
    temperature: "cold",
    ingredients: [
      {
        id: "om-1",
        name: "Cucumber persian or english",
        quantity: "1 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "om-2",
        name: "Korean coarse salt",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "om-3",
        name: "Onion",
        quantity: "1/4 thinly sliced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "om-4",
        name: "Gochugaru",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Red pepper flakes 1 tsp",
      },
      {
        id: "om-5",
        name: "White vinegar",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Rice vinegar",
      },
      {
        id: "om-6",
        name: "White sugar",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "om-7",
        name: "Minced garlic",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "om-8",
        name: "Toasted sesame seeds",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "om-9",
        name: "Sesame oil",
        quantity: "a drizzle",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Slice cucumber into thin 2mm rounds.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: "Use a mandoline for perfectly even slices.",
        cuisineFact:
          "Oi muchim is one of many banchan served at every Korean meal—a typical spread includes 3-12 banchan.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Toss slices with salt, let sit 15 minutes to draw out water.",
        timerSeconds: 900,
        mistakeWarning:
          "Do not skip salting—unsalted cucumbers release water later.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction: "Rinse under cold water, drain, pat dry.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Slices slightly bendy, no longer stiff.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Combine gochugaru, vinegar, sugar, garlic, sesame seeds in a small bowl.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Gochugaru gives Korean dishes their signature fruity, smoky heat.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Add cucumbers and onion to seasoning paste, mix by hand until evenly coated.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Every slice evenly coated with red seasoning.",
        imageUrl: null,
      },
    ],
  },

  "skillet-cornbread": {
    name: "Southern Skillet Cornbread",
    slug: "skillet-cornbread",
    description:
      "Golden, crispy-bottomed cornbread baked in a searing cast iron skillet with buttermilk tang.",
    cuisineFamily: "comfort-classic",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["warm", "savory", "rich"],
    temperature: "hot",
    ingredients: [
      {
        id: "sc-1",
        name: "Cornmeal medium-grind",
        quantity: "1 1/4 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sc-2",
        name: "All-purpose flour",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sc-3",
        name: "Baking powder",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sc-4",
        name: "Baking soda",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sc-5",
        name: "Salt",
        quantity: "3/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sc-6",
        name: "Unsalted butter melted",
        quantity: "8 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sc-7",
        name: "Buttermilk",
        quantity: "1 3/4 cups",
        isOptional: false,
        substitution: "Milk + 1 tbsp vinegar",
      },
      {
        id: "sc-8",
        name: "Eggs",
        quantity: "2 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sc-9",
        name: "Vegetable oil",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "Bacon fat",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Place a 10-12 inch cast iron skillet in the oven and preheat to 400°F for 20 minutes.",
        timerSeconds: 1200,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Cornbread is a Native American staple dating back thousands of years.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Whisk cornmeal, flour, baking powder, baking soda, and salt in a large bowl.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Whisk melted butter, buttermilk, eggs, and 2 tablespoons of oil in a separate bowl.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Pour wet into dry and fold gently until just combined—batter should still be lumpy.",
        timerSeconds: null,
        mistakeWarning: "Do not overmix or cornbread turns tough and dense.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Remove hot skillet, swirl in remaining 1 tablespoon oil, pour batter in and return to oven.",
        timerSeconds: null,
        mistakeWarning:
          "Skillet handle is extremely hot—always use thick oven mitt.",
        quickHack:
          "Hot oiled skillet is the secret to golden crunchy bottom crust.",
        cuisineFact: null,
        donenessCue: "Should hear a sizzle when batter hits pan.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction: "Bake 16-23 minutes until golden.",
        timerSeconds: 1200,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Golden-brown top, firm to touch, toothpick comes out clean.",
        imageUrl: null,
      },
    ],
  },

  "aloo-gobi": {
    name: "Aloo Gobi",
    slug: "aloo-gobi",
    description:
      "Spiced potato and cauliflower dry curry — a hearty, aromatic North Indian classic.",
    cuisineFamily: "indian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["spicy", "warm", "savory", "earthy"],
    temperature: "hot",
    ingredients: [
      {
        id: "ag-1",
        name: "Oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Vegetable oil",
      },
      {
        id: "ag-2",
        name: "Potatoes",
        quantity: "2 medium sliced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ag-3",
        name: "Cauliflower",
        quantity: "1 small head in florets",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ag-4",
        name: "Cumin seeds",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ag-5",
        name: "Red onion",
        quantity: "1 medium chopped",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ag-6",
        name: "Ginger-garlic paste",
        quantity: "1.5 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ag-7",
        name: "Tomatoes",
        quantity: "2 medium chopped",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ag-8",
        name: "Turmeric",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ag-9",
        name: "Red chili powder",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: "Cayenne",
      },
      {
        id: "ag-10",
        name: "Coriander powder",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ag-11",
        name: "Garam masala",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ag-12",
        name: "Fresh cilantro",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Heat oil, add cauliflower and potato, pan-fry medium-low 7-8 minutes until lightly browned.",
        timerSeconds: 480,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Aloo gobi became internationally famous after the 2002 film Bend It Like Beckham.",
        donenessCue: "Golden-brown spots, still firm inside.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Remove vegetables, add remaining oil, let cumin seeds sizzle 10 seconds, add onions.",
        timerSeconds: null,
        mistakeWarning:
          "Cumin seeds burn in seconds—add onion as soon as seeds crackle.",
        quickHack: null,
        cuisineFact:
          "Sizzling cumin is called 'tadka'—the flavor foundation of countless Indian dishes.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Cook onions 2-3 minutes, add ginger-garlic paste, cook 2 more minutes.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Raw pungent smell transforms into sweet, toasty aroma.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add tomatoes and all ground spices, cover, cook 2-3 minutes until tomatoes break down.",
        timerSeconds: 180,
        mistakeWarning:
          "Tomatoes must cook until oil separates from masala before adding vegetables back.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Oil visibly pools at edges of masala.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Return vegetables, add garam masala and cilantro, cover, cook low 8-9 minutes stirring every 2 minutes.",
        timerSeconds: 540,
        mistakeWarning:
          "If sticking, add water one tablespoon at a time—don't flood.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Potatoes fork-tender, cauliflower cooked but not falling apart.",
        imageUrl: null,
      },
    ],
  },

  "patatas-bravas": {
    name: "Patatas Bravas",
    slug: "patatas-bravas",
    description:
      "Crispy fried potato chunks drizzled with a smoky, spicy tomato-paprika sauce — Spain's most popular tapa.",
    cuisineFamily: "mediterranean",
    prepTimeMinutes: 5,
    cookTimeMinutes: 30,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["crispy", "spicy", "smoky", "savory"],
    temperature: "hot",
    ingredients: [
      {
        id: "pb-1",
        name: "Russet potatoes",
        quantity: "4-5 about 2lbs",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pb-2",
        name: "Baking soda",
        quantity: "3/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pb-3",
        name: "Kosher salt",
        quantity: "to taste",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pb-4",
        name: "Extra virgin olive oil",
        quantity: "1 cup for frying",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pb-5",
        name: "Smoked paprika",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pb-6",
        name: "Tomato paste",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pb-7",
        name: "Garlic",
        quantity: "2 cloves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pb-8",
        name: "Cayenne pepper",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Cut peeled potatoes into irregular 2-inch chunks.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Patatas bravas means 'fierce potatoes'—the most ordered tapa in all of Spain.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Boil water with baking soda, add potatoes, parboil 1-2 minutes only.",
        timerSeconds: 120,
        mistakeWarning:
          "Do not boil longer than 2 minutes or potatoes fall apart during frying.",
        quickHack:
          "Baking soda creates starchy exterior that fries up extraordinarily crispy.",
        cuisineFact: null,
        donenessCue: "Edges slightly roughened and cloudy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Drain thoroughly, spread on sheet pan, season with salt, let cool completely.",
        timerSeconds: null,
        mistakeWarning: "Frying wet potatoes causes dangerous oil splatter.",
        quickHack: "Parboil and refrigerate overnight for crispiest results.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Heat olive oil in deep skillet, add potatoes in single layer, fry 20-25 minutes turning occasionally.",
        timerSeconds: 1500,
        mistakeWarning:
          "Crowding the pan drops oil temperature—gives soggy potatoes.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Uniformly deep golden, audibly crackle when turned.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "While frying, make bravas sauce: saute garlic, add paprika, tomato paste, cayenne, simmer with water 5 minutes.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: "Every bar in Spain has its own secret bravas sauce.",
        donenessCue: "Smooth, glossy, coats back of spoon.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Transfer potatoes to paper towels, season immediately. Arrange on plate with bravas sauce drizzle.",
        timerSeconds: null,
        mistakeWarning: "Season while hot—salt won't stick to cold potatoes.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "lachha-paratha": {
    name: "Lachha Paratha",
    slug: "lachha-paratha",
    description:
      "A flaky, multi-layered Indian flatbread with crispy spiraling layers, cooked on a tawa with ghee until golden.",
    cuisineFamily: "indian",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/lachha_paratha.png",
    flavorProfile: ["rich", "warm", "crispy"],
    temperature: "hot",
    ingredients: [
      {
        id: "lp-1",
        name: "Whole wheat flour (atta)",
        quantity: "2 cups",
        isOptional: false,
        substitution: "All-purpose flour",
      },
      {
        id: "lp-2",
        name: "Salt",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "lp-3",
        name: "Water",
        quantity: "3/4 cup (as needed)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "lp-4",
        name: "Ghee",
        quantity: "8 tbsp total (2 for dough, 6 for layering and cooking)",
        isOptional: false,
        substitution: "Melted butter",
      },
      {
        id: "lp-5",
        name: "Whole wheat flour",
        quantity: "4 tbsp (for dusting)",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Mix flour and salt. Rub in 2 tbsp ghee until crumbly. Gradually add water and knead for 6-8 minutes until smooth and soft. Cover and rest for 20 minutes.",
        timerSeconds: 1200,
        mistakeWarning:
          "Don't make the dough too stiff — it should be softer than regular roti dough. Add water gradually, a tablespoon at a time.",
        quickHack: null,
        cuisineFact:
          "The word 'lachha' means 'ring' in Punjabi, named for the ring-like spiral layers created by the coiling technique.",
        donenessCue:
          "The dough should be smooth, soft, and slightly tacky — not sticky, not dry.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Divide dough into 4 equal balls. Roll one ball into a thin 8-inch disc on a floured surface.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The disc should be thin and even — you should almost be able to see through it.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Spread 1 tbsp ghee over the disc surface and sprinkle 1 tbsp flour evenly. Starting from one edge, fold the dough in accordion-style 1/2-inch pleats across the entire disc.",
        timerSeconds: null,
        mistakeWarning:
          "The ghee and flour between each pleat is what creates the distinct flaky layers — don't skip the flour, it keeps layers separated.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You should have a long pleated strip of dough, like a paper fan.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Gently stretch the pleated strip slightly, then tightly coil it into a spiral shape (like a cinnamon roll). Tuck the loose end underneath. Let rest 2 minutes, then roll gently into a 7-inch round.",
        timerSeconds: null,
        mistakeWarning:
          "Use a light touch when re-rolling — heavy pressure destroys the delicate layers you just created.",
        quickHack:
          "If the dough springs back, let it rest another minute — gluten relaxation makes rolling easier.",
        cuisineFact: null,
        donenessCue:
          "You should be able to see the spiral pattern through the surface of the rolled paratha.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Heat a tawa or heavy skillet on medium-high. Place paratha on the hot surface. When bottom gets golden spots (60-90 seconds), flip. Apply 1/2 tbsp ghee on the cooked side.",
        timerSeconds: 90,
        mistakeWarning:
          "Don't cook on high heat — it burns the outside while leaving raw dough between the layers.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The bottom should have golden-brown spots mixed with some lighter patches.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Cook 45-60 seconds more, then flip again with ghee on the second side. Flip 2-3 more times pressing edges with spatula until both sides are golden and crispy. Gently crush between palms to separate layers.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack:
          "The crush between palms is the most satisfying part — it opens up all those flaky layers and makes the paratha puff up beautifully.",
        cuisineFact: null,
        donenessCue:
          "Both sides should be deeply golden with visible layers at the edges. When crushed, layers should separate visibly and the paratha should feel light and flaky.",
        imageUrl: null,
      },
    ],
  },

  // ── Round 1 addition: Baba Ganoush ──────────────────────
  "baba-ganoush": {
    name: "Baba Ganoush",
    slug: "baba-ganoush",
    description:
      "Smoky, fire-roasted eggplant mashed with tahini, garlic, and lemon juice for a velvety, deeply flavoured dip.",
    cuisineFamily: "mediterranean",
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["smoky", "creamy", "tangy"],
    temperature: "room",
    ingredients: [
      {
        id: "bg-1",
        name: "Large globe eggplants",
        quantity: "2 (about 2 lbs total)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bg-2",
        name: "Tahini",
        quantity: "3 tbsp, well-stirred",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bg-3",
        name: "Lemon juice",
        quantity: "2 tbsp, fresh",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bg-4",
        name: "Garlic",
        quantity: "1-2 cloves, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bg-5",
        name: "Kosher salt",
        quantity: "3/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bg-6",
        name: "Extra-virgin olive oil",
        quantity: "2-3 tbsp, for finishing",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bg-7",
        name: "Smoked paprika",
        quantity: "pinch, for garnish",
        isOptional: true,
        substitution: "Aleppo pepper or sumac",
      },
      {
        id: "bg-8",
        name: "Fresh parsley",
        quantity: "1 tbsp, chopped, for garnish",
        isOptional: true,
        substitution: "Pomegranate seeds",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Place whole eggplants directly on gas burner grates over high flame. Turn with tongs every 3-5 minutes until the skin is completely blackened on all sides and the eggplant has fully collapsed. Total 15-20 minutes. (No gas? Use broiler 3-4 inches from element, turning every 5-7 minutes, 25-35 min total.)",
        timerSeconds: 1200,
        mistakeWarning:
          "Don't stop too early — the eggplant must be COMPLETELY blackened and collapsed like a deflated balloon. Undercharred eggplant means no smoke flavor, and smoke flavor IS the dish.",
        quickHack:
          "No gas stove? Pierce eggplant and microwave 3-4 min first to pre-soften, then broil. Add 1/2 tsp smoked paprika to the final mix to boost smokiness.",
        cuisineFact:
          "The name 'baba ganoush' roughly translates to 'pampered papa' in Arabic. Fire-charring eggplant is an ancient Middle Eastern technique that predates modern stoves.",
        donenessCue:
          "Skin is jet black and papery on all sides — no purple or shiny patches remaining. When squeezed with tongs, the eggplant collapses completely with zero resistance.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Transfer charred eggplants to a colander set over a bowl. Slit them open lengthwise and let drain for 20-30 minutes. Gently press with a spoon to push out excess liquid.",
        timerSeconds: 1500,
        mistakeWarning:
          "Don't rush this step — excess liquid makes the dip watery and bland. The liquid that drains off is bitter; let it go.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Liquid stops actively dripping from the colander. The flesh looks concentrated and thick, not watery or loose.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Scoop the eggplant flesh away from the charred skin with a spoon. Discard the skin. You can leave a few tiny flecks of char for extra smokiness.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Baba ganoush is a core component of the Middle Eastern mezze spread, always served communally with flatbread for scooping — never eaten with a spoon alone.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "In a bowl, combine the drained eggplant flesh, tahini, lemon juice, minced garlic, and salt. Mash with a fork for a chunky, rustic texture. Do NOT use a food processor — it makes the dip gluey. Taste and adjust: more lemon for brightness, more tahini for richness.",
        timerSeconds: null,
        mistakeWarning:
          "Never use a food processor or blender — overprocessing destroys the texture and turns it into baby food. A fork is all you need.",
        quickHack:
          "Mash garlic with salt into a paste first — this tames the raw bite and distributes flavor more evenly through the dip.",
        cuisineFact: null,
        donenessCue:
          "Creamy and pale beige with visible chunks. When you drizzle olive oil on top, it should sit in a pool — if it absorbs instantly, the dip is too dry (add a splash more olive oil).",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Let the dip rest at room temperature for 15 minutes to let flavors meld. Serve in a shallow bowl, drizzled generously with olive oil, and garnished with smoked paprika and parsley. Serve with warm pita.",
        timerSeconds: 900,
        mistakeWarning:
          "Serve at room temperature, not ice cold. Refrigeration mutes both the smoke and tahini flavors.",
        quickHack:
          "Baba ganoush keeps 3-4 days in the fridge and actually improves overnight as flavors meld. Make it the day before you need it.",
        cuisineFact: null,
        donenessCue:
          "Distinct smoky flavor up front, followed by tahini richness, finished with lemon brightness. If smoke isn't the dominant note, more charring was needed.",
        imageUrl: null,
      },
    ],
  },
};

// ── Meal guided cook data ──────────────────────────────
// Main dishes with full cook flows. Same StaticDishData shape as sides.

export const guidedCookMeals: Record<string, StaticDishData> = {
  "pizza-margherita": {
    name: "Pizza Margherita",
    slug: "pizza-margherita",
    description:
      "Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil on a perfectly crispy crust.",
    cuisineFamily: "italian",
    prepTimeMinutes: 20,
    cookTimeMinutes: 10,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/pizza_margherita.png",
    flavorProfile: ["savory", "herbaceous", "tangy", "cheesy"],
    temperature: "hot",
    ingredients: [
      {
        id: "pm-1",
        name: "Pizza dough",
        quantity: "1 pound (store-bought or homemade)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pm-2",
        name: "San Marzano tomatoes",
        quantity: "1 cup (crushed by hand)",
        isOptional: false,
        substitution: "High-quality canned whole tomatoes",
      },
      {
        id: "pm-3",
        name: "Fresh mozzarella",
        quantity: "8 oz (torn into pieces)",
        isOptional: false,
        substitution: "Buffalo mozzarella for extra creaminess",
      },
      {
        id: "pm-4",
        name: "Fresh basil leaves",
        quantity: "10-12 leaves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pm-5",
        name: "Extra virgin olive oil",
        quantity: "2 tablespoons",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pm-6",
        name: "Sea salt",
        quantity: "1 teaspoon",
        isOptional: false,
        substitution: "Kosher salt",
      },
      {
        id: "pm-7",
        name: "Garlic",
        quantity: "1 clove (minced)",
        isOptional: true,
        substitution: "Garlic powder (1/4 tsp)",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Preheat your oven to the highest setting (500-550\u00B0F) and place a pizza stone or baking steel on the bottom rack. Let it heat for at least 30 minutes so it gets screaming hot.",
        timerSeconds: 1800,
        mistakeWarning: null,
        quickHack:
          "No pizza stone? Flip a heavy baking sheet upside down and preheat that instead.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Make your sauce by crushing the San Marzano tomatoes by hand in a bowl. Stir in salt, 1 tablespoon olive oil, and garlic if using. Keep it simple and fresh.",
        timerSeconds: null,
        mistakeWarning:
          "Don\u2019t cook the sauce \u2014 authentic Margherita uses raw tomato sauce that cooks directly on the pizza.",
        quickHack: null,
        cuisineFact:
          "San Marzano tomatoes from the volcanic soil near Mount Vesuvius have the perfect sweet-tart balance for pizza.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "On a lightly floured surface, gently press the dough from the center outward with your fingertips, leaving a thicker 1-inch border for the crust. Stretch it into a 10-12 inch circle, rotating as you go.",
        timerSeconds: null,
        mistakeWarning:
          "Never use a rolling pin \u2014 it crushes all the air bubbles that make the crust light and puffy.",
        quickHack:
          "Let gravity help! Hold one edge and let the dough hang down, rotating it through your hands to stretch evenly.",
        cuisineFact:
          "Traditional Neapolitan pizza rules actually forbid mechanical presses \u2014 hands only.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Transfer the stretched dough to a piece of parchment paper. Spread a thin layer of sauce (about 1/3 cup) in the center, leaving the border bare. Less is more here.",
        timerSeconds: null,
        mistakeWarning:
          "Too much sauce makes the crust soggy \u2014 you want just enough to lightly coat the dough.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Tear the mozzarella into bite-sized pieces and distribute them evenly over the sauce. Drizzle with the remaining olive oil and add a pinch of salt.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Pat the mozzarella dry with paper towels first to remove excess moisture and avoid a watery pizza.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Carefully slide the pizza (on the parchment) onto your preheated stone or steel. Bake for 8-10 minutes until the crust is golden and puffed with charred spots and the cheese is bubbling.",
        timerSeconds: 540,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Look for leopard-spotted char on the crust edges and vigorously bubbling cheese.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Remove the pizza and immediately top with fresh basil leaves \u2014 they\u2019ll wilt slightly from the heat and release their aroma. Let it cool for 2 minutes, slice, and enjoy.",
        timerSeconds: 120,
        mistakeWarning:
          "Don\u2019t add basil before baking or it will turn black and bitter.",
        quickHack: null,
        cuisineFact:
          "Pizza Margherita was named for Queen Margherita of Savoy in 1889 \u2014 the red, white, and green toppings represent the Italian flag.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "butter-chicken": {
    name: "Butter Chicken",
    slug: "butter-chicken",
    description:
      "Tender yogurt-marinated chicken in a velvety tomato-butter-cream sauce with aromatic spices. An iconic North Indian classic.",
    cuisineFamily: "indian",
    prepTimeMinutes: 30,
    cookTimeMinutes: 35,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/butter_chicken.png",
    flavorProfile: ["rich", "creamy", "aromatic", "mildly spiced"],
    temperature: "hot",
    ingredients: [
      {
        id: "bc-1",
        name: "Boneless chicken thighs",
        quantity: "1.5 lbs, cut into 2-inch pieces",
        isOptional: false,
        substitution: "Chicken breast (less tender)",
      },
      {
        id: "bc-2",
        name: "Plain yogurt",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-3",
        name: "Ginger-garlic paste",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "1 tbsp each fresh grated ginger and garlic",
      },
      {
        id: "bc-4",
        name: "Garam masala",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-5",
        name: "Kashmiri chili powder",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Paprika for milder heat",
      },
      {
        id: "bc-6",
        name: "Ground turmeric",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-7",
        name: "Ground cumin",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-8",
        name: "Lemon juice",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-9",
        name: "Salt",
        quantity: "1.5 tsp, divided",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-10",
        name: "Butter",
        quantity: "6 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-11",
        name: "Medium onion, finely diced",
        quantity: "1",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-12",
        name: "Tomato puree or crushed tomatoes",
        quantity: "1.5 cups (14 oz can)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-13",
        name: "Heavy cream",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "Coconut cream",
      },
      {
        id: "bc-14",
        name: "Kasuri methi (dried fenugreek leaves)",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bc-15",
        name: "Sugar",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "Honey",
      },
      {
        id: "bc-16",
        name: "Fresh cilantro for garnish",
        quantity: "2 tbsp chopped",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "In a large bowl, combine yogurt, ginger-garlic paste, 1 tsp garam masala, chili powder, turmeric, cumin, lemon juice, and 1 tsp salt. Add chicken pieces and massage the marinade into every piece.",
        timerSeconds: null,
        mistakeWarning:
          "Don\u2019t skip the massage \u2014 working the marinade into the chicken helps tenderize and flavor it deeply.",
        quickHack:
          "Short on time? 30 minutes of marinating will still work, though overnight is best.",
        cuisineFact:
          "Yogurt\u2019s acidity breaks down proteins, making chicken incredibly tender while the spices penetrate deep into the meat.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Heat a large skillet or grill pan over high heat. Working in batches to avoid crowding, sear the marinated chicken for 2-3 minutes per side until charred and mostly cooked through.",
        timerSeconds: null,
        mistakeWarning:
          "Don\u2019t overcook \u2014 the chicken will finish cooking in the sauce. You\u2019re looking for char, not fully done.",
        quickHack: null,
        cuisineFact:
          "This searing step mimics the traditional tandoor oven\u2019s intense heat and smoky char.",
        donenessCue:
          "Chicken edges should be golden-brown with dark char marks; centers can still be slightly pink.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Transfer chicken to a plate. In the same pan, melt 4 tbsp butter over medium heat. Add diced onions and cook, stirring frequently, until deeply golden and softened.",
        timerSeconds: 480,
        mistakeWarning: null,
        quickHack:
          "Add a pinch of sugar to help onions caramelize faster without burning.",
        cuisineFact: null,
        donenessCue:
          "Onions should be translucent with golden-brown edges and smell sweet.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Pour in the tomato puree and remaining 1/2 tsp salt. Cook, stirring occasionally, until it darkens to a rich reddish-brown and butter begins separating from the sauce.",
        timerSeconds: 600,
        mistakeWarning:
          "This bhuna step is essential \u2014 rushing it gives you a raw tomato taste instead of deep, caramelized richness.",
        quickHack: null,
        cuisineFact:
          "The bhuna technique is the foundation of North Indian gravies, concentrating flavors through slow caramelization.",
        donenessCue:
          "Sauce should be thick, dark red-orange, with visible butter pooling at edges.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Stir in the remaining 1 tsp garam masala and the heavy cream. Add the seared chicken pieces along with any juices. Gently simmer on medium-low, stirring occasionally.",
        timerSeconds: 600,
        mistakeWarning: null,
        quickHack:
          "For an ultra-smooth sauce, blend it before adding the chicken back \u2014 traditional restaurants do this.",
        cuisineFact: null,
        donenessCue:
          "Chicken should be tender and sauce should coat the back of a spoon.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Crush the kasuri methi between your palms to release its aroma, then stir it into the sauce along with the remaining 2 tbsp butter and sugar if using.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Kasuri methi is the signature flavor of butter chicken \u2014 its slightly bitter, maple-like taste is what makes this dish unmistakable.",
        donenessCue:
          "You\u2019ll smell an intense, earthy-sweet aroma when the methi hits the hot sauce.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Taste and adjust salt. Let the butter chicken rest off heat for 5 minutes to let flavors meld, then garnish with fresh cilantro and serve with basmati rice or warm naan.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack:
          "A drizzle of cream and extra butter on top before serving makes it restaurant-style luxurious.",
        cuisineFact: null,
        donenessCue:
          "Sauce should be creamy, glossy, and coat the chicken pieces beautifully.",
        imageUrl: null,
      },
    ],
  },

  "fish-tacos": {
    name: "Fish Tacos",
    slug: "fish-tacos",
    description:
      "Crispy pan-seared white fish with tangy cabbage slaw and lime crema, tucked into warm corn tortillas. The iconic street food of Baja California.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/fish_tacos.png",
    flavorProfile: ["bright", "crispy", "tangy", "creamy"],
    temperature: "hot",
    ingredients: [
      {
        id: "ft-1",
        name: "White fish fillets (cod or mahi-mahi)",
        quantity: "1 lb",
        isOptional: false,
        substitution: "Halibut or tilapia",
      },
      {
        id: "ft-2",
        name: "Chili powder",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ft-3",
        name: "Cumin",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ft-4",
        name: "Garlic powder",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: "1 clove fresh garlic, minced",
      },
      {
        id: "ft-5",
        name: "Salt and pepper",
        quantity: "1/2 tsp each",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ft-6",
        name: "Olive oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ft-7",
        name: "Green or red cabbage, shredded",
        quantity: "2 cups",
        isOptional: false,
        substitution: "Pre-shredded coleslaw mix",
      },
      {
        id: "ft-8",
        name: "Sour cream",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "Greek yogurt",
      },
      {
        id: "ft-9",
        name: "Limes",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ft-10",
        name: "Mayonnaise",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ft-11",
        name: "Corn tortillas",
        quantity: "8 small",
        isOptional: false,
        substitution: "Flour tortillas",
      },
      {
        id: "ft-12",
        name: "Fresh cilantro",
        quantity: "1/4 cup chopped",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Pat your fish fillets completely dry with paper towels. Mix chili powder, cumin, garlic powder, salt, and pepper, then sprinkle over both sides of the fish and gently pat it in.",
        timerSeconds: null,
        mistakeWarning:
          "Wet fish = soggy fish. Really dry those fillets well or they\u2019ll steam instead of sear.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Make your lime crema by whisking together sour cream, mayo, juice of 1 lime, and a pinch of salt. Set aside \u2014 it\u2019ll get even better as the flavors meld.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Squeeze your lime through a fork to catch the seeds without needing a strainer.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Toss your shredded cabbage with juice of 1 lime and a pinch of salt. The acid will slightly soften the cabbage and make it tangy and bright.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Baja fish tacos were invented in Ensenada in the 1950s and originally featured battered fried fish.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Heat olive oil in a nonstick or cast iron skillet over medium-high heat until shimmering. Carefully add the seasoned fish \u2014 don\u2019t overcrowd. Let it cook undisturbed so a golden crust can form.",
        timerSeconds: 240,
        mistakeWarning:
          "Don\u2019t flip too early! Let the crust develop for 3-4 minutes or the fish will stick and tear.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The edges should look opaque and golden brown before you flip.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Flip the fish gently and cook the other side until it flakes easily with a fork. Transfer to a plate and break into bite-sized chunks.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack:
          "No thermometer? The fish is done when it\u2019s opaque all the way through and flakes easily.",
        cuisineFact: null,
        donenessCue:
          "The fish should flake apart easily when you press it gently with a fork.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Warm your corn tortillas directly over a gas flame or in a dry skillet for about 30 seconds per side until soft and slightly charred. Stack and wrap in a clean towel to keep warm.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Warming tortillas in a damp towel in the microwave for 30 seconds works in a pinch.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Assemble your tacos: lay down some cabbage slaw, add chunks of crispy fish, drizzle generously with lime crema, and finish with fresh cilantro. Serve immediately while everything\u2019s warm.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "The contrasts \u2014 hot fish, cool crema, crunchy cabbage \u2014 are what make Baja tacos legendary.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "pad-thai": {
    name: "Pad Thai",
    slug: "pad-thai",
    description:
      "Tangy tamarind-glazed rice noodles stir-fried with shrimp, scrambled eggs, and crunchy peanuts. Thailand\u2019s beloved street food classic.",
    cuisineFamily: "thai",
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/pad_thai.png",
    flavorProfile: ["tangy", "savory", "sweet", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "pt-1",
        name: "Rice noodles (medium width)",
        quantity: "8 oz",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-2",
        name: "Shrimp, peeled and deveined",
        quantity: "12 oz",
        isOptional: false,
        substitution: "Thinly sliced chicken breast",
      },
      {
        id: "pt-3",
        name: "Tamarind paste",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "2 tbsp lime juice + 1 tbsp rice vinegar",
      },
      {
        id: "pt-4",
        name: "Fish sauce",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-5",
        name: "Palm sugar or brown sugar",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-6",
        name: "Eggs",
        quantity: "2 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-7",
        name: "Garlic, minced",
        quantity: "3 cloves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-8",
        name: "Vegetable oil",
        quantity: "4 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-9",
        name: "Bean sprouts",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-10",
        name: "Scallions, cut into 1-inch pieces",
        quantity: "3 stalks",
        isOptional: false,
        substitution: "Chives",
      },
      {
        id: "pt-11",
        name: "Roasted peanuts, crushed",
        quantity: "1/3 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-12",
        name: "Lime wedges",
        quantity: "4 wedges",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pt-13",
        name: "Dried shrimp",
        quantity: "2 tbsp",
        isOptional: true,
        substitution: null,
      },
      {
        id: "pt-14",
        name: "Thai chili flakes",
        quantity: "1/2 tsp",
        isOptional: true,
        substitution: "Red pepper flakes",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Place rice noodles in a large bowl and cover with warm water. Let them soak until pliable and bendy but still firm \u2014 they\u2019ll finish cooking in the wok.",
        timerSeconds: 420,
        mistakeWarning:
          "Don\u2019t use boiling water or the noodles will turn mushy. Warm water is perfect.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The noodles should bend easily without breaking but still have some firmness.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "While the noodles soak, whisk together tamarind paste, fish sauce, and sugar in a small bowl until the sugar dissolves. This is your signature Pad Thai sauce.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Tamarind gives Pad Thai its distinctive tangy-sweet soul \u2014 it\u2019s what makes it taste like Thailand.",
        donenessCue:
          "The sauce should look smooth with no sugar granules remaining.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Drain the noodles well. Heat 2 tablespoons of oil in a wok or large skillet over high heat until shimmering. Add garlic and dried shrimp (if using) and stir-fry until golden.",
        timerSeconds: 45,
        mistakeWarning:
          "High heat is essential for authentic wok flavor. Don\u2019t crowd the pan or you\u2019ll steam instead of stir-fry.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You\u2019ll smell the garlic becoming fragrant and see the edges turning light golden.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add the shrimp and stir-fry until halfway cooked and starting to turn pink. Immediately add the drained noodles and toss everything together.",
        timerSeconds: 90,
        mistakeWarning:
          "Don\u2019t overcook the shrimp \u2014 they\u2019ll finish cooking with the noodles. Rubbery shrimp are sad shrimp.",
        quickHack:
          "Keep the noodles moving with your spatula or tongs to prevent sticking.",
        cuisineFact: null,
        donenessCue:
          "Shrimp should be pink on the outside but still slightly translucent in the thickest part.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Pour the tamarind sauce over the noodles and toss vigorously until everything is well coated and glossy. Push the noodle mixture to one side of the wok.",
        timerSeconds: 60,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Authentic Pad Thai is never overly saucy or sticky \u2014 the sauce should lightly coat the noodles.",
        donenessCue:
          "The noodles should glisten with sauce and have absorbed most of the liquid.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Add remaining 2 tablespoons of oil to the empty side of the wok. Pour in beaten eggs and let them set for a few seconds, then scramble into small, soft curds. Fold into the noodles.",
        timerSeconds: 45,
        mistakeWarning: null,
        quickHack:
          "Use your spatula to break the eggs into bite-sized pieces as they cook.",
        cuisineFact: null,
        donenessCue:
          "Eggs should be just set but still glossy and soft, not browned or dry.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Turn off the heat. Add bean sprouts, scallions, and half the peanuts. Toss gently, then plate immediately. Top with remaining peanuts and lime wedges.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Serve on warm plates \u2014 Pad Thai waits for no one and tastes best piping hot.",
        cuisineFact:
          "In Thailand, Pad Thai is served with extra condiments on the side: sugar, chili flakes, vinegar, and fish sauce for personal balance.",
        donenessCue:
          "The bean sprouts should be slightly wilted but still crunchy.",
        imageUrl: null,
      },
    ],
  },

  "chicken-teriyaki": {
    name: "Chicken Teriyaki",
    slug: "chicken-teriyaki",
    description:
      "Pan-seared chicken thighs glazed in a classic sweet-savory teriyaki sauce made from scratch. Simple, authentic, and absolutely delicious.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 5,
    cookTimeMinutes: 18,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["savory", "sweet", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "ct-1",
        name: "Boneless chicken thighs",
        quantity: "1 lb (450g)",
        isOptional: false,
        substitution: "Chicken breast (will be less juicy)",
      },
      {
        id: "ct-2",
        name: "Soy sauce",
        quantity: "2 tablespoons",
        isOptional: false,
        substitution: "Tamari for gluten-free",
      },
      {
        id: "ct-3",
        name: "Mirin (sweet rice wine)",
        quantity: "2 tablespoons",
        isOptional: false,
        substitution: "1 tbsp sake + 1 tsp sugar",
      },
      {
        id: "ct-4",
        name: "Sake (Japanese rice wine)",
        quantity: "2 tablespoons",
        isOptional: false,
        substitution: "Dry white wine or water",
      },
      {
        id: "ct-5",
        name: "Granulated sugar",
        quantity: "1 tablespoon",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ct-6",
        name: "Neutral oil (vegetable or canola)",
        quantity: "1 tablespoon",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ct-7",
        name: "Salt and black pepper",
        quantity: "Pinch of each",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ct-8",
        name: "Green onions, sliced",
        quantity: "2 stalks",
        isOptional: true,
        substitution: "Sesame seeds for garnish",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "In a small bowl, combine soy sauce, mirin, sake, and sugar. Stir until the sugar dissolves completely. Set your teriyaki sauce aside.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Microwave the sauce for 20 seconds to help the sugar dissolve faster.",
        cuisineFact:
          "Authentic teriyaki uses just these 4 ingredients \u2014 no cornstarch or ginger needed.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Score the chicken in a crosshatch pattern about 1/2 inch apart, cutting halfway through. This helps it cook evenly and absorb more sauce. Pat completely dry, then season with salt and pepper.",
        timerSeconds: null,
        mistakeWarning:
          "Don\u2019t cut all the way through \u2014 just score about halfway into the meat.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "The surface should look dry, not glistening wet.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Heat oil in a large skillet over medium-high heat. Once shimmering, add chicken smooth-side down and press firmly with a spatula for the first 10 seconds for even contact.",
        timerSeconds: 300,
        mistakeWarning:
          "Don\u2019t move the chicken around \u2014 let it sear undisturbed to develop that golden crust.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "After 5 minutes, edges should be golden and the chicken should release easily from the pan.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Flip the chicken and cook 4 minutes more. Lower heat to medium, cover, and steam for 3 more minutes to cook through gently without drying out.",
        timerSeconds: 420,
        mistakeWarning: null,
        quickHack: "Use this time to slice your green onion garnish.",
        cuisineFact:
          "The steam-finish technique keeps the chicken incredibly juicy \u2014 a secret from Japanese home cooks.",
        donenessCue:
          "The thickest part should feel firm when pressed, not squishy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Remove the lid and increase heat to medium-high. Tilt the pan and carefully wipe away excess oil with a paper towel (held with tongs), then pour in your teriyaki sauce all at once.",
        timerSeconds: null,
        mistakeWarning:
          "Be careful when wiping oil \u2014 the pan is hot! Use tongs to hold the paper towel.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "The sauce should immediately start bubbling vigorously.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Continuously spoon the bubbling sauce over the chicken, flipping occasionally. The sauce will reduce and become glossy, coating the chicken in a beautiful glaze.",
        timerSeconds: 180,
        mistakeWarning:
          "Keep moving the sauce \u2014 if it sits still too long it can burn and turn bitter.",
        quickHack:
          "Tilt the pan to pool the sauce in one spot, making it easier to spoon over the chicken.",
        cuisineFact:
          "\u2018Teriyaki\u2019 literally means \u2018glossy grilled\u2019 \u2014 that signature shine is what you\u2019re going for.",
        donenessCue:
          "The sauce is ready when it coats the back of a spoon and looks thick and shiny.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Transfer chicken to a cutting board and rest for 2 minutes. Slice into bite-sized pieces, arrange on a plate, drizzle with remaining pan sauce, and top with green onions.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The juices should run clear when you slice, and the meat should look opaque throughout.",
        imageUrl: null,
      },
    ],
  },

  // ── Round 1 addition: Bibimbap ──────────────────────────
  bibimbap: {
    name: "Bibimbap",
    slug: "bibimbap",
    description:
      "A vibrant bowl of warm rice topped with an array of seasoned vegetables, gochujang chilli paste, a fried egg, and optional bulgogi beef, mixed together before eating.",
    cuisineFamily: "korean",
    prepTimeMinutes: 25,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/bibimbap.png",
    flavorProfile: ["savory", "spicy", "nutty", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "bb-1",
        name: "Short-grain white rice",
        quantity: "2 cups (about 4 cups cooked)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-2",
        name: "Sesame oil",
        quantity: "2 tbsp, divided",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-3",
        name: "Fresh spinach",
        quantity: "200g",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-4",
        name: "Soybean sprouts",
        quantity: "200g",
        isOptional: false,
        substitution: "Regular bean sprouts",
      },
      {
        id: "bb-5",
        name: "Carrot",
        quantity: "1 medium, julienned",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-6",
        name: "Zucchini",
        quantity: "1 small, half-moon sliced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-7",
        name: "Shiitake mushrooms",
        quantity: "4-5, sliced",
        isOptional: false,
        substitution: "Cremini mushrooms",
      },
      {
        id: "bb-8",
        name: "Ground beef",
        quantity: "150g",
        isOptional: true,
        substitution: "Thinly sliced bulgogi beef or tofu",
      },
      {
        id: "bb-9",
        name: "Soy sauce",
        quantity: "2 tbsp, divided",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-10",
        name: "Garlic",
        quantity: "3 cloves, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-11",
        name: "Gochujang (Korean red pepper paste)",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-12",
        name: "Sugar",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Honey",
      },
      {
        id: "bb-13",
        name: "Rice vinegar",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-14",
        name: "Eggs",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-15",
        name: "Toasted sesame seeds",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Cook 2 cups short-grain rice according to package directions (or use a rice cooker). Once done, toss with 1 tbsp sesame oil to coat every grain. Keep warm.",
        timerSeconds: null,
        mistakeWarning:
          "Use short-grain Korean or Japanese rice only — long-grain or jasmine won't stick properly and you'll miss the right texture.",
        quickHack:
          "Day-old leftover rice works great — it's actually better for dolsot-style bibimbap because it crisps up more.",
        cuisineFact:
          "Bibimbap (비빔밥) literally means 'mixed rice' — bibim (mixed) + bap (rice). The dish has roots in Buddhist temple cooking where monks mixed leftover vegetables with rice.",
        donenessCue:
          "Each grain is distinct and slightly glossy from the sesame oil, not clumped or mushy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Prepare the namul (seasoned vegetables) one at a time. Blanch spinach 30 seconds in boiling water, shock in ice water, squeeze completely dry, then season with 1 tsp sesame oil, 1/2 tsp soy sauce, and 1 minced garlic clove. Blanch bean sprouts 3-4 minutes covered, drain, season the same way.",
        timerSeconds: null,
        mistakeWarning:
          "You MUST squeeze water out of spinach until almost nothing comes out — excess moisture makes the entire bowl soggy.",
        quickHack:
          "Blanch spinach and bean sprouts in the microwave (covered, 2 min each) instead of boiling water for faster prep.",
        cuisineFact: null,
        donenessCue:
          "Spinach is bright green and wilted but not slimy. Bean sprouts are translucent but still snappy when bitten.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Sauté the remaining vegetables separately: julienned carrots in 1 tsp oil for 2 min, salted zucchini slices (squeezed dry) for 2-3 min, and mushroom slices with 1 tsp soy sauce and 1 tsp sesame oil for 3-4 min. Season each lightly with salt.",
        timerSeconds: null,
        mistakeWarning:
          "Each vegetable must be cooked and seasoned separately — this gives bibimbap its distinct layered flavors. Don't take the shortcut of stir-frying them together.",
        quickHack:
          "Batch-prep all the namul on Sunday — they keep 3-4 days in the fridge and bibimbap becomes a 10-minute weeknight meal.",
        cuisineFact: null,
        donenessCue:
          "Carrots are slightly softened but still have bite (vivid orange). Zucchini is lightly golden on edges, not waterlogged. Mushrooms have caramelized edges, reduced to about half size.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "If using beef: mix with 1 tbsp soy sauce, 1 tsp sugar, 1 tsp sesame oil, and 1 minced garlic clove. Sear in a hot skillet over high heat for 3-4 minutes until caramelized. Set aside.",
        timerSeconds: 240,
        mistakeWarning: null,
        quickHack:
          "Skip the beef entirely — a fried egg with good gochujang sauce is plenty of protein. Many Koreans eat bibimbap vegetarian.",
        cuisineFact: null,
        donenessCue:
          "Beef has caramelized brown edges, no pink remaining, slightly glossy from the marinade.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Make the bibimbap sauce: whisk together 2 tbsp gochujang, 1 tbsp sesame oil, 1 tbsp sugar, 1 tbsp water, and 1 tsp rice vinegar until smooth.",
        timerSeconds: null,
        mistakeWarning:
          "Start with less sauce per bowl (1 tbsp) and add more to taste — gochujang is intense and it's easy to overpower the delicate namul flavors.",
        quickHack:
          "In a pinch, just use gochujang straight from the tub mixed with a splash of sesame oil — no need for the full sauce.",
        cuisineFact:
          "Gochujang is a fermented paste of chili, glutinous rice, soybeans, and salt that traditionally takes months to make. It's the defining condiment — without it, it's just mixed rice.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Fry 2 eggs sunny-side-up: heat 1 tsp oil in a non-stick pan over medium-low heat, crack eggs in, cover, and cook until whites are fully set but yolks are still runny, about 2-3 minutes.",
        timerSeconds: 150,
        mistakeWarning:
          "Keep the yolk runny — it breaks and coats everything when you mix at the table. That golden yolk moment is the magic of bibimbap.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Whites are fully opaque and set. Yolk jiggles visibly when the pan is gently shaken.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Assemble: place warm rice in the bottom of a large bowl. Arrange each namul, beef (if using), and egg on top in separate sections like a clock face — do not mix yet. Sprinkle sesame seeds. Add gochujang sauce to taste, then mix everything together vigorously right before eating.",
        timerSeconds: null,
        mistakeWarning:
          "Don't break the egg yolk during assembly — it should break dramatically when you mix at the table.",
        quickHack:
          "For crispy rice (nurungji): coat a cast iron skillet with sesame oil, press rice in, heat on medium 5-6 min undisturbed until the bottom is golden and crackling.",
        cuisineFact:
          "The traditional namul selection covers all five Korean flavor principles and five colors (obangsaek) — rooted in Korean philosophy. The mixing at the table is the whole point of the dish.",
        donenessCue:
          "A beautiful, colorful bowl with distinct sections of vegetables. After mixing, everything is evenly coated in the orange-red gochujang sauce with streaks of golden yolk throughout.",
        imageUrl: null,
      },
    ],
  },

  // ── Round 3 addition: Chicken Adobo ─────────────────────
  "chicken-adobo": {
    name: "Chicken Adobo",
    slug: "chicken-adobo",
    description:
      "Chicken braised in a bold sauce of vinegar, soy sauce, garlic, bay leaves, and black peppercorns — the Philippines' national dish.",
    cuisineFamily: "filipino",
    prepTimeMinutes: 10,
    cookTimeMinutes: 50,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["savory", "tangy", "garlicky", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "ca-1",
        name: "Bone-in, skin-on chicken thighs and drumsticks",
        quantity: "2 lbs (about 6-8 pieces)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ca-2",
        name: "Soy sauce",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ca-3",
        name: "White cane vinegar",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "Distilled white vinegar (not rice or apple cider)",
      },
      {
        id: "ca-4",
        name: "Garlic",
        quantity: "1 whole head (10-12 cloves), peeled and crushed",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ca-5",
        name: "Water",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ca-6",
        name: "Dried bay leaves",
        quantity: "3",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ca-7",
        name: "Whole black peppercorns",
        quantity: "1 tbsp, cracked",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ca-8",
        name: "Vegetable oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Combine chicken, soy sauce, vinegar, crushed garlic, bay leaves, and peppercorns in a large bowl. Toss to coat, cover, and refrigerate for at least 30 minutes (1-2 hours is ideal).",
        timerSeconds: 1800,
        mistakeWarning:
          "Use Filipino cane vinegar or plain white vinegar only — apple cider or rice vinegar change the flavor profile completely.",
        quickHack:
          "Short on time? Skip the marination — combine everything in the pot from the start. The 30-minute braise does most of the flavor work.",
        cuisineFact:
          "The vinegar-and-salt preservation method predates Spanish colonization. The word 'adobo' was applied by Spanish colonizers who noted the similarity to their own marinades, but the Filipino technique is indigenous.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Remove chicken from marinade (save the marinade). Pat pieces dry with paper towels. Heat oil in a large heavy-bottomed pan or Dutch oven over medium-high heat. Sear chicken skin-side down for 3-4 minutes per side until golden brown. Work in batches. Set chicken aside.",
        timerSeconds: 420,
        mistakeWarning:
          "Don't crowd the pan — overcrowding leads to steaming instead of browning. The Maillard reaction on the skin is critical for flavor.",
        quickHack:
          "Pat the chicken VERY dry — moisture is the enemy of a good sear. Paper towels on both sides make a huge difference.",
        cuisineFact: null,
        donenessCue:
          "Skin is deep golden-brown and releases easily from the pan without sticking. You'll hear an audible sizzle throughout.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "In the same pan, reduce heat to medium. Add garlic from the marinade and sauté until fragrant and just golden, about 1-2 minutes.",
        timerSeconds: 90,
        mistakeWarning:
          "Watch the garlic carefully — it goes from golden to burnt in seconds, and burnt garlic tastes bitter and acrid.",
        quickHack: null,
        cuisineFact:
          "Adobo uses a LOT of garlic — a whole head. This is by design, not excess. The garlic mellows and becomes almost sweet during the long braise.",
        donenessCue:
          "Fragrant aroma fills the kitchen. Cloves are light gold, not dark brown.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Return chicken to the pan. Pour in the reserved marinade and 1 cup water. Bring to a boil, then reduce heat to a low simmer. Cover and cook for 30-35 minutes, turning pieces once halfway through.",
        timerSeconds: 2100,
        mistakeWarning:
          "Do NOT stir during the first 5-10 minutes of simmering — stirring raw vinegar into the braise makes the dish taste harsh and metallic. Let the acetic acid cook down undisturbed.",
        quickHack:
          "Use a pressure cooker for 12-15 minutes on high with natural release — same result in half the time.",
        cuisineFact:
          "Every Filipino family has their own adobo ratio — the soy-to-vinegar balance, amount of garlic, and degree of reduction are all points of lively family debate.",
        donenessCue:
          "A fork inserted into the thickest part meets no resistance. Chicken pulls away slightly from the bone.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Remove the lid and increase heat to medium. Simmer uncovered until the sauce reduces by half and becomes thick and glossy, about 8-12 minutes. Baste the chicken frequently with the sauce.",
        timerSeconds: 600,
        mistakeWarning:
          "Don't skip the reduction — under-reduced sauce tastes like seasoned water, not concentrated adobo. Don't add extra salt either, as the sauce becomes saltier as it reduces.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Sauce coats the back of a spoon and holds a line when you drag your finger through it. Color deepens from reddish-brown to dark, glossy mahogany.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "For crispy skin (optional but recommended): remove chicken from sauce. Heat a thin layer of oil in a separate pan over high heat. Sear skin-side down for 2-3 minutes until deeply caramelized and crispy. Plate and spoon the reduced sauce over the top. Serve with steamed jasmine rice.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack:
          "Skip the pan sear — broil on a sheet pan for 3-4 minutes instead. Easier for large batches and less splatter.",
        cuisineFact:
          "Adobo is famously better the next day — the flavors meld and deepen overnight in the fridge. Many Filipinos make a double batch on purpose.",
        donenessCue:
          "Skin is dark mahogany to near-black in spots (this is correct, not burnt). Audibly crackly when tapped with tongs.",
        imageUrl: null,
      },
    ],
  },
  roti: {
    name: "Roti",
    slug: "roti",
    description:
      "Soft, puffed Indian flatbread made with whole wheat flour — the perfect vessel for curries and dal.",
    cuisineFamily: "indian",
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/roti.png",
    flavorProfile: ["warm", "nutty", "wholesome"],
    temperature: "hot",
    ingredients: [
      {
        id: "ro-1",
        name: "Whole wheat flour (atta)",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ro-2",
        name: "Water",
        quantity: "3/4 cup warm",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ro-3",
        name: "Salt",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ro-4",
        name: "Ghee",
        quantity: "1 tbsp",
        isOptional: true,
        substitution: "Butter or oil",
      },
      {
        id: "ro-5",
        name: "Extra flour for dusting",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Mix the flour and salt in a bowl. Add warm water gradually, mixing with your hand until a soft dough forms. Knead for 5 minutes until smooth and elastic, then cover with a damp cloth and rest for 10 minutes.",
        timerSeconds: 600,
        mistakeWarning:
          "Don't add all the water at once — add it a tablespoon at a time near the end. Too-wet dough sticks to everything.",
        quickHack:
          "Don't stress about perfect circles — even irregular roti taste just as good.",
        cuisineFact:
          "Roti has been a daily staple in South Asia for over 5,000 years. In many Indian households, the ability to make perfectly round roti is considered a rite of passage.",
        donenessCue:
          "The dough should be smooth, soft, and not sticky — it should spring back slightly when poked.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Divide the dough into 8 equal balls. Dust each ball in flour, then roll out on a floured surface into a thin circle, about 6 inches across. Roll from the center outward, rotating the dough as you go.",
        timerSeconds: null,
        mistakeWarning:
          "Apply even pressure while rolling — pressing harder on one side makes lopsided roti that won't puff evenly.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The rolled roti should be thin enough to almost see through, with even thickness throughout.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Heat a flat skillet (tawa) over medium-high heat until a drop of water sizzles and evaporates instantly. Place the rolled roti on the dry skillet — no oil needed. Cook for about 30-45 seconds until bubbles form on the surface, then flip.",
        timerSeconds: 45,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Small bubbles appear on the surface and the underside has light brown spots.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "After flipping, cook the second side for 30 seconds, then use tongs to place the roti directly over an open flame for a few seconds per side — it should puff up like a balloon. If you don't have a gas stove, press gently with a cloth on the skillet to encourage puffing.",
        timerSeconds: 30,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "The dramatic puffing happens because trapped steam inside the two layers of dough expands rapidly — a perfectly puffed roti means the layers separated evenly during rolling.",
        donenessCue:
          "The roti puffs up fully with both sides showing golden-brown spots. It should feel light and hollow when tapped.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Brush the hot roti with a touch of ghee and stack them in a towel-lined container to keep warm and soft. Repeat with remaining dough balls. Serve warm alongside dal, curry, or any saucy dish.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
};

// ── Helpers ─────────────────────────────────────────────

/**
 * Get guided cook data for a side dish by slug.
 * Returns null if no data exists for this dish.
 */
export function getStaticCookData(slug: string): StaticDishData | null {
  return guidedCookData[slug] ?? null;
}

/**
 * Get guided cook data for a main dish (meal) by slug.
 * Returns null if no data exists for this meal.
 */
export function getStaticMealCookData(slug: string): StaticDishData | null {
  return guidedCookMeals[slug] ?? null;
}

/**
 * Get all side dish slugs that have guided cook data.
 */
export function getAvailableCookSlugs(): string[] {
  return Object.keys(guidedCookData);
}

/**
 * Get all meal slugs that have guided cook data.
 */
export function getAvailableMealCookSlugs(): string[] {
  return Object.keys(guidedCookMeals);
}
