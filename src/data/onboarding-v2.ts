/**
 * Onboarding v2 survey definition (planning.md §6.2 W3) — the narrative arc that
 * replaces the 6-question coach quiz, authored on the W1 survey kit:
 *   goal → (parent age) → friction → statements → (family statement) →
 *   dietary → cuisines → skill → (numeric branch) → [mirror handled by the flow]
 *
 * Every step is skippable; copy is forward-promise only (NO fabricated social
 * stats — D-22, enforced by the copy-safety test). Option `signals` aggregate
 * into the engine contract: cuisine/flavor seeds flow straight to the live deck
 * via the preference vector; flags / dietary / skill are captured for W5.
 */

import type { AgeBand } from "@/types/nutrition";
import type { SurveyDef, SurveyThumbRow } from "@/types/survey";

/** The eight glyph-backed mastery cuisines surfaced in the thumbs step. Each
 *  key is an engine cuisine family + a registered food glyph. */
export const ONBOARDING_MASTERY_CUISINES: ReadonlyArray<{
  key: string;
  label: string;
  glyph: string;
}> = [
  { key: "japanese", label: "Japanese", glyph: "sushi" },
  { key: "korean", label: "Korean", glyph: "pot" },
  { key: "thai", label: "Thai", glyph: "noodles" },
  { key: "chinese", label: "Chinese", glyph: "takeout" },
  { key: "indian", label: "Indian", glyph: "curry" },
  { key: "italian", label: "Italian", glyph: "pasta" },
  { key: "mexican", label: "Mexican", glyph: "taco" },
  { key: "mediterranean", label: "Mediterranean", glyph: "salad" },
];

const cuisineRows: SurveyThumbRow[] = ONBOARDING_MASTERY_CUISINES.map((c) => ({
  value: c.key,
  label: c.label,
  glyph: c.glyph,
  likeSignals: { preferenceUpdates: { [c.key]: 0.7 } },
  // dislike = a negative preference seed (immediate down-rank) + a suppressed
  // tag for the W5 hard exclusion.
  dislikeSignals: {
    preferenceUpdates: { [c.key]: -0.7 },
    suppressedTags: [c.key],
  },
}));

const AGE_BAND_OPTIONS: {
  value: string;
  label: string;
  band: AgeBand | null;
}[] = [
  { value: "solo", label: "Just me", band: null },
  { value: "adults", label: "Adults only", band: null },
  { value: "toddlers", label: "Toddlers (1–3)", band: "1-3" },
  { value: "little", label: "Little kids (4–8)", band: "4-8" },
  { value: "big", label: "Big kids (9–13)", band: "9-13" },
  { value: "teens", label: "Teens (14–18)", band: "14-18" },
  { value: "mixed", label: "Mixed ages", band: "mix" },
];

