import { recognitionResultSchema, type RecognitionResult } from "@/types/ai";

const SYSTEM_PROMPT = `You are a food recognition system for the Sous cooking app.
Given an image of food, identify what dish it is.

Rules:
- dishName: Be specific. "Butter Chicken" not just "curry"
- confidence: 0-1 where 1.0 is absolute certainty
- cuisine: The primary cuisine family
- isHomemade: true if it looks home-cooked, false if it looks restaurant-plated or from takeout
- alternates: Provide up to 3 alternative identifications, ordered by likelihood
  These become "correction chips" the user can tap if the main identification is wrong.

Be honest about confidence. If the image is blurry, dark, or ambiguous, lower the score.`;

/**
 * Identify a dish from a photo using OpenAI Vision API.
 * Returns structured recognition result with correction chip candidates.
 */
export async function recognizeDish(
  imageBase64: string,
): Promise<
  { success: true; data: RecognitionResult } | { success: false; error: string }
> {
  // Only attempt Vision API if OpenAI key is configured
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error:
        "Photo recognition is not configured yet. Please type your dish instead.",
    };
  }

  try {
    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: recognitionResultSchema,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: imageBase64,
            },
            {
              type: "text",
              text: "What dish is this? Identify it with confidence score and alternatives.",
            },
          ],
        },
      ],
    });

    return { success: true, data: result.object };
  } catch (error) {
    console.error("Food recognition error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to recognize dish",
    };
  }
}
