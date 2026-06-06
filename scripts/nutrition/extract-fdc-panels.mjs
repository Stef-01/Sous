/**
 * Extract the full (~50-nutrient) per-100g panel for our 112 ingredient fdcIds
 * from the USDA FDC SR Legacy (breadth) + Foundation (quality override) bulk
 * JSON (CC0). Writes .cache/fdc/panels.json: fdcId → { ourKey: amount }.
 *
 *   node --max-old-space-size=6144 scripts/nutrition/extract-fdc-panels.mjs
 */
import fs from "node:fs";

const SR = ".cache/fdc/FoodData_Central_sr_legacy_food_json_2018-04.json";
const FD = ".cache/fdc/FoodData_Central_foundation_food_json_2025-04-24.json";
const wantedIds = new Set(
  JSON.parse(fs.readFileSync(".cache/fdc/our-fdcids.json", "utf8")).map(Number),
);

// FDC nutrient number → our schema key.
const N = {
  208: "calories",
  255: "water_g",
  221: "alcohol_g",
  262: "caffeine_mg",
  203: "protein_g",
  204: "totalFat_g",
  205: "totalCarbs_g",
  291: "fiber_g",
  269: "totalSugars_g",
  539: "addedSugar_g",
  209: "starch_g",
  606: "saturatedFat_g",
  645: "monoFat_g",
  646: "polyFat_g",
  605: "transFat_g",
  601: "cholesterol_mg",
  320: "vitaminA_mcg_rae",
  401: "vitaminC_mg",
  328: "vitaminD_mcg",
  323: "vitaminE_mg",
  430: "vitaminK_mcg",
  404: "thiamin_mg",
  405: "riboflavin_mg",
  406: "niacin_mg",
  410: "pantothenicAcid_mg",
  415: "vitaminB6_mg",
  417: "folate_mcg",
  418: "vitaminB12_mcg",
  421: "choline_mg",
  301: "calcium_mg",
  303: "iron_mg",
  304: "magnesium_mg",
  305: "phosphorus_mg",
  306: "potassium_mg",
  307: "sodium_mg",
  309: "zinc_mg",
  312: "copper_mg",
  315: "manganese_mg",
  317: "selenium_mcg",
  512: "histidine_g",
  503: "isoleucine_g",
  504: "leucine_g",
  505: "lysine_g",
  506: "methionine_g",
  508: "phenylalanine_g",
  502: "threonine_g",
  501: "tryptophan_g",
  510: "valine_g",
  507: "cystine_g",
  509: "tyrosine_g",
};
// omega-3 fatty acids to sum into omega3_g (ALA + EPA + DPA + DHA).
const OMEGA3 = new Set([851, 629, 631, 621]);

function panelOf(food) {
  const out = {};
  let omega3 = 0;
  let sawOmega3 = false;
  for (const fn of food.foodNutrients || []) {
    const num = Number(fn.nutrient?.number);
    const amt = fn.amount;
    if (amt == null || !Number.isFinite(amt)) continue;
    if (N[num]) out[N[num]] = amt;
    if (OMEGA3.has(num)) {
      omega3 += amt;
      sawOmega3 = true;
    }
  }
  if (sawOmega3) out.omega3_g = Math.round(omega3 * 1000) / 1000;
  return out;
}

const panels = {};
function ingest(path, key) {
  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  const foods = data[key] || [];
  let hit = 0;
  for (const f of foods) {
    if (!wantedIds.has(Number(f.fdcId))) continue;
    panels[f.fdcId] = panelOf(f);
    hit++;
  }
  return { total: foods.length, hit };
}

const sr = ingest(SR, "SRLegacyFoods");
console.log(`SR Legacy: ${sr.total} foods, matched ${sr.hit} of ours`);
// Foundation override (newer/better sampling) where an fdcId matches.
const fd = ingest(FD, "FoundationFoods");
console.log(`Foundation: ${fd.total} foods, matched ${fd.hit} of ours`);

fs.writeFileSync(".cache/fdc/panels.json", JSON.stringify(panels));
const counts = Object.values(panels).map((p) => Object.keys(p).length);
console.log(
  `wrote ${Object.keys(panels).length} panels; nutrients/panel: min ${Math.min(...counts)} max ${Math.max(...counts)} avg ${Math.round(counts.reduce((a, b) => a + b, 0) / counts.length)}`,
);
