/**
 * Silence detector for voice transcript streams (Y2 Sprint H W31).
 *
 * The voice quick-add flow on `/path/recipes/quick-add` records
 * speech, builds an incremental transcript via the existing
 * `useVoiceTranscript` hook, and stops recording on either:
 *   - explicit user tap, OR
 *   - 2 seconds of silence after the last detected speech.
 *
 * This module is the pure-helper layer for the silence detector.
 * The hook layer wraps a setTimeout / requestAnimationFrame loop
 * around `shouldStopForSilence`; tests cover the math without
 * needing real timers.
 *
 * Pure / dependency-free / deterministic.
 */

/** Default silence threshold in milliseconds. Two seconds matches
 *  natural speech-pause length without cutting users off mid-
 *  thought. The W21 push-notification cadence uses similar
 *  pause-feel reasoning. */
export const DEFAULT_SILENCE_THRESHOLD_MS = 2000;

/** Default minimum transcript length (in characters) before
 *  silence-stop fires. Avoids stopping on the very first pause
 *  before the user has said anything. Tuned conservatively — at
 *  ~3 words the user has clearly started talking. */
export const MIN_TRANSCRIPT_FOR_STOP = 12;

/** Pure: should the recorder stop now?
 *
 *  Inputs:
 *    - lastSpeechAt: timestamp (ms) of the most recent transcript
 *      growth. Null when no speech has been detected yet.
 *    - now:          current time in ms.
 *    - transcriptLength: how many characters the transcript has
 *      accumulated. Used to gate the very-first pause before the
 *      user has actually said anything.
 *    - threshold:    silence threshold in ms. Defaults to 2000.
 *
 *  Returns true ONLY when:
 *    - speech has been detected (lastSpeechAt != null),
 *    - the transcript is non-trivial (>= MIN_TRANSCRIPT_FOR_STOP),
 *    - the silence elapsed since lastSpeechAt is >= threshold.
 *
 *  False everywhere else. The caller (hook) re-evaluates every
 *  ~250ms; first true result triggers the stop. */
export function shouldStopForSilence(opts: {
  lastSpeechAt: number | null;
  now: number;
  transcriptLength: number;
  threshold?: number;
}): boolean {
  const { lastSpeechAt, now, transcriptLength } = opts;
  const threshold = opts.threshold ?? DEFAULT_SILENCE_THRESHOLD_MS;

  if (lastSpeechAt === null) return false;
  if (!Number.isFinite(lastSpeechAt)) return false;
  if (!Number.isFinite(now)) return false;
  if (transcriptLength < MIN_TRANSCRIPT_FOR_STOP) return false;
  if (now < lastSpeechAt) return false; // clock-skew defensive

  return now - lastSpeechAt >= threshold;
}

/** Pure: track the last "speech" event by detecting growth in
 *  the transcript text. Returns the new last-speech timestamp
 *  (or the previous one when no growth is observed).
 *
 *  Used by the hook to update its lastSpeechAt ref each render.
 *  Pulling this out as a pure helper makes the trigger logic
 *  testable end-to-end without React. */
export function nextLastSpeechAt(opts: {
  prevTranscript: string;
  nextTranscript: string;
  prevLastSpeechAt: number | null;
  now: number;
}): number | null {
  const { prevTranscript, nextTranscript, prevLastSpeechAt, now } = opts;
  if (nextTranscript.length > prevTranscript.length) {
    return Number.isFinite(now) ? now : prevLastSpeechAt;
  }
  return prevLastSpeechAt;
}
