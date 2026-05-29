/**
 * Mic visual state + transcript truncation (Y2 Sprint H W33).
 *
 * Two pure UX-polish helpers for the voice quick-add flow:
 *
 * 1. `micVisualState(opts)` — picks the mic icon's animation
 *    bucket from {recording, lastSpeechAt, now}. Three buckets:
 *      - "pulsing": actively detecting speech (last growth < 600ms)
 *      - "dim":     recording but in a silence pause
 *      - "idle":    not recording (mic ready, no animation)
 *    The component layer reads this + applies the right Tailwind
 *    class. Reduced-motion gating is the component's concern.
 *
 * 2. `truncateTranscript(transcript, max?)` — show only the last
 *    N chars (default 200), prefer cutting at a word boundary so
 *    the cut doesn't land mid-word. Full transcript is always
 *    available unchanged via the existing string itself; this
 *    helper is for display only.
 *
 * Pure / dependency-free / deterministic.
 */

/** Window inside which "speech is happening" — recent growth in
 *  the transcript indicates the user is actively speaking. Tuned
 *  to feel like a "live mic" without flickering on natural
 *  breath pauses. */
export const SPEECH_PULSING_WINDOW_MS = 600;

/** Default max chars for the truncated live-transcript display.
 *  W33 plan calls for 200 — readable on a 375px viewport without
 *  pushing the mic button below the fold. */
export const DEFAULT_TRANSCRIPT_DISPLAY_MAX = 200;

export type MicVisualState = "pulsing" | "dim" | "idle";

export interface MicVisualOpts {
  /** Whether the mic is currently recording. False → idle. */
  recording: boolean;
  /** Timestamp of the most recent transcript growth. Null when
   *  no speech has been detected this session yet. */
  lastSpeechAt: number | null;
  /** Reference "now". Tests inject a fixed value. */
  now: number;
}

/** Pure: pick the mic visual state. */
export function micVisualState(opts: MicVisualOpts): MicVisualState {
  if (!opts.recording) return "idle";
  if (opts.lastSpeechAt === null) return "dim"; // recording but nothing said yet
  if (!Number.isFinite(opts.lastSpeechAt)) return "dim";
  if (!Number.isFinite(opts.now)) return "dim";
  if (opts.now < opts.lastSpeechAt) return "dim"; // clock-skew defensive
  const gap = opts.now - opts.lastSpeechAt;
  return gap <= SPEECH_PULSING_WINDOW_MS ? "pulsing" : "dim";
}

/** Pure: cut to the last `max` chars at a word boundary. When
 *  the transcript is already short enough, returns it unchanged.
 *
 *  Word-boundary preference: if the cut point falls mid-word,
 *  walk forward to the next whitespace + start the visible window
 *  there. Avoids "...rumbleblending into smooth" → reads as a
 *  single word. */
export function truncateTranscript(
  transcript: string,
  max: number = DEFAULT_TRANSCRIPT_DISPLAY_MAX,
): string {
  if (typeof transcript !== "string") return "";
  if (max <= 0) return "";
  if (transcript.length <= max) return transcript;

  // Take the last `max` chars then walk forward to the next
  // whitespace so we don't break a word.
  const start = transcript.length - max;
  const tail = transcript.slice(start);
  const wsIdx = tail.search(/\s/);
  if (wsIdx < 0) return tail; // no whitespace in window — return as-is
  // Skip past the whitespace itself so the visible window starts
  // on a word.
  return tail.slice(wsIdx + 1);
}

/** Pure: build the long-press / "show full" payload. The
 *  contract is trivial — the full transcript is just the input
 *  unchanged — but the helper exposes the contract so callers
 *  don't reach into the truncated string. */
export function fullTranscript(transcript: string): string {
  return typeof transcript === "string" ? transcript : "";
}
