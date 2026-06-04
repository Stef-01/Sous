/**
 * USDA → canonical ingredient registry ingest
 * (docs/INGREDIENT-NUTRITION-ARCHITECTURE-PLAN.md, Phase 2).
 *
 * Reads a USDA FoodData Central JSON dataset and emits a SMALL, vendored
 * registry of only the ingredients Sous uses — real per-100g nutrient vectors
 * keyed to USDA fdcIds. The multi-hundred-MB source is NEVER committed; only
 * the generated registry is. Re-run after `pnpm` to refresh:
 *
 *   1. Download (public domain):
 *      https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_json_2018-04.json.zip
 *   2. node scripts/nutrition/usda-ingest.mjs <path-to-sr-legacy.json>
 *
 * SR Legacy is the primary source: unlike Foundation Foods (analytically
 * incomplete — e.g. no fiber on "Lentils, dry"), SR Legacy carries complete
 * macro + micronutrient panels with the standard nutrient numbers.
 */

import fs from "node:fs";
import path from "node:path";

// nutrient.number → our NutrientVector key (first present wins).
const NUMBER_TO_KEY = {
  calcium_mg: ["301"],
  iron_mg: ["303"],
  vitaminD_mcg: ["328"],
  vitaminA_mcg_rae: ["320"],
  fiber_g: ["291"],
  potassium_mg: ["306"],
  zinc_mg: ["309"],
  magnesium_mg: ["304"],
  vitaminB12_mcg: ["418"],
  choline_mg: ["421"],
  sodium_mg: ["307"],
  addedSugar_g: ["539"],
  saturatedFat_g: ["606"],
};
// Energy: prefer kcal (208), fall back to Atwater factors.
const ENERGY_NUMBERS = ["208", "958", "957"];
// Omega-3 long+short chain, summed: ALA, EPA, DHA, DPA.
const OMEGA3_NUMBERS = ["851", "629", "621", "631"];

/**
 * Curated ingredient spec: id + fdcId (verified against SR Legacy) + claim-
 * neutral food-identity facts (food group, therapeutic classes) + mass
 * conversions. Nutrient vectors come from USDA at ingest; these are the only
 * hand-authored fields and they are food facts, not health claims.
 */