export const ONBOARDING_V2_DEF: SurveyDef = {
  id: "onboarding-v2",
  steps: [
    {
      kind: "single",
      id: "goal",
      title: "What are you cooking for?",
      subtitle: "This shifts what we put first — it can change any time.",
      options: [
        {
          value: "macros",
          label: "Hit my nutrition goals",
          glyph: "beef",
          signals: { preferenceUpdates: { protein: 0.3 } },
        },
        { value: "plan", label: "Plan my week", glyph: "pot" },
        {
          value: "simple",
          label: "Keep it super simple",
          glyph: "egg",
          subtext: "Few ingredients, fast",
          signals: { effortTolerance: "minimal" },
        },
        {
          value: "inspiration",
          label: "Last-minute inspiration",
          glyph: "taco",
        },
        { value: "family", label: "Feed my family", glyph: "soup" },
        {
          value: "longevity",
          label: "Live well for longer",
          glyph: "salad",
          signals: { preferenceUpdates: { vegetable: 0.3, fresh: 0.2 } },
        },
      ],
    },
    {
      kind: "single",
      id: "parentAge",
      title: "Who's at the table?",
      subtitle: "We'll balance tastes and turn on Parent Mode.",
      optional: true,
      showIf: (a) => a.goal === "family",
      options: AGE_BAND_OPTIONS.map((o) => ({
        value: o.value,
        label: o.label,
        glyph: o.band ? "soup" : "utensils",
        signals: { parentModeAgeBand: o.band },
      })),
    },
    {
      kind: "multi",
      id: "friction",
      title: "What gets in the way?",
      subtitle: "Pick all that ring true.",
      noneValue: "none",
      options: [
        {
          value: "time",
          label: "Never enough time",
          glyph: "flame",
          signals: {
            effortTolerance: "minimal",
            flags: { timeStrapped: true },
          },
        },
        {
          value: "tired",
          label: "Too tired after work",
          glyph: "soup",
          signals: { effortTolerance: "minimal", flags: { lowEnergy: true } },
        },
        {
          value: "hard",
          label: "Cooking feels hard",
          glyph: "utensils",
          signals: { flags: { needsHandholding: true } },
        },
        {
          value: "ideas",
          label: "I run out of ideas",
          glyph: "noodles",
          signals: { flags: { needsInspiration: true } },
        },
        {
          value: "scattered",
          label: "My recipes are everywhere",
          glyph: "bread",
          signals: { flags: { recipesScattered: true } },
        },
        {
          value: "choosing",
          label: "Hard to decide what to make",
          glyph: "taco",
          signals: { flags: { decisionFatigue: true } },
        },
        { value: "none", label: "None of these, honestly" },
      ],
    },
    {
      kind: "statements",
      id: "beliefs",
      title: "Sound familiar?",
      subtitle: "Swipe right for yes.",
      statements: [
        {
          id: "budget",
          text: "I waste money on food I don't end up cooking.",
          glyph: "takeout",
          signals: { flags: { budgetSensitive: true } },
        },
        {
          id: "searching",
          text: "I spend too long deciding what to make.",
          glyph: "soup",
          signals: { flags: { decisionFatigue: true } },
        },
        {
          id: "processed",
          text: "I'd like fewer processed ingredients.",
          glyph: "salad",
          signals: {
            flags: { wholeFoods: true },
            preferenceUpdates: { fresh: 0.3, vegetable: 0.2 },
          },
        },
      ],
    },
    {
      kind: "statements",
      id: "familyBelief",
      title: "And this one?",
      optional: true,
      showIf: (a) => a.goal === "family",
      statements: [
        {
          id: "kids",
          text: "Getting the kids to eat well is a daily battle.",
          glyph: "egg",
          signals: { flags: { kidStruggle: true } },
        },
      ],
    },
    {
      kind: "photo-tiles",
      id: "dietary",
      title: "Any way of eating?",
      subtitle: "We'll quietly respect this in every suggestion.",
      options: [
        { value: "none", label: "Everything", glyph: "beef" },
        {
          value: "vegetarian",
          label: "Vegetarian",
          glyph: "salad",
          signals: { preferenceUpdates: { vegetable: 0.4, protein: -0.2 } },
        },
        {
          value: "vegan",
          label: "Vegan",
          glyph: "noodles",
          signals: { preferenceUpdates: { vegetable: 0.5, protein: -0.3 } },
        },
        {
          value: "pescatarian",
          label: "Pescatarian",
          glyph: "fish",
          signals: { preferenceUpdates: { fish: 0.3 } },
        },
      ],
    },
    {
      kind: "thumbs",
      id: "cuisines",
      title: "Rate a few cuisines",
      subtitle: "Like, dislike, or skip — you'll still see new ones.",
      optional: true,
      rows: cuisineRows,
    },
    {
      kind: "single",
      id: "skill",
      title: "How do you roll in the kitchen?",
      subtitle: "There's no wrong answer — we match the effort to you.",
      options: [
        {
          value: "novice",
          label: "Just starting out",
          glyph: "egg",
          subtext: "We'll keep the steps tiny",
          signals: { effortTolerance: "minimal" },
        },
        {
          value: "comfortable",
          label: "I can follow a recipe",
          glyph: "bread",
        },
        {
          value: "confident",
          label: "I improvise happily",
          glyph: "flame",
          signals: { effortTolerance: "willing" },
        },
        {
          value: "advanced",
          label: "Teach me the hard stuff",
          glyph: "fish",
          subtext: "Bring on the technique",
          signals: { effortTolerance: "willing" },
        },
      ],
    },
    {
      kind: "interstitial",
      id: "numericIntro",
      title: "Your kitchen, your rules.",
      eyebrow: "A couple quick numbers",
      body: "The next steps help us size your day. You can edit them any time.",
      glyph: "flame",
      caption: "Stored privately, only used to size your targets.",
      showIf: (a) => a.goal === "macros",
    },
    {
      kind: "single",
      id: "sex",
      title: "Sex assigned at birth",
      subtitle: "Used only to size your calorie estimate.",
      showIf: (a) => a.goal === "macros",
      options: [
        { value: "female", label: "Female" },
        { value: "male", label: "Male" },
      ],
    },
    {
      kind: "wheel",
      id: "age",
      title: "Your age",
      min: 13,
      max: 100,
      step: 1,
      default: 30,
      unit: "yrs",
      privacyNote: "Stored privately.",
      showIf: (a) => a.goal === "macros",
    },
    {
      kind: "wheel",
      id: "height",
      title: "Your height",
      min: 130,
      max: 215,
      step: 1,
      default: 170,
      unit: "cm",
      units: [
        { value: "cm", label: "cm" },
        { value: "ftin", label: "ft/in" },
      ],
      privacyNote: "Stored privately.",
      showIf: (a) => a.goal === "macros",
    },
    {
      kind: "wheel",
      id: "weight",
      title: "Your weight",
      min: 40,
      max: 160,
      step: 1,
      default: 70,
      unit: "kg",
      units: [
        { value: "kg", label: "kg" },
        { value: "lb", label: "lb" },
      ],
      privacyNote: "Stored privately.",
      showIf: (a) => a.goal === "macros",
    },
  ],
};

/** Every author-written string in the def, flattened — the copy-safety test
 *  asserts each is claim-safe and stat-free (D-22). */
export function collectOnboardingStrings(def: SurveyDef): string[] {
  const out: string[] = [];
  for (const step of def.steps) {
    if ("title" in step && step.title) out.push(step.title);
    if ("subtitle" in step && step.subtitle) out.push(step.subtitle);
    if (step.kind === "interstitial") {
      if (step.eyebrow) out.push(step.eyebrow);
      if (step.body) out.push(step.body);
      if (step.caption) out.push(step.caption);
    }
    if ("options" in step) {
      for (const o of step.options) {
        out.push(o.label);
        if (o.subtext) out.push(o.subtext);
      }
    }
    if (step.kind === "thumbs") {
      for (const r of step.rows) out.push(r.label);
    }
    if (step.kind === "statements") {
      for (const s of step.statements) out.push(s.text);
    }
  }
  return out;
}
