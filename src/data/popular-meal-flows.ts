/**
 * Popular-meal guided-cook flows — W5-6 coverage growth (20-week plan).
 *
 * High-traffic catalog mains that lacked a Mission→Grab→Cook→Win flow. Each is
 * authored from the established canonical technique for the dish, grounded in
 * reputable references (rule 7 — existing catalog dishes only; steps sourced,
 * not invented; no new images). Spread into guidedCookMeals.
 *
 * Sources (technique grounding):
 *   - pasta-carbonara      — Roman 4-ingredient method (no cream): RecipeTin Eats,
 *                            GialloZafferano, Recipes from Italy.
 *   - chicken-tikka-masala — yogurt-marinade + char + onion-tomato masala:
 *                            Swasthi's Recipes, Ministry of Curry, Cafe Delites.
 *   - beef-burger          — smash method on a screaming-hot surface: Natasha's
 *                            Kitchen, Baking Steel, Andy Cooks.
 */
import type { StaticDishData } from "./guided-cook-steps";

export const POPULAR_MEAL_FLOWS: Record<string, StaticDishData> = {
  "pasta-carbonara": {
    name: "Pasta Carbonara",
    slug: "pasta-carbonara",
    description:
      "Silky al dente spaghetti coated in a luscious emulsion of egg yolks, Pecorino Romano, and crispy guanciale, finished with a generous crack of black pepper.",
    cuisineFamily: "italian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/pasta_carbonara.png",
    flavorProfile: ["savory", "rich", "peppery"],
    temperature: "hot",
    ingredients: [
      {
        id: "pc-1",
        name: "Spaghetti",
        quantity: "320 g (about 12 oz)",
        isOptional: false,
        substitution: "Rigatoni or bucatini",
      },
      {
        id: "pc-2",
        name: "Guanciale",
        quantity: "150 g, cut into 1 cm lardons",
        isOptional: false,
        substitution: "Pancetta (guanciale is traditional)",
      },
      {
        id: "pc-3",
        name: "Egg yolks",
        quantity: "4 yolks + 1 whole egg",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pc-4",
        name: "Pecorino Romano",
        quantity: "60 g, finely grated",
        isOptional: false,
        substitution: "Half Pecorino, half Parmigiano for a milder bite",
      },
      {
        id: "pc-5",
        name: "Black pepper",
        quantity: "1 tsp, freshly cracked",
        isOptional: false,
        substitution: null,
      },
      {
        id: "pc-6",
        name: "Salt",
        quantity: "for the pasta water",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Bring a large pot of water to a boil and salt it. Cut the guanciale into 1 cm lardons while you wait.",
        timerSeconds: null,
        mistakeWarning:
          "Go easy on the salt — guanciale and Pecorino are both very salty, so the water needs less than usual.",
        quickHack: null,
        cuisineFact:
          "Authentic Roman carbonara has just four ingredients beyond the pasta: guanciale, egg, Pecorino, and black pepper. No cream — ever.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add the guanciale to a COLD pan and render over medium-low heat, no oil needed, until the fat melts out and the pieces crisp.",
        timerSeconds: 480,
        mistakeWarning:
          "Start cold and go gentle — high heat won't render the fat properly and scorches the guanciale before it crisps.",
        quickHack:
          "Keep the rendered fat in the pan — it's pure flavor and helps the sauce coat the pasta.",
        cuisineFact: null,
        donenessCue:
          "The lardons should be deeply golden with translucent, crisp edges and a pool of clear rendered fat.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "In a bowl, whisk the egg yolks and whole egg with the grated Pecorino and a heavy crack of black pepper into a thick paste.",
        timerSeconds: null,
        mistakeWarning:
          "Resist adding cream. The egg, cheese, and a splash of pasta water ARE the sauce — cream makes it heavy and inauthentic.",
        quickHack: null,
        cuisineFact:
          "For every 100 g of pasta, use at least 30 g of Pecorino — that ratio is what carries the sauce.",
        donenessCue:
          "A thick, golden, spreadable paste with no loose egg white.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Cook the spaghetti to al dente. Just before draining, scoop out a full mug of the starchy pasta water.",
        timerSeconds: 540,
        mistakeWarning:
          "Don't forget the pasta water — that starchy liquid is the only thing that emulsifies the sauce. Drain over a mug if you have to.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Al dente: the strand is cooked through but still has a firm, springy bite at the center.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Take the guanciale pan OFF the heat. Add the drained hot pasta and toss in the fat, then pour in the egg mixture and toss fast, loosening with splashes of pasta water until glossy and creamy.",
        timerSeconds: null,
        mistakeWarning:
          "Off the heat — if the pan is too hot the egg scrambles. The residual warmth of the pasta is enough to cook the sauce to silky.",
        quickHack:
          "Nervous about scrambling? Toss in a metal bowl set over the warm (off-heat) pasta pot for gentle, controllable heat.",
        cuisineFact: null,
        donenessCue:
          "The sauce turns glossy and clings to every strand — creamy, never wet or clumpy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Plate immediately and finish with extra Pecorino and another crack of black pepper.",
        timerSeconds: null,
        mistakeWarning:
          "Serve it the moment it's done — carbonara stiffens as it cools and won't loosen back up.",
        quickHack: null,
        cuisineFact:
          "Carbonara rose to fame in mid-20th-century Rome; the name likely nods to 'carbone' (coal) — or the coal-black pepper.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "chicken-tikka-masala": {
    name: "Chicken Tikka Masala",
    slug: "chicken-tikka-masala",
    description:
      "Chunks of tandoori-spiced chicken bathed in a creamy, mildly spiced tomato and yogurt sauce with aromatic cumin, coriander, and a swirl of fresh cream.",
    cuisineFamily: "indian",
    prepTimeMinutes: 25,
    cookTimeMinutes: 35,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/chicken_tikka_masala.png",
    flavorProfile: ["warm", "creamy", "spiced"],
    temperature: "hot",
    ingredients: [
      {
        id: "ctm-1",
        name: "Boneless chicken thighs",
        quantity: "700 g, cut into bite-size pieces",
        isOptional: false,
        substitution: "Chicken breast (thighs stay juicier)",
      },
      {
        id: "ctm-2",
        name: "Thick Greek yogurt",
        quantity: "1 cup",
        isOptional: false,
        substitution: "Hung/strained plain yogurt",
      },
      {
        id: "ctm-3",
        name: "Ginger-garlic paste",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ctm-4",
        name: "Garam masala",
        quantity: "2 tsp (1 for marinade, 1 for sauce)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ctm-5",
        name: "Kashmiri chili powder",
        quantity: "2 tsp",
        isOptional: false,
        substitution: "Paprika for color + a pinch of cayenne for heat",
      },
      {
        id: "ctm-6",
        name: "Ground cumin + coriander",
        quantity: "1 tsp each",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ctm-7",
        name: "Onion",
        quantity: "1 large, finely chopped",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ctm-8",
        name: "Tomato puree",
        quantity: "1.5 cups (passata)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ctm-9",
        name: "Heavy cream",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "Coconut cream",
      },
      {
        id: "ctm-10",
        name: "Kasoori methi (dried fenugreek)",
        quantity: "1 tsp, crushed",
        isOptional: true,
        substitution: null,
      },
      {
        id: "ctm-11",
        name: "Butter or oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ctm-12",
        name: "Salt + lemon juice",
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
          "Marinate the chicken: mix the thick yogurt with ginger-garlic, lemon, 1 tsp garam masala, Kashmiri chili, cumin, coriander, and salt. Coat the chicken and rest at least 30 minutes (overnight is better).",
        timerSeconds: 1800,
        mistakeWarning:
          "Use THICK yogurt. A runny marinade slides off and drains into the pan, taking all the spice with it.",
        quickHack: null,
        cuisineFact:
          "The lactic acid in yogurt tenderizes the chicken while the fat carries the fat-soluble spice flavors into the meat.",
        donenessCue:
          "Every piece evenly coated in a thick marinade that clings.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Char the chicken: thread onto skewers or spread on a foil-lined tray and broil (or grill) on high until the edges blacken and the chicken is cooked through.",
        timerSeconds: 720,
        mistakeWarning:
          "You want char, not steam — keep the pieces spaced apart and the heat high, or they'll poach in their own juice.",
        quickHack:
          "No grill? A few minutes under a screaming-hot broiler gives you the same smoky tandoor-style edges.",
        cuisineFact: null,
        donenessCue:
          "Blackened, slightly charred edges; juices run clear; 74°C / 165°F at the center.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Build the masala base: melt butter in a pan, soften the onion until golden, add a little ginger-garlic, then the remaining ground spices and bloom them for 30 seconds.",
        timerSeconds: 360,
        mistakeWarning:
          "Bloom the spice powders in the hot fat — raw, un-toasted spice tastes dusty and flat.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Onions soft and deep gold; the kitchen turns intensely fragrant as the spices toast.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Pour in the tomato puree and simmer until it thickens, darkens, and the oil separates out to the edges.",
        timerSeconds: 480,
        mistakeWarning:
          "Wait for the oil to split from the masala — that's the visual cue that the raw tomato has fully cooked out.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "A thick, brick-red masala with a glossy ring of oil pooling around the edge of the pan.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Lower the heat and stir in the cream and crushed kasoori methi, then fold the charred chicken (and any resting juices) back in. Simmer gently to bring it together.",
        timerSeconds: 300,
        mistakeWarning:
          "Add the cream off a hard boil and keep the heat gentle — a rolling boil can split the sauce.",
        quickHack: null,
        cuisineFact:
          "The creamy tomato gravy is the British-Indian innovation that turned grilled chicken tikka into the global favorite tikka masala.",
        donenessCue:
          "A glossy, mild brick-orange sauce that coats the back of a spoon; chicken hot through.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Taste and adjust salt and lemon, then serve hot with basmati rice or naan.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "A final pinch of garam masala stirred in off the heat lifts the aroma right before serving.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },

  "beef-burger": {
    name: "Beef Burger",
    slug: "beef-burger",
    description:
      "A juicy, flame-grilled beef patty stacked with melted cheese, crisp lettuce, ripe tomato, and special sauce, all held together by a toasted brioche bun.",
    cuisineFamily: "american",
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/beef_burger.png",
    flavorProfile: ["savory", "juicy", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "bb-1",
        name: "Ground beef (80/20)",
        quantity: "500 g",
        isOptional: false,
        substitution: "85/15 works; leaner than that dries out",
      },
      {
        id: "bb-2",
        name: "Brioche buns",
        quantity: "4",
        isOptional: false,
        substitution: "Potato buns",
      },
      {
        id: "bb-3",
        name: "American cheese",
        quantity: "4 slices",
        isOptional: false,
        substitution: "Cheddar (American melts creamiest)",
      },
      {
        id: "bb-4",
        name: "Salt + black pepper",
        quantity: "to season",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-5",
        name: "Butter",
        quantity: "1 tbsp, for the buns",
        isOptional: false,
        substitution: null,
      },
      {
        id: "bb-6",
        name: "Toppings",
        quantity: "lettuce, tomato, onion, pickles, sauce",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Divide the beef into loose balls (about 110 g each). Don't season or compact them yet — just shape gently.",
        timerSeconds: null,
        mistakeWarning:
          "Handle the meat as little as possible. Overworking it packs the proteins tight and gives you a dense, bouncy patty.",
        quickHack: null,
        cuisineFact:
          "80/20 is the burger sweet spot — that 20% fat renders out and essentially fries the patty's crust in its own juices.",
        donenessCue: "Loose, craggy balls that just hold together.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Butter the cut sides of the buns and toast them on the griddle until golden. Set aside.",
        timerSeconds: 120,
        mistakeWarning: null,
        quickHack:
          "Toasting waterproofs the bun against the juices — the difference between a structured burger and a soggy one.",
        cuisineFact: null,
        donenessCue: "Cut sides golden and crisp.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Heat a cast-iron pan or griddle until ripping hot — around 500-550°F / smoking.",
        timerSeconds: 300,
        mistakeWarning:
          "It must be screaming hot. A cool pan steams the patty grey instead of searing a crust.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "A drop of water flicked on the surface skitters and vanishes instantly.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Place a ball on the hot surface and smash it flat to about 1/4 inch with a stiff spatula (a square of parchment stops sticking). Season with salt and pepper, then sear undisturbed.",
        timerSeconds: 75,
        mistakeWarning:
          "Smash ONCE, hard, in the first 30 seconds — smashing again later just squeezes the juices out onto the pan.",
        quickHack: null,
        cuisineFact:
          "The thin smash maximizes the Maillard reaction — all that deeply browned, lacy surface is where the flavor lives.",
        donenessCue:
          "Deep-brown, crispy, lacy edges form around the patty before you flip.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Flip once, lay a slice of cheese on top, and cook briefly to melt.",
        timerSeconds: 40,
        mistakeWarning:
          "Only flip once — every flip costs you crust. The second side just needs to set and melt the cheese.",
        quickHack:
          "Add a splash of water and cover with a lid for 10 seconds — the steam melts the cheese fast and evenly.",
        cuisineFact: null,
        donenessCue: "Cheese fully melted and draping over the edges.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Build on the toasted bun — sauce, patty, then your toppings — and serve immediately.",
        timerSeconds: null,
        mistakeWarning:
          "Serve right away while the patty is hot and the cheese is molten; a smash burger waits for no one.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
};
