/**
 * scaleQuantity — scale a recipe ingredient quantity by a serving multiplier.
 *
 * Pure + deterministic. Reuses the nutrition quantity parser to read the
 * leading amount, scales it, and re-renders it with cook-friendly fractions
 * ("1 1/2 cups", "3/4 tsp"). Non-quantities ("to taste", "a pinch") pass
 * through untouched. This is the scalable core behind the serving slider — the
 * UI just picks a multiplier.
 */

import { parseLeadingAmount } from "@/lib/nutrition/quantity-to-grams";

/** Common fraction glyphs for display. */
const FRACTIONS: ReadonlyArray<[number, string]> = [
  [1 / 8, "1/8"],
  [1 / 4, "1/4"],
  [1 / 3, "1/3"],
  [1 / 2, "1/2"],
  [2 / 3, "2/3"],
  [3 / 4, "3/4"],
];

/** Render a number as a cook-friendly amount: "2", "1 1/2", "3/4". */
export function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  const whole = Math.floor(n);
  const frac = n - whole;

  // Snap the fractional part to the nearest common cooking fraction.
  let best = "";
  let bestErr = 0.06; // tolerance
  for (const [val, label] of FRACTIONS) {
    const err = Math.abs(frac - val);
    if (err < bestErr) {
      bestErr = err;
      best = label;
    }
  }
  if (frac < 0.06) best = ""; // effectively whole

  if (best) return whole > 0 ? `${whole} ${best}` : best;
  if (frac >= 0.94) return `${whole + 1}`;
  // No clean fraction → one decimal place.
  return whole > 0 || n >= 1
    ? `${Math.round(n * 10) / 10}`
    : `${Math.round(n * 100) / 100}`;
}

/** Scale a quantity string by a multiplier, preserving its unit/remainder. */
export function scaleQuantity(quantity: string, multiplier: number): string {
  if (multiplier === 1 || !quantity) return quantity;
  // Only scale a NUMERIC lead ("2 cups", "1/2 tsp", "½ cup"). Vague word amounts
  // ("a pinch", "to taste", "a handful") are left as written.
  if (!/[0-9¼½¾⅓⅔⅕⅛]/.test(quantity)) return quantity;
  const { amount, rest } = parseLeadingAmount(quantity);
  if (amount === null) return quantity;
  const scaled = formatAmount(amount * multiplier);
  return rest ? `${scaled} ${rest}` : scaled;
}
