/**
 * Display-unit conversion (founder feature, 2026-06-10): render any ingredient
 * quantity in JUST metric (grams) or JUST US volume (cups/tbsp/tsp), using the
 * SAME per-ingredient density data the nutrition engine masses with — so the
 * displayed conversion and the computed nutrition can never disagree.
 *
 * Honesty rules:
 *  - countable/descriptive quantities ("2 cloves", "1 large", "for frying")
 *    are NEVER converted — a clove is a clove in both systems.
 *  - volume→grams needs the ingredient's densityGPerCup; grams→volume too.
 *    Without density: metric falls back via oz/lb mass, US keeps the original.
 *  - null means "leave the original string alone".
 */

import type { Ingredient } from "@/types/ingredient";
import {
  parseAmount,
  parseQuantityToGrams,
} from "@/lib/nutrition/user-recipe-nutrition";

export type UnitSystem = "metric" | "us";

const VOLUME_UNIT =
  /^(cups?|tbsp|tablespoons?|tsp|teaspoons?|ml|milliliters?|l|liters?)$/i;
const WEIGHT_UNIT = /^(g|grams?|kg|kilograms?|oz|ounces?|lbs?|pounds?)$/i;

/** The unit token of a quantity string, or null for countables/descriptions. */
export function quantityUnit(quantity: string): string | null {
  const q = quantity.trim().toLowerCase();
  if (!q || parseAmount(q) === null) return null;
  const unit = q
    .replace(/^[\d\s.\/½⅓¼⅔¾–-]+/, "")
    .trim()
    .split(/\s+/)[0]
    ?.replace(/[.,]$/, "");
  return unit || null;
}

/** ½-style glyphs → "1/2" so parseAmount can read seed-data quantities. */
export function normalizeFractionGlyphs(q: string): string {
  return q
    .replace(/(\d)\s*½/g, "$1 1/2")
    .replace(/(\d)\s*⅓/g, "$1 1/3")
    .replace(/(\d)\s*¼/g, "$1 1/4")
    .replace(/(\d)\s*⅔/g, "$1 2/3")
    .replace(/(\d)\s*¾/g, "$1 3/4")
    .replace(/^½/, "1/2")
    .replace(/^⅓/, "1/3")
    .replace(/^¼/, "1/4")
    .replace(/^⅔/, "2/3")
    .replace(/^¾/, "3/4");
}

/** 0.32 → "⅓", 1.5 → "1 ½" — the cookbook fractions readers expect. */
export function niceFraction(value: number): string {
  const whole = Math.floor(value);
  const frac = value - whole;
  const STOPS: Array<[number, string]> = [
    [0, ""],
    [0.25, "¼"],
    [1 / 3, "⅓"],
    [0.5, "½"],
    [2 / 3, "⅔"],
    [0.75, "¾"],
    [1, ""],
  ];
  let best: [number, string] = STOPS[0];
  for (const stop of STOPS)
    if (Math.abs(stop[0] - frac) < Math.abs(best[0] - frac)) best = stop;
  const carried = best[0] === 1 ? whole + 1 : whole;
  const glyph = best[0] === 1 ? "" : best[1];
  if (carried === 0 && glyph) return glyph;
  if (!glyph) return String(carried);
  return `${carried} ${glyph}`;
}

function formatGrams(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(1).replace(/\.0$/, "")} kg`;
  if (g < 10) return `${Math.round(g * 10) / 10} g`;
  return `${Math.round(g)} g`;
}

function formatUSVolume(cups: number): string {
  if (cups >= 0.2) {
    const txt = niceFraction(cups);
    return `${txt} ${cups > 1 ? "cups" : "cup"}`;
  }
  const tbsp = cups * 16;
  if (tbsp >= 0.9) {
    const rounded = Math.round(tbsp * 2) / 2;
    return `${rounded % 1 === 0 ? rounded : niceFraction(rounded)} tbsp`;
  }
  const tsp = Math.max(0.25, Math.round(cups * 48 * 4) / 4);
  return `${tsp % 1 === 0 ? tsp : niceFraction(tsp)} tsp`;
}

/**
 * Convert `quantity` for display in `target`, or null to keep the original.
 * `ing` supplies density; pass null when the name didn't resolve.
 */
export function convertQuantity(
  quantity: string,
  ing: Ingredient | null,
  target: UnitSystem,
): string | null {
  const normalized = normalizeFractionGlyphs(quantity);
  const unit = quantityUnit(normalized);
  if (!unit) return null; // countable / descriptive — never touched
  const isVolume = VOLUME_UNIT.test(unit);
  const isWeight = WEIGHT_UNIT.test(unit);
  if (!isVolume && !isWeight) return null;

  if (target === "metric") {
    if (isWeight && /^(g|grams?|kg|kilograms?)$/i.test(unit)) return null; // already metric
    if (!ing) {
      // oz/lb convert without density; volume can't.
      if (!isWeight) return null;
      const amount = parseAmount(normalized);
      if (amount === null) return null;
      const g = /^(oz|ounces?)$/i.test(unit) ? amount * 28.35 : amount * 453.6;
      return formatGrams(g);
    }
    const grams = parseQuantityToGrams(normalized, ing);
    return grams === null ? null : formatGrams(grams);
  }

  // target === "us"
  if (isVolume && !/^(ml|milliliters?|l|liters?)$/i.test(unit)) return null; // already cups/tbsp/tsp
  if (!ing?.densityGPerCup) {
    // grams → oz keeps it US-readable even without density.
    if (/^(g|grams?|kg|kilograms?)$/i.test(unit)) {
      const amount = parseAmount(normalized);
      if (amount === null) return null;
      const g = /^k/i.test(unit) ? amount * 1000 : amount;
      return `${Math.max(0.1, Math.round((g / 28.35) * 10) / 10)} oz`;
    }
    return null;
  }
  const grams = parseQuantityToGrams(normalized, ing);
  if (grams === null) return null;
  return formatUSVolume(grams / ing.densityGPerCup);
}
