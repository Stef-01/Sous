/**
 * Step-recall intent (Y2 Sprint G W27).
 *
 * Bounded Q&A over the recipe's own step list. The user can ask
 * "did I add salt?" / "what's next after the blooming step?" /
 * "should I add olive oil?" while cooking, and this helper
 * returns a speakable answer drawn from the step list itself —
 * never an open-ended LLM response (the W28 LLM fallback is
 * gated behind this helper's "I'm not sure" path).
 *
 * Three intent variants:
 *   - "did-i" / "have-i" / "already": look BACKWARD through the
 *     prior steps for a matching ingredient or action.
 *   - "what-next" / "after": look FORWARD from the current step
 *     to find the next-step / step-after-X reference.
 *   - "should-i-add" / "do-i-need": match the asked-about
 *     ingredient against the union of prior + future step text.
 *
 * Pure / dependency-free / deterministic.
 */

export type StepRecallIntentKind =
  | "did-i"
  | "what-next"
  | "should-i"
  | "unknown";

export interface StepRecallIntent {
  kind: StepRecallIntentKind;
  /** The token/keyword the user is asking about — extracted from
   *  the utterance after the intent prefix. "did i add salt" →
   *  "salt". Empty string when no clear keyword. */
  keyword: string;
  /** Optional anchor for "what's next AFTER X" — the X.
   *  Only set on what-next intents. */
  afterKeyword?: string;
}

export interface StepRecallStep {
  /** The step text the user heard / read. */
  instruction: string;
  /** Optional ingredient list scoped to this step (W27 the
   *  catalog-side data isn't normalised this way yet, so most
   *  callers will leave this undefined and the matcher will
   *  fall back to the instruction text). */
  ingredients?: ReadonlyArray<string>;
}

export interface StepRecallAnswer {
  /** What to speak / display to the user. Always non-empty —
   *  even fallback returns "I'm not sure" rather than null. */
  speakable: string;
  /** True when the helper has high confidence in the answer.
   *  False when the answer is the "I'm not sure — re-read the
   *  step?" fallback. The W28 conversational-LLM layer reads
   *  this flag to decide whether to escalate. */
  confident: boolean;
}

/** Pure: classify a user utterance into one of the three step-
 *  recall intent kinds, plus extract the keyword(s).
 *
 *  Returns `kind: "unknown"` for anything that doesn't match
 *  any of the three patterns. Caller falls through to the
 *  generic intent parser (parse-intent.ts) when this returns
 *  unknown. */
