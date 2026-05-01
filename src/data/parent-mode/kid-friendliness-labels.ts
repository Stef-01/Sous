/**
 * Hand-curated kid-friendliness labels for the top 30 quest-eligible
 * meals. Schema in src/types/parent-mode.ts; rubric anchors in
 * PARENT-MODE-RESEARCH §2.4.
 *
 * Labeling rubric (apply consistently when adding new entries):
 *
 *   bitterLoad         0 none · 1 mild herb (cilantro) · 2 cruciferous
 *                      mainstream · 3 strong (raw onion, arugula, dark
 *                      chocolate, citrus pith)
 *   smellIntensity     0 neutral · 1 cooked aromatics · 2 toasted/seared ·
 *                      3 fermented / aged / fishy / strong cheese
 *   textureRisk        0 uniform / dry · 1 saucy but uniform · 2 mixed
 *                      chunks · 3 slimy / stringy / unpredictable
 *   visibleGreenFlecks true if any chopped fresh green herb / scallion
 *                      / leafy green is visible at plating
 *   deconstructable    true if the headline sauce / spice / topping can
 *                      be plated on the side without losing the dish
 *   heatLevel          0 none · 1 paprika/cumin · 2 mild chili · 3
 *                      medium · 4 hot
 *   familiarityAnchor  true if the dish features a kid-default carrier
 *                      (rice, pasta, bread, tortilla, potato, chicken,
 *                      cheese, egg)
 *   colorBrightness    0 brown/grey · 1 muted · 2 mixed bright/dull · 3
 *                      vivid red/orange/yellow/bright-green dominant
 *   parentModeEligible true if the dish is plausibly kid-acceptable
 *                      with Parent Mode tweaks (spice slider, sauce on
 *                      side). Flagged false for dishes whose core
 *                      character is incompatible (e.g., very fishy
 *                      seafood for under-5s).
 *
 * To label a new meal: copy the most similar existing entry, adjust,
 * add a rubricNote when a call is non-obvious. Internal-test agreement
 * target: kappa >= 0.7 (PARENT-MODE-PLAN §5.5).
 */

import type { KidFriendlinessLabel } from "@/types/parent-mode";

