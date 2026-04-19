import { z } from "zod";

/**
 * Zod schemas for AI integration  -  source of truth for structured outputs.
 */

// ── Craving Parser (Claude) ───────────────────────────
export const cravingIntentSchema = z.object({
  dishName: z.string().describe("The identified main dish name"),
  cuisineSignals: z
    .array(z.string())
    .describe("Cuisine families detected, e.g. ['indian', 'south-asian']"),
  isHomemade: z
    .boolean()
    .describe("Whether the user implies they are cooking from scratch"),
  effortTolerance: z
    .enum(["minimal", "moderate", "willing"])
    .describe("How much cooking effort the user seems willing to put in"),
  healthOrientation: z
    .enum(["indulgent", "balanced", "health-forward"])
    .describe("The user's health orientation for this meal"),
  moodSignals: z
    .array(z.string())
    .describe("Mood/vibe signals: comfort, quick, fancy, light, heavy, etc."),
});

export type CravingIntent = z.infer<typeof cravingIntentSchema>;

// ── Food Recognition (OpenAI Vision) ──────────────────
export const recognitionResultSchema = z.object({
  dishName: z.string().describe("The identified dish name"),
  confidence: z.number().min(0).max(1).describe("Confidence score 0-1"),
  cuisine: z.string().describe("Detected cuisine family"),
  isHomemade: z
    .boolean()
    .describe("Whether the dish appears homemade vs restaurant/takeout"),
  alternates: z
    .array(z.string())
    .max(3)
    .describe("Up to 3 alternative dish identifications for correction chips"),
});

export type RecognitionResult = z.infer<typeof recognitionResultSchema>;
