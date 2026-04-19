import { cravingIntentSchema, type CravingIntent } from "@/types/ai";

const SYSTEM_PROMPT = `You are a culinary intent parser for the Sous cooking app.
Given a user's freeform craving text, extract structured intent about what they want to eat.

Rules:
- dishName: Identify the most specific dish. "something cheesy" → "mac and cheese" or "grilled cheese"
- cuisineSignals: Infer cuisine families. "tikka masala" → ["indian", "south-asian"]
- isHomemade: Default true unless they mention takeout, delivery, restaurant, or leftovers
- effortTolerance: "quick" or "easy" → minimal. "I have time" → willing. Default moderate.
- healthOrientation: "light" or "salad" → health-forward. "comfort" or "fried" → indulgent. Default balanced.
- moodSignals: Capture vibes like comfort, quick, fancy, light, heavy, celebratory, lazy.

Be precise and concise. If the input is vague, make reasonable assumptions.`;

export type CravingParseSource = "llm" | "heuristic";

export type ParseCravingResult =
  | { success: true; data: CravingIntent; source: CravingParseSource }
  | { success: false; error: string };

/**
 * Parse a user's freeform craving text into structured intent.
 * Uses Claude with structured output (Zod schema) when API key is available.
 * Falls back to heuristic parser otherwise.
 *
 * `source` distinguishes structured model output from heuristics so callers
 * can log, debug, or surface a subtle signal when the LLM path failed.
 */
export async function parseCraving(text: string): Promise<ParseCravingResult> {
  // Only attempt AI parsing if Anthropic key is configured
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { generateObject } = await import("ai");
      const { anthropic } = await import("@ai-sdk/anthropic");

      const result = await generateObject({
        model: anthropic("claude-sonnet-4-20250514"),
        schema: cravingIntentSchema,
        system: SYSTEM_PROMPT,
        prompt: text,
      });

      return { success: true, data: result.object, source: "llm" };
    } catch (error) {
      console.error(
        "Craving parser AI error, falling back to heuristics:",
        error,
      );
    }
  }

  // Fallback: extract basic intent from text
  return {
    success: true,
    data: buildFallbackIntent(text),
    source: "heuristic",
  };
}

/**
 * Fallback intent extraction when AI is unavailable.
 * Uses simple heuristics to avoid blocking the user.
 */
function buildFallbackIntent(text: string): CravingIntent {
  const lower = text.toLowerCase().trim();

  // Try to extract dish name (use the whole text as dish name)
  const dishName = text.trim();

  // Simple cuisine detection
  const cuisineSignals: string[] = [];
  if (
    /curry|masala|tikka|biryani|dal|naan|paneer|tandoori|samosa|chutney|raita/.test(
      lower,
    )
  )
    cuisineSignals.push("indian");
  if (/sushi|ramen|tempura|teriyaki|miso|gyoza|udon|soba/.test(lower))
    cuisineSignals.push("japanese");
  if (/taco|burrito|enchilada|quesadilla|guacamole|salsa/.test(lower))
    cuisineSignals.push("mexican");
  if (/pasta|pizza|risotto|bruschetta|lasagna|gnocchi|pesto/.test(lower))
    cuisineSignals.push("italian");
  if (/kimchi|bibimbap|bulgogi|korean|japchae/.test(lower))
    cuisineSignals.push("korean");
  if (/pad thai|green curry|tom yum|thai/.test(lower))
    cuisineSignals.push("thai");
  if (/pho|banh mi|vietnamese/.test(lower)) cuisineSignals.push("vietnamese");
  if (/burger|steak|bbq|rib|hot dog|mac and cheese|meatloaf/.test(lower))
    cuisineSignals.push("american");
  if (/falafel|shawarma|hummus|kebab|gyros|tzatziki/.test(lower))
    cuisineSignals.push("mediterranean");
  if (
    /chicken|roast|grilled|baked|fish|salmon|pork|lamb|beef/.test(lower) &&
    cuisineSignals.length === 0
  ) {
    cuisineSignals.push("comfort-classic");
  }

  // Effort tolerance
  let effortTolerance: CravingIntent["effortTolerance"] = "moderate";
  if (/quick|fast|easy|lazy|no effort|simple|tired/.test(lower))
    effortTolerance = "minimal";
  if (/time|fancy|elaborate|scratch|proper/.test(lower))
    effortTolerance = "willing";

  // Health orientation
  let healthOrientation: CravingIntent["healthOrientation"] = "balanced";
  if (/light|healthy|salad|clean|low cal/.test(lower))
    healthOrientation = "health-forward";
  if (/comfort|fried|indulge|cheat|rich|creamy/.test(lower))
    healthOrientation = "indulgent";

  // Mood signals
  const moodSignals: string[] = [];
  if (/comfort/.test(lower)) moodSignals.push("comfort");
  if (/quick|fast/.test(lower)) moodSignals.push("quick");
  if (/fancy|date|special/.test(lower)) moodSignals.push("fancy");
  if (/light/.test(lower)) moodSignals.push("light");
  if (/heavy|filling/.test(lower)) moodSignals.push("heavy");

  return {
    dishName,
    cuisineSignals,
    isHomemade: !/takeout|delivery|restaurant|leftovers/.test(lower),
    effortTolerance,
    healthOrientation,
    moodSignals,
  };
}
