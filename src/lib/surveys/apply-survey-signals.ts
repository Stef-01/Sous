/**
 * The single write path for survey signals — onboarding (W3) and pulses (W4)
 * both fold their answers to `AggregatedSignals` (via compute-survey-signals)
 * and persist them here. Splitting "compute" (pure) from "persist" (this file)
 * keeps the mapping fully unit-tested and gives consumers one place to read.
 *
 * Persists into the stores the engine already reads:
 *   - preference vector deltas → `sous-preferences` (clamped −1..1)
 *   - effort tolerance         → `sous-effort-tolerance`
 *   - named boolean flags      → `sous-signal-flags-v1` (NEW; W5 consumers read)
 *   - suppressed tags          → negative preference-vector seeds (so they reach
 *                                the pairing engine via the existing param)
 */

import type { AggregatedSignals } from "./compute-survey-signals";

const PREFERENCES_KEY = "sous-preferences";
const EFFORT_KEY = "sous-effort-tolerance";
const FLAGS_KEY = "sous-signal-flags-v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / unavailable — UX-acceptable in prototype
  }
}

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/** Read the named boolean flags set by surveys (budgetSensitive, wholeFoods,
 *  decisionFatigue, …). Pure read for W5 consumers. */
export function getSignalFlags(): Record<string, boolean> {
  return readJson<Record<string, boolean>>(FLAGS_KEY, {});
}

/**
 * Merge a survey's aggregated signals into the canonical stores. Idempotent-ish
 * (preferences accumulate then clamp; flags overwrite by key; effort is
 * last-wins). The deck reads the merged stores on its next mount.
 */
export function persistSurveySignals(signals: AggregatedSignals): void {
  // Preference vector — additive merge, then clamp.
  if (Object.keys(signals.preferenceUpdates).length > 0) {
    const prev = readJson<Record<string, number>>(PREFERENCES_KEY, {});
    const next = { ...prev };
    for (const [k, v] of Object.entries(signals.preferenceUpdates)) {
      next[k] = clamp((next[k] ?? 0) + v);
    }
    writeJson(PREFERENCES_KEY, next);
  }

  // Suppressed tags → strong negative seeds in the same vector (so they reach
  // pairing.suggest as exclusions via the existing userPreferences param).
  if (signals.suppressedTags.length > 0) {
    const prev = readJson<Record<string, number>>(PREFERENCES_KEY, {});
    const next = { ...prev };
    for (const tag of signals.suppressedTags) next[tag] = -1;
    writeJson(PREFERENCES_KEY, next);
  }

  // Effort is stored as a bare string (parity with onboarding's write).
  if (signals.effortTolerance && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(EFFORT_KEY, signals.effortTolerance);
    } catch {
      // ignore
    }
  }

  if (Object.keys(signals.flags).length > 0) {
    const prev = getSignalFlags();
    writeJson(FLAGS_KEY, { ...prev, ...signals.flags });
  }
}

export { computeSurveySignals } from "./compute-survey-signals";
export type { AggregatedSignals } from "./compute-survey-signals";