const SPEC = [
  {
    id: "red-lentils",
    fdcId: 172420,
    name: "Red lentils",
    group: "legume",
    classes: ["soluble-fiber", "plant-protein"],
    cup: 192,
    piece: null,
    aliases: [
      "masoor dal",
      "masoor",
      "red lentil",
      "lentil",
      "lentils",
      "dal",
      "daal",
    ],
  },
  {
    id: "oats",
    fdcId: 169705,
    name: "Oats",
    group: "grain",
    classes: ["soluble-fiber", "whole-grain"],
    cup: 81,
    piece: null,
    aliases: ["oat", "oatmeal", "rolled oats", "porridge oats"],
  },
  {
    id: "barley",
    fdcId: 170283,
    name: "Barley",
    group: "grain",
    classes: ["whole-grain", "soluble-fiber"],
    cup: 184,
    piece: null,
    aliases: ["pearl barley", "hulled barley", "pearled barley"],
  },
  {
    id: "salmon",
    fdcId: 173686,
    name: "Salmon",
    group: "seafood",
    classes: ["oily-fish", "omega-3-source"],
    cup: null,
    piece: 140,
    aliases: ["atlantic salmon", "wild salmon", "salmon fillet"],
  },
  {
    id: "olive-oil",
    fdcId: 171413,
    name: "Olive oil",
    group: "fat-oil",
    classes: ["olive-oil"],
    cup: 216,
    piece: null,
    aliases: ["extra virgin olive oil", "evoo", "olive"],
  },
  {
    id: "almonds",
    fdcId: 170567,
    name: "Almonds",
    group: "nut-seed",
    classes: ["nuts"],
    cup: 143,
    piece: null,
    aliases: ["almond"],
  },
  {
    id: "walnuts",
    fdcId: 170187,
    name: "Walnuts",
    group: "nut-seed",
    classes: ["nuts", "omega-3-source"],
    cup: 100,
    piece: null,
    aliases: ["walnut"],
  },
  {
    id: "chickpeas",
    fdcId: 173756,
    name: "Chickpeas",
    group: "legume",
    classes: ["soluble-fiber", "plant-protein"],
    cup: 200,
    piece: null,
    aliases: ["chickpea", "garbanzo", "garbanzo beans", "chana"],
  },
  {
    id: "black-beans",
    fdcId: 173734,
    name: "Black beans",
    group: "legume",
    classes: ["soluble-fiber", "plant-protein"],
    cup: 194,
    piece: null,
    aliases: ["black bean"],
  },
  {
    id: "kale",
    fdcId: 168421,
    name: "Kale",
    group: "leafy-green",
    classes: ["cruciferous"],
    cup: 67,
    piece: null,
    aliases: [],
  },
  {
    id: "spinach",
    fdcId: 168462,
    name: "Spinach",
    group: "leafy-green",
    classes: [],
    cup: 30,
    piece: null,
    aliases: [],
  },
  {
    id: "broccoli",
    fdcId: 170379,
    name: "Broccoli",
    group: "vegetable",
    classes: ["cruciferous"],
    cup: 91,
    piece: null,
    aliases: [],
  },
  {
    id: "brown-rice",
    fdcId: 169703,
    name: "Brown rice",
    group: "grain",
    classes: ["whole-grain"],
    cup: 190,
    piece: null,
    aliases: ["wholegrain rice"],
  },
  {
    id: "white-rice",
    fdcId: 169756,
    name: "White rice",
    group: "grain",
    classes: ["refined-grain"],
    cup: 185,
    piece: null,
    aliases: ["rice", "basmati rice", "jasmine rice", "long grain rice"],
  },
  {
    id: "chicken-breast",
    fdcId: 171077,
    name: "Chicken breast",
    group: "poultry",
    classes: [],
    cup: null,
    piece: 170,
    aliases: ["chicken", "chicken breasts"],
  },
  {
    id: "egg",
    fdcId: 171287,
    name: "Egg",
    group: "egg",
    classes: [],
    cup: null,
    piece: 50,
    aliases: ["eggs", "whole egg"],
  },
  {
    id: "garlic",
    fdcId: 169230,
    name: "Garlic",
    group: "vegetable",
    classes: [],
    cup: 136,
    piece: 3,
    aliases: ["garlic clove", "garlic cloves"],
  },
  {
    id: "onion",
    fdcId: 170000,
    name: "Onion",
    group: "vegetable",
    classes: [],
    cup: 160,
    piece: 110,
    aliases: ["onions", "yellow onion", "red onion"],
  },
  {
    id: "tomato",
    fdcId: 170457,
    name: "Tomato",
    group: "vegetable",
    classes: [],
    cup: 180,
    piece: 123,
    aliases: ["tomatoes"],
  },
  {
    id: "greek-yogurt",
    fdcId: 170894,
    name: "Greek yogurt",
    group: "dairy",
    classes: ["fermented"],
    cup: 245,
    piece: null,
    aliases: ["yogurt", "yoghurt"],
  },
  {
    id: "sardines",
    fdcId: 175139,
    name: "Sardines",
    group: "seafood",
    classes: ["oily-fish", "omega-3-source"],
    cup: null,
    piece: 24,
    aliases: ["sardine"],
  },
  {
    id: "table-salt",
    fdcId: 173468,
    name: "Salt",
    group: "condiment",
    classes: ["high-sodium"],
    cup: 292,
    piece: null,
    aliases: ["salt", "sea salt", "kosher salt"],
  },
];

