/**
 * Ayurvedic mode — EVIDENCE-VALIDATED ONLY.
 *
 * Ayurveda is a traditional system; most of its framework (doshas, etc.) has not
 * been validated by rigorous trials, so NONE of that is included. This is a
 * deliberately narrow set: culinary herbs/spices used in Ayurvedic cooking that
 * ALSO carry modern clinical evidence (meta-analyses / RCTs), each labelled with
 * its evidence strength, the limits, and a safety note.
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
