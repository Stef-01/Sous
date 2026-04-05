import { z } from "zod";

/**
 * Phase 5 — AI Provider Contract
 *
 * Typed interface for all bounded AI surfaces.
 * Every AI call has a typed input, a Zod-validated output schema,
 * and a deterministic fallback in the mock provider.
 */

// ── Explain Pairing ─────────────────────────────────────

export const explainPairingInputSchema = z.object({
  mainDish: z.string(),
  sideDish: z.string(),
  cuisineFamily: z.string(),
  pairingReason: z.string(),
  tags: z.array(z.string()),
});

export type ExplainPairingInput = z.infer<typeof explainPairingInputSchema>;

export const explainPairingResultSchema = z.object({
  explanation: z.string().max(200),
});

export type ExplainPairingResult = z.infer<typeof explainPairingResultSchema>;

// ── Cook Q&A ────────────────────────────────────────────

export const cookQuestionInputSchema = z.object({
  question: z.string(),
  recipeName: z.string(),
  currentStep: z.string(),
  previousStep: z.string().optional(),
  nextStep: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
});

export type CookQuestionInput = z.infer<typeof cookQuestionInputSchema>;

export const cookQuestionResultSchema = z.object({
  answer: z.string().max(300),
  confidence: z.enum(["high", "medium", "low"]),
});

export type CookQuestionResult = z.infer<typeof cookQuestionResultSchema>;

// ── Substitution ────────────────────────────────────────

export const substitutionInputSchema = z.object({
  missingIngredient: z.string(),
  recipeName: z.string(),
  cuisineFamily: z.string(),
  availableIngredients: z.array(z.string()).optional(),
});

export type SubstitutionInput = z.infer<typeof substitutionInputSchema>;

export const substitutionResultSchema = z.object({
  suggestion: z.string(),
  substitute: z.string(),
  notes: z.string().optional(),
});

export type SubstitutionResult = z.infer<typeof substitutionResultSchema>;

// ── Win Message ─────────────────────────────────────────

export const winMessageInputSchema = z.object({
  dishName: z.string(),
  sideDishes: z.array(z.string()),
  cuisineFamily: z.string(),
  cookDurationMinutes: z.number().optional(),
  isFirstCook: z.boolean().optional(),
  currentStreak: z.number().optional(),
});

export type WinMessageInput = z.infer<typeof winMessageInputSchema>;

export const winMessageResultSchema = z.object({
  headline: z.string().max(60),
  message: z.string().max(200),
});

export type WinMessageResult = z.infer<typeof winMessageResultSchema>;

// ── Appraisal Rewrite ───────────────────────────────────

export const appraisalRewriteInputSchema = z.object({
  deterministic: z.string(),
  status: z.enum(["balanced", "good_start", "needs_improvement"]),
  strengths: z.array(z.string()),
  suggestion: z.string().optional(),
  mainDish: z.string(),
  sideDishes: z.array(z.string()),
});

export type AppraisalRewriteInput = z.infer<typeof appraisalRewriteInputSchema>;

export const appraisalRewriteResultSchema = z.object({
  appraisal: z.string().max(100),
});

export type AppraisalRewriteResult = z.infer<typeof appraisalRewriteResultSchema>;

// ── Post-Cook Reflection ───────────────────────────────

export const postCookReflectionInputSchema = z.object({
  dishName: z.string(),
  cuisineFamily: z.string(),
  rating: z.number().min(1).max(5).optional(),
  note: z.string().optional(),
  hasPhoto: z.boolean(),
  completedSteps: z.number(),
  totalSteps: z.number(),
  isFirstCook: z.boolean().optional(),
  currentStreak: z.number().optional(),
});

export type PostCookReflectionInput = z.infer<typeof postCookReflectionInputSchema>;

export const postCookReflectionResultSchema = z.object({
  strengths: z.array(z.string().max(120)).min(1).max(3),
  nextTimeSuggestions: z.array(
    z.object({
      type: z.enum(["plating", "ratio", "technique", "finish"]),
      message: z.string().max(120),
    })
  ).max(2),
  tone: z.literal("encouraging"),
});

export type PostCookReflectionResult = z.infer<typeof postCookReflectionResultSchema>;

// ── Provider Interface ──────────────────────────────────

export interface AIProvider {
  explainPairing(input: ExplainPairingInput): Promise<ExplainPairingResult>;
  answerCookQuestion(input: CookQuestionInput): Promise<CookQuestionResult>;
  suggestSubstitution(input: SubstitutionInput): Promise<SubstitutionResult>;
  generateWinMessage(input: WinMessageInput): Promise<WinMessageResult>;
  rewriteAppraisal(input: AppraisalRewriteInput): Promise<AppraisalRewriteResult>;
  generateReflection(input: PostCookReflectionInput): Promise<PostCookReflectionResult>;
}
