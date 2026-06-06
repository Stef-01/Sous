/**
 * protein-quality — a DIAAS-lite "complete protein?" signal from the composed
 * essential amino acids (now real, from USDA FDC). For each EAA we compute the
 * dish's mg-per-g-protein against the WHO/FAO 2007 reference scoring pattern;
 * the limiting amino acid (lowest ratio) sets the score. ≥ 1.0 = complete.
 */

import type { PerServingNutrition } from "@/types/nutrition";

/** WHO/FAO 2007 reference, mg per g protein. SAA = Met+Cys, AAA = Phe+Tyr. */
const REFERENCE: Array<{
  label: string;
  mgPerG: number;
  keys: Array<keyof PerServingNutrition>;
}> = [
  { label: "histidine", mgPerG: 15, keys: ["histidine_g"] },
  { label: "isoleucine", mgPerG: 30, keys: ["isoleucine_g"] },
  { label: "leucine", mgPerG: 59, keys: ["leucine_g"] },
  { label: "lysine", mgPerG: 45, keys: ["lysine_g"] },
  {
    label: "methionine + cystine",
    mgPerG: 22,
    keys: ["methionine_g", "cystine_g"],
  },
  {
    label: "phenylalanine + tyrosine",
    mgPerG: 38,
    keys: ["phenylalanine_g", "tyrosine_g"],
  },
  { label: "threonine", mgPerG: 23, keys: ["threonine_g"] },
  { label: "tryptophan", mgPerG: 6, keys: ["tryptophan_g"] },
  { label: "valine", mgPerG: 39, keys: ["valine_g"] },
];

export interface ProteinQuality {
  /** Limiting-amino-acid score; ≥ 1 means a complete protein. */
  score: number;
  /** The amino acid in shortest supply relative to the reference. */
  limiting: string;
  complete: boolean;
}

export function proteinQuality(n: PerServingNutrition): ProteinQuality | null {
  const protein = n.protein_g ?? 0;
  if (protein < 1) return null; // negligible protein — quality isn't meaningful
  let min = Infinity;
  let limiting = "";
  for (const eaa of REFERENCE) {
    let grams = 0;
    let sawAny = false;
    for (const k of eaa.keys) {
      const v = n[k] as number | undefined;
      if (v != null) {
        grams += v;
        sawAny = true;
      }
    }
    if (!sawAny) return null; // amino panel incomplete → don't claim a score
    const mgPerG = (grams * 1000) / protein;
    const ratio = mgPerG / eaa.mgPerG;
    if (ratio < min) {
      min = ratio;
      limiting = eaa.label;
    }
  }
  if (!Number.isFinite(min)) return null;
  const score = Math.round(min * 100) / 100;
  return { score, limiting, complete: score >= 0.9 };
}
