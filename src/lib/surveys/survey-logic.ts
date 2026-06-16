/**
 * Pure survey-runner logic (planning.md §6.2 W1), extracted so the branch /
 * selection / completion rules are unit-tested without rendering. The runner
 * and the multi-select components consume these.
 */

import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyStep,
} from "@/types/survey";

/**
 * Toggle a value in a multi-select set, honouring an exclusive none-option:
 * picking the none-option clears everything else; picking anything else clears
 * the none-option.
 */
export function toggleMultiValue(
  value: string[],
  v: string,
  noneValue?: string,
): string[] {
  if (noneValue && v === noneValue) {
    return value.includes(noneValue) ? [] : [noneValue];
  }
  const withoutNone = value.filter((x) => x !== noneValue);
  return withoutNone.includes(v)
    ? withoutNone.filter((x) => x !== v)
    : [...withoutNone, v];
}

/** The steps whose `showIf` branch predicate passes for the current answers. */
export function getVisibleSteps(
  steps: SurveyStep[],
  answers: SurveyAnswers,
): SurveyStep[] {
  return steps.filter((s) => !s.showIf || s.showIf(answers));
}

/**
 * Has a step been answered enough to advance? Interstitials, wheels (a default
 * is always present) and thumbs (rating is inherently optional) are always
 * satisfiable; `optional` steps are handled by the caller.
 */
export function isStepAnswered(
  step: SurveyStep,
  value: SurveyAnswerValue | undefined,
): boolean {
  switch (step.kind) {
    case "single":
    case "likert":
      return typeof value === "string" && value.length > 0;
    case "multi":
    case "chips":
    case "glyph-grid":
    case "photo-tiles":
      return Array.isArray(value) && value.length > 0;
    case "statements": {
      const map = (value ?? {}) as Record<string, boolean>;
      return step.statements.every((s) => s.id in map);
    }
    case "thumbs":
    case "wheel":
    case "interstitial":
    case "mirror":
      return true;
    default:
      return true;
  }
}
