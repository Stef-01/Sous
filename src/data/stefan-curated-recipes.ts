/**
 * Stefan-curated guided-cook flows — real recipes hand-selected by the founder
 * from reputable sources (Simply Scratch), transcribed faithfully and tagged
 * `stefan` via STEFAN_CURATED_SLUGS in dish-source. Each step carries a real
 * photo from the source export under public/food_images/<slug>/step-N.jpg.
 *
 * Sources:
 *   - honey-glazed-salmon-mango-salsa — simplyscratch.com (Laurie McNamara)
 *   - cheesy-beef-enchiladas-verde     — simplyscratch.com (Laurie McNamara)
 *   - air-fryer-edamame                — simplyscratch.com (Laurie McNamara)
 *   - turmeric-crush-smoothie          — cleanprogram.com (Erewhon dupe)
 *   - coconut-cloud-smoothie           — cleanprogram.com (Erewhon dupe)
 *
 * Step→image mapping for the two manifest-backed exports (salmon, edamame) is
 * exact (roles in image-manifest.csv); for the enchiladas it follows the
 * shoot's capture order (DSC sequence ≈ process order), so it's a close
 * best-effort rather than a labelled mapping. The two smoothie exports ship as
 * generic "unnamed (n).jpg" with NO manifest and NO capture order, so each
 * photo was mapped to its step by VISUAL INSPECTION of the contents (mise →
 * process → finished) per SOP §2; the instruction prose is original, written
 * from the published ingredient list + method (facts only).
 */
import type { StaticDishData } from "./guided-cook-steps";

