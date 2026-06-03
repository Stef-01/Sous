/**
 * Therapeutic escalation — "food-first, not food-only" (Culinary Therapeutics
 * CT-4).
 *
 * Deterministic, claim-safe notes that remind a user when food alone is not
 * enough and a clinician should be in the loop. No diagnosis, no lab gating —
 * runs on the self-reported CareProfile only (lab/EHR inputs are founder gate
 * G3). Every string is verified claim-safe by the unit test.
 */

import type { CareProfile } from "@/types/care-profile";
import type { ConditionId } from "@/types/therapeutics";

export interface EscalationNote {
  conditionId: ConditionId | "general";
  title: string;
  body: string;
}

/** Always shown when any focus is active. */
export const GENERAL_ESCALATION: EscalationNote = {
  conditionId: "general",
  title: "Food-first, not food-only",
  body: "These are food-first ideas to sit alongside your care — not a replacement for your clinician's plan, medicines, or tests.",
};

const PER_CONDITION: Partial<Record<ConditionId, EscalationNote>> = {
  celiac: {
    conditionId: "celiac",
    title: "Celiac needs strict, certified gluten-free",
    body: "Celiac disease is managed with strict, lifelong gluten exclusion and certified gluten-free sourcing, guided by your clinician. Use the Avoid settings and check labels carefully.",
  },
  masld: {
    conditionId: "masld",
    title: "Liver targets are set with your clinician",
    body: "Guidelines link liver-fat improvement to gradual weight change (often more than 5%). Aim for sustainable changes and let your clinician set targets.",
  },
  "iron-deficiency": {
    conditionId: "iron-deficiency",
    title: "Low blood counts need a clinician",
    body: "Iron-smart meals help maintain levels, but a low blood count is checked and managed with your clinician — food alone may not be enough.",
  },
  "vitamin-d-insufficiency": {
    conditionId: "vitamin-d-insufficiency",
    title: "Bigger shortfalls need more than food",
    body: "Fortified foods and oily fish support vitamin D, but a marked shortfall is often addressed with a supplement or sunlight plan from your clinician.",
  },
  "calcium-insufficiency": {
    conditionId: "calcium-insufficiency",
    title: "Aim for absorbable calcium",
    body: "Choose dairy, well-fortified soy, and low-oxalate greens for calcium that the body takes up well; your clinician can advise if intake stays low.",
  },
  "magnesium-insufficiency": {
    conditionId: "magnesium-insufficiency",
    title: "Marked shortfalls need a clinician",
    body: "Magnesium-rich foods support intake, but a marked or symptomatic shortfall is checked and managed with your clinician.",
  },
  "ulcerative-colitis": {
    conditionId: "ulcerative-colitis",
    title: "Diet supports, it does not replace care",
    body: "A Mediterranean-leaning pattern supports general well-being, but no diet has consistently reduced adult flare rates — keep your gastroenterology team in the loop.",
  },
  crohns: {
    conditionId: "crohns",
    title: "Focus on nutrition sufficiency",
    body: "Use meals for nutrition sufficiency and symptom-aware texture; remission care stays with your gastroenterology team.",
  },
};

/**
 * Notes to surface for an active care profile: a per-condition note for each
 * selected condition, plus the general food-first reminder.
 */
export function escalationsForCare(care: CareProfile): EscalationNote[] {
  const notes: EscalationNote[] = [];
  for (const id of care.conditions) {
    const note = PER_CONDITION[id];
    if (note) notes.push(note);
  }
  if (care.conditions.length > 0 || care.avoid.length > 0) {
    notes.push(GENERAL_ESCALATION);
  }
  return notes;
}

/**
 * Education for "leaky gut" — a label, not a condition (the source report
 * shows it is not a formal diagnosis). Shown as guidance, never modeled as a
 * scored condition.
 */
export const LEAKY_GUT_EDUCATION: EscalationNote = {
  conditionId: "general",
  title: 'About "leaky gut"',
  body: '"Leaky gut" is not a formal medical condition. If you have ongoing gut symptoms, the useful path is to look at validated conditions — IBS, celiac disease, or IBD — with your clinician, rather than a general "leaky gut" label.',
};
