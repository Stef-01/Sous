/**
 * Ayurvedic mode — EVIDENCE-VALIDATED ONLY.
 *
 * Ayurveda is a traditional system; most of its framework (doshas, etc.) has not
 * been validated by rigorous trials, so NONE of that is included. This is an
 * evidence-tiered set: culinary herbs/spices used in Ayurvedic cooking that ALSO
 * carry modern clinical evidence (meta-analyses / RCTs). v2 is deliberately LESS
 * conservative — it admits any herb with ≥1 meta-analysis or ≥2 RCTs, labelled by
 * strength ("strong" / "moderate" / "limited"=emerging), with the limits and a
 * safety note. The bar is evidence, not enthusiasm: ashwagandha is flagged as a
 * supplement (not a spice), and every entry keeps its food-vs-supplement caveat.
 *
 * Honesty rails (rule 7/11 + the claim contract):
 *  - traditional use and modern evidence are stated separately;
 *  - magnitudes/conditions are described, never prescribed;
 *  - the copy flags that FOOD amounts differ from the concentrated doses studied;
 *  - every herb carries a safety / interaction note; sources are real papers.
 */

export type EvidenceStrength = "strong" | "moderate" | "limited";

export interface AyurvedicHerb {
  id: string;
  name: string;
  botanical: string;
  ayurvedicName: string;
  /** Registry ingredient id, for matching a dish's ingredients. */
  ingredientId: string;
  traditionalUse: string;
  /** What modern clinical evidence shows — described, not prescribed. */
  research: string;
  strength: EvidenceStrength;
  /** Safety / interaction note (food vs therapeutic dose, drug interactions). */
  safety: string;
  sources: { label: string; url: string }[];
}

