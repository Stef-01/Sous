/**
 * classify-dish-facets — populate meals.json `dayparts` + sides.json `role`
 * for the Today Filter (Phase A). Classifies EXISTING catalogue entries only
 * (no invented dishes — rule 7). Curated sets + safe defaults; prints the result
 * for review. Re-runnable (idempotent: overwrites the two fields).
 *
 * Defaults: meal dayparts → ["lunch","dinner"]; side role → "side".
 */
import fs from "node:fs";

const base = new URL("../../", import.meta.url);
const mealsPath = new URL("src/data/meals.json", base);
const sidesPath = new URL("src/data/sides.json", base);

// ── meal daypart overrides (everything else = ["lunch","dinner"]) ──
const BREAKFAST_LUNCH = new Set([
  "chia-champorado",
  "tofu-bhurji",
  "tortang-talong-with-chicken",
  "open-face-pandesal-sandwich",
  "tu-banh-mi-trung-op-la",
]);
const ALL_DAY = new Set(["arroz-caldo"]); // congee — breakfast through dinner

// ── side role overrides (everything else = "side") ──
const DRINKS = new Set([
  "thai-iced-tea",
  "vietnamese-coffee",
  "chaas",
  "tu-bac-xiu",
  "tu-brown-sugar-boba-coffee",
]);
const SNACKS = new Set([
  "bruschetta",
  "arancini",
  "samosa",
  "papadum",
  "masala-papad",
  "roasted-papad",
  "churros",
  "tortilla-chips",
  "pita-chips",
  "gyoza",
  "mandu",
  "crispy-wontons",
  "xiao-long-bao",
  "edamame",
  "tempura",
  "spring-rolls",
  "summer-rolls",
  "goi-cuon",
  "cha-gio",
  "tu-banh-tom",
  "tu-cha-gio-khoai-mon",
  "satay",
  "korean-pancake",
  "bao-buns",
  "sesame-balls",
  "turnip-cake",
  "egg-tart",
  "tod-mun-pla",
  "tu-vietnamese-coffee-tiramisu",
  "tu-banh-chuoi-nuong",
  "tteokbokki",
]);

const meals = JSON.parse(fs.readFileSync(mealsPath, "utf8"));
const sides = JSON.parse(fs.readFileSync(sidesPath, "utf8"));
const mArr = Array.isArray(meals) ? meals : meals.meals;
const sArr = Array.isArray(sides) ? sides : sides.sides;
const mealIds = new Set(mArr.map((m) => m.id));
const sideIds = new Set(sArr.map((s) => s.id));

// Validate the curated ids actually exist (catch typos before writing).
const bad = [];
for (const id of [...BREAKFAST_LUNCH, ...ALL_DAY])
  if (!mealIds.has(id)) bad.push(`meal:${id}`);
for (const id of [...DRINKS, ...SNACKS])
  if (!sideIds.has(id)) bad.push(`side:${id}`);
if (bad.length) {
  console.error("UNKNOWN ids in curated sets:", bad.join(", "));
  process.exit(1);
}

const counts = { breakfast: 0, side: 0, drink: 0, snack: 0 };
for (const m of mArr) {
  m.dayparts = ALL_DAY.has(m.id)
    ? ["breakfast", "lunch", "dinner"]
    : BREAKFAST_LUNCH.has(m.id)
      ? ["breakfast", "lunch"]
      : ["lunch", "dinner"];
  if (m.dayparts.includes("breakfast")) counts.breakfast++;
}
for (const s of sArr) {
  s.role = DRINKS.has(s.id) ? "drink" : SNACKS.has(s.id) ? "snack" : "side";
  counts[s.role]++;
}

fs.writeFileSync(mealsPath, JSON.stringify(meals, null, 2) + "\n");
fs.writeFileSync(sidesPath, JSON.stringify(sides, null, 2) + "\n");

console.log(
  `meals: ${mArr.length} (breakfast-capable ${counts.breakfast}, rest lunch+dinner)`,
);
console.log(
  `sides: ${sArr.length} → side ${counts.side}, drink ${counts.drink}, snack ${counts.snack}`,
);
console.log("drinks:", [...DRINKS].join(", "));
console.log("snacks:", [...SNACKS].join(", "));
