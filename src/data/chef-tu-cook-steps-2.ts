/**
 * Chef Tu David Phu's guided-cook flows — batch 2 (27 dishes). Authored from
 * his recipe library in original wording, adversarially verified, and (for the
 * 7 flagged) repaired + re-verified before integration. Spread into
 * guidedCookData (sides) + guidedCookMeals (meals) alongside batch 1.
 */
import type { StaticDishData } from "./guided-cook-steps";

export const CHEF_TU_SIDE_FLOWS_2: Record<string, StaticDishData> = {
  "tu-canh-cu-cai": {
    name: "Canh Củ Cải (Daikon & Pork Rib Soup)",
    slug: "tu-canh-cu-cai",
    description:
      "A clear, comforting Vietnamese everyday soup where pork ribs are seared and simmered with sweet daikon and carrot until the broth turns naturally savory and restorative.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tu_canh_cu_cai.jpg",
    flavorProfile: ["savory", "light", "umami", "warming"],
    temperature: "hot",
    ingredients: [
      {
        id: "tucanh-1",
        name: "Pork ribs, cut into 1-2 inch chunks",
        quantity: "1 lb",
        isOptional: false,
        substitution: "Pork neck bones or country-style ribs",
      },
      {
        id: "tucanh-2",
        name: "Fish sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucanh-3",
        name: "Ground black pepper",
        quantity: "1/8 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucanh-4",
        name: "Shallots, minced",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "Yellow onion, finely minced",
      },
      {
        id: "tucanh-5",
        name: "Cooking oil",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucanh-6",
        name: "Chicken stock",
        quantity: "4 cups",
        isOptional: false,
        substitution: "Plain water",
      },
      {
        id: "tucanh-7",
        name: "Daikon radish, peeled and chunked",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucanh-8",
        name: "Carrot, peeled and chunked",
        quantity: "1/4 lb",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucanh-9",
        name: "Cauliflower, cut into chunks",
        quantity: "1 cup",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tucanh-10",
        name: "Dried shrimp",
        quantity: "1 tbsp",
        isOptional: true,
        substitution: "Omit for a lighter, cleaner broth",
      },
      {
        id: "tucanh-11",
        name: "Scallions, cut into 1 inch segments",
        quantity: "1 bunch",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucanh-12",
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
        instruction:
          "Rinse the pork ribs under cold running water, working them with your fingers until the water runs clear, then drain well in a colander. Tip them into a bowl and toss with the fish sauce, black pepper, and minced shallots. Let them sit and absorb the seasoning for about 5 minutes.",
        timerSeconds: 300,
        mistakeWarning:
          "Skipping the rinse leaves bone dust and blood on the ribs, which clouds the finished broth and makes it taste muddy instead of clean.",
        quickHack: null,
        cuisineFact:
          "Marinating bone-in pork before it ever hits the pot is a Vietnamese home-cooking habit that seasons the meat from the inside out, so the broth doesn't have to do all the work.",
        donenessCue:
          "The shallots should look glossy and cling to the meat, and the ribs should smell faintly of fish sauce.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Set a medium pot over medium-high heat and let it warm for 2 to 3 minutes. Add the oil, swirl to coat, and when it shimmers lay in the marinated ribs in a single layer.",
        timerSeconds: 150,
        mistakeWarning:
          "Adding the ribs before the oil shimmers means they'll steam and stick instead of searing, so wait for that first wisp of heat haze.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The oil is ready when it ripples and shimmers but is not yet smoking.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Sear the ribs undisturbed, then flip and brown the other side, about 3 to 5 minutes total. You want color on the meat, not cooked-through ribs.",
        timerSeconds: 240,
        mistakeWarning:
          "Crowding or constantly poking the ribs prevents browning; leave them alone so a crust can form.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Each piece should be deeply golden-brown where it touched the pot, releasing easily when you go to flip it.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Pour in the chicken stock and bring it up to a gentle simmer, scraping the browned bits off the bottom of the pot so they dissolve into the broth.",
        timerSeconds: 240,
        mistakeWarning: null,
        quickHack:
          "Those stuck-on browned bits are pure flavor; loosening them now is what gives a quick weeknight soup the depth of a long-cooked one.",
        cuisineFact: null,
        donenessCue:
          "Small bubbles should break steadily across the surface without a hard rolling boil.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Stir in the dried shrimp and scallion segments, then add the daikon, carrot, and cauliflower. Season the pot with the kosher salt and bring everything back to a simmer.",
        timerSeconds: 120,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Daikon and pork is a classic glutamate-plus-inosinate pairing: the radish's natural glutamic acid amplifies the meat's savor, so the broth tastes richer than its short cook time suggests.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "As the soup returns to a simmer, skim off any gray foam and impurities that rise to the top with a ladle, then let it cook gently for 15 minutes until the daikon turns translucent and tender.",
        timerSeconds: 900,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The daikon should be soft enough to cut with a spoon and slightly see-through, and the broth should look clear, not foamy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Taste the broth and adjust with a splash more fish sauce or a pinch of salt only if it needs it. Ladle into bowls and serve right away while it's piping hot, ideally alongside steamed rice.",
        timerSeconds: null,
        mistakeWarning:
          "Resist over-salting at the end; this soup is meant to taste light and restorative, letting the sweetness of the daikon and carrot come through.",
        quickHack: null,
        cuisineFact:
          "In Vietnamese meals a clear canh like this is sipped throughout the meal to refresh the palate between bites of rice and savory dishes.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-goi-ga": {
    name: "Gỏi Gà (Vietnamese Chicken & Cabbage Salad)",
    slug: "tu-goi-ga",
    description:
      "Chef Tu David Phu's bright, herb-packed Vietnamese chicken salad: gently poached shredded thighs tossed with crunchy two-tone cabbage and a coconut-water nuoc cham, finished with peanuts and fried shallots.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 45,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_goi_ga.jpg",
    flavorProfile: ["bright", "savory", "herbaceous", "crunchy"],
    temperature: "cold",
    ingredients: [
      {
        id: "tugoig-1",
        name: "boneless skinless chicken thighs",
        quantity: "2 lbs",
        isOptional: false,
        substitution:
          "boneless chicken breast (poach 2-3 min less to avoid drying out)",
      },
      {
        id: "tugoig-2",
        name: "kosher salt (for the quick brine)",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-3",
        name: "fresh ginger, sliced into coins",
        quantity: "2-inch piece",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-4",
        name: "fish sauce (for the poaching water)",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-5",
        name: "fine salt (for the poaching water)",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-6",
        name: "green cabbage, finely shredded",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-7",
        name: "red cabbage, finely shredded",
        quantity: "1 cup",
        isOptional: false,
        substitution: "all green cabbage if red isn't on hand",
      },
      {
        id: "tugoig-8",
        name: "carrots, julienned or shredded",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-9",
        name: "red onion, thinly sliced",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "shallots for a milder bite",
      },
      {
        id: "tugoig-10",
        name: "mint leaves, picked",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-11",
        name: "cilantro leaves, picked",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "Thai basil or a mix",
      },
      {
        id: "tugoig-12",
        name: "roasted peanuts, roughly chopped",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "cashews",
      },
      {
        id: "tugoig-13",
        name: "fried shallots",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "store-bought crispy fried onions",
      },
      {
        id: "tugoig-14",
        name: "coconut water",
        quantity: "1 cup",
        isOptional: false,
        substitution: "plain water plus an extra 1 tsp sugar",
      },
      {
        id: "tugoig-15",
        name: "fresh lemon juice",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "fresh lime juice",
      },
      {
        id: "tugoig-16",
        name: "fish sauce (for the dressing)",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-17",
        name: "ginger, minced",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-18",
        name: "garlic, minced",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-19",
        name: "shallot, minced",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugoig-20",
        name: "fermented chili paste (sambal oelek or tuong ot)",
        quantity: "2 tsp",
        isOptional: true,
        substitution: "sriracha, or omit for no heat",
      },
      {
        id: "tugoig-21",
        name: "sugar",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "1/3 tsp stevia",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Dissolve the 2 tbsp kosher salt in about 4 cups of cold water and submerge the chicken thighs for a quick 5-minute brine. Lift them out and rinse well under cold running water. This short soak seasons the meat from the outside and rinses away any clinging bits before poaching.",
        timerSeconds: 300,
        mistakeWarning:
          "Don't extend the brine to 'be safe' — past 15-20 minutes the thighs turn spongy and oversalted, and your finished dressing will taste harsh on top of it.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Set the rinsed chicken in a pot and cover with fresh cold water by about an inch. Drop in the ginger coins, the 1 tsp fine salt, and 1 tbsp fish sauce. Bring it up to a gentle simmer over medium-high heat, then dial the heat down so the surface barely trembles.",
        timerSeconds: null,
        mistakeWarning:
          "Starting in cold water (not boiling) is the trick — it lets the thighs heat evenly so the outside doesn't toughen before the center cooks.",
        quickHack: null,
        cuisineFact:
          "Poaching in a lightly seasoned 'tea' of ginger and fish sauce is the classic Vietnamese way to cook chicken for goi — the bird stays juicy and picks up gentle aromatics rather than browning.",
        donenessCue:
          "You want a lazy simmer with just a few bubbles breaking the surface, never a rolling boil.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Hold that bare simmer and poach the thighs for about 15 minutes, until they're cooked through. Pull one out and check the thickest part — it should read 165°F and run clear with no pink at the center.",
        timerSeconds: 900,
        mistakeWarning:
          "A hard boil here is the number-one way to end up with dry, stringy chicken. Keep it gentle.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Internal temperature hits 165°F and the juices run clear; the meat feels firm but still gives slightly when pressed.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Lift the chicken onto a plate and let it cool to room temperature so it firms up and reabsorbs its juices — roughly an hour, or speed it up by spreading the pieces out and chilling them. Once cool enough to handle, tear the meat into rough shreds by hand along the grain.",
        timerSeconds: null,
        mistakeWarning:
          "Don't shred it screaming-hot straight from the pot — it crumbles into mush and loses moisture. Letting it rest gives you those clean, juicy strands.",
        quickHack:
          "In a hurry? Spread the thighs on a tray and pop them in the freezer for 12-15 minutes to fast-cool before shredding.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Make the nuoc cham: stir together the coconut water, lemon juice, 1/2 cup fish sauce, minced ginger, garlic, and shallot, the chili paste, and the sugar until the sugar fully dissolves. Taste and adjust — it should land bright, salty, and just-sweet, with a little heat behind it.",
        timerSeconds: null,
        mistakeWarning:
          "Add the chili paste gradually if you're heat-shy; you can always stir in more, but you can't pull it back out.",
        quickHack: null,
        cuisineFact:
          "Chef Tu swaps the usual water for coconut water, which rounds out the fish sauce's edge with a soft natural sweetness that's signature to his version.",
        donenessCue:
          "The sugar should be completely dissolved — no grit at the bottom of the bowl when you swirl it.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Toss the hand-shredded chicken with about 3 tbsp of the dressing so it soaks in, and keep it chilled while you prep everything else. Pre-seasoning the meat this way means every bite carries flavor, not just the leaves.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "In a large bowl, combine the dressed chicken with both cabbages, the carrots, red onion, and most of the mint and cilantro. Pour over the remaining dressing and toss with your hands or tongs until everything is evenly coated and glossy.",
        timerSeconds: null,
        mistakeWarning:
          "Dress it right before serving — cabbage weeps and goes limp if it sits in the nuoc cham too long, and you'll lose the signature crunch.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Every shred should glisten; if the bottom of the bowl is pooling with liquid, you've over-dressed.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Pile the salad onto a platter and finish with the reserved mint and cilantro, the chopped peanuts, and the fried shallots. Serve cold, right away, while the cabbage is at its crispest.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Scatter the peanuts and fried shallots only at the very end so they stay crunchy instead of going soft in the dressing.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-ca-tai-chanh": {
    name: "Cá Tái Chanh (Vietnamese Ceviche)",
    slug: "tu-ca-tai-chanh",
    description:
      'Chef Tu David Phu\'s bright Vietnamese raw-fish "ceviche" where sushi-grade Kampachi is barely cured in lemon, fish sauce, and ginger, then showered with mint, dill, and cilantro and scooped up with grilled rice paper.',
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 20,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_ca_tai_chanh.jpg",
    flavorProfile: ["bright", "umami", "herbaceous", "fresh"],
    temperature: "cold",
    ingredients: [
      {
        id: "tucata-1",
        name: "Sushi-grade Kampachi (or other sashimi-grade firm white fish)",
        quantity: "1 lb",
        isOptional: false,
        substitution: "Sushi-grade yellowtail, sea bass, or fluke",
      },
      {
        id: "tucata-2",
        name: "Fish sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-3",
        name: "Fresh lemon juice",
        quantity: "2 tsp",
        isOptional: false,
        substitution: "Fresh lime juice",
      },
      {
        id: "tucata-4",
        name: "Ginger, finely minced",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-5",
        name: "Rice vinegar",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-6",
        name: "Sugar",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-7",
        name: "Toasted sesame oil",
        quantity: "1/8 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-8",
        name: "Sesame seeds",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-9",
        name: "Scallions, thinly sliced",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-10",
        name: "Serrano chile, small dice",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "Thai bird chile or jalapeño",
      },
      {
        id: "tucata-11",
        name: "Kosher salt",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-12",
        name: "Mint leaves",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-13",
        name: "Dill sprigs",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-14",
        name: "Cilantro sprigs",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucata-15",
        name: "Chives, cut into short lengths",
        quantity: "2 tbsp",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tucata-16",
        name: "Rice paper rounds, for grilling",
        quantity: "8-10 sheets",
        isOptional: false,
        substitution: "Shrimp chips or sesame rice crackers",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Slide a stainless steel mixing bowl into the freezer to chill while you prep. Keeping the fish cold from start to finish is your single biggest food-safety lever for a raw preparation.",
        timerSeconds: 1800,
        mistakeWarning:
          "Working with raw fish at room temperature invites bacteria. Use only fish you trust as sushi/sashimi grade, and keep it on ice or refrigerated until the moment you cut.",
        quickHack: null,
        cuisineFact:
          "Cá tái chanh translates roughly to 'fish rare with lemon' — the citrus only kisses the surface, leaving the center silky rather than fully 'cooked' like a Latin ceviche.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Pat the Kampachi dry and cut it against the grain into clean, even 1/4-inch slices or small cubes. Wipe your knife between passes so every piece stays glossy and uniform.",
        timerSeconds: null,
        mistakeWarning:
          "A dull or dragging knife shreds delicate raw fish. Use your sharpest blade and let it glide through in single, confident strokes.",
        quickHack:
          "Firm the fillet up with 10 minutes in the freezer before slicing — slightly stiff fish cuts far cleaner.",
        cuisineFact: null,
        donenessCue:
          "Each slice should look smooth and translucent at the edges, with no ragged or torn surfaces.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "In the chilled bowl, whisk together the lemon juice, fish sauce, rice vinegar, minced ginger, sugar, and about half the kosher salt until the sugar dissolves. Taste — it should read sharp, salty, and lightly sweet all at once.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The dressing tastes balanced and brightly acidic before any fish goes in.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add the fish, sliced scallions, and diced serrano to the dressing. Fold everything together with a gentle hand so each piece is coated, then cover and refrigerate.",
        timerSeconds: null,
        mistakeWarning:
          "Don't stir aggressively — overworking bruises the fish and turns the texture mushy.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Let the fish cure in the fridge until the outer edges turn opaque while the centers stay translucent. This brief marinade is what 'tái' means — barely set, never tough.",
        timerSeconds: 1200,
        mistakeWarning:
          "Curing much past 20 minutes over-firms the fish and dulls its delicate flavor. Set a timer and pull it on time.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Edges look whitened and just-set; the interior is still glassy and tender.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Pull the bowl from the fridge and gently fold in the sesame oil and sesame seeds, then taste and adjust with the remaining salt only if it needs it. The oil should round out the acidity with a quiet toasty note.",
        timerSeconds: null,
        mistakeWarning:
          "Sesame oil is potent — that scant 1/8 teaspoon is plenty. More will steamroll the fresh, bright profile.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Grill the rice paper rounds directly over a low open flame or in a dry hot pan, turning constantly, until they puff, blister, and curl into crisp, lightly charred shards.",
        timerSeconds: 40,
        mistakeWarning:
          "Rice paper scorches in seconds. Keep it moving over the heat and never walk away.",
        quickHack:
          "No open flame? Microwave a sheet for 30-40 seconds and it will puff into a crisp cracker.",
        cuisineFact: null,
        donenessCue:
          "The sheet turns opaque-white, bubbles up, and snaps crisply when tapped.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Right before serving, fold the mint, dill, cilantro, and chives through the fish so the herbs stay perky. Spoon the ceviche off-center on a chilled plate, prop the grilled rice paper alongside, and serve immediately while everything is cold and crisp.",
        timerSeconds: null,
        mistakeWarning:
          "Add the herbs too early and they wilt and darken in the acid. Fold them in at the last possible moment.",
        quickHack: null,
        cuisineFact:
          "Diners scoop the fish onto the puffed rice paper by hand — the crackle against the cool, tender fish is the whole point of the dish.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-banh-tom": {
    name: "Bánh Tôm (Shrimp & Sweet Potato Fritter)",
    slug: "tu-banh-tom",
    description:
      "Chef Tu David Phu's take on Hanoi's iconic street snack: crisp turmeric-gold fritters where shredded sweet potato fries into a lacy nest cradling a whole shrimp, eaten wrapped in lettuce and herbs with nước chấm.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 30,
    cookTimeMinutes: 25,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_banh_tom.jpg",
    flavorProfile: ["savory", "earthy", "umami", "fresh"],
    temperature: "hot",
    ingredients: [
      {
        id: "tubanh-1",
        name: "U-15 white shrimp, shell-on",
        quantity: "2 lbs",
        isOptional: false,
        substitution:
          "any large head-on prawns, or peeled jumbo shrimp if shell-on is unavailable",
      },
      {
        id: "tubanh-2",
        name: "sweet potato, cut into thin matchsticks",
        quantity: "3 cups",
        isOptional: false,
        substitution: "taro or a 50/50 mix of sweet potato and carrot",
      },
      {
        id: "tubanh-3",
        name: "all-purpose flour",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-4",
        name: "rice flour",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "cornstarch for an even crisper bite",
      },
      {
        id: "tubanh-5",
        name: "large eggs",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-6",
        name: "water",
        quantity: "1 cup",
        isOptional: false,
        substitution: "cold sparkling water for extra-light batter",
      },
      {
        id: "tubanh-7",
        name: "ground turmeric",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-8",
        name: "baking powder",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-9",
        name: "kosher salt",
        quantity: "1 tsp (for batter) plus a pinch for finishing",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-10",
        name: "neutral frying oil",
        quantity: "3 cups",
        isOptional: false,
        substitution: "any high-smoke-point oil such as canola or peanut",
      },
      {
        id: "tubanh-11",
        name: "iceberg lettuce, leaves separated",
        quantity: "1 head",
        isOptional: false,
        substitution: "butter or red-leaf lettuce",
      },
      {
        id: "tubanh-12",
        name: "fresh mint",
        quantity: "2 bunches",
        isOptional: false,
        substitution: "perilla, cilantro, or Thai basil",
      },
      {
        id: "tubanh-13",
        name: "English cucumber, sliced",
        quantity: "1",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-14",
        name: "nước chấm dipping sauce",
        quantity: "1 cup, for serving",
        isOptional: false,
        substitution:
          "fish sauce thinned with lime juice, sugar, water, garlic, and chili",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Peel the sweet potato and slice it into thin, even matchsticks, ideally on a mandoline or with a sharp knife. Drop them into a bowl of cold water as you go to rinse off surface starch, then drain well and pat thoroughly dry before they meet the batter.",
        timerSeconds: null,
        mistakeWarning:
          "Skipping the dry-off leaves the matchsticks wet, which thins your batter and stops the nest from crisping.",
        quickHack: null,
        cuisineFact:
          "Chef Tu calls the thin-cut sweet potato the whole secret: it weaves into a lattice 'basket' that cradles the shrimp as it fries.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Whisk the eggs into the water until blended. Sift together the all-purpose flour, rice flour, turmeric, baking powder, and 1 teaspoon of kosher salt. Pour in about a third of the dry mix and whisk smooth, then add the rest and whisk until you have a lump-free, pourable batter the color of marigold.",
        timerSeconds: null,
        mistakeWarning:
          "Use only the 1 teaspoon of salt here, not the finishing pinch — over-salting the batter can't be undone once it's fried.",
        quickHack:
          "Adding the flour in two stages keeps the batter from clumping, so you barely have to fight any lumps.",
        cuisineFact: null,
        donenessCue:
          "The batter should coat a spoon and ribbon off slowly; if it's gluey, loosen with a splash of water.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Fold the dried sweet potato matchsticks into the batter until every strand is lightly coated. Meanwhile, rinse the shrimp and pat them dry, leaving the heads and shells on for the most traditional, dramatic fritter.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "In Hanoi these are sold lakeside near West Lake (Hồ Tây), fried to order and handed over still crackling.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Pour the oil into a deep, heavy pot and bring it to 325°F over medium heat. Use a thermometer — steady temperature is what separates a crisp fritter from a greasy one.",
        timerSeconds: 360,
        mistakeWarning:
          "If the oil runs hot the outside scorches before the sweet potato cooks through; too cool and the nest drinks up oil.",
        quickHack:
          "No thermometer? Dip in a single matchstick — it should sizzle steadily and rise within a couple of seconds.",
        cuisineFact: null,
        donenessCue:
          "A wooden chopstick dipped in the oil should throw a lively stream of fine bubbles at 325°F.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Lay a wide ladle or shallow scoop in the oil to warm, then load it with about 2 tablespoons of the battered sweet potato, nestle a shrimp on top, and spoon another tablespoon of batter over to lock it in. Press gently to form a compact patty before sliding it into the oil.",
        timerSeconds: null,
        mistakeWarning:
          "Crowding the pot drops the oil temperature fast — fry just two or three fritters at a time.",
        quickHack:
          "Warming the ladle in the oil first keeps the batter from sticking, so the fritter releases cleanly.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Fry each fritter for about 5 minutes per side, turning once, until the sweet potato nest is deep golden, lacy, and rigid and the shrimp shell has turned bright orange.",
        timerSeconds: 600,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Done fritters feel light and hard like a cracker, with no soft give in the center; the shrimp shell is fully orange-pink.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Lift each fritter onto a wire rack set over a tray and hit it immediately with a small pinch of kosher salt while it's still glistening. Let them drain rather than sitting on paper towels, which traps steam and softens the crust.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Serve hot with a platter of iceberg lettuce, mint, and sliced cucumber. To eat, tear off a piece of fritter, bundle it in a lettuce leaf with herbs and cucumber, and dunk the whole wrap in nước chấm.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Wrapping fried food in cool lettuce and herbs is a hallmark of Vietnamese eating — the fresh, bright counterpoint keeps each bite from feeling heavy.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-cha-gio-khoai-mon": {
    name: "Chả Giò Khoai Môn (Taro Egg Rolls)",
    slug: "tu-cha-gio-khoai-mon",
    description:
      "Crisp Vietnamese egg rolls packed with a savory pork, taro, and carrot filling bound by glass noodles, fried until shatteringly golden — Chef Tu David Phu's take on chả giò khoai môn.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 40,
    cookTimeMinutes: 30,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_cha_gio_khoai_mon.jpg",
    flavorProfile: ["savory", "umami", "aromatic", "crispy"],
    temperature: "hot",
    ingredients: [
      {
        id: "tuchag-1",
        name: "ground pork",
        quantity: "2 lbs",
        isOptional: false,
        substitution: "swap in 1 lb ground beef plus 1 lb ground turkey",
      },
      {
        id: "tuchag-2",
        name: "mung bean (glass) noodles, rehydrated and cut short",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-3",
        name: "carrots, cut into fine matchsticks",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-4",
        name: "fresh taro, peeled and cut into fine matchsticks",
        quantity: "2 cups",
        isOptional: false,
        substitution: "jicama for a milder, crunchier bite",
      },
      {
        id: "tuchag-5",
        name: "oyster sauce",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-6",
        name: "fish sauce",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-7",
        name: "freshly ground black pepper",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-8",
        name: "kosher salt",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-9",
        name: "sugar",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-10",
        name: "sesame oil",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-11",
        name: "garlic, minced",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-12",
        name: "ginger, minced",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-13",
        name: "spring roll wrappers",
        quantity: "1 package (about 25)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchag-14",
        name: "neutral frying oil",
        quantity: "2-3 cups",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Soak the mung bean noodles in warm water until pliable, about 8 minutes, then drain well and snip them into roughly 1-inch lengths with scissors. Peel the taro and cut both the taro and carrots into thin matchsticks so they cook through evenly inside the roll.",
        timerSeconds: 480,
        mistakeWarning:
          "Peel taro under running water or with gloves — its raw skin can leave hands itchy and irritated.",
        quickHack:
          "Stack a few carrot coins, flatten the stack, then slice into sticks to speed up the matchsticks.",
        cuisineFact:
          "Khoai môn (taro) gives this Vietnamese egg roll its signature nutty, slightly starchy heart that sets it apart from a plain pork roll.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "In a large bowl, combine the ground pork, drained noodles, carrots, and taro with the oyster sauce, fish sauce, sugar, sesame oil, garlic, ginger, black pepper, and the full tablespoon of kosher salt. Mix with your hands for 5 to 10 minutes until everything is fully blended and the mixture turns slightly tacky.",
        timerSeconds: 420,
        mistakeWarning:
          "All the seasoning goes in here at once — this single mix is the only place the filling gets salted, so don't hold any back for later steps.",
        quickHack:
          "Pan-fry a teaspoon of the filling and taste it, then adjust fish sauce or sugar before you start rolling.",
        cuisineFact: null,
        donenessCue:
          "The filling is ready when it holds together in a loose clump rather than falling apart.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Cover the bowl and chill the filling for at least 20 minutes. This firms up the mixture so it is easier to portion and keeps the pork cold and food-safe while you work through the package of wrappers.",
        timerSeconds: 1200,
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
          "Set a wrapper on your work surface as a diamond and spoon 2 to 3 tablespoons of filling in a log about a third of the way up from the bottom corner. Fold the bottom corner up over the filling, fold in the left and right corners snugly, and roll upward into a tight cylinder, stopping with the last 2 to 3 inches of wrapper unrolled.",
        timerSeconds: null,
        mistakeWarning:
          "Resist overfilling — a fat roll splits open in the oil and leaks filling into your fryer.",
        quickHack:
          "Roll firmly but not so tight that the wrapper tears; a snug roll fries up crispier with fewer air gaps.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Dip a finger in water and run it along the open top edges of the wrapper, then finish rolling and press the seam to seal. Set each roll seam-side down and keep them apart so they don't stick together while you finish the batch.",
        timerSeconds: null,
        mistakeWarning:
          "A dry seam will pop open during frying — make sure the edge is moistened and pressed shut.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Heat 2 to 3 cups of frying oil in a deep pot to 325°F, using a thermometer to hold the temperature steady. Working in small batches so you don't crowd the pot, lower in the rolls and fry about 5 minutes per side, turning once, until deeply golden and crisp all over.",
        timerSeconds: 600,
        mistakeWarning:
          "Crowding the pot drops the oil temperature and leaves you with greasy, pale rolls — fry just a few at a time.",
        quickHack:
          "No thermometer? A wooden chopstick dipped in the oil should release a steady stream of fine bubbles at frying temperature.",
        cuisineFact: null,
        donenessCue:
          "They're done when the wrappers are an even golden brown and the rolls sound hollow and crackly when tapped.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Lift the rolls out and drain on a paper-towel-lined rack or plate. Rest a couple of minutes so the centers finish steaming, then serve hot with lettuce, fresh herbs, and a side of nuoc cham for dipping.",
        timerSeconds: 120,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "In Vietnam these crispy rolls are traditionally tucked into lettuce leaves with herbs and dunked in tangy-sweet nuoc cham.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-banh-chuoi-nuong": {
    name: "Bánh Chuối Nướng (Banana Bread Pudding)",
    slug: "tu-banh-chuoi-nuong",
    description:
      "Chef Tu David Phu's Vietnamese banana bread pudding bakes sugared ripe bananas into a coconut-condensed-milk custard soaked through torn croissants until golden and just set.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 15,
    cookTimeMinutes: 45,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tu_banh_chuoi_nuong.jpg",
    flavorProfile: ["sweet", "coconut", "caramelized", "custardy"],
    temperature: "warm",
    ingredients: [
      {
        id: "tubanh-1",
        name: "very ripe lady finger bananas (or Cavendish), sliced 1/2-inch thick",
        quantity: "1 lb",
        isOptional: false,
        substitution: "any deeply spotted ripe banana",
      },
      {
        id: "tubanh-2",
        name: "granulated sugar, divided",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-3",
        name: "eggs",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-4",
        name: "sweetened condensed milk",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-5",
        name: "coconut milk",
        quantity: "2 cups",
        isOptional: false,
        substitution: "full-fat canned coconut milk",
      },
      {
        id: "tubanh-6",
        name: "kosher salt",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-7",
        name: "day-old croissants, torn into 1/2-inch chunks",
        quantity: "3",
        isOptional: false,
        substitution: "stale brioche or challah",
      },
      {
        id: "tubanh-8",
        name: "unsalted butter, room temperature",
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
          "Set your oven to 350F and let it come fully up to temperature while you build the pudding. Tear the day-old croissants into rough half-inch pieces so they soak evenly.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Fresh croissants resist soaking; if yours aren't stale, spread the chunks on a tray and dry them in the warming oven for 10 minutes.",
        cuisineFact:
          "Bánh chuối nướng is Vietnam's beloved baked banana pudding, traditionally built on torn day-old bread to rescue it from waste.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Toss the sliced bananas with 1 tablespoon of the sugar in a bowl and let them sit. The sugar draws out moisture and starts coaxing sweetness to the surface.",
        timerSeconds: null,
        mistakeWarning:
          "Use only deeply spotted, soft bananas. Underripe fruit stays starchy and bland and won't melt into the custard.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "In a separate bowl, whisk 1 cup of the coconut milk with the eggs and 1/8 teaspoon of the salt until smooth. Pour in the condensed milk slowly while whisking, then stream in the remaining 1 cup coconut milk and the last 1/8 teaspoon salt to finish the custard.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The custard should look uniform and pale gold with no streaks of unmixed condensed milk clinging to the bowl.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Fold the torn croissants into the custard so every piece is coated, then cover and chill for 30 minutes to let the bread drink in the liquid.",
        timerSeconds: 1800,
        mistakeWarning:
          "Don't rush this soak. Dry centers in the bread will bake up tough instead of silky.",
        quickHack:
          "For an even more tender pudding, soak it overnight in the fridge.",
        cuisineFact: null,
        donenessCue:
          "The croissant chunks should feel heavy and saturated, holding their shape but yielding softly when pressed.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Butter the inside of a 6-inch round cake pan generously, then dust it with the remaining 1 tablespoon sugar, turning the pan so the sugar clings to the buttered sides.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "The sugar-and-butter coating caramelizes against the pan during baking, giving the pudding's edges a faintly crisp, golden crust.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Spoon a third of the soaked croissant mixture into the pan, scatter a layer of sugared bananas, and repeat twice more, finishing with a top layer of banana slices fanned across the surface.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Bake at 350F for 35 to 45 minutes until the top is deeply golden and the center is set. Let it rest at least 15 minutes before slicing so the custard firms up.",
        timerSeconds: 2400,
        mistakeWarning:
          "Pulling it too early leaves a wet, soupy middle. Give it the full time and the rest.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "A knife slipped into the center should come out clean and the top should spring back gently with no liquid jiggle beneath.",
        imageUrl: null,
      },
    ],
  },
  "tu-bac-xiu": {
    name: "Bạc Xỉu (Saigon-Style Milk Coffee)",
    slug: "tu-bac-xiu",
    description:
      "Tu David Phu's milk-forward take on Saigon iced coffee, where sweetened condensed milk leads and a single phin pour of dark Vietnamese coffee just tints it amber.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 5,
    cookTimeMinutes: 7,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tu_bac_xiu.jpg",
    flavorProfile: ["sweet", "creamy", "roasty"],
    temperature: "cold",
    ingredients: [
      {
        id: "tubacx-1",
        name: "Coarse-ground dark roast coffee (Vietnamese-style or a Neapolitan espresso blend)",
        quantity: "2 tablespoons",
        isOptional: false,
        substitution:
          "Any robusta-forward dark roast, ground for a phin filter",
      },
      {
        id: "tubacx-2",
        name: "Hot water, just off the boil",
        quantity: "5 oz (about 150 ml)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubacx-3",
        name: "Sweetened condensed milk",
        quantity: "3 tablespoons",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubacx-4",
        name: "Whole milk",
        quantity: "4 oz (about 120 ml)",
        isOptional: false,
        substitution: "Oat milk or any full-fat dairy alternative",
      },
      {
        id: "tubacx-5",
        name: "Ice",
        quantity: "1 cup, divided",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Spoon the ground coffee into a Vietnamese phin filter set over a heatproof glass, give the filter a gentle shake to level the bed, and screw the press plate down lightly so it just rests on the grounds.",
        timerSeconds: null,
        mistakeWarning:
          "Cranking the press plate down too tight chokes the drip and the water pools instead of seeping through.",
        quickHack:
          "No phin? A small pour-over cone or even a tea infuser packed with grounds gets you close.",
        cuisineFact:
          "The phin is Vietnam's signature single-cup brewer, adapted from French drip filters during the colonial era.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Pour a splash of the hot water over the grounds to wet them, wait about thirty seconds for the bed to swell, then fill the phin the rest of the way and cap it with the lid.",
        timerSeconds: 30,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The grounds should puff and bloom slightly when first wetted — that means the coffee is fresh.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Let the coffee drip undisturbed until the phin runs dry. You're after a small, intense pour of about 4 oz of dark coffee.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "When the dripping slows to occasional drops and the chamber is nearly empty, the brew is done.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "While the coffee drips, add the condensed milk, whole milk, and half the ice to a cocktail shaker. Seal it and shake hard until the outside frosts over and the milk turns silky and a touch foamy.",
        timerSeconds: 75,
        mistakeWarning: null,
        quickHack:
          "No shaker? A lidded mason jar works just as well — just hold the lid down tight.",
        cuisineFact: null,
        donenessCue:
          "The shaker walls should feel ice-cold and the milk should look glossy and lightened when you stop.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Pour the chilled milk into a tall serving glass and top it with the rest of the ice.",
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
          "Rinse the shaker, add the brewed coffee, and shake it briefly on its own to chill and aerate it, then pour it slowly over the iced milk so it layers in an amber cloud before you stir.",
        timerSeconds: 45,
        mistakeWarning:
          "Bạc Xỉu is milk-led, not coffee-led — resist adding extra coffee or you'll tip it into a standard cà phê sữa đá.",
        quickHack: null,
        cuisineFact:
          '"Bạc xỉu" comes from a Cantonese phrase meaning "a little white with milk," naming its pale, milk-forward color.',
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-steamed-jasmine-rice": {
    name: "Cơm (Steamed Jasmine Rice)",
    slug: "tu-steamed-jasmine-rice",
    description:
      "Light, fragrant jasmine rice steamed on the stovetop into separate, fluffy grains — the quiet backbone of every Vietnamese meal.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 5,
    cookTimeMinutes: 33,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tu_steamed_jasmine_rice.jpg",
    flavorProfile: ["fragrant", "neutral", "comforting"],
    temperature: "hot",
    ingredients: [
      {
        id: "tustea-1",
        name: "jasmine rice",
        quantity: "2 cups",
        isOptional: false,
        substitution: "long-grain white rice",
      },
      {
        id: "tustea-2",
        name: "cold water (for cooking)",
        quantity: "2 1/2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tustea-3",
        name: "fine salt",
        quantity: "1/2 tsp",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tustea-4",
        name: "cold water (for rinsing)",
        quantity: "as needed",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Tip the rice into a bowl or the pot itself and cover with cold water. Swish it around with your hand, pour off the cloudy water, and repeat two or three more times until the water runs nearly clear. Drain well.",
        timerSeconds: null,
        mistakeWarning:
          "Skipping the rinse leaves surface starch behind and gives you gummy, clumping rice instead of separate grains.",
        quickHack: null,
        cuisineFact:
          "Rinsing also washes away dust and helps reduce the trace inorganic arsenic that settles on rice grains.",
        donenessCue: "The rinse water shifts from milky white to mostly clear.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add the drained rice, the 2 1/2 cups of cooking water, and the salt if using to a medium saucepan with a tight-fitting lid. The water should sit roughly knuckle-deep — about an inch — above the leveled rice.",
        timerSeconds: null,
        mistakeWarning:
          "Long-grain jasmine drinks up a little less water than plump medium-grain, so stick to the 1 to 1.25 ratio here and resist topping it up — extra water just turns the grains soft and sticky.",
        quickHack:
          "For a five-minute soak, let it rest now before lighting the burner; this evens out the grains and shaves a couple minutes off the cook.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Set the pot over high heat, uncovered, and bring it to a rolling boil. Stir once to free any grains stuck to the bottom.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Big bubbles break across the whole surface and the water level drops to just at the rice.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Drop the heat to its lowest setting, clamp on the lid, and let the rice simmer undisturbed. Don't lift the lid — you need the trapped steam to finish the grains.",
        timerSeconds: 1200,
        mistakeWarning:
          "Peeking releases the steam that cooks the top layer and you'll end up with crunchy grains.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "All the water is absorbed and small steam holes pock the surface of the rice.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Pull the pot off the heat, keep it covered, and let it rest so the grains firm up and the moisture redistributes.",
        timerSeconds: 600,
        mistakeWarning:
          "Fluffing straight off the heat tears the soft grains and makes the rice sticky.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Lift the lid and run a fork or rice paddle through the rice with a gentle lifting motion to separate the grains. Serve hot alongside the main dish.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Cut down into the rice and turn it over rather than stirring in circles — that keeps the grains whole and airy.",
        cuisineFact:
          "In Vietnamese homes, cơm trắng (plain rice) is the neutral anchor that balances bold, salty, and sour dishes across the table.",
        donenessCue:
          "Grains are tender, glossy, and fall apart cleanly without clumping.",
        imageUrl: null,
      },
    ],
  },
  "tu-rau-muong": {
    name: "Rau Muống Xào (Stir-Fried Water Spinach)",
    slug: "tu-rau-muong",
    description:
      "Chef Tu David Phu's blistering-hot wok take on rau muống xào — water spinach flashed in garlic, dried shrimp, oyster sauce, and a single Thai chili until the stems snap and the leaves go glossy-green. A one-pan Vietnamese weeknight side that lives or dies on heat and speed.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tu_rau_muong.jpg",
    flavorProfile: ["garlicky", "umami", "savory", "mildly spicy"],
    temperature: "hot",
    ingredients: [
      {
        id: "turaum-1",
        name: "Water spinach (rau muống)",
        quantity: "1 lb",
        isOptional: false,
        substitution: "Spinach or tender broccolini also stir-fry well",
      },
      {
        id: "turaum-2",
        name: "Frying oil",
        quantity: "2 tbsp, divided",
        isOptional: false,
        substitution: "Any neutral high-smoke-point oil (canola, grapeseed)",
      },
      {
        id: "turaum-3",
        name: "Minced garlic",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "turaum-4",
        name: "Dried shrimp, chopped",
        quantity: "1 tbsp",
        isOptional: true,
        substitution: "Omit for a vegan version; the dish stays great",
      },
      {
        id: "turaum-5",
        name: "Oyster sauce",
        quantity: "2 tsp",
        isOptional: false,
        substitution: "Vegetarian mushroom 'oyster' sauce",
      },
      {
        id: "turaum-6",
        name: "Fish sauce (Son brand if you have it)",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Light soy sauce for a vegetarian version",
      },
      {
        id: "turaum-7",
        name: "Kosher salt",
        quantity: "1 pinch",
        isOptional: false,
        substitution: null,
      },
      {
        id: "turaum-8",
        name: "Thai chili",
        quantity: "1 whole",
        isOptional: true,
        substitution: "Leave out for no heat, or use a milder serrano",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Cut water spinach into fourths, then rinse and wash thoroughly. Drain in a colander.",
        timerSeconds: null,
        mistakeWarning:
          "Wet greens steam instead of sear and will release a puddle in the wok. Shake the colander hard and let it drain while you heat the pan.",
        quickHack:
          "Spin the rinsed greens in a salad spinner to get them as dry as possible before they hit the oil.",
        cuisineFact:
          "Rau muống is a Southeast Asian staple crop, long restricted in many U.S. states as an invasive species — making it a prized find at Vietnamese markets.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Preheat a large skillet or wok on high heat, then add 1 tbsp frying oil.",
        timerSeconds: null,
        mistakeWarning:
          "Don't add the oil to a cold pan and walk away. Let the wok get ripping hot first — this dish is built on high heat from start to finish.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The pan is ready when a drop of water flicked in dances and evaporates on contact.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add the minced garlic and chopped dried shrimp. Toast 30 seconds until golden brown, then remove the toasted garlic and shrimp and set aside.",
        timerSeconds: 30,
        mistakeWarning:
          "Garlic burns fast at this heat — pull it the instant it turns golden, not brown, or it'll go bitter.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: "Golden, fragrant, and crisp — not dark brown.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add the remaining 1 tbsp frying oil and reheat. Once the oil shimmers, add the water spinach and the whole Thai chili.",
        timerSeconds: null,
        mistakeWarning:
          "Add the greens all at once and stand back — they'll spit. Don't add them before the oil shimmers or they'll go limp instead of searing.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The oil shimmers and ripples just before it smokes — that's your cue to add the greens.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Toss 2-3 times, then add the 2 tsp oyster sauce, 1 tsp fish sauce, and a pinch of kosher salt.",
        timerSeconds: null,
        mistakeWarning:
          "Go easy on the salt — the oyster sauce, fish sauce, and dried shrimp already bring plenty of salinity. A single pinch is all the greens need.",
        quickHack:
          "Premix the oyster sauce and fish sauce in a small bowl so you can pour it in fast and keep the heat high.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Toss continuously over high heat until the water spinach reduces by about one-third, then remove from heat.",
        timerSeconds: 75,
        mistakeWarning:
          "Don't let it sit — water spinach wilts in barely a minute and overcooks to mush if you walk away. Keep it moving and pull it the moment the stems turn crisp-tender.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Leaves are glossy and vivid green, stems are crisp-tender with a snap, and the volume has shrunk by roughly a third.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Transfer to a bowl, garnish with the reserved toasted garlic and dried shrimp, and serve with rice.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Spoon a little of the garlicky pan oil over the top for extra fragrance.",
        cuisineFact:
          "Served family-style over steamed rice, rau muống xào is one of the most beloved everyday vegetable dishes on the Vietnamese table.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-cha-trung-hap": {
    name: "Chả Trứng Hấp (Steamed Egg & Pork Terrine)",
    slug: "tu-cha-trung-hap",
    description:
      "Chef Tu David Phu's savory Vietnamese steamed terrine layers seasoned ground pork with glass noodles and wood ear mushrooms, bound in whole egg and finished with a glossy single-yolk glaze for a banh-mi-ready slab.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 25,
    cookTimeMinutes: 50,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_cha_trung_hap.jpg",
    flavorProfile: ["savory", "umami", "earthy"],
    temperature: "warm",
    ingredients: [
      {
        id: "tuchat-1",
        name: "ground pork",
        quantity: "1 lb",
        isOptional: false,
        substitution: "ground chicken thigh for a leaner terrine",
      },
      {
        id: "tuchat-2",
        name: "large eggs",
        quantity: "6 (5 whole into the mix, 1 yolk reserved for the glaze)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchat-3",
        name: "dried mung bean (glass) noodles",
        quantity: "1/2 oz",
        isOptional: false,
        substitution: "cellophane or bean thread noodles",
      },
      {
        id: "tuchat-4",
        name: "dried wood ear mushrooms",
        quantity: "2 oz, sliced (rehydrated)",
        isOptional: false,
        substitution: "shiitake, finely sliced, for a deeper earthiness",
      },
      {
        id: "tuchat-5",
        name: "fish sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchat-6",
        name: "kosher salt",
        quantity:
          "2 tsp (split: 1 1/2 tsp in the mix, 1/2 tsp reserved to adjust)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchat-7",
        name: "sugar",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchat-8",
        name: "ground black pepper",
        quantity: "1/8 tsp",
        isOptional: false,
        substitution: "white pepper for a cleaner, more traditional heat",
      },
      {
        id: "tuchat-9",
        name: "cooking oil",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchat-10",
        name: "banh mi pickles (do chua) and sriracha",
        quantity: "to serve",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Cover the dried glass noodles and the wood ear mushrooms with warm water in separate bowls and let them soften for about 15 minutes. Drain both well, then snip the noodles into roughly 1-inch lengths and thinly slice the mushrooms.",
        timerSeconds: 900,
        mistakeWarning:
          "Skipping the soak leaves crunchy noodle shards in the finished terrine — they need to be fully pliable before they go into the mix.",
        quickHack:
          "Use hot tap water instead of cold to cut the soak time nearly in half.",
        cuisineFact:
          "Wood ear mushrooms add no strong flavor of their own — they're prized in Vietnamese cooking for the gentle snap they lend to fillings like this and to fresh spring rolls.",
        donenessCue:
          "The noodles should bend easily without snapping, and the mushrooms should feel supple rather than brittle.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Crack 5 of the eggs whole into a large mixing bowl. Take the 6th egg, separate it, and drop just its yolk into a small bowl — that single reserved yolk becomes your glaze later. Discard or save the leftover white for another use.",
        timerSeconds: null,
        mistakeWarning:
          "Don't tip the reserved yolk into the pork bowl by habit — without it the finished top stays pale and matte instead of lacquered and golden.",
        quickHack:
          "Separate the yolk over your fingers and let the white slip through — no shells to fish out.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "To the bowl with the 5 whole eggs, add the ground pork, the drained noodles and mushrooms, the fish sauce, sugar, black pepper, and 1 1/2 teaspoons of the kosher salt (keep the remaining 1/2 teaspoon in reserve). Mix vigorously by hand for a full 5 minutes until the mixture turns tacky and cohesive.",
        timerSeconds: 300,
        mistakeWarning:
          "Under-mixing gives a crumbly terrine that won't slice cleanly — keep working it until it feels sticky and starts clinging to your hand.",
        quickHack:
          "Taste-check the seasoning by frying a teaspoon of the mix in a hot pan; if it needs more, work in the reserved 1/2 teaspoon of salt.",
        cuisineFact: null,
        donenessCue:
          "The mixture is ready when it's noticeably sticky and holds together in a single mass rather than loose clumps.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Brush an 8-inch pie tin or shallow heatproof dish with the cooking oil, then press the pork mixture in evenly, smoothing the top flat so it steams uniformly.",
        timerSeconds: null,
        mistakeWarning:
          "An uneven, mounded surface cooks at different rates and leaves the center underdone — flatten it with the back of a wet spoon.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Fill a large pot halfway with water, set a steamer rack or bamboo steamer inside, and bring it to a boil over medium heat. Lower the filled tin into the steamer, cover, and steam for 40 minutes.",
        timerSeconds: 2400,
        mistakeWarning:
          "Don't let the water level drop below the rack — check halfway through and top up with boiling water so the steam never stops.",
        quickHack: null,
        cuisineFact:
          "Steaming rather than baking keeps the terrine silky and moist, which is why Vietnamese chả is almost always cooked over water rather than in a dry oven.",
        donenessCue:
          "The terrine should be set and springy to the touch, with juices running clear when pierced near the center.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Whisk the single reserved yolk until smooth, then brush a thin, even coat over the hot terrine's surface. Cover and steam for 5 more minutes to set the glaze into a glossy golden top.",
        timerSeconds: 300,
        mistakeWarning:
          "Lay the yolk on in a thin film — a thick pour pools and steams into a wet, scrambled patch instead of a smooth lacquer.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The yolk layer should look set and lacquered — no longer wet or runny — once the extra 5 minutes are up.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Lift the tin out and let the terrine rest for 20 minutes before slicing into wedges. Serve warm over steamed rice with banh mi pickles and a swipe of sriracha.",
        timerSeconds: 1200,
        mistakeWarning:
          "Cutting in too soon makes the slices fall apart — the rest lets the egg fully firm up so each wedge holds its shape.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "After resting, a knife should pass through cleanly and the cut face should hold a sharp, intact edge.",
        imageUrl: null,
      },
    ],
  },
  "tu-vietnamese-coffee-tiramisu": {
    name: "Bánh Kem Vị Cafe (Vietnamese Coffee Tiramisu)",
    slug: "tu-vietnamese-coffee-tiramisu",
    description:
      "A diaspora tiramisu that swaps espresso for strong Vietnamese phin coffee and sweetens with condensed milk. Ladyfingers soak up the dark, sweet brew, then get layered with a custard base and an airy mascarpone cream, finished with shaved chocolate and cinnamon.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 30,
    cookTimeMinutes: 75,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_vietnamese_coffee_tiramisu.jpg",
    flavorProfile: ["bittersweet", "creamy", "coffee-forward", "rich"],
    temperature: "cold",
    ingredients: [
      {
        id: "tuviet-1",
        name: "Egg yolks",
        quantity: "3",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-2",
        name: "Cornstarch",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-3",
        name: "Whole milk",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-4",
        name: "Sweetened condensed milk",
        quantity: "1/2 can (about 7 oz)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-5",
        name: "Kosher salt",
        quantity: "2 pinches (or 1/4 tsp, divided)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-6",
        name: "Vanilla extract",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-7",
        name: "Heavy cream",
        quantity: "8 oz (1 cup)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-8",
        name: "Mascarpone",
        quantity: "8 oz",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-9",
        name: "Crème fraîche",
        quantity: "4 oz",
        isOptional: false,
        substitution: "sour cream",
      },
      {
        id: "tuviet-10",
        name: "Strong Vietnamese phin coffee, cooled",
        quantity: "2 cups",
        isOptional: false,
        substitution: "cold brew or strong drip coffee",
      },
      {
        id: "tuviet-11",
        name: "Ladyfingers",
        quantity: "1 package (about 24)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-12",
        name: "Ground cinnamon",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuviet-13",
        name: "Shaved dark chocolate",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "cocoa powder, for dusting",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Brew the phin coffee strong and let it cool fully. You want roughly 2 cups of intense, slightly sweet coffee for the soak — if it tastes thin, it will taste even thinner once it hits the cream, so brew it bolder than you would for sipping. Set it aside while you build the custard.",
        timerSeconds: null,
        mistakeWarning:
          "Soaking with hot coffee turns ladyfingers to mush. The coffee must be at or below room temperature before you dip.",
        quickHack:
          "No phin filter? A double-strength batch of cold brew or any dark drip coffee works fine.",
        cuisineFact:
          "The phin is Vietnam's single-cup drip filter — it brews slowly straight into the glass, often over a spoon of condensed milk for cà phê sữa.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Gently pasteurize the egg yolks for a safe, silky custard. Bring a pot of water to a steady 140°F and hold the whole eggs there for about 3 to 4 minutes, then plunge them into an ice bath for 3 minutes before separating out the yolks. Keep a thermometer in the water the whole time.",
        timerSeconds: 240,
        mistakeWarning:
          "Let the water climb past 145°F and the whites start to set inside the shell — keep the heat low and watch the thermometer.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The yolks are ready when they pour out glossy and intact, not firm or rubbery.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Whisk the 3 yolks with the cornstarch until pale and smooth, then season with just a PINCH of the salt (about half of what you measured out) and the vanilla. This is a sweet dessert custard, so the salt is only there to round out the condensed milk — a single pinch is all it takes.",
        timerSeconds: null,
        mistakeWarning:
          "Do not dump the full salt measurement in here. A whole teaspoon would wreck the custard — use one pinch only and reserve the rest for the mascarpone cream.",
        quickHack:
          "Sift the cornstarch in to avoid lumps before you start whisking.",
        cuisineFact: null,
        donenessCue:
          "The mixture should lighten to a pale lemon color and ribbon off the whisk.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Warm the whole milk and condensed milk together in a saucepan until just steaming, then temper it into the yolks: ladle the hot dairy in a little at a time while whisking constantly so the eggs warm up gradually instead of scrambling.",
        timerSeconds: null,
        mistakeWarning:
          "Pouring all the hot milk in at once will curdle the yolks. Go slow and keep whisking.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Tempered correctly, the mixture stays smooth and pourable with no scrambled flecks.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Return everything to the pot and cook over medium heat, whisking the whole time, for about 4 to 5 minutes until it thickens into a custard. Then cool it down — scraping it into a stand mixer bowl and beating on low helps it drop temperature fast.",
        timerSeconds: 300,
        mistakeWarning:
          "Stop whisking and the bottom scorches in seconds. Keep the whisk moving across the whole pan.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "It's done when the custard coats the back of a spoon and holds a line when you swipe a finger through it.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Once the custard is cool, fold in the mascarpone and crème fraîche until smooth, then cover and refrigerate for 1 hour to set and firm up.",
        timerSeconds: 3600,
        mistakeWarning:
          "Folding mascarpone into still-warm custard makes it loose and greasy — make sure the base is fully cooled first.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "After chilling, the custard should be thick enough to hold a soft peak.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Make the mascarpone cream: combine mascarpone, the remaining PINCH of salt, a spoonful of condensed milk, and the vanilla in a stand mixer. Pour in the heavy cream and whip on medium for about 5 minutes until it's smooth and holds soft peaks.",
        timerSeconds: 300,
        mistakeWarning:
          "Whip past stiff peaks and the cream breaks into a grainy, curdled mess. Stop the moment it holds a soft, billowy peak.",
        quickHack:
          "Chill the bowl and beaters first — cold equipment whips cream faster and more stably.",
        cuisineFact: null,
        donenessCue:
          "Soft peaks: the cream gently folds over on itself when you lift the whisk.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Assemble the tiramisu: dip each ladyfinger briefly in the cooled coffee — a quick one-second pass per side — and lay a layer in your serving dish or glasses. Alternate spoonfuls of the mascarpone cream and the chilled custard over the ladyfingers, then build a second soaked layer on top.",
        timerSeconds: null,
        mistakeWarning:
          "Hold a ladyfinger in the coffee too long and it falls apart. Dip and pull — it keeps soaking after it's plated.",
        quickHack:
          "Use clear glasses to show off the alternating coffee, custard, and cream layers.",
        cuisineFact: null,
        donenessCue:
          "A well-dipped ladyfinger is moist all the way through but still holds its shape.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 9,
        instruction:
          "Finish with shaved dark chocolate and a dusting of cinnamon over the top, then chill until you're ready to serve. A short rest in the fridge lets the layers settle into one another.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Drag a vegetable peeler down a chocolate bar for quick, elegant shavings.",
        cuisineFact:
          "Sweetened condensed milk is the through-line of Vietnamese coffee culture, so it ties the soak and the cream back to the cà phê sữa that inspired the dish.",
        donenessCue:
          "It's ready to serve cold once the top is dusted and the layers have set together.",
        imageUrl: null,
      },
    ],
  },
  "tu-brown-sugar-boba-coffee": {
    name: "Brown Sugar Boba Coffee",
    slug: "tu-brown-sugar-boba-coffee",
    description:
      "A café-style iced coffee built on Chef Tu David Phu's method: two espresso shots emulsified with caramelized brown-sugar syrup, poured over chewy crystal boba and cold milk, then crowned with lightly salted whipped cream and lemon zest. Sweet, creamy, and bittersweet all at once, it comes together in well under ten minutes with no espresso machine theatrics required.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 6,
    cookTimeMinutes: 2,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/tu_brown_sugar_boba_coffee.jpg",
    flavorProfile: ["sweet", "bittersweet", "creamy", "caramel"],
    temperature: "cold",
    ingredients: [
      {
        id: "tubrow-1",
        name: "Espresso",
        quantity: "2 shots (about 2 oz)",
        isOptional: false,
        substitution: "2 oz strong moka-pot or AeroPress coffee",
      },
      {
        id: "tubrow-2",
        name: "Caramelized brown-sugar syrup (Tiger syrup)",
        quantity: "6 tbsp (3 oz)",
        isOptional: false,
        substitution:
          "homemade brown-sugar simple syrup, simmered until it smells of caramel",
      },
      {
        id: "tubrow-3",
        name: "Heavy cream",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubrow-4",
        name: "Kosher salt",
        quantity: "1/8 tsp",
        isOptional: false,
        substitution: "small pinch of fine sea salt",
      },
      {
        id: "tubrow-5",
        name: "Ready-to-eat crystal boba",
        quantity: "2 tbsp, plus 1 tbsp for garnish",
        isOptional: false,
        substitution: "any cooked tapioca pearls",
      },
      {
        id: "tubrow-6",
        name: "Whole milk",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "oat milk or your milk of choice",
      },
      {
        id: "tubrow-7",
        name: "Ice",
        quantity: "1 cup (split between shaker and glass)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubrow-8",
        name: "Lemon",
        quantity: "1, for zest",
        isOptional: true,
        substitution: "orange zest",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Pull two shots of espresso straight into a tall frothing cup, then pour in 6 tbsp (3 oz) of the caramelized brown-sugar syrup. Work an Aero Latte or small handheld frother through the mixture until the espresso and syrup fully emulsify into one glossy, deep-amber liquid. Set this espresso syrup aside.",
        timerSeconds: 30,
        mistakeWarning:
          "Don't eyeball the syrup down to a few tablespoons — this drink is built on a full 6 tbsp (3 oz) of caramelized brown-sugar syrup. Cut it to 3 tbsp and the coffee reads thin and bitter instead of rich and bittersweet.",
        quickHack:
          "No frother? A small whisk or a lidded jar shaken hard for 15 seconds emulsifies the syrup into the espresso just as well.",
        cuisineFact:
          "Caramelized brown-sugar syrup is the same base that gives Taiwanese brown-sugar boba milk its signature tiger-stripe streaks down the glass.",
        donenessCue:
          "The mixture should look uniformly glossy with a fine, even foam — no separate dark espresso and pale syrup layers.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "In a small cup, combine the 1/4 cup heavy cream with 1/8 tsp kosher salt. Whip with the frother until the cream reaches the ribbon stage — thick enough that it falls back on itself in a slowly dissolving ribbon. Slide it into the fridge while you build the drink, and give it a quick re-whisk if it loosens.",
        timerSeconds: 45,
        mistakeWarning:
          "Stop at the ribbon stage — push past it and the cream turns to stiff butter-grain that won't pour or float cleanly on top.",
        quickHack:
          "Chilling the cup and cream beforehand gets you to the ribbon stage noticeably faster.",
        cuisineFact: null,
        donenessCue:
          "Lift the frother — the cream should drape off in a ribbon that holds its shape for a moment before melting back into the surface.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Spoon 2 tbsp of ready-to-eat crystal boba into the bottom of a highball glass, then fill the glass with ice. Pour the 1/4 cup whole milk over the ice so it pools around the pearls.",
        timerSeconds: null,
        mistakeWarning:
          "Use boba that's already at room temperature or warm — straight-from-the-fridge cold pearls turn firm and lose their signature chew.",
        quickHack:
          "Layering boba and ice first, milk second, keeps the pearls from clumping at the very bottom where they're hard to sip up the straw.",
        cuisineFact:
          "Crystal boba is made from agar and konjac rather than tapioca, so it stays translucent and bouncy instead of going cloudy.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Pour the emulsified espresso syrup over the milk and ice. It will sink and bloom through the milk in dark caramel ribbons.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Pour slowly down the inside wall of the glass to draw out the tiger-stripe streaking effect before you stir.",
        cuisineFact: null,
        donenessCue:
          "You'll see distinct dark espresso-syrup streaks marbling down through the pale milk.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Spoon the salted whipped cream over the top, then garnish with the remaining 1 tbsp crystal boba and a fine grating of lemon zest. Stir vigorously right before drinking so the cream, syrup, and milk pull together into one balanced sip.",
        timerSeconds: null,
        mistakeWarning:
          "Don't pre-mix and let it sit — stir vigorously only at the moment of drinking, or the whipped cream collapses and the layers go flat.",
        quickHack:
          "Zest the lemon directly over the glass so the citrus oils spray across the cream — that aromatic lift is what cuts the sweetness.",
        cuisineFact: null,
        donenessCue:
          "Once stirred, the drink should be an even mocha-caramel color throughout with boba settled at the base.",
        imageUrl: null,
      },
    ],
  },
};

export const CHEF_TU_MEAL_FLOWS_2: Record<string, StaticDishData> = {
  "tu-pho-dac-biet": {
    name: "Phở Đặc Biệt (Special Beef Pho)",
    slug: "tu-pho-dac-biet",
    description:
      "Chef Tu David Phu's special beef pho layers a clear, marrow-deep broth with toasted whole spices, charred aromatics, and a full slate of beef cuts, finished over rice noodles and a flourish of fresh herbs.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 40,
    cookTimeMinutes: 450,
    skillLevel: "advanced",
    heroImageUrl: "/food_images/tu_pho_dac_biet.jpg",
    flavorProfile: ["savory", "aromatic", "warming", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "tuphod-1",
        name: "beef neck bones",
        quantity: "3 lb",
        isOptional: false,
        substitution: "knuckle or leg bones with marrow",
      },
      {
        id: "tuphod-2",
        name: "beef brisket",
        quantity: "2 lb",
        isOptional: false,
        substitution: "beef shank",
      },
      {
        id: "tuphod-3",
        name: "beef tendon",
        quantity: "3 pieces",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tuphod-4",
        name: "beef tripe",
        quantity: "1 lb",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tuphod-5",
        name: "beef balls",
        quantity: "8 oz",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tuphod-6",
        name: "yellow onion",
        quantity: "1 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-7",
        name: "fresh ginger, unpeeled",
        quantity: "2 oz (a thumb-sized knob)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-8",
        name: "garlic",
        quantity: "1 head",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-9",
        name: "star anise",
        quantity: "5 pods",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-10",
        name: "cinnamon stick",
        quantity: "1 stick",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-11",
        name: "fennel seeds",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-12",
        name: "whole cloves",
        quantity: "1/4 tsp (about 4 cloves)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-13",
        name: "fish sauce",
        quantity: "4 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-14",
        name: "kosher salt",
        quantity: "2 tbsp, divided",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-15",
        name: "sugar",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "rock sugar",
      },
      {
        id: "tuphod-16",
        name: "water",
        quantity: "16 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-17",
        name: "flat rice noodles (banh pho)",
        quantity: "1 lb dried",
        isOptional: false,
        substitution: "fresh rice noodles",
      },
      {
        id: "tuphod-18",
        name: "scallions, thinly sliced",
        quantity: "4",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-19",
        name: "cilantro",
        quantity: "1 small bunch",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuphod-20",
        name: "Thai basil",
        quantity: "1 bunch",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tuphod-21",
        name: "lime wedges",
        quantity: "2 limes",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Drop the neck bones, brisket, and tendon into a big pot, cover with cold water, and add 1 tablespoon of the salt. Bring to a hard boil for 10 minutes, then dump everything into a colander and rinse the bones and meat under running water until they look clean.",
        timerSeconds: 600,
        mistakeWarning:
          "Don't skip this parboil — the gray scum and blood it pulls out is exactly what clouds a pho broth. A cloudy broth is the single most common first-timer mistake.",
        quickHack: null,
        cuisineFact:
          "A clear, almost amber broth is the mark of a great pho; Vietnamese cooks judge a bowl by how clean the liquid reads before they ever taste it.",
        donenessCue:
          "The water will turn murky and throw up foam within a couple of minutes — that's the impurities you're rinsing away.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Halve the onion and the unpeeled ginger and smash the whole garlic head. Char them cut-side down directly over a gas flame or under the broiler until blackened in spots, about 8 minutes, turning once.",
        timerSeconds: 480,
        mistakeWarning: null,
        quickHack:
          "No open flame? Lay them on a dry cast-iron skillet over high heat — you want real blistered char, not just color.",
        cuisineFact:
          "Charring the aromatics is non-negotiable in pho; the scorched, slightly bitter edge is what gives the broth its signature smoky backbone.",
        donenessCue:
          "The cut faces should be deeply blackened and the kitchen should smell sweet and toasty.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "In a dry pan over low heat, toast the star anise, cinnamon, fennel seeds, and cloves until they turn fragrant and a thread of smoke rises, 3 to 4 minutes, shaking constantly. Tip them into a spice bag or a tied square of cheesecloth.",
        timerSeconds: 210,
        mistakeWarning:
          "Keep the heat low and never walk away — whole spices scorch in seconds, and burnt anise turns the whole broth bitter.",
        quickHack:
          "Bundling the spices in cloth means you can pull them later for a cleaner-tasting broth and skip straining whole pods out of every bowl.",
        cuisineFact: null,
        donenessCue:
          "They're ready the instant they smell strongly perfumed and just begin to wisp smoke.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Return the rinsed bones, brisket, and tendon to the clean pot. Add the 16 cups water, the charred aromatics, the spice bag, the sugar, and the remaining 1 tablespoon salt. Bring to a boil, then drop to the barest simmer.",
        timerSeconds: null,
        mistakeWarning:
          "Resist a rolling boil from here on — aggressive bubbling emulsifies the fat back into the liquid and clouds it. You want lazy bubbles breaking the surface, nothing more.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "A correct simmer shows only the occasional bubble lazily rising, not a churning surface.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Simmer gently for 7 hours, skimming the foam and fat off the top every 30 minutes or so. Pull the brisket and tendon out at the 4-hour mark so they don't fall apart, cool them, and refrigerate until assembly.",
        timerSeconds: null,
        mistakeWarning:
          "Leaving the brisket in the whole time turns it to dry, stringy mush — 4 hours is plenty for slicing.",
        quickHack:
          "Frequent skimming is the real secret to clarity; a small fine-mesh ladle makes it painless.",
        cuisineFact:
          "Seven hours is the floor, not the ceiling — many pho houses run their bone broth overnight to coax every bit of collagen out of the marrow.",
        donenessCue:
          "The brisket is done when a fork slides in with mild resistance and the tendon has turned translucent and gelatinous.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "If using tripe, add it for the final hour; add the beef balls in the last 10 minutes just to heat through. Lift out and discard the spice bag and aromatics, then stir in the fish sauce. Taste and adjust with a pinch more salt or sugar until the broth is rounded and savory.",
        timerSeconds: null,
        mistakeWarning:
          "Add the fish sauce at the end, not the start — a long simmer dulls its bright funk and can turn it harsh.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Balanced broth hits salty, faintly sweet, and deeply beefy all at once, with no single note jumping out.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Soak the dried rice noodles in warm water until pliable, then blanch in boiling water just until tender, 20 to 30 seconds, and drain. Slice the chilled brisket and tendon as thinly as you can across the grain.",
        timerSeconds: 30,
        mistakeWarning:
          "Overcooked noodles go gummy fast — they finish softening in the hot broth, so pull them while they still have a slight bite.",
        quickHack:
          "Chilling the brisket firms it up so you can cut paper-thin slices that drape beautifully in the bowl.",
        cuisineFact: null,
        donenessCue:
          "The noodles should be silky and just yielding, never mushy or sticking in clumps.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Pile about 4 oz of noodles into each warmed bowl, fan the sliced meats and tripe on top, and ladle roughly 10 oz of the screaming-hot broth over everything. Scatter with scallions and cilantro, and serve with Thai basil and lime on the side.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "The broth must be near-boiling when it hits the bowl — that final heat is what gently cooks any rare meat and wakes up the herbs.",
        cuisineFact:
          "The herb plate is the diner's instrument: each person tears basil, squeezes lime, and tunes the bowl to their own taste at the table.",
        donenessCue:
          "You'll know it's right when the herbs wilt on contact and the steam carries that warm anise-and-beef aroma straight up.",
        imageUrl: null,
      },
    ],
  },
  "tu-turkey-pho": {
    name: "Phở Gà Tây (Turkey Pho)",
    slug: "tu-turkey-pho",
    description:
      "Chef Tu David Phu's thrifty post-Thanksgiving riff on phở gà, simmering a leftover roasted turkey carcass into a clear, charred-aromatic Vietnamese noodle broth.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 20,
    cookTimeMinutes: 195,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_turkey_pho.jpg",
    flavorProfile: ["savory", "aromatic", "warming", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "tuturk-1",
        name: "Leftover roasted turkey carcass (bones, plus any clinging meat)",
        quantity: "1 carcass (from a ~20 lb bird)",
        isOptional: false,
        substitution:
          "Leftover roast chicken carcasses, enough to fill the pot",
      },
      {
        id: "tuturk-2",
        name: "Filtered water",
        quantity: "4 quarts",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuturk-3",
        name: "Yellow onion",
        quantity: "1 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuturk-4",
        name: "Fresh ginger",
        quantity: "2 oz (a thumb-length knob)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuturk-5",
        name: "Garlic cloves",
        quantity: "8 cloves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuturk-6",
        name: "Chinese five-spice powder",
        quantity: "1 tbsp",
        isOptional: false,
        substitution:
          "Whole star anise, cinnamon stick, cloves, and coriander seed toasted together",
      },
      {
        id: "tuturk-7",
        name: "Fish sauce",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuturk-8",
        name: "Organic sugar",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "Yellow rock sugar or light brown sugar",
      },
      {
        id: "tuturk-9",
        name: "Kosher salt",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuturk-10",
        name: "Dried flat rice noodles (banh pho)",
        quantity: "14 oz",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuturk-11",
        name: "Cilantro leaves",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuturk-12",
        name: "Scallions, thinly sliced",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuturk-13",
        name: "Jalapeno, thinly sliced",
        quantity: "1",
        isOptional: true,
        substitution: "Thai bird chili for more heat",
      },
      {
        id: "tuturk-14",
        name: "Hoisin sauce",
        quantity: "to serve",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tuturk-15",
        name: "Sriracha",
        quantity: "to serve",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Cut the onion in half and leave the ginger and garlic unpeeled. Set them under a broiler on low and let them blacken, turning every 5 to 7 minutes so every face takes on char. You want the cut onion deeply browned and the ginger skin blistered, about 12 to 15 minutes total. Once cool enough to handle, rub the loose papery char off the ginger and garlic but leave the smoky color behind.",
        timerSeconds: 840,
        mistakeWarning:
          "Skipping the char is the most common pho shortcut, and it leaves the broth flat and pale instead of amber and fragrant.",
        quickHack:
          "No broiler? Lay the aromatics directly on a gas flame or in a dry cast-iron skillet over high heat until blackened.",
        cuisineFact:
          "Charring onion and ginger over open flame is the signature move that gives phở its toasted-sweet backbone and clean golden color.",
        donenessCue:
          "Cut faces of the onion are darkly browned and the ginger skin is blistered and blackened in patches.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Warm a dry pan over low heat and add the five-spice powder. Toast it gently, shaking the pan almost constantly, just until it smells fragrant and warm, 2 to 3 minutes. Pull it off the heat the moment the aroma blooms.",
        timerSeconds: 150,
        mistakeWarning:
          "Ground spice scorches in seconds over anything hotter than low heat, turning the whole broth bitter, so keep it moving and watch it closely.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The spice turns a shade darker and releases a sweet, woody aroma.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Pile the turkey carcass into a tall stockpot, tucking in the charred onion, ginger, and garlic along with the toasted spice. Pour in the 4 quarts of filtered water, enough to submerge the bones. Bring it up to a bare simmer over medium heat, never a rolling boil.",
        timerSeconds: 600,
        mistakeWarning:
          "A hard boil emulsifies the fat and turns the broth cloudy and greasy; you want only lazy bubbles breaking the surface.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Small bubbles rise lazily and the surface barely trembles.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Let the pot simmer uncovered for about 3 hours, skimming the gray foam and excess fat off the top every 20 to 30 minutes. Regular skimming is what keeps a clear, clean broth.",
        timerSeconds: 10800,
        mistakeWarning:
          "If you walk away and let the foam build, it folds back into the liquid and muddies the broth permanently.",
        quickHack:
          "Drop a peeled, whole carrot in for the last hour if you want a touch more natural sweetness.",
        cuisineFact: null,
        donenessCue:
          "The broth is deeply savory, lightly golden, and tastes of turkey rather than water.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Strain the broth through a fine-mesh sieve into a clean pot and discard the spent bones and aromatics. Pick off any worthwhile shreds of turkey meat and set them aside for serving. Now season the broth: stir in the fish sauce and sugar, then add about two-thirds of the salt. Taste, and add the rest of the salt only if it needs it.",
        timerSeconds: null,
        mistakeWarning:
          "Don't dump in all the salt at once. Different carcasses carry different amounts of seasoning, so build it up and taste as you go.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The broth tastes balanced, rounded, and savory with a faint sweetness, not sharp or thin.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "While the broth is hot, cook the dried rice noodles according to the package, usually a brief soak in boiling water until just tender, then drain. Divide the noodles among bowls and top each with the reserved turkey meat.",
        timerSeconds: 420,
        mistakeWarning:
          "Overcooked rice noodles go gummy and break apart in the bowl; pull them while they still have a little bite since the hot broth keeps softening them.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Noodles are tender and pliable but still hold their shape.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Ladle the steaming broth over the noodles and turkey, then crown each bowl with cilantro, sliced scallions, and jalapeno. Pass hoisin and sriracha at the table so everyone can dial in their own bowl.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Squeeze the hoisin and sriracha into a side dish for dipping the meat rather than muddying the broth, the way many Vietnamese cooks prefer.",
        cuisineFact:
          "Building your own bowl with herbs, chili, and condiments at the table is half the ritual of eating phở.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-soondubu-jjigae": {
    name: "Soondubu Jjigae (Spicy Seafood Tofu Stew)",
    slug: "tu-soondubu-jjigae",
    description:
      "Chef Tu David Phu's loaded seafood soondubu: a fiery, kimchi-spiked tofu stew brightened with lemongrass and ginger, piled with clams, mussels, shrimp, and squid.",
    cuisineFamily: "korean",
    prepTimeMinutes: 30,
    cookTimeMinutes: 40,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_soondubu_jjigae.jpg",
    flavorProfile: ["spicy", "umami", "briny", "savory"],
    temperature: "hot",
    ingredients: [
      {
        id: "tusoon-1",
        name: "avocado oil",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "any neutral high-smoke-point oil",
      },
      {
        id: "tusoon-2",
        name: "small onion, diced",
        quantity: "1",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-3",
        name: "scallion bottoms, sliced",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-4",
        name: "garlic, minced",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-5",
        name: "fresh ginger, minced",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-6",
        name: "lemongrass, minced",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "the pale lower third of one stalk",
      },
      {
        id: "tusoon-7",
        name: "gochugaru (Korean chili flakes)",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-8",
        name: "napa cabbage kimchi, chopped",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-9",
        name: "fish sauce",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-10",
        name: "filtered water",
        quantity: "3 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-11",
        name: "clams, rinsed",
        quantity: "1.5 lbs",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-12",
        name: "mussels, rinsed and debearded",
        quantity: "2 lbs",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-13",
        name: "silken tofu",
        quantity: "14 oz",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-14",
        name: "squid, cut into 1/4-inch rings",
        quantity: "1/2 lb",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-15",
        name: "large shrimp, peeled and deveined",
        quantity: "8",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-16",
        name: "sesame oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tusoon-17",
        name: "toasted sesame seeds",
        quantity: "3 tbsp",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tusoon-18",
        name: "scallion tops, sliced",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Set a heavy pot over high heat and add the avocado oil. Once it shimmers, tip in the diced onion, scallion bottoms, ginger, garlic, lemongrass, and gochugaru all at once. Stir constantly so the chili flakes bloom without scorching, until the aromatics soften and the oil turns a deep red, about 3 minutes.",
        timerSeconds: 180,
        mistakeWarning:
          "Gochugaru burns fast over high heat and turns bitter. Keep everything moving and pull the pot off the burner for a moment if it starts to smoke.",
        quickHack: null,
        cuisineFact:
          "Chef Tu folds lemongrass and ginger into a Korean classic, a nod to the Vietnamese flavors he grew up with in Oakland.",
        donenessCue:
          "The oil should look glossy and brick-red, and the kitchen should smell sweet and toasty, not acrid.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add the chopped kimchi and stir it through the aromatics for about a minute to take off its raw edge. Pour in 1 tablespoon of the fish sauce and let it sizzle for a few seconds, then add the 3 cups of water.",
        timerSeconds: 90,
        mistakeWarning: null,
        quickHack:
          "Use the brine clinging to the kimchi too, not just the cabbage. It carries fermented funk that deepens the broth.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Drop in the clams, cover the pot, and bring the broth to a steady simmer. Let the clams cook covered for 10 minutes before adding any other shellfish, since their tougher shells need a head start to open.",
        timerSeconds: 600,
        mistakeWarning:
          "Before they go in, tap any open clams against the counter. If they don't close, discard them, as they were already dead.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The broth should be at a rolling simmer with steam escaping the lid.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add the mussels, re-cover, and keep everything at a brisk simmer until the shells gape open, another 8 to 10 minutes. Stir gently once partway through to redistribute the heat.",
        timerSeconds: 540,
        mistakeWarning:
          "Don't keep cooking trying to coax open the last stubborn shells. Any clam or mussel still shut at the end stays shut and gets discarded.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Nearly every shell should be wide open and the meat plump inside.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Spoon in the silken tofu in large medium-diced pieces along with the squid rings. Stir the remaining 2 tablespoons of fish sauce into the broth, then fold everything once or twice from the bottom of the pot, lifting rather than stirring so the tofu stays in pillowy chunks. Bring back to a gentle simmer.",
        timerSeconds: 120,
        mistakeWarning:
          "Aggressive stirring shreds silken tofu into the broth. Use a wide spoon and fold from underneath in slow, deliberate motions.",
        quickHack:
          "Taste the broth here before the final seafood goes in and adjust with a splash more fish sauce only if it needs it.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Lay the shrimp across the top of the stew, cover, and return to a simmer just until the shrimp turn opaque and curl, about 3 minutes. Squid only needs this brief window too, so resist cooking longer.",
        timerSeconds: 180,
        mistakeWarning:
          "Shrimp and squid both turn rubbery within seconds of overcooking. Pull the pot the moment the shrimp lose their gray translucency.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The shrimp should be pink and C-shaped, and the squid rings firm and bright white.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Ladle the stew into bowls, arranging the open clams and mussels shell-side up and discarding any that never opened. Finish each bowl with a drizzle of sesame oil, a scatter of toasted sesame seeds, and the sliced scallion tops. Serve piping hot with steamed rice alongside.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Soondubu is named for soft tofu (sundubu) and traditionally arrives at the table still bubbling in a stone earthenware pot called a ttukbaegi.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-bun-rieu": {
    name: "Bún Riêu (Crab & Tomato Noodle Soup)",
    slug: "tu-bun-rieu",
    description:
      "Chef Tu David Phu's take on the classic Hanoi street soup, where pork ribs and chicken stock build a clean broth that's stained tomato-red and crowned with savory crab-and-pork riêu meatballs over rice vermicelli.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 40,
    cookTimeMinutes: 90,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_bun_rieu.jpg",
    flavorProfile: ["savory", "tangy", "umami", "aromatic"],
    temperature: "hot",
    ingredients: [
      {
        id: "tubunr-1",
        name: "pork ribs",
        quantity: "1.5 lbs",
        isOptional: false,
        substitution: "pork neck bones",
      },
      {
        id: "tubunr-2",
        name: "chicken stock",
        quantity: "1 gallon",
        isOptional: false,
        substitution: "pork stock or water with bouillon",
      },
      {
        id: "tubunr-3",
        name: "ripe tomatoes, quartered",
        quantity: "2 lbs",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-4",
        name: "shallots, minced",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "yellow onion",
      },
      {
        id: "tubunr-5",
        name: "fermented shrimp paste (mắm tôm or mắm ruốc)",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "extra 1 tbsp fish sauce for a milder broth",
      },
      {
        id: "tubunr-6",
        name: "fish sauce",
        quantity: "3 tbsp total (2 for broth, 1 for meatballs)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-7",
        name: "MSG",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "a pinch of sugar plus extra fish sauce",
      },
      {
        id: "tubunr-8",
        name: "ground pork",
        quantity: "1/2 lb",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-9",
        name: "crab paste in soybean oil (Gia Vị Cua)",
        quantity: "1 jar (about 3 oz)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-10",
        name: "lump crab meat",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-11",
        name: "shrimp meat, finely chopped",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-12",
        name: "dried shrimp, soaked and minced",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-13",
        name: "large eggs",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-14",
        name: "kosher salt",
        quantity: "2 tsp total, divided",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-15",
        name: "sugar",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-16",
        name: "black pepper",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-17",
        name: "fresh ginger, smashed",
        quantity: "2-inch piece",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-18",
        name: "fried puff tofu",
        quantity: "8 oz",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tubunr-19",
        name: "dried rice vermicelli (bún)",
        quantity: "1 lb",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-20",
        name: "fresh herbs (perilla/tía tô, mint, cilantro, scallions)",
        quantity: "2 cups, mixed",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunr-21",
        name: "garnishes (bean sprouts, shredded banana blossom, lime wedges, Thai chili)",
        quantity: "to serve",
        isOptional: false,
        substitution: "bean sprouts and lime alone are fine",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Cover the pork ribs with cold water in a pot, add the smashed ginger, 1 teaspoon of the salt, and the sugar, and bring to a hard boil. Once the scum rises and the ribs lose their raw color, drain everything and rinse the ribs clean under running water.",
        timerSeconds: 300,
        mistakeWarning:
          "Don't skip this parboil-and-dump step. The first boil pulls out blood and impurities that would otherwise cloud your finished broth into a murky gray.",
        quickHack: null,
        cuisineFact:
          "Vietnamese cooks call this first-boil-and-discard step 'chần', and it's the single biggest reason a homemade noodle-soup broth comes out crystal clear.",
        donenessCue:
          "The water will be foamy and gray and the rib surfaces will have firmed up and turned pale.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Soften the dried shrimp by soaking them in warm water for about 15 minutes, then mince fine. In a dry pan over medium heat, warm a spoonful of oil and fry the minced dried shrimp with the crab paste from the jar until the kitchen smells deeply of the sea, then scrape it onto a plate to cool completely.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack:
          "The crab paste already carries plenty of oil, so you barely need to add any — just enough to keep the dried shrimp from scorching.",
        cuisineFact: null,
        donenessCue:
          "The paste turns glossy and fragrant and the dried shrimp darken slightly at the edges.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Once the crab-and-shrimp mixture is cool, fold it into the ground pork along with the chopped shrimp meat, lump crab, eggs, 1 tablespoon of the fish sauce, the black pepper, and the remaining 1 teaspoon of salt. Mix until it just holds together — it should be a loose, spoonable paste rather than a tight ball. Chill it while you build the broth.",
        timerSeconds: null,
        mistakeWarning:
          "Resist over-mixing or packing this tight. Riêu is meant to bloom into airy, almost soufflé-like curds, not dense meatballs, so a loose mixture is correct.",
        quickHack: null,
        cuisineFact:
          "The word 'riêu' refers to the floating crab raft that forms on top of the soup — traditionally made from hand-pounded paddy crab, with the curds rising and clumping as they cook.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Warm a little oil in your soup pot over medium heat and sweat the minced shallots until soft and aromatic, then add the quartered tomatoes and cook until they slump and start releasing their juice.",
        timerSeconds: 420,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The tomatoes collapse, soften at the edges, and their juice stains the shallots a warm orange-red.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Return the rinsed ribs to the pot, pour in the chicken stock, and add the MSG if using. Bring to a boil, then drop to a gentle simmer and let it work for 40 minutes so the ribs give up their flavor and the tomato fully dissolves into the broth.",
        timerSeconds: 2400,
        mistakeWarning:
          "Keep it at a lazy simmer, never a rolling boil — hard boiling emulsifies the fat and turns a clear broth greasy and cloudy.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The broth turns a rich tomato-red and the rib meat is tender enough to pull from the bone.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Stir the fermented shrimp paste and remaining 2 tablespoons of fish sauce into the simmering broth, then taste and adjust — it should land savory, gently funky, and a touch tangy from the tomato.",
        timerSeconds: null,
        mistakeWarning:
          "Add the mắm tôm a little at a time. It's intensely pungent, and too much will flatten the bright soup into something one-note and overpowering.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "With the broth at a bare simmer, scoop heaping spoonfuls of the chilled crab mixture and slide them in to poach. Leave them undisturbed for 6 minutes until they set and bob to the surface, then gently lower in the fried tofu and let everything simmer together another 10 minutes.",
        timerSeconds: 360,
        mistakeWarning:
          "Don't stir once the riêu goes in — poking at the soft curds breaks them apart and clouds the broth. Let them firm up on their own before they float.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The crab curds are cooked through when they have risen and float on the surface, holding their shape.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Meanwhile, boil the rice vermicelli for 3 minutes until just tender, then drain and rinse hard under cold water to halt the cooking and rinse off surface starch. Divide the noodles into bowls, ladle over the hot broth with riêu, ribs, and tofu, and finish each bowl at the table with herbs, bean sprouts, banana blossom, a squeeze of lime, and chili to taste.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack:
          "Rinsing the cooked noodles cold keeps them springy and separate, so they don't clump into a starchy mat once the hot broth hits them.",
        cuisineFact: null,
        donenessCue:
          "The vermicelli is done when a strand is tender all the way through with no chalky white center.",
        imageUrl: null,
      },
    ],
  },
  "tu-banh-canh-gio-heo-tom": {
    name: "Bánh Canh Giò Heo Tôm (Pork & Shrimp Tapioca Noodle Soup)",
    slug: "tu-banh-canh-gio-heo-tom",
    description:
      "Chef Tu David Phu's homage to Vietnamese bánh canh: chewy fresh tapioca noodles in a deep pork-bone broth, crowned with poached shrimp, squid, and tender pork hock.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 45,
    cookTimeMinutes: 150,
    skillLevel: "advanced",
    heroImageUrl: "/food_images/tu_banh_canh_gio_heo_tom.jpg",
    flavorProfile: ["savory", "umami", "porky", "briny"],
    temperature: "hot",
    ingredients: [
      {
        id: "tubanh-1",
        name: "tapioca flour",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-2",
        name: "rice flour (plain, not glutinous)",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-3",
        name: "boiling water (for the dough)",
        quantity: "4 1/2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-4",
        name: "pork knuckle bones",
        quantity: "2 lbs",
        isOptional: false,
        substitution: "pork neck bones",
      },
      {
        id: "tubanh-5",
        name: "pork shank, cut in large pieces",
        quantity: "1 1/2 lbs",
        isOptional: false,
        substitution: "pork hock (giò heo)",
      },
      {
        id: "tubanh-6",
        name: "pork ribs, cut into sections",
        quantity: "1 1/2 lbs",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-7",
        name: "chicken stock",
        quantity: "8 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-8",
        name: "filtered water",
        quantity: "4 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-9",
        name: "yellow onion, large-diced",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-10",
        name: "carrots, large-diced",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-11",
        name: "daikon, large-diced",
        quantity: "1",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-12",
        name: "jicama, large-diced",
        quantity: "1",
        isOptional: true,
        substitution: "extra daikon for sweetness",
      },
      {
        id: "tubanh-13",
        name: "scallion bottoms",
        quantity: "1 bunch",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-14",
        name: "garlic cloves",
        quantity: "8",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-15",
        name: "cane sugar",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-16",
        name: "fish sauce",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-17",
        name: "kosher salt",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-18",
        name: "Knorr Hạt Nêm seasoning",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "MSG, or omit",
      },
      {
        id: "tubanh-19",
        name: "shrimp, shell-on, deveined",
        quantity: "1 lb",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-20",
        name: "squid, cleaned",
        quantity: "1 lb",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tubanh-21",
        name: "mung bean sprouts",
        quantity: "for serving",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-22",
        name: "culantro, scallion tops, and cilantro, chopped",
        quantity: "for serving",
        isOptional: false,
        substitution: "cilantro alone if culantro is unavailable",
      },
      {
        id: "tubanh-23",
        name: "fried shallots",
        quantity: "for serving",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubanh-24",
        name: "lime wedges and bird's-eye chilies in fish sauce",
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
          "Whisk the tapioca flour and rice flour together in a stand mixer bowl. With the dough hook running slowly, stream in the 4 1/2 cups of boiling water in a thin ribbon. The starch will seize into shaggy clumps almost instantly; keep mixing on medium until it pulls together into one smooth, taffy-like ball that cleans the sides of the bowl.",
        timerSeconds: null,
        mistakeWarning:
          "The water must be at a true rolling boil, at least 185°F, when it hits the flour. Lukewarm water will not gelatinize the tapioca and the dough will stay gritty and refuse to bind.",
        quickHack:
          "Short on time? Skip the homemade noodles entirely and use store-bought fresh bánh canh or thick udon-style tapioca noodles, blanching them per the package.",
        cuisineFact:
          "Bánh canh gets its signature slippery, springy bite from tapioca starch, which turns translucent and chewy rather than soft like a wheat noodle.",
        donenessCue:
          "The dough is ready when it is smooth, glossy, and stretches without tearing.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Dust a counter with rice flour and roll the dough out to about a third of an inch thick. Cut it into matchstick strips a third of an inch wide, tossing them with more rice flour so they don't fuse. Drop the strips in small handfuls into a big pot of boiling water, stirring hard to keep them separate, then blanch until they float up translucent and chewy.",
        timerSeconds: 180,
        mistakeWarning:
          "Crowding the pot makes the noodles clump into one mass. Cook them in small batches and stir aggressively.",
        quickHack:
          "Rinse the cooked noodles under cold water and toss with a little oil so they hold at room temperature without sticking.",
        cuisineFact: null,
        donenessCue:
          "Noodles are done when they turn from chalky white to translucent and bounce back when bitten.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Now build the broth. Put the pork knuckle bones, shank, and ribs in a stockpot, cover with cold water, add 4 smashed garlic cloves, and boil hard for 5 minutes to drive out the scum. Dump everything into a colander and rinse the pork clean under running water, scrubbing off any clinging gray foam.",
        timerSeconds: 300,
        mistakeWarning:
          "Don't skip this blanch-and-rinse. It is the single biggest factor between a crystal-clear broth and a cloudy, muddy one.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The pork is ready to rinse once the surface foam has bloomed and the water is cloudy with impurities.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Return the cleaned pork to a clean pot with the chicken stock, the 4 cups of filtered water, the onion, carrots, daikon, jicama, scallion bottoms, and remaining 4 garlic cloves. Bring to the barest simmer and hold it there, skimming the surface every so often, until the shank is fork-tender and the broth tastes deeply of pork.",
        timerSeconds: 5400,
        mistakeWarning:
          "Keep it at a lazy simmer, never a rolling boil. A hard boil emulsifies the fat back into the liquid and clouds the broth.",
        quickHack: null,
        cuisineFact:
          "Daikon and jicama are the sweetening trick in many Vietnamese soups, building body and a clean backbone of sweetness without any added sugar.",
        donenessCue:
          "Broth is ready when a piece of shank slides off a chopstick and the liquid is rich and aromatic.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Fish out and discard the spent vegetables, leaving the pork in the pot to stay warm. Stir in the sugar, fish sauce, kosher salt, and the Hạt Nêm if using, then let the broth simmer gently to marry the seasoning. Taste and adjust toward a savory-sweet balance.",
        timerSeconds: 1800,
        mistakeWarning: null,
        quickHack:
          "Season in stages and taste as you go; you can always add more fish sauce or salt, but you can't pull it back out.",
        cuisineFact: null,
        donenessCue:
          "Properly seasoned, the broth should taste full and round, leaning savory with a faint sweet edge, not flatly salty.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "With the broth at a gentle simmer, slip in the shrimp and poach just until they curl and turn opaque, then lift them out. Add the squid and poach only briefly until it turns white and firms up, then pull it immediately. Set the seafood aside.",
        timerSeconds: 90,
        mistakeWarning:
          "Squid overcooks in seconds and turns to rubber. Poach it for under a minute and remove it the instant it goes opaque.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Shrimp are done when they form a loose C and turn pink-orange; a tight O means they've gone too far.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Assemble each bowl: a nest of warm bánh canh noodles, then pieces of pulled pork shank and ribs, then the poached shrimp and squid. Ladle the screaming-hot broth over the top so it reheats everything, and finish with bean sprouts, culantro, scallion, cilantro, fried shallots, and black pepper. Serve with lime wedges and chilies in fish sauce on the side.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Reheat the noodles by ladling hot broth over them right in the bowl; there's no need to re-boil them.",
        cuisineFact:
          "The pile of fresh herbs, lime, and macerated chilies isn't garnish but a build-your-own bar so each eater tunes the bowl's acidity and heat at the table.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-mi-hoanh-thanh": {
    name: "Mì Hoành Thánh (Combination Wonton Egg Noodle Soup)",
    slug: "tu-mi-hoanh-thanh",
    description:
      "Chef Tu David Phu's combination wonton egg noodle soup layers a double pork-and-chicken broth with plump shrimp-pork wontons, springy egg noodles, char siu, and Chinese broccoli for a fully loaded bowl.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 45,
    cookTimeMinutes: 95,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_mi_hoanh_thanh.jpg",
    flavorProfile: ["savory", "umami", "aromatic", "brothy"],
    temperature: "hot",
    ingredients: [
      {
        id: "tumiho-1",
        name: "lean ground pork",
        quantity: "1 lb (for wonton filling)",
        isOptional: false,
        substitution: "ground chicken thigh",
      },
      {
        id: "tumiho-2",
        name: "shrimp (10/20), peeled, deveined, diced small",
        quantity: "1 lb (for filling)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-3",
        name: "garlic chives, sliced",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "regular chives plus a clove of minced garlic",
      },
      {
        id: "tumiho-4",
        name: "shiitake mushrooms, small-diced",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "rehydrated dried shiitake",
      },
      {
        id: "tumiho-5",
        name: "fresh ginger, minced",
        quantity: "4 tsp total (2 tsp filling, 2 tsp broth)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-6",
        name: "large egg",
        quantity: "1",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-7",
        name: "toasted sesame oil",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-8",
        name: "wonton wrappers",
        quantity: "1 package (~40)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-9",
        name: "pork stock",
        quantity: "2 qts",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-10",
        name: "chicken stock",
        quantity: "2 qts",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-11",
        name: "dried shrimp",
        quantity: "10",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-12",
        name: "sliced shiitake mushrooms (for broth)",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-13",
        name: "fish sauce (well-aged)",
        quantity: "2 tbsp + 1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-14",
        name: "kosher salt",
        quantity: "1 tsp (broth) + 1/2 tsp (filling)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-15",
        name: "sugar",
        quantity: "1 tbsp (broth) + 1/2 tsp (filling)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-16",
        name: "ground black pepper",
        quantity: "1/8 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-17",
        name: "fresh kaedama egg noodles",
        quantity: "20 oz (4 oz per portion)",
        isOptional: false,
        substitution: "any fresh thin egg noodle",
      },
      {
        id: "tumiho-18",
        name: "gai lan (Chinese broccoli)",
        quantity: "8-10 stems",
        isOptional: false,
        substitution: "baby bok choy or yu choy",
      },
      {
        id: "tumiho-19",
        name: "char siu BBQ pork, sliced",
        quantity: "3-4 slices per bowl",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tumiho-20",
        name: "fish balls and/or beef balls",
        quantity: "3-4 each",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tumiho-21",
        name: "scallions, sliced",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumiho-22",
        name: "Chinese red vinegar",
        quantity: "1/4 cup, for serving",
        isOptional: true,
        substitution: "black vinegar",
      },
      {
        id: "tumiho-23",
        name: "chili paste or satay",
        quantity: "to taste, for serving",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Build the wonton filling: in a bowl, combine the ground pork, diced shrimp, garlic chives, diced shiitake, 2 tsp of the minced ginger, the 1/4 tsp fish sauce, and the sesame oil. Season with the 1/2 tsp salt, 1/2 tsp sugar, and all the black pepper, then mix vigorously by hand for about 5 minutes until it pulls together into one cohesive, tacky mass.",
        timerSeconds: 300,
        mistakeWarning:
          "Don't under-mix. If the filling still looks loose and crumbly it won't hold inside the wonton and will leak; you want it to feel sticky and bound.",
        quickHack:
          "Chill the bowl and your hands first; cold fat smears less and the filling stays springier.",
        cuisineFact:
          "Hoành thánh is the Vietnamese take on Cantonese wonton, brought south by Chinese immigrant communities and absorbed into everyday Vietnamese noodle culture.",
        donenessCue:
          "The mixture should cling to itself in a single mass and pull slightly when you lift a handful.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Work the egg in and rest: add the whole egg and mix another 5 minutes until fully emulsified, then cover and let the filling marinate in the fridge for 15 minutes so the seasonings penetrate.",
        timerSeconds: 900,
        mistakeWarning: null,
        quickHack:
          "Pan-fry a teaspoon of the filling and taste it now — this is your only chance to correct seasoning before everything is sealed.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Fold the wontons: place a small scoop of filling in the center of a wrapper, dampen one edge with water, fold and press out the air, then wet the inside corner and bring the opposite corner up to seal into the classic pinched pouch. Set finished wontons on a flour-dusted tray with space between them, and never stack them.",
        timerSeconds: null,
        mistakeWarning:
          "Overfilling tears the wrapper as it cooks and floods the broth with filling; a modest scoop seals far more reliably.",
        quickHack:
          "Freeze any extras on the floured tray, then bag them once solid — they drop straight into boiling water later, no thawing.",
        cuisineFact: null,
        donenessCue:
          "A well-sealed wonton has no open gaps and the wrapper is tacky, not soaked, where you pressed it.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Start the broth: combine the pork and chicken stocks in a large pot with the dried shrimp, sliced broth shiitake, and the remaining 2 tsp minced ginger. Bring to a gentle simmer, then drop to medium-low and season with the 2 tbsp fish sauce, 1 tsp salt, and 1 tbsp sugar.",
        timerSeconds: null,
        mistakeWarning:
          "Keep it at a lazy simmer, not a rolling boil — hard boiling turns the broth cloudy and muddies the clean stock flavor.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You want a faint shimmer and the occasional bubble breaking the surface, not a churning boil.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Simmer and strain: let the broth simmer uncovered on medium-low for 90 minutes to draw out the dried shrimp and mushroom depth, then strain it through a fine sieve and hold it on low until serving.",
        timerSeconds: 5400,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "The dried shrimp here is the secret backbone — it layers a deep oceanic umami over the meat stocks that fresh seafood alone can't reach.",
        donenessCue:
          "The strained broth should taste round and savory with a gentle sweetness; adjust with a pinch more salt or sugar if it falls flat.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Cook the wontons: bring a wide pot of water to a boil with a splash of oil, slide in the wontons, and cook until they float and bob at the surface, about 4 minutes. Lift them out, drain, and toss with a teaspoon of oil so they don't clump.",
        timerSeconds: 240,
        mistakeWarning:
          "Crowding the pot drops the water off the boil and makes wontons stick together and burst — cook them in batches.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "They're done a few seconds after they rise and float; the wrapper turns translucent and the filling feels firm through it.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Blanch noodles and greens: in fresh boiling water, loosen and cook each 4 oz portion of egg noodles for 2-3 minutes, lift them out with a spider, then blanch the halved, rinsed gai lan in the same water for about 2 minutes.",
        timerSeconds: 150,
        mistakeWarning:
          "Don't overcook the noodles in the water — they keep softening once the hot broth hits them, so pull them while still springy.",
        quickHack:
          "Shock the noodles briefly under cold water and re-dip in hot broth to keep them from going gummy if you're plating several bowls.",
        cuisineFact: null,
        donenessCue:
          "Noodles should be tender with a slight chew; gai lan stems turn vivid green and bend without snapping.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Assemble each bowl: nest the drained noodles in the bowl, lay the gai lan alongside, and tuck 8-10 wontons in beside them with any char siu, fish balls, or beef balls. Ladle 2-3 cups of hot broth over everything and finish with sliced scallions, a splash of red vinegar, and chili paste or satay to taste.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Pour the broth in along the side of the bowl rather than over the noodles so the arrangement stays neat and photogenic.",
        cuisineFact: null,
        donenessCue:
          "Serve immediately while the broth is steaming and the noodles are hot — the bowl is at its best in the first few minutes.",
        imageUrl: null,
      },
    ],
  },
  "tu-bun-bo-hue": {
    name: "Bún Bò Huế (Spicy Beef & Pork Noodle Soup)",
    slug: "tu-bun-bo-hue",
    description:
      "Chef Tu David Phu's take on Hue's legendary spicy beef-and-pork noodle soup, where a coconut-water and pineapple broth gets layered with lemongrass, annatto, and funky fermented shrimp paste over hand-pulled meats and thick round rice noodles.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 40,
    cookTimeMinutes: 210,
    skillLevel: "advanced",
    heroImageUrl: "/food_images/tu_bun_bo_hue.jpg",
    flavorProfile: ["spicy", "savory", "aromatic", "tangy"],
    temperature: "hot",
    ingredients: [
      {
        id: "tubunb-1",
        name: "boneless beef shank",
        quantity: "1.5 lb",
        isOptional: false,
        substitution: "beef brisket",
      },
      {
        id: "tubunb-2",
        name: "pork knuckles",
        quantity: "2 lb",
        isOptional: false,
        substitution: "pork hock",
      },
      {
        id: "tubunb-3",
        name: "boneless pork shank",
        quantity: "1.5 lb",
        isOptional: false,
        substitution: "pork shoulder",
      },
      {
        id: "tubunb-4",
        name: "beef tendon",
        quantity: "0.5 lb",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tubunb-5",
        name: "lemongrass stalks, bruised",
        quantity: "3 stalks",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-6",
        name: "fresh ginger, sliced",
        quantity: "1-inch piece",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-7",
        name: "yellow onion, quartered",
        quantity: "1 large",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-8",
        name: "shallots, halved",
        quantity: "3",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-9",
        name: "chicken stock",
        quantity: "4 cups",
        isOptional: false,
        substitution: "beef stock",
      },
      {
        id: "tubunb-10",
        name: "filtered water",
        quantity: "4 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-11",
        name: "coconut water",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-12",
        name: "canned pineapple chunks with juice",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-13",
        name: "fermented shrimp paste (mam ruoc)",
        quantity: "2 tablespoons",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-14",
        name: "annatto oil",
        quantity: "2 tablespoons",
        isOptional: false,
        substitution: "neutral oil bloomed with paprika",
      },
      {
        id: "tubunb-15",
        name: "Bun Bo Hue seasoning blend",
        quantity: "2 tablespoons",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-16",
        name: "sa te (Vietnamese lemongrass chili oil)",
        quantity: "3 tablespoons",
        isOptional: false,
        substitution: "chili crisp plus minced lemongrass",
      },
      {
        id: "tubunb-17",
        name: "fish sauce",
        quantity: "3 tablespoons",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-18",
        name: "sugar",
        quantity: "1 tablespoon",
        isOptional: false,
        substitution: "rock sugar",
      },
      {
        id: "tubunb-19",
        name: "thick round Bun Bo Hue rice noodles",
        quantity: "1.5 lb",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunb-20",
        name: "garnishes (mung bean sprouts, shredded cabbage, banana blossom, mint, Thai basil, cilantro, scallions, lime wedges)",
        quantity: "to serve",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Pile the beef shank, pork knuckles, pork shank, and tendon into a large pot, cover with cold water, and toss in a few ginger slices and the onion trimmings. Bring to a rolling boil and let it bubble hard for about 8 minutes to drive out the gray scum and blood.",
        timerSeconds: 480,
        mistakeWarning:
          "Skipping this blanch leaves your broth murky and gamey. The cloudiness that floats up here is exactly what keeps Hue broth from tasting clean.",
        quickHack: null,
        cuisineFact:
          "Bun Bo Hue hails from Hue, the old imperial capital, and is traditionally far spicier and more lemongrass-forward than the gentler pho of the north.",
        donenessCue:
          "The surface should be thick with foam and the water clouded before you drain.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Drain the meats and plunge them into an ice bath, then rinse each piece under cold running water to scrub off any clinging foam. Scour the pot clean before building the broth so no scorched residue carries over.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack:
          "Rinsing the tendon and knuckles individually under the tap removes far more debris than a single soak.",
        cuisineFact: null,
        donenessCue:
          "Meat surfaces should feel smooth and look pale, with no brown specks left behind.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Return the cleaned meats to the pot and add the bruised lemongrass, ginger, quartered onion, halved shallots, and pineapple chunks with their juice. Pour in the chicken stock, filtered water, and coconut water, then stir in the seasoning blend. Bring just to a gentle simmer.",
        timerSeconds: 600,
        mistakeWarning:
          "Do not let it reach a hard boil at this stage or the fat emulsifies and the broth turns greasy and opaque.",
        quickHack: null,
        cuisineFact:
          "The coconut water and pineapple are Chef Tu's modern lean toward a rounder, fruit-bright sweetness that balances the chili heat without reaching for much added sugar.",
        donenessCue:
          "Look for lazy bubbles breaking the surface one at a time, never a churning boil.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Hold the broth at the barest simmer for 3 to 4 hours, skimming impurities now and then, until the meats yield easily and the tendon turns gelatinous. Lift the meats out onto a rack to cool, then strain the broth and discard the spent aromatics.",
        timerSeconds: 12600,
        mistakeWarning:
          "Pull the leaner beef and pork shank earlier if they finish before the knuckle and tendon, or they will dry out and shred.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "A skewer slides through the meat with almost no resistance and the tendon is translucent and wobbly.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Pour the strained broth back into the pot and bloom in the annatto oil for color. Whisk in the shrimp paste, sa te, and fish sauce, then add the sugar. Taste and balance: it should land savory, spicy, and faintly sweet, with the funk of the shrimp paste humming underneath.",
        timerSeconds: 300,
        mistakeWarning:
          "Add the shrimp paste a spoonful at a time and taste between additions. Its pungency builds fast and there is no walking it back once over-dosed.",
        quickHack:
          "If raw shrimp paste tastes too sharp, simmer the seasoned broth for five extra minutes to mellow and marry the flavors.",
        cuisineFact:
          "Mam ruoc, the fermented shrimp paste, is the soul of authentic Bun Bo Hue. It is what separates the real thing from a generic chili beef soup.",
        donenessCue:
          "The broth glows a deep red-orange from the annatto and smells intensely of lemongrass and fermented depth.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Boil the rice noodles per their package, usually 7 to 10 minutes, until tender with a slight chew, then drain and rinse under cold water to wash off surface starch. Slice the cooled meats thinly across the grain and cut the tendon into bite-size pieces.",
        timerSeconds: 540,
        mistakeWarning: null,
        quickHack:
          "Rinsing the cooked noodles keeps them from clumping and stops the residual starch from clouding your carefully clarified broth.",
        cuisineFact: null,
        donenessCue:
          "Noodles should bend without snapping and feel springy, not mushy, between your teeth.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Nest a portion of noodles in each bowl, fan the sliced meats and tendon over the top, and ladle the screaming-hot broth in to cover. Send the platter of bean sprouts, herbs, shredded cabbage, banana blossom, and lime wedges to the table so each person dresses their own bowl.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Serving the raw garnishes on the side rather than pre-loaded is the Hue way, letting each diner tune the freshness, crunch, and acidity to taste.",
        donenessCue:
          "The broth should be hot enough to lightly wilt the herbs the moment they hit the bowl.",
        imageUrl: null,
      },
    ],
  },
  "tu-mi-xao-gion": {
    name: "Mì Xào Giòn (Crispy Bird's Nest Noodles)",
    slug: "tu-mi-xao-gion",
    description:
      "Chef Tu David Phu's take on the Vietnamese restaurant classic: a deep-fried golden nest of egg noodles crowned with shrimp and crisp vegetables bound in a glossy oyster-hoisin gravy.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_mi_xao_gion.jpg",
    flavorProfile: ["savory", "umami", "crispy", "aromatic"],
    temperature: "hot",
    ingredients: [
      {
        id: "tumixa-1",
        name: "fresh thin egg noodles",
        quantity: "6 oz",
        isOptional: false,
        substitution:
          "dried egg noodles, soaked and boiled briefly until pliable",
      },
      {
        id: "tumixa-2",
        name: "neutral oil for deep-frying",
        quantity: "about 4 cups",
        isOptional: false,
        substitution: "canola, peanut, or rice bran oil",
      },
      {
        id: "tumixa-3",
        name: "large shrimp, peeled and deveined",
        quantity: "6",
        isOptional: false,
        substitution: "sliced chicken breast or firm tofu",
      },
      {
        id: "tumixa-4",
        name: "button mushrooms, quartered",
        quantity: "4",
        isOptional: false,
        substitution: "shiitake or cremini",
      },
      {
        id: "tumixa-5",
        name: "broccoli florets, stalks peeled and sliced",
        quantity: "1 cup",
        isOptional: false,
        substitution: "Chinese broccoli or bok choy",
      },
      {
        id: "tumixa-6",
        name: "carrot, cut into matchsticks",
        quantity: "1/2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumixa-7",
        name: "celery stalk, cut into matchsticks",
        quantity: "1",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumixa-8",
        name: "small onion, thinly sliced",
        quantity: "1/2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumixa-9",
        name: "garlic cloves, crushed",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumixa-10",
        name: "fresh ginger, minced",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumixa-11",
        name: "oyster sauce",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "vegetarian mushroom oyster sauce",
      },
      {
        id: "tumixa-12",
        name: "hoisin sauce",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumixa-13",
        name: "freshly ground black pepper",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tumixa-14",
        name: "chicken stock",
        quantity: "1 cup",
        isOptional: false,
        substitution: "vegetable stock",
      },
      {
        id: "tumixa-15",
        name: "arrowroot powder",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "cornstarch",
      },
      {
        id: "tumixa-16",
        name: "water (for the slurry)",
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
          "Loosen the fresh egg noodles with your fingers so they aren't clumped, then divide into one or two loose round nests. Stir the arrowroot powder into the 2 tbsp water and set the slurry aside; have all your cut vegetables, shrimp, and aromatics within arm's reach before the oil gets hot.",
        timerSeconds: null,
        mistakeWarning:
          "Don't skip the mise en place. Once you start frying and stir-frying, everything moves fast and there's no time to chop mid-cook.",
        quickHack:
          "Press each nest gently in a wide skimmer or spider to hold its shape, so it slides into the oil already round.",
        cuisineFact:
          "Mì xào giòn means 'crispy fried noodles' and is a Vietnamese-Chinese banquet staple, the same family as Cantonese chow mein 'nests.'",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Heat the frying oil to 350°F in a deep pot or wok. Lower one noodle nest in at a time and fry undisturbed until the underside is deep gold, then flip and fry the second side. Lift out and drain on a rack so the bottom stays crunchy.",
        timerSeconds: 210,
        mistakeWarning:
          "If the oil is cooler than 350°F the noodles soak up grease and turn limp instead of crisping; check with a thermometer.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The nest is done when it's evenly amber-gold and rigid enough to hold its shape when lifted with tongs.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Pour off all but about a tablespoon of the oil (or move to a clean wok). Slide in the shrimp and cook just until they curl and turn opaque, then scoop them out so they don't overcook in the next steps.",
        timerSeconds: 90,
        mistakeWarning:
          "Rubbery shrimp come from leaving them in too long. Pull them the moment they go pink and firm; they'll finish later in the sauce.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Shrimp are ready when they bend into a loose C-shape and the flesh is pink-opaque with no gray translucence left.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "In the same hot wok, add the broccoli, mushrooms, carrot, and celery. Toss over high heat for under a minute so they brighten and soften slightly but keep their snap, then transfer them out to join the shrimp.",
        timerSeconds: 45,
        mistakeWarning: null,
        quickHack:
          "A splash of water and a quick lid for 15 seconds steams the broccoli through without losing the crunch.",
        cuisineFact: null,
        donenessCue:
          "Vegetables are right when broccoli turns vivid green and the carrot is just barely tender but still crisp.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Add a little oil to the wok and sauté the onion, garlic, and ginger until fragrant and softened. Stir in the oyster sauce, hoisin, and black pepper to coat the aromatics for a few seconds.",
        timerSeconds: 60,
        mistakeWarning:
          "Keep the heat moderate here; garlic and ginger scorch fast and turn bitter if the wok is screaming hot.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The aromatics are ready when the onion turns translucent and the kitchen smells sharply of garlic and ginger.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Pour in the chicken stock and bring it to a gentle simmer. Give the arrowroot slurry a quick re-stir and drizzle it in while stirring, cooking until the sauce turns glossy and thick enough to coat a spoon.",
        timerSeconds: 120,
        mistakeWarning:
          "Always re-stir the slurry right before adding; arrowroot settles into a hard layer at the bottom and won't thicken evenly otherwise.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The gravy is thickened when a spoon dragged across the wok leaves a trail that slowly fills back in.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Return the shrimp and vegetables to the sauce and fold gently just until everything is hot and evenly coated. Set the fried noodle nest on a plate and spoon the saucy topping into the center so the edges stay crisp.",
        timerSeconds: 30,
        mistakeWarning:
          "Sauce the nest only at the moment of serving; ladle it on too early and the crisp noodles go soft within minutes.",
        quickHack: null,
        cuisineFact:
          "The fun of this dish is the contrast: the gravy softens the center of the nest while the outer strands shatter like chips.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-bun-ga-nuong": {
    name: "Bún Gà Nướng (Grilled Lemongrass Chicken Vermicelli)",
    slug: "tu-bun-ga-nuong",
    description:
      "Charred lemongrass chicken over cool rice vermicelli, piled with herbs, cucumber, and quick pickles, then drenched in bright coconut-water nuoc cham.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 20,
    cookTimeMinutes: 30,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_bun_ga_nuong.jpg",
    flavorProfile: ["savory", "tangy", "aromatic", "umami"],
    temperature: "warm",
    ingredients: [
      {
        id: "tubung-1",
        name: "Boneless chicken thighs (skin-on)",
        quantity: "1 lb (16 oz)",
        isOptional: false,
        substitution: "Boneless skin-on chicken breast",
      },
      {
        id: "tubung-2",
        name: "Lemongrass seasoning (or finely minced fresh lemongrass)",
        quantity: "1.5 tbsp",
        isOptional: false,
        substitution: "2 fresh lemongrass stalks, tender core only, minced",
      },
      {
        id: "tubung-3",
        name: "Fish sauce (for marinade)",
        quantity: "1.5 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-4",
        name: "Dried rice vermicelli (bún)",
        quantity: "8 oz",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-5",
        name: "Coconut water",
        quantity: "1 cup",
        isOptional: false,
        substitution: "1 cup water plus a pinch of sugar",
      },
      {
        id: "tubung-6",
        name: "Fresh lime or lemon juice",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-7",
        name: "Fish sauce (for dipping sauce)",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-8",
        name: "Sugar",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-9",
        name: "Garlic, minced",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-10",
        name: "Shallot, minced",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-11",
        name: "Thai chili, chopped",
        quantity: "2 tsp",
        isOptional: true,
        substitution: "1 tsp fermented chili paste or sriracha",
      },
      {
        id: "tubung-12",
        name: "Carrot, cut into matchsticks",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-13",
        name: "Daikon, cut into matchsticks",
        quantity: "1 cup",
        isOptional: true,
        substitution: "More carrot",
      },
      {
        id: "tubung-14",
        name: "Unseasoned rice vinegar",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-15",
        name: "Scallions, thinly sliced",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-16",
        name: "Neutral cooking oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-17",
        name: "Fresh mint leaves",
        quantity: "1 bunch",
        isOptional: false,
        substitution: "Cilantro or Thai basil",
      },
      {
        id: "tubung-18",
        name: "Cucumbers, ribboned or speared",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-19",
        name: "Sugar (for pickles)",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubung-20",
        name: "Kosher salt (for pickles)",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Toss the chicken thighs with the lemongrass seasoning and 1.5 tbsp fish sauce until every piece is coated, then leave it to marinate at room temperature while you build the rest of the bowl. The salt in the fish sauce is doing double duty here as both seasoning and tenderizer.",
        timerSeconds: 1800,
        mistakeWarning:
          "Don't skip the rest — a too-short marinade leaves the lemongrass sitting on the surface instead of perfuming the meat.",
        quickHack:
          "Marinating the night before in the fridge deepens the flavor; just bring the chicken back to room temp before cooking.",
        cuisineFact:
          "Lemongrass is the backbone aromatic of Vietnamese grilling — Chef Tu builds his version on a lemongrass seasoning blend rather than relying on the stalk alone.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "While the chicken marinates, dissolve the 3 tbsp sugar into the coconut water, lime juice, and 1/4 cup fish sauce, then stir in the minced garlic, shallot, and chopped chili. Taste and adjust — it should land bright, salty, sweet, and a little fiery all at once. Set this nuoc cham aside.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Coconut water instead of plain water and sugar gives the dipping sauce a rounder, naturally sweet edge that sets this version apart.",
        cuisineFact:
          "Nuoc cham is the all-purpose Vietnamese table sauce; the balance of fish sauce, citrus, sugar, and chili is tuned to each cook's palate.",
        donenessCue:
          "The sugar should be fully dissolved with no grit at the bottom of the bowl.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Warm 1 tsp sugar and 1/4 tsp kosher salt with the rice vinegar and an equal splash of water just until the sugar melts, pour it over the carrot and daikon matchsticks, and press them under a small plate to keep them submerged. Let them steep at least 15 minutes for a fast, crunchy pickle.",
        timerSeconds: 900,
        mistakeWarning: null,
        quickHack:
          "Massage a pinch of extra salt into the vegetables first and squeeze out the liquid for an even snappier pickle.",
        cuisineFact:
          "Đồ chua — pickled carrot and daikon — is the tangy counterweight that cuts through grilled meat in countless Vietnamese dishes.",
        donenessCue:
          "The matchsticks turn slightly translucent and bend without snapping when ready.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Drop the vermicelli into a pot of boiling water and cook 5 to 8 minutes, stirring now and then so the strands don't clump. Drain, then rinse under cold water until the noodles run starch-free and cool, and let them sit in the colander to fully drain.",
        timerSeconds: 360,
        mistakeWarning:
          "Overcooked vermicelli turns to mush — start checking at 5 minutes and pull them the moment they're tender.",
        quickHack:
          "The cold rinse stops the cooking and washes off surface starch so the strands stay separate in the bowl.",
        cuisineFact: null,
        donenessCue:
          "A strand should be fully tender with no chalky white core when bitten.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Warm the 2 tbsp oil in a small pan over low heat for about a minute, kill the heat, then stir in the sliced scallions with a pinch of salt and a few drops of fish sauce. The residual heat wilts the scallions into a glossy, savory mỡ hành without frying them.",
        timerSeconds: 60,
        mistakeWarning:
          "Keep the heat low and add scallions off the burner — too hot and they brown and turn bitter instead of staying vivid green.",
        quickHack: null,
        cuisineFact:
          "Mỡ hành (scallion oil) is the finishing drizzle that adds richness and aroma to grilled-meat noodle bowls.",
        donenessCue:
          "The scallions should soften and brighten without browning.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Arrange the marinated chicken skin-side up and bake at 375°F for about 20 minutes, until the thickest part reads 165°F, then run it under the broiler for 1 to 2 minutes to blister and char the skin. Rest it 5 minutes, then slice into strips.",
        timerSeconds: 1200,
        mistakeWarning:
          "Watch the broiler closely — at that distance the skin goes from golden to scorched in under a minute.",
        quickHack:
          "No oven? A grill or grill pan over medium-high gives even better char; flip once and cook to the same 165°F.",
        cuisineFact: null,
        donenessCue:
          "Skin is lacquered and crisp and the juices run clear when the chicken hits 165°F internal.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Pile the drained vermicelli into bowls and lay the sliced lemongrass chicken on top. Tuck in mint, cucumber, and a handful of the pickled carrot and daikon, spoon the scallion oil over everything, and ladle the nuoc cham generously to finish. Toss it all together at the table before eating.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Serve the nuoc cham on the side so each person can drench their own bowl to taste.",
        cuisineFact:
          "Bún bowls are eaten mixed — the whole point is that one stir coats every strand in sauce, herbs, and pickle.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-com-suon": {
    name: "Cơm Sườn (Grilled Pork Chop Rice Plate)",
    slug: "tu-com-suon",
    description:
      "Tu David Phu's Vietnamese rice plate of fish-sauce-and-lemongrass marinated pork chops, pan-seared until lacquered and finished over rice fried in the pan drippings.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_com_suon.jpg",
    flavorProfile: ["savory", "umami", "caramelized", "aromatic"],
    temperature: "hot",
    ingredients: [
      {
        id: "tucoms-1",
        name: "bone-in pork chops, about 1/2 inch thick",
        quantity: "4 chops",
        isOptional: false,
        substitution: "thin-cut boneless chops (reduce sear time)",
      },
      {
        id: "tucoms-2",
        name: "fish sauce",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucoms-3",
        name: "oyster sauce",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "vegetarian mushroom stir-fry sauce",
      },
      {
        id: "tucoms-4",
        name: "orange marmalade (or honey)",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "honey",
      },
      {
        id: "tucoms-5",
        name: "granulated sugar",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucoms-6",
        name: "sesame oil",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucoms-7",
        name: "lemongrass, finely minced",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucoms-8",
        name: "garlic, minced",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucoms-9",
        name: "shallot, minced",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucoms-10",
        name: "ginger, minced",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucoms-11",
        name: "scallions, sliced",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucoms-12",
        name: "pho seasoning blend",
        quantity: "1 tsp",
        isOptional: true,
        substitution: "pinch each of star anise and cinnamon powder",
      },
      {
        id: "tucoms-13",
        name: "neutral frying oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tucoms-14",
        name: "day-old cooked jasmine rice",
        quantity: "4 cups",
        isOptional: false,
        substitution: "freshly cooked rice spread out and cooled",
      },
      {
        id: "tucoms-15",
        name: "fish sauce, sugar, lime, water and chili for nuoc cham",
        quantity: "1 small bowl",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "In a wide bowl, stir together the fish sauce, oyster sauce, marmalade, sugar, sesame oil, lemongrass, garlic, shallot, ginger, sliced scallions, and the pho seasoning until the marmalade and sugar dissolve into a glossy paste. This is your full salt and sweetness for the chops, so taste-balance it now rather than re-seasoning later.",
        timerSeconds: null,
        mistakeWarning:
          "Don't add extra salt or fish sauce when cooking — the marinade already carries all the seasoning, and the glaze concentrates as it sears.",
        quickHack:
          "Microplane the garlic, ginger, and lemongrass so they melt into the marinade instead of leaving fibrous bits.",
        cuisineFact:
          "Phu titles this dish 'chiên' (pan-fried) rather than the more familiar grilled 'nướng', a homestyle move that lets the marinade caramelize in a hot pan.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Lay the pork chops in the marinade and work it into both sides with your hands for a few minutes so it grips the meat. Cover and refrigerate at least 8 hours, ideally overnight.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The chops should look fully coated and slightly tacky before they go into the fridge.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Pull the chops out and let them sit on the counter for about 30 minutes to lose their fridge chill, which helps them cook evenly instead of steaming.",
        timerSeconds: 1800,
        mistakeWarning:
          "Searing cold chops straight from the fridge gives you a scorched outside and a raw center — don't skip the rest.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Set a heavy-bottomed pan over medium heat for a few minutes, then add the frying oil and wait until it shimmers and flows like water.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The oil is ready when it ripples and a drop of marinade sizzles on contact.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Lay the chops in the pan without crowding and fry about 5 minutes per side, resisting the urge to move them so the sugars in the marinade can lacquer into a deep mahogany crust.",
        timerSeconds: 600,
        mistakeWarning:
          "The marmalade and sugar burn fast — if the crust darkens too quickly, drop the heat to medium-low rather than flipping early.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Done when the surface is glossy and caramelized and the chops feel firm with just a little give, about 145F at the bone.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Move the chops to a rack to rest while you make the rice. Don't wipe the pan — those sticky browned drippings are the flavor base.",
        timerSeconds: 300,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Reheat the same pan over medium, add the day-old rice, and break up the clumps with a fork. Stir continuously for about 5 minutes so every grain picks up the rendered pork drippings and toasts lightly.",
        timerSeconds: 300,
        mistakeWarning:
          "Fresh hot rice turns gummy here — day-old rice that has dried out in the fridge is what gives you separate, chewy grains.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The rice is ready when the grains separate, glisten from the drippings, and smell toasty.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Slice the rested chops against the grain, fan them over a mound of the fried rice, and serve with a small bowl of nuoc cham for spooning over the top.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Whisk 2 tbsp fish sauce, 1 tbsp sugar, juice of half a lime, 3 tbsp warm water, and minced chili for a fast nuoc cham.",
        cuisineFact:
          "A com tam-style rice plate is built to be assembled at the table — meat, rice, and a bright dipping sauce that ties it together.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-char-siu-banh-mi": {
    name: "Char Siu Bánh Mì (Char Siu Pork Banh Mi)",
    slug: "tu-char-siu-banh-mi",
    description:
      "Chef Tu David Phu's char siu banh mi layers caramelized, lacquered pork into a crackly baguette with bright pickled carrot and daikon, cool cucumber, cilantro, and a rich smear of chicken liver pate.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 45,
    cookTimeMinutes: 35,
    skillLevel: "advanced",
    heroImageUrl: "/food_images/tu_char_siu_banh_mi.jpg",
    flavorProfile: ["savory", "sweet", "tangy", "umami"],
    temperature: "warm",
    ingredients: [
      {
        id: "tuchar-1",
        name: "pork steak (Iberico secreto or pork shoulder)",
        quantity: "2 lbs",
        isOptional: false,
        substitution: "boneless pork shoulder or pork loin",
      },
      {
        id: "tuchar-2",
        name: "garlic, minced (for marinade)",
        quantity: "3 cloves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-3",
        name: "oyster sauce",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-4",
        name: "soy sauce",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-5",
        name: "brown sugar",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-6",
        name: "Shaoxing cooking wine",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: "dry sherry",
      },
      {
        id: "tuchar-7",
        name: "honey",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-8",
        name: "fermented red bean curd, mashed",
        quantity: "2 tbsp",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tuchar-9",
        name: "five-spice or pho seasoning blend",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Chinese five-spice powder",
      },
      {
        id: "tuchar-10",
        name: "red food coloring",
        quantity: "1-2 drops",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tuchar-11",
        name: "carrot and daikon, julienned",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-12",
        name: "rice vinegar",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-13",
        name: "water",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-14",
        name: "sugar (for pickle)",
        quantity: "1/2 tsp plus extra to taste",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-15",
        name: "salt (for pickle)",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-16",
        name: "jalapeno, sliced",
        quantity: "1/2",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tuchar-17",
        name: "large baguette",
        quantity: "1",
        isOptional: false,
        substitution: "soft French rolls",
      },
      {
        id: "tuchar-18",
        name: "unsalted butter (for baguette)",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-19",
        name: "garlic, minced (for baguette)",
        quantity: "2 cloves",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-20",
        name: "mayonnaise",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-21",
        name: "chicken liver pate",
        quantity: "2 tbsp",
        isOptional: true,
        substitution: "store-bought pate",
      },
      {
        id: "tuchar-22",
        name: "English cucumber spears",
        quantity: "8 pieces",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuchar-23",
        name: "cilantro",
        quantity: "1 bunch",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Whisk the minced garlic, oyster sauce, soy sauce, brown sugar, Shaoxing wine, honey, mashed fermented bean curd, and five-spice (plus a drop of red coloring if you want the classic ruby edge) into a glossy marinade. Turn the pork steak in it until every surface is coated, then let it sit at room temperature.",
        timerSeconds: 1800,
        mistakeWarning:
          "Don't add extra salt here — the oyster sauce, soy, and bean curd already carry plenty; the pork will taste over-salted if you season further.",
        quickHack:
          "For deeper flavor, marinate covered in the fridge overnight instead of 30 minutes.",
        cuisineFact:
          "Char siu means 'fork-roasted' in Cantonese; banh mi adopted it during the French-Chinese-Vietnamese culinary crossover of colonial-era Saigon.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Bring the rice vinegar, water, salt, and sugar to a gentle simmer with the sliced jalapeno, then pull it off the heat. Pack the julienned carrot and daikon into the warm brine, weigh them down with a small plate so they stay submerged, and let them steep while you cook the pork.",
        timerSeconds: 900,
        mistakeWarning: null,
        quickHack:
          "Taste the brine before adding the vegetables — it should hit you as equal parts sharp and sweet; nudge in more sugar if it puckers too hard.",
        cuisineFact: null,
        donenessCue:
          "The vegetables are ready when they bend without snapping and taste tangy all the way through, usually after 15 minutes.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Get a grill or heavy cast-iron pan ripping hot over medium-high. Lay the pork down and sear each side until the sugars caramelize into dark, sticky char.",
        timerSeconds: 270,
        mistakeWarning:
          "The marinade's sugar burns fast — stay close and move the pork if flare-ups blacken it before it caramelizes.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "You want lacquered, mahogany edges with crisp caramelized spots, not a uniform gray surface.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Transfer the seared pork to a 350°F oven to finish cooking through gently.",
        timerSeconds: 600,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "Pull it when an instant-read thermometer hits 145°F at the thickest point.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Rest the pork for 5 minutes so the juices settle, then slice it thinly across the grain on a sharp bias. Cutting against the grain keeps each slice tender rather than chewy.",
        timerSeconds: 300,
        mistakeWarning:
          "Slicing immediately lets the juices run out onto the board; let it rest first.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Melt the butter over medium heat and swirl in the minced garlic until fragrant, about a minute. Split the baguette lengthwise, tear out a little of the soft interior to make room for fillings, then press the cut sides into the garlic butter and toast until golden and crackly.",
        timerSeconds: 180,
        mistakeWarning: null,
        quickHack:
          "Hollowing the crumb keeps the sandwich from getting top-heavy and stops the fillings from squeezing out the ends.",
        cuisineFact: null,
        donenessCue:
          "The crust should shatter audibly when pressed and show a deep golden toast on the cut face.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Spread mayonnaise on one toasted side and the chicken liver pate on the other. Pile in the sliced char siu, then crown it with a generous tangle of drained pickled carrot and daikon, the cucumber spears, and plenty of cilantro. Close it up and serve right away while the bread is still crisp.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Squeeze the pickles gently before layering so excess brine doesn't sog the bread.",
        cuisineFact:
          "The interplay of rich pate, sweet pork, cool cucumber, and sour pickle is the banh mi signature — every bite should land hot, cold, sweet, and sharp at once.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-ga-chien": {
    name: "Gà Chiên (Vietnamese Fried Chicken)",
    slug: "tu-ga-chien",
    description:
      "Chef Tu David Phu's Vietnamese fried chicken cures the meat in lemongrass, ginger, and citrus before a turmeric-stained, double-fried crust delivers a shatteringly crisp, addictively savory result.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 25,
    cookTimeMinutes: 35,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_ga_chien.jpg",
    flavorProfile: ["savory", "aromatic", "citrusy", "umami"],
    temperature: "hot",
    ingredients: [
      {
        id: "tugach-1",
        name: "Bone-in chicken parts (thighs, drumsticks, wings)",
        quantity: "2 lb",
        isOptional: false,
        substitution: "Boneless thighs work; reduce fry time slightly",
      },
      {
        id: "tugach-2",
        name: "Garlic powder",
        quantity: "2 tbsp (cure) + 4 tbsp (dredge)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-3",
        name: "Onion powder",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-4",
        name: "Fresh ginger, minced",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: "1/4 tsp ground ginger",
      },
      {
        id: "tugach-5",
        name: "Lemongrass, finely minced",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: "1/4 tsp lemongrass paste",
      },
      {
        id: "tugach-6",
        name: "Fine salt",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-7",
        name: "Sugar",
        quantity: "1/2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-8",
        name: "White pepper",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: "Black pepper",
      },
      {
        id: "tugach-9",
        name: "Baking soda",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-10",
        name: "Fresh lemon juice",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "Lime juice",
      },
      {
        id: "tugach-11",
        name: "MSG",
        quantity: "1/2 tsp",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tugach-12",
        name: "All-purpose flour",
        quantity: "5 oz (about 1 cup)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-13",
        name: "Cornstarch",
        quantity: "1/2 oz (about 2 tbsp)",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-14",
        name: "Rice flour",
        quantity: "1/2 oz (about 2 tbsp)",
        isOptional: false,
        substitution: "More cornstarch for crunch",
      },
      {
        id: "tugach-15",
        name: "Paprika",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-16",
        name: "Ground turmeric",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-17",
        name: "Baking powder",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tugach-18",
        name: "Cold soda water",
        quantity: "about 1/2 cup",
        isOptional: false,
        substitution: "Cold sparkling water",
      },
      {
        id: "tugach-19",
        name: "Neutral frying oil",
        quantity: "6 cups (for deep frying)",
        isOptional: false,
        substitution: "Canola, peanut, or vegetable oil",
      },
      {
        id: "tugach-20",
        name: "Roasted peanuts, crushed",
        quantity: "1/4 cup",
        isOptional: true,
        substitution: null,
      },
      {
        id: "tugach-21",
        name: "Fresh green chilies, sliced",
        quantity: "2",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Pat the chicken pieces dry, then toss them in a bowl with 2 tbsp garlic powder, the onion powder, minced ginger, minced lemongrass, the full 1 tsp salt, the sugar, white pepper, baking soda, lemon juice, and MSG if using. Massage the cure into every surface, cover, and refrigerate.",
        timerSeconds: null,
        mistakeWarning:
          "Don't skip the rest in the fridge — under-cured chicken tastes flat and the citrus won't penetrate.",
        quickHack:
          "A zip-top bag lets you push out the air and coat the pieces evenly with less mess.",
        cuisineFact:
          "The lemongrass-and-citrus cure is the backbone of Vietnamese gà chiên, giving fried chicken its signature bright, perfumed edge.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Let the chicken cure for at least 4 hours (overnight is even better). Near the end, pull it out so it loses its deep-fridge chill before frying.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The meat should look slightly tacky and faintly yellow from the cure when it's ready to dredge.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Whisk together the flour, cornstarch, rice flour, the remaining 4 tbsp garlic powder, paprika, turmeric, and baking powder for the dry dredge. Scoop out about a third into a second bowl and stir in just enough cold soda water to make a loose, drippy batter.",
        timerSeconds: null,
        mistakeWarning:
          "Use cold soda water and mix lightly — warm or over-stirred batter goes gummy instead of lacy and crisp.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Working one piece at a time, roll the chicken in the dry mix, dip it into the wet batter, then press it back into the dry mix a final time. The craggy double coating is what fries up shaggy and crunchy.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Keep one hand for dry and one for wet so your fingers don't turn into batter mittens.",
        cuisineFact: null,
        donenessCue:
          "Each piece should look rough and fully cloaked with no bare wet spots showing.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Heat the oil to 300°F (150°C) and lower in a few pieces at a time without crowding. Fry this first pass gently to cook the chicken through and set the crust to a pale gold.",
        timerSeconds: 480,
        mistakeWarning:
          "Crowding the pot crashes the oil temperature and leaves you with greasy, soft coating.",
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "The crust will be light gold and the bubbling will slow noticeably as the moisture cooks off.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Rest the pieces on a rack while you raise the oil to 375°F (190°C). Fry everything a second time in batches until deeply golden and shatteringly crisp.",
        timerSeconds: 150,
        mistakeWarning: null,
        quickHack:
          "Resting between fries lets the surface dry, which is the real secret to a crust that stays crunchy.",
        cuisineFact:
          "The two-temperature double fry is the same trick behind Korean and Vietnamese fried chicken alike — low heat to cook, high heat to crisp.",
        donenessCue:
          "Pieces should be a rich amber-gold and read at least 165°F (74°C) at the bone.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Drain on a rack, shower with a light pinch of salt while hot, and scatter over crushed peanuts and sliced chilies. Serve right away with seasoned fish sauce and pickles alongside.",
        timerSeconds: null,
        mistakeWarning:
          "Salting only after it cools means the seasoning slides off — hit it the moment it leaves the oil.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-thit-heo-quay": {
    name: "Thịt Heo Quay (Crispy Roast Pork Belly)",
    slug: "tu-thit-heo-quay",
    description:
      "Vietnamese roast pork belly with shatteringly crisp crackling over juicy, lemongrass-and-pho-spiced meat, slow-dried then blasted hot the way Chef Tu David Phu builds his skin.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 25,
    cookTimeMinutes: 130,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_thit_heo_quay.jpg",
    flavorProfile: ["savory", "aromatic", "umami", "salty"],
    temperature: "hot",
    ingredients: [
      {
        id: "tuthit-1",
        name: "skin-on pork belly, in one slab",
        quantity: "2 lb",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuthit-2",
        name: "kosher salt",
        quantity: "3 tsp, divided",
        isOptional: false,
        substitution: "flaky sea salt",
      },
      {
        id: "tuthit-3",
        name: "organic sugar",
        quantity: "2 tsp",
        isOptional: false,
        substitution: "light brown sugar",
      },
      {
        id: "tuthit-4",
        name: "black pepper, freshly ground",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuthit-5",
        name: "garlic powder",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuthit-6",
        name: "ginger powder",
        quantity: "1/2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuthit-7",
        name: "lemongrass, finely minced",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "1/2 tsp lemongrass paste",
      },
      {
        id: "tuthit-8",
        name: "pho seasoning blend (star anise, cinnamon, clove, coriander)",
        quantity: "2 tsp",
        isOptional: false,
        substitution: "1 tsp Chinese five-spice",
      },
      {
        id: "tuthit-9",
        name: "organic rice vinegar",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "distilled white vinegar",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Bring a large pot of water to a gentle simmer and lower the whole pork belly in skin-side up. Blanch for 10 minutes to firm the surface and draw out scum, then lift it out and set it skin-up on a rack to cool and dry for 30 minutes.",
        timerSeconds: 600,
        mistakeWarning:
          "Skip the blanch and the skin steams instead of crisps. This step also tightens the rind so it puffs cleanly later.",
        quickHack: null,
        cuisineFact:
          "Thit heo quay is a fixture at Vietnamese celebrations and is the classic filling for banh mi and com tam plates.",
        donenessCue:
          "The surface should look matte and feel tacky-dry, not wet, before it goes in the oven.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "While it cools, stir together the garlic powder, ginger powder, minced lemongrass, pho seasoning, sugar, black pepper, and 2 tsp of the kosher salt into a fragrant rub.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Crush the lemongrass and a pinch of the spice in a mortar first to wake up the oils before mixing.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Flip the belly flesh-side up. Prick the skin all over with a fork or skewer, going through the rind but not into the meat. Turn it back and score the flesh side into rough 2-inch squares, cutting about halfway down so the rub and heat can penetrate.",
        timerSeconds: null,
        mistakeWarning:
          "Don't pierce so deep on the skin side that you hit fat and meat, or juices weep up and stop the skin from crisping.",
        quickHack:
          "The denser you puncture the skin, the more blistered bubbles you get, so be generous with the holes.",
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Set the belly flesh-side up and rub the entire spice mixture into the scored meat and sides, packing it into the cuts. Leave the skin completely bare. Wrap the flesh and exposed sides in a snug foil wall, leaving only the skin uncovered, and place it skin-side up on a roasting tray.",
        timerSeconds: null,
        mistakeWarning:
          "Keep every speck of rub off the skin. Sugar and spice up top will scorch and block the rind from blistering.",
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Brush the bare skin with rice vinegar and scatter 1/2 tsp kosher salt evenly across it. Slide the tray into a 225F oven and roast low and slow for 60 minutes to render the fat and finish drying the rind.",
        timerSeconds: 3600,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue:
          "After the hour the skin should look pale, taut, and parchment-dry, with fat visibly rendering below.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Pull the tray, brush a second coat of rice vinegar over the skin, and sprinkle the last 1/2 tsp kosher salt across it. Crank the oven to 400F and roast another 45 to 50 minutes until the rind crackles up golden and blistered.",
        timerSeconds: 2700,
        mistakeWarning:
          "Watch the last 10 minutes closely, since the skin tips from golden to burnt fast at this heat.",
        quickHack:
          "If patches stay flat, run the broiler for 1 to 2 minutes to pop the stubborn spots, rotating for an even blister.",
        cuisineFact: null,
        donenessCue:
          "It is done when the whole skin has puffed into a crackly, deep-golden crust that sounds hollow when tapped.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Rest the belly uncovered for 20 minutes so the juices settle and the crackling stays crisp, then slice through skin and meat into bite-size pieces with a heavy sharp knife.",
        timerSeconds: 1200,
        mistakeWarning: null,
        quickHack:
          "Cut skin-side down with a swift press so the crackling shatters cleanly instead of shattering everywhere.",
        cuisineFact: null,
        donenessCue:
          "Each slice should reveal moist layered meat under an audibly crisp top.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Serve the warm pieces with banh hoi or steamed rice, a bowl of nuoc cham for dipping, and a plate of lettuce, cucumber, and fresh Vietnamese herbs to wrap and brighten each bite.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact:
          "Wrapping rich roast pork in herbs and lettuce with a tart-sweet nuoc cham is the balance Vietnamese cooking is built on.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-bun-nem-nuong": {
    name: "Bún Nem Nướng (Grilled Pork Sausage Vermicelli)",
    slug: "tu-bun-nem-nuong",
    description:
      "Chef Tu David Phu's grilled lemongrass-free Vietnamese pork sausage patties (nem nuong) over cool rice vermicelli, piled with quick-pickled carrot and daikon, herbs, cucumber, and toasted peanuts, then drizzled with a bright coconut-water nuoc cham and a spoonful of scallion oil.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 35,
    cookTimeMinutes: 25,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_bun_nem_nuong.jpg",
    flavorProfile: ["savory", "tangy", "umami", "fresh"],
    temperature: "warm",
    ingredients: [
      {
        id: "tubunn-1",
        name: "Ground pork shoulder",
        quantity: "1 lb",
        isOptional: false,
        substitution: "Ground chicken thigh for a lighter patty",
      },
      {
        id: "tubunn-2",
        name: "Fish sauce (for the pork)",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-3",
        name: "Nem nuong sausage seasoning",
        quantity: "2 tbsp",
        isOptional: false,
        substitution:
          "A pinch of baking soda plus a little sugar and white pepper for spring",
      },
      {
        id: "tubunn-4",
        name: "Dried vermicelli rice noodles",
        quantity: "8 oz",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-5",
        name: "Carrots, cut into matchsticks",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-6",
        name: "Daikon, cut into matchsticks",
        quantity: "1 cup",
        isOptional: false,
        substitution: "More carrot if daikon is unavailable",
      },
      {
        id: "tubunn-7",
        name: "Unseasoned rice vinegar (for pickling)",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-8",
        name: "Water (for pickling)",
        quantity: "2 cups",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-9",
        name: "Sugar (for the brine)",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-10",
        name: "Kosher salt (for the brine)",
        quantity: "1/4 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-11",
        name: "Coconut water",
        quantity: "1 cup",
        isOptional: false,
        substitution: "Plain water if coconut water is unavailable",
      },
      {
        id: "tubunn-12",
        name: "Fresh lemon juice",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "Lime juice",
      },
      {
        id: "tubunn-13",
        name: "Fish sauce (for the dipping sauce)",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-14",
        name: "Sugar (for the dipping sauce)",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-15",
        name: "Garlic, minced",
        quantity: "2 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-16",
        name: "Shallot, minced",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-17",
        name: "Thai chili, chopped",
        quantity: "2 tsp",
        isOptional: true,
        substitution: "Sambal oelek or a milder serrano",
      },
      {
        id: "tubunn-18",
        name: "Scallions, thinly sliced",
        quantity: "1 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-19",
        name: "High-heat cooking oil (for scallion oil)",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-20",
        name: "Fresh mint",
        quantity: "1 bunch",
        isOptional: false,
        substitution: "Cilantro or Thai basil",
      },
      {
        id: "tubunn-21",
        name: "Cucumbers, cut into ribbons or spears",
        quantity: "2",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tubunn-22",
        name: "Toasted peanuts, chopped",
        quantity: "1/2 cup",
        isOptional: true,
        substitution: "Toasted cashews",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Season the pork first so it has time to bind. In a small bowl, stir the 2 tbsp fish sauce into the 2 tbsp nem nuong seasoning to make a loose slurry. Add it to the pound of ground pork and mix vigorously by hand for a full 10 minutes, until the meat turns tacky and sticky and starts to pull together as one mass. Cover and chill at least 20 minutes (or up to overnight) so the patties hold their snap on the grill.",
        timerSeconds: 600,
        mistakeWarning:
          "Don't shortcut the mixing. Under-worked pork falls apart on the grill instead of forming a springy, sausage-like bite.",
        quickHack:
          "Wet your hands with cold water before mixing so the sticky pork doesn't cling to your fingers.",
        cuisineFact:
          "Nem nuong gets its signature bounce from working the meat until the proteins emulsify, the same technique behind Vietnamese gio lua.",
        donenessCue:
          "The pork is ready when a pinch of it stretches slightly and feels tacky rather than crumbly.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Make the do chua brine and get the ratio right: in a small pot, combine 1 cup rice vinegar, 2 cups water, 1 tsp sugar, and 1/4 tsp salt. The water is essential here. Vinegar alone is far too harsh to pickle in, so the 2 cups of water dilute it into a gentle, balanced brine. Warm the mixture just until the sugar and salt dissolve, then take it off the heat.",
        timerSeconds: 180,
        mistakeWarning:
          "Never pickle in undiluted vinegar. Skipping the 2 cups of water leaves the carrots and daikon mouth-puckeringly sour and inedible.",
        quickHack:
          "Taste the warm brine before adding vegetables. It should taste tart and lightly sweet, like a splash of vinegar in water, not eye-watering.",
        cuisineFact:
          "Do chua, the bright pickle that cuts through rich grilled meats, is a staple across Vietnamese tables from banh mi to noodle bowls.",
        donenessCue:
          "The brine is ready the moment the sugar and salt have fully dissolved and it's no longer cloudy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Add the 2 cups matchstick carrots and 1 cup matchstick daikon to the warm brine, pressing them down with a small plate so they stay submerged. Let them steep at room temperature for at least 15 minutes while you cook everything else. They'll soften slightly and turn tangy-sweet.",
        timerSeconds: 900,
        mistakeWarning:
          "Don't leave the vegetables floating above the brine. Any pieces poking out won't pickle evenly and can dry at the edges.",
        quickHack:
          "Pickle these up to a few days ahead and keep them in the brine in the fridge. They only get better.",
        cuisineFact: null,
        donenessCue:
          "Ready when the carrots have lost their raw stiffness but still snap with a fresh crunch.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "While the pickles steep, make the nuoc cham. In a bowl, whisk together 1 cup coconut water, 1/4 cup lemon juice, 1/4 cup fish sauce, and 3 tbsp sugar until the sugar dissolves. Stir in the 2 tsp minced garlic, 2 tbsp minced shallot, and chopped Thai chili to taste. Taste and adjust: it should land bright, salty, and just-sweet.",
        timerSeconds: null,
        mistakeWarning:
          "Add the chili gradually. You can always stir in more heat, but you can't pull it back out.",
        quickHack:
          "If it tastes too sharp, loosen it with a splash more coconut water rather than more sugar.",
        cuisineFact:
          "Using coconut water in place of plain water gives this dipping sauce a rounder, subtly sweet backbone typical of southern Vietnamese cooking.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Cook the vermicelli. Bring a pot of water to a boil, add the 8 oz noodles, and cook 5 to 8 minutes, stirring occasionally so they don't clump. Drain, then rinse thoroughly under cold water to wash off the surface starch and stop the cooking. Let them drain in the colander for about 5 minutes so the bowl doesn't go watery.",
        timerSeconds: 360,
        mistakeWarning:
          "Skipping the cold rinse leaves the noodles gummy and sticky. The rinse is what keeps them loose and separate.",
        quickHack:
          "Give the drained noodles a few snips with kitchen scissors so they're easier to eat with chopsticks.",
        cuisineFact: null,
        donenessCue:
          "The noodles are done when a strand is tender all the way through with no firm white core.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Make the quick scallion oil. Warm the 2 tbsp oil in a small pan over low heat for about a minute, then turn off the heat. Stir in the 1 cup sliced scallions along with a small splash of fish sauce, a few drops of rice vinegar, and a tiny pinch of salt. The residual heat will wilt the scallions into a glossy, savory oil in under a minute.",
        timerSeconds: 60,
        mistakeWarning:
          "Don't add the scallions over live heat. Cooking them too hard turns them brown and bitter instead of bright green.",
        quickHack: null,
        cuisineFact:
          "A spoonful of mo hanh (scallion oil) is the finishing gloss on countless Vietnamese grilled dishes.",
        donenessCue:
          "Ready when the scallions have just wilted and turned vivid green in the warm oil.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Grill the patties. Wet your hands and form the chilled pork into roughly 1 oz patties. Grill over high heat or in a hot skillet for 4 to 5 minutes per side, until deeply caramelized and cooked through. Let them rest 5 minutes before serving so the juices settle back in.",
        timerSeconds: 300,
        mistakeWarning:
          "Don't flip too early. Let a real char build on the first side before turning, or the patties will tear and stick.",
        quickHack:
          "Lightly oil the grill grates or pan right before the patties go on for clean release and better grill marks.",
        cuisineFact: null,
        donenessCue:
          "Cooked through at 160°F internal, with a browned, lacquered crust and no pink at the center.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Build the bowls. Pile the rice noodles into large bowls, nestle the grilled pork patties on top, and surround with fresh mint, cucumber, and a generous tangle of drained do chua. Ladle the nuoc cham over generously, finish each bowl with a spoonful of scallion oil, and scatter chopped toasted peanuts on top. Toss everything together just before eating.",
        timerSeconds: null,
        mistakeWarning:
          "Drain the pickles before they go in the bowl. Excess brine waters down the carefully balanced nuoc cham.",
        quickHack:
          "Serve the nuoc cham on the side so each person can dress and toss their own bowl to taste.",
        cuisineFact:
          "Bun bowls are meant to be tossed at the table, so every bite carries noodles, herbs, pickle, and grilled meat at once.",
        donenessCue: null,
        imageUrl: null,
      },
    ],
  },
  "tu-thit-kho-trung": {
    name: "Thịt Kho Trứng (Braised Pork Belly & Eggs)",
    slug: "tu-thit-kho-trung",
    description:
      "Pork belly and soft-centered eggs braised in a homemade dark caramel and coconut water until glossy, sticky, and fork-tender. A salty-sweet Vietnamese home classic — traditional Tết comfort food — built to be ladled, sauce and all, over hot steamed rice.",
    cuisineFamily: "vietnamese",
    prepTimeMinutes: 25,
    cookTimeMinutes: 50,
    skillLevel: "intermediate",
    heroImageUrl: "/food_images/tu_thit_kho_trung.jpg",
    flavorProfile: ["savory", "sweet", "umami", "aromatic"],
    temperature: "hot",
    ingredients: [
      {
        id: "tuthit-1",
        name: "pork belly, skin off, cut into 1-inch cubes",
        quantity: "2 lbs",
        isOptional: false,
        substitution:
          "Skin-on belly works too; trim if you want a leaner braise.",
      },
      {
        id: "tuthit-2",
        name: "soft-boiled eggs, peeled",
        quantity: "6",
        isOptional: false,
        substitution: "Use as few as 4 if you want more sauce per egg.",
      },
      {
        id: "tuthit-3",
        name: "coconut water (no pulp)",
        quantity: "8 fl oz (1 cup)",
        isOptional: false,
        substitution:
          "Plain coconut soda or plain water both work; the soda adds extra sweetness.",
      },
      {
        id: "tuthit-4",
        name: "organic cane sugar",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "Any granulated white sugar caramelizes the same way.",
      },
      {
        id: "tuthit-5",
        name: "fish sauce",
        quantity: "1/4 cup",
        isOptional: false,
        substitution: "No clean swap — this is the backbone of the braise.",
      },
      {
        id: "tuthit-6",
        name: "minced garlic",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuthit-7",
        name: "neutral cooking oil",
        quantity: "2 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuthit-8",
        name: "minced ginger",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuthit-9",
        name: "coarse Vietnamese black peppercorns, cracked",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Any coarsely cracked black peppercorns.",
      },
      {
        id: "tuthit-10",
        name: "green onions, sliced",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "tuthit-11",
        name: "green jalapeño, halved lengthwise",
        quantity: "1",
        isOptional: true,
        substitution: "Leave it out for a milder, kid-friendly pot.",
      },
      {
        id: "tuthit-12",
        name: "kosher salt (for the blanching water only)",
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
          "Bring a medium pot of water to a boil and stir in 1 tbsp kosher salt. Drop in the cubed pork belly and let it bubble at a gentle boil for just 3 minutes — long enough to chase the gray scum and impurities to the surface, not long enough to cook the meat through. Drain the pork in a colander and rinse off any clinging foam. The job of this blanch is purely to clean the belly: the cubes should still be raw and soft at the center so they can drink up the caramel later.",
        timerSeconds: 180,
        mistakeWarning:
          "Don't let the blanch run 8-10 minutes — that partially cooks the pork, firms the fat, and leaves the cubes unable to absorb the braising sauce. Three to four minutes is plenty.",
        quickHack:
          "Start a kettle while you cube the pork so the pot comes to a boil the moment the belly is ready.",
        cuisineFact:
          "This quick clean-blanch (chần thịt) is a near-universal first move in Vietnamese braises and soups — it's why the finished sauce stays clear and glossy instead of muddy.",
        donenessCue:
          "Foam and gray scum have risen and the outside of each cube has just turned opaque; the centers are still raw.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Set a heavy stainless steel pot over medium-high heat for 2-3 minutes. Flick in a few drops of water — when they skitter and vanish instantly, the pot is hot enough. Add the 2 tbsp oil, then pour in the 1/2 cup sugar. Swirl the pot gently (don't stir with a spoon) and let the sugar melt and deepen, taking it all the way to a dark amber caramel that smells toasty with the first wisp of bitterness. This is the color that gives thịt kho its mahogany sheen.",
        timerSeconds: 300,
        mistakeWarning:
          "Stirring melting sugar with a utensil makes it seize into grainy clumps — swirl the pot instead, and never walk away, because caramel goes from perfect to burnt in seconds.",
        quickHack:
          "Have the blanched pork right next to the stove — once the caramel hits color you'll want to add it immediately to stop the cooking.",
        cuisineFact:
          "Building caramel from scratch (nước màu) rather than using bottled browning is what separates a home cook's kho from a restaurant's.",
        donenessCue:
          "The sugar is fully liquid and a deep amber-mahogany, just shy of smoking, with a toasty aroma.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Lower the heat to medium and slide the drained pork belly into the caramel along with the 1 tbsp cracked peppercorns. Stand back — it will sputter. Toss and turn the cubes so every side meets the hot caramel and takes on color. Keep them moving and let them brown and caramelize, about 12 minutes, until the belly is glossy and lightly browned all over and the fat has started to render.",
        timerSeconds: 720,
        mistakeWarning:
          "Crowding cold, wet pork into the pot will drop the temperature and steam the meat instead of caramelizing it — make sure the cubes were well drained before they went in.",
        quickHack:
          "Turn the cubes in batches of pushes rather than constant stirring so each face gets a few seconds of direct contact with the pot.",
        cuisineFact: null,
        donenessCue:
          "Every cube is coated in dark caramel and lightly browned, with a slick of rendered fat pooling at the bottom of the pot.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Add the 2 tbsp garlic, 1 tbsp ginger, and the halved jalapeño, and stir for about 30 seconds until fragrant. Pour in the 1/4 cup fish sauce all at once and let it bubble against the hot pot for a few seconds to bloom — this single addition carries all the salt the braise needs, so resist topping it up later.",
        timerSeconds: 30,
        mistakeWarning:
          "Don't add more fish sauce 'to be safe.' A quarter cup is the full seasoning for 2 lbs of pork; the sauce concentrates as it reduces, and extra fish sauce here turns the finished dish too salty.",
        quickHack:
          "Have the garlic, ginger, and jalapeño pre-measured in one small bowl so they go in together before the aromatics can scorch.",
        cuisineFact:
          "Letting fish sauce hit a hot pot for a moment (thắng nước mắm) rounds off its sharp edge and deepens its savory backbone.",
        donenessCue:
          "The aromatics smell fragrant — not browned — and the fish sauce has flashed and folded into the caramel.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Nestle the 6 peeled soft-boiled eggs into the pot and pour in the 8 fl oz coconut water. The liquid should come roughly halfway up the pork and eggs; add a splash of plain water if the pot looks dry. Bring it to a gentle simmer, then keep it at a lazy bubble, basting the eggs occasionally, for about 18 minutes — until the sauce reduces to a glossy, syrupy braise that lightly coats a spoon and the pork is fork-tender. Taste a spoonful of sauce; it should be balanced salty-sweet, not sharp.",
        timerSeconds: 1080,
        mistakeWarning:
          "A hard, rolling boil will toughen the pork and split the eggs — keep it to a gentle simmer, and stop reducing while there's still loose sauce, since it thickens further off the heat.",
        quickHack:
          "Spoon the dark sauce over the eggs every few minutes so they pick up an even amber stain instead of sitting pale on top.",
        cuisineFact:
          "Coconut water — not coconut milk — is the traditional braising liquid; its mild sweetness is why thịt kho tastes round and caramel-y without ever being creamy.",
        donenessCue:
          "The sauce is glossy and syrupy enough to coat the back of a spoon, the eggs are stained amber, and a cube of pork yields easily when pressed.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Kill the heat and scatter the 1/2 cup sliced green onions over the top. Ladle the pork, eggs, and plenty of that glossy caramel sauce over bowls of hot steamed jasmine rice and serve right away.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack:
          "Halve the eggs as you plate so the soft yolk runs into the sauce — it makes the rice underneath even better.",
        cuisineFact:
          "Thịt kho trứng is the centerpiece of the Tết table, traditionally simmered in a big batch so a family can dip back into the pot across the holiday.",
        donenessCue:
          "Pork glistens in the sauce, eggs are amber and glossy, and everything is steaming hot over rice.",
        imageUrl: null,
      },
    ],
  },
};