export const AYURVEDIC_HERBS: AyurvedicHerb[] = [
  {
    id: "ginger",
    name: "Ginger",
    botanical: "Zingiber officinale",
    ayurvedicName: "Adrak / Shunthi",
    ingredientId: "ginger",
    traditionalUse:
      "A warming digestive (deepana/pachana) — used for nausea, sluggish digestion, and colds.",
    research:
      "Meta-analyses of RCTs support ginger for nausea, strongest for pregnancy-associated and post-operative nausea; the chemotherapy-nausea signal is weaker.",
    strength: "strong",
    safety:
      "Safe and flavourful in food. Concentrated doses may interact with blood thinners; in pregnancy keep below ~1 g/day and check with your clinician.",
    sources: [
      {
        label: "Ginger for pregnancy nausea — meta-analysis of 12 RCTs (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3995184/",
      },
      {
        label: "Ginger for post-operative nausea — meta-analysis (PubMed)",
        url: "https://pubmed.ncbi.nlm.nih.gov/24642205/",
      },
    ],
  },
  {
    id: "turmeric",
    name: "Turmeric",
    botanical: "Curcuma longa",
    ayurvedicName: "Haridra",
    ingredientId: "turmeric",
    traditionalUse:
      "An anti-inflammatory (shothahara) — used for joints, skin, and digestion.",
    research:
      "Network meta-analyses of ~16 RCTs find turmeric/curcumin extracts ease knee osteoarthritis pain, in some trials comparable to NSAIDs.",
    strength: "strong",
    safety:
      "Food amounts are safe — but the studied benefit used concentrated curcumin EXTRACTS (paired with black pepper), not a pinch in curry. High-dose extracts can interact with blood thinners.",
    sources: [
      {
        label:
          "Turmeric for knee OA — systematic review & network meta-analysis (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12309109/",
      },
    ],
  },
  {
    id: "fenugreek",
    name: "Fenugreek",
    botanical: "Trigonella foenum-graecum",
    ayurvedicName: "Methi",
    ingredientId: "fenugreek-seeds",
    traditionalUse:
      "Used for digestion, blood sugar, and supporting lactation.",
    research:
      "Meta-analyses of RCTs show fenugreek lowers fasting glucose and HbA1c — mainly at medium-to-high doses in people with diabetes; results are heterogeneous.",
    strength: "moderate",
    safety:
      "Can lower blood sugar — take care if you're on diabetes medication. Avoid medicinal doses in pregnancy. Culinary amounts are fine.",
    sources: [
      {
        label:
          "Fenugreek & hyperglycaemia — systematic review & meta-analysis (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9962665/",
      },
      {
        label:
          "Fenugreek in type 2 diabetes/prediabetes — meta-analysis (PubMed)",
        url: "https://pubmed.ncbi.nlm.nih.gov/37762302/",
      },
    ],
  },
  {
    id: "cinnamon",
    name: "Cinnamon",
    botanical: "Cinnamomum verum / cassia",
    ayurvedicName: "Dalchini",
    ingredientId: "cinnamon",
    traditionalUse: "A warming spice for digestion and circulation.",
    research:
      "Some meta-analyses show modest drops in fasting glucose / HbA1c in type 2 diabetes, but the trials are small and the results genuinely mixed — treat as suggestive, not settled.",
    strength: "limited",
    safety:
      "Food amounts are fine. Cassia cinnamon is high in coumarin, so large daily SUPPLEMENT doses may stress the liver; Ceylon cinnamon has far less.",
    sources: [
      {
        label: "Cinnamon & glycaemic control — updated meta-analysis (Wiley)",
        url: "https://onlinelibrary.wiley.com/doi/10.1002/ptr.8026",
      },
    ],
  },
  {
    id: "black-pepper",
    name: "Black pepper",
    botanical: "Piper nigrum",
    ayurvedicName: "Maricha",
    ingredientId: "black-pepper",
    traditionalUse:
      "A 'yogavahi' carrier said to boost other herbs; also a digestive.",
    research:
      "Piperine sharply increases the absorption of turmeric's curcumin (and some other compounds) by slowing its breakdown in the gut and liver.",
    strength: "strong",
    safety:
      "Food amounts are safe. Concentrated piperine can slow the metabolism of some medications.",
    sources: [
      {
        label:
          "Turmeric + black pepper / piperine + curcumin (Healthline, reviews Shoba 1998)",
        url: "https://www.healthline.com/nutrition/turmeric-and-black-pepper",
      },
    ],
  },
  {
    id: "garlic",
    name: "Garlic",
    botanical: "Allium sativum",
    ayurvedicName: "Lashuna",
    ingredientId: "garlic",
    traditionalUse:
      "A warming rasayana used for circulation, digestion, and respiratory health.",
    research:
      "Meta-analyses of RCTs (39 trials, ~2,300 adults) show garlic modestly lowers blood pressure in people with hypertension and trims total/LDL cholesterol when taken for 2+ months.",
    strength: "strong",
    safety:
      "Food amounts are safe. Concentrated/aged-garlic supplements can interact with blood thinners and may cause reflux.",
    sources: [
      {
        label:
          "Garlic, blood pressure & cholesterol — meta-analysis (J Nutrition)",
        url: "https://jn.nutrition.org/article/S0022-3166(23)00519-9/fulltext",
      },
    ],
  },
  {
    id: "nigella",
    name: "Black cumin (kalonji)",
    botanical: "Nigella sativa",
    ayurvedicName: "Krishna jeeraka",
    ingredientId: "nigella-seeds",
    traditionalUse:
      "Tiny black seeds tempered into breads and curries; traditionally a digestive and tonic.",
    research:
      "Across ~50 RCTs, Nigella sativa improves glucose homeostasis (fasting glucose, HbA1c) and lowers total cholesterol, triglycerides, and LDL — most clearly in type-2 diabetes.",
    strength: "strong",
    safety:
      "Culinary amounts are fine. Concentrated seed oil can add to glucose- and blood-pressure-lowering medication; avoid medicinal doses in pregnancy.",
    sources: [
      {
        label:
          "Nigella sativa — glycaemic & lipid meta-analysis (Phytother Res)",
        url: "https://onlinelibrary.wiley.com/doi/10.1002/ptr.6708",
      },
    ],
  },
  {
    id: "saffron",
    name: "Saffron",
    botanical: "Crocus sativus",
    ayurvedicName: "Kesar / Kumkuma",
    ingredientId: "saffron",
    traditionalUse:
      "Prized crimson threads used in milk, rice, and sweets; traditionally a mood and complexion tonic.",
    research:
      "Meta-analyses find saffron eases mild-to-moderate depression — more than placebo and non-inferior to standard antidepressants in head-to-head trials.",
    strength: "strong",
    safety:
      "Culinary pinches are safe. The studied effect used concentrated doses; high doses are unsafe in pregnancy and can interact with antidepressants — clinician territory, not self-treatment.",
    sources: [
      {
        label: "Saffron for mild–moderate depression — meta-analysis (PubMed)",
        url: "https://pubmed.ncbi.nlm.nih.gov/30036891/",
      },
    ],
  },
  {
    id: "tulsi",
    name: "Holy basil (tulsi)",
    botanical: "Ocimum sanctum",
    ayurvedicName: "Tulsi",
    ingredientId: "holy-basil",
    traditionalUse:
      "A sacred adaptogen taken as tea; traditionally for stress, respiratory, and metabolic balance.",
    research:
      "A meta-analysis of RCTs found tulsi lowers fasting blood glucose (≈ −16 mg/dL) and improves lipids in adults with metabolic disease, mostly at ≥1 g/day.",
    strength: "moderate",
    safety:
      "Tea/culinary use is fine. Can add to glucose-lowering medication and may affect fertility/pregnancy at medicinal doses.",
    sources: [
      {
        label:
          "Tulsi, fasting glucose & lipids — meta-analysis (ScienceDirect)",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S1756464618301166",
      },
    ],
  },
  {
    id: "amla",
    name: "Amla (Indian gooseberry)",
    botanical: "Phyllanthus emblica",
    ayurvedicName: "Amalaki",
    ingredientId: "amla",
    traditionalUse:
      "A sour rasayana eaten fresh, dried, or in chutney; exceptionally high in vitamin C.",
    research:
      "A meta-analysis of nine RCTs links amla to improved blood lipids (lower total/LDL cholesterol and triglycerides), though trials are small and varied.",
    strength: "moderate",
    safety:
      "Food amounts are safe and vitamin-C-rich. Concentrated extracts may add to blood thinners; very high intake can upset some stomachs.",
    sources: [
      {
        label:
          "Amla (Phyllanthus emblica) — nutraceutical review & lipid RCTs (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9137578/",
      },
    ],
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha (supplement, not a spice)",
    botanical: "Withania somnifera",
    ayurvedicName: "Ashwagandha",
    ingredientId: "ashwagandha",
    traditionalUse:
      "A root rasayana taken as a powder or with milk — a classic adaptogen, NOT a cooking spice.",
    research:
      "Meta-analyses (22 RCTs) show ashwagandha reduces stress and anxiety, with a smaller but real benefit for sleep, strongest at ≥600 mg/day over 8+ weeks.",
    strength: "moderate",
    safety:
      "This is a supplement, not food — treat it as one. Rare liver-injury reports; can interact with thyroid medication and sedatives; avoid in pregnancy. Discuss with a clinician.",
    sources: [
      {
        label: "Ashwagandha — NIH Office of Dietary Supplements fact sheet",
        url: "https://ods.od.nih.gov/factsheets/Ashwagandha-HealthProfessional/",
      },
      {
        label: "Ashwagandha & sleep — systematic review & meta-analysis (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8462692/",
      },
    ],
  },
  {
    id: "cardamom",
    name: "Cardamom",
    botanical: "Elettaria cardamomum",
    ayurvedicName: "Elaichi",
    ingredientId: "cardamom",
    traditionalUse:
      "An aromatic pod used in chai, rice, and sweets; traditionally a digestive and breath-freshener.",
    research:
      "Early but real: a meta-analysis of RCTs found small reductions in blood pressure and inflammatory markers — promising, with few trials, so read it as emerging.",
    strength: "limited",
    safety: "Food amounts are safe and well-tolerated.",
    sources: [
      {
        label: "Cardamom, blood pressure & inflammation — meta-analysis (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10804083/",
      },
    ],
  },
  {
    id: "cumin",
    name: "Cumin",
    botanical: "Cuminum cyminum",
    ayurvedicName: "Jeeraka",
    ingredientId: "cumin-seeds",
    traditionalUse:
      "A foundational tempering spice; traditionally a digestive (deepana) across Indian cooking.",
    research:
      "Emerging: small RCTs suggest cumin may modestly improve lipids and glycaemic markers, but the evidence base is still thin — treat as early.",
    strength: "limited",
    safety: "Food amounts are safe.",
    sources: [
      {
        label:
          "Nigella & cumin family — overview of systematic reviews (Frontiers)",
        url: "https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2023.1107750/full",
      },
    ],
  },
];

