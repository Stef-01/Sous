/**
 * Integrate Chef Tu guided-cook flows (workflow output) into the catalog.
 * Applies the precise fixes the adversarial verify flagged on tu-pho-ga +
 * tu-com-ga-hai-nam, then generates src/data/chef-tu-cook-steps.ts with two
 * Records (sides → guidedCookData, meals → guidedCookMeals).
 *
 *   node scripts/integrate-chef-tu-flows.mjs
 */
import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync("scripts/.chef-tu-flows.json", "utf8"));
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

// ── Verify-flagged fixes ────────────────────────────────
function fixPhoGa(flow) {
  flow.cookTimeMinutes = 150; // 130 undercounted the simmers
  for (const ing of flow.ingredients)
    if (/kosher salt/i.test(ing.name))
      ing.quantity = "1 tsp (plus more for brining)";
  for (const s of flow.steps)
    if (/3 tablespoons of salt/i.test(s.instruction))
      s.instruction =
        "Stir the pho spice blend (tied in a sachet), sugar, 1 teaspoon of salt, and the fish sauce into the broth. After about 30 minutes, lift out the spice sachet so it doesn't turn the broth medicinal, then keep simmering to the 60-minute mark. Strain the broth through a fine-mesh sieve for a clean, clear bowl, then taste and adjust with more fish sauce or salt until it sings.";
}
function fixComGa(flow) {
  flow.cookTimeMinutes = 125; // 75 undercounted rests + rice phases
  for (const s of flow.steps) {
    if (s.donenessCue && /pink/i.test(s.donenessCue))
      s.donenessCue =
        "Use a thermometer — 165°F at the thickest part of the thigh is the real tell.";
    if (s.timerSeconds === 600 && !/minute/i.test(s.instruction))
      s.instruction =
        s.instruction.replace(/\.?\s*$/, "") + " — about 10 minutes.";
  }
}
for (const item of raw) {
  if (item.slug === "tu-pho-ga") fixPhoGa(item.flow);
  if (item.slug === "tu-com-ga-hai-nam") fixComGa(item.flow);
}

// ── Build StaticDishData ────────────────────────────────
function toDish(item) {
  const meta = byId.get(item.slug) || {
    name: item.name,
    image: null,
    cuisine: "vietnamese",
  };
  const prefix = item.slug.replace(/[^a-z]/g, "").slice(0, 5);
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
 * Chef Tu David Phu's guided-cook flows — authored from his real recipe
 * library (cheftu.com) in original wording, then adversarially verified for
 * accuracy + cookability (tu-pho-ga + tu-com-ga-hai-nam were repaired per the
 * review). Spread into guidedCookData (sides) + guidedCookMeals (meals).
 */
import type { StaticDishData } from "./guided-cook-steps";

`;
fs.writeFileSync(
  "src/data/chef-tu-cook-steps.ts",
  header +
    "export const CHEF_TU_SIDE_FLOWS: Record<string, StaticDishData> = " +
    JSON.stringify(sideFlows, null, 2) +
    ";\n\nexport const CHEF_TU_MEAL_FLOWS: Record<string, StaticDishData> = " +
    JSON.stringify(mealFlows, null, 2) +
    ";\n",
);
console.log(
  "sides:",
  Object.keys(sideFlows).join(", "),
  "| meals:",
  Object.keys(mealFlows).join(", "),
);
