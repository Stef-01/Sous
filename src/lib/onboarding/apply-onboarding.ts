/**
 * Map a completed onboarding survey to the engine-facing result and persist it
 * (planning.md §6.2 W3). The pure `buildOnboardingResult` folds answers +
 * aggregated signals into the structured profile, the preference vector, the
 * Parent Mode band, the (macro-branch) personal profile + kcal target, and the
 * personalised mirror cards. `persistOnboardingResult` writes the localStorage
 * stores that already feed the deck; the Parent Mode + recordSignal writes that
 * need React hooks happen in the flow component.
 */

import { computePersonalTargets } from "@/lib/nutrition/personal-targets";
import type { PersonalProfile } from "@/lib/nutrition/personal-targets";
import { setPersonalProfile } from "@/lib/hooks/use-personal-targets";
import type { AggregatedSignals } from "@/lib/surveys/compute-survey-signals";
import {
  ONBOARDING_V2_STORAGE_KEY,
  type OnboardingDietary,
  type OnboardingNumeric,
  type OnboardingProfileV2,
} from "@/types/onboarding";
import type { AgeBand } from "@/types/nutrition";
import type { SurveyAnswers } from "@/types/survey";

/** The existing first-run gate key — reused so onboarding only shows once. */
export const ONBOARDING_DONE_KEY = "sous-coach-quiz-done";
const PREFERENCES_KEY = "sous-preferences";
const EFFORT_KEY = "sous-effort-tolerance";

export interface OnboardingResult {
  profile: OnboardingProfileV2;
  preferences: Record<string, number>;
  effortTolerance: "minimal" | "moderate" | "willing";
  /** null = explicitly no kids; AgeBand = turn Parent Mode on; undefined = untouched. */
  parentModeAgeBand: AgeBand | null | undefined;
  dietary: OnboardingDietary;
  /** Present only on the macro branch with valid numbers. */
  personalProfile?: PersonalProfile;
  kcalTarget?: number;
  mirrorCards: { glyph: string; text: string }[];
}

const VALID_DIETARY = new Set(["none", "vegetarian", "vegan", "pescatarian"]);

const DIETARY_LABEL: Record<OnboardingDietary, string> = {
  none: "balanced",
  vegetarian: "vegetarian",
  vegan: "vegan",
  pescatarian: "pescatarian",
};
const DIETARY_GLYPH: Record<OnboardingDietary, string> = {
  none: "beef",
  vegetarian: "salad",
  vegan: "noodles",
  pescatarian: "fish",
};

const GOAL_CARD: Record<string, { glyph: string; text: string }> = {
  macros: { glyph: "beef", text: "Suggestions tuned to your nutrition goals" },
  plan: { glyph: "pot", text: "A week of dinners, planned without the faff" },
  simple: { glyph: "egg", text: "Short, low-effort recipes float up first" },
  inspiration: {
    glyph: "taco",
    text: "Fresh ideas the moment you open the app",
  },
  family: { glyph: "soup", text: "Crowd-pleasers sized for your table" },
  longevity: { glyph: "salad", text: "Whole, colourful plates lead the deck" },
};

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}
function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function buildMirrorCards(opts: {
  goalKey: string;
  flags: Record<string, boolean>;
  dietary: OnboardingDietary;
  kcalTarget?: number;
}): { glyph: string; text: string }[] {
  const { goalKey, flags, dietary, kcalTarget } = opts;
  const cards: { glyph: string; text: string }[] = [];

  // Lead with the goal, then the strongest personalisations (the kid/Parent
  // Mode confirmation for families, the kcal target, dietary) so they survive
  // the 5-card cap, then the softer flag promises.
  if (GOAL_CARD[goalKey]) cards.push(GOAL_CARD[goalKey]);
  if (flags.kidStruggle) {
    cards.push({
      glyph: "soup",
      text: "Kid-friendly pairings, with Parent Mode on",
    });
  }
  if (kcalTarget) {
    cards.push({
      glyph: "beef",
      text: `Your day is sized to about ${kcalTarget} kcal`,
    });
  }
  if (dietary !== "none") {
    cards.push({
      glyph: DIETARY_GLYPH[dietary],
      text: `Every suggestion stays ${DIETARY_LABEL[dietary]}`,
    });
  }
  if (flags.budgetSensitive) {
    cards.push({
      glyph: "takeout",
      text: "Pantry-first picks to keep dinner affordable",
    });
  }
  if (flags.timeStrapped || flags.lowEnergy) {
    cards.push({
      glyph: "flame",
      text: "Quick weeknight ceilings on your ideas",
    });
  }
  if (flags.decisionFatigue) {
    cards.push({
      glyph: "utensils",
      text: "A calmer, shorter deck — less to weigh up",
    });
  }
  if (flags.wholeFoods) {
    cards.push({
      glyph: "salad",
      text: "Whole-ingredient recipes float to the top",
    });
  }
  if (cards.length === 0) {
    cards.push({
      glyph: "utensils",
      text: "A deck that learns what you love to cook",
    });
  }
  return cards.slice(0, 5);
}

