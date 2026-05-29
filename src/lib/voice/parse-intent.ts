/**
 * Voice intent parser for cook-mode commands.
 *
 * W13 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint C voice
 * cook). Pure functions, no DOM, no hook deps — fully testable.
 *
 * Intents are intentionally narrow: navigation, timer, and the
 * "what was that step" repeat cue. No open-ended chat — the
 * coach persona stays bounded (CLAUDE.md AI integration notes).
 *
 * Parsing strategy: lower-case + strip punctuation, then match
 * against an ordered list of phrase-patterns. First match wins.
 * The list is small enough (~20 phrases) that a simple linear
 * scan beats any precompilation; if it grows past 50, swap to a
 * regex-disjunction trie.
 */

export type CookVoiceIntent =
  | { kind: "next" }
  | { kind: "back" }
  | { kind: "repeat" }
  /** Step-completion intent (Stage-5 W18 MVP 1). Maps to "next"
   *  semantically but the consumer can also log the `context`
   *  (the "what" the user said they were done with) for
   *  analytics / per-step duration tracking. The Google-Maps-
   *  style "done chopping onions" flow. */
  | { kind: "done"; context: string | null }
  | { kind: "timer-set"; seconds: number }
  | { kind: "timer-cancel" }
  | { kind: "timer-status" }
  | { kind: "timer-add"; seconds: number }
  | { kind: "pause" }
  | { kind: "resume" }
  | { kind: "unknown" };

/** Lowercase + drop punctuation + drop unicode-symbol/emoji glyphs +
 *  collapse whitespace.
 *
 *  Stripping non-letter glyphs is what makes "next 🍝" → "next"
 *  match the navigation phrase list. RCA from W13 Loop 2:
 *  endsWith-based phrase matching is brittle when the input has
 *  trailing decorative characters, so pre-strip them here. */
export function normaliseUtterance(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.!?,;:'"]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const NEXT_PHRASES = [
  "next",
  "next step",
  "go next",
  "continue",
  "move on",
  "next one",
  "advance",
  "keep going",
];

const BACK_PHRASES = [
  "back",
  "go back",
  "previous",
  "previous step",
  "last step",
  "before",
];

const REPEAT_PHRASES = [
  "repeat",
  "say that again",
  "again",
  "what",
  "one more time",
];

const TIMER_CANCEL_PHRASES = [
  "cancel timer",
  "stop timer",
  "cancel the timer",
  "stop the timer",
];

const TIMER_STATUS_PHRASES = [
  "how long left",
  "how much time",
  "time left",
  "how long",
];

const PAUSE_PHRASES = ["pause", "wait", "hold on"];
const RESUME_PHRASES = ["resume", "continue", "start again"];

/** Step-completion phrases (W18 MVP 1). Positive forms only —
 *  negation gating is handled separately. */
const DONE_PHRASES = [
  "done",
  "all done",
  "finished",
  "i'm done",
  "im done",
  "im finished",
  "i'm finished",
  "ive finished",
  "i've finished",
  "ready",
  "all ready",
];

/** Negation prefixes/markers that flip the meaning of a completion
 *  phrase. The presence of any of these in the utterance disables
 *  the "done" intent path. */
const DONE_NEGATIONS = [
  "not done",
  "not finished",
  "not ready",
  "not yet",
  "almost done",
  "almost there",
  "nearly done",
  "still",
  "no",
];

/** Pure helper: extract the "what" context from a completion
 *  utterance (e.g. "done chopping onions" → "chopping onions";
 *  "done" → null). Exported for unit testing. */
export function extractDoneContext(normalised: string): string | null {
  // Strip a leading "I'm" / "ive" / "im" / "i've" if present.
  const stripped = normalised.replace(/^(i ?'?ve|im|i ?'?m)\s+/u, "").trim();
  // Strip the head verb ("done" / "finished" / "ready") + filler
  // ("with the", "with", "the"). RCA from W18 Loop 2: regex
  // alternation is left-to-right greedy, so longer alternatives
  // must come first — '(with the|with|the)' not '(with|the|with the)'.
  const m = stripped.match(
    /^(done|finished|ready)(?:\s+(?:with the|with|the))?\s+(.+)$/u,
  );
  if (m && m[2]) return m[2].trim() || null;
  return null;
}

/**
 * Parse a duration phrase like "5 minutes", "30 seconds",
 * "two minutes", "a minute and a half" into total seconds.
 *
 * Returns `null` when no recognisable duration is found.
 */