export const STEFAN_MEAL_FLOWS: Record<string, StaticDishData> = {
  "honey-glazed-salmon-mango-salsa": {
    name: "Honey Glazed Salmon with Mango Salsa",
    slug: "honey-glazed-salmon-mango-salsa",
    description:
      "Seasoned salmon brushed with a quick honey–sriracha glaze and broiled until it flakes, finished with a bright, fresh mango salsa. A fast weeknight main over any rice you like.",
    cuisineFamily: "american",
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/honey-glazed-salmon-mango-salsa/hero.jpg",
    flavorProfile: ["sweet", "savory", "fresh", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "hgs-mango",
        name: "Ripe mangos, diced",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hgs-redonion",
        name: "Red onion, finely diced",
        quantity: "1/2 medium",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hgs-cilantro",
        name: "Cilantro, finely chopped",
        quantity: "1/3 cup",
        isOptional: false,
        substitution: "Flat-leaf parsley if cilantro tastes soapy to you",
      },
      {
        id: "hgs-jalapeno",
        name: "Jalapeño, finely diced",
        quantity: "1 medium",
        isOptional: false,
        substitution: "Remove seeds and ribs for less heat",
      },
      {
        id: "hgs-lime",
        name: "Lime, juiced",
        quantity: "1/2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hgs-honey",
        name: "Honey",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hgs-tamari",
        name: "Low-sodium tamari",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Low-sodium soy sauce",
      },
      {
        id: "hgs-oil",
        name: "Avocado oil",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Extra-light olive oil",
      },
      {
        id: "hgs-sriracha",
        name: "Sriracha",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "More or less to taste",
      },
      {
        id: "hgs-salmon",
        name: "Salmon fillets",
        quantity: "1 lb",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hgs-season",
        name: "Garlic powder, onion powder & white pepper",
        quantity: "to taste",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hgs-spray",
        name: "Nonstick spray",
        quantity: "as needed",
        isOptional: false,
        substitution: null,
      },
      {
        id: "hgs-salt",
        name: "Kosher salt",
        quantity: "1 pinch",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Make the salsa first so it can sit. In a bowl, combine the diced mango, red onion, cilantro, jalapeño, a pinch of salt and the lime juice. Toss well and set aside.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Letting the salsa rest 10 minutes lets the lime and onion mellow and the juices come out.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/honey-glazed-salmon-mango-salsa/step-1.jpg",
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Position an oven rack in the highest position and preheat the broiler to high. Line a rimmed baking sheet with foil and lightly coat with nonstick spray.",
        timerSeconds: null,
        mistakeWarning:
          "Broilers run hot and fast — get everything ready before the salmon goes in so you can watch it the whole time.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "In a small bowl, whisk together the honey, tamari, avocado oil and sriracha until smooth.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Warm the honey for a few seconds if it's stiff — it whisks into a pourable glaze much faster.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/honey-glazed-salmon-mango-salsa/step-3.jpg",
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Place the salmon skin-side down on the prepared pan. Sprinkle with onion powder, garlic powder and white pepper, then lightly spray. Broil for 5 minutes.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The surface should turn opaque at the edges and just begin to brown.",
        imageUrl: "/food_images/honey-glazed-salmon-mango-salsa/step-4.jpg",
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Pull the pan out, brush the salmon with half of the glaze, and return it to the broiler for another 2 to 3 minutes. Watch closely so the honey doesn't scorch.",
        timerSeconds: 180,
        mistakeWarning:
          "Don't walk away — the sugar in the glaze can go from caramelized to burnt in under a minute under a broiler.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/honey-glazed-salmon-mango-salsa/step-5.jpg",
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Remove and brush with the remaining glaze. The salmon is done when it's opaque through and flakes easily with a fork.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Flakes easily and is opaque all the way through; an instant-read thermometer reads about 125–130°F for medium.",
        imageUrl: "/food_images/honey-glazed-salmon-mango-salsa/step-6.jpg",
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Spoon the fresh mango salsa over the salmon and serve, ideally over rice with extra lime wedges.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/honey-glazed-salmon-mango-salsa/step-7.jpg",
      },
    ],
  },

  "cheesy-beef-enchiladas-verde": {
    name: "Cheesy Beef Enchiladas Verde",
    slug: "cheesy-beef-enchiladas-verde",
    description:
      "Seasoned ground beef tossed in a creamy salsa-verde sauce, rolled into flour tortillas, smothered in more sauce and Monterey Jack, and baked until melty and golden.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 40,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/cheesy-beef-enchiladas-verde/hero.jpg",
    flavorProfile: ["savory", "creamy", "tangy", "cheesy"],
    temperature: "hot",
    ingredients: [
      {
        id: "env-beef",
        name: "Ground beef",
        quantity: "1 lb",
        isOptional: false,
        substitution: "Ground chicken or turkey",
      },
      {
        id: "env-cumin",
        name: "Ground cumin",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-chipotle",
        name: "Chipotle powder",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-salt",
        name: "Kosher salt",
        quantity: "3/4 tsp + a pinch",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-oil",
        name: "Olive oil",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-onion",
        name: "Yellow onion, diced",
        quantity: "1 medium (about 1 cup)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-jalapeno",
        name: "Jalapeño, diced",
        quantity: "1 medium",
        isOptional: false,
        substitution: "Seeds and ribs removed for less heat",
      },
      {
        id: "env-garlic",
        name: "Garlic, finely chopped",
        quantity: "3 cloves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-butter",
        name: "Unsalted butter",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-flour",
        name: "All-purpose flour",
        quantity: "2 1/2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-broth",
        name: "Low-sodium chicken broth",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-salsa",
        name: "Tomatillo salsa verde",
        quantity: "3/4 cup",
        isOptional: false,
        substitution: "Homemade or a good jarred roasted salsa verde",
      },
      {
        id: "env-sourcream",
        name: "Sour cream",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "Mexican crema or plain whole-milk Greek yogurt",
      },
      {
        id: "env-cilantro",
        name: "Cilantro, finely chopped",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-tortillas",
        name: "Flour tortillas, soft-taco size",
        quantity: "8",
        isOptional: false,
        substitution: null,
      },
      {
        id: "env-cheese",
        name: "Monterey Jack cheese, shredded",
        quantity: "8 oz",
        isOptional: false,
        substitution: "Pepper Jack for more heat",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Preheat your oven to 400°F (200°C). Lightly spray a 9×13 baking pan with nonstick spray.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/cheesy-beef-enchiladas-verde/step-1.jpg",
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "In a large skillet, cook the ground beef until browned and no longer pink. Drain the fat, then season with the cumin, chipotle powder and a pinch of salt. Transfer to a bowl and set aside.",
        timerSeconds: null,
        mistakeWarning:
          "Drain the fat before seasoning, or the spices slide off and the filling turns greasy.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "No pink remains and the beef is just starting to brown in spots.",
        imageUrl: "/food_images/cheesy-beef-enchiladas-verde/step-2.jpg",
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "In the same skillet, add the olive oil, onion, jalapeño and garlic with a pinch of salt. Cook until soft and the onion is translucent.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Cooking the aromatics in the beef pan lifts all the browned bits into the sauce.",
        cuisineFact: null,
        donenessCue: "Onion is translucent and the jalapeño has softened.",
        imageUrl: "/food_images/cheesy-beef-enchiladas-verde/step-3.jpg",
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Stir in the butter until melted, sprinkle in the flour and cook 2 minutes. Pour in the chicken broth, stirring until thickened. Off the heat, stir in the salsa verde, sour cream and cilantro. Taste and season with salt.",
        timerSeconds: 120,
        mistakeWarning:
          "Add the sour cream off the heat — boiling it can make the sauce grainy.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "The sauce coats the back of a spoon.",
        imageUrl: "/food_images/cheesy-beef-enchiladas-verde/step-4.jpg",
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Stir 1 cup of the sauce and 1/2 cup of the cheese into the beef. Spread 1/2 cup of plain sauce across the bottom of the prepared pan.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/cheesy-beef-enchiladas-verde/step-5.jpg",
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Spoon a few tablespoons of the beef onto one side of a tortilla, roll it up, and place it seam-side down in the pan. Repeat with the remaining tortillas and filling.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Seam-side down keeps the enchiladas from unrolling as they bake.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/cheesy-beef-enchiladas-verde/step-6.jpg",
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Pour the remaining sauce over the rolled enchiladas and top with the rest of the Monterey Jack. Bake 12 to 20 minutes, rotating halfway, until the cheese is melted and golden and the edges are crisp. Broil 1–2 minutes for extra-crispy edges if you like.",
        timerSeconds: 1200,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Cheese is lightly golden-brown and the tortilla edges are crisp.",
        imageUrl: "/food_images/cheesy-beef-enchiladas-verde/step-7.jpg",
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Let cool 10 minutes, then serve with your favorite toppings — sliced avocado, pickled red onion, extra cilantro, a drizzle of crema.",
        timerSeconds: 600,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/cheesy-beef-enchiladas-verde/step-8.jpg",
      },
    ],
  },
};