/** Pure: fold a completed survey into the onboarding result. `completedAt` is
 *  injected (no impure clock here). */
export function buildOnboardingResult(
  answers: SurveyAnswers,
  signals: AggregatedSignals,
  completedAt: string,
): OnboardingResult {
  const goalKey = asString(answers.goal) ?? "inspiration";
  const frictions = (Array.isArray(answers.friction) ? answers.friction : [])
    .filter((f): f is string => typeof f === "string")
    .filter((f) => f !== "none");

  const dietaryRaw = Array.isArray(answers.dietary)
    ? answers.dietary[0]
    : undefined;
  const dietary: OnboardingDietary = VALID_DIETARY.has(dietaryRaw as string)
    ? (dietaryRaw as OnboardingDietary)
    : "none";

  const cuisinesMap = (answers.cuisines ?? {}) as Record<
    string,
    "like" | "dislike"
  >;
  const cuisineLikes = Object.keys(cuisinesMap).filter(
    (k) => cuisinesMap[k] === "like",
  );
  const cuisineDislikes = Object.keys(cuisinesMap).filter(
    (k) => cuisinesMap[k] === "dislike",
  );

  const skill = asString(answers.skill) ?? "comfortable";
  const effortTolerance = signals.effortTolerance ?? "moderate";

  let numeric: OnboardingNumeric | undefined;
  let personalProfile: PersonalProfile | undefined;
  let kcalTarget: number | undefined;
  const sex = asString(answers.sex);
  if (goalKey === "macros" && (sex === "female" || sex === "male")) {
    numeric = {
      sex,
      age: asNumber(answers.age, 30),
      heightCm: asNumber(answers.height, 170),
      weightKg: asNumber(answers.weight, 70),
    };
    personalProfile = { ...numeric, activity: "light", goal: "maintain" };
    kcalTarget = computePersonalTargets(personalProfile)?.kcal;
  }

  const profile: OnboardingProfileV2 = {
    version: 2,
    completedAt,
    goalKey,
    frictions,
    flags: signals.flags,
    dietary,
    cuisineLikes,
    cuisineDislikes,
    skill,
    numeric,
    preferences: signals.preferenceUpdates,
    effortTolerance,
  };

  return {
    profile,
    preferences: signals.preferenceUpdates,
    effortTolerance,
    parentModeAgeBand: signals.parentModeAgeBand,
    dietary,
    personalProfile,
    kcalTarget,
    mirrorCards: buildMirrorCards({
      goalKey,
      flags: signals.flags,
      dietary,
      kcalTarget,
    }),
  };
}

/** Write the localStorage stores that feed the deck + the personal-targets
 *  store (a plain function, not a hook). Parent Mode + recordSignal are written
 *  by the flow component because they need React hooks. */
export function persistOnboardingResult(result: OnboardingResult): void {
  try {
    localStorage.setItem(
      ONBOARDING_V2_STORAGE_KEY,
      JSON.stringify(result.profile),
    );
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(result.preferences));
    localStorage.setItem(EFFORT_KEY, result.effortTolerance);
    localStorage.setItem(ONBOARDING_DONE_KEY, "true");
  } catch {
    // localStorage unavailable — UX-acceptable in prototype.
  }
  if (result.personalProfile) {
    setPersonalProfile(result.personalProfile);
  }
}

/** Mark onboarding seen without persisting answers (early skip). */
export function markOnboardingSkipped(): void {
  try {
    localStorage.setItem(ONBOARDING_DONE_KEY, "true");
  } catch {
    // localStorage unavailable
  }
}