const BY_INGREDIENT = new Map(AYURVEDIC_HERBS.map((h) => [h.ingredientId, h]));

/** The evidence-backed Ayurvedic herbs present in a dish's resolved ingredients. */
export function ayurvedicHerbsForDish(
  ingredientIds: ReadonlySet<string> | undefined,
): AyurvedicHerb[] {
  if (!ingredientIds) return [];
  const out: AyurvedicHerb[] = [];
  for (const id of ingredientIds) {
    const h = BY_INGREDIENT.get(id);
    if (h) out.push(h);
  }
  return out;
}

/**
 * W20 — a structured interaction matrix, DERIVED from each herb's safety note
 * (so it can never drift from the prose). Surfaced as compact caution tags.
 */
export type InteractionTag =
  | "blood-thinners"
  | "glucose-meds"
  | "blood-pressure-meds"
  | "pregnancy"
  | "antidepressants"
  | "thyroid"
  | "sedatives"
  | "liver";

const INTERACTION_LABEL: Record<InteractionTag, string> = {
  "blood-thinners": "Blood thinners",
  "glucose-meds": "Diabetes meds",
  "blood-pressure-meds": "Blood-pressure meds",
  pregnancy: "Pregnancy",
  antidepressants: "Antidepressants",
  thyroid: "Thyroid meds",
  sedatives: "Sedatives",
  liver: "Liver (high dose)",
};

