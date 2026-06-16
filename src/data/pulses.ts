/**
 * Pulse micro-surveys (planning.md §6.2 W4) — one-screen, ≤8 s, one-tap-skip
 * coach interactions that refine the recommendation signal over time. Each is a
 * single-step `SurveyDef` driven by the same W1 runner as onboarding; the
 * scheduler (`pulse-scheduler.ts`) decides which (if any) to surface, and
 * `apply-survey-signals.ts` is the write path on completion.
 *
 * Copy is forward/neutral and stat-free (D-22). Every option carries `signals`
 * so a completed pulse folds straight into the preference vector / flags.
 */

import { ONBOARDING_MASTERY_CUISINES } from "./onboarding-v2";
import type { SurveyDef, SurveyThumbRow } from "@/types/survey";

/** Where a pulse may surface. The scheduler maps app moments → anchors. */
export type PulseAnchor =
  | "win-close" // after a cook's Win screen closes
  | "deck-exhaust" // user swiped the whole deck
  | "plan-open" // opened the weekly plan
  | "visit"; // a fresh visit (3rd of the week)

export interface PulseDef {
  id: string;
  /** Short label for the volunteered "Tune my picks" list. */
  label: string;
  anchors: PulseAnchor[];
  def: SurveyDef;
}

const cuisineThumbRows: SurveyThumbRow[] = ONBOARDING_MASTERY_CUISINES.map(
  (c) => ({
    value: c.key,
    label: c.label,
    glyph: c.glyph,
    likeSignals: { preferenceUpdates: { [c.key]: 0.5 } },
    dislikeSignals: {
      preferenceUpdates: { [c.key]: -0.5 },
      suppressedTags: [c.key],
    },
  }),
);

export const PULSES: PulseDef[] = [
  {
    id: "felt-easier",
    label: "How the last cook felt",
    anchors: ["win-close"],
    def: {
      id: "pulse-felt-easier",
      steps: [
        {
          kind: "statements",
          id: "feltEasier",
          title: "Quick one",
          statements: [
            {
              id: "easier",
              text: "That felt easier than I expected.",
              glyph: "flame",
              signals: { flags: { feltEasier: true } },
            },
          ],
        },
      ],
    },
  },
  {
    id: "pacing",
    label: "Cooking step pace",
    anchors: ["win-close"],
    def: {
      id: "pulse-pacing",
      steps: [
        {
          kind: "single",
          id: "pacing",
          title: "Were the steps the right pace?",
          options: [
            {
              value: "more-detail",
              label: "I wanted more detail",
              glyph: "bread",
              signals: { flags: { verbose: true } },
            },
            { value: "just-right", label: "Just right", glyph: "salad" },
            {
              value: "too-much",
              label: "Too hand-holdy",
              glyph: "flame",
              signals: { flags: { terse: true } },
            },
          ],
        },
      ],
    },
  },
  {
    id: "budget",
    label: "Budget sensitivity",
    anchors: ["deck-exhaust", "visit"],
    def: {
      id: "pulse-budget",
      steps: [
        {
          kind: "statements",
          id: "budget",
          title: "Does this ring true?",
          statements: [
            {
              id: "budget",
              text: "I'd like to keep my grocery spend down.",
              glyph: "takeout",
              signals: { flags: { budgetSensitive: true } },
            },
          ],
        },
      ],
    },
  },
  {
    id: "cuisine-refresh",
    label: "Rate a few cuisines",
    anchors: ["deck-exhaust", "visit"],
    def: {
      id: "pulse-cuisine-refresh",
      steps: [
        {
          kind: "thumbs",
          id: "cuisines",
          title: "Still into these?",
          subtitle: "Like, dislike, or skip.",
          optional: true,
          rows: cuisineThumbRows,
        },
      ],
    },
  },
  {
    id: "dislike-sweep",
    label: "Anything to avoid",
    anchors: ["deck-exhaust"],
    def: {
      id: "pulse-dislike-sweep",
      steps: [
        {
          kind: "glyph-grid",
          id: "dislikes",
          title: "Anything you'd rather avoid lately?",
          subtitle: "Tap to cross out.",
          optional: true,
          mode: "dislike",
          options: [
            {
              value: "fish",
              label: "Seafood",
              glyph: "fish",
              signals: { suppressedTags: ["fish"] },
            },
            {
              value: "beef",
              label: "Red meat",
              glyph: "beef",
              signals: { suppressedTags: ["beef"] },
            },
            {
              value: "egg",
              label: "Eggs",
              glyph: "egg",
              signals: { suppressedTags: ["egg"] },
            },
            {
              value: "bread",
              label: "Gluten",
              glyph: "bread",
              signals: { suppressedTags: ["gluten"] },
            },
            {
              value: "spicy",
              label: "Very spicy",
              glyph: "curry",
              signals: { suppressedTags: ["spicy"] },
            },
            {
              value: "sweet",
              label: "Sweets",
              glyph: "dessert",
              signals: { suppressedTags: ["sweet"] },
            },
          ],
        },
      ],
    },
  },
  {
    id: "planning-frequency",
    label: "Meal-planning habit",
    anchors: ["plan-open", "visit"],
    def: {
      id: "pulse-planning-frequency",
      steps: [
        {
          kind: "likert",
          id: "planning",
          title: "How often do you plan meals ahead?",
          options: [
            {
              value: "never",
              label: "Never",
              signals: { flags: { planNudgesOff: true } },
            },
            { value: "rarely", label: "Rarely" },
            { value: "sometimes", label: "Sometimes" },
            {
              value: "often",
              label: "Often",
              signals: { flags: { plansAhead: true } },
            },
            {
              value: "always",
              label: "Always",
              signals: { flags: { plansAhead: true } },
            },
          ],
        },
      ],
    },
  },
  {
    id: "plan-consent",
    label: "Weekly plan nudges",
    anchors: ["plan-open"],
    def: {
      id: "pulse-plan-consent",
      steps: [
        {
          kind: "single",
          id: "planConsent",
          title: "Want gentle weekly meal-plan nudges?",
          options: [
            {
              value: "yes",
              label: "Yes, definitely",
              glyph: "pot",
              signals: { flags: { planNudgesOn: true } },
            },
            { value: "maybe", label: "Open to trying", glyph: "salad" },
            {
              value: "no",
              label: "No thanks",
              glyph: "utensils",
              signals: { flags: { planNudgesOff: true } },
            },
          ],
        },
      ],
    },
  },
];

export const PULSE_IDS = PULSES.map((p) => p.id);

/** All pulses eligible to surface at a given app moment. */
export function pulsesForAnchor(anchor: PulseAnchor): PulseDef[] {
  return PULSES.filter((p) => p.anchors.includes(anchor));
}

export function getPulse(id: string): PulseDef | undefined {
  return PULSES.find((p) => p.id === id);
}
