/**
 * Score-to-color utilities for the pairing engine.
 * Used by tier badges and the heatmap visualizer.
 */

/**
 * Map a pairing score (0–100) to an HSL color string.
 * Low scores → red (hue ~0), high scores → green (hue ~120).
 */
export function scoreToHsl(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = Math.round((clamped / 100) * 120);
  const sat = 72;
  const light = 38 + Math.round((100 - clamped) * 0.15);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

/**
 * Map a tier name to a Tailwind-compatible color class set.
 */
export function tierToClasses(tier: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (tier) {
    case "excellent":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      };
    case "strong":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    case "good":
      return {
        bg: "bg-gray-50",
        text: "text-gray-600",
        border: "border-gray-200",
      };
    case "experimental":
      return {
        bg: "bg-slate-50",
        text: "text-slate-500",
        border: "border-slate-200",
      };
    case "low":
      return {
        bg: "bg-gray-50",
        text: "text-gray-400",
        border: "border-gray-100",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-500",
        border: "border-gray-200",
      };
  }
}
