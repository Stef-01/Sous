/**
 * Survey kit types (planning.md §6.2 W1).
 *
 * Zod is the source of truth; TS types are inferred (house rule). A SurveyDef
 * is a list of steps; the same runner drives onboarding (W3) and one-screen
 * pulses (W4). Each option carries a `signals` map that the runner aggregates
 * into the engine-facing contract (preference vector + effort + flags), the
 * same shape the existing coach quiz already feeds.
 */

import { z } from "zod";
import type { AgeBand } from "@/types/nutrition";

/** Age bands, kept in sync with the `AgeBand` union (compile-time checked). */
export const AgeBandSchema = z.enum(["1-3", "4-8", "9-13", "14-18", "mix"]);
// If `AgeBand` changes, this line fails to compile until the enum is updated.
const _ageBandParity: AgeBand = "mix" satisfies z.infer<typeof AgeBandSchema>;
void _ageBandParity;

/** What an answer/option does to the recommendation engine. Mirrors the coach
 *  quiz's `preferenceUpdates` + `effortLevel`, extended with boolean flags and
 *  tag suppression (negative cuisine/ingredient seeds). */
export const SurveySignalsSchema = z
  .object({
    /** Preference vector deltas, keys are cuisine/flavor/nutrition tags. */
    preferenceUpdates: z.record(z.string(), z.number()).optional(),
    /** Effort tolerance this answer implies. */
    effortTolerance: z.enum(["minimal", "moderate", "willing"]).optional(),
    /** Named booleans (e.g. budgetSensitive, decisionFatigue, whole-foods). */
    flags: z.record(z.string(), z.boolean()).optional(),
    /** Tags to push DOWN / exclude (disliked cuisines, ingredients). */
    suppressedTags: z.array(z.string()).optional(),
    /** Parent Mode age band (null = explicitly "no kids at the table"). */
    parentModeAgeBand: AgeBandSchema.nullable().optional(),
  })
  .strict();
export type SurveySignals = z.infer<typeof SurveySignalsSchema>;

/** A selectable option (single / multi / glyph-grid / photo-tiles / likert). */
export const SurveyOptionSchema = z
  .object({
    value: z.string(),
    label: z.string(),
    /** Registered food-glyph name (FoodGlyphName) for the leading icon. */
    glyph: z.string().optional(),
    /** Witty subtitle / "(Recommended)" caption shown under the label. */
    subtext: z.string().optional(),
    /** Pre-tints + groups the option under "Recommended for you". */
    recommended: z.boolean().optional(),
    /** Photo-tile / interstitial image — MUST be an existing food_images path. */
    image: z.string().optional(),
    signals: SurveySignalsSchema.optional(),
  })
  .strict();
export type SurveyOption = z.infer<typeof SurveyOptionSchema>;

/** A swipeable statement card (agree / disagree). */
export const SurveyStatementSchema = z
  .object({
    id: z.string(),
    text: z.string(),
    glyph: z.string().optional(),
    /** Signals applied when the user AGREES (swipes ✓). */
    signals: SurveySignalsSchema.optional(),
  })
  .strict();
export type SurveyStatement = z.infer<typeof SurveyStatementSchema>;

/** A thumbs-up/down row (three-state: like / dislike / unset). */
export const SurveyThumbRowSchema = z
  .object({
    value: z.string(),
    label: z.string(),
    glyph: z.string().optional(),
    likeSignals: SurveySignalsSchema.optional(),
    dislikeSignals: SurveySignalsSchema.optional(),
  })
  .strict();
export type SurveyThumbRow = z.infer<typeof SurveyThumbRowSchema>;

const StepBase = {
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  /** Allow advancing without answering (one-tap skip; rule 3/13). */
  optional: z.boolean().optional(),
};

export const SurveyStepSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("single"),
    ...StepBase,
    options: z.array(SurveyOptionSchema),
  }),
  z.object({
    kind: z.literal("multi"),
    ...StepBase,
    options: z.array(SurveyOptionSchema),
    /** Exclusive "none" option value that clears the others when picked. */
    noneValue: z.string().optional(),
  }),
  z.object({
    kind: z.literal("likert"),
    ...StepBase,
    options: z.array(SurveyOptionSchema),
  }),
  z.object({
    kind: z.literal("chips"),
    ...StepBase,
    options: z.array(SurveyOptionSchema),
    /** Exclusive "none" chip that clears the others when picked. */
    noneValue: z.string().optional(),
  }),
  z.object({
    kind: z.literal("statements"),
    id: z.string(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    optional: z.boolean().optional(),
    statements: z.array(SurveyStatementSchema),
  }),
  z.object({
    kind: z.literal("thumbs"),
    ...StepBase,
    rows: z.array(SurveyThumbRowSchema),
  }),
  z.object({
    kind: z.literal("photo-tiles"),
    ...StepBase,
    multi: z.boolean().optional(),
    options: z.array(SurveyOptionSchema),
  }),
  z.object({
    kind: z.literal("glyph-grid"),
    ...StepBase,
    /** `select` = positive pick; `dislike` = slash overlay + struck label. */
    mode: z.enum(["select", "dislike"]).default("select"),
    options: z.array(SurveyOptionSchema),
  }),
  z.object({
    kind: z.literal("wheel"),
    ...StepBase,
    min: z.number(),
    max: z.number(),
    step: z.number().default(1),
    default: z.number(),
    /** Canonical unit emitted (component may offer a unit toggle). */
    unit: z.string().optional(),
    units: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    privacyNote: z.string().optional(),
  }),
  z.object({
    kind: z.literal("interstitial"),
    id: z.string(),
    title: z.string(),
    eyebrow: z.string().optional(),
    body: z.string().optional(),
    glyph: z.string().optional(),
    caption: z.string().optional(),
  }),
  z.object({
    kind: z.literal("mirror"),
    id: z.string(),
    title: z.string(),
    cards: z.array(
      z.object({ glyph: z.string().optional(), text: z.string() }).strict(),
    ),
    ctaLabel: z.string(),
  }),
]);

/** The serializable step shape (zod source of truth). */
export type SurveyStepData = z.infer<typeof SurveyStepSchema>;
export type SurveyStepKind = SurveyStepData["kind"];

/** A possible answer value, by step kind. */
export type SurveyAnswerValue =
  | string // single, likert, wheel-as-string
  | string[] // multi, glyph-grid, photo-tiles(multi)
  | number // wheel
  | Record<string, boolean> // statements (id → agreed)
  | Record<string, "like" | "dislike">; // thumbs (row → verdict)

export type SurveyAnswers = Record<string, SurveyAnswerValue>;

/**
 * Authoring shape: the zod-validated data plus a runtime-only `showIf` branch
 * predicate (functions aren't part of the serializable schema). The runner
 * consumes `SurveyStep[]`.
 */
export type SurveyStep = SurveyStepData & {
  showIf?: (answers: SurveyAnswers) => boolean;
};

export interface SurveyDef {
  id: string;
  steps: SurveyStep[];
}