export function parseDurationPhrase(text: string): number | null {
  const numericWords: Record<string, number> = {
    a: 1,
    an: 1,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    fifteen: 15,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    ninety: 90,
  };

  let total = 0;
  let foundAnything = false;

  // RCA from W13 Loop 2: "half a minute" was being double-counted —
  // the minutesRe match grabbed "a minute" → 60s, then the half-
  // detector added 30s → 90s. Fix: replace half-minute phrases with
  // an empty placeholder BEFORE the minutesRe runs, so minutesRe
  // can't see them. Test pinned to 30s.
  let working = text;
  if (/(half a minute|half minute)/.test(working)) {
    total += 30;
    foundAnything = true;
    working = working.replace(/half a minute|half minute/g, "");
  }

  // Match "<num> minute(s)" patterns.
  const minutesRe = /(\d+|[a-z]+)\s+minutes?/g;
  let match: RegExpExecArray | null;
  while ((match = minutesRe.exec(working)) !== null) {
    const raw = match[1];
    const n = /^\d+$/.test(raw) ? parseInt(raw, 10) : numericWords[raw];
    if (typeof n === "number") {
      total += n * 60;
      foundAnything = true;
    }
  }

  // Match "<num> second(s)" patterns.
  const secondsRe = /(\d+|[a-z]+)\s+seconds?/g;
  while ((match = secondsRe.exec(working)) !== null) {
    const raw = match[1];
    const n = /^\d+$/.test(raw) ? parseInt(raw, 10) : numericWords[raw];
    if (typeof n === "number") {
      total += n;
      foundAnything = true;
    }
  }

  // "a minute and a half" → adds 30s on top of the minute count.
  if (/and a half\b/.test(text) && total > 0) {
    total += 30;
  }

  return foundAnything ? total : null;
}

/**
 * Parse a normalised utterance into a CookVoiceIntent.
 *
 * Intent priority (first match wins):
 *   1. timer-set ("set a 5-minute timer")
 *   2. timer-add ("add 30 seconds")
 *   3. timer-cancel
 *   4. timer-status
 *   5. next / back / repeat / pause / resume
 *   6. unknown
 *
 * Caller is expected to have already passed the input through
 * `normaliseUtterance`. The split lets the caller log the
 * normalisation step independently.
 */
export function parseCookVoiceIntent(input: string): CookVoiceIntent {
  // Auto-normalise — callers pass either raw transcripts or
  // already-normalised strings. Idempotent: re-normalising a
  // normalised string is a no-op.
  const normalised = normaliseUtterance(input);
  if (!normalised) return { kind: "unknown" };

  // timer-set: "set a 5 minute timer", "5 minute timer", "timer 30 seconds"
  if (
    /\b(set|start)\b.*\b(timer|min|sec)/.test(normalised) ||
    /\btimer\b/.test(normalised)
  ) {
    if (TIMER_CANCEL_PHRASES.some((p) => normalised.includes(p))) {
      return { kind: "timer-cancel" };
    }
    const seconds = parseDurationPhrase(normalised);
    if (seconds !== null && seconds > 0) {
      return { kind: "timer-set", seconds };
    }
  }

  // timer-add: "add 30 seconds", "another minute"
  if (/\b(add|another)\b/.test(normalised)) {
    const seconds = parseDurationPhrase(normalised);
    if (seconds !== null && seconds > 0) {
      return { kind: "timer-add", seconds };
    }
  }

  if (TIMER_CANCEL_PHRASES.some((p) => normalised.includes(p))) {
    return { kind: "timer-cancel" };
  }
  if (TIMER_STATUS_PHRASES.some((p) => normalised.includes(p))) {
    return { kind: "timer-status" };
  }

  if (
    NEXT_PHRASES.some((p) => normalised === p || normalised.endsWith(` ${p}`))
  ) {
    return { kind: "next" };
  }
  if (
    BACK_PHRASES.some((p) => normalised === p || normalised.endsWith(` ${p}`))
  ) {
    return { kind: "back" };
  }
  if (
    REPEAT_PHRASES.some((p) => normalised === p || normalised.endsWith(` ${p}`))
  ) {
    return { kind: "repeat" };
  }
  if (PAUSE_PHRASES.some((p) => normalised === p)) {
    return { kind: "pause" };
  }
  if (RESUME_PHRASES.some((p) => normalised === p)) {
    return { kind: "resume" };
  }

  // Step-completion intent (W18 MVP 1). Negation gate first —
  // "I'm not done" / "almost done" / "not yet" all bail before
  // any positive-form match. The negation list is checked as
  // substrings because they often appear mid-utterance.
  if (DONE_NEGATIONS.some((n) => normalised.includes(n))) {
    return { kind: "unknown" };
  }
  // Positive-form check: utterance starts with one of the DONE
  // phrases OR exact-equals one of them. The startsWith form picks
  // up "done chopping onions"; the equality form picks up bare
  // "done" / "finished".
  const matchedDone = DONE_PHRASES.find(
    (p) => normalised === p || normalised.startsWith(`${p} `),
  );
  if (matchedDone) {
    return {
      kind: "done",
      context: extractDoneContext(normalised),
    };
  }

  return { kind: "unknown" };
}
