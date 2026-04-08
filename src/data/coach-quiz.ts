/**
 * Coach Quiz — onboarding preference quiz.
 *
 * 5 questions covering cooking experience, flavor preferences, dietary needs,
 * favourite cuisines, and cooking goals. Answers produce a preference vector
 * that feeds the pairing engine's preference scorer.
 */

export type EffortTolerance = "minimal" | "moderate" | "willing";

export interface CoachQuizOption {
  label: string;
  emoji: string;
  /** Keys to update in the user's preference vector (values in -1 to 1 range). */
  preferenceUpdates: Record<string, number>;
  /** Optional effort level this answer implies. */
  effortLevel?: EffortTolerance;
}

export interface CoachQuizQuestion {
  key: string;
  category: string;
  categoryEmoji: string;
  question: string;
  options: CoachQuizOption[];
}

// ── Questions ─────────────────────────────────────────

export const coachQuizQuestions: CoachQuizQuestion[] = [
  {
    key: "experience",
    category: "Your style",
    categoryEmoji: "🍳",
    question: "How do you roll in the kitchen?",
    options: [
      {
        label: "Keep it simple, please",
        emoji: "🌱",
        preferenceUpdates: { "comfort-classic": 0.4, carb: 0.3 },
        effortLevel: "minimal",
      },
      {
        label: "I can follow a recipe",
        emoji: "📖",
        preferenceUpdates: { vegetable: 0.2 },
        effortLevel: "moderate",
      },
      {
        label: "I love experimenting",
        emoji: "🔥",
        preferenceUpdates: { spicy: 0.3, herby: 0.2 },
        effortLevel: "moderate",
      },
      {
        label: "I cook confidently",
        emoji: "👨‍🍳",
        preferenceUpdates: { rich: 0.3, creamy: 0.2 },
        effortLevel: "willing",
      },
    ],
  },
  {
    key: "flavor",
    category: "Flavor",
    categoryEmoji: "🌶️",
    question: "What flavors do you gravitate towards?",
    options: [
      {
        label: "Mild and comforting",
        emoji: "🤗",
        preferenceUpdates: { creamy: 0.6, warm: 0.4, "comfort-classic": 0.3 },
      },
      {
        label: "Fresh and bright",
        emoji: "🌿",
        preferenceUpdates: { fresh: 0.7, herby: 0.5, vegetable: 0.3 },
      },
      {
        label: "Bold and spicy",
        emoji: "🌶️",
        preferenceUpdates: { spicy: 0.8, rich: 0.3, crunchy: 0.3 },
      },
      {
        label: "Rich and indulgent",
        emoji: "🧀",
        preferenceUpdates: { rich: 0.7, creamy: 0.5, carb: 0.3 },
      },
    ],
  },
  {
    key: "diet",
    category: "Diet",
    categoryEmoji: "🥗",
    question: "Any food preferences we should know?",
    options: [
      {
        label: "No restrictions, bring it on",
        emoji: "🍖",
        preferenceUpdates: { protein: 0.3 },
      },
      {
        label: "Mostly plant-based",
        emoji: "🥦",
        preferenceUpdates: { vegetable: 0.8, fresh: 0.3, protein: -0.3 },
      },
      {
        label: "High protein focus",
        emoji: "💪",
        preferenceUpdates: { protein: 0.8, vegetable: 0.2 },
      },
      {
        label: "Light and healthy",
        emoji: "🥗",
        preferenceUpdates: { vegetable: 0.6, fresh: 0.4, carb: -0.3 },
      },
    ],
  },
  {
    key: "cuisine",
    category: "Cuisine",
    categoryEmoji: "🌍",
    question: "What cuisines make you happiest?",
    options: [
      {
        label: "Asian (Japanese, Korean, Thai)",
        emoji: "🍜",
        preferenceUpdates: {
          japanese: 0.8,
          korean: 0.7,
          thai: 0.7,
          indian: 0.2,
        },
      },
      {
        label: "Mediterranean & Italian",
        emoji: "🫒",
        preferenceUpdates: { mediterranean: 0.8, italian: 0.7 },
      },
      {
        label: "South Asian & Middle Eastern",
        emoji: "🫙",
        preferenceUpdates: { indian: 0.9, spicy: 0.3, mediterranean: 0.2 },
      },
      {
        label: "Americas & comfort food",
        emoji: "🌮",
        preferenceUpdates: { mexican: 0.7, "comfort-classic": 0.6 },
      },
    ],
  },
  {
    key: "goal",
    category: "Your goal",
    categoryEmoji: "🎯",
    question: "What are you cooking for right now?",
    options: [
      {
        label: "Quick wins on busy nights",
        emoji: "⚡",
        preferenceUpdates: { carb: 0.2 },
        effortLevel: "minimal",
      },
      {
        label: "Eating a bit healthier",
        emoji: "💚",
        preferenceUpdates: { vegetable: 0.4, fresh: 0.3 },
        effortLevel: "moderate",
      },
      {
        label: "Trying new flavors",
        emoji: "🗺️",
        preferenceUpdates: { spicy: 0.3, herby: 0.3 },
        effortLevel: "moderate",
      },
      {
        label: "Cooking something impressive",
        emoji: "✨",
        preferenceUpdates: { rich: 0.3, creamy: 0.2 },
        effortLevel: "willing",
      },
    ],
  },
];

