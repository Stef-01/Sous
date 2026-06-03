/**
 * Condition catalog for culinary therapeutics.
 *
 * The 10 validated entities the app models (report §"Recommended condition-
 * level priorities"). "Leaky gut" is deliberately absent — it is not a formal
 * diagnosis and is handled only as an education label (CT-4).
 *
 * Every human-facing string here is verified claim-safe by
 * `therapeutics-registry.test.ts`.
 */

import type { ConditionId, ConditionInfo } from "@/types/therapeutics";

export const CONDITIONS: Record<ConditionId, ConditionInfo> = {
  "high-ldl": {
    id: "high-ldl",
    displayName: "High LDL cholesterol",
    plainDescriptor: "Lower-cholesterol cooking",
    firstLineStrategy: "Portfolio pattern on a low-saturated-fat base",
    bestAdjuncts: ["sterol-fortified foods", "oats or barley", "nuts"],
    avoidOverstating: "Spices alone as meaningful LDL support",
  },
  masld: {
    id: "masld",
    displayName: "Fatty liver (MASLD)",
    plainDescriptor: "Liver-supportive, Mediterranean-leaning meals",
    firstLineStrategy:
      "Mediterranean pattern, calorie-aware portions, fewer sugary drinks",
    bestAdjuncts: ["fatty fish / omega-3", "unsweetened coffee"],
    avoidOverstating: "Single nutraceuticals as primary liver support",
  },
  ibs: {
    id: "ibs",
    displayName: "IBS",
    plainDescriptor: "Gentler-on-the-gut meals",
    firstLineStrategy:
      "A short low-FODMAP phase, then structured reintroduction",
    bestAdjuncts: ["soluble fiber / psyllium", "peppermint-oil (education)"],
    avoidOverstating: "Permanent maximal restriction or default gluten-free",
  },
  "ulcerative-colitis": {
    id: "ulcerative-colitis",
    displayName: "Ulcerative colitis",
    plainDescriptor: "Mediterranean-leaning, texture-aware meals",
    firstLineStrategy:
      "Mediterranean background pattern with symptom-aware texture",
    bestAdjuncts: ["curcumin extract (clinician-flagged education)"],
    avoidOverstating: "Culinary turmeric as extract-equivalent support",
  },
  crohns: {
    id: "crohns",
    displayName: "Crohn's disease",
    plainDescriptor: "Nutrition-sufficient, Mediterranean-leaning meals",
    firstLineStrategy:
      "Nutrition sufficiency + Mediterranean baseline + deficiency awareness",
    bestAdjuncts: ["clinician-guided nutrition support"],
    avoidOverstating: "Omega-3 as a remission-maintenance default",
  },
  celiac: {
    id: "celiac",
    displayName: "Celiac disease",
    plainDescriptor: "Strict, certified gluten-free meals",
    firstLineStrategy:
      "Certified strict gluten-free recipes + cross-contact control",
    bestAdjuncts: ["pure oats with monitoring", "deficiency awareness"],
    avoidOverstating: "Ordinary wheat sourdough or ambiguous low-gluten foods",
  },
  "iron-deficiency": {
    id: "iron-deficiency",
    displayName: "Low iron",
    plainDescriptor: "Iron-smart meals with absorption pairing",
    firstLineStrategy:
      "Iron-focused meals + vitamin-C pairing + fortified options",
    bestAdjuncts: ["iron cookware for acidic stews"],
    avoidOverstating: "Tea or coffee alongside iron-targeted meals",
  },
  "vitamin-d-insufficiency": {
    id: "vitamin-d-insufficiency",
    displayName: "Low vitamin D",
    plainDescriptor: "Vitamin-D-forward meals",
    firstLineStrategy: "Fortified foods and oily fish where feasible",
    bestAdjuncts: ["UV-exposed mushrooms (adjunct)"],
    avoidOverstating: "Food-only correction of moderate or severe shortfall",
  },
  "calcium-insufficiency": {
    id: "calcium-insufficiency",
    displayName: "Low calcium",
    plainDescriptor: "Absorbable-calcium meals",
    firstLineStrategy: "Absorbability-aware food selection",
    bestAdjuncts: ["low-oxalate greens", "well-fortified soy"],
    avoidOverstating: "Counting spinach as a major calcium source",
  },
  "magnesium-insufficiency": {
    id: "magnesium-insufficiency",
    displayName: "Low magnesium",
    plainDescriptor: "Magnesium-rich, whole-food meals",
    firstLineStrategy: "Varied whole-food intake across the week",
    bestAdjuncts: ["magnesium-rich mineral water with meals"],
    avoidOverstating: "Food alone for symptomatic or marked shortfall",
  },
};

export const CONDITION_IDS = Object.keys(CONDITIONS) as ConditionId[];