export function interactionLabel(tag: InteractionTag): string {
  return INTERACTION_LABEL[tag];
}

export function herbInteractions(herb: AyurvedicHerb): InteractionTag[] {
  const s = herb.safety.toLowerCase();
  const tags: InteractionTag[] = [];
  if (/blood thinner/.test(s)) tags.push("blood-thinners");
  if (/glucose|diabetes med|blood sugar|glucose-lowering/.test(s))
    tags.push("glucose-meds");
  if (/blood.?pressure/.test(s)) tags.push("blood-pressure-meds");
  if (/pregnan/.test(s)) tags.push("pregnancy");
  if (/antidepressant|ssri/.test(s)) tags.push("antidepressants");
  if (/thyroid/.test(s)) tags.push("thyroid");
  if (/sedative/.test(s)) tags.push("sedatives");
  if (/liver/.test(s)) tags.push("liver");
  return tags;
}

/**
 * W24 — gentle condition tie-ins, ONLY where the trial evidence supports a named
 * outcome. Educational, not a prescription; surfaced behind the same honesty rails.
 */
const CONDITION_TIE_INS: Record<string, { condition: string; note: string }> = {
  ginger: {
    condition: "Nausea",
    note: "Strong RCT support, especially pregnancy and post-operative nausea.",
  },
  turmeric: {
    condition: "Joint comfort",
    note: "Curcumin extracts ease knee osteoarthritis pain in trials.",
  },
  fenugreek: {
    condition: "Blood sugar",
    note: "Lowers fasting glucose / HbA1c in trials, mostly at higher doses.",
  },
  tulsi: {
    condition: "Blood sugar",
    note: "Lowers fasting glucose in adults with metabolic disease.",
  },
  nigella: {
    condition: "Blood sugar & lipids",
    note: "Improves glucose and cholesterol across many trials.",
  },
  garlic: {
    condition: "Blood pressure",
    note: "Modestly lowers blood pressure and LDL cholesterol.",
  },
  saffron: {
    condition: "Low mood",
    note: "Eases mild-to-moderate depression in trials.",
  },
  amla: {
    condition: "Cholesterol",
    note: "Linked to improved blood lipids across RCTs.",
  },
};

export function herbConditionTieIn(
  id: string,
): { condition: string; note: string } | null {
  return CONDITION_TIE_INS[id] ?? null;
}
