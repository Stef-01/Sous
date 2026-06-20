/**
 * pet-fun-facts — the pool the Doberman draws on to teach a little nutrition and
 * food history ("he tells you fun facts every once in a while").
 *
 * Rule 7: every fact is accurate and SOURCED, written in our own short words
 * (never copied text), and every `dishSlugs` id must exist in meals.json /
 * sides.json (the test enforces this). Nutrition facts carry the same citations
 * as src/data/nutrition-evidence.ts; history facts cite an encyclopedic page.
 * Text is plain (no HTML) and <=160 chars so it fits the speech bubble.
 */

export interface PetFunFactSource {
  label: string;
  url: string;
}

export interface PetFunFact {
  id: string;
  kind: "nutrition" | "history";
  /** <=160 chars, plain text, our own wording. */
  text: string;
  sources: PetFunFactSource[];
  /** Exact meals.json/sides.json ids this fact is about (rule 7 — CI-validated). */
  dishSlugs?: string[];
  /** Cuisines this fact suits (for cuisine-match). */
  cuisines?: string[];
  /** Deficit/nutrient key this fact speaks to (for need-aware delivery). */
  nutrient?: string;
  ingredient?: string;
}

export const NUTRITION_FACTS: PetFunFact[] = [
  {
    id: "n-vitc-iron",
    kind: "nutrition",
    text: "Squeeze citrus or add peppers to beans, lentils, or greens — the vitamin C helps your body absorb their plant iron.",
    nutrient: "iron",
    sources: [
      {
        label: "NIH Office of Dietary Supplements — Iron",
        url: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/",
      },
    ],
  },
  {
    id: "n-pepper-turmeric",
    kind: "nutrition",
    text: "A crack of black pepper helps your body absorb turmeric's curcumin — the piperine slows how fast it's broken down.",
    ingredient: "turmeric",
    sources: [
      {
        label: "Healthline — Turmeric and black pepper",
        url: "https://www.healthline.com/nutrition/turmeric-and-black-pepper",
      },
    ],
  },
  {
    id: "n-tea-iron",
    kind: "nutrition",
    text: "Tea and coffee can blunt the iron in a plant meal — enjoy them an hour before or after, rather than with it.",
    nutrient: "iron",
    sources: [
      {
        label:
          "Disler et al., The effect of tea on iron absorption (Gut, 1975)",
        url: "https://pubmed.ncbi.nlm.nih.gov/1168162/",
      },
    ],
  },
  {
    id: "n-fat-soluble",
    kind: "nutrition",
    text: "Vitamins A, D, E, and K need a little fat to absorb — a drizzle of oil or some avocado on a lean dish helps.",
    sources: [
      {
        label: "NIH Office of Dietary Supplements — Vitamin A",
        url: "https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/",
      },
    ],
  },
  {
    id: "n-soak-phytate",
    kind: "nutrition",
    text: "Soaking or sprouting dried beans and grains before cooking frees up more of their iron and zinc.",
    nutrient: "iron",
    sources: [
      {
        label: "Soaking & sprouting raise iron/zinc availability (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4252429/",
      },
    ],
  },
  {
    id: "n-tomato-lycopene",
    kind: "nutrition",
    text: "Cooking tomatoes unlocks more of the antioxidant lycopene than raw — a simmered sauce with a little oil especially.",
    ingredient: "tomato",
    sources: [
      {
        label: "Tomato purée preparation & lycopene bioavailability (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8073136/",
      },
    ],
  },
  {
    id: "n-vitd-calcium",
    kind: "nutrition",
    text: "Vitamin D helps your gut absorb the calcium in your meal — the two work as a team.",
    nutrient: "calcium",
    sources: [
      {
        label: "Vitamin D & intestinal calcium absorption (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3927686/",
      },
    ],
  },
  {
    id: "n-fiber",
    kind: "nutrition",
    text: "Fiber feeds the friendly bacteria in your gut — beans, oats, and whole grains are some of the richest sources.",
    nutrient: "fiber",
    sources: [
      {
        label: "Harvard T.H. Chan School of Public Health — Fiber",
        url: "https://www.hsph.harvard.edu/nutritionsource/carbohydrates/fiber/",
      },
    ],
  },
  {
    id: "n-protein-pair",
    kind: "nutrition",
    text: "Pairing grains with legumes — like rice and beans — gives you the full set of amino acids your body can't make.",
    nutrient: "protein",
    sources: [
      {
        label: "Harvard T.H. Chan School of Public Health — Protein",
        url: "https://www.hsph.harvard.edu/nutritionsource/what-should-you-eat/protein/",
      },
    ],
  },
  {
    id: "n-omega3",
    kind: "nutrition",
    text: "Oily fish like salmon and sardines are top sources of omega-3 fats, which support your heart and brain.",
    nutrient: "omega-3",
    sources: [
      {
        label: "NIH Office of Dietary Supplements — Omega-3 Fatty Acids",
        url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/",
      },
    ],
  },
];

