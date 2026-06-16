/**
 * Onboarding v2 profile (planning.md §6.2 W3). The structured result of the
 * onboarding survey, persisted under `sous-onboarding-v2`. Zod is the source of
 * truth; the flow also writes the existing `sous-preferences` /
 * `sous-effort-tolerance` keys (so the deck works unchanged) and, on the macro
 * branch, the personal-targets store.
 */

import { z } from "zod";

export const ONBOARDING_V2_STORAGE_KEY = "sous-onboarding-v2";

/** Captured age/height/weight from the macro-goal numeric branch (canonical
 *  units). Folded into a PersonalProfile by apply-onboarding. */
export const OnboardingNumericSchema = z
  .object({
    sex: z.enum(["female", "male"]),
    age: z.number(),
    heightCm: z.number(),
    weightKg: z.number(),
  })
  .strict();
export type OnboardingNumeric = z.infer<typeof OnboardingNumericSchema>;

export const OnboardingDietary = z.enum([
  "none",
  "vegetarian",
  "vegan",
  "pescatarian",
]);
export type OnboardingDietary = z.infer<typeof OnboardingDietary>;

export const OnboardingProfileV2Schema = z
  .object({
    version: z.literal(2),
    /** ISO timestamp the flow completed (stamped at persist time). */
    completedAt: z.string(),
    goalKey: z.string(),
    frictions: z.array(z.string()),
    /** Named booleans (budgetSensitive, decisionFatigue, wholeFoods, …). */
    flags: z.record(z.string(), z.boolean()),
    dietary: OnboardingDietary,
    cuisineLikes: z.array(z.string()),
    cuisineDislikes: z.array(z.string()),
    skill: z.string(),
    numeric: OnboardingNumericSchema.optional(),
    /** The clamped preference vector (also written to sous-preferences). */
    preferences: z.record(z.string(), z.number()),
    effortTolerance: z.enum(["minimal", "moderate", "willing"]),
  })
  .strict();
export type OnboardingProfileV2 = z.infer<typeof OnboardingProfileV2Schema>;
