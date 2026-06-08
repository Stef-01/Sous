/**
 * W28 — Glycemic load ESTIMATE (heuristic). We have macros, not per-food GI
 * tables, so this is a deliberately rough proxy used only for a soft, clearly-
 * labelled "rough estimate" pill and relative ranking (lentils gentler than white
 * rice). It is NEVER presented as a measured GI/GL or medical fact.
 *
 * Method: glycemic load = available (net) carbs × estimated GI ÷ 100, where the
 * estimated GI rises with the sugar share of the carbs and with refinement (low
 * fibre), and falls with fibre. Net carbs already discount fibre.
 */

import type { PerServingNutrition } from "@/types/nutrition";

export type GlycemicBand = "low" | "medium" | "high";

export interface GlycemicEstimate {
  /** Estimated glycemic load (rounded). */
  gl: number;
  band: GlycemicBand;
  /** The estimated GI behind it (rounded) — for the expand panel. */
  gi: number;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** Rough GI proxy from the macro profile, clamped to a sane mixed-meal range. */
function estimatedGI(
  netCarbs: number,
  fiber_g: number,
  sugar_g: number,
  totalCarbs_g: number,
): number {
  const sugarFrac = clamp(sugar_g / netCarbs, 0, 1);
  const fiberFrac = totalCarbs_g > 0 ? fiber_g / totalCarbs_g : 0;
  const refinedPenalty = 1 - clamp(fiberFrac * 4, 0, 1); // low fibre → refined
  return clamp(45 + 30 * sugarFrac + 25 * refinedPenalty, 30, 80);
}

export function estimateGlycemicLoad(
  n: PerServingNutrition | null | undefined,
): GlycemicEstimate | null {
  if (!n || n.totalCarbs_g == null) return null;
  const carbs = n.totalCarbs_g;
  const fiber = n.fiber_g ?? 0;
  const sugar = n.totalSugars_g ?? n.addedSugar_g ?? 0;
  const netCarbs = Math.max(0, carbs - fiber);
  if (netCarbs <= 0) return { gl: 0, band: "low", gi: 0 };
  const gi = estimatedGI(netCarbs, fiber, sugar, carbs);
  const gl = Math.round((netCarbs * gi) / 100);
  const band: GlycemicBand = gl < 10 ? "low" : gl <= 20 ? "medium" : "high";
  return { gl, band, gi: Math.round(gi) };
}