export const HISTORY_FACTS: PetFunFact[] = [
  {
    id: "h-pho",
    kind: "history",
    text: "Pho took shape in early-1900s northern Vietnam, around Hanoi, blending local rice noodles with French and Chinese influences.",
    dishSlugs: ["pho"],
    cuisines: ["Vietnamese"],
    sources: [
      {
        label: "Encyclopaedia entry — Pho",
        url: "https://en.wikipedia.org/wiki/Pho",
      },
    ],
  },
  {
    id: "h-butter-chicken",
    kind: "history",
    text: "Butter chicken was invented in 1950s Delhi — cooks reportedly simmered leftover tandoori chicken in a tomato-and-butter gravy.",
    dishSlugs: ["butter-chicken"],
    cuisines: ["Indian"],
    sources: [
      {
        label: "Encyclopaedia entry — Butter chicken",
        url: "https://en.wikipedia.org/wiki/Butter_chicken",
      },
    ],
  },
  {
    id: "h-adobo",
    kind: "history",
    text: "Filipino adobo predates Spanish contact — 'adobo' is just the name colonizers gave the local vinegar-and-salt braising method.",
    dishSlugs: ["chicken-adobo"],
    cuisines: ["Filipino"],
    sources: [
      {
        label: "Encyclopaedia entry — Philippine adobo",
        url: "https://en.wikipedia.org/wiki/Philippine_adobo",
      },
    ],
  },
  {
    id: "h-pad-thai",
    kind: "history",
    text: "Pad thai was promoted as a national dish in 1930s-40s Thailand to boost rice-noodle use and build a shared Thai identity.",
    dishSlugs: ["pad-thai"],
    cuisines: ["Thai"],
    sources: [
      {
        label: "Encyclopaedia entry — Pad thai",
        url: "https://en.wikipedia.org/wiki/Pad_thai",
      },
    ],
  },
  {
    id: "h-margherita",
    kind: "history",
    text: "Legend ties the Margherita to an 1889 pizza honoring Queen Margherita of Italy — its tomato, mozzarella, and basil echo the flag.",
    dishSlugs: ["pizza-margherita"],
    cuisines: ["Italian"],
    sources: [
      {
        label: "Encyclopaedia entry — Neapolitan pizza",
        url: "https://en.wikipedia.org/wiki/Neapolitan_pizza",
      },
    ],
  },
  {
    id: "h-kimchi",
    kind: "history",
    text: "Kimchi is ancient, but its chili-red color is newer — chiles only reached Korea after the 1500s through Portuguese trade.",
    dishSlugs: ["kimchi"],
    cuisines: ["Korean"],
    sources: [
      {
        label: "Encyclopaedia entry — Kimchi",
        url: "https://en.wikipedia.org/wiki/Kimchi",
      },
    ],
  },
  {
    id: "h-ramen",
    kind: "history",
    text: "Ramen grew from Chinese wheat-noodle soups and boomed in Japan after WWII, alongside cheap imported wheat.",
    dishSlugs: ["tonkotsu-ramen"],
    cuisines: ["Japanese"],
    sources: [
      {
        label: "Encyclopaedia entry — Ramen",
        url: "https://en.wikipedia.org/wiki/Ramen",
      },
    ],
  },
  {
    id: "h-bibimbap",
    kind: "history",
    text: "Bibimbap means 'mixed rice' — rice topped with seasoned vegetables, egg, and gochujang, all stirred together before eating.",
    dishSlugs: ["bibimbap"],
    cuisines: ["Korean"],
    sources: [
      {
        label: "Encyclopaedia entry — Bibimbap",
        url: "https://en.wikipedia.org/wiki/Bibimbap",
      },
    ],
  },
  {
    id: "h-green-curry",
    kind: "history",
    text: "Thai green curry takes its color from fresh green chiles; its name 'kaeng khiao wan' literally means 'sweet green curry.'",
    dishSlugs: ["green-curry"],
    cuisines: ["Thai"],
    sources: [
      {
        label: "Encyclopaedia entry — Green curry",
        url: "https://en.wikipedia.org/wiki/Green_curry",
      },
    ],
  },
  {
    id: "h-wok-hei",
    kind: "history",
    text: "Stir-frying in a screaming-hot wok creates 'wok hei' — the smoky 'breath of the wok' aroma from food searing on the metal.",
    cuisines: ["Chinese"],
    sources: [
      {
        label: "Encyclopaedia entry — Wok hei",
        url: "https://en.wikipedia.org/wiki/Wok_hei",
      },
    ],
  },
  {
    id: "h-nixtamal",
    kind: "history",
    text: "Corn tortillas rely on nixtamalization — soaking maize in an alkaline solution — which also unlocks niacin your body can use.",
    cuisines: ["Mexican"],
    sources: [
      {
        label: "Encyclopaedia entry — Nixtamalization",
        url: "https://en.wikipedia.org/wiki/Nixtamalization",
      },
    ],
  },
];

export const ALL_FUN_FACTS: PetFunFact[] = [
  ...NUTRITION_FACTS,
  ...HISTORY_FACTS,
];
