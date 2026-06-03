/**
 * Nutrient interaction map — deterministic recipe-level rules.
 *
 * Absorption / competition / symptom-trigger rules from the report's "Nutrient
 * interaction map and recipe optimization rules." These run BEFORE any
 * personalization (report's flowchart) and absorb the interaction set sketched
 * in `NUTRITION_INTELLIGENCE_PLAN.md`, now carried with a GRADE + provenance.
 *
 * Every `rule` string is verified claim-safe by the registry guard test.
 */

import type { InteractionRule } from "@/types/therapeutics";

export const INTERACTIONS: InteractionRule[] = [
  {
    id: "iron-vitc-enhance",
    target: "iron",
    enhancers: [
      "vitamin C",
      "heme foods",
      "citrus",
      "bell pepper",
      "tomato",
      "kiwi",
    ],
    inhibitors: ["tea", "coffee", "polyphenols", "phytate", "calcium"],
    rule: "Pair beans, lentils, tofu, or greens with tomatoes, bell peppers, or citrus; move tea and coffee away from iron-focused meals; soak, sprout, or ferment legumes and grains where possible.",
    grade: "moderate",
    sources: [
      {
        title: "NIH ODS + iron bioavailability reviews",
        studyType: "umbrella-review",
      },
    ],
  },
  {
    id: "ldl-viscous-fiber-stack",
    target: "ldl",
    enhancers: [
      "viscous fiber",
      "nuts",
      "unsaturated fats",
      "plant sterols",
      "legumes",
      "soy",
    ],
    inhibitors: ["saturated fat", "ultra-processed foods"],
    rule: "Reward beta-glucan, legumes, nuts, soy, and sterol modules while penalizing saturated-fat density; stack several modest contributors rather than relying on one hero food.",
    grade: "moderate",
    sources: [
      {
        title: "Portfolio + component LDL meta-analyses",
        studyType: "meta-analysis",
      },
    ],
  },
  {
    id: "calcium-oxalate-bioavailability",
    target: "calcium",
    enhancers: [
      "vitamin D",
      "dairy",
      "calcium-carbonate fortificant",
      "low-oxalate greens",
    ],
    inhibitors: [
      "oxalate (spinach)",
      "some phytate",
      "tricalcium-phosphate fortificant",
    ],
    rule: "Choose dairy, calcium-carbonate-fortified soy, and low-oxalate greens for calcium-focused meals; do not count spinach as a major calcium source.",
    grade: "moderate",
    sources: [
      {
        title: "Calcium food-matrix + absorption studies",
        studyType: "umbrella-review",
      },
    ],
  },
  {
    id: "ibs-fodmap-load",
    target: "ibs-symptoms",
    enhancers: [],
    inhibitors: ["fructan", "GOS", "lactose", "polyol"],
    rule: "Use a phased low-FODMAP rule set followed by reintroduction; regard substitutions as an implementation layer, not a lifelong restriction.",
    grade: "moderate",
    sources: [
      {
        title: "ACG guideline + low-FODMAP network meta-analyses",
        studyType: "guideline",
      },
    ],
  },
  {
    id: "magnesium-with-meals",
    target: "magnesium",
    enhancers: ["mineral water with meals", "varied whole-food intake"],
    inhibitors: ["malabsorption states", "very high-fiber experimental loads"],
    rule: "Spread legumes, nuts, seeds, cocoa, soy, and whole grains across the week; for low intake, offer magnesium-rich mineral water as a meal beverage.",
    grade: "low",
    sources: [
      {
        title: "Magnesium absorption studies + ODS sources",
        studyType: "umbrella-review",
      },
    ],
  },
  {
    id: "celiac-cross-contact",
    target: "celiac-safety",
    enhancers: ["certified gluten-free sourcing", "clean prep"],
    inhibitors: ["gluten cross-contact", "ambiguous sourcing"],
    rule: "Apply hard exclusion at shopping, substitution, and preparation stages, with stronger constraints than for IBS symptom management.",
    grade: "high",
    sources: [
      { title: "Updated celiac clinical guidelines", studyType: "guideline" },
    ],
  },
];
