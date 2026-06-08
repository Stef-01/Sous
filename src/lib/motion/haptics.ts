/**
 * W4 — a small haptic VOCABULARY. Instead of ad-hoc vibrate calls, components
 * speak in intents: select (light), commit (a confirmed action), success (a win),
 * warn (a soft caution). Silent fallback where the Vibration API is absent
 * (iOS Safari, desktop).
 */

export type HapticPattern = "select" | "commit" | "success" | "warn";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  select: 8,
  commit: 14,
  success: [10, 40, 16],
  warn: [22, 30, 22],
};

export function haptic(pattern: HapticPattern = "select"): void {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(PATTERNS[pattern]);
    }
  } catch {
    // Vibration API blocked or unavailable — silent.
  }
}
