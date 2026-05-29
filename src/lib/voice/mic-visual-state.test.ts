import { describe, expect, it } from "vitest";
import {
  DEFAULT_TRANSCRIPT_DISPLAY_MAX,
  SPEECH_PULSING_WINDOW_MS,
  fullTranscript,
  micVisualState,
  truncateTranscript,
} from "./mic-visual-state";

// ── micVisualState ────────────────────────────────────────

describe("micVisualState", () => {
  it("not recording → idle", () => {
    expect(
      micVisualState({ recording: false, lastSpeechAt: 1_000, now: 2_000 }),
    ).toBe("idle");
  });

  it("recording but no speech yet → dim", () => {
    expect(
      micVisualState({ recording: true, lastSpeechAt: null, now: 1_000 }),
    ).toBe("dim");
  });

  it("recording + recent speech (within window) → pulsing", () => {
    expect(
      micVisualState({
        recording: true,
        lastSpeechAt: 1_000,
        now: 1_000 + SPEECH_PULSING_WINDOW_MS,
      }),
    ).toBe("pulsing");
  });

  it("recording + old speech (past window) → dim", () => {
    expect(
      micVisualState({
        recording: true,
        lastSpeechAt: 1_000,
        now: 1_000 + SPEECH_PULSING_WINDOW_MS + 1,
      }),
    ).toBe("dim");
  });

  it("recording + speech right at the edge → pulsing (inclusive)", () => {
    expect(
      micVisualState({
        recording: true,
        lastSpeechAt: 0,
        now: SPEECH_PULSING_WINDOW_MS,
      }),
    ).toBe("pulsing");
  });

  it("clock skew (now < lastSpeechAt) → dim (defensive)", () => {
    expect(
      micVisualState({ recording: true, lastSpeechAt: 5_000, now: 1_000 }),
    ).toBe("dim");
  });

  it("non-finite inputs → dim", () => {
    expect(
      micVisualState({
        recording: true,
        lastSpeechAt: Number.NaN,
        now: 1_000,
      }),
    ).toBe("dim");
    expect(
      micVisualState({
        recording: true,
        lastSpeechAt: 1_000,
        now: Number.POSITIVE_INFINITY,
      }),
    ).toBe("dim");
  });

  it("idle takes precedence over speech state", () => {
    // Even with fresh speech, recording=false → idle.
    expect(
      micVisualState({ recording: false, lastSpeechAt: 1_000, now: 1_000 }),
    ).toBe("idle");
  });
});

// ── truncateTranscript ────────────────────────────────────

describe("truncateTranscript", () => {
  it("short transcript → unchanged", () => {
    const t = "I want pasta tonight";
    expect(truncateTranscript(t, 200)).toBe(t);
  });

  it("long transcript → cut to last `max` chars at word boundary", () => {
    const long = "lorem ipsum ".repeat(50); // ~600 chars
    const out = truncateTranscript(long, 200);
    expect(out.length).toBeLessThanOrEqual(200);
    expect(out).not.toMatch(/^lorem/); // shifted past the start
  });

  it("respects custom max", () => {
    const long = "a b c d e f g h i j k l m n o p q r s t u v w x y z";
    const out = truncateTranscript(long, 10);
    expect(out.length).toBeLessThanOrEqual(10);
  });

  it("falls through unchanged when max >= length", () => {
    const t = "hello";
    expect(truncateTranscript(t, 100)).toBe(t);
  });

  it("walks forward to whitespace so the cut doesn't land mid-word", () => {
    // Build a transcript whose last `max` chars start mid-word.
    // Prefix has known length so we can predict the cut.
    const prefix = "first sentence here";
    const tail = "and then another long sentence with several words";
    const transcript = prefix + " " + tail;
    // max chosen so the cut lands inside "and" — helper should
    // walk forward past " " to "then..."
    const max = tail.length + 1; // includes some of prefix
    const out = truncateTranscript(transcript, max);
    expect(out.startsWith(" ")).toBe(false);
    expect(out.length).toBeLessThanOrEqual(max);
  });

  it("non-string input → empty", () => {
    expect(truncateTranscript(null as unknown as string, 100)).toBe("");
  });

  it("max <= 0 → empty", () => {
    expect(truncateTranscript("hello", 0)).toBe("");
    expect(truncateTranscript("hello", -5)).toBe("");
  });

  it("DEFAULT max is 200", () => {
    expect(DEFAULT_TRANSCRIPT_DISPLAY_MAX).toBe(200);
  });
});

// ── fullTranscript ────────────────────────────────────────

describe("fullTranscript", () => {
  it("identity for strings", () => {
    expect(fullTranscript("hello world")).toBe("hello world");
  });

  it("non-string → empty", () => {
    expect(fullTranscript(null as unknown as string)).toBe("");
    expect(fullTranscript(undefined as unknown as string)).toBe("");
  });
});
