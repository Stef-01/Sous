/**
 * Slider math (E5) — pure mapping between a 0–1 track fraction and a stepped
 * value, so the PhysicsSlider's drag/keyboard logic is unit-testable without a
 * DOM. Snap-to-step is what gives the slider its magnetic integer stops.
 */

/** Map a 0–1 track fraction to the nearest stepped value within [min, max]. */
export function fractionToValue(
  fraction: number,
  min: number,
  max: number,
  step: number,
): number {
  const clamped = Math.min(1, Math.max(0, fraction));
  const raw = min + clamped * (max - min);
  const snapped = Math.round((raw - min) / step) * step + min;
  return Math.min(max, Math.max(min, snapped));
}

/** Map a value to its 0–1 track fraction (clamped). */
export function valueToFraction(
  value: number,
  min: number,
  max: number,
): number {
  if (max <= min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}
