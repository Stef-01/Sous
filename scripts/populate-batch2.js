// Populate guided cook steps for batch 2 of American sides.
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "src", "data", "sides.json");
const sides = JSON.parse(fs.readFileSync(file, "utf8"));

const updates = {
  // Source: J. Kenji Lopez-Alt, Serious Eats — "Classic Potato Salad"
  // https://www.seriouseats.com/classic-potato-salad-recipe
  "potato-salad": [
    {
      step: 1,
      phase: "prep",
      instruction:
        "Peel 2 lbs Yukon Gold potatoes and cut into ¾-inch cubes. Place directly into a large pot and cover with cold water by 1 inch. Add 2 Tbsp white vinegar and 2 Tbsp kosher salt.",
      duration: 10,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning:
        "Starting potatoes in hot water cooks the outsides before the centers — always start in cold water for even cooking.",
      hackChip:
        "Vinegar in the boiling water keeps the pectin firm so cubes hold their shape instead of crumbling.",
      cuisineFact: null,
    },
    {
      step: 2,
      phase: "cook",
      instruction:
        "Bring the pot to a boil over high heat, then reduce to a steady simmer. Cook until a paring knife slides into a cube with no resistance, 12–15 minutes.",
      duration: 15,
      timerTrigger: true,
      timerMinutes: 15,
      mistakeWarning:
        "Boiling too hard knocks the cubes against each other and shears the edges into a mushy paste. Keep it at a gentle simmer.",
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 3,
      phase: "cook",
      instruction:
        "Drain the potatoes in a colander. While still hot, toss them gently in a wide bowl with 2 Tbsp white wine vinegar — hot potatoes drink up the seasoning. Let cool 10 minutes.",
      duration: 10,
      timerTrigger: true,
      timerMinutes: 10,
      mistakeWarning:
        "Skipping the hot vinegar dousing leaves bland potatoes that no amount of dressing later can fix.",
      hackChip:
        "This step is Kenji's key insight: season at every layer, not just at the end.",
      cuisineFact: null,
    },
    {
      step: 4,
      phase: "prep",
      instruction:
        "While potatoes cool, finely dice 3 ribs of celery, 4 scallions (whites and greens separated), and 4 hard-boiled eggs. Roughly chop ⅓ cup cornichons or dill pickles.",
      duration: 8,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning: null,
      hackChip:
        "Hard-boil eggs by placing in cold water, bringing to a boil, covering, turning off heat, and waiting 11 minutes. Ice bath, then peel.",
      cuisineFact: null,
    },
    {
      step: 5,
      phase: "finish",
      instruction:
        "In a large bowl, whisk ¾ cup mayonnaise, 2 Tbsp Dijon mustard, 2 Tbsp sweet pickle relish, 1 tsp celery seed, ½ tsp salt, and freshly ground black pepper. Fold in the cooled potatoes, celery, scallion whites, eggs, and pickles.",
      duration: 4,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning: null,
      hackChip:
        "Fold gently with a rubber spatula, lifting from the bottom — stirring smashes the cubes.",
      cuisineFact: null,
    },
    {
      step: 6,
      phase: "finish",
      instruction:
        "Refrigerate for at least 1 hour. Just before serving, taste and adjust salt and pepper, then top with the reserved scallion greens and a sprinkle of paprika.",
      duration: 60,
      timerTrigger: true,
      timerMinutes: 60,
      mistakeWarning: null,
      hackChip: null,
      cuisineFact: null,
    },
  ],

  // Source: Striped Spatula / classic Southern method — Buttermilk Cornbread in cast iron
  // https://stripedspatula.com/buttermilk-cornbread/
  cornbread: [
    {
      step: 1,
      phase: "prep",
      instruction:
        "Place a 10-inch cast iron skillet in the cold oven and preheat to 425°F. The screaming-hot pan is what gives Southern cornbread its signature crackly crust.",
      duration: 15,
      timerTrigger: true,
      timerMinutes: 15,
      mistakeWarning:
        "Pouring batter into a cold or barely warm skillet is the #1 reason home cornbread is pale and pasty on the bottom.",
      hackChip:
        "No cast iron? A heavy oven-safe skillet works, but the crust won't be as dramatic.",
      cuisineFact:
        "Cast iron is the traditional Southern vessel for cornbread because the thermal mass mimics a hearth oven.",
    },
    {
      step: 2,
      phase: "prep",
      instruction:
        "In a large bowl, whisk together 1½ cups yellow cornmeal, ½ cup all-purpose flour, 2 Tbsp sugar (or honey), 1 tsp salt, 1 tsp baking soda, and 1 tsp baking powder.",
      duration: 3,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning:
        "Skipping the baking soda gives you flat, dense cornbread — buttermilk needs both soda (for rise) and powder (for lift).",
      hackChip:
        "Use stone-ground cornmeal for a more rustic, full-corn flavor and slightly coarser crumb.",
      cuisineFact: null,
    },
    {
      step: 3,
      phase: "prep",
      instruction:
        "In a separate bowl, whisk 2 large eggs with 1¾ cups buttermilk and ¼ cup melted unsalted butter (cooled slightly so it doesn't scramble the eggs).",
      duration: 3,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning: null,
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 4,
      phase: "prep",
      instruction:
        "Pour the wet ingredients into the dry and stir with a rubber spatula just until no streaks of flour remain. Some lumps are fine — overmixing develops gluten and gives you tough cornbread.",
      duration: 1,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning:
        "Stirring until perfectly smooth = chewy, dense bread. Stop the moment everything is moistened.",
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 5,
      phase: "cook",
      instruction:
        "Pull the hot skillet from the oven (use thick mitts!). Add 2 Tbsp butter — it will sizzle and foam. Swirl to coat the bottom and sides, then immediately pour in the batter. It should sizzle on contact.",
      duration: 1,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning:
        "If the butter doesn't sizzle when it hits the pan, the pan isn't hot enough — you'll lose the crust.",
      hackChip:
        "Substitute the butter with 2 Tbsp bacon fat for the truly authentic Southern flavor.",
      cuisineFact: null,
    },
    {
      step: 6,
      phase: "cook",
      instruction:
        "Return the skillet to the oven and bake until the top is golden brown and a toothpick inserted in the center comes out clean, 20–25 minutes.",
      duration: 22,
      timerTrigger: true,
      timerMinutes: 22,
      mistakeWarning: null,
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 7,
      phase: "finish",
      instruction:
        "Let the cornbread rest in the skillet for 5 minutes before slicing into wedges. Serve warm with butter and honey.",
      duration: 5,
      timerTrigger: true,
      timerMinutes: 5,
      mistakeWarning: null,
      hackChip: null,
      cuisineFact: null,
    },
  ],

  // Source: Adapted from "Old-Fashioned Molasses and Bacon Baked Beans" (Rock Recipes / classic Boston style)
  // https://www.rockrecipes.com/old-fashioned-molasses-and-bacon-baked-beans/
  "baked-beans": [
    {
      step: 1,
      phase: "prep",
      instruction:
        "Soak 1 lb dried navy beans in 8 cups cold water overnight (at least 8 hours). They'll roughly double in size.",
      duration: 480,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning:
        "Skipping the overnight soak adds 1+ hours to the cooking time and gives you unevenly cooked beans.",
      hackChip:
        "No time to soak overnight? Quick-soak: cover beans with water, boil 2 minutes, cover, off heat, sit 1 hour.",
      cuisineFact:
        "Boston Baked Beans built American molasses culture — colonial New England traded heavily in West Indies molasses.",
    },
    {
      step: 2,
      phase: "cook",
      instruction:
        "Drain and rinse the beans. Place in a Dutch oven with 8 cups fresh water. Bring to a boil, reduce to a simmer, and cook uncovered until tender but still holding shape, about 60 minutes. Drain, reserving 2 cups of the cooking liquid.",
      duration: 60,
      timerTrigger: true,
      timerMinutes: 60,
      mistakeWarning:
        "Adding salt or acid (tomato, vinegar) before the beans are tender keeps them tough forever. Save those for after.",
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 3,
      phase: "cook",
      instruction:
        "While beans simmer, cut 8 oz thick-cut bacon into ½-inch pieces. In the same Dutch oven (after draining beans), fry the bacon over medium heat until the fat is rendered and bacon is just crisp, 6–8 minutes. Remove bacon to a paper towel; leave fat in the pot.",
      duration: 8,
      timerTrigger: true,
      timerMinutes: 8,
      mistakeWarning: null,
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 4,
      phase: "cook",
      instruction:
        "In the bacon fat, sauté 1 large diced yellow onion until softened and golden at the edges, 6–8 minutes. Add 2 minced garlic cloves and cook 30 seconds more.",
      duration: 8,
      timerTrigger: true,
      timerMinutes: 8,
      mistakeWarning: null,
      hackChip:
        "Don't rush the onions — the deeper they brown here, the deeper the finished bean flavor.",
      cuisineFact: null,
    },
    {
      step: 5,
      phase: "cook",
      instruction:
        "Stir in ½ cup fancy molasses (NOT blackstrap — too bitter), ⅓ cup brown sugar, ⅓ cup ketchup, 2 Tbsp apple cider vinegar, 2 Tbsp Dijon mustard, 1 tsp salt, and ½ tsp black pepper. Add the cooked beans, bacon, and 1½ cups of the reserved bean liquid. Stir to combine.",
      duration: 3,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning:
        'Blackstrap molasses turns baked beans bitter and metallic. Use "fancy" or "light" molasses (Grandma\'s, Crosby\'s).',
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 6,
      phase: "cook",
      instruction:
        "Cover the Dutch oven and transfer to a 350°F oven. Bake 2 hours, stirring every 30 minutes and adding more bean liquid (or water) if it looks dry.",
      duration: 120,
      timerTrigger: true,
      timerMinutes: 120,
      mistakeWarning: null,
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 7,
      phase: "finish",
      instruction:
        "Uncover and bake another 30 minutes, until the sauce is thick and glossy and a few beans on top are slightly caramelized. Let rest 10 minutes before serving — they thicken further off the heat.",
      duration: 30,
      timerTrigger: true,
      timerMinutes: 30,
      mistakeWarning: null,
      hackChip:
        "Leftovers are even better day two — let them cool completely, then reheat with a splash of water.",
      cuisineFact: null,
    },
  ],

  // Source: J. Kenji Lopez-Alt, Serious Eats — "3-Ingredient Stovetop Mac and Cheese"
  // https://www.seriouseats.com/3-ingredient-stovetop-mac-and-cheese-recipe
  "mac-and-cheese": [
    {
      step: 1,
      phase: "prep",
      instruction:
        "Grate 6 oz sharp cheddar (or a mix of cheddar + Gruyère) on the large holes of a box grater. Pre-grated bagged cheese has anti-caking starch that makes the sauce gritty.",
      duration: 4,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning:
        "Using bagged shredded cheese is the fastest way to ruin this recipe — the cellulose coating refuses to melt smoothly.",
      hackChip:
        "A 50/50 mix of sharp cheddar and Gruyère gives you classic flavor + extra meltiness.",
      cuisineFact: null,
    },
    {
      step: 2,
      phase: "prep",
      instruction:
        "Measure 6 oz dried elbow macaroni and 6 oz (¾ cup) evaporated milk into separate small bowls. Have everything within arm's reach — once the cooking starts, it moves fast.",
      duration: 1,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning: null,
      hackChip:
        "Use a kitchen scale — eyeballing 6 oz of dried pasta is hard, and ratios matter for this no-roux method.",
      cuisineFact: null,
    },
    {
      step: 3,
      phase: "cook",
      instruction:
        "Place the macaroni in a medium saucepan and add just enough cold water to cover (about 1½ cups). Add a generous pinch of salt. Bring to a boil over high heat, stirring frequently to prevent sticking.",
      duration: 4,
      timerTrigger: true,
      timerMinutes: 4,
      mistakeWarning:
        "Adding too much water dilutes the starch you need for a creamy sauce. Just barely cover.",
      hackChip:
        "The starchy pasta water IS the sauce base in this method — that's why traditional \"drain the pasta\" rules don't apply here.",
      cuisineFact: null,
    },
    {
      step: 4,
      phase: "cook",
      instruction:
        "Continue cooking, stirring constantly, until most of the water has been absorbed and the pasta is just shy of al dente, about 6 minutes total. The pot should look almost dry.",
      duration: 6,
      timerTrigger: true,
      timerMinutes: 6,
      mistakeWarning:
        "Walking away during this stage will scorch the pasta on the bottom. Constant stirring is non-negotiable.",
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 5,
      phase: "cook",
      instruction:
        "Pour in the evaporated milk and bring back to a simmer. Reduce heat to low and add the grated cheese a handful at a time, stirring continuously until each addition is fully melted before adding the next.",
      duration: 2,
      timerTrigger: true,
      timerMinutes: 2,
      mistakeWarning:
        "Dumping all the cheese in at once breaks the sauce. Add gradually for a perfectly emulsified, glossy cheese sauce.",
      hackChip:
        "The proteins in evaporated milk are what stabilize this sauce — regular milk will break and turn grainy.",
      cuisineFact: null,
    },
    {
      step: 6,
      phase: "finish",
      instruction:
        "Stir in ½ tsp Dijon mustard, a few grinds of black pepper, and a pinch of cayenne for warmth. Taste and adjust salt. Serve immediately — this dish is best the moment it's done.",
      duration: 1,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning: null,
      hackChip:
        "Dijon doesn't taste mustardy in the finished dish — it amplifies the cheese flavor.",
      cuisineFact: null,
    },
  ],

  // Source: Once Upon a Chef — Quick and Easy Refrigerator Pickles
  // https://www.onceuponachef.com/recipes/quick-and-easy-dill-pickles.html
  pickles: [
    {
      step: 1,
      phase: "prep",
      instruction:
        "Wash 1½ lbs Kirby (pickling) cucumbers and trim about ⅛ inch off each end — the blossom end contains enzymes that soften pickles. Slice into ¼-inch coins or spears.",
      duration: 8,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning:
        "Regular slicing cucumbers (long, smooth-skinned) give you soft, hollow pickles. Always use Kirby or Persian.",
      hackChip:
        "For maximum crunch, soak cut cucumbers in ice water for 30 minutes before brining.",
      cuisineFact: null,
    },
    {
      step: 2,
      phase: "prep",
      instruction:
        "In a clean wide-mouth quart jar, layer in 4 smashed garlic cloves, 1 Tbsp whole black peppercorns, 1 tsp yellow mustard seeds, 1 tsp coriander seeds, ½ tsp red pepper flakes, and a generous handful of fresh dill (about ¼ cup of fronds + 2 dill flower heads if you have them).",
      duration: 3,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning: null,
      hackChip:
        "Smashing the garlic with the side of a knife (not mincing) releases flavor without making the pickles taste like garlic paste.",
      cuisineFact: null,
    },
    {
      step: 3,
      phase: "prep",
      instruction:
        "Pack the cucumbers into the jar, standing them on end if cut as spears, or layering coins. Pack tightly — they should not float freely.",
      duration: 3,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning:
        "Loosely packed pickles bob to the surface, dry out, and turn slimy.",
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 4,
      phase: "cook",
      instruction:
        "In a small saucepan, combine 1½ cups distilled white vinegar (5% acidity), 1½ cups water, 2 Tbsp kosher salt, and 1 Tbsp sugar. Bring to a boil over high heat, stirring until the salt and sugar fully dissolve, about 2 minutes.",
      duration: 5,
      timerTrigger: true,
      timerMinutes: 5,
      mistakeWarning:
        "Using a vinegar with less than 5% acidity won't safely preserve the pickles — check the label.",
      hackChip: null,
      cuisineFact: null,
    },
    {
      step: 5,
      phase: "cook",
      instruction:
        "Remove brine from heat and let cool until just barely warm to the touch (about 15 minutes), or speed it up by setting the pot in an ice bath. Pouring boiling brine over cucumbers makes mushy pickles.",
      duration: 15,
      timerTrigger: true,
      timerMinutes: 15,
      mistakeWarning:
        "Hot brine = soft pickles, period. Patience here is the difference between snappy and sad.",
      hackChip:
        "Refrigerator pickles are NOT shelf-stable — they keep 4–6 weeks in the fridge but should never be left out.",
      cuisineFact: null,
    },
    {
      step: 6,
      phase: "finish",
      instruction:
        "Pour the cooled brine over the cucumbers until fully submerged. Tap the jar gently on the counter to release air bubbles. Seal and refrigerate at least 24 hours before tasting — they'll keep getting better for a week.",
      duration: 1440,
      timerTrigger: false,
      timerMinutes: null,
      mistakeWarning: null,
      hackChip:
        "For peak flavor, wait 3 full days. The garlic and dill need time to infuse.",
      cuisineFact: null,
    },
  ],
};

let updated = 0;
for (const side of sides) {
  if (updates[side.id]) {
    side.guidedCookSteps = updates[side.id];
    updated++;
    console.log("Populated:", side.id);
  }
}

fs.writeFileSync(file, JSON.stringify(sides, null, 2) + "\n");
console.log("Updated", updated, "sides.");
