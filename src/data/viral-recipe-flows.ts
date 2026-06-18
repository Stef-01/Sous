/**
 * Viral-recipe guided-cook flows (founder-provided, 2026-06-18).
 *
 * Three crave-worthy "viral" recipes Stefan captured from social cooking apps.
 * Re-authored from the visible technique into the app's Mission→Grab→Cook→Win
 * voice — NO source prose copied (rule 7: real sourced method, not invented).
 * None had usable source photos, so heroImageUrl is null and they render the
 * gradient + dish-glyph fallback until the AI image pipeline produces heroes.
 *
 * Sides spread into guidedCookData; the meal spreads into guidedCookMeals.
 * Nutrition seeds live in per-recipe.ts; serving counts in dish-servings.ts;
 * catalog entries in sides.json / meals.json. Provenance: widely-circulated
 * social-media (TikTok/Instagram) methods, re-authored.
 */
import type { StaticDishData } from "./guided-cook-steps";

export const VIRAL_SIDE_FLOWS: Record<string, StaticDishData> = {
  "viral-caramelized-sweet-potatoes": {
    name: "Viral Caramelized Sweet Potatoes",
    slug: "viral-caramelized-sweet-potatoes",
    description:
      "Sweet potatoes halved lengthwise, rubbed cut-side with a garlicky smoked-paprika oil, then roasted face-down until the flat sides caramelize into a deep, candy-sweet golden crust. The viral trick: don't flip, don't move — let the pan do the work, then rest before lifting so the caramelized face stays intact.",
    cuisineFamily: "american",
    prepTimeMinutes: 10,
    cookTimeMinutes: 70,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["savory", "sweet", "smoky"],
    temperature: "hot",
    ingredients: [
      {
        id: "vcsp-1",
        name: "Sweet potatoes",
        quantity: "2 large, orange-fleshed (garnet preferred)",
        isOptional: false,
        substitution: "Any orange-fleshed variety",
      },
      {
        id: "vcsp-2",
        name: "Olive oil",
        quantity: "1–2 tbsp, for rubbing the cut sides",
        isOptional: false,
        substitution: "Avocado oil",
      },
      {
        id: "vcsp-3",
        name: "Garlic powder",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "vcsp-4",
        name: "Kosher salt",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Flaky sea salt",
      },
      {
        id: "vcsp-5",
        name: "Black pepper",
        quantity: "½ tsp",
        isOptional: false,
        substitution: null,
      },
      {
        id: "vcsp-6",
        name: "Smoked paprika",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Sweet paprika (less smoky)",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "Preheat the oven to 375°F and line a baking sheet with parchment paper.",
        timerSeconds: null,
        mistakeWarning:
          "Don't skip the parchment — sweet-potato sugars caramelize and weld to a bare pan, and you'll tear the crust off when you lift.",
        quickHack: "A dark metal sheet caramelizes faster than a shiny one.",
        cuisineFact:
          "Sweet potatoes aren't related to regular potatoes at all — they're in the morning-glory family.",
        donenessCue: null,
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Wash the sweet potatoes really well, then dry them thoroughly — you're leaving the skin on.",
        timerSeconds: null,
        mistakeWarning:
          "A wet skin steams instead of roasts — pat them bone-dry or the cut faces won't caramelize.",
        quickHack: "Give the skin a real scrub with a brush since it stays on.",
        cuisineFact:
          "The deep-orange flesh means lots of beta-carotene — the pigment your body turns into vitamin A.",
        donenessCue: "Surface looks matte and dry, with no water beading.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Trim off the ends, then cut each sweet potato in half lengthwise.",
        timerSeconds: null,
        mistakeWarning:
          "Cut lengthwise, not into rounds — you want one big flat face per half to maximize the caramelized surface.",
        quickHack:
          "Trim the ends first so you have a stable base and the knife doesn't slip on the round side.",
        cuisineFact: null,
        donenessCue: "Two even halves, each with one large flat cut surface.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Rub the cut sides with the olive oil, salt, pepper, garlic powder and smoked paprika.",
        timerSeconds: null,
        mistakeWarning:
          "Season the cut face, not the skin — that's the surface that touches the pan and caramelizes.",
        quickHack:
          "Mix the spices into the oil first, then rub it on as a paste for even coverage.",
        cuisineFact:
          "Smoked paprika (pimentón) is made from peppers dried over oak smoke — that's the barbecue-like depth here.",
        donenessCue: "The flat faces glisten and are evenly coated rust-red.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Place the halves cut-side down on the parchment, pressing each one flat so the whole face touches the pan.",
        timerSeconds: null,
        mistakeWarning:
          "Leave space between halves — crowd them and they steam each other instead of caramelizing.",
        quickHack:
          "Press firmly so the entire flat face makes full contact with the pan.",
        cuisineFact:
          "Roasting cut-side down traps the natural sugars against the hot surface — that's the whole trick.",
        donenessCue: "Every half is sitting flat, flesh kissing the parchment.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction:
          "Roast at 375°F for 1 hour. Don't flip or move them — set one timer and walk away.",
        timerSeconds: 3600,
        mistakeWarning:
          "Do NOT flip or nudge them — every time you move them you break the caramel crust forming underneath.",
        quickHack:
          "Resist the urge to peek; the crust needs uninterrupted contact.",
        cuisineFact:
          "An hour sounds long, but slow roasting converts the starch to sugar and gives that candied flavor.",
        donenessCue:
          "A knife slides into the thickest part with zero resistance and the kitchen smells deeply sweet.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "When they come out, let them sit on the pan for 10 minutes before lifting.",
        timerSeconds: 600,
        mistakeWarning:
          "Lift too soon and the soft caramelized face tears and sticks — the rest lets the crust set.",
        quickHack: "Resting also lets steam escape so the bottom firms up.",
        cuisineFact:
          "This pause is the single step most people skip, and it's why their bottoms rip.",
        donenessCue:
          "The caramelized face has firmed from molten to set and releases more easily.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Carefully remove with a thin, flexible spatula to keep the caramelized bottom intact, then flip face-up to serve.",
        timerSeconds: null,
        mistakeWarning:
          "Use a thin metal spatula — a flimsy or thick one cracks the crust as you slide under it.",
        quickHack:
          "Slide the spatula in flat and confidently in one motion; a tentative wiggle does more damage.",
        cuisineFact:
          "That glossy, deep-amber bottom is pure caramelized sugar — show it off.",
        donenessCue:
          "Each half lifts clean with a glassy, dark-golden caramelized face fully attached.",
        imageUrl: null,
      },
    ],
  },

  "scoopable-matcha-pistachio-chia-pudding": {
    name: "Scoopable Matcha Pistachio Chia Pudding",
    slug: "scoopable-matcha-pistachio-chia-pudding",
    description:
      "A vibrant jade chia pudding built on a blended base of milk, raw pistachios, ceremonial matcha, maple and vanilla, then thickened with chia and Greek yogurt and chilled until it's thick enough to scoop like ice cream. The blended pistachio-matcha milk gives it a luxe, nutty depth.",
    cuisineFamily: "dessert",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["sweet", "nutty", "earthy"],
    temperature: "cold",
    ingredients: [
      {
        id: "smpcp-1",
        name: "Chia seeds",
        quantity: "⅓ cup",
        isOptional: false,
        substitution: null,
      },
      {
        id: "smpcp-2",
        name: "Plain Greek yogurt",
        quantity: "¾ cup",
        isOptional: false,
        substitution: "Dairy-free coconut yogurt",
      },
      {
        id: "smpcp-3",
        name: "Milk of choice",
        quantity: "1 cup",
        isOptional: false,
        substitution: "Oat or almond milk",
      },
      {
        id: "smpcp-4",
        name: "Raw shelled pistachios, unsalted",
        quantity: "⅓ cup",
        isOptional: false,
        substitution: "Toasted unsalted pistachios",
      },
      {
        id: "smpcp-5",
        name: "Ceremonial-grade matcha powder",
        quantity: "2 tsp",
        isOptional: false,
        substitution: "Culinary-grade matcha",
      },
      {
        id: "smpcp-6",
        name: "Maple syrup",
        quantity: "3 tbsp",
        isOptional: false,
        substitution: "Honey or agave",
      },
      {
        id: "smpcp-7",
        name: "Vanilla extract",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "½ tsp vanilla bean paste",
      },
      {
        id: "smpcp-8",
        name: "Salt",
        quantity: "a pinch",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction:
          "In a blender, combine the milk, pistachios, matcha, maple syrup, vanilla and a pinch of salt. Blend until completely smooth and vibrant green.",
        timerSeconds: 90,
        mistakeWarning:
          "Blend the pistachios fully — leave them gritty and the pudding turns out sandy instead of silky.",
        quickHack:
          "A pinch of salt sharpens the matcha and makes the maple taste sweeter without more sugar.",
        cuisineFact:
          "Ceremonial-grade matcha is stone-ground from shade-grown leaves — that shade is why it's so intensely green.",
        donenessCue:
          "Uniformly jade-green, frothy and smooth with no visible nut bits.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Add the Greek yogurt to a medium bowl and whisk in the blended matcha-pistachio milk until fully combined.",
        timerSeconds: null,
        mistakeWarning:
          "Whisk the yogurt in fully — rushed mixing leaves white streaks and lumps.",
        quickHack:
          "Loosen the yogurt with a spoonful of the milk first, then add the rest, to avoid clumping.",
        cuisineFact:
          "The yogurt is what makes this version scoopable rather than a loose, drinkable pudding.",
        donenessCue: "One even, pale-jade, lump-free mixture.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Stir in the chia seeds, let sit 5 minutes, then stir again to keep them from clumping.",
        timerSeconds: 300,
        mistakeWarning:
          "That second stir is non-negotiable — skip it and the chia clumps into gel pockets at the bottom.",
        quickHack:
          "The early stir is what gives you an even, tapioca-like set.",
        cuisineFact:
          "Chia seeds absorb up to 10× their weight in liquid — that's the whole thickening trick.",
        donenessCue:
          "The seeds are evenly suspended and the mix is starting to thicken.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Cover and refrigerate at least 2–4 hours, or overnight, until thick and scoopable.",
        timerSeconds: 14400,
        mistakeWarning:
          "Give it the full chill — under-set pudding is runny and won't hold a scoop.",
        quickHack:
          "Overnight gives the richest, firmest texture, so make it the night before.",
        cuisineFact:
          "As it rests, the chia forms a gel that traps the matcha-pistachio milk into a custard-like body.",
        donenessCue:
          "The pudding holds a clean spoon-trough and is thick enough to scoop without slumping.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Scoop into bowls and finish with crushed pistachios and a dusting of matcha.",
        timerSeconds: null,
        mistakeWarning:
          "Add crunchy toppings only right before serving — chopped pistachios go soft if they sit in the pudding.",
        quickHack:
          "A warm ice-cream scoop gives clean, round portions for that viral presentation.",
        cuisineFact:
          "Crushed pistachios and a dusting of matcha is the signature finish for this dish online.",
        donenessCue:
          "Firm, rounded scoops sitting proud in the bowl, topped and ready.",
        imageUrl: null,
      },
    ],
  },
};

