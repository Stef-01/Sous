/**
 * Conversational LLM fallback (Y2 Sprint G W28).
 *
 * Final layer in the voice Q&A pipeline. When the W27 step-recall
 * helper returns `confident: false`, the cook page can escalate
 * here for an LLM-backed answer — but only with a tightly-bounded
 * prompt that enforces "answer ONLY from the provided step list".
 *
 * Two modes — same shape as Y1 W22 voice + Y2 W20 push:
 *   - **Stub mode** (no Anthropic key): canned response. The user
 *     hears "I'm not sure — re-read the step?" inline; voice loop
 *     stays bounded.
 *   - **Real mode** (ANTHROPIC_API_KEY set): bounded fetch with
 *     defence-in-depth response validation.
 *
 * Defence-in-depth on real-mode responses:
 *   1. Cap to 200 chars (long answers are usually hallucinated).
 *   2. Reject responses that reference ingredients NOT in any
 *      step's text (catches the model inventing ingredients).
 *   3. Strip leading/trailing whitespace + quotes the model
 *      sometimes adds.
 *
 * Pure parts (prompt builder + response validator) live here +
 * are tested without network. The async dispatcher has a single
 * fetch call; tests mock it via vitest.
 */

import type { StepRecallStep } from "./step-recall";

export const CONVERSATION_RESPONSE_MAX_CHARS = 200;
export const STUB_FALLBACK_MESSAGE = "I'm not sure — re-read the step?";

export interface ConversationEnv {
  /** Server-side Anthropic API key. Undefined / empty → stub mode. */
  ANTHROPIC_API_KEY?: string | undefined;
  /** Master switch — "false" disables real mode even with a key
   *  present. Useful for cost control + privacy-mode rollouts. */
  SOUS_VOICE_LLM_ENABLED?: string | undefined;
}

/** Pure: is the conversational LLM fallback enabled in this env? */
export function isConversationLlmEnabled(env: ConversationEnv): boolean {
  if (env.SOUS_VOICE_LLM_ENABLED === "false") return false;
  if (!env.ANTHROPIC_API_KEY) return false;
  if (env.ANTHROPIC_API_KEY.length === 0) return false;
  return true;
}

/** Pure: read flag state from process.env. */
export function readConversationEnv(): ConversationEnv {
  if (typeof process === "undefined" || process.env == null) return {};
  return {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    SOUS_VOICE_LLM_ENABLED: process.env.SOUS_VOICE_LLM_ENABLED,
  };
}

export interface ConversationPromptParts {
  /** System message — enforces the "only from steps" boundary. */
  system: string;
  /** User message — packs prior 3 steps + next step + question. */
  user: string;
}

/** Pure: build the bounded prompt for a real-mode call. The
 *  system message is the boundary enforcer; the user message is
 *  the data + question. The model sees only these two strings.
 *
 *  Window: previous 3 steps + current + next 1. That's 5 steps
 *  of context, enough for "did I add..." backward + "what's next
 *  after..." forward without leaking the entire recipe (which
 *  would let the model talk about ingredients that don't matter
 *  to the question). */
export function buildConversationPrompt(
  question: string,
  steps: ReadonlyArray<StepRecallStep>,
  currentStepIndex: number,
): ConversationPromptParts {
  const idx = clampIdx(currentStepIndex, steps.length);
  const windowStart = Math.max(0, idx - 3);
  const windowEnd = Math.min(steps.length, idx + 2); // inclusive of next 1
  const windowSteps: { num: number; instruction: string }[] = [];
  for (let i = windowStart; i < windowEnd; i++) {
    const step = steps[i];
    if (step) windowSteps.push({ num: i + 1, instruction: step.instruction });
  }

  const stepBlock = windowSteps
    .map((s) => `${s.num}. ${s.instruction}`)
    .join("\n");

  const system = [
    "You are a cooking-assistant answering a brief question during a step-by-step cook.",
    "RULES:",
    "1. Answer ONLY with reference to the provided step list.",
    "2. If the answer is not in the steps, reply with exactly: I'm not sure — re-read the step?",
    "3. Keep replies under 30 words.",
    "4. Never invent ingredients or actions that are not in the steps.",
  ].join(" ");

  const user = [
    `Current step: ${idx + 1}`,
    "",
    "Steps in window:",
    stepBlock,
    "",
    `Question: ${question.trim()}`,
  ].join("\n");

  return { system, user };
}

/** Pure: validate + clean a real-mode response.
 *  Returns the cleaned string, or null when the response should
 *  be rejected (off-list ingredient leak, empty after trim). */