export const STEFAN_SIDE_FLOWS: Record<string, StaticDishData> = {
  "air-fryer-edamame": {
    name: "Air Fryer Edamame",
    slug: "air-fryer-edamame",
    description:
      "Frozen edamame tossed with toasted sesame oil, soy and garlic, then air-fried until the edges are golden. A fast, high-fiber, complete-protein snack or side.",
    cuisineFamily: "japanese",
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/air-fryer-edamame/hero.jpg",
    flavorProfile: ["savory", "nutty", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "afe-edamame",
        name: "Frozen edamame (in pods or shelled)",
        quantity: "20 oz",
        isOptional: false,
        substitution: null,
      },
      {
        id: "afe-sesame",
        name: "Toasted sesame oil",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "afe-soy",
        name: "Low-sodium soy sauce",
        quantity: "2 tsp",
        isOptional: false,
        substitution: "Low-sodium tamari",
      },
      {
        id: "afe-garlic",
        name: "Garlic powder",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "afe-salt",
        name: "Fine salt",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "afe-flaky",
        name: "Coarse flaky salt, for garnish",
        quantity: "to taste",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Preheat your air fryer to 390°F (190°C).",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "A hot basket from the start is what gives the pods their blistered, golden edges.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/air-fryer-edamame/step-1.jpg",
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add the frozen edamame to a bowl. Pour over the sesame oil and soy sauce, season with garlic powder and fine salt, and toss well to coat.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "No need to thaw — frozen edamame goes straight into the toss.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/air-fryer-edamame/step-2.jpg",
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add the edamame to the preheated basket and air-fry 8 to 10 minutes, shaking or tossing the basket halfway through, until heated through and the edges are golden brown.",
        timerSeconds: 540,
        mistakeWarning:
          "Shake the basket halfway, or the pods touching the basket char while the rest stay pale.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Heated through with golden, blistered edges.",
        imageUrl: "/food_images/air-fryer-edamame/step-3.jpg",
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Transfer to a bowl or platter, sprinkle with coarse flaky salt, and serve warm.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Salted edamame in the pod is the classic Japanese izakaya snack — squeeze the beans straight from the pod into your mouth.",
        donenessCue: null,
        imageUrl: "/food_images/air-fryer-edamame/step-4.jpg",
      },
    ],
  },

  "turmeric-crush-smoothie": {
    name: "Turmeric Crush Smoothie",
    slug: "turmeric-crush-smoothie",
    description:
      "A bright, golden blend of mango, pineapple, carrot and fresh turmeric poured over a ribbon of beet juice — an at-home copy of Erewhon's Turmeric Crush, for a fraction of the price.",
    cuisineFamily: "american",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/turmeric-crush-smoothie/hero.jpg",
    flavorProfile: ["sweet", "tangy", "earthy", "fresh"],
    temperature: "cold",
    ingredients: [
      {
        id: "tcs-mango",
        name: "Frozen mango",
        quantity: "3/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tcs-pineapple",
        name: "Fresh pineapple",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "Frozen pineapple works too",
      },
      {
        id: "tcs-carrot",
        name: "Carrot, roughly chopped",
        quantity: "1 large",
        isOptional: false,
        substitution: "2 tbsp carrot juice",
      },
      {
        id: "tcs-lemon",
        name: "Lemon juice",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tcs-ginger",
        name: "Fresh ginger",
        quantity: "1 inch knob",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tcs-turmeric",
        name: "Ground turmeric",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "1 inch fresh turmeric root",
      },
      {
        id: "tcs-pepper",
        name: "Black pepper",
        quantity: "small pinch",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tcs-protein",
        name: "Vanilla protein shake mix",
        quantity: "1 scoop",
        isOptional: true,
        substitution: "Any vanilla plant protein, or leave out",
      },
      {
        id: "tcs-ice",
        name: "Ice",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tcs-beet",
        name: "Beet juice, for the swirl",
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
          "Set everything out: the frozen mango, pineapple, carrot, lemon juice, ginger, turmeric, pepper, your scoop of protein and the ice. Keep the beet juice separate — it goes in last, straight into the glass.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "A pinch of black pepper is the traditional partner to turmeric — tiny, but worth adding.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/turmeric-crush-smoothie/step-1.jpg",
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add the chopped carrot, mango, pineapple, lemon juice, ginger, turmeric, pepper, protein scoop and ice to the blender.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Put the softer fruit and liquid near the blades and the ice on top so everything pulls down evenly.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/turmeric-crush-smoothie/step-2.jpg",
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Blend on high until completely smooth and pourable, about 45 to 60 seconds. Add a splash of water if your blender struggles.",
        timerSeconds: 60,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "No fruit chunks remain — the smoothie is an even, thick orange and pours in a smooth ribbon.",
        imageUrl: "/food_images/turmeric-crush-smoothie/step-3.jpg",
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Pour the beet juice into a serving glass, then tip and turn the glass so the juice streaks up the sides for that two-tone Erewhon look.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Chill the glass first so the beet juice clings to the sides instead of sliding straight back down.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/turmeric-crush-smoothie/step-4.jpg",
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Pour the smoothie gently into the centre of the glass so the beet streaks stay put, and drink it straight away while it's cold and thick.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Erewhon's grab-and-go smoothies run $17–20 a cup — this one costs a few dollars to make at home.",
        donenessCue: null,
        imageUrl: "/food_images/turmeric-crush-smoothie/step-5.jpg",
      },
    ],
  },

  "coconut-cloud-smoothie": {
    name: "Coconut Cloud Smoothie",
    slug: "coconut-cloud-smoothie",
    description:
      "A dreamy pineapple-and-coconut smoothie marbled with blue spirulina and crowned with whipped coconut cream — a plant-based copy of Erewhon's blue Coconut Cloud.",
    cuisineFamily: "american",
    prepTimeMinutes: 15,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/coconut-cloud-smoothie/hero.jpg",
    flavorProfile: ["sweet", "creamy", "tropical", "nutty"],
    temperature: "cold",
    ingredients: [
      {
        id: "ccs-pineapple",
        name: "Pineapple",
        quantity: "1 cup",
        isOptional: false,
        substitution: "Frozen for a thicker, colder blend",
      },
      {
        id: "ccs-almondmilk",
        name: "Unsweetened almond milk",
        quantity: "3/4 cup",
        isOptional: false,
        substitution: "Any unsweetened plant milk",
      },
      {
        id: "ccs-coconutcream",
        name: "Canned coconut cream, chilled overnight",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "The firm top of a chilled can of full-fat coconut milk",
      },
      {
        id: "ccs-almondbutter",
        name: "Almond butter",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Cashew butter",
      },
      {
        id: "ccs-avocado",
        name: "Avocado",
        quantity: "1/4 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "ccs-protein",
        name: "Vanilla protein shake mix",
        quantity: "1 scoop",
        isOptional: true,
        substitution: "Any vanilla plant protein, or leave out",
      },
      {
        id: "ccs-spirulina",
        name: "Blue spirulina, plus extra to sprinkle",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Chill the can of coconut cream overnight so the firm cream sets above the watery liquid. When you're ready to blend, set out the pineapple, almond milk, almond butter, avocado, protein scoop and blue spirulina.",
        timerSeconds: null,
        mistakeWarning:
          "Skip the overnight chill and the cream won't whip — it stays runny and won't cling to the glass.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/coconut-cloud-smoothie/step-1.jpg",
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Open the chilled can without shaking it and scoop just the solid white cream off the top into a bowl, leaving the thin liquid behind.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Save the leftover coconut water from the can to loosen the smoothie later if it's too thick.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/coconut-cloud-smoothie/step-2.jpg",
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Whisk the coconut cream until it's light and fluffy, like soft whipped cream. Set most of it aside for lining and topping the glass — you'll blend in just a spoonful.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: "The cream holds soft peaks and looks glossy and smooth.",
        imageUrl: "/food_images/coconut-cloud-smoothie/step-3.jpg",
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add the pineapple, almond milk, almond butter, avocado, protein scoop, blue spirulina and one tablespoon of the whipped cream to the blender, and blend until completely smooth.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Start with a teaspoon of spirulina and add more — it's intensely coloured and a little goes a long way.",
        cuisineFact: null,
        donenessCue:
          "An even, pale-blue, creamy pour with no avocado or pineapple bits left.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Spoon a couple of tablespoons of the whipped coconut cream into the bottom of a tall glass and smear it up the inside walls with the back of a spoon.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/coconut-cloud-smoothie/step-5.jpg",
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Dust a little extra blue spirulina over the cream, then pour the smoothie slowly down the middle so it streaks through the cream as it fills the glass.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Pour slowly against the back of a spoon to keep the blue marbling crisp.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: "/food_images/coconut-cloud-smoothie/step-6.jpg",
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Finish with a last spoonful of whipped coconut cream on top and a pinch of spirulina, add a straw, and drink it cold.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "The blue comes from spirulina extract — the same pigment Erewhon uses to give the Coconut Cloud its sky-blue swirl.",
        donenessCue: null,
        imageUrl: "/food_images/coconut-cloud-smoothie/step-7.jpg",
      },
    ],
  },
};