// ── Preference computation ──────────────────────────────

export interface CoachQuizResult {
  /** Preference vector — keys are cuisine/flavor/nutrition tags, values -1..1. */
  preferences: Record<string, number>;
  /** Effort tolerance derived from experience + goal answers. */
  effortTolerance: EffortTolerance;
}

/**
 * Aggregate quiz answers into a preference vector and effort tolerance.
 * `answers` is a sparse array — null means the question was skipped.
 */
export function computePreferencesFromAnswers(
  answers: (number | null)[],
): CoachQuizResult {
  const combined: Record<string, number> = {};
  let effortTolerance: EffortTolerance = "moderate";

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (answer === null) continue;

    const question = coachQuizQuestions[i];
    if (!question) continue;
    const option = question.options[answer];
    if (!option) continue;

    for (const [key, value] of Object.entries(option.preferenceUpdates)) {
      combined[key] = (combined[key] ?? 0) + value;
    }

    if (option.effortLevel) {
      effortTolerance = option.effortLevel;
    }
  }

  // Clamp each value to -1..1
  const preferences: Record<string, number> = {};
  for (const [key, value] of Object.entries(combined)) {
    preferences[key] = Math.max(-1, Math.min(1, value));
  }

  return { preferences, effortTolerance };
}

// ── Human-readable summary helpers ─────────────────────

const CUISINE_LABELS: Record<string, string> = {
  japanese: "Japanese",
  korean: "Korean",
  thai: "Thai",
  indian: "Indian",
  mediterranean: "Mediterranean",
  italian: "Italian",
  mexican: "Mexican",
  "comfort-classic": "Comfort food",
};

const FLAVOR_LABELS: Record<string, string> = {
  spicy: "Spicy",
  fresh: "Fresh",
  creamy: "Creamy",
  rich: "Rich",
  herby: "Herby",
  crunchy: "Crunchy",
  warm: "Warm",
};

/** Return top N cuisine labels from a preference vector. */
export function topCuisines(
  preferences: Record<string, number>,
  n = 2,
): string[] {
  return Object.entries(CUISINE_LABELS)
    .filter(([key]) => (preferences[key] ?? 0) > 0)
    .sort(([a], [b]) => (preferences[b] ?? 0) - (preferences[a] ?? 0))
    .slice(0, n)
    .map(([, label]) => label);
}

/** Return top N flavor labels from a preference vector. */
export function topFlavors(
  preferences: Record<string, number>,
  n = 2,
): string[] {
  return Object.entries(FLAVOR_LABELS)
    .filter(([key]) => (preferences[key] ?? 0) > 0)
    .sort(([a], [b]) => (preferences[b] ?? 0) - (preferences[a] ?? 0))
    .slice(0, n)
    .map(([, label]) => label);
}
