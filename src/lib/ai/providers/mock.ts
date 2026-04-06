/**
 * Mock AI Provider — deterministic fallback for all bounded AI surfaces.
 *
 * Used when:
 * 1. AI API keys are not configured
 * 2. AI calls fail (network, rate limit, invalid response)
 * 3. Testing / development
 *
 * Every response is grammatically correct and contextually relevant,
 * just not as warm or personalized as the real AI provider.
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

// ── Common substitution map ─────────────────────────────

const COMMON_SUBS: Record<string, { sub: string; note: string }> = {
  butter: { sub: "olive oil", note: "Use about 3/4 the amount" },
  cream: { sub: "coconut cream", note: "Works well in most sauces" },
  "sour cream": { sub: "Greek yogurt", note: "Similar tang and texture" },
  "lemon juice": {
    sub: "lime juice or white vinegar",
    note: "Start with half the amount",
  },
  "lime juice": { sub: "lemon juice", note: "Very close substitute" },
  cilantro: {
    sub: "flat-leaf parsley",
    note: "Won't replicate the flavor but works visually",
  },
  parsley: { sub: "cilantro or chives", note: "Any soft herb will work" },
  garlic: {
    sub: "garlic powder (1/4 tsp per clove)",
    note: "Add near end of cooking",
  },
  onion: { sub: "shallots or leeks", note: "Use a similar volume" },
  "soy sauce": {
    sub: "tamari or coconut aminos",
    note: "Coconut aminos is less salty",
  },
  "rice vinegar": {
    sub: "apple cider vinegar",
    note: "A touch sweeter, use slightly less",
  },
  honey: { sub: "maple syrup", note: "About the same amount" },
  egg: {
    sub: "flax egg (1 tbsp ground flax + 3 tbsp water)",
    note: "Let sit 5 minutes first",
  },
  milk: { sub: "oat milk or almond milk", note: "Oat milk is creamiest" },
  cheese: { sub: "nutritional yeast", note: "Use 2 tbsp per 1/4 cup cheese" },
};

// ── Explanation templates ───────────────────────────────

const EXPLAIN_TEMPLATES = [
  (main: string, side: string) =>
    `${side} brings a natural complement to ${main} — the flavors balance beautifully without competing.`,
  (main: string, side: string) =>
    `Pairing ${side} with ${main} creates a well-rounded plate with contrasting textures and flavors.`,
  (main: string, side: string) =>
    `${side} works alongside ${main} by adding variety to the plate while keeping the meal cohesive.`,
  (main: string, side: string) =>
    `The combination of ${main} and ${side} is a classic for a reason — complementary flavors and balanced nutrition.`,
];

// ── Win message templates ───────────────────────────────

const WIN_HEADLINES = [
  "Beautifully done!",
  "Nailed it!",
  "Plate perfection!",
  "You made it!",
  "Chef moment!",
  "That's a wrap!",
];

const WIN_MESSAGES = [
  (dish: string, sides: string[]) =>
    `Your ${dish} with ${sides[0] || "sides"} is ready to enjoy. Every cook makes the next one easier.`,
  (dish: string, sides: string[]) =>
    `${dish} paired with ${sides.join(" and ")} — a plate worth remembering.`,
  (dish: string) =>
    `Another ${dish} in the books. The more you cook, the more confident you get.`,
];

const STREAK_MESSAGES = [
  (n: number) => `${n}-day streak! You're building real cooking rhythm.`,
  (n: number) => `${n} days in a row — your kitchen confidence is showing.`,
];

// ── Reflection templates ────────────────────────────────

const STRENGTH_TEMPLATES: Array<(dish: string, cuisine: string) => string> = [
  (dish) => `You followed the full ${dish} recipe from start to finish.`,
  (dish) => `Great job completing ${dish} — that takes real focus.`,
  (_dish, cuisine) => `You're building ${cuisine} cooking confidence.`,
  () => "You stayed patient through the whole cook.",
  () => "The fact that you cooked tonight is already a win.",
];

const STREAK_STRENGTH = (n: number) =>
  `${n}-day cooking streak — real momentum building.`;

const SUGGESTION_TEMPLATES: Array<{
  type: "plating" | "ratio" | "technique" | "finish";
  message: (dish: string) => string;
}> = [
  {
    type: "plating",
    message: (dish: string) =>
      `Try plating ${dish} on a warm plate — it stays hot longer.`,
  },
  {
    type: "finish",
    message: () => "A squeeze of fresh lemon or lime can brighten any dish.",
  },
  {
    type: "technique",
    message: () =>
      "Let things rest for a minute before serving — flavors settle.",
  },
  {
    type: "ratio",
    message: () =>
      "Next time, try adding a small raw element for textural contrast.",
  },
  {
    type: "finish",
    message: () =>
      "A pinch of flaky salt right before serving adds a nice crunch.",
  },
  {
    type: "technique",
    message: () => "Taste as you go — your palate gets better with every cook.",
  },
];

// ── Mock Provider ───────────────────────────────────────

export class MockAIProvider implements AIProvider {
  async explainPairing(
    input: ExplainPairingInput,
  ): Promise<ExplainPairingResult> {
    const template =
      EXPLAIN_TEMPLATES[
        hash(input.mainDish + input.sideDish) % EXPLAIN_TEMPLATES.length
      ];
    return {
      explanation: template(input.mainDish, input.sideDish),
    };
  }

  async answerCookQuestion(
    input: CookQuestionInput,
  ): Promise<CookQuestionResult> {
    const q = input.question.toLowerCase();

    // Common cooking questions with deterministic answers
    if (q.includes("how long") || q.includes("how many minutes")) {
      return {
        answer: `For ${input.recipeName}, follow the timing in the current step. When in doubt, check for visual cues like color changes or bubbling.`,
        confidence: "medium",
      };
    }

    if (
      q.includes("substitute") ||
      q.includes("replace") ||
      q.includes("don't have")
    ) {
      return {
        answer: `Check the substitution helper for specific swap ideas. Most herbs and acids can be swapped freely; proteins and starches are less flexible.`,
        confidence: "medium",
      };
    }

    if (
      q.includes("too much") ||
      q.includes("too little") ||
      q.includes("mistake")
    ) {
      return {
        answer: `Don't worry — most cooking mistakes are recoverable. If it's too salty, add acid (lemon/vinegar). Too bland, add salt gradually. Too thick, add a splash of liquid.`,
        confidence: "medium",
      };
    }

    if (q.includes("done") || q.includes("ready") || q.includes("cooked")) {
      return {
        answer: `Look for the visual cues mentioned in the step. For most dishes, when it looks and smells right, it probably is. Trust your senses.`,
        confidence: "medium",
      };
    }

    return {
      answer: `For this step of ${input.recipeName}: ${input.currentStep.slice(0, 80)}. Follow the instructions as written and trust the process.`,
      confidence: "low",
    };
  }

  async suggestSubstitution(
    input: SubstitutionInput,
  ): Promise<SubstitutionResult> {
    const key = input.missingIngredient.toLowerCase();
    const match = COMMON_SUBS[key];

    if (match) {
      return {
        suggestion: `You can use ${match.sub} instead of ${input.missingIngredient}.`,
        substitute: match.sub,
        notes: match.note,
      };
    }

    return {
      suggestion: `If you can't find ${input.missingIngredient}, try checking what similar items you have. Many ingredients can be swapped within the same family.`,
      substitute: "a similar ingredient",
      notes: `Look for something with a similar texture and flavor profile to ${input.missingIngredient}.`,
    };
  }

  async generateWinMessage(input: WinMessageInput): Promise<WinMessageResult> {
    const headlineIdx = hash(input.dishName) % WIN_HEADLINES.length;
    let headline = WIN_HEADLINES[headlineIdx];

    if (input.isFirstCook) {
      headline = "Your first cook!";
    }

    const messageIdx =
      hash(input.dishName + input.cuisineFamily) % WIN_MESSAGES.length;
    let message = WIN_MESSAGES[messageIdx](input.dishName, input.sideDishes);

    if (input.currentStreak && input.currentStreak >= 3) {
      const streakIdx =
        hash(String(input.currentStreak)) % STREAK_MESSAGES.length;
      message = STREAK_MESSAGES[streakIdx](input.currentStreak);
    }

    return { headline, message };
  }

  async rewriteAppraisal(
    input: AppraisalRewriteInput,
  ): Promise<AppraisalRewriteResult> {
    // The deterministic appraisal is already good — just return it
    return { appraisal: input.deterministic };
  }

  async generateReflection(
    input: PostCookReflectionInput,
  ): Promise<PostCookReflectionResult> {
    const h = hash(input.dishName + input.cuisineFamily);

    // Build strengths (1-3)
    const strengths: string[] = [];

    strengths.push(
      STRENGTH_TEMPLATES[h % 2](input.dishName, input.cuisineFamily),
    );

    if (input.currentStreak && input.currentStreak >= 2) {
      strengths.push(STREAK_STRENGTH(input.currentStreak));
    } else {
      strengths.push(
        STRENGTH_TEMPLATES[2](input.dishName, input.cuisineFamily),
      );
    }

    if (input.isFirstCook) {
      strengths.push(
        "Your very first cook — this is the start of something great.",
      );
    }

    // Build suggestions (0-2, only if rating > 0 and not perfect 5)
    const suggestions: PostCookReflectionResult["nextTimeSuggestions"] = [];

    if (input.rating && input.rating < 5) {
      const idx1 = h % SUGGESTION_TEMPLATES.length;
      const s1 = SUGGESTION_TEMPLATES[idx1];
      suggestions.push({ type: s1.type, message: s1.message(input.dishName) });

      if (input.rating <= 3) {
        const idx2 = (h + 3) % SUGGESTION_TEMPLATES.length;
        if (idx2 !== idx1) {
          const s2 = SUGGESTION_TEMPLATES[idx2];
          suggestions.push({
            type: s2.type,
            message: s2.message(input.dishName),
          });
        }
      }
    }

    return {
      strengths: strengths.slice(0, 3),
      nextTimeSuggestions: suggestions.slice(0, 2),
      tone: "encouraging",
    };
  }
}

// ── Simple deterministic hash ───────────────────────────

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
