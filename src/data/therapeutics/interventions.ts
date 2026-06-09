/**
 * Evidence registry — intervention records.
 *
 * A faithful encoding of the culinary-therapeutics evidence matrix from the
 * source research report (Tier A high-confidence engines + Tier B adjuncts +
 * the explicitly-bounded entries). Each record carries its effect size, GRADE,
 * intervention class, recipe signals, provenance, and an honest application
 * note.
 *
 * INVARIANTS (enforced by `therapeutics-registry.test.ts`):
 *   - every `applicationNote` passes `assertNoMedicalClaim`
 *   - `reviewStatus: "unreviewed"` and `isEducational: true` on every record
 *     (founder gates G1 + G5 — nothing flips autonomously)
 *   - only `recipe-native` / `fortified-food` records may move a recipe score;
 *     `extract-or-supplement` records are education only (anti-overclaiming)
 *
 * Source URLs are intentionally omitted: the report cites the literature
 * descriptively. Real DOIs/links are attached during clinician review (G1).
 */

import type { InterventionRecord } from "@/types/therapeutics";

const UNREVIEWED = {
  reviewStatus: "unreviewed",
  isEducational: true,
} as const;

export const INTERVENTIONS: InterventionRecord[] = [
  // ─────────────────────────────── High LDL-C ──────────────────────────────
  {
    id: "ldl-portfolio-pattern",
    conditionId: "high-ldl",
    label: "Portfolio dietary pattern",
    direction: "lowers",
    interventionClass: "recipe-native",
    grade: "moderate",
    effect: {
      metric: "LDL-C MD",
      value: -0.73,
      unit: "mmol/L",
      ciLow: -0.89,
      ciHigh: -0.56,
      note: "~ -17%",
    },
    doseSignal: "Multiple daily exposures on a low-saturated-fat base",
    recipeSignals: [
      "legumes",
      "beans",
      "lentils",
      "nuts",
      "oats",
      "barley",
      "soy",
      "tofu",
      "viscous fiber",
    ],
    applicationNote:
      "Supports a Portfolio-style LDL plan when several components recur daily; the pooled signal is larger combined with sterol-fortified foods. Strongest food-first package for cholesterol support.",
    sources: [
      {
        title: "Portfolio diet, controlled-trial meta-analysis",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "ldl-plant-sterols",
    conditionId: "high-ldl",
    label: "Plant sterols/stanols (fortified foods)",
    direction: "lowers",
    interventionClass: "fortified-food",
    grade: "moderate",
    effect: { metric: "LDL-C", value: -9, unit: "%", note: "~ -6% to -12%" },
    doseSignal: "~2 g/day (1.5–3 g/day)",
    recipeSignals: [
      "fortified spread",
      "fortified yogurt",
      "fortified dairy alternative",
    ],
    applicationNote:
      "A functional-food module delivered through fortified spreads, yogurts, or dairy alternatives — not a whole-food-only effect. Pairs well inside a Portfolio-style day.",
    sources: [
      {
        title: "Plant sterol dose-response meta-analysis",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "ldl-beta-glucan",
    conditionId: "high-ldl",
    label: "Oat or barley beta-glucan",
    direction: "lowers",
    interventionClass: "recipe-native",
    grade: "moderate",
    effect: {
      metric: "LDL-C",
      value: -0.25,
      unit: "mmol/L",
      note: "~ -0.2 to -0.3",
    },
    doseSignal: "≥3 g/day beta-glucan",
    recipeSignals: ["oats", "oatmeal", "barley"],
    prepImplication:
      "Prefer understated oat or barley formats over sugary cereals.",
    applicationNote:
      "Highly recipe-compatible in breakfasts, soups, pilafs, and baking. A good source of the viscous fiber a Portfolio plan leans on.",
    sources: [
      {
        title: "Beta-glucan controlled-trial meta-analysis",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "ldl-tree-nuts",
    conditionId: "high-ldl",
    label: "Tree nuts",
    direction: "lowers",
    interventionClass: "recipe-native",
    grade: "moderate",
    effect: {
      metric: "LDL-C MD",
      value: -0.13,
      unit: "mmol/L",
      ciLow: -0.21,
      ciHigh: -0.05,
      heterogeneityI2: 68.6,
    },
    doseSignal: "30–60 g/day",
    recipeSignals: [
      "almond",
      "walnut",
      "pistachio",
      "pecan",
      "hazelnut",
      "nuts",
    ],
    applicationNote:
      "Useful as a swap for refined snacks or saturated-fat foods, and synergistic inside Portfolio-style day plans.",
    sources: [
      { title: "Tree-nut RCT meta-analysis", studyType: "meta-analysis" },
    ],
    ...UNREVIEWED,
  },

  // ─────────────────────────────── MASLD / NAFLD ───────────────────────────
  {
    id: "masld-mediterranean",
    conditionId: "masld",
    label: "Mediterranean pattern + energy deficit when overweight",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "moderate",
    effect: {
      metric: "Hepatic steatosis",
      value: -39,
      unit: "%",
      note: "vs -7% comparator (crossover RCT)",
    },
    doseSignal:
      "Pattern level; guidelines target >5% weight loss for steatosis, 7–10% for inflammation, >10% for fibrosis",
    recipeSignals: [
      "olive oil",
      "legumes",
      "fish",
      "nuts",
      "vegetables",
      "whole grains",
    ],
    // RCA fix: Mediterranean is a PATTERN, not a single ingredient — require
    // olive oil (its defining fat) + ≥1 more component, so olive-oil-cooked steak
    // / sushi / Pad Thai no longer read as "Mediterranean".
    keystoneSignal: "olive oil",
    minSignals: 2,
    prepImplication:
      "Whole-food cooking; reduce ultra-processed foods and sugary drinks.",
    applicationNote:
      "Foundational first-line dietary quality for liver support; works best alongside portion awareness, not a single hero ingredient.",
    sources: [
      {
        title: "Liver guidelines + Mediterranean NAFLD RCTs",
        studyType: "guideline",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "masld-omega3",
    conditionId: "masld",
    label: "Omega-3 EPA/DHA (fatty fish or fish oil)",
    direction: "improves-symptoms",
    interventionClass: "fortified-food",
    grade: "moderate",
    effect: {
      metric: "GGT",
      value: -5.38,
      unit: "IU/L",
      note: "improved ultrasound steatosis; histology certainty lower",
    },
    doseSignal:
      "Trial doses 2–4 g/day EPA+DHA; dietary fish alone may underdose",
    recipeSignals: ["salmon", "mackerel", "sardine", "fatty fish", "trout"],
    applicationNote:
      "Best when high triglycerides coexist. Favor fatty-fish recipes, but the trial-dose evidence is supplement-equivalent and is tagged separately — an adjunct, not a substitute for diet quality and weight management.",
    sources: [
      { title: "Omega-3 NAFLD RCT meta-analyses", studyType: "meta-analysis" },
    ],
    ...UNREVIEWED,
  },
  {
    id: "masld-coffee",
    conditionId: "masld",
    label: "Coffee",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "low",
    effect: {
      metric: "NAFLD risk RR",
      value: 0.77,
      unit: "",
      ciLow: 0.6,
      ciHigh: 0.98,
      note: "fibrosis RR ~0.65–0.70",
    },
    doseSignal: "2–3+ cups/day, unsweetened",
    recipeSignals: ["coffee"],
    applicationNote:
      "A reasonable adjunct unless contraindicated, based on consistent observational association — not causal-quality evidence. Prefer unsweetened.",
    sources: [
      {
        title: "Coffee–NAFLD observational meta-analyses",
        studyType: "observational",
      },
    ],
    ...UNREVIEWED,
  },

  // ─────────────────────────────────── IBS ─────────────────────────────────
  {
    id: "ibs-low-fodmap",
    conditionId: "ibs",
    label: "Low-FODMAP diet (phased)",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "moderate",
    phased: true,
    effect: {
      metric: "IBS-SSS MD",
      value: -46.29,
      unit: "points",
      ciLow: -63.72,
      ciHigh: -28.86,
      heterogeneityI2: 55.95,
    },
    doseSignal: "Time-limited elimination, then structured reintroduction",
    recipeSignals: ["low-fodmap"],
    prepImplication:
      "Support phased elimination then re-challenge — never lifelong maximal restriction.",
    applicationNote:
      "The strongest diet-level symptom approach for IBS, used best as a short, time-limited phase followed by reintroduction rather than a permanent diet.",
    sources: [
      {
        title: "ACG guideline + low-FODMAP network meta-analyses",
        studyType: "guideline",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "ibs-psyllium",
    conditionId: "ibs",
    label: "Soluble fiber (psyllium)",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "moderate",
    effect: {
      metric: "Symptom improvement RR",
      value: 1.49,
      unit: "",
      ciLow: 1.09,
      ciHigh: 2.03,
    },
    doseSignal: "10–20 g/day, titrated, with adequate fluid",
    recipeSignals: ["psyllium", "oats", "soluble fiber"],
    prepImplication: "Introduce gradually with plenty of water.",
    applicationNote:
      "A lower-burden, more sustainable option than maximal restriction; a good source of soluble fiber, especially helpful in constipation-predominant and mixed patterns.",
    sources: [
      {
        title: "Soluble-fiber IBS systematic review",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "ibs-peppermint-oil",
    conditionId: "ibs",
    label: "Enteric-coated peppermint oil",
    direction: "improves-symptoms",
    interventionClass: "extract-or-supplement",
    grade: "low",
    effect: { metric: "Global symptoms NNT", value: 4, unit: "" },
    doseSignal: "Capsule formulations used in trials",
    recipeSignals: [],
    applicationNote:
      "A short-term botanical adjunct used as a capsule — peppermint tea or mint leaves are not evidence-equivalent. Education only; this is not a recipe-native effect.",
    sources: [
      {
        title: "Peppermint-oil IBS systematic reviews",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },

  // ───────────────────────────── Ulcerative colitis ────────────────────────
  {
    id: "uc-curcumin",
    conditionId: "ulcerative-colitis",
    label: "Curcumin extract (adjunct to standard care)",
    direction: "improves-symptoms",
    interventionClass: "extract-or-supplement",
    grade: "low",
    effect: {
      metric: "Clinical remission RR",
      value: 2.45,
      unit: "",
      ciLow: 1.09,
      ciHigh: 5.51,
    },
    doseSignal: "1.6–3 g/day extract-equivalent (NOT culinary turmeric)",
    recipeSignals: [],
    applicationNote:
      "A promising adjunct in mild-to-moderate UC alongside standard care, but only at extract doses — ordinary culinary turmeric is not dose-equivalent. Education only, clinician-flagged.",
    sources: [
      {
        title: "Curcumin UC placebo-controlled meta-analysis (13 RCTs)",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "uc-mediterranean",
    conditionId: "ulcerative-colitis",
    label: "Mediterranean background pattern",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "moderate",
    recipeSignals: [
      "olive oil",
      "vegetables",
      "legumes",
      "fish",
      "whole grains",
    ],
    // RCA fix: pattern, not a single ingredient (see masld-mediterranean).
    keystoneSignal: "olive oil",
    minSignals: 2,
    prepImplication:
      "Individualize fiber amount and texture during active symptoms.",
    applicationNote:
      "A good default background pattern for overall well-being in IBD; note that no diet has consistently reduced adult flare rates, so this is for general health, not flare avoidance.",
    sources: [
      { title: "AGA IBD clinical practice update", studyType: "guideline" },
    ],
    ...UNREVIEWED,
  },

  // ─────────────────────────────── Crohn's disease ─────────────────────────
  {
    id: "crohns-omega3-no-benefit",
    conditionId: "crohns",
    label: "Omega-3 for remission maintenance",
    direction: "no-benefit",
    interventionClass: "extract-or-supplement",
    grade: "moderate",
    recipeSignals: [],
    applicationNote:
      "Higher-quality analyses show little or no meaningful benefit for remission maintenance, so this is not a priority for Crohn's. Listed to avoid overstating.",
    sources: [
      { title: "Cochrane omega-3 Crohn's review", studyType: "meta-analysis" },
    ],
    ...UNREVIEWED,
  },
  {
    id: "crohns-nutrition-sufficiency",
    conditionId: "crohns",
    label: "Mediterranean baseline + nutrition sufficiency",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "low",
    recipeSignals: [
      "vegetables",
      "legumes",
      "fish",
      "olive oil",
      "whole grains",
    ],
    // RCA fix: "Mediterranean baseline" is a pattern (see masld-mediterranean).
    keystoneSignal: "olive oil",
    minSignals: 2,
    prepImplication: "Manage texture and deficiency risk with your care team.",
    applicationNote:
      "Use for background dietary quality, symptom-aware texture, and deficiency awareness — framed as supportive, not a remission strategy.",
    sources: [
      { title: "AGA IBD clinical practice update", studyType: "guideline" },
    ],
    ...UNREVIEWED,
  },

  // ────────────────────────────────── Celiac ───────────────────────────────
  {
    id: "celiac-strict-gf",
    conditionId: "celiac",
    label: "Strict lifelong gluten-free diet",
    direction: "exclude",
    interventionClass: "recipe-native",
    grade: "high",
    recipeSignals: ["gluten-free", "certified gluten-free"],
    prepImplication:
      "Certified gluten-free ingredients and cross-contact control are essential.",
    applicationNote:
      "Strict, lifelong gluten exclusion is the established standard of care and overrides all preference-based rules in the app. Always managed with your clinician.",
    sources: [
      { title: "Updated celiac clinical guidelines", studyType: "guideline" },
    ],
    ...UNREVIEWED,
  },
  {
    id: "celiac-pure-oats",
    conditionId: "celiac",
    label: "Pure uncontaminated gluten-free oats",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "low",
    recipeSignals: ["certified gluten-free oats"],
    prepImplication:
      "Only certified uncontaminated oats; introduce with monitoring.",
    applicationNote:
      "Pooled analyses found no evidence of harm on symptoms, serology, or histology, though evidence quality is low — reasonable after stabilization, not a casual default.",
    sources: [
      {
        title: "GF-oats meta-analysis + guideline updates",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },

  // ──────────────────────────── Iron deficiency / IDA ──────────────────────
  {
    id: "iron-fortified-foods",
    conditionId: "iron-deficiency",
    label: "Iron-fortified foods",
    direction: "raises",
    interventionClass: "fortified-food",
    grade: "moderate",
    effect: {
      metric: "Hb",
      value: 0.42,
      unit: "g/dL",
      ciLow: 0.28,
      ciHigh: 0.56,
    },
    recipeSignals: ["fortified cereal", "fortified flour", "fortified grain"],
    applicationNote:
      "A good source of repeated daily iron exposure and associated with lower anemia risk — a preventive or mild-shortfall adjunct, not enough on its own for clinically significant anemia.",
    sources: [
      {
        title: "Iron-fortification meta-analysis (60 trials)",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "iron-vitc-pairing",
    conditionId: "iron-deficiency",
    label: "Vitamin-C pairing for non-heme iron",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "moderate",
    recipeSignals: [
      "citrus",
      "lemon",
      "bell pepper",
      "tomato",
      "legumes",
      "lentils",
      "leafy greens",
      "spinach",
    ],
    prepImplication:
      "Pair beans, lentils, tofu, or greens with tomatoes, peppers, or citrus; keep tea and coffee away from iron-focused meals; soak/sprout/ferment legumes.",
    applicationNote:
      "Vitamin C helps the body absorb non-heme iron from plants; the mechanism is well established, though direct deficiency-correction evidence is indirect.",
    sources: [
      {
        title: "NIH ODS + iron bioavailability reviews",
        studyType: "umbrella-review",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "iron-cookware",
    conditionId: "iron-deficiency",
    label: "Iron cookware for acidic dishes",
    direction: "raises",
    interventionClass: "recipe-native",
    grade: "low",
    effect: {
      metric: "Hb",
      value: 0.7,
      unit: "g/dL",
      note: "~ +0.32 to +1.20 in responsive studies",
    },
    recipeSignals: ["tomato", "stew", "lentils", "curry", "soup"],
    prepImplication:
      "Acidic, moist, longer-cooked dishes transfer the most iron.",
    applicationNote:
      "A reasonable adjunct for soups, stews, lentils, and tomato dishes; results are mixed overall.",
    sources: [
      { title: "Iron-cookware systematic reviews", studyType: "meta-analysis" },
    ],
    ...UNREVIEWED,
  },

  // ───────────────────────── Vitamin D insufficiency ───────────────────────
  {
    id: "vitd-fortified-foods",
    conditionId: "vitamin-d-insufficiency",
    label: "Vitamin-D-fortified foods + oily fish",
    direction: "raises",
    interventionClass: "fortified-food",
    grade: "moderate",
    effect: {
      metric: "25(OH)D",
      value: 21.2,
      unit: "nmol/L",
      ciLow: 16.2,
      ciHigh: 26.2,
      note: "adults ~+25.4",
    },
    doseSignal: "Mean fortification ~16.2 µg/day",
    recipeSignals: [
      "fortified dairy",
      "fortified soy",
      "fortified bread",
      "oily fish",
      "egg",
      "salmon",
    ],
    applicationNote:
      "Good for maintenance and mild insufficiency via fortified dairy/soy, oily fish, and eggs; many true shortfalls still need a supplement or sunlight plan from your clinician.",
    sources: [
      {
        title: "Vitamin-D fortification RCT meta-analyses",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "vitd-uv-mushrooms",
    conditionId: "vitamin-d-insufficiency",
    label: "UV-exposed mushrooms",
    direction: "raises",
    interventionClass: "recipe-native",
    grade: "low",
    effect: {
      metric: "25(OH)D",
      value: 0,
      unit: "nmol/L",
      heterogeneityI2: 87,
      note: "no significant overall increase",
    },
    recipeSignals: ["mushroom"],
    applicationNote:
      "A nice plant-forward option, but with mixed and highly variable results — not a reliable sole strategy and should not be oversold.",
    sources: [
      {
        title: "UV-mushroom meta-analysis (6 RCTs)",
        studyType: "meta-analysis",
      },
    ],
    ...UNREVIEWED,
  },

  // ───────────────────────────── Calcium / Magnesium ───────────────────────
  {
    id: "calcium-bioavailable",
    conditionId: "calcium-insufficiency",
    label: "Dairy, fortified soy, and low-oxalate greens",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "moderate",
    recipeSignals: [
      "dairy",
      "milk",
      "yogurt",
      "fortified soy",
      "bok choy",
      "kale",
      "collards",
    ],
    prepImplication:
      "Prefer bok choy, kale, collards, dairy, and well-fortified soy over spinach for calcium-focused meals.",
    applicationNote:
      "Optimize absorbable calcium, not just labeled total — calcium-carbonate-fortified soy can be comparable to milk, while spinach is a poor source because of oxalate.",
    sources: [
      {
        title: "Calcium food-matrix + absorption studies",
        studyType: "umbrella-review",
      },
    ],
    ...UNREVIEWED,
  },
  {
    id: "magnesium-foods-water",
    conditionId: "magnesium-insufficiency",
    label: "Magnesium-rich whole foods + mineral water",
    direction: "improves-symptoms",
    interventionClass: "recipe-native",
    grade: "low",
    recipeSignals: [
      "nuts",
      "legumes",
      "whole grains",
      "leafy greens",
      "cocoa",
      "soy",
      "seeds",
    ],
    prepImplication:
      "Spread legumes, nuts, seeds, cocoa, soy, and whole grains across the week; mineral water with meals is a practical adjunct.",
    applicationNote:
      "About half the magnesium in mineral water is absorbed, better with meals; a good source for intake optimization, but a symptomatic or marked shortfall still needs standard replacement from your clinician.",
    sources: [
      {
        title: "Magnesium absorption studies + ODS/NRV sources",
        studyType: "umbrella-review",
      },
    ],
    ...UNREVIEWED,
  },
];