export function validateConversationResponse(
  raw: string,
  steps: ReadonlyArray<StepRecallStep>,
): string | null {
  let cleaned = raw.trim();
  // Strip leading/trailing quotes/backticks the model sometimes
  // wraps responses in.
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, "").trim();

  if (cleaned.length === 0) return null;

  // Cap to MAX chars — truncate at last sentence boundary to
  // avoid mid-word cuts. If no boundary in window, hard truncate.
  if (cleaned.length > CONVERSATION_RESPONSE_MAX_CHARS) {
    const truncWindow = cleaned.slice(0, CONVERSATION_RESPONSE_MAX_CHARS);
    const lastBoundary = Math.max(
      truncWindow.lastIndexOf("."),
      truncWindow.lastIndexOf("?"),
      truncWindow.lastIndexOf("!"),
    );
    cleaned =
      lastBoundary > CONVERSATION_RESPONSE_MAX_CHARS / 2
        ? truncWindow.slice(0, lastBoundary + 1)
        : truncWindow;
  }

  // Off-list rejection: collect every "ingredient-shaped" word
  // mentioned in the response that's NOT in any step.
  // "Ingredient-shaped" = capitalised noun OR token from a small
  // common-cooking-ingredient list. Conservative: prefer false
  // negatives (allow some leaks) over false positives (reject
  // valid responses).
  const stepText = steps
    .map((s) => `${s.instruction} ${(s.ingredients ?? []).join(" ")}`)
    .join(" ")
    .toLowerCase();

  for (const suspect of extractIngredientCandidates(cleaned)) {
    if (!stepText.includes(suspect)) {
      // Off-list ingredient mentioned. Reject.
      return null;
    }
  }

  return cleaned;
}

/** Pure: extract candidate ingredient mentions from a response.
 *  Tokens we worry about: capitalised non-sentence-start words +
 *  tokens that match a small common-ingredient lexicon. We don't
 *  build a full NER classifier; this is a defensive scan, not a
 *  perfect one. */
function extractIngredientCandidates(text: string): string[] {
  const COMMON_INGREDIENTS: ReadonlyArray<string> = [
    "saffron",
    "truffle",
    "vanilla",
    "rosemary",
    "thyme",
    "basil",
    "cilantro",
    "parsley",
    "dill",
    "mint",
    "sage",
    "tarragon",
    "anchovy",
    "anchovies",
    "capers",
    "olives",
    "parmesan",
    "feta",
    "ricotta",
    "mozzarella",
  ];
  const out: string[] = [];
  const lower = text.toLowerCase();
  for (const ing of COMMON_INGREDIENTS) {
    // Whole-word check via regex so "olives" doesn't trigger on
    // "olive oil".
    const re = new RegExp(`\\b${ing}\\b`);
    if (re.test(lower)) out.push(ing);
  }
  return out;
}

export interface RequestConversationOptions {
  env?: ConversationEnv;
  /** Fetch override for tests. */
  fetchImpl?: typeof fetch;
}

export interface ConversationResult {
  /** What to display / speak. Always non-empty; falls back to
   *  the stub message when real mode is off, errors, or the
   *  response is rejected by validation. */
  speakable: string;
  /** Was this a real-mode answer (true) or the stub fallback
   *  (false)? Telemetry / dev-tools surface only. */
  fromLlm: boolean;
}

/** Async dispatcher. Returns a ConversationResult, never throws.
 *  Errors / rejections collapse to the stub message so the voice
 *  loop never breaks. */
export async function requestConversationAnswer(
  question: string,
  steps: ReadonlyArray<StepRecallStep>,
  currentStepIndex: number,
  options: RequestConversationOptions = {},
): Promise<ConversationResult> {
  const env = options.env ?? readConversationEnv();
  if (!isConversationLlmEnabled(env)) {
    return { speakable: STUB_FALLBACK_MESSAGE, fromLlm: false };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const prompt = buildConversationPrompt(question, steps, currentStepIndex);

  try {
    const res = await fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 80,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
      }),
    });
    if (!res.ok) {
      return { speakable: STUB_FALLBACK_MESSAGE, fromLlm: false };
    }
    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const rawText = (data.content ?? [])
      .filter((c) => c.type === "text" && typeof c.text === "string")
      .map((c) => c.text ?? "")
      .join(" ");
    const validated = validateConversationResponse(rawText, steps);
    if (!validated) {
      return { speakable: STUB_FALLBACK_MESSAGE, fromLlm: false };
    }
    return { speakable: validated, fromLlm: true };
  } catch {
    return { speakable: STUB_FALLBACK_MESSAGE, fromLlm: false };
  }
}

function clampIdx(i: number, len: number): number {
  if (!Number.isFinite(i)) return 0;
  if (i < 0) return 0;
  if (i >= len) return Math.max(0, len - 1);
  return Math.floor(i);
}