function amountByNumbers(byNumber, numbers) {
  for (const n of numbers) {
    if (byNumber[n] !== undefined) return byNumber[n];
  }
  return 0;
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

function buildVector(food) {
  const byNumber = {};
  for (const fn of food.foodNutrients ?? []) {
    const num = fn.nutrient?.number;
    if (num && byNumber[num] === undefined) byNumber[num] = fn.amount ?? 0;
  }
  const v = { calories: round(amountByNumbers(byNumber, ENERGY_NUMBERS)) };
  for (const [key, nums] of Object.entries(NUMBER_TO_KEY)) {
    v[key] = round(amountByNumbers(byNumber, nums));
  }
  v.omega3_g = round(
    OMEGA3_NUMBERS.reduce((sum, n) => sum + (byNumber[n] ?? 0), 0),
  );
  return v;
}

function main() {
  const srcPath = process.argv[2];
  if (!srcPath) {
    console.error("usage: node usda-ingest.mjs <sr-legacy-json-path>");
    process.exit(1);
  }
  const j = JSON.parse(fs.readFileSync(srcPath, "utf8"));
  const foods = (j.SRLegacyFoods ?? j.FoundationFoods ?? []).filter(Boolean);
  const byId = new Map(foods.map((f) => [f.fdcId, f]));

  const entries = [];
  const missing = [];
  for (const s of SPEC) {
    const food = byId.get(s.fdcId);
    if (!food) {
      missing.push(`${s.id} (fdcId ${s.fdcId})`);
      continue;
    }
    const per100g = buildVector(food);
    if (!per100g.calories) {
      console.warn(`WARN ${s.id}: no energy value found`);
    }
    entries.push({ s, per100g, usdaName: food.description });
  }

  if (missing.length) {
    console.error(
      "MISSING fdcIds (not in dataset):\n  " + missing.join("\n  "),
    );
    process.exit(2);
  }

  const KEYS = [
    "calories",
    "calcium_mg",
    "iron_mg",
    "vitaminD_mcg",
    "vitaminA_mcg_rae",
    "fiber_g",
    "potassium_mg",
    "omega3_g",
    "zinc_mg",
    "magnesium_mg",
    "vitaminB12_mcg",
    "choline_mg",
    "sodium_mg",
    "addedSugar_g",
    "saturatedFat_g",
  ];

  const body = entries
    .map(({ s, per100g, usdaName }) => {
      const vec = KEYS.map((k) => `${k}: ${per100g[k]}`).join(", ");
      const aliases = JSON.stringify(s.aliases);
      const classes = JSON.stringify(s.classes);
      return `  "${s.id}": {
    id: "${s.id}",
    name: "${s.name}",
    aliases: ${aliases},
    fdcId: ${s.fdcId},
    fdcDataType: "sr-legacy",
    foodGroup: "${s.group}",
    therapeuticClasses: ${classes},
    // USDA SR Legacy: ${usdaName.replace(/\*\//g, "")}
    per100g: { ${vec} },
    densityGPerCup: ${s.cup},
    gramsPerPiece: ${s.piece},
    provenance: "usda-fdc",
    confidence: "mapped",
  },`;
    })
    .join("\n");

  const out = `/**
 * GENERATED by scripts/nutrition/usda-ingest.mjs — DO NOT EDIT BY HAND.
 *
 * Canonical ingredient registry. Per-100g nutrient vectors are real USDA
 * FoodData Central SR Legacy values (public domain); food-identity facts
 * (group, therapeutic classes, mass conversions) are curated in the ingest
 * spec. ${entries.length} ingredients.
 */

import type { Ingredient } from "@/types/ingredient";

export const INGREDIENTS: Record<string, Ingredient> = {
${body}
};
`;

  const outPath = path.join(
    process.cwd(),
    "src/data/ingredients/registry.generated.ts",
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out);
  console.log(`wrote ${entries.length} ingredients → ${outPath}`);
}

main();
