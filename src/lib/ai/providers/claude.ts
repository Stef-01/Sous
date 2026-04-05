/**
 * Claude AI Provider — real Anthropic API integration for bounded AI surfaces.
 *
 * Uses Vercel AI SDK's generateObject() for schema-validated responses.
 * Falls back to MockAIProvider on any failure.
 */

import type {
  AIProvider,
  ExplainPairingInput,
  ExplainPairingResult,
  CookQuestionInput,
  CookQuestionResult,
  SubstitutionInput,
  SubstitutionResult,
  WinMessageInput,
  WinMessageResult,
  AppraisalRewriteInput,
  AppraisalRewriteResult,
  PostCookReflectionInput,
  PostCookReflectionResult,
} from "../contracts";
import {
  explainPairingResultSchema,
  cookQuestionResultSchema,
  substitutionResultSchema,
  winMessageResultSchema,
  appraisalRewriteResultSchema,
  postCookReflectionResultSchema,
} from "../contracts";
import { MockAIProvider } from "./mock";

const mock = new MockAIProvider();

async function callClaude<T>(
  schema: import("zod").ZodType<T>,
  system: string,
  prompt: string
): Promise<T> {
  const { generateObject } = await import("ai");
  const { anthropic } = await import("@ai-sdk/anthropic");

  const result = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema,
    system,
    prompt,
  });

  return result.object;
}

export class ClaudeAIProvider implements AIProvider {
  async explainPairing(input: ExplainPairingInput): Promise<ExplainPairingResult> {
    try {
      return await callClaude(
        explainPairingResultSchema,
        `You are a friendly culinary coach for the Sous cooking app.
Write a warm, natural explanation of why a side dish pairs well with a main dish.
Keep it under 200 characters. Be specific about flavors, textures, or nutrition.
Never use grading language. Speak like a knowledgeable friend.`,
        `Main dish: ${input.mainDish}
Side dish: ${input.sideDish}
Cuisine: ${input.cuisineFamily}
Pairing rationale: ${input.pairingReason}
Tags: ${input.tags.join(", ")}`
      );
    } catch (e) {
      console.error("Claude explainPairing failed, using fallback:", e);
      return mock.explainPairing(input);
    }
  }

  async answerCookQuestion(input: CookQuestionInput): Promise<CookQuestionResult> {
    try {
      return await callClaude(
        cookQuestionResultSchema,
        `You are a calm, supportive cooking guide for the Sous app.
Answer the user's cooking question briefly (under 300 chars).
Only use information from the recipe context provided — never guess.
If you're unsure, say so honestly and suggest they check the step instructions.
Set confidence to "high" if the answer is clearly in context, "medium" if inferred, "low" if uncertain.`,
        `Recipe: ${input.recipeName}
Current step: ${input.currentStep}
${input.previousStep ? `Previous step: ${input.previousStep}` : ""}
${input.nextStep ? `Next step: ${input.nextStep}` : ""}
${input.ingredients ? `Ingredients: ${input.ingredients.join(", ")}` : ""}

User's question: ${input.question}`
      );
    } catch (e) {
      console.error("Claude answerCookQuestion failed, using fallback:", e);
      return mock.answerCookQuestion(input);
    }
  }

  async suggestSubstitution(input: SubstitutionInput): Promise<SubstitutionResult> {
    try {
      return await callClaude(
        substitutionResultSchema,
        `You are a practical cooking helper for the Sous app.
Suggest a substitution for a missing ingredient.
Be specific: name the exact substitute and any quantity/technique adjustments.
Keep the suggestion concise. Prefer common pantry items.`,
        `Missing ingredient: ${input.missingIngredient}
Recipe: ${input.recipeName}
Cuisine: ${input.cuisineFamily}
${input.availableIngredients ? `Available: ${input.availableIngredients.join(", ")}` : ""}`
      );
    } catch (e) {
      console.error("Claude suggestSubstitution failed, using fallback:", e);
      return mock.suggestSubstitution(input);
    }
  }

  async generateWinMessage(input: WinMessageInput): Promise<WinMessageResult> {
    try {
      return await callClaude(
        winMessageResultSchema,
        `You are a celebratory cooking coach for the Sous app.
Generate a short, warm congratulatory message for completing a cook.
The headline should be punchy (under 60 chars). The message should be encouraging (under 200 chars).
Be specific to what was cooked. Never be generic. Never use exclamation marks more than once.
${input.isFirstCook ? "This is the user's very first cook — make it special!" : ""}
${input.currentStreak && input.currentStreak >= 3 ? `The user has a ${input.currentStreak}-day cooking streak — acknowledge it!` : ""}`,
        `Completed: ${input.dishName}
Sides: ${input.sideDishes.join(", ")}
Cuisine: ${input.cuisineFamily}
${input.cookDurationMinutes ? `Cook time: ${input.cookDurationMinutes} minutes` : ""}`
      );
    } catch (e) {
      console.error("Claude generateWinMessage failed, using fallback:", e);
      return mock.generateWinMessage(input);
    }
  }

  async rewriteAppraisal(input: AppraisalRewriteInput): Promise<AppraisalRewriteResult> {
    try {
      return await callClaude(
        appraisalRewriteResultSchema,
        `You are a plate evaluation coach for the Sous cooking app.
Rewrite a deterministic plate appraisal into warmer, more natural language.
Keep it under 100 characters. Lead with what's working.
Never use grading language or numbers. Speak like a supportive friend.`,
        `Current appraisal: ${input.deterministic}
Status: ${input.status}
Main: ${input.mainDish}
Sides: ${input.sideDishes.join(", ")}
Strengths: ${input.strengths.join("; ")}
${input.suggestion ? `Suggestion: ${input.suggestion}` : ""}`
      );
    } catch (e) {
      console.error("Claude rewriteAppraisal failed, using fallback:", e);
      return mock.rewriteAppraisal(input);
    }
  }

  async generateReflection(input: PostCookReflectionInput): Promise<PostCookReflectionResult> {
    try {
      return await callClaude(
        postCookReflectionResultSchema,
        `You are a supportive post-cook reflection coach for the Sous cooking app.
Generate a warm, encouraging reflection on a completed cook.

Rules:
- Always lead with strengths (1-3 things that went well)
- Max 2 gentle "next time" suggestions, only if the rating is below 5
- Suggestions must be type: "plating", "ratio", "technique", or "finish"
- Never use failure language, grading, or criticism
- Keep each string under 120 characters
- Tone is always "encouraging" — like a kind mentor, not a judge
- If it's the user's first cook, celebrate that milestone
- If there's a streak, acknowledge the momentum`,
        `Dish: ${input.dishName}
Cuisine: ${input.cuisineFamily}
${input.rating ? `Rating: ${input.rating}/5` : "No rating given"}
${input.note ? `User's note: ${input.note}` : "No note"}
${input.hasPhoto ? "User took a photo of their cook" : "No photo"}
Completed ${input.completedSteps} of ${input.totalSteps} steps
${input.isFirstCook ? "This is the user's FIRST cook ever!" : ""}
${input.currentStreak ? `Current streak: ${input.currentStreak} days` : ""}`
      );
    } catch (e) {
      console.error("Claude generateReflection failed, using fallback:", e);
      return mock.generateReflection(input);
    }
  }
}
