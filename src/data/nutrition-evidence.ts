/**
 * The science behind the bioavailability tips (W27+). A curated, honestly-framed
 * reference for the cooking cues surfaced on the Info sheet — each with the
 * mechanism and the primary / authoritative source. Educational summaries, NOT
 * medical advice; magnitudes are deliberately omitted in the UI copy.
 *
 * Linked from the Profile sheet ("The science"). Keep every claim directional and
 * every source a real, reachable page.
 */

export interface EvidenceSource {
  label: string;
  url: string;
}

export interface NutritionEvidence {
  id: string;
  /** Short headline — the pairing/technique. */
  title: string;
  /** The practical, food-first takeaway (mirrors the in-app tip). */
  takeaway: string;
  /** Why it works — the mechanism, plain language. */
  mechanism: string;
  sources: EvidenceSource[];
}

export const NUTRITION_EVIDENCE: NutritionEvidence[] = [
  {
    id: "vitc-iron",
    title: "Vitamin C + plant iron",
    takeaway:
      "A squeeze of citrus or some peppers helps you absorb the iron in beans, lentils, and greens.",
    mechanism:
      "Vitamin C reduces plant (non-heme) iron to the form your gut absorbs and keeps it soluble, and it counters the iron-binding effect of phytates and polyphenols in the same meal.",
    sources: [
      {
        label: "NIH Office of Dietary Supplements — Iron (Health Professional)",
        url: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/",
      },
    ],
  },
  {
    id: "pepper-turmeric",
    title: "Black pepper + turmeric",
    takeaway:
      "A crack of black pepper helps your body absorb turmeric's curcumin.",
    mechanism:
      "Piperine in black pepper slows the breakdown (glucuronidation) of curcumin in the gut and liver, so much more of it reaches the bloodstream. Curcumin is also fat-soluble, so a little oil helps too.",
    sources: [
      {
        label:
          "Healthline — Turmeric and black pepper (reviews Shoba et al., Planta Medica 1998)",
        url: "https://www.healthline.com/nutrition/turmeric-and-black-pepper",
      },
      {
        label: "Piperine (Piper nigrum) monograph — Restorative Medicine",
        url: "https://restorativemedicine.org/library/monographs/piperine-black-pepper/",
      },
    ],
  },
  {
    id: "tea-iron",
    title: "Tea, coffee & iron timing",
    takeaway:
      "Enjoy tea or coffee an hour either side of an iron-rich plant meal — not with it.",
    mechanism:
      "Tannins and polyphenols in tea and coffee bind plant (non-heme) iron at the table to form insoluble complexes, cutting absorption — most strongly when sipped with the meal.",
    sources: [
      {
        label:
          "Disler et al. — The effect of tea on iron absorption (Gut, 1975; PubMed)",
        url: "https://pubmed.ncbi.nlm.nih.gov/1168162/",
      },
    ],
  },
  {
    id: "fat-soluble",
    title: "A little fat for vitamins A, D, E, K",
    takeaway:
      "A drizzle of oil or some avocado helps you absorb the fat-soluble vitamins in a very lean dish.",
    mechanism:
      "Vitamins A, D, E and K — and carotenoids like beta-carotene and lycopene — are fat-soluble; dietary fat forms the micelles that carry them across the gut wall.",
    sources: [
      {
        label:
          "NIH Office of Dietary Supplements — Vitamin A (Health Professional)",
        url: "https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/",
      },
    ],
  },
  {
    id: "soak-phytate",
    title: "Soaking & sprouting beans",
    takeaway:
      "Soaking or sprouting dried beans and grains before cooking frees up more of their iron and zinc.",
    mechanism:
      "Phytates in legumes and whole grains bind iron and zinc into unabsorbable complexes. Soaking, sprouting, and fermenting activate enzymes that break phytate down — fermentation can cut it by 80%+.",
    sources: [
      {
        label:
          "Soaking & sprouting raise iron/zinc availability in faba bean (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4252429/",
      },
      {
        label:
          "Phytate reduction (soak/germinate/ferment) & iron/zinc bioavailability (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11646714/",
      },
    ],
  },
  {
    id: "tomato-lycopene",
    title: "Cooking tomatoes for lycopene",
    takeaway:
      "Cooked tomatoes give up far more lycopene than raw — a simmered sauce especially, with a little oil.",
    mechanism:
      "Heat and chopping break the tomato's cell walls, freeing the antioxidant lycopene; tomato paste is several times more bioavailable than raw, and dietary fat boosts uptake further.",
    sources: [
      {
        label:
          "Tomato purée preparation & lycopene blood bioavailability (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8073136/",
      },
    ],
  },
  {
    id: "vitd-calcium",
    title: "Vitamin D + calcium",
    takeaway:
      "Vitamin D helps your body make the most of the calcium in the same meal.",
    mechanism:
      "Vitamin D switches on the active calcium transporters in the gut. (The size of the boost from extra vitamin D is debated when stores are already adequate — the partnership itself is well established.)",
    sources: [
      {
        label: "Vitamin D & intestinal calcium absorption — the nuance (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3927686/",
      },
    ],
  },
];
