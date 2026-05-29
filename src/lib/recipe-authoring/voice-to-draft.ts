/**
 * Voice → recipe draft pipe (Y2 Sprint H W32).
 *
 * Pure transcript-to-prompt adapter for the voice-driven recipe
 * authoring flow on `/path/recipes/quick-add`. Composes with the
 * existing autogen pipeline (`buildAutogenPrompt` + the server
 * Anthropic call + `adaptAutogenToDraft`).
 *
 * The split:
 *   - This module normalises + validates the voice transcript
 *     and prepares it for the autogen prompt builder.
 *   - The server route runs `buildAutogenPrompt` →
 *     Anthropic → `adaptAutogenToDraft` (Y1 W50 substrate).
 *   - Result: same RecipeDraft shape the textarea-mode authoring
 *     flow produces, regardless of whether the user typed or
 *     spoke.
 *
 * Why a separate adapter rather than calling the autogen pipeline
 * directly with the raw transcript:
 *   - Voice transcripts have leading "uh" / "umm" filler the
 *     autogen prompt is more cost-effective without.
 *   - Spoken numbers (one, two, three) and time units sometimes
 *     come back wonky from the recogniser; we normalise them.
 *   - Min-length validation belongs ABOVE the LLM call so we
 *     don't burn tokens on accidental wake-up captures.
 *
 * Pure / dependency-free / deterministic.
 */

import { buildAutogenPrompt, type AutogenPromptBundle } from "./autogen-prompt";

/** Minimum transcript length (chars) accepted as a valid recipe
 *  authoring intent. Below this, the pipe rejects so we don't
 *  burn LLM tokens on a 4-character "ok" misfire. */
export const VOICE_MIN_TRANSCRIPT_LENGTH = 20;

/** Maximum transcript length (chars). Above this, the pipe
 *  truncates rather than rejects — the user clearly meant to
 *  author something, just over-spoke. Keep within reasonable
 *  Anthropic prompt budget. */
export const VOICE_MAX_TRANSCRIPT_LENGTH = 2000;

/** Filler word patterns we strip from voice transcripts before
 *  the LLM sees them. Conservative — only the most common +
 *  unambiguous fillers. Keeping the list small avoids
 *  over-stripping authentic content. */
const FILLER_PATTERNS: ReadonlyArray<RegExp> = [
  /\b(?:um+|uh+|er+|ah+)\b/gi,
  /\blike,\s/gi, // ONLY "like, " (with comma) — semantic "like" preserved
  /\byou know\b/gi,
  /\bsort of\b/gi,
  /\bkind of\b/gi,
];

/** Pure: scrub voice-transcript filler words + collapse repeated
 *  whitespace. Idempotent. */
export function scrubVoiceTranscript(raw: string): string {
  let s = raw;
  for (const re of FILLER_PATTERNS) {
    s = s.replace(re, " ");
  }
  // Collapse repeated whitespace + trim.
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export type VoiceToDraftResult =
  | { ok: true; prompt: AutogenPromptBundle; transcript: string }
  | { ok: false; reason: "empty" | "too-short" };

/** Pure: validate + normalise + adapt a voice transcript into an
 *  autogen prompt bundle. Returns:
 *    - {ok: true, prompt, transcript} when the transcript is
 *      usable. Caller passes `prompt` to the autogen LLM.
 *    - {ok: false, reason: "empty"} when nothing was captured.
 *    - {ok: false, reason: "too-short"} below min length.
 *
 *  Never throws. Truncation at the max length is silent. */
export function voiceTranscriptToDraft(
  rawTranscript: string,
): VoiceToDraftResult {
  if (typeof rawTranscript !== "string" || rawTranscript.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const scrubbed = scrubVoiceTranscript(rawTranscript);
  if (scrubbed.length === 0) {
    return { ok: false, reason: "empty" };
  }
  if (scrubbed.length < VOICE_MIN_TRANSCRIPT_LENGTH) {
    return { ok: false, reason: "too-short" };
  }

  const truncated =
    scrubbed.length > VOICE_MAX_TRANSCRIPT_LENGTH
      ? scrubbed.slice(0, VOICE_MAX_TRANSCRIPT_LENGTH)
      : scrubbed;

  const prompt = buildAutogenPrompt(truncated);
  return { ok: true, prompt, transcript: truncated };
}