export const KID_FRIENDLINESS_LABELS: KidFriendlinessLabel[] = [
  {
    recipeSlug: "pizza-margherita",
    bitterLoad: 0,
    smellIntensity: 1,
    textureRisk: 0,
    visibleGreenFlecks: true, // basil
    deconstructable: false,
    heatLevel: 0,
    familiarityAnchor: true,
    colorBrightness: 3,
    parentModeEligible: true,
    rubricNote: "Visible basil is the only kid-risk; offer to skip it.",
  },
  {
    recipeSlug: "butter-chicken",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 2,
    familiarityAnchor: true, // rice
    colorBrightness: 3,
    parentModeEligible: true,
    rubricNote: "Spice slider crucial. Cilantro garnish is removable.",
  },
  {
    recipeSlug: "fish-tacos",
    bitterLoad: 1,
    smellIntensity: 2,
    textureRisk: 2,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 1,
    familiarityAnchor: true, // tortilla
    colorBrightness: 3,
    parentModeEligible: true,
    rubricNote: "Build-your-own taco bar pattern works perfectly.",
  },
  {
    recipeSlug: "tonkotsu-ramen",
    bitterLoad: 0,
    smellIntensity: 3,
    textureRisk: 2,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 1,
    familiarityAnchor: true, // noodles
    colorBrightness: 1,
    parentModeEligible: true,
    rubricNote: "Strong pork-bone smell is the main risk; toppings on side.",
  },
  {
    recipeSlug: "grilled-salmon",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 0,
    familiarityAnchor: false,
    colorBrightness: 2,
    parentModeEligible: true,
    rubricNote: "Skin-off + lemon-aside default for kids.",
  },
  {
    recipeSlug: "falafel-wrap",
    bitterLoad: 1,
    smellIntensity: 1,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 1,
    familiarityAnchor: true, // wrap
    colorBrightness: 2,
    parentModeEligible: true,
    rubricNote: "Components-on-the-side mezze pattern.",
  },
  {
    recipeSlug: "pad-thai",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 2,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 2,
    familiarityAnchor: true, // noodles
    colorBrightness: 3,
    parentModeEligible: true,
    rubricNote: "Fish sauce smell + chili are top risks; sauce on side.",
  },
  {
    recipeSlug: "pasta-carbonara",
    bitterLoad: 0,
    smellIntensity: 1,
    textureRisk: 0,
    visibleGreenFlecks: false,
    deconstructable: false,
    heatLevel: 1,
    familiarityAnchor: true, // pasta + cheese + egg
    colorBrightness: 1,
    parentModeEligible: true,
    rubricNote: "High-confidence kid-pass; pepper-aside if needed.",
  },
  {
    recipeSlug: "sushi-platter",
    bitterLoad: 0,
    smellIntensity: 3,
    textureRisk: 3,
    visibleGreenFlecks: false,
    deconstructable: true,
    heatLevel: 1,
    familiarityAnchor: true, // rice
    colorBrightness: 2,
    parentModeEligible: false,
    rubricNote: "Raw fish texture and smell are blockers under ~6.",
  },
  {
    recipeSlug: "chicken-tikka-masala",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 2,
    familiarityAnchor: true,
    colorBrightness: 3,
    parentModeEligible: true,
    rubricNote: "Spice slider + sauce-on-side serves both audiences.",
  },
  {
    recipeSlug: "bbq-ribs",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 2,
    visibleGreenFlecks: false,
    deconstructable: false,
    heatLevel: 1,
    familiarityAnchor: true, // meat-on-bone
    colorBrightness: 2,
    parentModeEligible: true,
    rubricNote: "Bones can be a hazard for under-3 — flag for ageBand.",
  },
  {
    recipeSlug: "bibimbap",
    bitterLoad: 1,
    smellIntensity: 2,
    textureRisk: 2,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 2,
    familiarityAnchor: true, // rice + egg
    colorBrightness: 3,
    parentModeEligible: true,
    rubricNote: "Component bowl is ideal Parent Mode pattern.",
  },
  {
    recipeSlug: "beef-burger",
    bitterLoad: 0,
    smellIntensity: 1,
    textureRisk: 0,
    visibleGreenFlecks: false,
    deconstructable: true,
    heatLevel: 0,
    familiarityAnchor: true, // bread + cheese
    colorBrightness: 2,
    parentModeEligible: true,
    rubricNote: "Toppings-on-the-side default.",
  },
  {
    recipeSlug: "chicken-shawarma",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 1,
    familiarityAnchor: true,
    colorBrightness: 2,
    parentModeEligible: true,
  },
  {
    recipeSlug: "pho",
    bitterLoad: 1,
    smellIntensity: 2,
    textureRisk: 2,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 1,
    familiarityAnchor: true, // noodles
    colorBrightness: 1,
    parentModeEligible: true,
    rubricNote:
      "Star anise broth note is divisive — broth-only kid bowl works.",
  },
  {
    recipeSlug: "steak",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 2,
    visibleGreenFlecks: false,
    deconstructable: true,
    heatLevel: 0,
    familiarityAnchor: false,
    colorBrightness: 2,
    parentModeEligible: true,
    rubricNote: "Texture chewiness is the main barrier; cube-cut for kids.",
  },
  {
    recipeSlug: "tacos-al-pastor",
    bitterLoad: 1,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 3,
    familiarityAnchor: true,
    colorBrightness: 3,
    parentModeEligible: true,
    rubricNote: "Spice slider mandatory; salsa on side.",
  },
  {
    recipeSlug: "chicken-biryani",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 2,
    familiarityAnchor: true,
    colorBrightness: 2,
    parentModeEligible: true,
  },
  {
    recipeSlug: "moussaka",
    bitterLoad: 1,
    smellIntensity: 2,
    textureRisk: 3,
    visibleGreenFlecks: false,
    deconstructable: false,
    heatLevel: 0,
    familiarityAnchor: false,
    colorBrightness: 1,
    parentModeEligible: false,
    rubricNote: "Eggplant texture is the blocker. Marked ineligible for V1.",
  },
  {
    recipeSlug: "dim-sum",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 2,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 0,
    familiarityAnchor: true, // dough wrappers
    colorBrightness: 2,
    parentModeEligible: true,
    rubricNote: "Dipping sauce on side; great variety for picky-eater bites.",
  },
  {
    recipeSlug: "lamb-chops",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 2,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 0,
    familiarityAnchor: false,
    colorBrightness: 1,
    parentModeEligible: false,
    rubricNote: "Lamb gaminess is divisive under ~7. Eligible for older kids.",
  },
  {
    recipeSlug: "enchiladas",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: false,
    heatLevel: 2,
    familiarityAnchor: true, // tortilla + cheese
    colorBrightness: 3,
    parentModeEligible: true,
    rubricNote: "Mild-sauce variant + spice slider.",
  },
  {
    recipeSlug: "mattar-paneer",
    bitterLoad: 0,
    smellIntensity: 1,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 1,
    familiarityAnchor: true, // cheese + rice
    colorBrightness: 3,
    parentModeEligible: true,
    rubricNote: "Paneer + peas reads as familiar for kids.",
  },
  {
    recipeSlug: "masoor-dal",
    bitterLoad: 0,
    smellIntensity: 1,
    textureRisk: 2,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 1,
    familiarityAnchor: true, // served over rice
    colorBrightness: 2,
    parentModeEligible: true,
  },
  {
    recipeSlug: "tofu-bhurji",
    bitterLoad: 0,
    smellIntensity: 1,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 2,
    familiarityAnchor: true, // egg-scramble texture
    colorBrightness: 3,
    parentModeEligible: true,
  },
  {
    recipeSlug: "mumbai-pav-bhaji",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 2,
    familiarityAnchor: true, // bread
    colorBrightness: 3,
    parentModeEligible: true,
  },
  {
    recipeSlug: "teriyaki-salmon",
    bitterLoad: 0,
    smellIntensity: 1,
    textureRisk: 1,
    visibleGreenFlecks: false,
    deconstructable: false,
    heatLevel: 0,
    familiarityAnchor: false,
    colorBrightness: 2,
    parentModeEligible: true,
    rubricNote: "Sweet glaze does much of the kid-acceptance work.",
  },
  {
    recipeSlug: "chicken-katsu",
    bitterLoad: 0,
    smellIntensity: 1,
    textureRisk: 0,
    visibleGreenFlecks: false,
    deconstructable: true,
    heatLevel: 0,
    familiarityAnchor: true, // breaded chicken
    colorBrightness: 2,
    parentModeEligible: true,
    rubricNote: "Crispy + breaded + chicken = high-confidence kid pass.",
  },
  {
    recipeSlug: "gyudon",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: true,
    deconstructable: true,
    heatLevel: 0,
    familiarityAnchor: true, // rice
    colorBrightness: 1,
    parentModeEligible: true,
  },
  {
    recipeSlug: "yakitori",
    bitterLoad: 0,
    smellIntensity: 2,
    textureRisk: 1,
    visibleGreenFlecks: false,
    deconstructable: true,
    heatLevel: 0,
    familiarityAnchor: true, // chicken
    colorBrightness: 2,
    parentModeEligible: true,
    rubricNote: "Skewer-as-toy boosts kid acceptance.",
  },
];

export function getKidFriendlinessLabel(
  recipeSlug: string,
): KidFriendlinessLabel | undefined {
  return KID_FRIENDLINESS_LABELS.find((l) => l.recipeSlug === recipeSlug);
}

export function isParentModeEligible(recipeSlug: string): boolean {
  const label = getKidFriendlinessLabel(recipeSlug);
  // Recipes without a label default to NOT eligible (conservative).
  return label?.parentModeEligible ?? false;
}
