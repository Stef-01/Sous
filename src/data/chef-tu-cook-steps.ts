/**
 * Chef Tu David Phu's guided-cook flows — authored from his real recipe
 * library (cheftu.com) in original wording, then adversarially verified for
 * accuracy + cookability (tu-pho-ga + tu-com-ga-hai-nam were repaired per the
 * review). Spread into guidedCookData (sides) + guidedCookMeals (meals).
 */
import type { StaticDishData } from "./guided-cook-steps";

export const CHEF_TU_SIDE_FLOWS: Record<string, StaticDishData> = {
  "tu-nuoc-cham": {
    name: "Nước Chấm (Seasoned Fish Sauce)",
    slug: "tu-nuoc-cham",
    description:
      "Chef Tu David Phu's everyday Vietnamese dipping sauce, where coconut water softens the funk of fish sauce into something bright, sweet, salty, and gently fiery.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 12,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tu_nuoc_cham.jpg",
    flavorProfile: ["savory", "bright", "sweet", "spicy"],
    temperature: "cold",
    ingredients: [
      {
        id: "tunuo-1",
        name: "coconut water",
        quantity: "1 cup",
        isOptional: false,
        substitution: "plain water plus an extra teaspoon of sugar",
      },
      {
        id: "tunuo-2",
        name: "fresh lemon juice",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "fresh lime juice",
      },
      {
        id: "tunuo-3",
        name: "fish sauce",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "any quality Vietnamese fish sauce (Tu uses Son brand)",
      },
      {
        id: "tunuo-4",
        name: "sugar",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "1/3 tsp stevia",
      },
      {
        id: "tunuo-5",
        name: "minced shallot",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "minced red onion",
      },
      {
        id: "tunuo-6",
        name: "minced garlic",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tunuo-7",
        name: "Thai chili, finely chopped",
        quantity: "2 tsp",
        isOptional: true,
        substitution: "serrano or red jalapeno for less heat",
      },
      {
        id: "tunuo-8",
        name: "sambal (fermented chili paste)",
        quantity: "2 tsp",
        isOptional: true,
        substitution: "sriracha for a milder, sweeter version",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Finely chop the Thai chili, then mince the garlic and shallot into small, even pieces. Scrape everything into a medium mixing bowl.",
        timerSeconds: null,
        mistakeWarning:
          "Mince the aromatics fine rather than leaving big chunks. Coarse garlic and chili float and turn the sauce harsh in spots instead of blending in evenly.",
        quickHack:
          "Smash the garlic cloves flat with the side of your knife first; the skins slip right off and the flesh minces in seconds.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Spoon the sambal in with the aromatics. Stir it through so the chopped chili, shallot, and garlic are coated in the paste.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Layering fresh Thai chili with fermented sambal builds two kinds of heat at once: the sharp, bright burn of the raw pepper and the deeper, rounded warmth that comes from fermentation.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Pour in the lemon juice and stir. Letting the acid hit the raw garlic and shallot first mellows their bite before the rest of the liquid goes in.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Roll the lemon firmly on the counter before cutting it to break the pulp and release more juice.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add the coconut water and pour in the fish sauce. Give it a gentle stir to bring the liquids together.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Coconut water is Tu's quiet trick here: its natural sweetness and minerals round off the saltiness of the fish sauce, so the finished dip tastes complex instead of sharp.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Add the sugar and stir until it fully dissolves and no grit remains at the bottom of the bowl.",
        timerSeconds: 60,
        mistakeWarning:
          "Don't rush past undissolved sugar. If you can still feel grains scraping the spoon, the sauce will taste flat and unevenly sweet.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The sauce is ready to taste when it runs clear and smooth off the spoon with no sugar settling underneath.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Taste and balance. It should land somewhere bright, salty, and lightly sweet all at once. Nudge with a splash more lemon for lift, a pinch of sugar to soften, or a little fish sauce for depth.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Taste it off a piece of lettuce or a bite of rice rather than straight from the spoon. Tasting it on the food it will dress tells you far more than tasting it neat.",
        cuisineFact:
          "Nuoc cham is the workhorse condiment on most Vietnamese tables, splashed over rice, spooned onto grilled meats, or used to dress noodle bowls and fresh rolls.",
        donenessCue:
          "You've nailed it when no single flavor jumps out first; salty, sour, sweet, and spicy should arrive together.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Let the sauce sit for a few minutes so the shallot and garlic infuse, then serve in small dipping bowls or use to dress your dish.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack:
          "Store leftovers in a sealed jar in the fridge for up to a week; the flavor deepens overnight as the aromatics steep.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-garlic-noodles": {
    name: "Mì Xào Tỏi (Vietnamese Garlic Noodles)",
    slug: "tu-garlic-noodles",
    description:
      "Chef Tu David Phu's restrained take on Vietnamese garlic noodles, where reserved pasta water and butter emulsify with minced garlic, fish sauce, and oyster sauce into a glossy, savory coating for springy noodles.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tu_garlic_noodles.jpg",
    flavorProfile: ["garlicky", "savory", "buttery", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "tugar-1",
        name: "Sun Noodle kaedama (fresh ramen-style noodles)",
        quantity: "20 oz",
        isOptional: false,
        substitution: "dried spaghetti, cooked to al dente",
      },
      {
        id: "tugar-2",
        name: "unsalted butter",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugar-3",
        name: "garlic, finely minced",
        quantity: "5 cloves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugar-4",
        name: "fish sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugar-5",
        name: "oyster sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "vegetarian mushroom oyster sauce",
      },
      {
        id: "tugar-6",
        name: "sugar",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "1/2 tsp monk fruit sweetener",
      },
      {
        id: "tugar-7",
        name: "chives or scallions, thinly sliced",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugar-8",
        name: "coarse ground black pepper",
        quantity: "1/2 tsp",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Bring a medium pot of water to a rolling boil. Keep it unsalted or only lightly salted, since the sauce carries plenty of seasoning on its own.",
        timerSeconds: null,
        mistakeWarning:
          "Don't heavily salt this water like you would for Italian pasta — fish sauce and oyster sauce will season the dish, and over-salted water leaves no room to balance.",
        quickHack: null,
        cuisineFact:
          "Garlic noodles were born in San Francisco's Vietnamese-American kitchens, most famously at Thanh Long, blending Vietnamese pantry staples with a French butter base.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Drop in the noodles and cook just until al dente, with a slight bite still in the center. Fresh noodles need only a few minutes.",
        timerSeconds: 240,
        mistakeWarning:
          "Pull them while still firm — they will finish cooking in the pan, and mushy noodles can't hold the glossy sauce.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The noodles should bend easily but spring back when bitten, not collapse.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Before draining, scoop out and reserve 1/2 cup of the starchy cooking water. Then drain the noodles and set them aside.",
        timerSeconds: null,
        mistakeWarning:
          "Reserve the water BEFORE you drain — this starchy liquid is the backbone of the emulsion, and there's no getting it back once it's down the sink.",
        quickHack:
          "Set a measuring cup right in the sink as a reminder so you don't dump the pot on autopilot.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Set a 10-inch skillet over medium heat and let it warm through for about five minutes so it heats evenly.",
        timerSeconds: 300,
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
          "Pour the reserved pasta water and minced garlic into the hot pan. Let it bubble and reduce until the liquid has cooked down by about half.",
        timerSeconds: null,
        mistakeWarning:
          "Gently poaching the garlic in the water first mellows its raw bite — don't rush it to a hard sear or it will turn bitter and harsh.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You'll know it's ready when the bubbling slows and the garlic smells sweet and fragrant rather than sharp.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Add the butter and stir briskly as it melts, whisking it into the reduced garlic water until the two come together.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Keep the pan moving and stir vigorously — agitation is what forces the butter and water to emulsify instead of splitting into a greasy puddle.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Stir in the sugar, fish sauce, and oyster sauce. Keep stirring until the sauce turns glossy, slightly thickened, and creamy-looking.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The sauce is ready when it coats the back of a spoon and looks silky rather than watery.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Add the drained noodles and fold them through the sauce, lifting and tossing so every strand gets coated, for about three minutes until heated through.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack:
          "Use tongs to lift and twirl the noodles rather than dragging them flat — folding from above coats them evenly without breaking them.",
        cuisineFact: null,
        donenessCue:
          "Every strand should glisten with sauce and there should be no loose liquid left pooling in the pan.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 9,
        instruction:
          "Cut the heat, season with the black pepper, and plate gently with tongs. Finish with a generous shower of sliced chives or scallions.",
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

export const CHEF_TU_MEAL_FLOWS: Record<string, StaticDishData> = {
  "tu-pho-ga": {
    name: "Phở Gà (Chicken Pho)",
    slug: "tu-pho-ga",
    description:
      "A clean, golden chicken pho where charred aromatics and a quick brine give Chef Tu's broth its clarity and depth, finished with a smoky ginger-scallion sauce.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 30,
    cookTimeMinutes: 150,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_pho_ga.jpg",
    flavorProfile: ["savory", "aromatic", "warming", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "tupho-1",
        name: "Whole chicken, fresh and preferably organic",
        quantity: "3.5 lbs",
        isOptional: false,
        substitution:
          "Bone-in chicken thighs and legs for a richer, more forgiving broth",
      },
      {
        id: "tupho-2",
        name: "Yellow onion",
        quantity: "1 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tupho-3",
        name: "Garlic",
        quantity: "1 whole head",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tupho-4",
        name: "Fresh ginger, unpeeled",
        quantity: "2 oz (a thumb-sized knob)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tupho-5",
        name: "Pho spice blend (star anise, cinnamon, coriander, clove, cardamom)",
        quantity: "1.5 tbsp",
        isOptional: false,
        substitution:
          "A muslin sachet of 3 star anise, 1 cinnamon stick, 1 tbsp coriander seed, 4 cloves, 2 cardamom pods",
      },
      {
        id: "tupho-6",
        name: "Granulated sugar",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Yellow rock sugar for a rounder sweetness",
      },
      {
        id: "tupho-7",
        name: "Kosher salt",
        quantity: "1 tsp (plus more for brining)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tupho-8",
        name: "Fish sauce",
        quantity: "4 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tupho-9",
        name: "Filtered water",
        quantity: "2 quarts",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tupho-10",
        name: "Chicken stock",
        quantity: "4 quarts",
        isOptional: false,
        substitution:
          "Additional filtered water with an extra tablespoon of fish sauce",
      },
      {
        id: "tupho-11",
        name: "Dried flat rice noodles (banh pho)",
        quantity: "14 oz",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tupho-12",
        name: "Scallions, sliced",
        quantity: "2 cups plus extra for garnish",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tupho-13",
        name: "Lap xuong (Chinese sausage) or applewood-smoked bacon, small diced",
        quantity: "1/4 cup",
        isOptional: true,
        substitution: "Skip for a leaner bowl",
      },
      {
        id: "tupho-14",
        name: "Avocado oil",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "Any neutral high-smoke-point oil",
      },
      {
        id: "tupho-15",
        name: "Rice vinegar",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tupho-16",
        name: "Cilantro leaves",
        quantity: "1/4 cup",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tupho-17",
        name: "Serrano chili, thinly sliced",
        quantity: "1",
        isOptional: true,
        substitution: "Thai bird chili for more heat, or omit",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Dissolve a generous handful of salt in a bowl of cold water and submerge the whole chicken for 15 to 20 minutes. While it brines, char the onion, the whole garlic head, and the unpeeled ginger directly under your broiler or over an open flame, turning every few minutes until each side is blackened and blistered.",
        timerSeconds: 1080,
        mistakeWarning:
          "Don't skip charring the aromatics. The blackened skin is exactly what gives pho broth its smoky backbone and amber color.",
        quickHack:
          "Leaving the ginger and garlic skins on protects the flesh and adds a deeper roasted note. Just rinse off any loose ash before they go in the pot.",
        cuisineFact:
          "Charring onion and ginger is a non-negotiable ritual in Vietnamese pho kitchens, prized for both aroma and the warm tint it lends the broth.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Rinse the brined chicken and lower it into a large stockpot. Pour in the 2 quarts of filtered water and the 4 quarts of chicken stock, then tuck in the charred onion, garlic, and ginger. Bring everything up to a bare simmer, never a rolling boil.",
        timerSeconds: null,
        mistakeWarning:
          "A hard boil emulsifies fat into the liquid and turns your broth cloudy. Keep it at a lazy, barely-bubbling simmer for a clear bowl.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You want only small bubbles breaking the surface here and there, not a churning pot.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Simmer the chicken gently for 40 minutes. As it cooks, skim away any gray foam and impurities that rise to the top with a ladle or fine spoon.",
        timerSeconds: 2400,
        mistakeWarning: null,
        quickHack:
          "Skim patiently and often in these early minutes. Every bit of scum you remove now is clarity you keep in the finished broth.",
        cuisineFact: null,
        donenessCue:
          "The chicken is cooked through when its juices run clear and the thickest part of the thigh reaches 165F.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Lift the chicken out and set it in a bowl of ice water to stop the cooking and firm up the meat. Once it is cool enough to handle, pull the meat off the bones in clean slices or shreds, and return the carcass to the pot to keep giving up flavor.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "The ice bath keeps the meat juicy and gives the skin that signature snap, while the bones going back in deepen the broth for free.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Stir the pho spice blend (tied in a sachet), sugar, 1 teaspoon of salt, and the fish sauce into the broth. After about 30 minutes, lift out the spice sachet so it doesn't turn the broth medicinal, then keep simmering to the 60-minute mark. Strain the broth through a fine-mesh sieve for a clean, clear bowl, then taste and adjust with more fish sauce or salt until it sings.",
        timerSeconds: 3600,
        mistakeWarning:
          "Add the whole spices late and pull them once the broth is fragrant. Over-steeping turns the spice harsh and medicinal.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The broth is ready when it tastes balanced between salty, sweet, and savory with a clean spice aroma rather than a sharp one.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Make the ginger-scallion sauce: warm the avocado oil in a small pan and crisp the diced sausage or bacon until its fat renders. Pour the hot oil and bits over the 2 cups of sliced scallions and minced ginger in a heatproof bowl, then stir in a splash of fish sauce, the rice vinegar, and a pinch of salt.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Pouring the screaming-hot oil straight onto the raw scallions and ginger blooms their aroma instantly. You'll hear it sizzle.",
        cuisineFact:
          "This smoky ginger-scallion relish is Chef Tu's signature twist, a nod to the Cantonese ginger-scallion oil that traveled into Vietnamese cooking.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Soak the dried rice noodles in hot water for about 10 minutes until pliable, then drop them into boiling water for just 2 to 3 minutes. Drain immediately and divide among serving bowls.",
        timerSeconds: 600,
        mistakeWarning:
          "Don't over-boil the noodles or they go gummy and break apart. They should still have a slight bite since the hot broth finishes them in the bowl.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Pull them the moment they turn fully translucent and slip easily apart.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Pile the sliced chicken over the noodles and ladle the steaming broth on top so it warms everything through. Finish each bowl with a spoonful of the ginger-scallion sauce, fresh scallions, cilantro, and sliced serrano. Serve at once.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Pho is traditionally eaten right away while it's volcano-hot, with garnishes added at the table so each person tunes their own bowl.",
        donenessCue:
          "Serve the moment the broth hits the bowl, while it's still steaming and aromatic.",
        imageUrl: null,
      },
    ],
  },
  "tu-banh-mi-trung-op-la": {
    name: "Bánh Mì Trứng Ốp La (Fried Egg Banh Mi)",
    slug: "tu-banh-mi-trung-op-la",
    description:
      "A fast Vietnamese street breakfast where crispy-edged fried eggs with runny yolks meet pâté, Kewpie mayo, tangy pickles, and cilantro on a toasted baguette.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tu_banh_mi_trung_op_la.jpg",
    flavorProfile: ["savory", "rich", "tangy", "herbaceous"],
    temperature: "hot",
    ingredients: [
      {
        id: "tuban-1",
        name: "banh mi rolls",
        quantity: "2 rolls",
        isOptional: false,
        substitution:
          "a light, thin-crusted Italian or French baguette cut into two lengths",
      },
      {
        id: "tuban-2",
        name: "large eggs",
        quantity: "4 eggs",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuban-3",
        name: "cooking oil",
        quantity: "4 tbsp",
        isOptional: false,
        substitution: "any neutral high-heat oil such as canola or vegetable",
      },
      {
        id: "tuban-4",
        name: "pâté de campagne",
        quantity: "4 oz",
        isOptional: false,
        substitution: "any smooth pork or chicken-liver pâté",
      },
      {
        id: "tuban-5",
        name: "Kewpie mayo",
        quantity: "2 tbsp",
        isOptional: false,
        substitution:
          "regular mayo loosened with a few drops of rice vinegar and a pinch of sugar",
      },
      {
        id: "tuban-6",
        name: "Maggi seasoning",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "light soy sauce with a tiny pinch of MSG or sugar",
      },
      {
        id: "tuban-7",
        name: "banh mi pickles (do chua, pickled carrot and daikon)",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuban-8",
        name: "Persian cucumber, sliced lengthwise into 4 thin spears",
        quantity: "1 cucumber",
        isOptional: false,
        substitution: "a few thin spears of English cucumber",
      },
      {
        id: "tuban-9",
        name: "fresh cilantro sprigs",
        quantity: "12 sprigs",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuban-10",
        name: "kosher salt",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuban-11",
        name: "ground black pepper",
        quantity: "1/8 tsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Set your oven to 400°F (200°C). While it heats, slice each banh mi roll along one long edge like a book, leaving the back hinge attached so it opens flat without breaking apart.",
        timerSeconds: null,
        mistakeWarning:
          "Don't cut all the way through — a hinged roll holds the fillings together and keeps the sandwich from falling open.",
        quickHack: null,
        cuisineFact:
          "The airy, shatter-crisp banh mi loaf is a Vietnamese reinvention of the French colonial baguette, made lighter with rice flour in the dough.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Open each roll and pull out some of the soft white crumb from both sides, leaving the crust as a shell. Place the rolls cut-side up directly on the oven rack and toast until the crust is crisp and lightly golden.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack:
          "Hollowing out the doughy center makes room for the fillings so nothing squeezes out when you bite in.",
        cuisineFact: null,
        donenessCue:
          "The bread is ready when the crust crackles under light pressure and the edges turn pale gold.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Pour the oil into a frying pan and set it over medium-high heat. Let it get properly hot — the oil should shimmer and a drop of egg white should sizzle on contact.",
        timerSeconds: 120,
        mistakeWarning:
          "A cool pan gives you soft, pale eggs. You want the oil hot enough to blister the whites the moment the egg lands.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The oil is ready when it shimmers and moves like water across the pan.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Crack the eggs into the hot oil and scatter the kosher salt over the whites. Spoon a little of the hot oil over any pale spots and fry without flipping until the edges turn lacy, brown, and crisp while the yolks stay loose.",
        timerSeconds: 150,
        mistakeWarning:
          "Resist the urge to flip — the whole point of ốp la is one crispy fried side with a runny yolk underneath.",
        quickHack:
          "Tilt the pan toward you and baste the tops of the whites with the pooled oil to set them faster without overcooking the yolk.",
        cuisineFact:
          '"Ốp la" comes from the French "au plat" — sunny-side-up eggs cooked flat in the pan.',
        donenessCue:
          "The edges should be deeply golden and frilly while the yolk still jiggles when you nudge the pan.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Lift the eggs out with a slotted spatula and rest them on a paper towel to shed the excess oil while you build the sandwiches.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Open each toasted roll. Spread 1 tablespoon Kewpie mayo down one inner side and 2 ounces of pâté down the other side, edge to edge.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Kewpie mayo gets its rounder, savory tang from rice vinegar and egg yolks, which is why it tastes deeper than Western mayonnaise.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Lay two fried eggs onto the mayo side of each roll, then hit the eggs with a pinch of black pepper and a drizzle of Maggi seasoning.",
        timerSeconds: null,
        mistakeWarning:
          "Go easy on the Maggi — it's intensely salty and umami, so a light drizzle is all the egg needs.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Layer the cucumber spears, pickled carrot and daikon, and cilantro sprigs over the pâté side. Press the roll gently closed and serve right away while the egg is still warm and the bread is crisp.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Eat it within a few minutes — the magic is the contrast of the hot crispy egg against the cold crunchy pickles and the runny yolk soaking into the toasted crust.",
        cuisineFact:
          "The bright pickles and fresh herbs are the balancing act of Vietnamese cooking: acid and freshness cutting through the rich egg and pâté.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-com-ga-hai-nam": {
    name: "Cơm Gà Hải Nam (Hainanese Chicken & Rice)",
    slug: "tu-com-ga-hai-nam",
    description:
      "Tu David Phu's take on Vietnamese Hainanese chicken and rice: a whole chicken gently poached until silky, then jasmine rice simmered in the gold-rich poaching broth, served with a bright ginger fish-sauce dip.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 25,
    cookTimeMinutes: 125,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_com_ga_hai_nam.jpg",
    flavorProfile: ["savory", "aromatic", "umami", "clean"],
    temperature: "warm",
    ingredients: [
      {
        id: "tucom-1",
        name: "whole chicken, preferably heritage breed",
        quantity: "3 lbs",
        isOptional: false,
        substitution: "a standard supermarket whole chicken works fine",
      },
      {
        id: "tucom-2",
        name: "chicken stock",
        quantity: "4 cups",
        isOptional: false,
        substitution: "good-quality store-bought low-sodium broth",
      },
      {
        id: "tucom-3",
        name: "filtered water",
        quantity: "4 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucom-4",
        name: "kosher salt",
        quantity: "2 tsp (plus 1 tsp for the rice)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucom-5",
        name: "fish sauce",
        quantity: "1/4 tsp (plus 1 tsp for the rice)",
        isOptional: false,
        substitution: "any good Vietnamese or Thai fish sauce",
      },
      {
        id: "tucom-6",
        name: "sugar",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucom-7",
        name: "jasmine rice",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucom-8",
        name: "ice for an ice bath",
        quantity: "about 4 quarts water plus ice",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucom-9",
        name: "ginger fish-sauce dip (nuoc mam gung)",
        quantity: "1 small bowl",
        isOptional: false,
        substitution:
          "stir together grated ginger, fish sauce, lime, sugar, and a little water",
      },
      {
        id: "tucom-10",
        name: "iceberg lettuce, mint, and sliced tomato",
        quantity: "to serve",
        isOptional: true,
        substitution: "sliced cucumber also works",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Slide a pair of wooden chopsticks lengthwise into the cavity of the chicken so it holds its shape, then nick the skin between the thigh and the tail on each side so the bird poaches evenly. Set it in a pot just large enough to hold it.",
        timerSeconds: null,
        mistakeWarning:
          "Skip a pot that's way too big — you want the liquid to cover the bird, not drown it in a gallon of broth.",
        quickHack: null,
        cuisineFact:
          "Hainanese chicken traveled with southern Chinese immigrants and was reinvented across Southeast Asia; the Vietnamese cơm gà version leans on fish sauce and a sharp ginger dip.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Pour in the 4 cups stock and 4 cups water so the chicken is just submerged, then add the 2 tsp salt, 1/4 tsp fish sauce, and 1/2 tsp sugar. Bring it up to a bare simmer over medium heat.",
        timerSeconds: null,
        mistakeWarning:
          "Never let it reach a rolling boil — hard boiling toughens the meat and turns the broth cloudy instead of clear.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You want lazy bubbles barely breaking the surface, not a churning pot.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Hold that gentle simmer for 15 minutes, then lift the whole chicken out and lower it straight into a big bowl of ice water for 10 minutes. Keep the pot of broth warm on the side.",
        timerSeconds: 900,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The skin tightens and goes glassy as it chills — that's the cold shock setting it up for a silky, jellied finish.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Return the chilled chicken to the broth and bring it back to a soft simmer. As it heats, skim the foam and spoon off the floating golden fat into a separate bowl — you'll want that fat for the rice — about 10 minutes.",
        timerSeconds: 600,
        mistakeWarning: null,
        quickHack:
          "Tilt the pot slightly so the fat pools on one side, making it far easier to skim cleanly.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Keep the chicken at a gentle simmer for about 35 more minutes, until the thickest part of the thigh reads 165°F on an instant-read thermometer. Then lift it onto a rack and let it rest at room temperature for 30 minutes.",
        timerSeconds: 2100,
        mistakeWarning:
          "Don't carve it hot off the heat — resting lets the juices settle so the meat stays moist when you slice.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Use a thermometer — 165°F at the thickest part of the thigh is the real tell.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "While the chicken rests, rinse the 2 cups jasmine rice under cold water, swishing and draining 3 to 4 times until the water runs nearly clear. This rinses off surface starch so the grains cook up separate, not gummy.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Keep changing the water until it goes from milky to mostly clear.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Strain any aromatics from the reserved broth, then measure 3 cups of that broth plus the skimmed chicken fat into a pot with the rinsed rice. Stir in 1 tsp salt and 1 tsp fish sauce.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Cooking the rice in the poaching broth instead of plain water is the whole soul of this dish — don't substitute water here.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Bring the rice to a simmer, then immediately drop the heat to low, give it one good stir, and clamp the lid on. Cook 15 minutes, stirring just once or twice and replacing the lid each time.",
        timerSeconds: 900,
        mistakeWarning:
          "Resist lifting the lid more than you must — every peek lets out the steam that's cooking the grains.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 9,
        instruction:
          "Pull the rice off the heat and leave it covered, undisturbed, for another 15 minutes to steam through. Meanwhile carve the rested chicken and plate it with the rice, the ginger fish-sauce dip, and a little lettuce, mint, and tomato.",
        timerSeconds: 900,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Fluff with a fork before serving — the grains should be tender, glossy, and fall apart cleanly.",
        imageUrl: null,
      },
    ],
  },
  "tu-ga-kho-gung": {
    name: "Gà Kho Gừng (Caramelized Ginger Chicken)",
    slug: "tu-ga-kho-gung",
    description:
      "Tu David Phu's Vietnamese braise simmers jointed chicken wings in a homemade coconut-water caramel with a mountain of ginger matchsticks until the sauce turns glossy, savory, and clings to every piece.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 45,
    cookTimeMinutes: 50,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_ga_kho_gung.jpg",
    flavorProfile: ["savory", "sweet", "aromatic", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "tugak-1",
        name: "chicken wings, cut through the joints into 3 sections",
        quantity: "2 lbs",
        isOptional: false,
        substitution: "bone-in drumsticks or thighs cut into chunks",
      },
      {
        id: "tugak-2",
        name: "fresh ginger, peeled and cut into matchsticks",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-3",
        name: "shallot, minced",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-4",
        name: "lemongrass, tender core only, minced",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-5",
        name: "garlic, minced",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-6",
        name: "makrut (kaffir) lime leaves",
        quantity: "2-3 leaves",
        isOptional: true,
        substitution: "a strip of lime zest",
      },
      {
        id: "tugak-7",
        name: "fish sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-8",
        name: "sugar (for marinade)",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-9",
        name: "kosher salt",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-10",
        name: "neutral cooking oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-11",
        name: "granulated sugar (for the coconut caramel / nuoc mau)",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-12",
        name: "coconut water",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-13",
        name: "lemon juice",
        quantity: "2 drops",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-14",
        name: "scallions, thinly sliced",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugak-15",
        name: "cilantro sprigs",
        quantity: "3-4 sprigs",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tugak-16",
        name: "Thai chili, chopped",
        quantity: "1",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tugak-17",
        name: "steamed jasmine rice, for serving",
        quantity: "4 servings",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Toss the jointed chicken wings with the fish sauce, garlic, the 2 tbsp marinade sugar, and the kosher salt in a large bowl until every piece is coated. Leave it on the counter to marinate while you set up everything else.",
        timerSeconds: 1800,
        mistakeWarning: null,
        quickHack:
          "Ask the butcher to split the wings at the joints for you, or use kitchen shears to cut through the soft joint cartilage yourself.",
        cuisineFact:
          "Gà kho gừng comes from the Vietnamese kho tradition of slow, salty-sweet braises that stretch humble cuts into deeply flavored, rice-friendly dishes.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Set a bowl of ice water in the sink. In a heavy stainless pot, combine the 2 cups granulated sugar, coconut water, and lemon juice. Place over medium heat and let it go without stirring.",
        timerSeconds: null,
        mistakeWarning:
          "Do not stir the caramel with a spoon or it can crystallize into a grainy mess. Tilt and swirl the pot by its handles only.",
        quickHack:
          "A light-colored stainless pot lets you read the caramel's true color far better than a dark nonstick pan.",
        cuisineFact:
          "This coconut caramel is nuoc mau, the burnt-sugar sauce that gives Vietnamese braises their mahogany color and bittersweet backbone.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Keep swirling the pot occasionally as the syrup dissolves, bubbles, and slowly deepens to a dark amber. When it reaches about 380°F on a candy thermometer, carefully perch the pot in the ice bath to halt the cooking, then set it aside.",
        timerSeconds: 780,
        mistakeWarning:
          "Molten caramel is dangerously hot and will keep darkening from residual heat. Pull it the moment it hits color and temperature, and keep your hands clear of any steam off the ice bath.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Ready when the caramel is a deep amber-mahogany and just starting to smell toasty, not acrid or smoky.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Heat a large thick-bottomed pot over medium for a few minutes, then add the cooking oil and let it warm until it shimmers and looks glossy. Stir in the minced shallot, lemongrass, and the lime leaves and cook just until fragrant.",
        timerSeconds: 60,
        mistakeWarning:
          "These aromatics scorch fast. Move straight to the next step once they smell perfumed rather than letting them brown.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The kitchen should fill with a citrusy lemongrass aroma within 30 to 60 seconds.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Spoon in about 2 tablespoons of your prepared nuoc mau, then add the marinated chicken and turn the pieces until they are slick and coated in the caramel-aromatic base.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "The remaining nuoc mau keeps for weeks in a sealed jar at room temperature, ready for your next batch of kho.",
        cuisineFact: null,
        donenessCue:
          "Each piece should take on a shiny, lightly bronzed coating before you move on.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Scatter in the full cup of ginger matchsticks and fold them through the chicken. Bring everything up to a gentle simmer, then cover the pot.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Slice the ginger across the grain into thin coins first, then stack and cut into matchsticks so they stay tender, not stringy.",
        cuisineFact:
          "The generous load of ginger is the whole point here, mellowing in the braise into something warming and almost sweet rather than sharp.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Simmer covered, stirring once or twice, until the chicken is cooked through and tender and the sauce has turned rich and savory.",
        timerSeconds: 1500,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Done when the meat pulls easily from the bone and the wing collagen has melted into a glossy, slightly sticky sauce.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Uncover and keep simmering to cook off excess liquid, basting the chicken now and then, until the sauce reduces to a clingy glaze that coats the pieces.",
        timerSeconds: 900,
        mistakeWarning:
          "Watch the pot closely near the end. A caramel-based sauce can go from glossy to scorched quickly once most of the liquid is gone.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Ready when the sauce is thick enough to coat a spoon and pools just a little around the chicken.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 9,
        instruction:
          "Pile the braised chicken into a wide, shallow bowl and shower it with sliced scallions, the cilantro sprigs, and the chopped Thai chili if you want heat. Serve hot with steamed jasmine rice.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Spoon the extra ginger and glaze over the rice; it is the best part of the dish.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
};
