#!/usr/bin/env python3
"""Populate guided cook steps for Batch 1: Mediterranean + Italian sides."""
import json
import sys
from pathlib import Path

SIDES_PATH = Path("src/data/sides.json")

BATCH1 = {
    "minestrone": [
        {
            "step": 1, "phase": "prep",
            "instruction": "Dice 1 small yellow onion, 2 carrots, and 2 celery stalks into small, uniform pieces — this is your soffritto, the flavor foundation. Mince 4 garlic cloves separately since garlic burns faster.",
            "duration": 5, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Don't add garlic with the other aromatics — it'll burn before the onions soften. Hold it for the last minute of sautéing.",
            "hackChip": "Uniform dice means uniform cooking. Aim for 1/4-inch pieces across onion, carrot, and celery.",
            "cuisineFact": "Minestrone literally means 'big soup' in Italian — 'mine' (soup) + the augmentative '-one' (big). It was traditionally the Italian peasant's way to use up whatever vegetables were on hand."
        },
        {
            "step": 2, "phase": "cook",
            "instruction": "Heat 1/4 cup extra virgin olive oil in a large Dutch oven over medium heat until shimmering. Add the onion, carrot, and celery. Raise heat to medium-high and cook 5 minutes, stirring regularly, until softened and just starting to color.",
            "duration": 6, "timerTrigger": True, "timerMinutes": 5,
            "mistakeWarning": "Don't rush the soffritto at high heat — you want it soft and sweet, not browned. Medium-high with frequent stirring is the sweet spot.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 3, "phase": "cook",
            "instruction": "Add minced garlic and cook 1 minute until fragrant. Stir in 1 diced zucchini, 1 cup green beans cut into 1-inch pieces, 1 tsp paprika, 1/2 tsp dried rosemary, salt, and pepper. Toss to coat for 1 minute.",
            "duration": 2, "timerTrigger": True, "timerMinutes": 2,
            "mistakeWarning": "If the garlic browns, it turns bitter. Pull the pot off the heat for a few seconds if it starts to color too fast.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 4, "phase": "cook",
            "instruction": "Pour in one 15-oz can crushed tomatoes and 6 cups vegetable or chicken broth. Add 2-3 sprigs fresh thyme, 1 bay leaf, and a Parmesan rind if you have one. Bring to a boil, then reduce to a gentle simmer, partially cover, and cook 20 minutes.",
            "duration": 22, "timerTrigger": True, "timerMinutes": 20,
            "mistakeWarning": "A full rolling boil will break down the vegetables into mush. Keep it at a lazy simmer — small bubbles breaking the surface.",
            "hackChip": "That Parmesan rind is flavor gold. Every time you finish a wedge, toss the rind in a freezer bag for soups like this one.",
            "cuisineFact": None
        },
        {
            "step": 5, "phase": "cook",
            "instruction": "Meanwhile, in a separate pot, bring salted water to a boil and cook 1 cup ditalini or elbow pasta to al dente per package directions (about 7-9 minutes). Drain and set aside. Cooking pasta separately prevents it from turning mushy in leftovers.",
            "duration": 9, "timerTrigger": True, "timerMinutes": 8,
            "mistakeWarning": "Cooking pasta directly in the soup is the #1 minestrone mistake — it absorbs broth, gets gummy, and leftovers turn to paste.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 6, "phase": "finish",
            "instruction": "Uncover the soup, add one 15-oz can drained and rinsed kidney beans, and simmer 5 more minutes. Stir in a handful of chopped parsley and basil. Remove the cheese rind and bay leaf. Add the cooked pasta and warm through — don't boil.",
            "duration": 5, "timerTrigger": True, "timerMinutes": 5,
            "mistakeWarning": None,
            "hackChip": "Minestrone tastes even better the next day as flavors meld. Store soup and pasta separately.",
            "cuisineFact": None
        },
        {
            "step": 7, "phase": "finish",
            "instruction": "Taste and adjust salt and pepper. Ladle into bowls and finish with grated Parmesan and a drizzle of good olive oil.",
            "duration": 2, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": None,
            "hackChip": "A final cold drizzle of extra virgin olive oil on each bowl is classic Italian finishing — the raw fat carries aroma right to your nose.",
            "cuisineFact": None
        }
    ],
    "fattoush": [
        {
            "step": 1, "phase": "prep",
            "instruction": "Break 2 pita breads into bite-sized pieces. Line a plate with paper towels. Heat 3 tablespoons extra virgin olive oil in a large skillet over medium heat until shimmering.",
            "duration": 3, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Skip store-bought pita chips — they're too uniform and hard. Toasted fresh pita is fundamental to real fattoush.",
            "hackChip": "Day-old or slightly stale pita crisps up faster and better than fresh — a great way to use up leftovers.",
            "cuisineFact": "'Fattoush' comes from the Arabic 'fatteh' meaning 'crumbs.' It's the Levantine answer to not wasting stale bread — a peasant dish elevated by herbs and sumac."
        },
        {
            "step": 2, "phase": "cook",
            "instruction": "Add pita pieces to the hot oil and fry, tossing frequently, until browned and crisp — about 2-3 minutes. Transfer to the paper towel with tongs. Season immediately with salt, pepper, and 1 teaspoon sumac while still hot so the spice sticks.",
            "duration": 3, "timerTrigger": True, "timerMinutes": 3,
            "mistakeWarning": "Pita burns fast once it turns golden. Keep tossing and pull it the moment it's evenly browned.",
            "hackChip": "For a lighter version, toss pita with oil and bake at 400°F for 8-10 minutes instead of frying.",
            "cuisineFact": None
        },
        {
            "step": 3, "phase": "prep",
            "instruction": "Chop 1 heart of romaine lettuce. Seed and dice 1 English cucumber. Chop 5 Roma tomatoes and 5 green onions (white and green parts). Thinly slice 5 radishes. Stem and roughly chop 2 cups fresh parsley and 1 cup fresh mint.",
            "duration": 10, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Watery tomatoes will dilute the dressing. If they're very juicy, squeeze seeds out gently before adding.",
            "hackChip": "Scrape the cucumber seeds out with a spoon — the outer flesh has all the crunch, the seeds just make your salad wet.",
            "cuisineFact": None
        },
        {
            "step": 4, "phase": "prep",
            "instruction": "In a small bowl, whisk together juice of 1 lemon, 1/3 cup extra virgin olive oil, 1 tablespoon pomegranate molasses (if using), 1 teaspoon sumac, 1/4 teaspoon ground cinnamon, 1/8 teaspoon ground allspice, salt, and pepper until emulsified.",
            "duration": 2, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Skipping the sumac is the biggest mistake — it's the tart, berry-red spice that defines fattoush. No substitute captures it.",
            "hackChip": "Pomegranate molasses is optional but transformative — it adds a deep, sweet-tart complexity that elevates the dressing.",
            "cuisineFact": None
        },
        {
            "step": 5, "phase": "finish",
            "instruction": "In a large bowl, combine all vegetables and herbs. Pour dressing over and toss lightly to coat. Add the crispy pita pieces and toss again gently. Taste and adjust with more sumac or salt if needed. Serve immediately.",
            "duration": 2, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Don't add the pita until right before serving — it goes soggy within minutes once dressed.",
            "hackChip": None,
            "cuisineFact": None
        }
    ],
    "stuffed-grape-leaves": [
        {
            "step": 1, "phase": "prep",
            "instruction": "Open a 16-oz jar of grape leaves. Discard the brine and rinse the leaves well under cold water to remove excess salt. Drain and set aside in a colander.",
            "duration": 5, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Skipping the rinse means over-salted dolmas. Jarred leaves are packed in heavy brine — rinse them thoroughly.",
            "hackChip": "Separate the leaves as you rinse — they stick together in the jar and tear if you pull them apart dry.",
            "cuisineFact": "Dolma comes from the Turkish 'dolmak' meaning 'to be filled.' Variations span the former Ottoman world from Greece to Iran, each region claiming their version as the original."
        },
        {
            "step": 2, "phase": "prep",
            "instruction": "Soak 1½ cups short-grain rice in cold water for 15 minutes, then drain. Finely chop 1 large yellow onion. Chop 1/2 cup each fresh parsley, dill, and mint.",
            "duration": 15, "timerTrigger": True, "timerMinutes": 15,
            "mistakeWarning": None,
            "hackChip": "Soaking the rice shortens the cook time and helps it absorb the broth more evenly inside the leaves.",
            "cuisineFact": None
        },
        {
            "step": 3, "phase": "cook",
            "instruction": "Heat 2 tablespoons olive oil in a skillet over medium heat. Sauté the onion 2-3 minutes until translucent. Add 12 oz lean ground beef and brown 5-6 minutes, breaking it up. Drain excess fat. Season with 1 tsp allspice, 1/2 tsp cumin, salt, and pepper.",
            "duration": 9, "timerTrigger": True, "timerMinutes": 6,
            "mistakeWarning": "Don't skip draining the fat — excess grease makes the filling heavy and greasy instead of fragrant.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 4, "phase": "prep",
            "instruction": "Let the meat mixture cool slightly, then combine with the drained rice and chopped herbs in a large bowl. Drizzle generously with olive oil and mix well. Taste — the raw mixture should be clearly seasoned.",
            "duration": 3, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Under-seasoning the filling is the #1 mistake. The rice will dilute the seasoning during cooking, so it should taste slightly over-seasoned raw.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 5, "phase": "prep",
            "instruction": "Place a grape leaf vein-side up with the stem closest to you. Trim any stem. Place a heaping teaspoon of filling horizontally near the bottom. Fold the bottom up over filling, fold in both sides, then roll tightly away from you like a tiny burrito. Place seam-side down on a tray.",
            "duration": 20, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Don't overstuff — rice expands as it cooks. A heaping teaspoon per leaf is plenty; any more and they burst open.",
            "hackChip": "Tight rolls hold together; loose rolls unravel. Practice the first few, then speed builds fast.",
            "cuisineFact": None
        },
        {
            "step": 6, "phase": "cook",
            "instruction": "Line the bottom of a heavy pot with 3 unrolled grape leaves and top with a few tomato slices — this prevents scorching. Arrange rolled dolmas seam-side down in tight rows, stacking in layers.",
            "duration": 5, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": None,
            "hackChip": "Pack them tightly — they need to hold each other in place, or they'll float and unravel.",
            "cuisineFact": None
        },
        {
            "step": 7, "phase": "cook",
            "instruction": "Place a small inverted plate on top of the dolmas to weigh them down. Pour 4 cups of boiling broth over to just cover. Cover the pot, bring to a simmer, and cook over medium heat for 30 minutes.",
            "duration": 30, "timerTrigger": True, "timerMinutes": 30,
            "mistakeWarning": "Without the weight plate, dolmas float and unravel. Any small heatproof plate that fits inside the pot works.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 8, "phase": "finish",
            "instruction": "Uncover, pour the juice of 2 lemons over the dolmas, cover again and cook on low heat 30-45 more minutes until rice is fully tender. Turn off heat and let rest uncovered 20-30 minutes before serving — this helps them set and hold their shape.",
            "duration": 60, "timerTrigger": True, "timerMinutes": 45,
            "mistakeWarning": "Serving immediately gives you falling-apart dolmas. The rest is non-negotiable — they firm up as they cool.",
            "hackChip": "Dolmas taste even better the next day cold, served with Greek yogurt.",
            "cuisineFact": None
        }
    ],
    "pita-chips": [
        {
            "step": 1, "phase": "prep",
            "instruction": "Preheat oven to 425°F. Do NOT line your sheet pan with parchment paper — direct contact with the hot metal creates crispier, more evenly browned chips.",
            "duration": 10, "timerTrigger": True, "timerMinutes": 10,
            "mistakeWarning": "Parchment paper insulates the pita from the pan, giving you soft, pale chips instead of crispy golden ones.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 2, "phase": "prep",
            "instruction": "Take 2-3 pita pocket breads and use kitchen shears or a knife to split along the seam, separating each pita into two thin rounds. This doubles your chip yield and gives the crispest result.",
            "duration": 2, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Skipping the split means thick, doughy chips. The key to true crispness is that thin single layer.",
            "hackChip": "Slightly stale pita splits more cleanly than fresh — the bread pulls apart at the seam instead of tearing.",
            "cuisineFact": None
        },
        {
            "step": 3, "phase": "prep",
            "instruction": "Brush both sides of each pita round generously with extra virgin olive oil. Sprinkle with kosher salt and your choice of seasoning — za'atar, oregano, or Ras El Hanout are classic.",
            "duration": 3, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Skimping on oil means uneven, spotty browning. You want a complete thin coat on each side.",
            "hackChip": "Za'atar is the traditional seasoning — its sesame, thyme, and sumac perfume the whole kitchen as they bake.",
            "cuisineFact": "Pita chips likely originated from the Middle Eastern tradition of never wasting stale bread — old pita was toasted with oil and spices to extend its life."
        },
        {
            "step": 4, "phase": "prep",
            "instruction": "Cut each round into 8 triangular wedges like a pizza. Arrange in a single layer on the sheet pan — no overlapping.",
            "duration": 2, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Overlapping pieces steam instead of crisp. Use two pans if needed to keep everything in a single layer.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 5, "phase": "cook",
            "instruction": "Bake at 425°F for 5-10 minutes. Start checking at 5 minutes. Flip any pieces that are browning faster than others. Pull when uniformly golden and crisp. Thicker pitas need closer to 10 minutes; thinner split pitas closer to 5.",
            "duration": 10, "timerTrigger": True, "timerMinutes": 6,
            "mistakeWarning": "Pita goes from golden to burnt in under a minute at 425°F. Stay in the kitchen and check often.",
            "hackChip": "Chips crisp up further as they cool. Pull them when they're almost but not quite as crisp as you want.",
            "cuisineFact": None
        },
        {
            "step": 6, "phase": "finish",
            "instruction": "Cool completely on the pan — at least 10 minutes — before serving or storing. Don't cover them while warm or trapped steam will soften them. Store fully cooled in an airtight container for up to a week.",
            "duration": 10, "timerTrigger": True, "timerMinutes": 10,
            "mistakeWarning": "Covering warm chips is the fastest way to ruin them. Patience here is everything.",
            "hackChip": None,
            "cuisineFact": None
        }
    ],
    "pickled-turnips": [
        {
            "step": 1, "phase": "prep",
            "instruction": "Peel 2 large turnips (about 2 pounds total) and cut into 1/2-inch batons — think thick French fries. Peel 1 small beet and cut into matching batons. The beet is what gives these pickles their iconic pink color.",
            "duration": 10, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Turnip pieces cut too thin go mushy; too thick take forever to pickle. Stay close to 1/2 inch.",
            "hackChip": "Wear gloves when handling the beets unless you like pink fingers for two days.",
            "cuisineFact": "Pink pickled turnips are the iconic garnish in Lebanese shawarma and mezze spreads — the vivid color comes entirely from a single small beet in the jar."
        },
        {
            "step": 2, "phase": "prep",
            "instruction": "In a large measuring cup or bowl with a pour spout, combine 3 cups distilled water with 1/4 cup kosher salt. Stir vigorously until the salt fully dissolves — you should see no grains at the bottom.",
            "duration": 3, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Use ONLY kosher salt — table salt has iodine and anti-caking agents that turn the brine cloudy and bitter.",
            "hackChip": "If you only have tap water, boil it with the salt, then cool completely before continuing. Chlorine inhibits fermentation.",
            "cuisineFact": None
        },
        {
            "step": 3, "phase": "prep",
            "instruction": "Once the salt is fully dissolved, stir in 1 cup distilled white vinegar. Set the brine aside while you pack the jar.",
            "duration": 1, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Adding vinegar before salt dissolves slows dissolving dramatically. Salt first, vinegar second.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 4, "phase": "prep",
            "instruction": "Pack the turnip and beet batons into a clean large mason jar (or two smaller ones). If using two jars, put some beet in each for even coloring. Add a dried red chili or pinch of red pepper flakes if you like heat.",
            "duration": 3, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Forgetting to include beet in every jar means plain white turnips in the second jar — the color only travels so far.",
            "hackChip": "Pack them upright like a little fence — it's easier to fish out single pieces later.",
            "cuisineFact": None
        },
        {
            "step": 5, "phase": "prep",
            "instruction": "Pour the brine over the vegetables until they are completely submerged. If anything floats, weigh it down with a small clean glass weight or fermentation weight. Seal the jar tightly.",
            "duration": 2, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Anything not submerged will mold. Make sure every piece is below the brine line.",
            "hackChip": None,
            "cuisineFact": None
        },
        {
            "step": 6, "phase": "finish",
            "instruction": "Store in the refrigerator for approximately 5 days before eating — the pink color deepens and the tang develops over that time. Once opened, keep refrigerated and consume within 4 weeks.",
            "duration": 5, "timerTrigger": False, "timerMinutes": None,
            "mistakeWarning": "Eating them after 24 hours gives you just salty turnips. Real flavor and that iconic pink need the full 5 days.",
            "hackChip": "After day 3, taste-test daily — your ideal is somewhere between day 5 and day 10 depending on how tart you like them.",
            "cuisineFact": None
        }
    ]
}


def main():
    with open(SIDES_PATH) as f:
        data = json.load(f)

    updated = []
    not_found = []
    target_ids = set(BATCH1.keys())

    for dish in data:
        if dish["id"] in BATCH1:
            dish["guidedCookSteps"] = BATCH1[dish["id"]]
            updated.append(dish["id"])

    for tid in target_ids:
        if tid not in updated:
            not_found.append(tid)

    with open(SIDES_PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Updated: {len(updated)} dishes")
    for u in updated:
        print(f"  ✓ {u}")
    if not_found:
        print(f"NOT FOUND: {not_found}")
        sys.exit(1)

    # Verify JSON round-trips
    with open(SIDES_PATH) as f:
        json.load(f)
    print("JSON valid.")


if __name__ == "__main__":
    main()