export const VIRAL_MEAL_FLOWS: Record<string, StaticDishData> = {
  "viral-hot-honey-beef-taco-bowls": {
    name: "Viral Hot Honey Beef Taco Bowls",
    slug: "viral-hot-honey-beef-taco-bowls",
    description:
      "A high-protein deconstructed taco bowl: lean ground beef fried with paprika, onion, garlic and chili, layered with air-fried seasoned sweet-potato cubes and a creamy mashed-avocado-and-yogurt base, then finished with a quick hot honey of honey, sriracha and chili flakes drizzled over everything.",
    cuisineFamily: "mexican",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: ["savory", "spicy", "sweet"],
    temperature: "hot",
    ingredients: [
      {
        id: "vhhbtb-1",
        name: "Lean ground beef (95/5)",
        quantity: "150 g",
        isOptional: false,
        substitution: "Ground turkey or chicken",
      },
      {
        id: "vhhbtb-2",
        name: "Sweet potato",
        quantity: "200 g",
        isOptional: false,
        substitution: "Butternut squash",
      },
      {
        id: "vhhbtb-3",
        name: "Avocado",
        quantity: "60 g",
        isOptional: false,
        substitution: null,
      },
      {
        id: "vhhbtb-4",
        name: "Non-fat Greek yogurt",
        quantity: "~60 g (a few dollops)",
        isOptional: false,
        substitution: "Cottage cheese",
      },
      {
        id: "vhhbtb-5",
        name: "Honey (for the hot honey)",
        quantity: "1 tbsp",
        isOptional: false,
        substitution: "Maple syrup",
      },
      {
        id: "vhhbtb-6",
        name: "Sriracha",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Any hot sauce",
      },
      {
        id: "vhhbtb-7",
        name: "Tomato purée",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Tomato paste",
      },
      {
        id: "vhhbtb-8",
        name: "Paprika, onion powder, garlic powder, chili powder (for the beef)",
        quantity: "½ tsp each",
        isOptional: false,
        substitution: "Taco seasoning",
      },
      {
        id: "vhhbtb-9",
        name: "Chip / fry seasoning (for the sweet potato)",
        quantity: "1 tsp",
        isOptional: false,
        substitution: "Salt + pepper + paprika",
      },
      {
        id: "vhhbtb-10",
        name: "Red chili flakes (for the hot honey)",
        quantity: "a pinch",
        isOptional: false,
        substitution: null,
      },
      {
        id: "vhhbtb-11",
        name: "Lemon or lime juice",
        quantity: "a squeeze, for the avocado",
        isOptional: true,
        substitution: null,
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Chop the sweet potato into even 1–2 cm cubes.",
        timerSeconds: null,
        mistakeWarning:
          "Keep the cubes even — mixed sizes mean some burn in the air fryer while others stay raw.",
        quickHack:
          "Cut a flat base on the round potato first so it doesn't roll under your knife.",
        cuisineFact:
          "Sweet potato is the carb swap that makes this bowl filling without rice.",
        donenessCue: "Uniform bite-sized cubes, roughly thumbnail-width.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction:
          "Pop the cubes in a bowl and microwave for 6 minutes to soften.",
        timerSeconds: 360,
        mistakeWarning:
          "Don't skip the par-cook — raw cubes won't cook through in the air fryer before the outside scorches.",
        quickHack: "Cover the bowl loosely so they steam-soften faster.",
        cuisineFact:
          "A quick microwave pre-cook is the meal-prep shortcut that makes air-fried sweet potato actually crisp.",
        donenessCue:
          "A fork pierces a cube with light resistance — soft but not mushy.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 3,
        instruction:
          "Spray the cubes with oil and toss with the chip seasoning (or just salt and pepper).",
        timerSeconds: null,
        mistakeWarning:
          "Toss to coat every face — bare cubes won't crisp or brown.",
        quickHack:
          "Use an oil spray, not a pour, so they crisp instead of going greasy.",
        cuisineFact:
          '"Chip seasoning" is the UK name for a paprika-forward fry spice — it gives these a takeaway-fries vibe.',
        donenessCue:
          "Cubes glisten lightly and are evenly dusted with seasoning.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 4,
        instruction:
          "Air fry the cubes for about 15 minutes at 190°C / 375°F, shaking halfway. Start the beef now so both finish together.",
        timerSeconds: 900,
        mistakeWarning:
          "Shake the basket halfway — leave them and the down-facing sides burn while the tops stay pale.",
        quickHack: "Start the beef in the next step now to time them together.",
        cuisineFact:
          "190°C is the sweet spot where the natural sugars caramelize without turning bitter.",
        donenessCue:
          "Cubes are deep golden, crisp at the edges and tender in the middle.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 5,
        instruction:
          "Fry the beef in a hot dry pan, breaking it up fine, and stir in ½ tsp each paprika, onion powder, garlic powder and chili powder.",
        timerSeconds: 480,
        mistakeWarning:
          "Break the beef up fine and let the liquid cook off — wet, clumpy mince won't take color or flavor.",
        quickHack:
          "95% lean needs almost no oil; a hot dry pan is enough to get a sear.",
        cuisineFact:
          "Blooming the spices in the hot fat for the last minute wakes up far more flavor than adding them cold.",
        donenessCue:
          "No pink remains and the beef has browned, crumbly bits with the moisture cooked off.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 6,
        instruction: "Stir in 1 tsp tomato purée and cook it out for a minute.",
        timerSeconds: 60,
        mistakeWarning:
          "Cook the purée for a minute — raw tomato paste tastes sharp and tinny.",
        quickHack:
          "Let it darken slightly against the hot pan to deepen the flavor.",
        cuisineFact:
          "A spoon of purée is what nudges plain mince toward taco-meat richness.",
        donenessCue:
          "The beef turns glossy brick-red and smells sweet-savory, not raw-tomato.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 7,
        instruction:
          "Build the bowl: add the crisp sweet potato and browned beef, draining any excess liquid first.",
        timerSeconds: null,
        mistakeWarning:
          "Drain off any excess liquid first so the bowl isn't watery.",
        quickHack:
          "Build the carb and protein on one side so there's room for the creamy base.",
        cuisineFact:
          "Layering instead of mixing keeps each element's texture distinct — the whole appeal of a bowl.",
        donenessCue:
          "A hot, dry-ish mound of crisp sweet potato and browned beef.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 8,
        instruction:
          "Mash the avocado with the lemon juice and a pinch of salt, then spoon it in alongside the Greek yogurt.",
        timerSeconds: null,
        mistakeWarning:
          "Add lemon and salt to the avocado right away — it stops browning and tastes flat without the acid.",
        quickHack:
          "Mash the avocado straight into the yogurt for an instant creamy crema.",
        cuisineFact:
          "The yogurt-avocado combo is the protein-boosting swap that replaces sour cream and guac in one.",
        donenessCue:
          "A smooth, pale-green creamy base spooned alongside the warm components.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 9,
        instruction:
          "Mix the hot honey — honey, sriracha and chili flakes — and drizzle it all over the bowl.",
        timerSeconds: null,
        mistakeWarning:
          "Taste and balance — too much sriracha and it's just hot; the honey has to come through sweet first, heat second.",
        quickHack:
          "Warm the honey for 10 seconds so it pours in a thin, even drizzle instead of a blob.",
        cuisineFact:
          "Hot honey blew up online for exactly this — sweet-heat over savory food hits every craving at once.",
        donenessCue:
          "A glossy red-gold drizzle laced over the whole bowl, ready to eat.",
        imageUrl: null,
      },
    ],
  },
};
