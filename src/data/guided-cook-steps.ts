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
  tempura: {
    name: "Tempura",
    slug: "tempura",
    description:
      "Light, crispy Japanese batter-fried vegetables and shrimp with a delicate, shattering crunch.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tempura.png",
    flavorProfile: ["crispy", "light", "delicate"],
    temperature: "hot",
    ingredients: [
      {
        id: "tp-1",
        name: "Mixed vegetables (sweet potato, broccoli, bell pepper)",
        quantity: "2 cups sliced",
        isOptional: false,
        substitution: "Shrimp or zucchini",
      },
      {
        id: "tp-2",
        name: "All-purpose flour",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tp-3",
        name: "Ice-cold sparkling water",
        quantity: "3/4 cup",
        isOptional: false,
        substitution: "Ice-cold still water",
      },
      {
        id: "tp-4",
        name: "Egg",
        quantity: "1 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tp-5",
        name: "Neutral oil (vegetable or canola)",
        quantity: "3 cups for frying",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tp-6",
        name: "Soy sauce",
        quantity: "2 tbsp for dipping",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Prep the vegetables: slice sweet potato into 1/4 inch rounds, cut broccoli into small florets, slice bell pepper into strips. Pat everything completely dry — moisture is the enemy of crispy tempura.",
        timerSeconds: null,
        mistakeWarning:
          "Wet vegetables will cause the oil to splatter and the batter won't stick. Use paper towels to thoroughly dry each piece.",
        quickHack: null,
        cuisineFact:
          "Tempura was introduced to Japan by Portuguese missionaries in the 16th century. The word comes from the Latin 'tempora,' referring to Lenten fasting periods when fried food replaced meat.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Make the batter: whisk the egg in a bowl, add ice-cold sparkling water, then dump in the flour all at once. Stir just 3-4 times with chopsticks — the batter should be lumpy with visible flour streaks. Do NOT overmix.",
        timerSeconds: null,
        mistakeWarning:
          "Overmixing develops gluten and makes the coating chewy instead of crispy. Lumps are good — they create the signature crackly texture.",
        quickHack:
          "Keep the batter bowl nested in a larger bowl of ice to keep it cold while you fry.",
        cuisineFact: null,
        donenessCue:
          "The batter should be thin and drip freely from chopsticks. If it coats thickly, add a splash more ice water.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Heat oil to 340-360°F (170-180°C) in a deep pot. Test by dropping a small bit of batter — it should sink halfway, then float up sizzling. Dip each vegetable piece in batter, let excess drip off, and gently lower into the oil. Fry 3-4 pieces at a time, about 2 minutes per side.",
        timerSeconds: 120,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The tempura is done when the bubbling around each piece slows significantly and the coating is pale golden — not dark brown. It should feel almost weightless when lifted.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Transfer finished pieces to a wire rack (not paper towels — that traps steam and kills the crunch). Serve immediately with soy sauce or tentsuyu dipping sauce. Tempura waits for no one.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "In Japan, tempura restaurants serve each piece one at a time, straight from the fryer. The 30-second window after frying is when the texture is at its absolute peak.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "refried-beans": {
    name: "Refried Beans",
    slug: "refried-beans",
    description:
      "Creamy, smoky Mexican frijoles refritos — mashed pinto beans cooked in lard or oil until silky smooth.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/refried_beans.png",
    flavorProfile: ["creamy", "savory", "smoky"],
    temperature: "hot",
    ingredients: [
      {
        id: "rb-1",
        name: "Canned pinto beans",
        quantity: "2 cans (15 oz each), drained",
        isOptional: false,
        substitution: "Black beans",
      },
      {
        id: "rb-2",
        name: "Lard or vegetable oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Butter",
      },
      {
        id: "rb-3",
        name: "Onion",
        quantity: "1/2 medium, diced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "rb-4",
        name: "Garlic",
        quantity: "2 cloves, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "rb-5",
        name: "Cumin",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "rb-6",
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
          "Heat the lard or oil in a large skillet over medium heat. Add the diced onion and cook until soft and translucent, about 3 minutes. Add garlic and cumin, stir for 30 seconds until fragrant.",
        timerSeconds: 210,
        mistakeWarning: null,
        quickHack:
          "Skip the onion and garlic — just heat beans with oil and cumin for a 5-minute version.",
        cuisineFact:
          "Despite the name, refried beans are only fried once. 'Refritos' actually means 'well-fried' in Spanish, not 're-fried.'",
        donenessCue:
          "Onions are soft and edges are just starting to turn golden.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add the drained beans and about 1/4 cup of water. Mash with a potato masher or the back of a fork, leaving some beans chunky for texture. Stir and cook for 5-7 minutes, adding splashes of water if the mixture gets too thick.",
        timerSeconds: 420,
        mistakeWarning:
          "Don't add too much water at once — it's easier to thin the beans than to thicken them. Add a tablespoon at a time.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The beans should be creamy and hold their shape on a spoon without being runny. They thicken as they cool, so err on the side of slightly loose.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Taste and adjust salt. Serve hot alongside tacos, burritos, or rice. Top with crumbled queso fresco or a squeeze of lime if you like.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "In Mexican home cooking, the rendered fat from cooking chorizo is often used instead of plain lard — it adds an incredible smoky depth.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "basmati-rice": {
    name: "Basmati Rice",
    slug: "basmati-rice",
    description:
      "Perfectly fluffy, long-grained basmati rice with each grain separate and aromatic.",
    cuisineFamily: "indian",
    prepTimeMinutes: 5,
    cookTimeMinutes: 20,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/basmati_rice.png",
    flavorProfile: ["aromatic", "light", "nutty"],
    temperature: "hot",
    ingredients: [
      {
        id: "br-1",
        name: "Basmati rice",
        quantity: "1 cup",
        isOptional: false,
        substitution: "Jasmine rice",
      },
      {
        id: "br-2",
        name: "Water",
        quantity: "1.5 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "br-3",
        name: "Salt",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "br-4",
        name: "Ghee or butter",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "Oil",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Rinse the rice in a fine mesh strainer under cold running water until the water runs clear — this removes excess starch and prevents the rice from becoming gummy. Soak in water for 15 minutes if you have time (optional but makes fluffier rice).",
        timerSeconds: null,
        mistakeWarning:
          "Skipping the rinse is the #1 reason for sticky, clumpy basmati. Rinse at least 3-4 times.",
        quickHack:
          "No time to soak? The rinse alone will still give you good results.",
        cuisineFact:
          "The word 'basmati' comes from Hindi meaning 'fragrant one.' Aged basmati (1-2 years) is prized because the grains expand more and cook fluffier.",
        donenessCue:
          "The rinse water should go from milky white to nearly clear.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "In a heavy-bottomed pot, add the rinsed rice, water, salt, and ghee. Bring to a boil over high heat, then immediately reduce to the lowest possible heat. Cover tightly and cook for 15 minutes. Do not lift the lid.",
        timerSeconds: 900,
        mistakeWarning:
          "Do not stir or lift the lid while cooking — the steam is doing the work. Every peek lets out steam and results in unevenly cooked rice.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Turn off the heat and let the rice sit covered for 5 minutes — this finishing steam is what makes each grain perfectly tender. Then fluff gently with a fork, lifting and separating the grains. Never stir with a spoon.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "In Persian and Indian cooking, the golden crust at the bottom of the pot (tahdig/khurchan) is considered the best part and is served separately as a delicacy.",
        donenessCue:
          "Each grain should be separate, elongated, and tender but not mushy. The rice should feel light and airy when fluffed.",
        imageUrl: null,
      },
    ],
  },
  "sweet-potato-fries": {
    name: "Sweet Potato Fries",
    slug: "sweet-potato-fries",
    description:
      "Crispy, caramelized sweet potato fries baked to perfection — healthier than regular fries with more flavor.",
    cuisineFamily: "american",
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/sweet_potato_fries.png",
    flavorProfile: ["sweet", "crispy", "savory"],
    temperature: "hot",
    ingredients: [
      {
        id: "sp-1",
        name: "Sweet potatoes",
        quantity: "2 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sp-2",
        name: "Olive oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Avocado oil",
      },
      {
        id: "sp-3",
        name: "Cornstarch",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sp-4",
        name: "Smoked paprika",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "Regular paprika",
      },
      {
        id: "sp-5",
        name: "Salt and pepper",
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
          "Preheat oven to 425°F (220°C). Cut sweet potatoes into even 1/4 inch sticks — consistency is key for even cooking. Soak in cold water for 10 minutes, then drain and pat completely dry.",
        timerSeconds: null,
        mistakeWarning:
          "Uneven cuts mean some fries burn while others stay soggy. Take the time to cut them the same size.",
        quickHack:
          "Skip the soaking step if you're short on time — just make sure to dry them thoroughly.",
        cuisineFact:
          "Sweet potatoes are not actually related to regular potatoes. They're in the morning glory family and are native to Central and South America.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Toss the dry fries with oil, cornstarch, paprika, salt, and pepper in a large bowl until evenly coated. The cornstarch is the secret to crispiness — it absorbs moisture and creates a crunchy shell.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Every fry should have a thin, even coating — no wet spots or dry patches.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Spread the fries in a single layer on a parchment-lined baking sheet. Leave space between each fry — crowding causes steaming instead of crisping. Bake for 15 minutes, flip each fry, then bake 10 more minutes.",
        timerSeconds: 900,
        mistakeWarning:
          "Do NOT pile the fries on top of each other. Use two baking sheets if needed. Crowded fries will be limp and sad.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Edges are dark and caramelized, the surface feels firm when tapped, and they lift easily from the parchment without sticking.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Season with a final pinch of flaky salt immediately out of the oven. Serve right away — sweet potato fries lose their crunch faster than regular fries.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "seaweed-salad": {
    name: "Seaweed Salad",
    slug: "seaweed-salad",
    description:
      "Refreshing Japanese wakame salad dressed with sesame oil, rice vinegar, and a hint of ginger.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/seaweed_salad.png",
    flavorProfile: ["fresh", "savory", "tangy"],
    temperature: "cold",
    ingredients: [
      {
        id: "sw-1",
        name: "Dried wakame seaweed",
        quantity: "1 oz (about 1/4 cup dry)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sw-2",
        name: "Rice vinegar",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sw-3",
        name: "Soy sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Tamari for gluten-free",
      },
      {
        id: "sw-4",
        name: "Sesame oil",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sw-5",
        name: "Fresh ginger",
        quantity: "1 tsp grated",
        isOptional: false,
        substitution: "1/4 tsp ground ginger",
      },
      {
        id: "sw-6",
        name: "Sesame seeds",
        quantity: "1 tbsp",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Soak the dried wakame in cold water for 5 minutes — it will expand to about 4 times its dry volume. Once rehydrated, drain well and gently squeeze out excess water. If the pieces are large, cut them into bite-sized strips.",
        timerSeconds: 300,
        mistakeWarning:
          "Don't soak longer than 5 minutes — over-soaked wakame turns slimy and falls apart.",
        quickHack: null,
        cuisineFact:
          "Wakame is one of the most nutritious sea vegetables, packed with iodine, calcium, and omega-3 fatty acids. In Japan, it's been cultivated for over 1,000 years.",
        donenessCue:
          "The wakame should be soft, silky, and deep green — not still crunchy or translucent.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Make the dressing: whisk together rice vinegar, soy sauce, sesame oil, and grated ginger in a small bowl until combined.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The dressing should be well emulsified — not separating into oil and vinegar layers.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Toss the drained wakame with the dressing until evenly coated. Sprinkle with sesame seeds. Let it sit for 5 minutes so the flavors meld, then serve chilled or at room temperature.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "In Japanese restaurants, seaweed salad is often served as a palate cleanser between courses. The acidity and umami prepare your taste buds for the next dish.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  churros: {
    name: "Churros",
    slug: "churros",
    description:
      "Golden, crispy Mexican churros rolled in cinnamon sugar — crunchy outside, soft and airy inside.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/churros.png",
    flavorProfile: ["sweet", "crunchy", "warm"],
    temperature: "hot",
    ingredients: [
      {
        id: "ch-1",
        name: "Water",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ch-2",
        name: "Butter",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ch-3",
        name: "Sugar",
        quantity: "1/4 cup + 1/2 cup for coating",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ch-4",
        name: "All-purpose flour",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ch-5",
        name: "Egg",
        quantity: "1 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ch-6",
        name: "Cinnamon",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ch-7",
        name: "Neutral oil for frying",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "In a saucepan, bring water, butter, 1/4 cup sugar, and a pinch of salt to a boil. Remove from heat and add flour all at once. Stir vigorously with a wooden spoon until a smooth dough ball forms and pulls away from the sides of the pan.",
        timerSeconds: null,
        mistakeWarning:
          "Add ALL the flour at once and stir fast — adding it slowly creates lumps that are impossible to smooth out.",
        quickHack: null,
        cuisineFact:
          "Churros originated in Spain, where shepherds invented them as a portable snack they could fry over campfires in the mountains.",
        donenessCue:
          "The dough should be smooth, glossy, and pull cleanly from the sides of the pan into a ball.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Let the dough cool for 2 minutes, then beat in the egg until fully incorporated. The dough will break apart at first — keep stirring and it will come back together into a smooth, pipe-able dough. Load into a piping bag with a large star tip.",
        timerSeconds: null,
        mistakeWarning:
          "If you add the egg while the dough is too hot, it will cook the egg and create scrambled bits. Let it cool until you can touch the pan.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The dough should be thick enough to hold its shape when piped, but smooth enough to squeeze out of the bag.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Heat oil to 375°F (190°C). Pipe 4-5 inch lengths of dough directly into the oil, cutting with scissors. Fry 3-4 at a time for about 2 minutes per side until deep golden brown. Drain on a wire rack.",
        timerSeconds: 120,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "The star-shaped tip isn't just decorative — the ridges create more surface area, which means more crunch in every bite.",
        donenessCue:
          "Deep golden brown on all sides. If they're pale inside when you break one open, the oil wasn't hot enough — increase temperature and fry a bit longer.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Mix 1/2 cup sugar with cinnamon on a plate. While the churros are still warm and slightly oily, roll each one in the cinnamon sugar until completely coated. Serve immediately — they're best within 10 minutes of frying.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  // ── Batch 2: 20 new dishes ─────────────────────────

  "potato-salad": {
    name: "Potato Salad",
    slug: "potato-salad",
    description: "Creamy, tangy potato salad with celery, onion, and a mustardy mayo dressing — a backyard classic.",
    cuisineFamily: "american",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["creamy", "tangy", "savory"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Yukon Gold potatoes", quantity: "2 lbs", isOptional: false, substitution: "Russet potatoes" },
      { id: "2", name: "Mayonnaise", quantity: "½ cup", isOptional: false, substitution: "Greek yogurt" },
      { id: "3", name: "Dijon mustard", quantity: "2 tbsp", isOptional: false, substitution: "Yellow mustard" },
      { id: "4", name: "Apple cider vinegar", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Celery", quantity: "3 stalks, diced", isOptional: false, substitution: null },
      { id: "6", name: "Red onion", quantity: "¼ cup, finely diced", isOptional: false, substitution: "Green onion" },
      { id: "7", name: "Salt and pepper", quantity: "to taste", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Cut potatoes into 1-inch chunks (leave skin on for texture). Place in a large pot, cover with cold salted water by 2 inches.", timerSeconds: null, mistakeWarning: "Don't start with boiling water — starting cold ensures even cooking all the way through.", quickHack: "Adding a generous pinch of salt to the water is your first and best seasoning opportunity.", cuisineFact: "American potato salad has German roots — German immigrants brought 'Kartoffelsalat' (vinegar-dressed potato salad) to the US, which eventually evolved into the mayo version.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Bring to a boil over high heat, then reduce to a steady simmer. Cook 12–15 minutes until a fork slides in easily with no resistance.", timerSeconds: 840, mistakeWarning: "Don't overcook — mushy potatoes won't hold their shape when stirred with dressing.", quickHack: null, cuisineFact: null, donenessCue: "Fork slides in with zero resistance and potatoes hold their shape.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Drain and spread potatoes on a sheet pan. While still hot, drizzle with 1 tbsp vinegar and a pinch of salt. Let cool 10 minutes — hot potatoes absorb dressing better.", timerSeconds: 600, mistakeWarning: null, quickHack: "Seasoning while hot is the secret to deeply flavored potato salad. Don't skip this step.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Whisk together mayo, mustard, remaining vinegar, salt, and pepper in a large bowl. Add celery and red onion.", timerSeconds: null, mistakeWarning: null, quickHack: "Taste the dressing before adding potatoes — it should be slightly over-seasoned since potatoes will dilute it.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 5, instruction: "Add cooled potatoes to the dressing and fold gently with a spatula. You want chunks, not mash. Refrigerate at least 1 hour before serving.", timerSeconds: 3600, mistakeWarning: "Don't stir aggressively — folding preserves the potato chunks that make this satisfying.", quickHack: "Make it a day ahead — the flavor improves dramatically overnight as potatoes absorb the dressing.", cuisineFact: null, donenessCue: "Potatoes evenly coated, salad slightly creamy. Flavors will deepen in the fridge.", imageUrl: null },
    ],
  },

  "onion-rings": {
    name: "Onion Rings",
    slug: "onion-rings",
    description: "Thick-cut onion rings in a crispy, seasoned beer batter — golden, crunchy, and impossible to stop eating.",
    cuisineFamily: "american",
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["crispy", "savory", "slightly sweet"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Large yellow onions", quantity: "2", isOptional: false, substitution: "Sweet onions" },
      { id: "2", name: "All-purpose flour", quantity: "1½ cups", isOptional: false, substitution: null },
      { id: "3", name: "Beer (lager or ale)", quantity: "1 cup, cold", isOptional: false, substitution: "Cold sparkling water" },
      { id: "4", name: "Garlic powder", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "5", name: "Paprika", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Salt", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "7", name: "Neutral oil for frying", quantity: "4 cups", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Slice onions into ½-inch rings. Separate into individual rings and pat completely dry with paper towels. Dust lightly with ¼ cup flour.", timerSeconds: null, mistakeWarning: "Wet onions = batter sliding off. Dry thoroughly — this is the most important prep step.", quickHack: "Keep the rings separated by size so they cook evenly. Small rings cook 30 seconds faster.", cuisineFact: "Beer batter uses the carbonation to create a light, airy crust that regular batter can't achieve.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Heat oil in a deep pot to 375°F (190°C). Use a thermometer — temperature is everything for crispy rings.", timerSeconds: 300, mistakeWarning: "Oil below 350°F makes greasy rings. Above 400°F burns the batter before the onion softens.", quickHack: "Drop a small piece of batter in — it should sizzle immediately and rise to the surface.", cuisineFact: null, donenessCue: "Oil shimmers and a drop of batter sizzles vigorously on contact.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Whisk remaining flour, garlic powder, paprika, and salt together. Add cold beer all at once and whisk just until combined — lumps are fine. Don't overmix.", timerSeconds: null, mistakeWarning: "Overmixing develops gluten and makes batter tough and chewy instead of light and crispy.", quickHack: "Keep the beer ice cold — cold batter hitting hot oil creates better steam pockets and crispness.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Dip rings in batter, let excess drip off, then lower carefully into hot oil. Fry 3–4 rings at a time for 2–3 minutes per side until deep golden brown.", timerSeconds: 150, mistakeWarning: "Overcrowding drops oil temperature and steams instead of fries — work in small batches.", quickHack: null, cuisineFact: null, donenessCue: "Deep golden brown with an audible crunch when tapped.", imageUrl: null },
      { phase: "cook", stepNumber: 5, instruction: "Remove with a spider or tongs. Drain on a wire rack over a sheet pan (not paper towels — that traps steam and softens the crust). Season with salt immediately.", timerSeconds: null, mistakeWarning: null, quickHack: "Season the second they come out of the oil — that's when the salt sticks best.", cuisineFact: null, donenessCue: "Rings stay crispy on a rack; serve immediately for maximum crunch.", imageUrl: null },
    ],
  },

  "french-fries": {
    name: "French Fries",
    slug: "french-fries",
    description: "Crispy double-fried potatoes with fluffy interiors — the classic that requires more technique than it looks.",
    cuisineFamily: "american",
    prepTimeMinutes: 30,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["crispy", "savory", "starchy"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Russet potatoes", quantity: "2 lbs", isOptional: false, substitution: "Yukon Gold (less crispy)" },
      { id: "2", name: "Neutral oil for frying", quantity: "4 cups", isOptional: false, substitution: null },
      { id: "3", name: "Kosher salt", quantity: "to taste", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Peel potatoes and cut into ¼-inch sticks. Soak in a bowl of cold water for 30 minutes. This removes surface starch — the key to non-soggy fries.", timerSeconds: 1800, mistakeWarning: "Skip the soak and your fries will steam and go limp instead of crisping up.", quickHack: "For extra crispy fries, soak overnight in the fridge and change the water once.", cuisineFact: "Despite the name, French fries likely originated in Belgium in the late 1600s. American soldiers tasted them in WWI — the Belgian army spoke French, so they called them 'French fries.'", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Drain and dry potatoes completely with kitchen towels. Heat oil to 325°F (163°C). First fry: cook in batches for 4–5 minutes until fries are pale and limp. Remove and drain.", timerSeconds: 300, mistakeWarning: "The first fry isn't about color — it cooks the potato through. Don't rush it.", quickHack: "Between batches, bring oil back to temperature before adding the next batch.", cuisineFact: null, donenessCue: "Pale, cooked through but not colored. They should bend without snapping.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Let par-cooked fries rest at room temperature for 10 minutes. Meanwhile, heat oil to 375°F (190°C) for the second fry.", timerSeconds: 600, mistakeWarning: null, quickHack: "You can do this rest for up to 2 hours — great for timing with a meal.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Second fry: cook in batches 2–3 minutes until deep golden and crispy. Remove and drain on a wire rack. Season with kosher salt immediately.", timerSeconds: 150, mistakeWarning: "Don't use paper towels — they trap steam and make fries soggy. Wire rack only.", quickHack: "Salt the second they come out — salt only sticks to hot, just-fried surfaces.", cuisineFact: null, donenessCue: "Deep golden color, rigid and crispy. Audible crunch when you break one.", imageUrl: null },
    ],
  },

  "corn-on-cob": {
    name: "Corn on the Cob",
    slug: "corn-on-cob",
    description: "Sweet summer corn boiled to perfection and finished with butter and salt. Deceptively simple, endlessly satisfying.",
    cuisineFamily: "american",
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["sweet", "buttery", "savory"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Fresh corn on the cob", quantity: "4 ears", isOptional: false, substitution: null },
      { id: "2", name: "Butter", quantity: "2 tbsp per ear", isOptional: false, substitution: "Olive oil" },
      { id: "3", name: "Salt", quantity: "to taste", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Shuck corn: peel back husks and remove all silk strands. Snap off any tough end. Bring a large pot of unsalted water to a rolling boil.", timerSeconds: null, mistakeWarning: "Don't salt the water — salt toughens corn kernels. Season after cooking.", quickHack: "Add 1 tbsp sugar to the water if your corn isn't peak-season fresh. It mimics the sweetness.", cuisineFact: "Corn loses up to 50% of its natural sugar within 24 hours of picking — the sugars convert to starch. Fresh, local, just-picked corn is the goal.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Add corn to boiling water. Boil 4–6 minutes for peak-season corn, 7–10 for corn that's been sitting. Don't overcook — sugars break down.", timerSeconds: 360, mistakeWarning: "Overcooked corn becomes starchy and tough. When in doubt, pull it early.", quickHack: "Fresh summer corn often needs only 3–4 minutes — taste a kernel at 4 minutes.", cuisineFact: null, donenessCue: "Kernels are bright yellow, slightly tender when pressed with a fingernail.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Remove corn with tongs. Let rest 1 minute, then rub generously with butter. Season with salt and serve immediately.", timerSeconds: null, mistakeWarning: null, quickHack: "For extra flavor: compound butter with garlic and herbs, or Mexican-style with mayo, cotija cheese, and chili powder (elote).", cuisineFact: null, donenessCue: "Butter melts on contact and corn glistens.", imageUrl: null },
    ],
  },

  fattoush: {
    name: "Fattoush",
    slug: "fattoush",
    description: "A bright Levantine bread salad with crispy pita chips, fresh vegetables, and a zingy sumac-lemon dressing.",
    cuisineFamily: "mediterranean",
    prepTimeMinutes: 20,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["bright", "tangy", "crispy", "herby"],
    temperature: "room temp",
    ingredients: [
      { id: "1", name: "Pita bread", quantity: "2 pieces", isOptional: false, substitution: "Flatbread or lavash" },
      { id: "2", name: "Romaine lettuce", quantity: "1 head, torn", isOptional: false, substitution: null },
      { id: "3", name: "Cherry tomatoes", quantity: "1 cup, halved", isOptional: false, substitution: null },
      { id: "4", name: "Persian cucumber", quantity: "2, sliced", isOptional: false, substitution: "Regular cucumber, seeds removed" },
      { id: "5", name: "Radishes", quantity: "6, thinly sliced", isOptional: false, substitution: null },
      { id: "6", name: "Fresh mint and parsley", quantity: "½ cup each", isOptional: false, substitution: null },
      { id: "7", name: "Sumac", quantity: "2 tsp", isOptional: false, substitution: "Extra lemon zest" },
      { id: "8", name: "Lemon juice", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "9", name: "Olive oil", quantity: "4 tbsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Tear pita into rough 1-inch pieces. Toss with 2 tbsp olive oil and a pinch of salt. Spread on a baking sheet and bake at 375°F for 8–10 minutes until golden and crispy.", timerSeconds: 540, mistakeWarning: "Under-toasting leaves pita chewy — it should be crisp enough to shatter when broken.", quickHack: "Pan-frying the pita in olive oil makes it even more flavorful. Stir constantly over medium heat, 4–5 minutes.", cuisineFact: "Fattoush means 'crumbled bread' in Arabic. Like Italian panzanella, it was born from a desire to use day-old bread rather than let it go to waste.", donenessCue: "Golden, crispy, and shatters easily when broken.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Whisk together lemon juice, remaining olive oil, sumac, salt, and pepper in a small bowl. Taste — it should be bright and punchy.", timerSeconds: null, mistakeWarning: null, quickHack: "Let the dressing sit 5 minutes — sumac needs a little time to bloom and release its tartness.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Combine lettuce, tomatoes, cucumber, radishes, mint, and parsley in a large bowl. Add dressing and toss to coat.", timerSeconds: null, mistakeWarning: "Don't dress the salad more than 5 minutes ahead — the lettuce wilts quickly.", quickHack: null, cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Add pita chips just before serving and toss gently — you want them to stay crunchy. Dust the top with extra sumac.", timerSeconds: null, mistakeWarning: "Adding pita chips too early makes them soggy. Add at the last possible moment.", quickHack: "Keep extra pita chips on the side for people who like more crunch.", cuisineFact: null, donenessCue: "Salad glistens with dressing, pita chips still audibly crispy.", imageUrl: null },
    ],
  },

  "stuffed-grape-leaves": {
    name: "Stuffed Grape Leaves",
    slug: "stuffed-grape-leaves",
    description: "Tender grape leaves filled with lemony herbed rice — dolmades are one of the Mediterranean's most satisfying bites.",
    cuisineFamily: "mediterranean",
    prepTimeMinutes: 40,
    cookTimeMinutes: 45,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["lemony", "herby", "savory", "earthy"],
    temperature: "room temp",
    ingredients: [
      { id: "1", name: "Jarred grape leaves", quantity: "40–50 leaves", isOptional: false, substitution: null },
      { id: "2", name: "Long-grain white rice", quantity: "1 cup, uncooked", isOptional: false, substitution: null },
      { id: "3", name: "Onion", quantity: "1, finely diced", isOptional: false, substitution: null },
      { id: "4", name: "Fresh dill", quantity: "¼ cup, chopped", isOptional: false, substitution: "Dried dill (2 tbsp)" },
      { id: "5", name: "Fresh parsley", quantity: "¼ cup, chopped", isOptional: false, substitution: null },
      { id: "6", name: "Lemon juice", quantity: "4 tbsp", isOptional: false, substitution: null },
      { id: "7", name: "Olive oil", quantity: "4 tbsp", isOptional: false, substitution: null },
      { id: "8", name: "Salt and pepper", quantity: "to taste", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Rinse grape leaves in cold water. Bring a pot of water to a boil, blanch leaves for 1 minute, then drain and separate. Trim any tough stems.", timerSeconds: null, mistakeWarning: "Skip blanching jarred leaves and they'll be overly salty and stiff.", quickHack: "Line the bottom of your cooking pot with 2–3 grape leaves to prevent the stuffed ones from sticking.", cuisineFact: "Grape leaves have been used in Mediterranean cooking for thousands of years — dolmades appear in ancient Greek and Ottoman cuisine dating back centuries.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Mix uncooked rice, onion, dill, parsley, 2 tbsp lemon juice, 2 tbsp olive oil, salt, and pepper in a bowl. The rice will finish cooking inside the rolls.", timerSeconds: null, mistakeWarning: null, quickHack: "Use cold water to rinse the rice first — removing excess starch prevents the filling from turning gluey.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Place a leaf smooth-side down. Add 1 tsp filling near the stem. Fold sides in, then roll tightly from bottom to top (like a mini burrito). Repeat for all leaves.", timerSeconds: null, mistakeWarning: "Roll tightly — loose rolls fall apart during cooking. But don't roll so tight the rice can't expand.", quickHack: "If leaves tear, overlap two small pieces. Don't let perfection stop you — dolmades are rustic.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Layer dolmades seam-side down in a pot. Pour remaining lemon juice, olive oil, and enough water to just cover (about 2 cups). Place a heavy plate on top to keep them in place.", timerSeconds: null, mistakeWarning: "The plate is essential — it prevents the rolls from unraveling as the rice expands.", quickHack: null, cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 5, instruction: "Bring to a boil, then reduce to the lowest simmer. Cover and cook 45 minutes until rice is fully cooked. Remove from heat and rest 15 minutes before serving.", timerSeconds: 2700, mistakeWarning: "Don't lift the lid during cooking — the steam finishes the rice.", quickHack: "Serve at room temperature with tzatziki and extra lemon wedges. They taste better the next day.", cuisineFact: null, donenessCue: "Rice is fully cooked inside, leaves are tender and olive-colored.", imageUrl: null },
    ],
  },

  takoyaki: {
    name: "Takoyaki",
    slug: "takoyaki",
    description: "Golden ball-shaped Japanese street food filled with diced octopus, ginger, and green onion — crispy outside, custardy inside.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 20,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["savory", "umami", "crispy"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "All-purpose flour", quantity: "1 cup", isOptional: false, substitution: null },
      { id: "2", name: "Dashi stock", quantity: "2 cups", isOptional: false, substitution: "Chicken broth" },
      { id: "3", name: "Eggs", quantity: "2", isOptional: false, substitution: null },
      { id: "4", name: "Cooked octopus", quantity: "150g, diced small", isOptional: false, substitution: "Shrimp or crab" },
      { id: "5", name: "Green onions", quantity: "3, sliced thin", isOptional: false, substitution: null },
      { id: "6", name: "Pickled ginger (beni shoga)", quantity: "2 tbsp, chopped", isOptional: false, substitution: null },
      { id: "7", name: "Takoyaki sauce and Japanese mayo", quantity: "to serve", isOptional: false, substitution: "Worcestershire + mayo" },
      { id: "8", name: "Bonito flakes and nori powder", quantity: "to serve", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Whisk flour, dashi, eggs, and a pinch of salt into a smooth, thin batter. It should be more liquid than pancake batter — pourable and lump-free.", timerSeconds: null, mistakeWarning: "A thick batter makes dense balls. The batter should flow easily.", quickHack: "Stir the batter gently — overmixing makes it tough. Stop when lumps are gone.", cuisineFact: "Takoyaki was invented in 1935 in Osaka by Tomekichi Endo, who was inspired by 'radioyaki', a meat-filled pancake ball.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Heat a takoyaki pan over medium-high heat. Brush every cavity generously with neutral oil. The pan must be very hot before adding batter.", timerSeconds: 180, mistakeWarning: "Insufficiently oiled or cold cavities cause the balls to stick and break when you rotate them.", quickHack: "If you don't have a takoyaki pan, a Danish aebleskiver pan works identically.", cuisineFact: null, donenessCue: "Water droplet sizzles and evaporates instantly when flicked into the pan.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Pour batter to fill all cavities, overfilling slightly. Add octopus, green onion, and pickled ginger to each cavity.", timerSeconds: null, mistakeWarning: null, quickHack: "Overfilling is correct — the overflow gets folded in when you rotate, creating a perfect ball.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Cook 2–3 minutes until the bottom is set. Use a skewer or chopstick to rotate each ball 90°, tucking the raw batter inward. Continue rotating every 1–2 minutes to build a round ball.", timerSeconds: 300, mistakeWarning: "Rotate when the edge is just set — too early breaks the ball, too late and it won't round properly.", quickHack: "The rotation takes practice. Watch a 30-second YouTube video before your first attempt.", cuisineFact: null, donenessCue: "Evenly golden brown on all sides, the ball spins freely in its cavity.", imageUrl: null },
      { phase: "cook", stepNumber: 5, instruction: "Remove from pan. Top with takoyaki sauce, Japanese mayo, bonito flakes, and nori powder. Serve immediately — they soften quickly.", timerSeconds: null, mistakeWarning: null, quickHack: null, cuisineFact: null, donenessCue: "Golden exterior, custardy and slightly molten inside when bitten.", imageUrl: null },
    ],
  },

  congee: {
    name: "Congee",
    slug: "congee",
    description: "Silky Chinese rice porridge slow-cooked until impossibly smooth — comfort food that heals, warms, and sustains.",
    cuisineFamily: "chinese",
    prepTimeMinutes: 5,
    cookTimeMinutes: 60,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["mild", "savory", "comforting", "umami"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Jasmine rice", quantity: "¾ cup", isOptional: false, substitution: "Any white rice" },
      { id: "2", name: "Chicken or vegetable stock", quantity: "8 cups", isOptional: false, substitution: "Water (less flavorful)" },
      { id: "3", name: "Ginger", quantity: "1-inch piece, sliced", isOptional: false, substitution: null },
      { id: "4", name: "Soy sauce", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Sesame oil", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Green onions and white pepper", quantity: "to serve", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Rinse rice until water runs clear. In a large pot, combine rice, stock, and ginger. Bring to a boil over high heat, stirring to prevent sticking.", timerSeconds: null, mistakeWarning: null, quickHack: "For extra silky congee, soak the rinsed rice for 30 minutes and freeze it for 1 hour before cooking — broken starch cells dissolve faster.", cuisineFact: "Congee (jook in Cantonese, zhou in Mandarin) has been eaten in China for over 2,000 years. It appears in the Rites of Zhou (circa 300 BCE) as food for the elderly.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Once boiling, reduce heat to the lowest simmer. Cook uncovered, stirring every 10 minutes, for 45–60 minutes until rice completely breaks down and congee is thick and creamy.", timerSeconds: 3000, mistakeWarning: "Too-high heat causes sticking and scorching. Lowest possible simmer with occasional stirring.", quickHack: "Instant Pot: high pressure for 20 minutes, natural release 15 minutes. Same silky result in a third of the time.", cuisineFact: null, donenessCue: "Rice grains are completely dissolved, congee is thick enough to coat a spoon.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Remove ginger slices. Stir in soy sauce and sesame oil. Taste and adjust salt. Serve in bowls topped with sliced green onions and white pepper.", timerSeconds: null, mistakeWarning: null, quickHack: "Toppings make congee — try century egg, fried shallots, chili oil, poached chicken, or soft-boiled egg.", cuisineFact: null, donenessCue: "Congee should be thick enough to hold toppings on the surface without sinking.", imageUrl: null },
    ],
  },

  "mixed-green-salad": {
    name: "Mixed Green Salad",
    slug: "mixed-green-salad",
    description: "A simple salad elevated by proper technique — balanced dressing, well-dressed leaves, and thoughtful texture.",
    cuisineFamily: "french",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["fresh", "bright", "crisp"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Mixed salad greens", quantity: "5 oz", isOptional: false, substitution: null },
      { id: "2", name: "Shallot", quantity: "1 small, minced", isOptional: false, substitution: "Red onion" },
      { id: "3", name: "Dijon mustard", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "4", name: "Red wine vinegar", quantity: "2 tbsp", isOptional: false, substitution: "Lemon juice" },
      { id: "5", name: "Olive oil", quantity: "5 tbsp", isOptional: false, substitution: null },
      { id: "6", name: "Salt and pepper", quantity: "to taste", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Wash and dry greens thoroughly — spin in a salad spinner and pat dry. Wet greens dilute dressing and make it slide off. Place in a large bowl.", timerSeconds: null, mistakeWarning: "Wet greens are the #1 reason salads taste bland. The dressing can't stick.", quickHack: "Spin greens twice in the salad spinner, or roll them in a kitchen towel and shake gently.", cuisineFact: "The classic French vinaigrette ratio is 1 part acid to 3 parts oil. The Dijon emulsifies them into a creamy dressing without any dairy.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Whisk shallot, mustard, vinegar, salt, and pepper in a small bowl. Slowly drizzle in olive oil while whisking constantly to emulsify into a smooth, creamy dressing.", timerSeconds: null, mistakeWarning: "Adding oil too fast breaks the emulsion and you get a separated, oily dressing.", quickHack: "Make dressing in a jar — combine all ingredients, seal, and shake vigorously. Done in 10 seconds.", cuisineFact: null, donenessCue: "Dressing is opaque, slightly thick, and clings to a spoon rather than dripping off.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Drizzle dressing around the bowl (not directly on the greens). Toss with clean hands or two spoons, lifting from the bottom, until every leaf is lightly coated.", timerSeconds: null, mistakeWarning: "Over-dressing makes a heavy, wilted salad. Less is more — every leaf should glisten, not be soaked.", quickHack: "Season the salad after dressing with a pinch of flaky salt and a few grinds of pepper — the seasoning hits the top leaves first.", cuisineFact: null, donenessCue: "Every leaf lightly coated, salad lively and not wilted. Serve immediately.", imageUrl: null },
    ],
  },

  japchae: {
    name: "Japchae",
    slug: "japchae",
    description: "Korean glass noodles stir-fried with colorful vegetables and a sweet-savory soy glaze — festive, silky, and irresistible.",
    cuisineFamily: "korean",
    prepTimeMinutes: 20,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["savory", "sweet", "umami", "nutty"],
    temperature: "room temp",
    ingredients: [
      { id: "1", name: "Dangmyeon (sweet potato glass noodles)", quantity: "200g", isOptional: false, substitution: "Cellophane noodles" },
      { id: "2", name: "Spinach", quantity: "3 oz", isOptional: false, substitution: null },
      { id: "3", name: "Shiitake mushrooms", quantity: "6, sliced", isOptional: false, substitution: "Button mushrooms" },
      { id: "4", name: "Carrots", quantity: "1, julienned", isOptional: false, substitution: null },
      { id: "5", name: "Bell pepper", quantity: "1, julienned", isOptional: false, substitution: null },
      { id: "6", name: "Onion", quantity: "½, sliced thin", isOptional: false, substitution: null },
      { id: "7", name: "Soy sauce", quantity: "4 tbsp", isOptional: false, substitution: null },
      { id: "8", name: "Sugar", quantity: "2 tbsp", isOptional: false, substitution: "Honey" },
      { id: "9", name: "Sesame oil", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "10", name: "Sesame seeds", quantity: "2 tbsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Cook noodles in boiling water per package instructions (usually 6–8 min) until translucent and tender. Drain, rinse with cold water, and cut into 6-inch lengths with scissors.", timerSeconds: 420, mistakeWarning: "Undercooked noodles will be chewy and dense. They should be translucent all the way through.", quickHack: "Toss drained noodles with 1 tbsp sesame oil immediately to prevent sticking.", cuisineFact: "Japchae was created in 1608 for King Gwanghaegun's feast by minister Yi Chung. The original had no noodles — just vegetables. Glass noodles were added centuries later.", donenessCue: "Noodles are fully translucent and slippery.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Blanch spinach in boiling water 30 seconds. Drain, rinse with cold water, squeeze dry, and season with a pinch of salt and ½ tsp sesame oil.", timerSeconds: 30, mistakeWarning: null, quickHack: null, cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Mix soy sauce, sugar, and sesame oil in a bowl. Heat 1 tbsp neutral oil in a large wok or skillet over high heat. Stir-fry mushrooms 2 minutes. Add onion and carrots, stir-fry 2 minutes. Add bell pepper, cook 1 minute.", timerSeconds: 300, mistakeWarning: "Cook each vegetable separately or in stages — they have different cooking times.", quickHack: "Keep the heat high throughout — you want charred edges, not steamed vegetables.", cuisineFact: null, donenessCue: "Vegetables have some char and are tender-crisp.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Add noodles and spinach to the wok. Pour sauce over everything. Toss and stir-fry over high heat for 2–3 minutes until sauce is absorbed and noodles are glazed.", timerSeconds: 150, mistakeWarning: null, quickHack: "Use tongs — noodles tangle easily and tongs give you better control than spatulas.", cuisineFact: null, donenessCue: "Noodles are glossy and evenly coated in the sauce.", imageUrl: null },
      { phase: "cook", stepNumber: 5, instruction: "Transfer to a serving dish. Sprinkle with sesame seeds. Japchae is traditionally served at room temperature — the flavors mellow and deepen as it cools.", timerSeconds: null, mistakeWarning: null, quickHack: "Make it a day ahead and refrigerate. Bring to room temperature for 30 minutes before serving.", cuisineFact: null, donenessCue: null, imageUrl: null },
    ],
  },

  tteokbokki: {
    name: "Tteokbokki",
    slug: "tteokbokki",
    description: "Chewy Korean rice cakes in a fiery, sweet gochujang sauce — one of Korea's most beloved street foods.",
    cuisineFamily: "korean",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["spicy", "sweet", "savory", "chewy"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Garae-tteok (cylindrical rice cakes)", quantity: "400g", isOptional: false, substitution: "Sliced rice cake discs" },
      { id: "2", name: "Gochujang (Korean chili paste)", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "3", name: "Gochugaru (Korean chili flakes)", quantity: "1 tbsp", isOptional: true, substitution: null },
      { id: "4", name: "Soy sauce", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Sugar", quantity: "2 tbsp", isOptional: false, substitution: "Honey" },
      { id: "6", name: "Anchovy or vegetable stock", quantity: "2 cups", isOptional: false, substitution: "Water" },
      { id: "7", name: "Fish cakes (eomuk)", quantity: "150g, sliced", isOptional: true, substitution: null },
      { id: "8", name: "Green onions", quantity: "3, cut in 2-inch pieces", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "If rice cakes are refrigerated or frozen, soak in cold water for 15 minutes to soften. Drain and separate any that are stuck together.", timerSeconds: 900, mistakeWarning: "Cold hard rice cakes go into the sauce unevenly — some will be mushy outside, cold inside. Soak first.", quickHack: null, cuisineFact: "Tteokbokki was originally a royal court dish called gungjung tteokbokki — stir-fried in soy sauce, not gochujang. The red spicy version became popular only in the 1950s.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Combine gochujang, soy sauce, sugar, and gochugaru (if using) in a bowl. Mix well into a smooth paste.", timerSeconds: null, mistakeWarning: null, quickHack: "Taste the sauce before adding to the pan — adjust sugar for sweetness, soy for saltiness.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Pour stock into a wide pan and bring to a boil. Add sauce paste and stir to dissolve. Add rice cakes and fish cakes. Cook at a vigorous simmer, stirring frequently, for 8–10 minutes.", timerSeconds: 540, mistakeWarning: "Rice cakes stick and scorch if you don't stir every minute. Keep moving them.", quickHack: "The sauce should be thicker than it looks — it reduces and clings to the rice cakes.", cuisineFact: null, donenessCue: "Rice cakes are soft and chewy all the way through, sauce is glossy and thick.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Add green onions in the last 2 minutes. Sauce should be thick and coating every piece. Serve immediately in a bowl — tteokbokki hardens as it cools.", timerSeconds: null, mistakeWarning: "Tteokbokki is best eaten immediately. It gets increasingly chewy and eventually hard as it cools.", quickHack: "Add a splash of stock to revive leftovers and reheat on the stove.", cuisineFact: null, donenessCue: null, imageUrl: null },
    ],
  },

  satay: {
    name: "Satay",
    slug: "satay",
    description: "Skewered, marinated chicken chargrilled and served with a rich peanut sauce — Southeast Asia's perfect street food.",
    cuisineFamily: "thai",
    prepTimeMinutes: 30,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["savory", "nutty", "smoky", "slightly spicy"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Chicken thighs", quantity: "600g, cut into strips", isOptional: false, substitution: "Beef or pork" },
      { id: "2", name: "Coconut milk", quantity: "¼ cup", isOptional: false, substitution: null },
      { id: "3", name: "Turmeric", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "4", name: "Cumin and coriander", quantity: "1 tsp each", isOptional: false, substitution: null },
      { id: "5", name: "Garlic", quantity: "3 cloves, minced", isOptional: false, substitution: null },
      { id: "6", name: "Peanut butter", quantity: "½ cup", isOptional: false, substitution: null },
      { id: "7", name: "Lime juice", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "8", name: "Soy sauce and sugar", quantity: "2 tbsp each", isOptional: false, substitution: null },
      { id: "9", name: "Bamboo skewers", quantity: "20", isOptional: false, substitution: "Metal skewers" },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Soak bamboo skewers in water for 30 minutes. Mix coconut milk, turmeric, cumin, coriander, garlic, salt, and a pinch of sugar. Add chicken strips and marinate minimum 30 minutes (overnight is best).", timerSeconds: 1800, mistakeWarning: "Dry skewers burn before the chicken is done. Soak them.", quickHack: "Turmeric stains everything yellow. Use gloves and dark-colored bowls.", cuisineFact: "Satay originated in Java, Indonesia, likely influenced by Middle Eastern kebab culture brought by Arab traders. It spread throughout Southeast Asia and became iconic in Thailand, Malaysia, and Singapore.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Thread marinated chicken onto skewers lengthwise so the meat lies flat. This ensures even cooking and better char.", timerSeconds: null, mistakeWarning: null, quickHack: "Slide 2–3 thin strips per skewer and press them together for better contact with the grill.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Grill or use a grill pan over high heat. Cook skewers 3–4 minutes per side, pressing flat with a spatula, until charred in spots and cooked through.", timerSeconds: 240, mistakeWarning: "Medium heat won't give you the char that makes satay. Go high and watch it.", quickHack: "Brush with a little coconut milk halfway through cooking — it bastes and creates beautiful char.", cuisineFact: null, donenessCue: "Charred in spots, juices run clear, meat pulls away from skewer easily.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "For peanut sauce: whisk peanut butter, ¼ cup coconut milk, lime juice, soy sauce, sugar, and 1 minced garlic clove. Thin with water to a dippable consistency. Warm in a small pan.", timerSeconds: null, mistakeWarning: null, quickHack: "Add a dash of chili oil or sambal oelek to the sauce for heat.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 5, instruction: "Serve skewers immediately with peanut sauce for dipping and cucumber slices. The contrast of hot char with cool cucumber is the complete experience.", timerSeconds: null, mistakeWarning: null, quickHack: null, cuisineFact: null, donenessCue: null, imageUrl: null },
    ],
  },

  "sticky-rice": {
    name: "Sticky Rice",
    slug: "sticky-rice",
    description: "Thai glutinous rice steamed to sticky, chewy perfection — the essential side for Thai grilled dishes and mango desserts.",
    cuisineFamily: "thai",
    prepTimeMinutes: 240,
    cookTimeMinutes: 30,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["neutral", "slightly sweet", "chewy"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Thai glutinous (sticky) rice", quantity: "2 cups", isOptional: false, substitution: null },
      { id: "2", name: "Water for soaking and steaming", quantity: "as needed", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Rinse sticky rice 3–4 times until water runs mostly clear. Cover with cold water and soak at least 4 hours (overnight is best). The grains will turn from translucent to opaque white when ready.", timerSeconds: 14400, mistakeWarning: "Skipping or shortening the soak is the #1 mistake. Under-soaked grains stay hard and grainy even after steaming.", quickHack: "Soak overnight — set it up before bed and it's ready in the morning.", cuisineFact: "Sticky rice (khao niao) is the everyday staple of northern and northeastern Thailand (Isaan) and Laos. It's rolled into balls and eaten by hand, used to scoop up dishes — never with chopsticks.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Drain soaked rice. Fill a steamer pot with 2–3 inches of water and bring to a boil. Line a bamboo or metal steamer basket with cheesecloth or a clean cotton cloth. Spread rice in an even layer.", timerSeconds: null, mistakeWarning: "Rice piled too thick (over 1 inch) won't cook through evenly in the center.", quickHack: "No steamer basket? Place a metal colander over a pot of simmering water and cover with a lid or foil.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Steam over boiling water for 15 minutes. Flip the entire rice mass using the cloth. Steam another 10–15 minutes until rice is tender, glossy, and sticks together when pressed.", timerSeconds: 1800, mistakeWarning: "Lifting the lid frequently releases steam and increases cooking time — keep it covered.", quickHack: "Flip at the halfway point so both sides get direct steam contact.", cuisineFact: null, donenessCue: "Rice is tender all the way through, glossy, and holds together when pressed but pulls apart with your fingers.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Transfer to a container with a lid to keep warm. Serve in a traditional sticky rice basket if you have one, or keep covered with a damp cloth. Eat within 2 hours — it dries out.", timerSeconds: null, mistakeWarning: null, quickHack: "To reheat: sprinkle with water, wrap in a damp paper towel, and microwave 60–90 seconds.", cuisineFact: null, donenessCue: null, imageUrl: null },
    ],
  },

  larb: {
    name: "Larb",
    slug: "larb",
    description: "Laotian and northern Thai minced meat salad with toasted rice powder, fish sauce, lime, and fresh herbs — bright, complex, and deeply aromatic.",
    cuisineFamily: "thai",
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["bright", "savory", "herby", "slightly spicy"],
    temperature: "room temp",
    ingredients: [
      { id: "1", name: "Ground pork or chicken", quantity: "400g", isOptional: false, substitution: "Ground turkey or mushrooms" },
      { id: "2", name: "Raw jasmine rice", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "3", name: "Shallots", quantity: "3, thinly sliced", isOptional: false, substitution: null },
      { id: "4", name: "Fish sauce", quantity: "3 tbsp", isOptional: false, substitution: "Soy sauce" },
      { id: "5", name: "Lime juice", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "6", name: "Dried chili flakes", quantity: "1–2 tsp", isOptional: false, substitution: null },
      { id: "7", name: "Fresh mint", quantity: "½ cup", isOptional: false, substitution: null },
      { id: "8", name: "Fresh cilantro", quantity: "¼ cup", isOptional: false, substitution: null },
      { id: "9", name: "Green onions", quantity: "3, sliced", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Toast dry rice in a small dry skillet over medium heat, stirring constantly, for 4–5 minutes until golden and nutty-smelling. Let cool, then grind in a mortar or spice grinder to a coarse powder.", timerSeconds: 270, mistakeWarning: "Don't skip the toasted rice powder — it's what gives larb its signature nutty texture and roasted flavor.", quickHack: "Make extra toasted rice powder — it keeps for weeks in an airtight jar and elevates any Thai salad.", cuisineFact: "Larb is considered the national dish of Laos and is deeply embedded in Isaan culture. In rural communities, larb is served at every celebration — weddings, funerals, and festivals alike.", donenessCue: "Rice is golden, nutty-smelling, and grinds to a coarse powder.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Cook ground meat in a dry pan over medium-high heat, breaking it up, until no longer pink. Remove from heat immediately — don't overcook.", timerSeconds: 300, mistakeWarning: "Overcooked meat becomes rubbery in the salad. Cook just until the pink is gone.", quickHack: "A little liquid from the cooking pork is good — it carries flavor into the dressing.", cuisineFact: null, donenessCue: "No pink visible, meat is broken into small pieces.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "While meat is still warm, combine fish sauce, lime juice, and chili flakes in the pan. Add shallots and stir. The warmth blooms the spices and softens the shallots.", timerSeconds: null, mistakeWarning: null, quickHack: "Dress while warm — the fish sauce and lime cook slightly into the meat, deepening the flavor.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Add toasted rice powder, fresh mint, cilantro, and green onions. Toss to combine. Taste and adjust — add more lime for brightness, fish sauce for depth, chili for heat.", timerSeconds: null, mistakeWarning: null, quickHack: "Be generous with herbs — they're not garnish in larb, they're a core component.", cuisineFact: null, donenessCue: "Salad is well-seasoned, herbs are fresh and vibrant. Serve immediately or within 30 minutes.", imageUrl: null },
    ],
  },

  "bean-sprout-salad": {
    name: "Bean Sprout Salad",
    slug: "bean-sprout-salad",
    description: "Crisp Korean-style bean sprout banchan with sesame, garlic, and a touch of heat — simple, crunchy, and essential.",
    cuisineFamily: "korean",
    prepTimeMinutes: 5,
    cookTimeMinutes: 3,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["crisp", "nutty", "garlicky", "slightly spicy"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Bean sprouts (soybean)", quantity: "400g", isOptional: false, substitution: "Mung bean sprouts" },
      { id: "2", name: "Garlic", quantity: "2 cloves, minced", isOptional: false, substitution: null },
      { id: "3", name: "Sesame oil", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "4", name: "Sesame seeds", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Salt", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Gochugaru (Korean chili flakes)", quantity: "½ tsp", isOptional: true, substitution: "Pinch of cayenne" },
      { id: "7", name: "Green onions", quantity: "2, sliced", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Rinse bean sprouts in cold water. Bring a pot of salted water to a boil. Blanch sprouts for exactly 2 minutes — they should be tender but still have a crunch.", timerSeconds: 120, mistakeWarning: "Overcooking makes them limp and soggy. 2 minutes exactly — they continue cooking from residual heat.", quickHack: null, cuisineFact: "Kongnamul muchim (bean sprout banchan) is one of the most fundamental Korean side dishes. It appears at nearly every Korean meal as part of the spread of small dishes called banchan.", donenessCue: "Sprouts are tender but still have a slight snap.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Drain and immediately rinse with cold water to stop cooking. Squeeze gently to remove excess water — not too hard, just enough.", timerSeconds: null, mistakeWarning: "Waterlogged sprouts dilute the dressing. Drain well.", quickHack: null, cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Toss sprouts with garlic, sesame oil, salt, gochugaru (if using), and green onions. Mix with hands to coat evenly. Top with sesame seeds. Refrigerate 10 minutes for flavors to meld.", timerSeconds: 600, mistakeWarning: null, quickHack: "Using your hands distributes the seasoning far more evenly than tongs or spoons.", cuisineFact: null, donenessCue: "Sprouts evenly coated, glistening with sesame oil. Flavors deepen after 10 minutes in the fridge.", imageUrl: null },
    ],
  },

  "naan-bread": {
    slug: "naan-bread",
    name: "Naan Bread",
    description: "Soft, pillowy Indian flatbread with charred spots and buttery finish. Cooked in a hot skillet to mimic the tandoor oven.",
    prepTimeMinutes: 90,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    cuisineFamily: "indian",
    heroImageUrl: null,
    flavorProfile: ["savory", "buttery", "charred"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "All-purpose flour", quantity: "2½ cups plus more for dusting", isOptional: false, substitution: null },
      { id: "2", name: "Instant yeast", quantity: "1 tsp", isOptional: false, substitution: "Active dry yeast — activate in warm water first" },
      { id: "3", name: "Sugar", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "4", name: "Salt", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "5", name: "Plain yogurt", quantity: "1/3 cup", isOptional: false, substitution: "Sour cream" },
      { id: "6", name: "Warm water", quantity: "1/2 cup", isOptional: false, substitution: null },
      { id: "7", name: "Olive oil", quantity: "2 tbsp", isOptional: false, substitution: "Neutral oil" },
      { id: "8", name: "Butter, melted", quantity: "3 tbsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Combine flour, instant yeast, sugar, and salt in a large bowl and whisk together. Add yogurt, warm water, and olive oil. Mix with a spatula until a shaggy dough forms, then knead by hand for 2-3 minutes until smooth. Cover the bowl and let rise in a warm spot for 1 hour 15 minutes.", timerSeconds: 4500, mistakeWarning: "Water must be warm — not hot. Too hot kills the yeast; too cold and it won't activate. The dough won't double like bread dough — slight puffing is normal.", quickHack: "Microwave a cup of water for 2 minutes, discard water, then place your covered dough bowl inside the warm microwave to proof.", cuisineFact: "Naan is traditionally cooked in a tandoor — a cylindrical clay oven reaching 900°F. A cast iron skillet on high heat is the best home substitute.", donenessCue: "Dough is smooth and slightly tacky but not sticky. After rising, it looks puffy and feels soft when poked.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Divide dough into 6 equal balls. On a lightly floured surface, roll each ball into an oval about 1/4 inch thick and 6 inches long. Heat a cast iron or heavy skillet over high heat until very hot — a drop of water should instantly evaporate.", timerSeconds: null, mistakeWarning: "The skillet must be screaming hot. Medium heat produces pale, doughy naan instead of proper charred spots.", quickHack: null, cuisineFact: null, donenessCue: "Skillet is smoking slightly.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Place a rolled naan on the dry (no oil) skillet. Cook for 1.5 minutes — big bubbles will form on the surface. Flip and cook 45 seconds more. Remove and immediately brush generously with melted butter. Repeat with remaining dough balls.", timerSeconds: 135, mistakeWarning: "Don't press down the bubbles — they create the soft, airy texture. Don't add oil to the pan; the dry heat is essential.", quickHack: "Stir 2 minced garlic cloves into the melted butter for instant garlic naan.", cuisineFact: null, donenessCue: "Naan has golden-brown charred spots on both sides and puffed dramatically during cooking.", imageUrl: null },
    ],
  },

  "baked-potato": {
    slug: "baked-potato",
    name: "Baked Potato",
    description: "Classic baked russet potato with crispy, salted skin and a fluffy, steaming interior. The ultimate blank canvas for toppings.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 55,
    skillLevel: "beginner",
    cuisineFamily: "american",
    heroImageUrl: null,
    flavorProfile: ["savory", "earthy", "buttery"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Russet potatoes, large", quantity: "4", isOptional: false, substitution: "Yukon gold — less fluffy" },
      { id: "2", name: "Olive oil", quantity: "2 tbsp", isOptional: false, substitution: "Vegetable oil" },
      { id: "3", name: "Coarse sea salt", quantity: "1 tbsp", isOptional: false, substitution: "Kosher salt" },
      { id: "4", name: "Butter, sour cream, chives for serving", quantity: "As desired", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Preheat oven to 425°F. Scrub potatoes thoroughly under cold water and pat completely dry with a towel. Pierce each potato 8-10 times all over with a fork. Rub with olive oil and sprinkle generously with coarse salt on all sides.", timerSeconds: null, mistakeWarning: "Never skip piercing — without vents, steam builds inside and potatoes can burst. Wet potatoes steam instead of roast, giving soft, pale skin. Pat bone dry.", quickHack: "The coarse salt acts like an exfoliant on the skin, helping it crisp and creating a salty, cracker-like exterior.", cuisineFact: "Russets are the gold standard for baking — their high starch content creates that signature fluffy interior that Yukon golds can't match.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Place potatoes directly on the oven rack — not a baking sheet. Rack placement allows hot air to circulate all around. Bake at 425°F for 45-60 minutes depending on size.", timerSeconds: 2700, mistakeWarning: "A baking sheet traps moisture underneath and softens the skin. Directly on the rack is the secret to crispy exterior.", quickHack: null, cuisineFact: null, donenessCue: "A fork or skewer slides in with zero resistance. Skin is papery and crisp. Interior reads 210°F on a thermometer.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Remove from oven. Cut a deep cross in the top, then use both hands to squeeze the sides inward to burst it open. Fluff the interior with a fork. Add butter, sour cream, and chives and serve immediately.", timerSeconds: null, mistakeWarning: null, quickHack: "The squeeze-and-burst technique creates more surface area inside for butter and toppings to pool into — much better than just slicing.", cuisineFact: null, donenessCue: "Interior is white, fluffy, and pulls apart into large chunks when fluffed.", imageUrl: null },
    ],
  },

  "roasted-asparagus": {
    slug: "roasted-asparagus",
    name: "Roasted Asparagus",
    description: "Tender asparagus spears with caramelized, slightly crispy tips, roasted at high heat to concentrate flavor.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 13,
    skillLevel: "beginner",
    cuisineFamily: "mediterranean",
    heroImageUrl: null,
    flavorProfile: ["savory", "earthy", "bright"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Asparagus, medium thickness", quantity: "1 lb (1 bunch)", isOptional: false, substitution: null },
      { id: "2", name: "Olive oil", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "3", name: "Salt", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "4", name: "Black pepper", quantity: "1/4 tsp", isOptional: false, substitution: null },
      { id: "5", name: "Lemon, for finishing", quantity: "1/2", isOptional: true, substitution: null },
      { id: "6", name: "Parmesan, grated", quantity: "2 tbsp", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Preheat oven to 425°F. Rinse asparagus and snap off the woody ends — hold a spear at both ends and bend until it snaps naturally. That point is exactly where tough ends. Use your first snapped spear as a guide to cut the rest of the bunch at the same length.", timerSeconds: null, mistakeWarning: "Skipping the tough-end removal means chewy, fibrous bites. Don't skip the snap step.", quickHack: null, cuisineFact: "Asparagus has been cultivated since ancient Rome. It's one of the few vegetables that regrows from the same roots every spring (a perennial).", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Pat asparagus completely dry. Spread in a single layer on a rimmed baking sheet. Drizzle with olive oil and toss to coat every spear. Season with salt and pepper. Roast at 425°F for 10-15 minutes: thin spears 10 min, medium 12-13 min, thick 15-18 min.", timerSeconds: 720, mistakeWarning: "Overcrowding the pan causes steaming instead of roasting. Use two sheets if needed — spears must not overlap. Asparagus goes from perfect to mushy very fast; start checking early.", quickHack: null, cuisineFact: null, donenessCue: "Tips are slightly crispy and starting to brown. Spears bend slightly but hold their shape. Fork-tender when pierced.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Remove from oven. Squeeze half a lemon over the top and sprinkle with Parmesan if using. Serve immediately — asparagus softens quickly as it sits.", timerSeconds: null, mistakeWarning: null, quickHack: "Use a microplane to add lemon zest before squeezing for even more brightness without extra acidity.", cuisineFact: null, donenessCue: null, imageUrl: null },
    ],
  },

  "summer-rolls": {
    slug: "summer-rolls",
    name: "Summer Rolls",
    description: "Fresh Vietnamese rice paper rolls packed with shrimp, vermicelli, herbs, and crisp vegetables. Served with peanut-hoisin dipping sauce.",
    prepTimeMinutes: 30,
    cookTimeMinutes: 10,
    skillLevel: "intermediate",
    cuisineFamily: "vietnamese",
    heroImageUrl: null,
    flavorProfile: ["fresh", "herby", "light"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Rice paper wrappers, 22cm", quantity: "8", isOptional: false, substitution: null },
      { id: "2", name: "Cooked shrimp, halved lengthwise", quantity: "16 pieces", isOptional: false, substitution: "Tofu strips" },
      { id: "3", name: "Rice vermicelli, cooked and rinsed cold", quantity: "2 oz dry", isOptional: false, substitution: null },
      { id: "4", name: "Butter lettuce leaves", quantity: "8 small", isOptional: false, substitution: "Romaine" },
      { id: "5", name: "Cucumber, julienned", quantity: "1/2", isOptional: false, substitution: null },
      { id: "6", name: "Carrot, julienned", quantity: "1 medium", isOptional: false, substitution: null },
      { id: "7", name: "Fresh mint leaves", quantity: "1/2 cup", isOptional: false, substitution: null },
      { id: "8", name: "Fresh cilantro", quantity: "1/2 cup", isOptional: false, substitution: null },
      { id: "9", name: "Hoisin sauce", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "10", name: "Peanut butter", quantity: "1 tbsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Cook vermicelli: boil for 3-4 minutes, drain, and rinse under cold water. Prepare all fillings before starting: julienne cucumber and carrot, wash and dry herbs, halve shrimp lengthwise. Set up a full assembly station — all fillings, a wide bowl of warm water, and a clean damp cutting board.", timerSeconds: null, mistakeWarning: "Mise en place is mandatory here. Once you start rolling, you cannot stop to prep. Have everything within arm's reach before your first wrapper touches water.", quickHack: null, cuisineFact: "Goi cuon (fresh spring rolls) literally means 'salad rolls' in Vietnamese. These are the lighter counterpart to fried cha gio, and are eaten year-round in Vietnam.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Dip one rice paper wrapper in warm water for exactly 2-3 seconds — not a long soak. It will still feel stiff when you remove it. Lay it on your board. It softens while you work.", timerSeconds: null, mistakeWarning: "Over-soaking makes the wrapper gummy, sticky, and prone to tearing. Remove it while it still feels slightly firm — it will be pliable by the time you finish arranging fillings.", quickHack: "Use warm (not hot) water. Hot water makes the paper too soft too fast.", cuisineFact: null, donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "In the lower third of the wrapper, layer: a lettuce leaf, a small bundle of vermicelli, cucumber, carrot, and herbs. Fold the bottom edge up over the filling firmly. Fold in both sides. Place 2 shrimp halves cut-side down on the top third of the wrapper. Roll the bundle tightly toward the shrimp until sealed. Repeat for all rolls.", timerSeconds: null, mistakeWarning: "Rolling loosely causes rolls to fall apart when dipped. Apply steady moderate tension throughout the roll.", quickHack: "Place the shrimp pink-side down on the wrapper before rolling so their color shows through the translucent paper — purely visual but it looks professional.", cuisineFact: null, donenessCue: "Roll is compact and firm, seam sealed, shrimp visible through the wrapper.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Make dipping sauce: whisk hoisin sauce, peanut butter, and 2 tbsp warm water until smooth. Add a squeeze of lime and a pinch of garlic if desired. Serve rolls immediately or cover with a damp paper towel. Don't refrigerate — cold air toughens the wrappers.", timerSeconds: null, mistakeWarning: "Rice paper dries out within minutes. Always keep unserved rolls covered with a damp cloth.", quickHack: null, cuisineFact: null, donenessCue: null, imageUrl: null },
    ],
  },

  "creamed-spinach": {
    slug: "creamed-spinach",
    name: "Creamed Spinach",
    description: "Rich steakhouse-style creamed spinach — wilted baby spinach folded into a nutmeg-scented bechamel with Parmesan.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    cuisineFamily: "american",
    heroImageUrl: null,
    flavorProfile: ["rich", "savory", "creamy"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Baby spinach", quantity: "1 lb", isOptional: false, substitution: "Frozen spinach — thaw and squeeze very dry" },
      { id: "2", name: "Butter", quantity: "4 tbsp", isOptional: false, substitution: null },
      { id: "3", name: "Shallot or small onion, minced", quantity: "1", isOptional: false, substitution: null },
      { id: "4", name: "Garlic, minced", quantity: "3 cloves", isOptional: false, substitution: null },
      { id: "5", name: "All-purpose flour", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "6", name: "Whole milk", quantity: "1 cup", isOptional: false, substitution: "Half-and-half for richer result" },
      { id: "7", name: "Heavy cream", quantity: "1/4 cup", isOptional: false, substitution: null },
      { id: "8", name: "Nutmeg", quantity: "Pinch", isOptional: false, substitution: null },
      { id: "9", name: "Parmesan, grated", quantity: "1/4 cup", isOptional: false, substitution: "Gruyere" },
      { id: "10", name: "Salt and black pepper", quantity: "To taste", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Heat a large skillet over medium-high with 1 tbsp butter. Add all the spinach (it looks like too much — it isn't). Toss for 2-3 minutes until fully wilted. Transfer to a board, chop roughly, then squeeze out as much liquid as possible with your hands or a clean towel.", timerSeconds: 180, mistakeWarning: "Skipping the squeeze is the #1 creamed spinach mistake. Excess water makes the sauce watery and separated. Squeeze until you think you're done, then squeeze again.", quickHack: null, cuisineFact: "Steakhouse creamed spinach traces back to New York chophouses of the 1890s, where it became the classic pairing for beef — its richness contrasting the savory char of a steak.", donenessCue: "Spinach is fully wilted and bright green. When squeezed, very little liquid comes out.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "In the same pan over medium heat, melt remaining 3 tbsp butter. Add shallot and cook 2 minutes until translucent. Add garlic and cook 30 seconds. Add flour and stir constantly for 1-2 minutes until the mixture smells nutty and looks like wet sand. This is the roux.", timerSeconds: 150, mistakeWarning: "Under-cooking the roux leaves a raw flour taste in the final dish. Cook until it smells biscuity.", quickHack: null, cuisineFact: null, donenessCue: "Roux is pale golden and smells slightly toasty.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Slowly pour in milk while whisking constantly. Add cream. Continue whisking over medium heat for 2-3 minutes until the sauce thickens and coats a spoon. Season with salt, pepper, and a pinch of nutmeg. Fold in the chopped spinach and Parmesan. Cook 1-2 minutes until everything is combined and hot.", timerSeconds: 300, mistakeWarning: "Add milk gradually — dumping it all in at once creates lumps. Warm the milk first in the microwave to reduce clumping risk.", quickHack: null, cuisineFact: null, donenessCue: "Sauce is thick, creamy, and deep green. Holds its shape when scooped onto a plate.", imageUrl: null },
    ],
  },

  "dal-tadka": {
    slug: "dal-tadka",
    name: "Dal Tadka",
    description: "Creamy yellow lentils simmered with tomatoes and spices, finished with a sizzling ghee tadka of cumin, garlic, and dried chili.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    skillLevel: "intermediate",
    cuisineFamily: "indian",
    heroImageUrl: null,
    flavorProfile: ["savory", "smoky", "spiced", "earthy"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Toor dal (split pigeon peas)", quantity: "1 cup", isOptional: false, substitution: "Red lentils — cook faster, texture is softer" },
      { id: "2", name: "Water", quantity: "3 cups", isOptional: false, substitution: null },
      { id: "3", name: "Tomato, chopped", quantity: "1 large", isOptional: false, substitution: null },
      { id: "4", name: "Onion, finely chopped", quantity: "1 medium", isOptional: false, substitution: null },
      { id: "5", name: "Garlic, minced", quantity: "4 cloves", isOptional: false, substitution: null },
      { id: "6", name: "Ginger, grated", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "7", name: "Green chili, slit", quantity: "1-2", isOptional: true, substitution: null },
      { id: "8", name: "Turmeric", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "9", name: "Ghee", quantity: "3 tbsp", isOptional: false, substitution: "Neutral oil — ghee gives the authentic flavor" },
      { id: "10", name: "Cumin seeds", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "11", name: "Dried red chili", quantity: "2", isOptional: false, substitution: null },
      { id: "12", name: "Kashmiri chili powder", quantity: "1/2 tsp", isOptional: false, substitution: "Paprika for color without heat" },
      { id: "13", name: "Asafoetida (hing)", quantity: "Pinch", isOptional: true, substitution: null },
      { id: "14", name: "Salt", quantity: "To taste", isOptional: false, substitution: null },
      { id: "15", name: "Fresh cilantro, chopped", quantity: "2 tbsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Rinse dal under cold water until water runs clear — at least 3-4 rinses. Combine with 3 cups water, turmeric, and a pinch of salt in a heavy pot. Bring to a boil, skim foam, then reduce heat and simmer covered for 25-30 minutes until completely soft and beginning to break down.", timerSeconds: 1800, mistakeWarning: "Under-rinsing leaves a bitter starchy taste. Insufficient cooking produces grainy, chalky dal. It must be fully soft — press a lentil between two fingers; it should mash with no resistance.", quickHack: "Use a pressure cooker: cook on high for 4 whistles (15-20 minutes). Dramatically faster, identical result.", cuisineFact: "Dal tadka is one of India's most-eaten home dishes. 'Tadka' refers specifically to the technique of blooming spices in hot fat — it's found across South Asian cooking and releases fat-soluble flavor compounds that water-simmering cannot.", donenessCue: "Lentils are completely soft and beginning to collapse. Dal looks thick and creamy.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "In a separate pan, heat 1 tbsp ghee over medium-high. Add onion and cook 8-10 minutes until deeply golden. Add ginger, garlic, and green chili; cook 2 minutes. Add tomato and cook 5-6 minutes until tomato is completely broken down and oil separates from the mixture.", timerSeconds: 900, mistakeWarning: "Rushing the onions produces pale, raw-tasting dal. They must be properly golden, not just softened. The oil separating from the tomato is called 'bhunao' — it signals the masala is ready.", quickHack: null, cuisineFact: null, donenessCue: "Onions are deep golden brown. Tomatoes are fully dissolved. Oil is visible pooling at edges of the mixture.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Add the onion-tomato masala to the cooked dal and stir well. Add water if too thick — it should pour like heavy cream. Simmer together 5 minutes. Taste and adjust salt.", timerSeconds: 300, mistakeWarning: null, quickHack: null, cuisineFact: null, donenessCue: "Dal flows smoothly, is deeply flavored, and not starchy-tasting.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Make the tadka: heat remaining 2 tbsp ghee in a small pan over high heat until shimmering and almost smoking. Add cumin seeds — they should sizzle immediately. Add dried red chilies, a pinch of asafoetida, and kashmiri chili powder. Swirl for 10 seconds then immediately pour the entire sizzling tadka over the dal. Garnish with cilantro.", timerSeconds: 15, mistakeWarning: "Tadka must hit the dal sizzling hot — that's the whole technique. If it cools down before hitting the dal, you lose the smoky, aromatic bloom effect.", quickHack: "Do the tadka tableside over your serving bowl for maximum dramatic effect (and maximum aroma impact).", cuisineFact: null, donenessCue: "Tadka sizzles loudly when it hits the dal. The surface has a bright red-orange oil bloom from the chili and cumin.", imageUrl: null },
    ],
  },

  "spanakopita": {
    slug: "spanakopita",
    name: "Spanakopita",
    description: "Classic Greek spinach and feta pie in flaky, golden phyllo pastry. Crispy outside, savory and herby inside.",
    prepTimeMinutes: 30,
    cookTimeMinutes: 40,
    skillLevel: "intermediate",
    cuisineFamily: "greek",
    heroImageUrl: null,
    flavorProfile: ["savory", "herby", "salty", "buttery"],
    temperature: "warm",
    ingredients: [
      { id: "1", name: "Frozen phyllo dough, thawed overnight", quantity: "1 lb package", isOptional: false, substitution: null },
      { id: "2", name: "Frozen spinach, thawed", quantity: "2 lbs (or 3 lbs fresh, wilted)", isOptional: false, substitution: null },
      { id: "3", name: "Feta cheese, crumbled", quantity: "1 lb", isOptional: false, substitution: "Greek-style feta in brine — avoid pre-crumbled (too dry)" },
      { id: "4", name: "Eggs", quantity: "3 large", isOptional: false, substitution: null },
      { id: "5", name: "Onion, finely chopped", quantity: "1 large", isOptional: false, substitution: null },
      { id: "6", name: "Green onions, sliced", quantity: "4", isOptional: false, substitution: null },
      { id: "7", name: "Fresh dill, chopped", quantity: "1/4 cup", isOptional: false, substitution: "2 tbsp dried dill" },
      { id: "8", name: "Olive oil", quantity: "1/2 cup", isOptional: false, substitution: null },
      { id: "9", name: "Butter, melted", quantity: "4 tbsp", isOptional: false, substitution: null },
      { id: "10", name: "Black pepper", quantity: "1/2 tsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Squeeze all liquid from thawed spinach — this is critical. Use your hands to wring it out over a sink, handful by handful, until almost no liquid comes out. You should end up with a compact ball. Chop roughly.", timerSeconds: null, mistakeWarning: "Wet spinach = soggy pie that falls apart. This step cannot be rushed. The spinach must be as dry as possible.", quickHack: "Wrap spinach in a clean kitchen towel and twist both ends in opposite directions over the sink — the most efficient wringing method.", cuisineFact: "Spanakopita (spinach pie) is eaten across Greece as a snack, appetizer, or main. The word comes from 'spanaki' (spinach) + 'pita' (pie). Phyllo itself means 'leaf' in Greek.", donenessCue: "Spinach is dry enough that squeezing produces no more liquid.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Saute onion in 2 tbsp olive oil over medium heat for 5 minutes until soft. Let cool. In a large bowl, combine spinach, sauteed onion, green onions, crumbled feta, eggs, dill, and black pepper. Mix thoroughly.", timerSeconds: 300, mistakeWarning: "Don't add hot onion to the filling — it will partially cook the eggs and alter the texture. Let it cool to room temperature first.", quickHack: null, cuisineFact: null, donenessCue: "Filling is cohesive — eggs and feta bind the spinach into a slightly sticky mixture.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Preheat oven to 375°F. Mix remaining olive oil and melted butter together. Brush a 9x13 inch baking dish generously. Lay one phyllo sheet in the dish and brush with the oil-butter mixture. Continue layering and brushing each sheet, using about 8-10 sheets for the base.", timerSeconds: null, mistakeWarning: "Phyllo dries out within 2 minutes of being exposed to air. Keep unused sheets covered with a damp kitchen towel at all times. Work quickly.", quickHack: null, cuisineFact: null, donenessCue: "Base is a stack of phyllo sheets, each glistening with butter.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Spread the spinach filling evenly over the phyllo base. Layer another 8-10 phyllo sheets on top, brushing each with oil-butter. Score the top layers in a diagonal pattern with a sharp knife (don't cut all the way through). Bake at 375°F for 35-40 minutes.", timerSeconds: 2100, mistakeWarning: "Scoring before baking prevents the top from shattering when you cut it after baking. Don't skip this step.", quickHack: "Brush the very top layer with egg wash (1 egg + 1 tbsp water) instead of butter for an extra-golden, shiny crust.", cuisineFact: null, donenessCue: "Top is deeply golden brown and crispy. Pie pulls away from the edges of the pan. The filling is set when the pan is gently shaken.", imageUrl: null },
    ],
  },

  "raita": {
    slug: "raita",
    name: "Raita",
    description: "Cool, creamy Indian yogurt condiment with cucumber, cumin, and fresh herbs. The essential cooling side for spicy dishes.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    cuisineFamily: "indian",
    heroImageUrl: null,
    flavorProfile: ["cool", "tangy", "fresh", "herby"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Plain whole-milk yogurt", quantity: "2 cups", isOptional: false, substitution: "Greek yogurt thinned with 2 tbsp water" },
      { id: "2", name: "Cucumber, grated or finely diced", quantity: "1 medium", isOptional: false, substitution: null },
      { id: "3", name: "Cumin seeds", quantity: "1 tsp", isOptional: false, substitution: "1/2 tsp ground cumin" },
      { id: "4", name: "Fresh cilantro, chopped", quantity: "2 tbsp", isOptional: false, substitution: "Fresh mint" },
      { id: "5", name: "Fresh mint, chopped", quantity: "2 tbsp", isOptional: true, substitution: null },
      { id: "6", name: "Green chili, finely minced", quantity: "1 small", isOptional: true, substitution: null },
      { id: "7", name: "Salt", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "8", name: "Chaat masala or cumin powder for garnish", quantity: "Pinch", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Toast cumin seeds in a dry skillet over medium heat for 60-90 seconds, shaking constantly, until fragrant and a shade darker. Remove immediately and crush lightly with a mortar and pestle or the back of a spoon.", timerSeconds: 75, mistakeWarning: "Cumin burns in seconds after it starts popping. Watch it closely and remove from heat the moment you smell the toasty aroma.", quickHack: "Use pre-ground cumin if you're in a hurry, but toasted whole seeds add a notably deeper, nuttier flavor.", cuisineFact: "Raita has been served across the Indian subcontinent for centuries as a digestive aid. The yogurt provides a cool counterpoint to spiced food and helps moderate the heat of capsaicin.", donenessCue: "Seeds are fragrant and one shade darker. Not burnt.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Grate or finely dice the cucumber. If using grated cucumber, squeeze out excess moisture with your hands or a towel — wet cucumber makes the raita watery. In a bowl, whisk yogurt until smooth. Fold in cucumber, toasted cumin, cilantro, mint, and green chili. Season with salt.", timerSeconds: null, mistakeWarning: "Watery raita loses its cooling, creamy effect. Squeezing the cucumber dry keeps the consistency perfect.", quickHack: null, cuisineFact: null, donenessCue: "Raita is thick, creamy, and well-seasoned. Cucumber is evenly distributed.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Taste and adjust seasoning. Refrigerate for at least 15 minutes before serving — the flavors improve as they meld. Garnish with a pinch of chaat masala or cumin powder and a sprig of mint. Serve cold alongside biryani, curry, kebabs, or parathas.", timerSeconds: 900, mistakeWarning: null, quickHack: "Raita improves with time — make it up to a day ahead and keep refrigerated. It's actually better after a few hours.", cuisineFact: null, donenessCue: "Well-chilled, creamy, and fragrant with herbs and spice.", imageUrl: null },
    ],
  },

  "tamagoyaki": {
    slug: "tamagoyaki",
    name: "Tamagoyaki",
    description: "Japanese sweet-savory rolled omelette made from thin egg layers cooked and rolled in a rectangle pan. Soft, silky, and lightly sweet.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    skillLevel: "intermediate",
    cuisineFamily: "japanese",
    heroImageUrl: null,
    flavorProfile: ["savory", "sweet", "silky", "umami"],
    temperature: "warm",
    ingredients: [
      { id: "1", name: "Eggs", quantity: "3 large", isOptional: false, substitution: null },
      { id: "2", name: "Dashi or water", quantity: "2 tbsp", isOptional: false, substitution: "Water — dashi adds deeper umami" },
      { id: "3", name: "Soy sauce", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "4", name: "Mirin or sugar", quantity: "1 tbsp", isOptional: false, substitution: "1/2 tsp sugar" },
      { id: "5", name: "Salt", quantity: "Pinch", isOptional: false, substitution: null },
      { id: "6", name: "Neutral oil", quantity: "1-2 tsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Crack eggs into a bowl. Add dashi, soy sauce, mirin, and salt. Mix with chopsticks using a cutting motion — cut through the eggs rather than whisking in circles. This breaks the egg whites without creating foam or air bubbles, which cause holes in the omelette.", timerSeconds: null, mistakeWarning: "Over-mixing or vigorous whisking creates bubbles that turn into holes in the final omelette. Cut, don't whisk.", quickHack: null, cuisineFact: "Tamagoyaki appears in Japanese bento boxes and as sushi topping (tamago nigiri). It requires a rectangular tamagoyaki pan traditionally, but a round nonstick pan works fine.", donenessCue: "Egg mixture is uniform in color with no streaks and no foam on the surface.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Heat a nonstick or tamagoyaki pan over medium heat. Add a few drops of oil and spread with a paper towel. Test readiness by dropping in a small amount of egg — it should sizzle gently, not violently. Pour in one-third of the egg mixture, tilting to coat the pan evenly.", timerSeconds: null, mistakeWarning: "Too hot causes browned, rubbery eggs. The ideal tamagoyaki is pale golden or yellow — medium heat is essential.", quickHack: "Keep a paper towel with oil nearby to re-oil the pan between each pour.", cuisineFact: null, donenessCue: "Egg layer is set at the edges but still slightly wet in the center.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "When the egg layer is just set (still slightly wet on top), use chopsticks or a spatula to roll it from one end toward you, forming a log. Push the log to the far end of the pan. Re-oil the pan, pour in the second third of egg mixture — tilt to flow under the existing roll. When set, roll again, incorporating the first roll. Repeat with the final third.", timerSeconds: null, mistakeWarning: "Don't wait for the egg to cook all the way through before rolling — the residual heat finishes it. Fully cooked eggs won't stick to the roll and layers won't hold together.", quickHack: null, cuisineFact: null, donenessCue: "A layered rectangular roll with distinct golden-yellow layers visible when sliced.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Remove the roll and place on a bamboo sushi mat or paper towel. Shape into a neat rectangle by pressing firmly on all sides. Let rest 2-3 minutes, then slice into 6 equal pieces. Serve warm or at room temperature with a small mound of grated daikon if available.", timerSeconds: 180, mistakeWarning: null, quickHack: "No sushi mat? Roll tightly in plastic wrap and refrigerate for 10 minutes — works perfectly for shaping.", cuisineFact: null, donenessCue: "Sliced cross-section shows distinct pale yellow layers wrapped in a tight spiral.", imageUrl: null },
    ],
  },

  "mapo-tofu": {
    slug: "mapo-tofu",
    name: "Mapo Tofu",
    description: "Sichuan classic — silky soft tofu in a fiery, mouth-numbing sauce of doubanjiang, fermented black beans, and ground pork.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    cuisineFamily: "chinese",
    heroImageUrl: null,
    flavorProfile: ["spicy", "numbing", "umami", "savory"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Soft or silken tofu", quantity: "1 lb (450g)", isOptional: false, substitution: "Firm tofu — less silky, holds shape better" },
      { id: "2", name: "Ground pork", quantity: "4 oz", isOptional: false, substitution: "Ground beef or leave out for vegetarian" },
      { id: "3", name: "Doubanjiang (spicy bean paste)", quantity: "2 tbsp", isOptional: false, substitution: "Gochujang + 1 tsp soy sauce — different but workable" },
      { id: "4", name: "Fermented black beans (douchi), rinsed", quantity: "1 tbsp", isOptional: false, substitution: "Extra 1 tbsp soy sauce" },
      { id: "5", name: "Garlic, minced", quantity: "4 cloves", isOptional: false, substitution: null },
      { id: "6", name: "Ginger, minced", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "7", name: "Sichuan peppercorns", quantity: "1 tsp", isOptional: false, substitution: "Black pepper — you lose the numbing effect" },
      { id: "8", name: "Chicken or vegetable broth", quantity: "1 cup", isOptional: false, substitution: null },
      { id: "9", name: "Cornstarch", quantity: "1 tbsp mixed with 2 tbsp cold water", isOptional: false, substitution: null },
      { id: "10", name: "Neutral oil", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "11", name: "Green onions, sliced", quantity: "3", isOptional: false, substitution: null },
      { id: "12", name: "Sesame oil", quantity: "1 tsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Cut tofu into 1-inch cubes. Gently lower into a pot of salted boiling water and blanch for 2 minutes — this firms the exterior and seasons the tofu. Drain carefully and set aside. Toast Sichuan peppercorns in a dry pan 1-2 minutes until fragrant, then grind with a mortar or spice grinder.", timerSeconds: 120, mistakeWarning: "Skipping the blanch step means the tofu crumbles when you stir it into the sauce. Blanching also removes the slight raw beany taste.", quickHack: null, cuisineFact: "Mapo tofu was created in Chengdu, Sichuan in the late Qing dynasty by a woman named Chen — her pockmarked (ma) face gave the dish its name. It is one of the most famous dishes in all of Chinese cuisine.", donenessCue: "Tofu cubes hold their shape. Peppercorns are fragrant and slightly darkened.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Heat oil in a wok or heavy skillet over high heat until smoking. Add ground pork and cook, breaking it up, until browned and no longer pink, about 2-3 minutes. Push to the side. Add doubanjiang and cook it in the oil for 1-2 minutes until the oil turns deep red — this is called 'frying the bean paste.' Add garlic, ginger, and fermented black beans; stir-fry 30 seconds.", timerSeconds: 300, mistakeWarning: "Frying the doubanjiang until the oil turns red is what gives mapo tofu its characteristic color and depth. Don't skip this step or rush it.", quickHack: null, cuisineFact: null, donenessCue: "Oil is deep brick red. Mixture is fragrant and intensely savory-smelling.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Pour in broth and bring to a simmer. Gently slide in the tofu cubes. Simmer 3-4 minutes, shaking the pan occasionally instead of stirring — stirring breaks the tofu. Stir in the cornstarch slurry and cook 1 minute until the sauce thickens and coats everything. Remove from heat.", timerSeconds: 300, mistakeWarning: "Stirring with a spatula breaks silken tofu. Use a gentle shake-and-swirl motion, or a gentle folding motion with a ladle.", quickHack: null, cuisineFact: null, donenessCue: "Sauce is glossy, clinging to the tofu. It should not be watery or too thick — it flows when the pan is tilted.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Drizzle with sesame oil. Divide between bowls and garnish with green onions and the ground Sichuan peppercorn. Serve immediately over steamed rice. The dish must be eaten hot — the sauce congeals as it cools.", timerSeconds: null, mistakeWarning: null, quickHack: "Start with 1 tsp Sichuan peppercorn if you're new to it — the numbing sensation (mala) is powerful and takes getting used to.", cuisineFact: null, donenessCue: null, imageUrl: null },
    ],
  },

  "goma-ae-spinach": {
    slug: "goma-ae-spinach",
    name: "Goma-Ae Spinach",
    description: "Japanese spinach dressed in a sweet, nutty sesame sauce. A classic side dish served at room temperature as part of a Japanese meal.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    cuisineFamily: "japanese",
    heroImageUrl: null,
    flavorProfile: ["nutty", "sweet", "savory", "umami"],
    temperature: "room-temp",
    ingredients: [
      { id: "1", name: "Fresh spinach (or baby spinach)", quantity: "200g (about 7 oz)", isOptional: false, substitution: "Green beans (blanch 3-4 minutes), broccoli florets, or asparagus" },
      { id: "2", name: "White sesame seeds, toasted", quantity: "3 tbsp", isOptional: false, substitution: "Tahini — use 1.5 tbsp, skip the grinding step" },
      { id: "3", name: "Soy sauce", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "4", name: "Sugar or mirin", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Dashi or water", quantity: "1 tsp", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Toast sesame seeds in a dry pan over medium heat, shaking constantly, for 1-2 minutes until fragrant and golden. Pour into a mortar and pestle or spice grinder. Grind until they reach a texture between wet sand and paste — not completely smooth. This releases the oils and creates the creamy dressing base.", timerSeconds: 90, mistakeWarning: "Under-grinding leaves the seeds whole and crumbly. Over-grinding makes pure paste. Aim for a moist, slightly chunky texture — like rough-ground nut butter.", quickHack: "Place seeds in a ziplock bag and roll with a wine bottle for 30 seconds if you don't have a mortar.", cuisineFact: "Goma-ae (ごま和え) literally means 'mixed with sesame.' It is one of Japan's most fundamental side dish techniques, applied to spinach, green beans, broccoli, and beyond.", donenessCue: "Sesame is golden and smells deeply nutty. Ground to a coarse-paste consistency.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Bring a pot of salted water to a boil. Blanch spinach for 60-90 seconds until bright green and wilted. Drain and immediately plunge into an ice water bath to stop cooking and preserve the vivid color. Squeeze firmly to remove all excess water — the spinach should form a compact ball.", timerSeconds: 75, mistakeWarning: "Skipping the ice bath lets spinach continue cooking, turning it a dull army green. Water-logged spinach makes the dressing watery and weak. Squeeze very well.", quickHack: null, cuisineFact: null, donenessCue: "Spinach is bright vivid green. When squeezed, no more water comes out.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Mix ground sesame with soy sauce and sugar in a bowl until combined. Chop the squeezed spinach into 2-inch lengths. Add to the sesame dressing and toss to coat evenly. Taste and adjust — add more soy sauce for saltiness, more sugar for sweetness. Serve at room temperature or slightly chilled.", timerSeconds: null, mistakeWarning: null, quickHack: "Make the dressing up to 2 days ahead. Dress the spinach just before serving to keep it from becoming soggy.", cuisineFact: null, donenessCue: "Spinach is evenly coated, glistening with the sesame dressing. Each piece is coated but not dripping.", imageUrl: null },
    ],
  },

  "plain-dosa": {
    slug: "plain-dosa",
    name: "Plain Dosa",
    description: "Thin, crispy South Indian crepe made from fermented rice and lentil batter. Golden and lacy, served with sambar and chutneys.",
    prepTimeMinutes: 480,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    cuisineFamily: "indian",
    heroImageUrl: null,
    flavorProfile: ["tangy", "crispy", "savory", "light"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Idli rice or parboiled rice", quantity: "2 cups", isOptional: false, substitution: "Regular long-grain rice — texture will differ slightly" },
      { id: "2", name: "Urad dal (split black lentils)", quantity: "1/2 cup", isOptional: false, substitution: null },
      { id: "3", name: "Fenugreek seeds (methi)", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "4", name: "Poha (flattened rice), optional", quantity: "2 tbsp", isOptional: true, substitution: null },
      { id: "5", name: "Salt", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Oil or ghee for cooking", quantity: "As needed", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Soak rice and poha together in plenty of cold water for 4-6 hours. Soak urad dal and fenugreek seeds together in a separate bowl for 4-6 hours. These must be soaked separately — they grind at different times and to different textures.", timerSeconds: null, mistakeWarning: "Soaking time is non-negotiable. Insufficiently soaked grains won't grind smooth and produce a thick, heavy batter that won't spread into thin crispy dosas.", quickHack: null, cuisineFact: "Dosa has been eaten in South India for over 2,000 years. The fermentation produces lactic acid that gives dosa its characteristic slight tang and also makes it easier to digest. It is one of the world's most nutritious fermented foods.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Drain urad dal and grind with 1/2 cup cold water until very smooth and fluffy — it should increase in volume as it aerates. Drain rice and grind to a slightly coarse batter (not completely smooth — a little grit is correct). Combine both batters in a large bowl, mix by hand for 1-2 minutes, add salt, and cover loosely. Ferment at room temperature for 8-12 hours until the batter rises and looks bubbly.", timerSeconds: null, mistakeWarning: "In cold weather the batter may need 14-18 hours to ferment. Don't skip fermentation — it is what creates the flavor, crispiness, and digestibility of authentic dosa.", quickHack: "In winter, place the batter in a slightly warm oven (just the oven light on) or next to a running appliance to keep it warm enough to ferment.", cuisineFact: null, donenessCue: "Batter has risen noticeably, looks airy and slightly bubbly, smells pleasantly tangy.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Heat a cast iron or heavy nonstick pan over medium-high heat. When very hot, wipe with a cloth dipped in a little oil. Pour a ladle of batter at the center and immediately spread outward in circular sweeping motions with the bottom of the ladle, making a thin crepe 8-10 inches wide. Drizzle a few drops of oil or ghee around the edges.", timerSeconds: null, mistakeWarning: "The pan must be very hot before the first dosa — test by sprinkling a drop of water; it should bounce and evaporate. A lukewarm pan produces thick, doughy dosas that stick.", quickHack: "Rub the pan with half a cut onion between dosas — it cleans the surface and prevents sticking without adding oil.", cuisineFact: null, donenessCue: "Batter spreads easily and sets quickly with a slight sizzle.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Cook until the edges start to lift and curl and the bottom is deep golden and crispy, about 2-3 minutes. The surface should appear dry and lacy. For extra crispiness, press gently with a spatula. Fold in half or roll and serve immediately with sambar and coconut chutney.", timerSeconds: 150, mistakeWarning: "Don't flip a plain dosa — it cooks from one side only. Flipping makes it soft. The surface should look dry and set before you remove it.", quickHack: null, cuisineFact: null, donenessCue: "Edges are golden and curling away from the pan. Bottom is deep golden-brown and crispy. Surface looks dry and lacy.", imageUrl: null },
    ],
  },

  "mango-chutney": {
    slug: "mango-chutney",
    name: "Mango Chutney",
    description: "Sweet-tangy Indian condiment of simmered mango with ginger, garlic, and warm spices. Essential with samosas, curries, and cheese boards.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    skillLevel: "beginner",
    cuisineFamily: "indian",
    heroImageUrl: null,
    flavorProfile: ["sweet", "tangy", "spiced", "fruity"],
    temperature: "room-temp",
    ingredients: [
      { id: "1", name: "Ripe mangoes, peeled and diced", quantity: "2 large (about 3 cups)", isOptional: false, substitution: "Frozen mango chunks — thaw and dice" },
      { id: "2", name: "White sugar", quantity: "1/2 cup", isOptional: false, substitution: "Brown sugar for deeper flavor" },
      { id: "3", name: "Apple cider vinegar", quantity: "1/4 cup", isOptional: false, substitution: "White wine vinegar" },
      { id: "4", name: "Ginger, minced", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Garlic, minced", quantity: "2 cloves", isOptional: false, substitution: null },
      { id: "6", name: "Red chili flakes", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "7", name: "Mustard seeds", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "8", name: "Onion, finely diced", quantity: "1 small", isOptional: false, substitution: null },
      { id: "9", name: "Salt", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "10", name: "Neutral oil", quantity: "1 tbsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Heat oil in a medium saucepan over medium heat. Add mustard seeds and wait for them to pop (about 30 seconds). Add onion and cook 3-4 minutes until softened. Add garlic and ginger; cook 1 minute until fragrant.", timerSeconds: 90, mistakeWarning: "Don't add mustard seeds to cold oil — they need hot oil to bloom. If they don't pop within 45 seconds, increase heat slightly.", quickHack: null, cuisineFact: "Chutney has been a staple of Indian cuisine for thousands of years. The word comes from the Sanskrit 'catni.' British colonists brought it back to England in the 18th century, where it became a pantry staple — the origin of Worcestershire sauce and HP sauce.", donenessCue: "Mustard seeds have popped. Onion is translucent and soft.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Add diced mango, sugar, vinegar, chili flakes, and salt. Stir to combine. Bring to a boil, then reduce to a steady simmer over medium heat. Cook for 20-25 minutes, stirring occasionally, until the mango breaks down and the mixture thickens to a jam-like consistency.", timerSeconds: 1500, mistakeWarning: "Don't leave it unattended in the last 5 minutes — the sugar can scorch quickly once the water content reduces. Keep stirring.", quickHack: "Mash some of the mango chunks with a spoon at the halfway point for a smoother texture while keeping some chunks intact.", cuisineFact: null, donenessCue: "Chutney has thickened to a spreadable jam consistency. It should hold its shape briefly on a cold spoon before spreading. Color is deep golden-amber.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Remove from heat and let cool. The chutney will thicken further as it cools. Taste and adjust — more sugar for sweetness, more vinegar for tang, more chili for heat. Store in a sterilized jar in the refrigerator for up to 2 weeks, or process in a water bath for long-term canning.", timerSeconds: null, mistakeWarning: null, quickHack: "Make a double batch — it improves with age and keeps for weeks. Great with cheese boards, samosas, grilled chicken, or as a sandwich spread.", cuisineFact: null, donenessCue: "Thick, glossy, deeply colored chutney with a balance of sweet, tangy, and heat.", imageUrl: null },
    ],
  },

  "agedashi-tofu": {
    slug: "agedashi-tofu",
    name: "Agedashi Tofu",
    description: "Japanese fried tofu with a shatteringly crisp potato starch crust, served in a delicate dashi-soy tsuyu broth with grated daikon.",
    prepTimeMinutes: 30,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    cuisineFamily: "japanese",
    heroImageUrl: null,
    flavorProfile: ["umami", "savory", "crispy", "delicate"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Firm silken tofu or medium-firm tofu", quantity: "14 oz (1 block)", isOptional: false, substitution: null },
      { id: "2", name: "Potato starch or cornstarch", quantity: "1/4 cup", isOptional: false, substitution: "Cornstarch — potato starch is crispier and more authentic" },
      { id: "3", name: "Neutral oil for frying", quantity: "2 cups (or deep enough for 1 inch)", isOptional: false, substitution: null },
      { id: "4", name: "Dashi stock", quantity: "3/4 cup", isOptional: false, substitution: "1/2 tsp dashi powder dissolved in 3/4 cup hot water" },
      { id: "5", name: "Soy sauce", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "6", name: "Mirin", quantity: "2 tbsp", isOptional: false, substitution: "1 tbsp sake + 1 tsp sugar" },
      { id: "7", name: "Daikon radish, grated", quantity: "1/4 cup", isOptional: false, substitution: null },
      { id: "8", name: "Green onions, thinly sliced", quantity: "2", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Wrap tofu in 3 layers of paper towels. Place on a plate with another plate on top as a weight. Press for 20-30 minutes to drain excess moisture. This step is critical for a crispy crust.", timerSeconds: 1800, mistakeWarning: "Wet tofu splatters violently in hot oil and produces a soggy crust instead of a crispy one. 20 minutes of pressing is the minimum — 30 is better.", quickHack: "Cut tofu into pieces before pressing to drain faster — more surface area means faster moisture removal.", cuisineFact: "Agedashi tofu (揚げ出し) appears on every izakaya menu in Japan. The name means 'fried and put out (in broth).' The genius of the dish is that the broth slowly seeps into the crispy crust as you eat, creating multiple textures in one bite.", donenessCue: "Paper towels are saturated. Tofu feels firmer and less waterlogged when pressed.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Make the tsuyu: combine dashi, soy sauce, and mirin in a small saucepan. Bring to a boil, simmer 1 minute. Keep warm on very low heat. Cut pressed tofu into 6 rectangular pieces. Gently coat each piece in potato starch, shaking off excess.", timerSeconds: 60, mistakeWarning: "Too much starch creates a thick, bready coating. Dust lightly — just a thin, even veil of starch.", quickHack: null, cuisineFact: null, donenessCue: "Tofu pieces are lightly and evenly dusted — you can still see the white tofu through the coating.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Heat oil to 340-350°F in a deep pan. Add tofu pieces one by one (don't crowd). Fry for 3-4 minutes, turning once, until the exterior is golden and set — not deeply brown. Drain on a wire rack for 1 minute.", timerSeconds: 240, mistakeWarning: "At 340°F the tofu crisps gently without going dark. Too hot burns the delicate crust before the center warms. Test oil with a drop of batter — it should bubble actively but not violently.", quickHack: null, cuisineFact: null, donenessCue: "Crust is pale golden and just set — slightly translucent at edges. It will crisp further as it rests.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Divide tofu between bowls. Pour the warm tsuyu broth around (not over) the tofu — pouring on top soaks the crust immediately. Top with a mound of grated daikon and sliced green onions. Serve immediately.", timerSeconds: null, mistakeWarning: "Serving in the broth (not with) is the key — the crust stays crispy for longer and softens gradually as you eat, creating layers of texture.", quickHack: null, cuisineFact: null, donenessCue: "Tofu has a crispy outer shell and soft, silky interior. Broth is clear, aromatic, and savory.", imageUrl: null },
    ],
  },

  "smashed-cucumber-salad": {
    slug: "smashed-cucumber-salad",
    name: "Smashed Cucumber Salad",
    description: "Chinese pai huang gua — cucumbers smashed to create ragged edges that grip the garlicky, tangy, chili-sesame dressing.",
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    cuisineFamily: "chinese",
    heroImageUrl: null,
    flavorProfile: ["garlicky", "tangy", "spicy", "refreshing"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Persian or English cucumbers", quantity: "2 large (about 1 lb)", isOptional: false, substitution: null },
      { id: "2", name: "Salt", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "3", name: "Garlic, minced", quantity: "3 cloves", isOptional: false, substitution: null },
      { id: "4", name: "Rice vinegar", quantity: "2 tbsp", isOptional: false, substitution: "Black vinegar for a more authentic, complex flavor" },
      { id: "5", name: "Soy sauce", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "6", name: "Sesame oil", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "7", name: "Sugar", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "8", name: "Chili oil or chili garlic sauce", quantity: "1-2 tbsp", isOptional: false, substitution: "Red pepper flakes in oil" },
      { id: "9", name: "Sesame seeds, toasted", quantity: "1 tsp", isOptional: true, substitution: null },
      { id: "10", name: "Fresh cilantro", quantity: "2 tbsp", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Lay a cucumber on a cutting board. Place the flat side of a large knife on top and press down firmly with your other hand to smash it — it will crack and split. Repeat down the length. Slice the smashed cucumber at a 45-degree angle into irregular bite-sized pieces. Smashing creates jagged edges that grab the dressing far better than slicing.", timerSeconds: null, mistakeWarning: "Cutting instead of smashing produces smooth surfaces that repel dressing. The rough, uneven texture from smashing is the whole technique.", quickHack: null, cuisineFact: "Pai huang gua (拍黄瓜) — 'smashed cucumber' — is one of the most ordered appetizers at Chinese restaurants. The smashing technique has been used in Chinese cooking for centuries and appears in Song dynasty cooking texts.", donenessCue: "Cucumber is cracked and split with jagged, irregular edges.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Place cucumber pieces in a colander. Sprinkle with 1 tsp salt and toss. Let sit for 15 minutes — the salt draws out excess water, preventing a diluted dressing. Pat dry with paper towels.", timerSeconds: 900, mistakeWarning: "Skipping the salt-draw step makes a watery salad. The liquid the cucumber releases would dilute all the dressing flavors.", quickHack: "In a hurry? Skip to 10 minutes and blot aggressively with paper towels.", cuisineFact: null, donenessCue: "Cucumber has released visible liquid. Pat surfaces are drier and slightly denser.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Whisk together garlic, rice vinegar, soy sauce, sesame oil, sugar, and chili oil in a bowl until sugar dissolves. Taste — it should be a bold balance of sour, savory, and spicy. Toss cucumber in the dressing. Garnish with sesame seeds and cilantro. Serve immediately or refrigerate 10-15 minutes for deeper flavor.", timerSeconds: null, mistakeWarning: null, quickHack: "Toasted garlic in sesame oil instead of raw garlic mellows the sharpness — heat garlic in sesame oil for 30 seconds, then cool before mixing.", cuisineFact: null, donenessCue: "Cucumbers are well coated in the dressing, glistening, with a balanced sour-savory-spicy flavor.", imageUrl: null },
    ],
  },

  "bok-choy-garlic": {
    slug: "bok-choy-garlic",
    name: "Garlic Bok Choy",
    description: "Restaurant-style stir-fried baby bok choy with fragrant garlic and oyster sauce — bright, glossy, and done in under 10 minutes.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    skillLevel: "beginner",
    cuisineFamily: "chinese",
    heroImageUrl: null,
    flavorProfile: ["garlicky", "savory", "fresh", "umami"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Baby bok choy", quantity: "1 lb (about 6-8 small)", isOptional: false, substitution: "Regular bok choy cut into quarters" },
      { id: "2", name: "Garlic, coarsely chopped", quantity: "4-5 cloves", isOptional: false, substitution: null },
      { id: "3", name: "Neutral oil (vegetable or avocado)", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "4", name: "Oyster sauce", quantity: "2 tbsp", isOptional: false, substitution: "Soy sauce + 1 tsp sugar for vegetarian" },
      { id: "5", name: "Soy sauce", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Sesame oil", quantity: "1 tsp", isOptional: true, substitution: null },
      { id: "7", name: "Water or broth", quantity: "2 tbsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Trim the very base of each baby bok choy and halve lengthwise. Rinse thoroughly between the leaves where dirt hides. Pat dry with paper towels. Coarsely chop the garlic — do not mince. Large pieces handle high heat better without burning.", timerSeconds: null, mistakeWarning: "Minced garlic burns in 8-10 seconds in a smoking hot wok — the second the bok choy hits the pan, the temperature drops and the garlic keeps cooking. Coarse chops give you more control.", quickHack: null, cuisineFact: "Stir-frying (chao) is one of China's most important cooking techniques, developed to use minimal oil over intensely high heat. It originated in the Han dynasty and spread globally as Chinese cooking did.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Heat a wok or large skillet over the highest heat your stove allows. Add oil and swirl to coat. When the oil just begins to smoke, add garlic and stir-fry for 8-10 seconds only — not a second longer. Immediately add the bok choy and toss constantly.", timerSeconds: 10, mistakeWarning: "The entire success of this dish hinges on high heat and speed. A moderate heat produces limp, waterlogged bok choy that steams in its own liquid instead of searing. The wok must be smoking before the garlic goes in.", quickHack: "Place the bok choy next to the wok before you start — once the garlic goes in, you have 8 seconds before you need to add it.", cuisineFact: null, donenessCue: "Wok is smoking. Garlic is sizzling and fragrant — not brown.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "After 1 minute of tossing, add oyster sauce, soy sauce, and 2 tbsp water. Toss vigorously for another 1-2 minutes until bok choy is bright green and tender-crisp. The stems should yield slightly to pressure but still have a snap. Remove from heat and drizzle with sesame oil. Serve immediately.", timerSeconds: 120, mistakeWarning: "Bok choy goes from perfect to overcooked in under a minute. It should be vivid green with a slight crunch in the stems — never olive-colored or limp.", quickHack: null, cuisineFact: null, donenessCue: "Leaves are bright vivid green and wilted. Stems are glossy with sauce and tender-crisp when bitten.", imageUrl: null },
    ],
  },

  "sigeumchi-namul": {
    slug: "sigeumchi-namul",
    name: "Sigeumchi Namul",
    description: "Korean blanched spinach banchan dressed with garlic, sesame oil, and soy sauce. One of the most essential Korean side dishes.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    cuisineFamily: "korean",
    heroImageUrl: null,
    flavorProfile: ["savory", "garlicky", "nutty", "umami"],
    temperature: "room-temp",
    ingredients: [
      { id: "1", name: "Fresh spinach", quantity: "8 oz (225g)", isOptional: false, substitution: null },
      { id: "2", name: "Garlic, minced", quantity: "2 cloves", isOptional: false, substitution: null },
      { id: "3", name: "Soy sauce", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "4", name: "Toasted sesame oil", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "5", name: "Toasted sesame seeds", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Green onions, thinly sliced", quantity: "2", isOptional: false, substitution: null },
      { id: "7", name: "Salt", quantity: "1/2 tsp for blanching", isOptional: false, substitution: null },
      { id: "8", name: "Sugar", quantity: "Pinch (optional)", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Trim any thick stems from the spinach. Bring a pot of salted water to a rolling boil. Plunge all the spinach in at once and blanch for exactly 30 seconds. Drain immediately and rinse under cold running water for 1 minute to stop cooking and preserve the bright green color.", timerSeconds: 30, mistakeWarning: "30 seconds is correct — not 2 or 3 minutes. Spinach overcooks rapidly. Any longer and it becomes dark, mushy, and loses its fresh flavor.", quickHack: null, cuisineFact: "Sigeumchi namul (시금치나물) is among the most widely eaten banchan in Korea. 'Namul' refers to the entire category of Korean seasoned vegetable side dishes — there are hundreds, one for almost every vegetable.", donenessCue: "Spinach is bright vivid green, wilted but still holding structure.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Squeeze the rinsed spinach firmly between your hands to remove as much water as possible — it should form a tight ball about the size of your fist. Cut the ball a few times with a knife into 2-3 inch lengths.", timerSeconds: null, mistakeWarning: "Waterlogged spinach dilutes the seasoning and creates a wet, unappetizing dish. Squeeze firmly — the drier the better.", quickHack: "Use a clean kitchen towel to wring out even more moisture if squeezing by hand isn't sufficient.", cuisineFact: null, donenessCue: "Spinach is compact and yields little to no water when squeezed.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "In a bowl, combine spinach with minced garlic, soy sauce, sesame oil, sesame seeds, and green onions. Mix thoroughly with clean hands — hand mixing distributes the seasoning far more evenly than tongs. Taste and adjust salt. Serve at room temperature as a banchan alongside rice and other dishes.", timerSeconds: null, mistakeWarning: null, quickHack: "Make this up to 2 days ahead and keep refrigerated. The flavor actually improves overnight as the garlic mellows and the sesame oil deepens.", cuisineFact: null, donenessCue: "Spinach is evenly coated and glistening. Flavor is savory, garlicky, and nutty.", imageUrl: null },
    ],
  },

  "soba-noodles": {
    slug: "soba-noodles",
    name: "Cold Soba Noodles",
    description: "Japanese buckwheat noodles served chilled with a sesame-ginger dressing, crunchy vegetables, and toasted sesame seeds.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    cuisineFamily: "japanese",
    heroImageUrl: null,
    flavorProfile: ["nutty", "tangy", "savory", "fresh"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Dried soba noodles", quantity: "8 oz", isOptional: false, substitution: "Udon or rice noodles — texture differs" },
      { id: "2", name: "Soy sauce", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "3", name: "Sesame oil", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "4", name: "Rice vinegar", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Honey or sugar", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "6", name: "Fresh ginger, grated", quantity: "1 tsp", isOptional: false, substitution: "1/4 tsp ground ginger" },
      { id: "7", name: "Garlic, minced", quantity: "1 clove", isOptional: false, substitution: null },
      { id: "8", name: "Cucumber, julienned", quantity: "1/2", isOptional: false, substitution: null },
      { id: "9", name: "Carrot, julienned or grated", quantity: "1 medium", isOptional: false, substitution: null },
      { id: "10", name: "Green onions, thinly sliced", quantity: "3", isOptional: false, substitution: null },
      { id: "11", name: "Toasted sesame seeds", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "12", name: "Fresh cilantro", quantity: "1/4 cup", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Bring a large pot of unsalted water to a boil. Cook soba noodles according to package directions — typically 4-5 minutes, until just al dente. Do not overcook — soba goes mushy fast.", timerSeconds: 270, mistakeWarning: "Soba overcooked by even 1 minute becomes paste-like and clumps. Start tasting at 3 minutes. It should be slightly chewy but not hard at the center.", quickHack: null, cuisineFact: "Soba (buckwheat) noodles have been eaten in Japan since the Edo period (1600s). Buckwheat is not a grain but a fruit seed related to rhubarb. Soba has more protein and fewer carbs than wheat noodles.", donenessCue: "Noodle bends without snapping, slightly chewy, no white center when bitten.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Drain and immediately rinse under very cold running water for 1-2 minutes, tossing continuously. This serves three purposes: stops cooking, removes surface starch that causes clumping, and chills the noodles. Drain thoroughly.", timerSeconds: 90, mistakeWarning: "Rinsing is non-negotiable for cold soba — skipping it produces starchy, clumped noodles that repel the dressing.", quickHack: "Prepare a bowl of ice water and dunk the noodles directly for instant chilling and a firmer, springier texture.", cuisineFact: null, donenessCue: "Noodles are cold to the touch, separate easily, and have a pleasant springy texture.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Whisk together soy sauce, sesame oil, rice vinegar, honey, ginger, and garlic until combined. Taste — it should be bright, savory, and slightly sweet. Toss noodles with dressing. Add cucumber, carrot, green onions, and cilantro. Top with sesame seeds. Serve immediately or refrigerate up to 1 hour (add more dressing if serving later, as noodles absorb it).", timerSeconds: null, mistakeWarning: "Dress the salad just before serving for the freshest texture. Soba absorbs the dressing quickly; a salad made hours ahead needs a dressing refresh.", quickHack: null, cuisineFact: null, donenessCue: "Noodles are evenly coated, glistening, with a balance of nutty, tangy, and savory. Vegetables are crisp.", imageUrl: null },
    ],
  },

  "tortilla-chips": {
    slug: "tortilla-chips",
    name: "Tortilla Chips",
    description: "Homemade baked corn tortilla chips — crispy, lightly salted, and far better than anything from a bag. Ready in 15 minutes.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 12,
    skillLevel: "beginner",
    cuisineFamily: "mexican",
    heroImageUrl: null,
    flavorProfile: ["savory", "salty", "crispy", "corny"],
    temperature: "warm",
    ingredients: [
      { id: "1", name: "Corn tortillas (6-inch)", quantity: "12", isOptional: false, substitution: "Flour tortillas — crispier but less corn flavor" },
      { id: "2", name: "Neutral oil or olive oil", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "3", name: "Flaky sea salt", quantity: "1/2 tsp", isOptional: false, substitution: "Kosher salt" },
      { id: "4", name: "Lime juice", quantity: "1 tbsp (optional)", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Preheat oven to 375°F. Stack 4 tortillas and cut the stack into 6 equal wedges like a pizza — you'll have 72 chips total from 12 tortillas. Brush a large baking sheet with oil, or line with parchment.", timerSeconds: null, mistakeWarning: null, quickHack: "Stack all 12 tortillas and cut in one go with a heavy knife or pizza wheel to save time.", cuisineFact: "Tortilla chips were popularized in Los Angeles in the 1940s by Rebecca Webb Carranza, who used excess misshapen tortillas from her family's factory to make fried chips. They became a regional sensation.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Brush each tortilla wedge lightly with oil on both sides (or toss in a bowl with oil to coat). Arrange in a single layer on baking sheets — do not overlap. Sprinkle with flaky salt and lime juice if using.", timerSeconds: null, mistakeWarning: "Too much oil makes chips greasy instead of crispy. A light brushing is all they need — they shouldn't look wet.", quickHack: null, cuisineFact: null, donenessCue: "Chips are lightly coated and glossy but not dripping.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Bake at 375°F for 10-14 minutes, rotating the pan halfway through. Check at 8 minutes — edges will crisp first. Remove when chips are light golden and the edges are slightly darker. They will still feel slightly flexible when hot.", timerSeconds: 660, mistakeWarning: "Don't wait for them to look fully crispy in the oven — they continue to crisp as they cool. Pull them when light golden or they will over-brown.", quickHack: null, cuisineFact: null, donenessCue: "Light golden brown at edges. Slightly flexible when hot — they will crisp fully within 2 minutes of cooling.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Let cool completely on the pan — 3-5 minutes. They will harden into perfectly crispy chips as they cool. Serve with salsa, guacamole, or hummus. Store in an airtight bag at room temperature for up to 3 days.", timerSeconds: 300, mistakeWarning: "Eating chips before they fully cool means eating them at their worst — partially crispy. Patience for 5 minutes is the difference.", quickHack: "Season with chili powder, cumin, or garlic salt before baking for flavored chips.", cuisineFact: null, donenessCue: "Chips are firm and crispy with a satisfying snap.", imageUrl: null },
    ],
  },

  "samosa": {
    slug: "samosa",
    name: "Samosa",
    description: "Crispy fried pastry filled with spiced potatoes and peas. One of India's most beloved street foods — golden, crunchy, and packed with flavor.",
    prepTimeMinutes: 30,
    cookTimeMinutes: 30,
    skillLevel: "intermediate",
    cuisineFamily: "indian",
    heroImageUrl: null,
    flavorProfile: ["savory", "spiced", "crispy", "earthy"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "All-purpose flour", quantity: "2 cups", isOptional: false, substitution: null },
      { id: "2", name: "Salt", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "3", name: "Ajwain (carom seeds)", quantity: "1/2 tsp", isOptional: true, substitution: null },
      { id: "4", name: "Oil or ghee for dough", quantity: "4 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Cold water", quantity: "4-5 tbsp", isOptional: false, substitution: null },
      { id: "6", name: "Potatoes, boiled and roughly mashed", quantity: "3 medium", isOptional: false, substitution: null },
      { id: "7", name: "Frozen peas", quantity: "1/2 cup", isOptional: false, substitution: null },
      { id: "8", name: "Cumin seeds", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "9", name: "Ginger, minced", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "10", name: "Green chili, minced", quantity: "1-2", isOptional: false, substitution: "Pinch of cayenne" },
      { id: "11", name: "Garam masala", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "12", name: "Cumin powder", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "13", name: "Coriander powder", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "14", name: "Amchur (dry mango powder)", quantity: "1/2 tsp", isOptional: false, substitution: "Squeeze of lemon juice" },
      { id: "15", name: "Oil for frying", quantity: "4 cups", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Make the dough: combine flour, salt, and ajwain. Rub in 4 tbsp oil with your fingers until the mixture resembles breadcrumbs — every grain of flour should be coated in fat (this is the 'moeen' and creates the flaky texture). Add cold water one tablespoon at a time, mixing until a stiff dough forms. Knead 2-3 minutes. Cover and rest 20 minutes.", timerSeconds: 1200, mistakeWarning: "A soft dough creates soft, oily samosas. The dough must be stiff and slightly tough — stiffer than bread dough, slightly stiffer than pasta dough. Add water sparingly.", quickHack: null, cuisineFact: "Samosas have been eaten across South and Central Asia for over 1,000 years, first documented in 10th century Persian texts as 'sanbosag.' They arrived in India via the spice trade and became one of the world's most popular street foods.", donenessCue: "Dough is firm, smooth, and not sticky. It holds its shape without cracking.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Make the filling: heat 1 tbsp oil in a pan. Add cumin seeds; they should splutter immediately. Add ginger and green chili; cook 30 seconds. Add thawed peas and cook 1 minute. Add mashed potato and all spices — garam masala, cumin, coriander, amchur. Mix well and cook 2 minutes. Taste and adjust salt. Cool completely before filling.", timerSeconds: 300, mistakeWarning: "Hot filling rips the pastry during assembly. The filling must be completely cool to room temperature before you begin shaping.", quickHack: null, cuisineFact: null, donenessCue: "Filling is well-seasoned — bold and tangy from the amchur, fragrant with spices. Not wet or pasty.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Divide dough into 8 balls. Roll each into an oval about 7 inches long. Cut in half to get two semicircles. Form a cone by folding one semicircle, overlapping the straight edges, and sealing with a little water. Fill the cone with 2-3 tbsp of filling, pinch the top edge firmly to seal. Repeat. Keep finished samosas covered with a damp cloth.", timerSeconds: null, mistakeWarning: "A poorly sealed edge will burst open in the oil. Press the edges firmly and crimp with fingertips. Test one by gently squeezing — it shouldn't open.", quickHack: "Use a fork to press and crimp the sealed edges for a decorative finish and extra security.", cuisineFact: null, donenessCue: "Samosas are uniform cones, tightly sealed with no cracks or gaps.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Heat oil to 325-340°F in a deep pan. Fry samosas in batches (don't crowd) for 10-12 minutes, turning regularly, until deep golden brown all over. The lower temperature and longer fry time is essential — it cooks the pastry all the way through for a crispy (not bready) result.", timerSeconds: 660, mistakeWarning: "Frying at high heat (375°F+) browns the outside before the pastry cooks through, leaving a raw, doughy interior. Low and slow is the technique for samosas.", quickHack: null, cuisineFact: null, donenessCue: "Samosas are deep golden brown, very crispy, and sound hollow when tapped. Interior is hot all the way through.", imageUrl: null },
    ],
  },

  pickles: {
    slug: "pickles",
    name: "Quick Refrigerator Pickles",
    description: "Crisp, tangy cucumber pickles made with a simple vinegar brine. Ready in 1 hour, no canning required.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    cuisineFamily: "american",
    heroImageUrl: null,
    flavorProfile: ["tangy", "briny", "fresh", "garlicky"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Persian or Kirby cucumbers", quantity: "4 (about 1 lb)", isOptional: false, substitution: "English cucumber sliced into rounds" },
      { id: "2", name: "White wine vinegar or apple cider vinegar", quantity: "1 cup", isOptional: false, substitution: "Distilled white vinegar" },
      { id: "3", name: "Water", quantity: "1 cup", isOptional: false, substitution: null },
      { id: "4", name: "Kosher salt", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Sugar", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Garlic cloves, smashed", quantity: "3", isOptional: false, substitution: null },
      { id: "7", name: "Fresh dill", quantity: "4 sprigs", isOptional: false, substitution: "1 tsp dried dill" },
      { id: "8", name: "Black peppercorns", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "9", name: "Red pepper flakes", quantity: "1/4 tsp", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Slice cucumbers into 1/4-inch rounds or spears. Pack tightly into a clean 1-quart jar along with garlic, dill sprigs, peppercorns, and red pepper flakes.", timerSeconds: null, mistakeWarning: null, quickHack: "For extra crunch, slice off the blossom end (the end opposite the stem) of each cucumber — it contains an enzyme that softens pickles.", cuisineFact: "Pickling is one of the world's oldest food preservation methods, dating back over 4,000 years to ancient Mesopotamia. Cucumbers were first pickled in the Tigris Valley around 2400 BCE.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Combine vinegar, water, salt, and sugar in a small saucepan. Heat over medium, stirring until salt and sugar dissolve — about 2 minutes. You do not need to boil. Pour the warm brine over the cucumbers in the jar, making sure cucumbers are fully submerged.", timerSeconds: 120, mistakeWarning: "Cucumbers floating above the brine will not pickle evenly. Use a small ziplock bag filled with water as a weight to keep them submerged.", quickHack: null, cuisineFact: null, donenessCue: "Brine is clear, salt fully dissolved. Cucumbers are covered.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Let cool to room temperature with the lid off (about 20 minutes), then seal and refrigerate. The pickles will be lightly tangy after 1 hour, better after 4 hours, and best after 24 hours. Keep refrigerated for up to 3 weeks.", timerSeconds: 1200, mistakeWarning: "Sealing a hot jar and refrigerating immediately can cause condensation inside and slightly dilute the brine. Cool first.", quickHack: "Add a grape leaf or oak leaf to the jar — tannins keep the pickles extra crisp.", cuisineFact: null, donenessCue: "Cucumbers have turned from bright to slightly muted green, are fragrant with garlic and dill, and taste tangy with a satisfying snap.", imageUrl: null },
    ],
  },

  "papaya-salad": {
    slug: "papaya-salad",
    name: "Green Papaya Salad",
    description: "Thai som tum — shredded green papaya tossed in a pounded dressing of lime, fish sauce, palm sugar, garlic, and chilies.",
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    skillLevel: "intermediate",
    cuisineFamily: "thai",
    heroImageUrl: null,
    flavorProfile: ["tangy", "spicy", "sweet", "umami"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Green (unripe) papaya, peeled and shredded", quantity: "2 cups (about 1 small papaya)", isOptional: false, substitution: "Green mango or kohlrabi — similar crunch and neutrality" },
      { id: "2", name: "Cherry tomatoes, halved", quantity: "8", isOptional: false, substitution: null },
      { id: "3", name: "Long beans or green beans, cut into 2-inch pieces", quantity: "6-8", isOptional: false, substitution: null },
      { id: "4", name: "Garlic cloves", quantity: "2", isOptional: false, substitution: null },
      { id: "5", name: "Thai chilies (bird's eye)", quantity: "2-4 to taste", isOptional: false, substitution: "Serrano — milder, adjust quantity" },
      { id: "6", name: "Lime juice", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "7", name: "Fish sauce", quantity: "2 tbsp", isOptional: false, substitution: "Soy sauce + lime for vegan" },
      { id: "8", name: "Palm sugar or brown sugar", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "9", name: "Roasted peanuts", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "10", name: "Dried shrimp", quantity: "1 tbsp", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Peel the green papaya and shred into long thin strands using a julienne peeler, mandoline, or the traditional technique: score the papaya with a cleaver and then slice off the shreds. You need about 2 packed cups. Soak shreds in cold water for 10 minutes to remove bitterness, then drain and pat dry.", timerSeconds: 600, mistakeWarning: "Using ripe (orange) papaya produces a sweet, mushy salad instead of the crisp, neutral base the dish requires. The papaya must be completely green and firm.", quickHack: null, cuisineFact: "Som tum (ส้มตำ) means 'sour pounded' — som = sour, tum = to pound. It originated in Laos and northeastern Thailand and is considered Thailand's national dish alongside pad thai.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "In a large mortar, pound garlic and chilies to a rough paste — do not make it smooth, you want texture. Add beans and pound a few times to bruise (not pulverize). Add palm sugar, fish sauce, and lime juice; stir and taste — the dressing should be an assertive balance of sour, salty, and sweet with real heat.", timerSeconds: null, mistakeWarning: "Taste aggressively — som tum should be bold, not mild. Adjust lime for sour, fish sauce for salt, sugar for sweet, more chili for heat.", quickHack: "No mortar? Mince garlic and chili finely and whisk the dressing in a bowl. Bruise the beans by pressing with the flat of a knife. The result is slightly less integrated but still delicious.", cuisineFact: null, donenessCue: "Dressing is punchy — sour, salty, sweet, and spicy in equal measure.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Add papaya and tomatoes to the mortar. Use a spoon and the pestle together to toss and lightly bruise the papaya — pressing some strands against the sides to absorb dressing while keeping most intact. Add dried shrimp if using. Toss in peanuts. Taste once more and adjust. Serve immediately — the salad wilts quickly.", timerSeconds: null, mistakeWarning: "Don't make this ahead. Once dressed, the papaya releases water and the salad becomes soggy within 30 minutes.", quickHack: null, cuisineFact: null, donenessCue: "Papaya strands are glistening with dressing, slightly softened at edges but still crunchy at center. Tomatoes are just bruised.", imageUrl: null },
    ],
  },

  "bao-buns": {
    slug: "bao-buns",
    name: "Steamed Bao Buns",
    description: "Soft, pillowy Chinese steamed buns (gua bao) with a tender, slightly sweet dough. The ideal vessel for braised pork, crispy chicken, or vegetables.",
    prepTimeMinutes: 90,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    cuisineFamily: "chinese",
    heroImageUrl: null,
    flavorProfile: ["slightly sweet", "soft", "pillowy", "neutral"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "All-purpose flour", quantity: "2 cups (260g)", isOptional: false, substitution: null },
      { id: "2", name: "Instant yeast", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "3", name: "Baking powder", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "4", name: "Sugar", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Salt", quantity: "1/4 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Warm milk or water", quantity: "3/4 cup", isOptional: false, substitution: null },
      { id: "7", name: "Neutral oil", quantity: "1 tbsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Whisk flour, yeast, baking powder, sugar, and salt together. Add warm milk (110°F) and oil. Mix until a dough forms, then knead on a lightly floured surface for 8-10 minutes until smooth and elastic. The dough should spring back slowly when you poke it. Place in an oiled bowl, cover, and let rise 1 hour until doubled.", timerSeconds: 3600, mistakeWarning: "Milk hotter than 115°F kills the yeast. Insufficient kneading produces dense, tough buns. Knead until the dough passes the windowpane test — stretch a piece thin enough to see light through without tearing.", quickHack: null, cuisineFact: "Bao buns (包) have been eaten in China since the Song dynasty (960-1279 CE). The modern gua bao (folded bun) is especially popular in Taiwan as street food, typically filled with braised pork belly.", donenessCue: "Dough has doubled and feels airy. Poke a floured finger in — the indent should spring back slowly, not immediately.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Punch down the dough and divide into 8 equal pieces. Roll each into a smooth ball, then flatten into an oval about 4x3 inches. Lightly brush the top with oil, then fold in half like a taco shell. Place each on a small square of parchment paper. Cover with a damp towel and rest 30 minutes.", timerSeconds: 1800, mistakeWarning: "The oil between the folded layers prevents them from fusing during steaming, making the buns easy to open for filling. Don't skip this step.", quickHack: "A chopstick laid across the center of the oval before folding creates a perfect crease.", cuisineFact: null, donenessCue: "Buns have puffed slightly and look pillow-like when resting.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Set up a steamer with 1-2 inches of boiling water. Steam buns in batches (don't crowd) on their parchment squares for 10-12 minutes over medium-high heat. When done, turn off heat and let rest inside the steamer with the lid on for 5 minutes before opening.", timerSeconds: 720, mistakeWarning: "Opening the steamer too quickly causes the buns to collapse from the sudden temperature change. The 5-minute rest is not optional.", quickHack: "No steamer? Place a rack inside a large pot or wok with a tight-fitting lid. Works identically.", cuisineFact: null, donenessCue: "Buns are pure white, very puffy, and feel light when lifted. Tap the top — it should sound hollow and spring back immediately.", imageUrl: null },
    ],
  },

  "crispy-wontons": {
    slug: "crispy-wontons",
    name: "Crispy Wontons",
    description: "Deep-fried wontons with a seasoned pork and shrimp filling — shatteringly crispy outside, juicy and savory inside.",
    prepTimeMinutes: 30,
    cookTimeMinutes: 15,
    skillLevel: "intermediate",
    cuisineFamily: "chinese",
    heroImageUrl: null,
    flavorProfile: ["savory", "crispy", "umami", "garlicky"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Ground pork", quantity: "6 oz", isOptional: false, substitution: "Ground chicken or all shrimp" },
      { id: "2", name: "Shrimp, peeled and finely chopped", quantity: "4 oz", isOptional: false, substitution: null },
      { id: "3", name: "Soy sauce", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "4", name: "Sesame oil", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "5", name: "Ginger, minced", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Garlic, minced", quantity: "2 cloves", isOptional: false, substitution: null },
      { id: "7", name: "Green onions, minced", quantity: "3", isOptional: false, substitution: null },
      { id: "8", name: "Cornstarch", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "9", name: "Salt and white pepper", quantity: "To taste", isOptional: false, substitution: null },
      { id: "10", name: "Square wonton wrappers", quantity: "30", isOptional: false, substitution: null },
      { id: "11", name: "Neutral oil for frying", quantity: "4 cups", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Combine pork, shrimp, soy sauce, sesame oil, ginger, garlic, green onions, cornstarch, salt, and white pepper in a bowl. Mix vigorously in one direction for 1-2 minutes — this activates the proteins and creates a cohesive, bouncy filling that won't fall apart in the oil.", timerSeconds: null, mistakeWarning: "Undermixing creates a crumbly filling that separates from the wrapper during frying. Mix until the filling feels sticky and pulls away from the bowl as one mass.", quickHack: "Cook a small piece of filling in a pan to taste for seasoning before wrapping — you can't adjust once the wontons are folded.", cuisineFact: "Wontons (云吞) are one of China's oldest dumplings, originating in northern China over 1,000 years ago. 'Wonton' in Cantonese means 'swallowing clouds' — a reference to their shape.", donenessCue: "Filling is cohesive and sticky, not loose or crumbly.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Place a wonton wrapper on a flat surface. Add 1 tsp of filling to the center. Dip a finger in water and moisten all edges. Fold diagonally to form a triangle, pressing out all air and sealing firmly. Moisten the two bottom corners and press them together to form a nurse's cap shape. Repeat. Keep finished wontons covered with a damp towel.", timerSeconds: null, mistakeWarning: "Air pockets inside the wonton expand during frying and can burst the wrapper. Press out all air when sealing the triangle.", quickHack: "For a simpler shape: just fold into a triangle and leave it — it fries up just as crispy.", cuisineFact: null, donenessCue: "Wontons are tightly sealed with no air pockets visible when pressed.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Heat oil to 350°F in a deep pot or wok. Fry wontons in small batches — 6-8 at a time — for 2-3 minutes, flipping once, until deep golden brown on both sides. Remove with a spider or slotted spoon and drain on a wire rack. Serve immediately with sweet chili sauce or soy-ginger dipping sauce.", timerSeconds: 180, mistakeWarning: "Crowding the pot drops the oil temperature and produces greasy, pale wontons instead of crispy, golden ones. Fry in small batches and let the oil return to 350°F between batches.", quickHack: null, cuisineFact: null, donenessCue: "Wontons are deep golden brown on all sides, very crispy, and sound hollow when tapped. Filling is cooked through.", imageUrl: null },
    ],
  },

  "wild-rice": {
    slug: "wild-rice",
    name: "Wild Rice",
    description: "Earthy, nutty wild rice with a satisfying chewy bite. Cooked like pasta in plenty of water — simple but worth knowing.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 50,
    skillLevel: "beginner",
    cuisineFamily: "american",
    heroImageUrl: null,
    flavorProfile: ["earthy", "nutty", "savory", "hearty"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Wild rice", quantity: "1 cup", isOptional: false, substitution: "Wild rice blend — cooks faster (35-40 min)" },
      { id: "2", name: "Water or chicken/vegetable broth", quantity: "4 cups", isOptional: false, substitution: null },
      { id: "3", name: "Salt", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "4", name: "Butter", quantity: "1 tbsp", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Rinse wild rice in a fine mesh strainer under cold water for 30 seconds. Bring 4 cups of water or broth to a boil in a medium pot. Add salt and the rinsed wild rice.", timerSeconds: null, mistakeWarning: "Wild rice is not white rice — it is actually the seed of an aquatic grass. Do not use the absorption method (1:2 ratio). It requires excess water like pasta, as the exact amount absorbed varies.", quickHack: null, cuisineFact: "Wild rice is native to the Great Lakes region of North America and was a staple food for the Ojibwe and Menominee peoples for thousands of years. It is the only grain native to North America.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Reduce heat to a steady simmer. Cook uncovered for 45-55 minutes, stirring occasionally, until the grains are tender and have burst open revealing their white interior. Taste at 45 minutes — if still too chewy, continue cooking.", timerSeconds: 2700, mistakeWarning: "Under-cooked wild rice is unpleasantly chewy and almost squeaky. It must be fully cooked until the grains have burst and are tender throughout.", quickHack: "Pressure cooker: cook on high for 25 minutes with natural pressure release — cuts cook time nearly in half.", cuisineFact: null, donenessCue: "Most grains have burst open showing the white inner starch, and are tender with a pleasant chew — not hard or squeaky.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Drain excess water through a strainer. Return to pot and stir in butter if using. Fluff with a fork. Season with additional salt to taste. Serve as a side, or use as the base for salads, soups, or grain bowls.", timerSeconds: null, mistakeWarning: null, quickHack: "Toast the dry wild rice in a dry pan for 2-3 minutes before cooking to deepen the nutty flavor significantly.", cuisineFact: null, donenessCue: "Grains are separate, fluffy, and evenly cooked. Aroma is nutty and slightly earthy.", imageUrl: null },
    ],
  },

  "korean-pancake": {
    slug: "korean-pancake",
    name: "Pajeon (Korean Scallion Pancake)",
    description: "Crispy, savory Korean pancakes loaded with green onions and optional seafood. Crisp outside, chewy inside, irresistible with dipping sauce.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    skillLevel: "beginner",
    cuisineFamily: "korean",
    heroImageUrl: null,
    flavorProfile: ["savory", "crispy", "oniony", "umami"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "All-purpose flour", quantity: "1 cup", isOptional: false, substitution: null },
      { id: "2", name: "Cornstarch", quantity: "2 tbsp", isOptional: false, substitution: "Rice flour — makes it even crispier" },
      { id: "3", name: "Cold sparkling water or ice water", quantity: "3/4 cup", isOptional: false, substitution: null },
      { id: "4", name: "Egg", quantity: "1 large", isOptional: false, substitution: null },
      { id: "5", name: "Salt", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Green onions (scallions)", quantity: "1 large bunch (10-12 stalks)", isOptional: false, substitution: null },
      { id: "7", name: "Neutral oil", quantity: "3 tbsp per pancake", isOptional: false, substitution: null },
      { id: "8", name: "Soy sauce, rice vinegar, sesame oil for dipping", quantity: "2 tbsp + 1 tbsp + 1 tsp", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Trim roots from green onions. Cut into 2-3 inch lengths, halving any thick stalks lengthwise. In a bowl, whisk flour, cornstarch, and salt. Add cold sparkling water and egg. Mix with a fork until just combined — a few lumps are fine. Fold in green onions. Do not overmix.", timerSeconds: null, mistakeWarning: "Cold water (or sparkling water) keeps gluten formation low, which creates a lighter, crispier pancake. Warm water creates a chewy, dense result. Overmixing also builds too much gluten.", quickHack: null, cuisineFact: "Pajeon (파전) means 'green onion pancake.' It's one of Korea's most popular bar foods (anju), and there's even a saying: 'rainy days call for pajeon and makgeolli (rice wine).'", donenessCue: "Batter is thin and barely holds its shape — it should pour, not scoop.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Heat 3 tbsp oil in a large nonstick or cast iron pan over medium-high heat. When oil shimmers, pour in half the batter, spreading it to form an 8-inch circle. Press the scallions flat with a spatula so they're embedded in the batter evenly.", timerSeconds: null, mistakeWarning: "Use more oil than you think you need — the generous amount of oil is what creates the lacy, crispy edges. Underoiling produces a pale, soft pancake.", quickHack: null, cuisineFact: null, donenessCue: "Batter is sizzling at the edges and starting to look set.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Cook 4-5 minutes until the bottom is deep golden and crispy. Use a wide spatula to flip in one confident motion. Press down firmly with the spatula and cook 3-4 more minutes until the second side is equally golden. Slide onto a cutting board and cut into wedges. Make dipping sauce: whisk soy sauce, rice vinegar, sesame oil, and a pinch of sugar.", timerSeconds: 480, mistakeWarning: "Hesitating on the flip causes the pancake to break. Get a wide spatula fully under it and flip fast. If it tears, press back together — it still tastes great.", quickHack: "Drizzle a bit of extra oil around the edges after flipping for a crispier second side.", cuisineFact: null, donenessCue: "Both sides are deep golden brown with crispy, lacy edges. Center is set and cooked through. Sizzles loudly.", imageUrl: null },
    ],
  },

  "coconut-soup": {
    slug: "coconut-soup",
    name: "Tom Kha (Coconut Soup)",
    description: "Thai coconut milk soup perfumed with lemongrass, galangal, and lime leaf — creamy, aromatic, and balanced between sour, salty, and sweet.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    cuisineFamily: "thai",
    heroImageUrl: null,
    flavorProfile: ["creamy", "aromatic", "tangy", "savory"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Coconut milk (full fat)", quantity: "1 can (14 oz)", isOptional: false, substitution: null },
      { id: "2", name: "Chicken or vegetable broth", quantity: "2 cups", isOptional: false, substitution: null },
      { id: "3", name: "Lemongrass stalks, bruised and cut into 2-inch pieces", quantity: "2", isOptional: false, substitution: "1 tsp lemongrass paste" },
      { id: "4", name: "Galangal or ginger, sliced", quantity: "1-inch piece", isOptional: false, substitution: "Ginger — milder flavor, still works" },
      { id: "5", name: "Makrut lime leaves (kaffir lime)", quantity: "4", isOptional: false, substitution: "Zest of 1 lime" },
      { id: "6", name: "Thai chilies, bruised", quantity: "2-3", isOptional: false, substitution: null },
      { id: "7", name: "Chicken breast, thinly sliced, or mushrooms", quantity: "8 oz", isOptional: false, substitution: null },
      { id: "8", name: "Oyster mushrooms or straw mushrooms", quantity: "1 cup", isOptional: false, substitution: null },
      { id: "9", name: "Fish sauce", quantity: "3 tbsp", isOptional: false, substitution: "Soy sauce + pinch of salt" },
      { id: "10", name: "Lime juice", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "11", name: "Palm sugar or brown sugar", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "12", name: "Fresh cilantro and chilies for garnish", quantity: "As desired", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Pound or bruise lemongrass, galangal slices, lime leaves, and chilies with the back of a knife or mortar to release their essential oils. Bring broth to a boil in a medium pot. Add all bruised aromatics and simmer 5 minutes to infuse the broth.", timerSeconds: 300, mistakeWarning: "Unbrushed aromatics give only a fraction of their flavor. The bruising ruptures the cell walls that contain the essential oils. Don't skip this step.", quickHack: null, cuisineFact: "Tom kha gai (ต้มข่าไก่) means 'boiled galangal chicken.' Galangal is the defining flavor — it tastes similar to ginger but more piney and peppery. It's not interchangeable, but ginger is an acceptable substitute.", donenessCue: "Broth is fragrant and cloudy with aromatics.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Add coconut milk and stir to combine. Bring to a gentle simmer (do not boil hard — coconut milk can separate). Add chicken or mushrooms and cook 5-8 minutes until protein is cooked through.", timerSeconds: 480, mistakeWarning: "Boiling vigorously causes the coconut milk to break (the fat separates from the liquid), making the soup oily and grainy. Keep it at a gentle bubble.", quickHack: null, cuisineFact: null, donenessCue: "Chicken is cooked through with no pink. Soup is creamy and the surface is glossy.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Remove from heat. Add fish sauce, lime juice, and sugar. Taste and adjust — the soup should hit all four notes: creamy (coconut), sour (lime), salty (fish sauce), and sweet (sugar). Add more of whichever is missing. Ladle into bowls, garnish with cilantro and fresh chilies. The aromatics are left in but not meant to be eaten.", timerSeconds: null, mistakeWarning: "Season off heat — lime juice and fish sauce added while boiling lose brightness and complexity.", quickHack: "A splash of evaporated milk added at the end makes the soup even richer and silkier.", cuisineFact: null, donenessCue: "Soup is aromatic, rich, and balanced — no single flavor dominates. Surface is creamy and slightly glistening.", imageUrl: null },
    ],
  },

  "pita-chips": {
    slug: "pita-chips",
    name: "Pita Chips",
    description: "Homemade baked pita chips — crispy, golden, and sturdy enough for the thickest hummus. Ready in 15 minutes.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 12,
    skillLevel: "beginner",
    cuisineFamily: "mediterranean",
    heroImageUrl: null,
    flavorProfile: ["savory", "toasty", "salty", "neutral"],
    temperature: "warm",
    ingredients: [
      { id: "1", name: "Pita bread rounds", quantity: "4 (8-inch)", isOptional: false, substitution: null },
      { id: "2", name: "Olive oil", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "3", name: "Salt", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "4", name: "Za'atar or dried oregano", quantity: "1 tsp", isOptional: true, substitution: null },
      { id: "5", name: "Garlic powder", quantity: "1/4 tsp", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Preheat oven to 375°F. Split each pita round into two thin rounds by pulling them apart along the pocket seam. Stack and cut into 6 or 8 wedges per round — you'll get 48-64 chips total.", timerSeconds: null, mistakeWarning: null, quickHack: "Splitting the pita into two thin layers before cutting is the key to thin, crispy chips instead of thick, bready ones.", cuisineFact: "Pita (from the Greek 'pēktos' meaning solid or clotted) has been baked in the Middle East for over 4,000 years. The pocket forms during baking when steam creates a bubble between the two layers.", donenessCue: null, imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Spread pita wedges in a single layer on two baking sheets. Brush or drizzle with olive oil. Season with salt, za'atar or oregano, and garlic powder if using. Toss gently to coat, then spread back out.", timerSeconds: null, mistakeWarning: "Overlapping chips steam each other and come out soft. Spread in a true single layer for maximum crispiness.", quickHack: null, cuisineFact: null, donenessCue: "All chips are lightly coated and seasoned.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Bake at 375°F for 10-14 minutes, rotating pans halfway through, until chips are light golden and beginning to brown at the edges. Cool completely on the pans — they crisp further as they cool.", timerSeconds: 720, mistakeWarning: "Pull chips while still slightly flexible — they harden to a full crisp as they cool. Waiting until they look fully crispy in the oven means they will over-bake and turn bitter.", quickHack: null, cuisineFact: null, donenessCue: "Light golden with slightly darker edges. Still slightly pliable when hot — they will be fully crispy once cooled.", imageUrl: null },
    ],
  },

  papadum: {
    slug: "papadum",
    name: "Papadum",
    description: "Crispy, thin Indian lentil wafers that puff dramatically when cooked. Ready in 2 minutes — the perfect instant accompaniment to any Indian meal.",
    prepTimeMinutes: 1,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    cuisineFamily: "indian",
    heroImageUrl: null,
    flavorProfile: ["savory", "crispy", "nutty", "spiced"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Store-bought papadums (raw)", quantity: "8", isOptional: false, substitution: null },
      { id: "2", name: "Oil for frying (optional)", quantity: "2 cups", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "MICROWAVE METHOD (easiest): Place 1-2 papadums on a microwave-safe plate. Microwave on high for 30-45 seconds, watching closely — they will puff and blister rapidly. They are done when fully puffed and opaque. No oil needed.", timerSeconds: 45, mistakeWarning: "Each microwave is different — start at 30 seconds. Over-microwaving makes them smell burnt in the last few seconds. Remove the moment they look fully puffed.", quickHack: null, cuisineFact: "Papadum (also papad) is made from urad dal (black lentil) flour mixed with spices, rolled paper-thin, and sun-dried. The drying process takes 2-3 days in India — store-bought versions skip the home-drying entirely.", donenessCue: "Papadum is fully puffed, opaque white-gold, and feels rigid and light.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "STOVETOP METHOD (crispiest): For the traditional flame method, hold a papadum with tongs directly over a medium gas flame, rotating constantly for 20-30 seconds until blistered all over. Alternatively, dry-toast in a hot skillet 30 seconds per side. The result is slightly more charred and complex.", timerSeconds: 30, mistakeWarning: "Hold the papadum at least 4 inches from the flame and keep rotating — stationary contact for even 2 seconds causes burning.", quickHack: "Want deep-fried papadums like in restaurants? Fry in 350°F oil for 10-15 seconds per side — they puff immediately and become golden.", cuisineFact: null, donenessCue: "Blistered, slightly charred in spots, fully rigid and crispy.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Serve immediately — papadums go soft within minutes of cooking as they absorb humidity. They are traditionally served as a pre-meal cracker with chutneys, raita, or simply eaten alongside dal and rice.", timerSeconds: null, mistakeWarning: "Cook papadums last, right before serving. A papadum cooked 10 minutes early is a chewy, disappointing papadum.", quickHack: null, cuisineFact: null, donenessCue: null, imageUrl: null },
    ],
  },

  "egg-drop-soup-with-veggies": {
    slug: "egg-drop-soup-with-veggies",
    name: "Egg Drop Soup",
    description: "Silky Chinese egg drop soup with ribbons of egg floating in a ginger-scented golden broth with vegetables.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    cuisineFamily: "chinese",
    heroImageUrl: null,
    flavorProfile: ["savory", "delicate", "umami", "warming"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Chicken or vegetable broth", quantity: "4 cups", isOptional: false, substitution: null },
      { id: "2", name: "Eggs", quantity: "3 large", isOptional: false, substitution: null },
      { id: "3", name: "Cornstarch", quantity: "2 tbsp mixed with 3 tbsp cold water", isOptional: false, substitution: null },
      { id: "4", name: "Soy sauce", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Sesame oil", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Ginger, grated", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "7", name: "Frozen or fresh corn kernels", quantity: "1/2 cup", isOptional: false, substitution: null },
      { id: "8", name: "Tofu (silken), cubed", quantity: "4 oz", isOptional: true, substitution: null },
      { id: "9", name: "Green onions, sliced", quantity: "3", isOptional: false, substitution: null },
      { id: "10", name: "White pepper", quantity: "1/4 tsp", isOptional: false, substitution: null },
      { id: "11", name: "Turmeric", quantity: "1/4 tsp (for color)", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Bring broth to a boil in a medium pot. Add ginger, soy sauce, white pepper, and turmeric. Add corn (and tofu if using). Simmer 3 minutes.", timerSeconds: 180, mistakeWarning: null, quickHack: null, cuisineFact: "Egg drop soup (蛋花汤, dan hua tang) translates as 'egg flower soup' — a reference to the ribbons of cooked egg that resemble flower petals. It's one of the simplest soups in Cantonese cooking and appears at nearly every Chinese-American restaurant.", donenessCue: "Broth is hot and fragrant.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Stir the cornstarch slurry (it settles quickly, so stir before adding). Pour into the simmering broth while stirring constantly. The soup will thicken within 30-60 seconds to a slightly glossy, silky consistency.", timerSeconds: 60, mistakeWarning: "Adding cornstarch slurry to a boiling soup without stirring causes lumpy clumps. Keep the broth at a low simmer and stir constantly as you pour.", quickHack: null, cuisineFact: null, donenessCue: "Broth is lightly thickened — it coats a spoon and looks slightly glossy.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Beat the eggs well with a fork. Reduce heat so the broth is at a gentle simmer (not boiling). Hold the fork over the broth and slowly pour the beaten eggs through the tines in a thin, steady stream while stirring the broth slowly in one direction with your other hand. The egg will cook into long, silky ribbons.", timerSeconds: null, mistakeWarning: "Pouring eggs into boiling broth creates rubbery, scrambled egg chunks instead of silky ribbons. The broth must be at a gentle simmer. Pour slowly — 10-15 seconds for all the eggs.", quickHack: "For finer, more delicate ribbons, pour the egg through a fork or whisk held at the rim of the pot.", cuisineFact: null, donenessCue: "Egg has formed into long, delicate silky ribbons throughout the soup.", imageUrl: null },
      { phase: "cook", stepNumber: 4, instruction: "Remove from heat immediately. Stir in sesame oil. Ladle into bowls and top with green onions. Serve hot.", timerSeconds: null, mistakeWarning: null, quickHack: null, cuisineFact: null, donenessCue: "Soup is golden, glossy, and filled with soft egg ribbons. Fragrant with sesame and ginger.", imageUrl: null },
    ],
  },

  "dan-dan-noodles": {
    slug: "dan-dan-noodles",
    name: "Dan Dan Noodles",
    description: "Sichuan street noodles with a rich sesame-chili sauce, crispy pork, and numbing Sichuan pepper. Bold, complex, and deeply satisfying.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    cuisineFamily: "chinese",
    heroImageUrl: null,
    flavorProfile: ["spicy", "numbing", "nutty", "savory"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Thin wheat noodles or spaghetti", quantity: "8 oz", isOptional: false, substitution: null },
      { id: "2", name: "Ground pork", quantity: "6 oz", isOptional: false, substitution: "Ground chicken" },
      { id: "3", name: "Soy sauce", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "4", name: "Chinese black vinegar (Chinkiang)", quantity: "2 tbsp", isOptional: false, substitution: "Rice vinegar + pinch of sugar" },
      { id: "5", name: "Chinese sesame paste or tahini", quantity: "3 tbsp", isOptional: false, substitution: null },
      { id: "6", name: "Chili oil", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "7", name: "Sichuan peppercorn, ground", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "8", name: "Sugar", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "9", name: "Garlic, minced", quantity: "3 cloves", isOptional: false, substitution: null },
      { id: "10", name: "Yacai (Sichuan preserved vegetables), optional", quantity: "2 tbsp", isOptional: true, substitution: null },
      { id: "11", name: "Baby bok choy or spinach for blanching", quantity: "4 oz", isOptional: false, substitution: null },
      { id: "12", name: "Green onions and peanuts for garnish", quantity: "As desired", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Make the sauce: whisk sesame paste, soy sauce, black vinegar, chili oil, sugar, ground Sichuan peppercorn, and garlic together. Add 3-4 tbsp of hot water to thin to a pourable consistency — it should flow off a spoon. Taste: it should be intensely savory, tangy, and numbing. Adjust to your preference and divide between serving bowls.", timerSeconds: null, mistakeWarning: "The sauce is the whole dish. If it tastes flat, it needs more black vinegar. If it's not complex enough, add more Sichuan peppercorn. Taste aggressively before the noodles go in.", quickHack: "Make the sauce 1-2 days ahead — it deepens significantly in flavor overnight.", cuisineFact: "Dan dan mian (担担面) is named after the bamboo carrying poles (dan dan) that street vendors used to carry two baskets — one of noodles, one of sauce — through the streets of Chengdu, Sichuan.", donenessCue: "Sauce is smooth, pourable, and punchy.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Heat a wok or pan over high heat. Add ground pork and cook, pressing into a thin layer, until browned and slightly crispy — do not stir for 2 minutes to let a crust form. Break up, add yacai if using, stir-fry 1 more minute. Remove from heat.", timerSeconds: 180, mistakeWarning: "Stirring the pork constantly produces gray, steamed meat instead of crispy, caramelized bits. Let it sit undisturbed first.", quickHack: null, cuisineFact: null, donenessCue: "Pork is browned and slightly crispy with some caramelized bits. Smells savory and nutty.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Cook noodles per package directions in a large pot of boiling water. In the last 30 seconds, add the greens to blanch them. Drain, then divide noodles and greens over the sauce in each bowl. Top with crispy pork. Garnish with green onions, peanuts, and an extra drizzle of chili oil. Toss thoroughly before eating.", timerSeconds: null, mistakeWarning: null, quickHack: "Reserve 1/4 cup of pasta cooking water — a splash thinned into the bowl sauce creates a perfectly silky coating on the noodles.", cuisineFact: null, donenessCue: "Noodles are coated in the sauce when tossed. Each bite has a layer of sesame, chili, and Sichuan numbing.", imageUrl: null },
    ],
  },

  "hot-and-sour-soup": {
    slug: "hot-and-sour-soup",
    name: "Hot and Sour Soup",
    description: "Classic Chinese restaurant soup — thick, glossy broth with silky tofu, mushrooms, bamboo shoots, and egg ribbons. Tangy from vinegar, hot from white pepper.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    cuisineFamily: "chinese",
    heroImageUrl: null,
    flavorProfile: ["tangy", "spicy", "umami", "savory"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Chicken or vegetable broth", quantity: "6 cups", isOptional: false, substitution: null },
      { id: "2", name: "Firm tofu, julienned", quantity: "8 oz", isOptional: false, substitution: null },
      { id: "3", name: "Shiitake mushrooms, sliced", quantity: "1 cup", isOptional: false, substitution: "Any mushroom" },
      { id: "4", name: "Bamboo shoots, julienned", quantity: "1/2 cup", isOptional: false, substitution: "Canned water chestnuts" },
      { id: "5", name: "Eggs", quantity: "2 large, beaten", isOptional: false, substitution: null },
      { id: "6", name: "Cornstarch", quantity: "3 tbsp mixed with 4 tbsp cold water", isOptional: false, substitution: null },
      { id: "7", name: "Chinese black vinegar (Chinkiang)", quantity: "4 tbsp", isOptional: false, substitution: "Rice vinegar — milder" },
      { id: "8", name: "Soy sauce", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "9", name: "White pepper", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "10", name: "Ginger, grated", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "11", name: "Sesame oil", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "12", name: "Green onions", quantity: "3, sliced", isOptional: false, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Bring broth to a boil. Add mushrooms and ginger; simmer 3 minutes. Add bamboo shoots, tofu, soy sauce, and white pepper. Simmer 2 more minutes.", timerSeconds: 300, mistakeWarning: null, quickHack: null, cuisineFact: "Hot and sour soup (酸辣汤, suan la tang) — 'suan' meaning sour, 'la' meaning spicy. The 'hot' refers to white pepper heat (not chili), and the 'sour' comes from black vinegar, giving it a more complex sourness than regular vinegar.", donenessCue: "Broth is fragrant, mushrooms are tender.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Stir the cornstarch slurry vigorously (it settles fast). Pour into the simmering soup while stirring constantly. Cook 1-2 minutes until the soup thickens to a glossy, slightly gelatinous consistency. This is the defining texture of restaurant hot and sour soup.", timerSeconds: 90, mistakeWarning: "The thickening is what separates this from a regular broth soup. It should coat the back of a spoon heavily. If it's too thin, mix another tablespoon of cornstarch with cold water and add more.", quickHack: null, cuisineFact: null, donenessCue: "Soup is noticeably thick, glossy, and coats the spoon.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Reduce to a gentle simmer. Slowly drizzle beaten eggs in a thin stream while stirring the soup in slow circles with your other hand. The egg forms silky ribbons. Remove from heat immediately. Stir in vinegar and sesame oil — add these off-heat to preserve their brightness. Taste and adjust vinegar, soy sauce, and pepper. Top with green onions.", timerSeconds: null, mistakeWarning: "Add vinegar off the heat — boiling drives off the acidity and reduces the sourness significantly.", quickHack: "Start with 3 tbsp vinegar, taste, and add more if you want it more sour. The sourness should be assertive — this is not a subtle soup.", cuisineFact: null, donenessCue: "Soup is thick, glossy, with egg ribbons throughout. Tastes simultaneously hot (from pepper) and sour (from vinegar).", imageUrl: null },
    ],
  },

  upma: {
    slug: "upma",
    name: "Upma",
    description: "South Indian savory semolina porridge cooked with mustard seeds, curry leaves, and vegetables. A beloved South Indian breakfast staple.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 20,
    skillLevel: "beginner",
    cuisineFamily: "indian",
    heroImageUrl: null,
    flavorProfile: ["savory", "nutty", "spiced", "hearty"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Semolina (rava/sooji)", quantity: "1 cup", isOptional: false, substitution: null },
      { id: "2", name: "Water", quantity: "2.5 cups", isOptional: false, substitution: null },
      { id: "3", name: "Onion, finely chopped", quantity: "1 medium", isOptional: false, substitution: null },
      { id: "4", name: "Green chili, slit", quantity: "1-2", isOptional: false, substitution: null },
      { id: "5", name: "Ginger, minced", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Mustard seeds", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "7", name: "Chana dal (split chickpeas)", quantity: "1 tbsp", isOptional: false, substitution: "Urad dal" },
      { id: "8", name: "Curry leaves", quantity: "10-12", isOptional: false, substitution: "2 bay leaves as a substitute" },
      { id: "9", name: "Mixed vegetables (carrot, peas, corn)", quantity: "1/2 cup", isOptional: true, substitution: null },
      { id: "10", name: "Oil or ghee", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "11", name: "Salt", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "12", name: "Cashews and fresh cilantro for garnish", quantity: "As desired", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Dry-roast semolina in a pan over medium heat, stirring constantly for 3-4 minutes until it turns a shade more golden and smells nutty. Do not let it brown. Remove from pan and set aside. This step is essential — it prevents lumps and gives upma its characteristic texture.", timerSeconds: 240, mistakeWarning: "Unroasted semolina produces a gluey, doughy upma. Roasting separates the grains so they absorb water individually rather than clumping together.", quickHack: null, cuisineFact: "Upma is a staple of South Indian breakfasts from Tamil Nadu, Karnataka, Andhra Pradesh, and Kerala. Its name comes from 'uppu' (salt) + 'maavu' (flour). It is quick, filling, and surprisingly nutritious.", donenessCue: "Semolina is one shade darker and smells faintly toasty.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Heat oil in a deep pan. Add mustard seeds and wait for them to pop. Add chana dal; fry until golden, 30 seconds. Add curry leaves (they'll splutter), green chili, ginger, and onion. Cook 5-7 minutes until onion is soft and translucent. Add vegetables if using; cook 2 minutes.", timerSeconds: 450, mistakeWarning: "Curry leaves must be added to hot oil — they bloom their oils in the fat. Adding them to cool oil produces no flavor.", quickHack: "Fry a handful of cashews in the oil before adding mustard seeds — they add crunch and richness.", cuisineFact: null, donenessCue: "Onion is translucent and soft. Mixture is fragrant.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Add 2.5 cups water and salt to the pan. Bring to a rolling boil. Reduce heat to medium-low. Add the roasted semolina in a steady stream while stirring constantly with the other hand. Keep stirring vigorously for 2-3 minutes as the mixture thickens and comes together. Cover and cook on low for 2 minutes.", timerSeconds: 300, mistakeWarning: "Adding semolina to water that isn't fully boiling, or adding it all at once without stirring, causes lumps. The boiling water cooks each grain individually as it lands.", quickHack: null, cuisineFact: null, donenessCue: "Upma is thick, fluffy, and pulls away from the sides of the pan. Each grain is separate — not gluey or sticky.", imageUrl: null },
    ],
  },

  "curd-rice": {
    slug: "curd-rice",
    name: "Curd Rice",
    description: "South Indian yogurt rice tempered with mustard seeds, curry leaves, and green chili. Cool, soothing, and the essential comfort food finale to a South Indian meal.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    cuisineFamily: "indian",
    heroImageUrl: null,
    flavorProfile: ["tangy", "cooling", "savory", "creamy"],
    temperature: "cold",
    ingredients: [
      { id: "1", name: "Cooked white rice (slightly overcooked, soft)", quantity: "2 cups", isOptional: false, substitution: null },
      { id: "2", name: "Plain yogurt (full-fat)", quantity: "1.5 cups", isOptional: false, substitution: null },
      { id: "3", name: "Milk", quantity: "1/4 cup", isOptional: false, substitution: null },
      { id: "4", name: "Ghee or oil", quantity: "1 tbsp", isOptional: false, substitution: null },
      { id: "5", name: "Mustard seeds", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Urad dal (split black lentils)", quantity: "1 tsp", isOptional: false, substitution: null },
      { id: "7", name: "Curry leaves", quantity: "10", isOptional: false, substitution: null },
      { id: "8", name: "Green chili, minced", quantity: "1", isOptional: true, substitution: null },
      { id: "9", name: "Ginger, grated", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "10", name: "Salt", quantity: "3/4 tsp", isOptional: false, substitution: null },
      { id: "11", name: "Pomegranate seeds and cilantro for garnish", quantity: "As desired", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Mash the cooked rice well with the back of a spoon or your hand until about half the grains are mashed and the rest are intact — this texture is essential to curd rice. Mix in yogurt and milk until smooth and creamy. Add salt. The mixture should be looser than you think — it will thicken as it sits.", timerSeconds: null, mistakeWarning: "Using dry, separate rice grains (like biryani-style rice) produces a salad, not curd rice. The rice needs to be soft and starchy to absorb the yogurt and create the creamy texture.", quickHack: "Add a tablespoon of cream for an even richer result.", cuisineFact: "Curd rice (thayir sadam in Tamil, mosaranna in Kannada) is always the last dish eaten at a South Indian meal — it cools the body after spicy food and aids digestion due to its probiotic yogurt base.", donenessCue: "Rice and yogurt are fully combined into a creamy mixture with a porridge-like consistency.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Make the tadka: heat ghee in a small pan over medium-high. Add mustard seeds; wait for them to pop. Add urad dal and cook 30 seconds until golden. Add curry leaves (they'll splutter), ginger, and green chili. Fry 10 seconds. Pour the entire sizzling tadka immediately over the yogurt rice and mix well.", timerSeconds: 60, mistakeWarning: "Let the tadka cool slightly before mixing if the yogurt rice is going into the fridge — pouring very hot tadka onto cold yogurt can cause it to separate.", quickHack: null, cuisineFact: null, donenessCue: "Tadka is mixed in and aromatic — the curd rice smells of mustard, curry leaf, and ghee.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Refrigerate for 20-30 minutes before serving — curd rice is best cold. Garnish with pomegranate seeds and cilantro. Serve alongside pickle (aam ka achar or nimbu achar) which provides the traditional salty-sour contrast.", timerSeconds: 1800, mistakeWarning: null, quickHack: "Add a handful of grapes or diced mango for a sweet contrast that's traditional in festive curd rice.", cuisineFact: null, donenessCue: "Cold, creamy, and tangy with a pleasant grain texture. Aromatic from the tadka.", imageUrl: null },
    ],
  },

  "cauliflower-rice": {
    slug: "cauliflower-rice",
    name: "Cauliflower Rice",
    description: "Finely grated cauliflower cooked to a light, fluffy grain-like texture. A neutral, versatile low-carb alternative that absorbs any seasoning.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    skillLevel: "beginner",
    cuisineFamily: "american",
    heroImageUrl: null,
    flavorProfile: ["neutral", "mild", "light", "earthy"],
    temperature: "hot",
    ingredients: [
      { id: "1", name: "Cauliflower, large head", quantity: "1 (about 4 cups grated)", isOptional: false, substitution: null },
      { id: "2", name: "Oil or butter", quantity: "2 tbsp", isOptional: false, substitution: null },
      { id: "3", name: "Garlic, minced", quantity: "2 cloves", isOptional: false, substitution: null },
      { id: "4", name: "Salt", quantity: "1/2 tsp", isOptional: false, substitution: null },
      { id: "5", name: "Black pepper", quantity: "1/4 tsp", isOptional: false, substitution: null },
      { id: "6", name: "Fresh herbs or lemon for finishing", quantity: "As desired", isOptional: true, substitution: null },
    ],
    steps: [
      { phase: "cook", stepNumber: 1, instruction: "Remove the core and outer leaves from the cauliflower. Cut into large florets. Working in batches, pulse the florets in a food processor 8-10 times until they resemble coarse grains of rice — pieces should be about 3-4mm. Do not over-process into mush.", timerSeconds: null, mistakeWarning: "Over-processing creates a wet paste. Pulse in short bursts and stop while it still looks slightly uneven.", quickHack: "No food processor? Use a box grater on the large holes — faster for small amounts and gives a slightly firmer texture.", cuisineFact: "Cauliflower rice surged in popularity in the 2010s as a staple of paleo and keto diets. However, cauliflower has been eaten as a grain substitute across the Middle East and South Asia for centuries under different preparations.", donenessCue: "Cauliflower looks like coarse rice or couscous — fluffy and dry-looking, not paste-like.", imageUrl: null },
      { phase: "cook", stepNumber: 2, instruction: "Heat a large skillet over medium-high heat. Add oil — the pan should be hot enough that it shimmers immediately. Add garlic and cook 30 seconds. Add the cauliflower in a single layer (use two pans if needed). Do not stir for 2 minutes — let it sear.", timerSeconds: 120, mistakeWarning: "Crowding the pan or stirring immediately creates steam that makes the cauliflower wet and mushy. It needs dry, high heat to develop any texture. Spread thin and leave it alone first.", quickHack: null, cuisineFact: null, donenessCue: "Cauliflower is starting to brown on the bottom and smell nutty.", imageUrl: null },
      { phase: "cook", stepNumber: 3, instruction: "Toss and cook 3-5 more minutes until the cauliflower is tender, slightly golden in spots, and any excess moisture has evaporated. Season with salt and pepper. Finish with fresh herbs, lemon juice, or any seasoning the dish calls for. Serve immediately.", timerSeconds: 300, mistakeWarning: "Cooked cauliflower rice continues releasing moisture as it sits. Serve immediately or it becomes soggy.", quickHack: "Toss with soy sauce and sesame oil for instant fried-rice flavor, or with cumin and lime for a Mexican-style bowl base.", cuisineFact: null, donenessCue: "Grains are fluffy, slightly golden, and dry — not steamed or wet. Tender but with a slight bite.", imageUrl: null },
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

  "hummus": {
    name: "Hummus",
    slug: "hummus",
    description:
      "Silky smooth chickpea dip blended with tahini, lemon, and garlic, drizzled with olive oil and paprika.",
    cuisineFamily: "middle-eastern",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["creamy", "nutty", "savory"],
    temperature: "room-temp",
    ingredients: [
      {
        id: "hm-1",
        name: "Canned chickpeas",
        quantity: "1 can (400g), drained",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hm-2",
        name: "Tahini",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hm-3",
        name: "Lemon",
        quantity: "1 large, juiced",
        isOptional: false,
        substitution: "2 tbsp bottled lemon juice",
      },
      {
        id: "hm-4",
        name: "Garlic",
        quantity: "1-2 cloves",
        isOptional: false,
        substitution: "1/4 tsp garlic powder",
      },
      {
        id: "hm-5",
        name: "Olive oil",
        quantity: "2 tbsp, plus more to serve",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hm-6",
        name: "Ice water",
        quantity: "3-4 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hm-7",
        name: "Salt",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hm-8",
        name: "Paprika",
        quantity: "pinch, for serving",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Drain and rinse the chickpeas. For extra-smooth hummus, rub them between your hands and remove the thin skins — they slip right off. Discard the skins.",
        timerSeconds: null,
        mistakeWarning:
          "Don't skip peeling if you want restaurant-quality smoothness. Unpeeled hummus tastes fine but has a slightly grainy texture.",
        quickHack:
          "Buy pre-peeled chickpeas, or skip peeling entirely for a more rustic hummus — still delicious.",
        cuisineFact:
          "Hummus means 'chickpeas' in Arabic. The full name 'hummus bi tahini' means chickpeas with sesame paste — a dish traced back to 13th-century Egypt.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add tahini and lemon juice to a food processor. Blend for 1 minute until the tahini lightens in color and looks fluffy. This is the secret to silky hummus.",
        timerSeconds: 60,
        mistakeWarning:
          "Don't rush this step. Blending tahini alone first — before anything else — creates a creamier base.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The tahini mixture should be pale, thick, and look like whipped cream cheese.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add the chickpeas, garlic, olive oil, and salt. Blend for 2 minutes, scraping down the sides occasionally.",
        timerSeconds: 120,
        mistakeWarning: "Taste before adding all the garlic — raw garlic is powerful. Start with 1 clove.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "With the processor running, drizzle in the ice water 1 tablespoon at a time until the hummus reaches your desired consistency. Blend for another minute until completely smooth.",
        timerSeconds: 60,
        mistakeWarning:
          "Cold water (not warm) keeps the emulsion stable and makes the hummus lighter.",
        quickHack:
          "Add a pinch of cumin for a warm, earthy depth that elevates plain hummus instantly.",
        cuisineFact: null,
        donenessCue:
          "The hummus should be smooth, creamy, and hold its shape when scooped.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Taste and adjust: more lemon for brightness, more salt for depth, more tahini for nuttiness. Transfer to a bowl, make a well with the back of a spoon, and drizzle with olive oil. Dust with paprika. Serve with warm pita.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Swirl in a spoonful of harissa or sprinkle with za'atar for an instant upgrade.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "kimchi": {
    name: "Kimchi",
    slug: "kimchi",
    description:
      "Fermented napa cabbage seasoned with Korean chili paste, garlic, ginger, and fish sauce — tangy, spicy, and crunchy.",
    cuisineFamily: "korean",
    prepTimeMinutes: 40,
    cookTimeMinutes: 0,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["spicy", "tangy", "fermented", "crunchy"],
    temperature: "cold",
    ingredients: [
      {
        id: "km-1",
        name: "Napa cabbage",
        quantity: "1 medium head (about 2kg)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "km-2",
        name: "Kosher salt",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "km-3",
        name: "Gochugaru (Korean red pepper flakes)",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "2 tbsp regular chili flakes (less spicy)",
      },
      {
        id: "km-4",
        name: "Garlic",
        quantity: "6 cloves, minced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "km-5",
        name: "Fresh ginger",
        quantity: "1 tbsp, grated",
        isOptional: false,
        substitution: null,
      },
      {
        id: "km-6",
        name: "Fish sauce",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Soy sauce (for vegan version)",
      },
      {
        id: "km-7",
        name: "Green onions",
        quantity: "4 stalks, cut into 1-inch pieces",
        isOptional: false,
        substitution: null,
      },
      {
        id: "km-8",
        name: "Daikon radish",
        quantity: "1/2 cup, julienned",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Quarter the cabbage lengthwise and cut into 2-inch pieces. Place in a large bowl. Sprinkle with salt and toss well, getting salt between every leaf. Let sit for 1-2 hours, turning every 30 minutes, until the cabbage wilts and releases water.",
        timerSeconds: 3600,
        mistakeWarning:
          "Don't skimp on the salting time. Under-salted cabbage won't ferment properly and stays limp instead of pleasantly crunchy.",
        quickHack:
          "Speed up salting by massaging the cabbage vigorously with your hands — reduces wilting time to 30-40 minutes.",
        cuisineFact:
          "Kimchi has been made in Korea for over 2,000 years. There are an estimated 250 varieties across the country, varying by region and season.",
        donenessCue:
          "The cabbage should bend easily without breaking and have released at least 1 cup of liquid.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Rinse the cabbage thoroughly under cold water 3 times to remove excess salt. Taste a piece — it should be pleasantly salty but not overwhelming. Squeeze out as much water as possible and set aside.",
        timerSeconds: null,
        mistakeWarning:
          "Under-rinsing leaves kimchi too salty. Over-rinsing washes away flavor. Three thorough rinses is the sweet spot.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Make the paste: In a bowl, mix gochugaru, minced garlic, grated ginger, and fish sauce until it forms a rough paste.",
        timerSeconds: null,
        mistakeWarning:
          "Wear gloves when handling gochugaru — the red pigment stains everything it touches.",
        quickHack:
          "Add 1 tsp sugar to the paste to help jump-start fermentation and balance the heat.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add the drained cabbage, green onions, and daikon (if using) to the paste. Using gloved hands, massage everything together until every piece of cabbage is coated bright red.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The cabbage should be uniformly red with no pale patches.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Pack the kimchi tightly into a clean glass jar or airtight container, pressing down firmly so the brine rises to cover the cabbage. Leave 1 inch of headspace. Seal and leave at room temperature for 1-2 days to ferment, then refrigerate.",
        timerSeconds: null,
        mistakeWarning:
          "Press out all air pockets when packing — exposure to air causes mold, not fermentation.",
        quickHack:
          "For same-day eating, skip the fermentation and serve as 'fresh kimchi' (geotjeori) — still delicious, just brighter and crunchier.",
        cuisineFact:
          "Kimchi fermentation is driven by lactic acid bacteria naturally present on cabbage leaves. The same process used to make yogurt and sourdough bread.",
        donenessCue:
          "After 1-2 days at room temperature, tiny bubbles will appear and the kimchi will smell pleasantly sour. It's ready.",
        imageUrl: null,
      },
    ],
  },

  "tom-yum-soup": {
    name: "Tom Yum Soup",
    slug: "tom-yum-soup",
    description:
      "Thailand's iconic hot and sour broth with lemongrass, kaffir lime leaves, galangal, mushrooms, and shrimp.",
    cuisineFamily: "thai",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["sour", "spicy", "aromatic", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "ty-1",
        name: "Chicken or shrimp stock",
        quantity: "4 cups",
        isOptional: false,
        substitution: "Water + 1 tsp fish sauce",
      },
      {
        id: "ty-2",
        name: "Lemongrass stalks",
        quantity: "2 stalks, bruised and cut into 2-inch pieces",
        isOptional: false,
        substitution: "2 tsp lemongrass paste",
      },
      {
        id: "ty-3",
        name: "Galangal",
        quantity: "4-5 thin slices",
        isOptional: false,
        substitution: "Fresh ginger (different flavor but works)",
      },
      {
        id: "ty-4",
        name: "Kaffir lime leaves",
        quantity: "4 leaves, torn",
        isOptional: false,
        substitution: "1 tsp lime zest",
      },
      {
        id: "ty-5",
        name: "Thai bird's eye chilies",
        quantity: "2-4, bruised",
        isOptional: false,
        substitution: "1/2 tsp chili flakes",
      },
      {
        id: "ty-6",
        name: "Mushrooms",
        quantity: "200g, sliced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ty-7",
        name: "Shrimp",
        quantity: "200g, peeled and deveined",
        isOptional: false,
        substitution: "Tofu or chicken breast strips",
      },
      {
        id: "ty-8",
        name: "Fish sauce",
        quantity: "2-3 tbsp",
        isOptional: false,
        substitution: "Soy sauce",
      },
      {
        id: "ty-9",
        name: "Lime juice",
        quantity: "3 tbsp (about 2 limes)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ty-10",
        name: "Fresh cilantro",
        quantity: "small handful, to serve",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Bruise the lemongrass by smashing it firmly with the flat of a knife — this releases the oils. Cut into 2-inch pieces. Slice the galangal. Tear the kaffir lime leaves in half. Bruise the chilies.",
        timerSeconds: null,
        mistakeWarning:
          "Don't cut lemongrass into tiny pieces — it's not meant to be eaten. Larger pieces are easy to fish out before serving.",
        quickHack:
          "Tom yum paste (sold in jars) can replace the aromatics in a pinch. Use 1-2 tbsp and skip steps 1-2.",
        cuisineFact:
          "Tom Yum is Thailand's most famous dish internationally. 'Tom' means 'to boil' and 'Yum' means 'mixed' or 'salad-like' — referring to the bold combination of flavors.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Bring stock to a boil in a medium saucepan. Add lemongrass, galangal, kaffir lime leaves, and chilies. Simmer for 5 minutes to infuse the broth with aromatics.",
        timerSeconds: 300,
        mistakeWarning:
          "Keep the heat at a gentle boil, not a rolling boil — aggressive boiling makes the broth cloudy and muddy-tasting.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The broth should smell intensely aromatic — citrusy, herbal, and spicy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add the sliced mushrooms and cook for 3 minutes. Then add the shrimp and cook just until they turn pink and curl, about 2-3 minutes.",
        timerSeconds: 180,
        mistakeWarning:
          "Don't overcook the shrimp — they go rubbery fast. Pull them the moment they turn fully pink.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Shrimp should be pink throughout and curled into a 'C' shape (not a tight 'O' which means overcooked).",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Remove from heat. Season with fish sauce and lime juice. Taste and balance: more fish sauce for saltiness, more lime for sourness, more chili for heat. Ladle into bowls and top with cilantro. Leave the lemongrass and galangal in — they add aroma but diners eat around them.",
        timerSeconds: null,
        mistakeWarning:
          "Always add lime juice off the heat — heat destroys its bright flavor and makes it bitter.",
        quickHack:
          "Stir in 1 tbsp coconut milk for Tom Kha Gai, the creamier cousin of Tom Yum.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "greek-salad": {
    name: "Greek Salad",
    slug: "greek-salad",
    description:
      "Chunky tomatoes, cucumber, red onion, Kalamata olives, and creamy feta dressed with olive oil and dried oregano.",
    cuisineFamily: "greek",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["fresh", "briny", "tangy", "savory"],
    temperature: "cold",
    ingredients: [
      {
        id: "gs-1",
        name: "Ripe tomatoes",
        quantity: "3 medium, cut into wedges",
        isOptional: false,
        substitution: "Cherry tomatoes, halved",
      },
      {
        id: "gs-2",
        name: "Cucumber",
        quantity: "1 large English cucumber",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gs-3",
        name: "Red onion",
        quantity: "1/2 small, thinly sliced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gs-4",
        name: "Kalamata olives",
        quantity: "1/2 cup, pitted",
        isOptional: false,
        substitution: "Any good quality black olives",
      },
      {
        id: "gs-5",
        name: "Feta cheese",
        quantity: "150g block",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gs-6",
        name: "Extra virgin olive oil",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "gs-7",
        name: "Dried oregano",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Fresh oregano",
      },
      {
        id: "gs-8",
        name: "Red wine vinegar",
        quantity: "1 tbsp",
        isOptional: true,
        substitution: "Lemon juice",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Cut tomatoes into large irregular wedges. Halve the cucumber lengthwise, then slice into thick half-moons. Slice the red onion as thin as possible.",
        timerSeconds: null,
        mistakeWarning:
          "Cut everything chunky — traditional Greek salad uses large pieces, not a fine chop. The rustic size is part of the dish's identity.",
        quickHack:
          "Soak sliced red onion in cold water for 5 minutes to tame the sharp bite while keeping the crunch.",
        cuisineFact:
          "In Greece, this dish is called 'Horiatiki' (village salad). It never contains lettuce — that's a Western modification. The authentic version is all about the chunky vegetables and the feta block.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Combine tomatoes, cucumber, and red onion in a large bowl. Add the Kalamata olives.",
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
          "Drizzle with olive oil and red wine vinegar. Season with salt and a generous pinch of dried oregano. Toss gently — you want to coat everything without breaking up the tomatoes.",
        timerSeconds: null,
        mistakeWarning:
          "Don't over-toss. The goal is coated vegetables, not a bruised mush. Two or three gentle folds is enough.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Place the block of feta on top — don't crumble it into the salad. Drizzle a little more olive oil directly over the feta and finish with a final pinch of oregano. Serve immediately.",
        timerSeconds: null,
        mistakeWarning:
          "Always add feta last, on top, as a whole slab or large chunks. Pre-crumbled feta turns the whole salad into a mushy mess.",
        quickHack:
          "Let the dressed salad sit for 5 minutes before serving — the tomatoes release juices that become part of the dressing.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "mac-and-cheese": {
    name: "Mac & Cheese",
    slug: "mac-and-cheese",
    description:
      "Creamy baked macaroni smothered in a sharp cheddar and gruyère cheese sauce with a golden breadcrumb topping.",
    cuisineFamily: "american",
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    skillLevel: "intermediate",
    heroImageUrl: null,
    flavorProfile: ["creamy", "rich", "savory", "cheesy"],
    temperature: "hot",
    ingredients: [
      {
        id: "mc-1",
        name: "Elbow macaroni",
        quantity: "300g",
        isOptional: false,
        substitution: "Any short pasta",
      },
      {
        id: "mc-2",
        name: "Butter",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mc-3",
        name: "All-purpose flour",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mc-4",
        name: "Whole milk",
        quantity: "2 cups",
        isOptional: false,
        substitution: "2% milk",
      },
      {
        id: "mc-5",
        name: "Sharp cheddar cheese",
        quantity: "200g, freshly grated",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mc-6",
        name: "Gruyère cheese",
        quantity: "100g, freshly grated",
        isOptional: true,
        substitution: "More cheddar",
      },
      {
        id: "mc-7",
        name: "Dijon mustard",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mc-8",
        name: "Breadcrumbs",
        quantity: "1/4 cup panko",
        isOptional: true,
        substitution: "Crushed crackers",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Cook the macaroni in well-salted boiling water until 2 minutes shy of al dente — it will finish cooking in the oven. Drain and set aside. Preheat oven to 375°F / 190°C.",
        timerSeconds: 480,
        mistakeWarning:
          "Undercook the pasta slightly — overcooked pasta becomes mushy after baking. It should still have a firm bite when you drain it.",
        quickHack:
          "Salt the pasta water generously — it should taste like mild seawater. This is the only chance to season the pasta itself.",
        cuisineFact:
          "Mac and cheese was popularized in the US by Thomas Jefferson, who encountered it in France and Italy and brought a pasta machine home to Monticello.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Make the béchamel: Melt butter in a large saucepan over medium heat. Add flour and whisk constantly for 1-2 minutes until it smells nutty and looks pale golden.",
        timerSeconds: 90,
        mistakeWarning:
          "Cook the flour long enough to remove the raw flour taste, but don't let it brown — golden is the limit.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The roux (butter + flour mixture) should bubble and smell faintly of cooked dough, not raw flour.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Gradually whisk in the milk, a splash at a time, until smooth. Switch to stirring with a wooden spoon and cook over medium heat, stirring constantly, until the sauce thickens enough to coat the back of the spoon — about 5-7 minutes.",
        timerSeconds: 420,
        mistakeWarning:
          "Add milk slowly at first — adding too much at once creates lumps that are hard to smooth out.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Run your finger across the back of the spoon — the line should hold without the sauce running through it.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Remove sauce from heat. Stir in Dijon mustard. Add the grated cheeses a handful at a time, stirring until fully melted before adding the next handful. Season with salt and pepper.",
        timerSeconds: null,
        mistakeWarning:
          "Always take the sauce off the heat before adding cheese — too much heat makes the proteins in cheese seize up, turning the sauce grainy.",
        quickHack:
          "Add a pinch of cayenne or smoked paprika for depth. It won't taste spicy, just more complex.",
        cuisineFact: null,
        donenessCue:
          "The sauce should be glossy, smooth, and thick — like a rich nacho cheese sauce.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Stir the drained pasta into the cheese sauce until coated. Pour into a buttered baking dish. If using, top with panko breadcrumbs mixed with a small knob of melted butter. Bake for 20-25 minutes until bubbling and the top is golden.",
        timerSeconds: 1500,
        mistakeWarning: null,
        quickHack:
          "Broil for the last 2 minutes to get the breadcrumb topping extra crispy.",
        cuisineFact: null,
        donenessCue:
          "The top should be golden and the edges bubbling. A skewer inserted in the center should come out hot.",
        imageUrl: null,
      },
    ],
  },

  "mashed-potatoes": {
    name: "Mashed Potatoes",
    slug: "mashed-potatoes",
    description:
      "Buttery, creamy mashed potatoes made with Yukon Gold potatoes, warm cream, and plenty of butter.",
    cuisineFamily: "american",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["creamy", "buttery", "savory", "comforting"],
    temperature: "hot",
    ingredients: [
      {
        id: "mp-1",
        name: "Yukon Gold potatoes",
        quantity: "1kg",
        isOptional: false,
        substitution: "Russet potatoes",
      },
      {
        id: "mp-2",
        name: "Butter",
        quantity: "6 tbsp (85g), cut into pieces",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mp-3",
        name: "Heavy cream or whole milk",
        quantity: "1/2 cup, warmed",
        isOptional: false,
        substitution: "Half-and-half",
      },
      {
        id: "mp-4",
        name: "Salt",
        quantity: "to taste",
        isOptional: false,
        substitution: null,
      },
      {
        id: "mp-5",
        name: "White pepper or black pepper",
        quantity: "pinch",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Peel the potatoes and cut into even 2-inch chunks. Place in a large pot, cover with cold salted water by 1 inch. Bring to a boil over high heat.",
        timerSeconds: null,
        mistakeWarning:
          "Start potatoes in cold water, not boiling — this ensures they cook through evenly from the outside in.",
        quickHack:
          "Yukon Gold potatoes have a natural buttery flavor and make creamier mash than russets without as much butter.",
        cuisineFact:
          "The French connection is real — the technique of making silky-smooth pommes purée was perfected by Joël Robuchon, who used a 1:1 ratio of potato to butter. The French take their mashed potatoes very seriously.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Once boiling, reduce to a steady simmer. Cook uncovered for 15-18 minutes until a fork slides into the potato with zero resistance.",
        timerSeconds: 1080,
        mistakeWarning:
          "Don't boil hard the entire time — rolling boil breaks the potatoes apart and makes them waterlogged.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "A fork should slide in and out of the center with absolutely no resistance.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Drain the potatoes thoroughly. Return them to the hot pot over low heat and let them steam-dry for 1-2 minutes, shaking the pot occasionally.",
        timerSeconds: 120,
        mistakeWarning:
          "Wet potatoes make watery mash. The steam-dry step is quick but important.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The potatoes should look dry and floury on the surface, with steam rising off them.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Rice the potatoes (preferred) or mash with a potato masher. Add the butter pieces and stir vigorously until melted and incorporated. Gradually add the warm cream, stirring between additions, until you reach your desired consistency. Season generously with salt.",
        timerSeconds: null,
        mistakeWarning:
          "Don't use a food processor or hand blender — over-worked potatoes release starch and become gluey. A masher or ricer only.",
        quickHack:
          "Warm your cream and butter before adding — cold dairy drops the potato temperature and makes the mash gluey.",
        cuisineFact: null,
        donenessCue:
          "Smooth, glossy, holds its shape when mounded but ripples easily with a spoon.",
        imageUrl: null,
      },
    ],
  },

  "coleslaw": {
    name: "Coleslaw",
    slug: "coleslaw",
    description:
      "Crisp shredded cabbage and carrot tossed in a creamy, tangy dressing — the essential BBQ and sandwich companion.",
    cuisineFamily: "american",
    prepTimeMinutes: 15,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["creamy", "tangy", "crunchy", "fresh"],
    temperature: "cold",
    ingredients: [
      {
        id: "cl-1",
        name: "Green cabbage",
        quantity: "1/2 medium head (about 500g)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cl-2",
        name: "Carrots",
        quantity: "2 medium, peeled",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cl-3",
        name: "Mayonnaise",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "Greek yogurt for a lighter version",
      },
      {
        id: "cl-4",
        name: "Apple cider vinegar",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "White wine vinegar",
      },
      {
        id: "cl-5",
        name: "Sugar",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Honey",
      },
      {
        id: "cl-6",
        name: "Dijon mustard",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cl-7",
        name: "Celery seeds",
        quantity: "1/2 tsp",
        isOptional: true,
        substitution: null,
      },
      {
        id: "cl-8",
        name: "Salt and pepper",
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
          "Remove the outer leaves from the cabbage. Quarter and core it. Slice as thin as possible with a sharp knife or mandoline — you want thin ribbons, not chunks. Grate the carrots on the large holes of a box grater.",
        timerSeconds: null,
        mistakeWarning:
          "Thick-cut cabbage stays harsh and tough. Thin slices wilt just enough into the dressing and taste much better.",
        quickHack:
          "Buy a pre-shredded coleslaw mix from the store — it saves 10 minutes and the result is identical.",
        cuisineFact:
          "The word 'coleslaw' comes from the Dutch 'koolsla' meaning 'cabbage salad.' Dutch settlers brought it to America in the 18th century where it became a BBQ staple.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Salt the shredded cabbage: toss with 1 tsp salt in a colander and let sit for 10 minutes. Then squeeze out as much liquid as possible with your hands.",
        timerSeconds: 600,
        mistakeWarning:
          "Skipping the salting step leads to watery coleslaw — the cabbage releases its liquid into the dressing and makes it thin.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The cabbage will have wilted slightly and released a visible amount of liquid.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Make the dressing: whisk together mayonnaise, apple cider vinegar, sugar, Dijon mustard, and celery seeds (if using). Season with salt and pepper. Taste — it should be creamy, tangy, and slightly sweet.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Add a tiny splash of pickle brine for an extra tangy kick that tastes surprisingly complex.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Combine the squeezed cabbage and grated carrot in a large bowl. Pour over the dressing and toss well until everything is coated. Taste and adjust seasoning. Refrigerate for at least 30 minutes before serving — this is non-negotiable for the best flavor.",
        timerSeconds: 1800,
        mistakeWarning:
          "Don't serve immediately — resting time lets the cabbage absorb the dressing and the flavors meld. Coleslaw made a day ahead is better than fresh.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "After resting, the coleslaw should look glossy and slightly wilted but still have plenty of crunch.",
        imageUrl: null,
      },
    ],
  },

  "cornbread": {
    name: "Cornbread",
    slug: "cornbread",
    description:
      "Golden skillet cornbread with a crispy crust, tender crumb, and a touch of honey — the classic Southern American side.",
    cuisineFamily: "american",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["savory", "slightly-sweet", "warm", "crumbly"],
    temperature: "hot",
    ingredients: [
      {
        id: "cb-1",
        name: "Yellow cornmeal",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cb-2",
        name: "All-purpose flour",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cb-3",
        name: "Baking powder",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cb-4",
        name: "Salt",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cb-5",
        name: "Buttermilk",
        quantity: "1 cup",
        isOptional: false,
        substitution: "1 cup milk + 1 tbsp vinegar, rested 5 minutes",
      },
      {
        id: "cb-6",
        name: "Eggs",
        quantity: "2 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "cb-7",
        name: "Honey",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Sugar",
      },
      {
        id: "cb-8",
        name: "Butter",
        quantity: "4 tbsp, melted",
        isOptional: false,
        substitution: "Vegetable oil",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Preheat oven to 425°F / 220°C. Place a 10-inch cast-iron skillet (or an 8-inch square baking pan) in the oven while it preheats — a screaming hot pan creates the crispy bottom crust.",
        timerSeconds: null,
        mistakeWarning:
          "Don't skip preheating the pan. A cold pan produces a pale, soft bottom. The hot pan sizzle when you pour in the batter is the signature of great skillet cornbread.",
        quickHack:
          "No cast iron? Use a regular baking dish — you'll lose the crispy bottom crust but the interior will still be great.",
        cuisineFact:
          "Cornbread is a staple of Native American cooking that predates European contact. Indigenous peoples across North America ground corn into meal and baked it on hot stones for thousands of years.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "In a large bowl, whisk together cornmeal, flour, baking powder, and salt. In a separate bowl, whisk together buttermilk, eggs, honey, and 3 tbsp of the melted butter.",
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
          "Pour the wet ingredients into the dry ingredients and stir with a spatula until just combined — a few lumps are fine. Don't overmix.",
        timerSeconds: null,
        mistakeWarning:
          "Overmixing develops gluten and makes cornbread dense and tough. Stop stirring the moment you don't see dry flour.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Carefully remove the hot skillet from the oven. Add the remaining 1 tbsp butter and swirl to coat the bottom and sides — it will sizzle. Immediately pour in the batter. Return to the oven.",
        timerSeconds: null,
        mistakeWarning:
          "Use oven mitts — the cast iron is very hot. Work quickly so the pan doesn't cool down before the batter goes in.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Bake for 18-22 minutes until the top is golden and a toothpick inserted in the center comes out clean. Let cool for 5 minutes before cutting into wedges or squares. Serve with honey butter.",
        timerSeconds: 1200,
        mistakeWarning: null,
        quickHack:
          "Honey butter: mix 2 tbsp softened butter with 1 tbsp honey. Spread on warm cornbread for a simple but transformative finish.",
        cuisineFact: null,
        donenessCue:
          "The top should be deep golden-brown and spring back when lightly pressed. The edges will have pulled slightly from the pan sides.",
        imageUrl: null,
      },
    ],
  },

  "steamed-broccoli": {
    name: "Steamed Broccoli",
    slug: "steamed-broccoli",
    description:
      "Tender-crisp broccoli florets steamed to bright green perfection and finished with lemon zest and flaky salt.",
    cuisineFamily: "american",
    prepTimeMinutes: 5,
    cookTimeMinutes: 7,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["fresh", "clean", "light", "vegetable"],
    temperature: "hot",
    ingredients: [
      {
        id: "sb-1",
        name: "Broccoli",
        quantity: "1 large head (about 500g)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "sb-2",
        name: "Lemon",
        quantity: "1/2, zested and juiced",
        isOptional: true,
        substitution: null,
      },
      {
        id: "sb-3",
        name: "Olive oil or butter",
        quantity: "1 tbsp",
        isOptional: true,
        substitution: null,
      },
      {
        id: "sb-4",
        name: "Flaky salt",
        quantity: "pinch",
        isOptional: false,
        substitution: "Regular salt",
      },
      {
        id: "sb-5",
        name: "Garlic",
        quantity: "1 clove, minced (optional)",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Cut broccoli into florets of similar size — roughly 1.5 to 2 inches. Peel and slice the thick stalk into coins (it's delicious and people throw it away unnecessarily). Rinse under cold water.",
        timerSeconds: null,
        mistakeWarning:
          "Uneven floret sizes mean some will be overcooked while others are still raw. Take a moment to cut them to similar size.",
        quickHack:
          "Don't discard the broccoli stem — it tastes identical to the florets when peeled. More food, less waste.",
        cuisineFact:
          "Broccoli was cultivated by ancient Romans in southern Italy. The name comes from the Italian 'broccolo' meaning 'the flowering top of a cabbage.'",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add 1 inch of water to a pot and bring to a boil. Place a steamer basket inside. Add the broccoli florets and stems, cover tightly, and steam for 4-6 minutes.",
        timerSeconds: 360,
        mistakeWarning:
          "Steam with the lid on — lifting it repeatedly lets heat escape and doubles your cooking time.",
        quickHack:
          "No steamer basket? Place broccoli directly in 1/4 inch of water, cover, and cook the same way. It works.",
        cuisineFact: null,
        donenessCue:
          "The broccoli should be vibrant, bright green. A fork should slide in with gentle resistance — not mushy, not hard.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Transfer immediately to a plate or bowl. If finishing with garlic: quickly sauté the minced garlic in butter or olive oil for 30 seconds until fragrant, then drizzle over the broccoli. Finish with lemon zest, a squeeze of lemon juice, and a pinch of flaky salt.",
        timerSeconds: 30,
        mistakeWarning:
          "Don't rinse the broccoli with cold water after steaming — it stops the cooking but also washes away flavor. Just time it right and pull it off heat.",
        quickHack:
          "A pinch of red chili flakes and a splash of soy sauce turns plain steamed broccoli into something you'll actually crave.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "baked-beans": {
    name: "Baked Beans",
    slug: "baked-beans",
    description:
      "Slow-cooked navy beans in a smoky, sweet molasses and tomato sauce — a hearty American BBQ and breakfast classic.",
    cuisineFamily: "american",
    prepTimeMinutes: 10,
    cookTimeMinutes: 60,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["smoky", "sweet", "savory", "hearty"],
    temperature: "hot",
    ingredients: [
      {
        id: "bb-1",
        name: "Canned navy beans or white beans",
        quantity: "2 cans (800g total), drained",
        isOptional: false,
        substitution: "Pinto beans",
      },
      {
        id: "bb-2",
        name: "Bacon",
        quantity: "4 rashers, chopped",
        isOptional: true,
        substitution: "Smoked paprika (1 tsp) for vegetarian version",
      },
      {
        id: "bb-3",
        name: "Onion",
        quantity: "1 medium, finely diced",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-4",
        name: "Tomato paste",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-5",
        name: "Molasses",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Dark brown sugar",
      },
      {
        id: "bb-6",
        name: "Dijon mustard",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Yellow mustard",
      },
      {
        id: "bb-7",
        name: "Apple cider vinegar",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-8",
        name: "Worcestershire sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-9",
        name: "Chicken or vegetable stock",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "Water",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Preheat oven to 325°F / 160°C. In a Dutch oven or oven-safe pot, cook the bacon over medium heat until crispy and the fat has rendered, about 5 minutes. Remove the bacon and set aside, leaving the fat in the pot.",
        timerSeconds: 300,
        mistakeWarning:
          "Don't discard the bacon fat — it's the flavor base for everything else.",
        quickHack:
          "For a vegetarian version, skip the bacon and add 1 tsp smoked paprika with the onions for that smoky depth.",
        cuisineFact:
          "Baked beans have roots in Native American cooking — the Iroquois and other tribes cooked beans with maple syrup and bear fat in clay pots buried with hot coals. European settlers adopted the technique, switching to molasses and pork.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add the diced onion to the bacon fat and cook over medium heat until soft and translucent, about 5 minutes. Add the tomato paste and cook for 1 more minute, stirring constantly, until it darkens slightly.",
        timerSeconds: 360,
        mistakeWarning:
          "Cook the tomato paste until it deepens from bright red to brick red — this step caramelizes it and removes the tinny raw taste.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add molasses, Dijon mustard, apple cider vinegar, Worcestershire sauce, and stock. Stir to combine. Add the drained beans and the reserved bacon. Stir gently.",
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
          "Cover the pot and bake for 45 minutes. Remove the lid and bake for a further 15 minutes to thicken the sauce. Taste and adjust: more molasses for sweetness, more vinegar for tang, salt and pepper to taste.",
        timerSeconds: 3600,
        mistakeWarning:
          "Don't rush the baking time — slow oven cooking transforms the sauce from a thin liquid into a glossy, thick coating for the beans.",
        quickHack:
          "Short on time? Simmer on the stovetop with the lid off for 20-25 minutes, stirring frequently. Not quite the same depth but very close.",
        cuisineFact: null,
        donenessCue:
          "The sauce should be thick and glossy, coating the beans heavily. It will thicken further as it cools.",
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