export function classifyStepRecallIntent(utterance: string): StepRecallIntent {
  const text = utterance.toLowerCase().trim();
  if (text.length === 0) return { kind: "unknown", keyword: "" };

  // "what's next after the blooming step" → kind=what-next, afterKeyword=blooming
  // Tested both with and without "the" + "step".
  const afterMatch = text.match(
    /(?:what(?:'s| is)? next|what comes? next|what about) after (?:the )?(.+?)(?:\s+step)?$/,
  );
  if (afterMatch && afterMatch[1]) {
    return {
      kind: "what-next",
      keyword: afterMatch[1].trim(),
      afterKeyword: afterMatch[1].trim(),
    };
  }

  if (
    /^(what(?:'s| is)? next|what comes? next|next step|what now)\b/.test(text)
  ) {
    return { kind: "what-next", keyword: "" };
  }

  // "did I add salt" / "have I added salt" / "have I done X yet"
  const didMatch = text.match(
    /^(?:did i|have i|did we|have we)(?:\s+(?:already|yet))?\s+(?:add(?:ed)?|put(?:\s+in)?|use(?:d)?|do(?:ne)?|mix(?:ed)?(?:\s+in)?)\s+(?:the\s+|some\s+|any\s+)?(.+?)(?:\s+yet)?\??$/,
  );
  if (didMatch && didMatch[1]) {
    return { kind: "did-i", keyword: didMatch[1].trim() };
  }

  // "should I add salt" / "do I need to add salt" / "do I add salt now"
  const shouldMatch = text.match(
    /^(?:should i|do i(?:\s+need to|\s+have to)?|am i supposed to)\s+(?:add|put(?:\s+in)?|use|mix(?:\s+in)?)\s+(?:the\s+|some\s+|any\s+)?(.+?)(?:\s+now|\s+yet)?\??$/,
  );
  if (shouldMatch && shouldMatch[1]) {
    return { kind: "should-i", keyword: shouldMatch[1].trim() };
  }

  return { kind: "unknown", keyword: "" };
}

/** Pure: case-insensitive substring search in a step's
 *  instruction + ingredients list. Also tries simple English
 *  morphology stems on the keyword so "blooming step" matches
 *  a recipe that says "bloom the spices". */
function stepMentions(step: StepRecallStep, keyword: string): boolean {
  if (keyword.length === 0) return false;
  const k = keyword.toLowerCase();
  const haystack = (
    step.instruction +
    " " +
    (step.ingredients ?? []).join(" ")
  ).toLowerCase();
  if (haystack.includes(k)) return true;

  // Stem fallback — strip trailing "ing"/"ed"/"s" once + retry.
  // Only applies to stems with >= 3 chars to avoid matching
  // tiny common-word prefixes against everything.
  for (const stem of keywordStems(k)) {
    if (haystack.includes(stem)) return true;
  }
  return false;
}

/** Pure: simple English morphology — return possible stems for
 *  a keyword. "blooming" → ["bloom"]; "added" → ["add"];
 *  "tomatoes" → ["tomato"]. Conservative: no double-suffix
 *  stripping, no Porter stemmer — just enough to bridge the
 *  spoken-vs-written gap for the W27 step-recall use case. */
function keywordStems(keyword: string): string[] {
  const out: string[] = [];
  if (keyword.endsWith("ing") && keyword.length > 5) {
    out.push(keyword.slice(0, -3));
  }
  if (keyword.endsWith("ed") && keyword.length > 4) {
    out.push(keyword.slice(0, -2));
  }
  if (keyword.endsWith("es") && keyword.length > 4) {
    out.push(keyword.slice(0, -2));
  } else if (keyword.endsWith("s") && keyword.length > 3) {
    out.push(keyword.slice(0, -1));
  }
  return out;
}

/** Pure: speakable answer for a step-recall question.
 *
 *  - did-i: walk backwards from currentStepIndex - 1; if any
 *    prior step mentions the keyword, answer "Yes — step N said
 *    'X'." Otherwise "Not yet — that comes later" or "I'm not
 *    sure" depending on whether a future step mentions it.
 *  - what-next (no anchor): describe the upcoming step.
 *  - what-next (with anchor): find the anchor step then answer
 *    with the step that follows it.
 *  - should-i: combine did-i + what-next; if mentioned in a
 *    prior step → "you already added X in step N"; if
 *    mentioned in a future step → "yes, in step M"; else "I'm
 *    not sure".
 *
 *  Always returns a non-empty speakable. The `confident` flag
 *  tells the W28 layer when to escalate to the LLM fallback. */
export function recallFromSteps(
  steps: ReadonlyArray<StepRecallStep>,
  intent: StepRecallIntent,
  currentStepIndex: number,
): StepRecallAnswer {
  const fallback: StepRecallAnswer = {
    speakable: "I'm not sure — re-read the step?",
    confident: false,
  };

  if (steps.length === 0) return fallback;
  if (intent.kind === "unknown") return fallback;

  const idx = clampStepIndex(currentStepIndex, steps.length);

  if (intent.kind === "did-i") {
    if (intent.keyword.length === 0) return fallback;
    // Look BACKWARD through prior steps (inclusive of current).
    for (let i = idx; i >= 0; i--) {
      const step = steps[i];
      if (step && stepMentions(step, intent.keyword)) {
        return {
          speakable: `Yes — step ${i + 1} mentions ${intent.keyword}.`,
          confident: true,
        };
      }
    }
    // Not found in prior; check forward to inform the user.
    for (let i = idx + 1; i < steps.length; i++) {
      const step = steps[i];
      if (step && stepMentions(step, intent.keyword)) {
        return {
          speakable: `Not yet — that comes in step ${i + 1}.`,
          confident: true,
        };
      }
    }
    return fallback;
  }

  if (intent.kind === "what-next") {
    if (intent.afterKeyword) {
      // Find the anchor step — first step matching the keyword.
      let anchorIdx = -1;
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step && stepMentions(step, intent.afterKeyword)) {
          anchorIdx = i;
          break;
        }
      }
      if (anchorIdx < 0) return fallback;
      const nextIdx = anchorIdx + 1;
      if (nextIdx >= steps.length) {
        return {
          speakable: `Step ${anchorIdx + 1} is the last one.`,
          confident: true,
        };
      }
      const nextStep = steps[nextIdx];
      if (!nextStep) return fallback;
      return {
        speakable: `After that, step ${nextIdx + 1}: ${nextStep.instruction}`,
        confident: true,
      };
    }
    // Generic "what's next" — describe upcoming step.
    const nextIdx = idx + 1;
    if (nextIdx >= steps.length) {
      return {
        speakable: "You're on the last step.",
        confident: true,
      };
    }
    const nextStep = steps[nextIdx];
    if (!nextStep) return fallback;
    return {
      speakable: `Next, step ${nextIdx + 1}: ${nextStep.instruction}`,
      confident: true,
    };
  }

  if (intent.kind === "should-i") {
    if (intent.keyword.length === 0) return fallback;
    // First check prior + current → "already done"
    for (let i = 0; i <= idx; i++) {
      const step = steps[i];
      if (step && stepMentions(step, intent.keyword)) {
        return {
          speakable: `You already added ${intent.keyword} in step ${i + 1}.`,
          confident: true,
        };
      }
    }
    // Then forward → "yes, coming up"
    for (let i = idx + 1; i < steps.length; i++) {
      const step = steps[i];
      if (step && stepMentions(step, intent.keyword)) {
        return {
          speakable: `Yes — that's step ${i + 1}.`,
          confident: true,
        };
      }
    }
    return fallback;
  }

  return fallback;
}

function clampStepIndex(idx: number, len: number): number {
  if (!Number.isFinite(idx)) return 0;
  if (idx < 0) return 0;
  if (idx >= len) return len - 1;
  return Math.floor(idx);
}
