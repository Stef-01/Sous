/**
 * Aggregate survey answers into the engine-facing signal bundle (planning.md
 * §6.2 W1). The runner emits this alongside the raw answers on completion;
 * onboarding (W3) and pulses (W4) both consume it. Pure + fully unit-tested.
 *
 * This is the seed of W5's `apply-survey-signals` — it intentionally produces
 * the same shape the existing coach quiz already feeds the engine (a clamped
 * preference vector + effort tolerance), plus boolean flags, tag suppression,
 * and the Parent Mode age band.
 */

import type { AgeBand } from "@/types/nutrition";
import type { SurveyAnswers, SurveySignals, SurveyStep } from "@/types/survey";

export interface AggregatedSignals {
  /** Preference vector deltas, clamped to -1..1 (matches the coach quiz). */
  preferenceUpdates: Record<string, number>;
  /** Last effort-tolerance signal wins (later steps refine earlier ones). */
  effortTolerance?: "minimal" | "moderate" | "willing";
  flags: Record<string, boolean>;
  /** De-duped tags to push down / exclude. */
  suppressedTags: string[];
  /** undefined = untouched; null = explicitly "no kids"; else the age band. */
  parentModeAgeBand?: AgeBand | null;
}

function mergeSignals(acc: AggregatedSignals, s: SurveySignals | undefined) {
  if (!s) return;
  if (s.preferenceUpdates) {
    for (const [k, v] of Object.entries(s.preferenceUpdates)) {
      acc.preferenceUpdates[k] = (acc.preferenceUpdates[k] ?? 0) + v;
    }
  }
  if (s.effortTolerance) acc.effortTolerance = s.effortTolerance;
  if (s.flags) {
    for (const [k, v] of Object.entries(s.flags)) acc.flags[k] = v;
  }
  if (s.suppressedTags) {
    for (const t of s.suppressedTags) {
      if (!acc.suppressedTags.includes(t)) acc.suppressedTags.push(t);
    }
  }
  if (s.parentModeAgeBand !== undefined) {
    acc.parentModeAgeBand = s.parentModeAgeBand;
  }
}

/** Fold a survey's answers down to one signal bundle. Order follows `steps`,
 *  so later steps override earlier effort/parent-mode signals. */
export function computeSurveySignals(
  steps: SurveyStep[],
  answers: SurveyAnswers,
): AggregatedSignals {
  const acc: AggregatedSignals = {
    preferenceUpdates: {},
    flags: {},
    suppressedTags: [],
  };

  for (const step of steps) {
    const answer = answers[step.id];
    if (answer === undefined) continue;

    switch (step.kind) {
      case "single":
      case "likert": {
        const opt = step.options.find((o) => o.value === answer);
        mergeSignals(acc, opt?.signals);
        break;
      }
      case "multi":
      case "chips":
      case "glyph-grid": {
        const values = Array.isArray(answer) ? answer : [];
        for (const v of values) {
          mergeSignals(acc, step.options.find((o) => o.value === v)?.signals);
        }
        break;
      }
      case "photo-tiles": {
        const values = Array.isArray(answer)
          ? answer
          : typeof answer === "string"
            ? [answer]
            : [];
        for (const v of values) {
          mergeSignals(acc, step.options.find((o) => o.value === v)?.signals);
        }
        break;
      }
      case "statements": {
        const map = answer as Record<string, boolean>;
        for (const st of step.statements) {
          if (map[st.id]) mergeSignals(acc, st.signals);
        }
        break;
      }
      case "thumbs": {
        const map = answer as Record<string, "like" | "dislike">;
        for (const row of step.rows) {
          const verdict = map[row.value];
          if (verdict === "like") mergeSignals(acc, row.likeSignals);
          else if (verdict === "dislike") mergeSignals(acc, row.dislikeSignals);
        }
        break;
      }
      // wheel / interstitial / mirror carry no per-option signals — the wheel's
      // numeric value is read straight from `answers` by the consumer (W3).
      default:
        break;
    }
  }

  for (const k of Object.keys(acc.preferenceUpdates)) {
    acc.preferenceUpdates[k] = Math.max(
      -1,
      Math.min(1, acc.preferenceUpdates[k]),
    );
  }
  return acc;
}
