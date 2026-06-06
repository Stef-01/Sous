/**
 * Integrate the second batch of Chef Tu guided-cook flows (27 dishes) — the
 * 20 that passed adversarial verify clean + the 7 repaired — into the catalog.
 * Applies the final deterministic fix the re-verify flagged on tu-rau-muong
 * (partial-scaling left the oyster sauce over-dosed), then writes
 * src/data/chef-tu-cook-steps-2.ts (CHEF_TU_SIDE_FLOWS_2 + CHEF_TU_MEAL_FLOWS_2).
 *
 *   node scripts/integrate-chef-tu-flows2.mjs
 */
import fs from "node:fs";

const raw = JSON.parse(
  fs.readFileSync("scripts/.chef-tu-flows2-final.json", "utf8"),
);
const meals = JSON.parse(fs.readFileSync("src/data/meals.json", "utf8"));
const sides = JSON.parse(fs.readFileSync("src/data/sides.json", "utf8"));

const byId = new Map();
for (const m of meals)
  byId.set(m.id, {
    name: m.name,
    image: m.heroImageUrl ?? null,
    cuisine: (m.cuisine || "vietnamese").toLowerCase(),
    kind: "meal",
  });
for (const s of sides)
  if (!byId.has(s.id))
    byId.set(s.id, {
      name: s.name,
      image: s.imageUrl ?? null,
      cuisine: "vietnamese",
      kind: "side",
    });

// ── Final re-verify fix: tu-rau-muong over-dosed oyster sauce (the dominant
//    salt) wasn't scaled down with the 3 lb → 1 lb greens reduction.
function fixRauMuong(flow) {
  for (const ing of flow.ingredients) {
    if (/oyster sauce/i.test(ing.name)) ing.quantity = "2 tsp";
    else if (/minced garlic/i.test(ing.name)) ing.quantity = "1 tsp";
    else if (/frying oil/i.test(ing.name)) ing.quantity = "2 tbsp, divided";
  }
  for (const s of flow.steps) {
    s.instruction = s.instruction
      .replace(/2 tbsp oyster sauce/g, "2 tsp oyster sauce")
      .replace(/remaining 2 tbsp frying oil/g, "remaining 1 tbsp frying oil");
  }
}
for (const item of raw)
  if (item.slug === "tu-rau-muong") fixRauMuong(item.flow);

function toDish(item) {
  const meta = byId.get(item.slug) || {
    name: item.name,
    image: null,
    cuisine: "vietnamese",
  };
  const prefix = item.slug.replace(/[^a-z]/g, "").slice(0, 6);
  return {
    name: meta.name,
    slug: item.slug,
    description: item.flow.description,
    cuisineFamily: meta.cuisine,
    prepTimeMinutes: item.flow.prepTimeMinutes,
    cookTimeMinutes: item.flow.cookTimeMinutes,
    skillLevel: item.flow.skillLevel,
    heroImageUrl: meta.image,
    flavorProfile: item.flow.flavorProfile,
    temperature: item.flow.temperature,
    ingredients: item.flow.ingredients.map((ing, i) => ({
      id: `${prefix}-${i + 1}`,
      name: ing.name,
      quantity: ing.quantity,
      isOptional: !!ing.isOptional,
      substitution: ing.substitution ?? null,
    })),
    steps: item.flow.steps.map((st, i) => ({
      phase: "cook",
      stepNumber: i + 1,
      instruction: st.instruction,
      timerSeconds: st.timerSeconds ?? null,
      mistakeWarning: st.mistakeWarning ?? null,
      quickHack: st.quickHack ?? null,
      cuisineFact: st.cuisineFact ?? null,
      donenessCue: st.donenessCue ?? null,
      imageUrl: null,
    })),
  };
}

const sideFlows = {},
  mealFlows = {};
for (const item of raw) {
  const dish = toDish(item);
  const kind = (byId.get(item.slug) || {}).kind;
  if (kind === "side") sideFlows[item.slug] = dish;
  else mealFlows[item.slug] = dish;
}

const header = `/**
 * Chef Tu David Phu's guided-cook flows — batch 2 (27 dishes). Authored from
 * his recipe library in original wording, adversarially verified, and (for the
 * 7 flagged) repaired + re-verified before integration. Spread into
 * guidedCookData (sides) + guidedCookMeals (meals) alongside batch 1.
 */
import type { StaticDishData } from "./guided-cook-steps";

`;
fs.writeFileSync(
  "src/data/chef-tu-cook-steps-2.ts",
  header +
    "export const CHEF_TU_SIDE_FLOWS_2: Record<string, StaticDishData> = " +
    JSON.stringify(sideFlows, null, 2) +
    ";\n\nexport const CHEF_TU_MEAL_FLOWS_2: Record<string, StaticDishData> = " +
    JSON.stringify(mealFlows, null, 2) +
    ";\n",
);
console.log(
  `batch 2: ${Object.keys(sideFlows).length} sides + ${Object.keys(mealFlows).length} meals = ${raw.length} dishes`,
);
