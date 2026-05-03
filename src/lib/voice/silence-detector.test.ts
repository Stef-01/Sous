import { describe, expect, it } from "vitest";
import {
  DEFAULT_SILENCE_THRESHOLD_MS,
  MIN_TRANSCRIPT_FOR_STOP,
  nextLastSpeechAt,
  shouldStopForSilence,
} from "./silence-detector";

describe("shouldStopForSilence", () => {
  it("never stops before any speech detected", () => {
    expect(
      shouldStopForSilence({
        lastSpeechAt: null,
        now: 10_000,
        transcriptLength: 100,
      }),
    ).toBe(false);
  });

  it("transcript still too short → no stop", () => {
    expect(
      shouldStopForSilence({
        lastSpeechAt: 0,
        now: 5_000,
        transcriptLength: MIN_TRANSCRIPT_FOR_STOP - 1,
      }),
    ).toBe(false);
  });

  it("silence below threshold → no stop", () => {
    expect(
      shouldStopForSilence({
        lastSpeechAt: 1_000,
        now: 1_000 + DEFAULT_SILENCE_THRESHOLD_MS - 1,
        transcriptLength: 100,
      }),
    ).toBe(false);
  });

  it("silence at threshold → stop", () => {
    expect(
      shouldStopForSilence({
        lastSpeechAt: 1_000,
        now: 1_000 + DEFAULT_SILENCE_THRESHOLD_MS,
        transcriptLength: 100,
      }),
    ).toBe(true);
  });

  it("silence over threshold → stop", () => {
    expect(
      shouldStopForSilence({
        lastSpeechAt: 1_000,
        now: 1_000 + DEFAULT_SILENCE_THRESHOLD_MS * 2,
        transcriptLength: 100,
      }),
    ).toBe(true);
  });

  it("custom threshold respected", () => {
    // gap = 4000ms. threshold 4000 → stop; threshold 4001 → no stop.
    expect(
      shouldStopForSilence({
        lastSpeechAt: 1_000,
        now: 5_000,
        transcriptLength: 100,
        threshold: 4_000,
      }),
    ).toBe(true);
    expect(
      shouldStopForSilence({
        lastSpeechAt: 1_000,
        now: 5_000,
        transcriptLength: 100,
        threshold: 4_001,
      }),
    ).toBe(false);
  });

  it("clock skew (now < lastSpeechAt) → defensive false", () => {
    expect(
      shouldStopForSilence({
        lastSpeechAt: 5_000,
        now: 1_000,
        transcriptLength: 100,
      }),
    ).toBe(false);
  });

  it("non-finite inputs → false", () => {
    expect(
      shouldStopForSilence({
        lastSpeechAt: Number.NaN,
        now: 1_000,
        transcriptLength: 100,
      }),
    ).toBe(false);
    expect(
      shouldStopForSilence({
        lastSpeechAt: 1_000,
        now: Number.POSITIVE_INFINITY,
        transcriptLength: 100,
      }),
    ).toBe(false);
  });
});

describe("nextLastSpeechAt", () => {
  it("transcript growth → returns now", () => {
    const out = nextLastSpeechAt({
      prevTranscript: "I want to make",
      nextTranscript: "I want to make pasta",
      prevLastSpeechAt: 1_000,
      now: 5_000,
    });
    expect(out).toBe(5_000);
  });

  it("transcript stable → returns prev unchanged", () => {
    const out = nextLastSpeechAt({
      prevTranscript: "I want to make pasta",
      nextTranscript: "I want to make pasta",
      prevLastSpeechAt: 1_000,
      now: 5_000,
    });
    expect(out).toBe(1_000);
  });

  it("transcript shrinks (mid-recognition revision) → returns prev unchanged", () => {
    const out = nextLastSpeechAt({
      prevTranscript: "I want to make pasta with red sauce",
      nextTranscript: "I want to make pasta",
      prevLastSpeechAt: 1_000,
      now: 5_000,
    });
    expect(out).toBe(1_000);
  });

  it("first growth from empty → returns now", () => {
    const out = nextLastSpeechAt({
      prevTranscript: "",
      nextTranscript: "hello",
      prevLastSpeechAt: null,
      now: 1_234,
    });
    expect(out).toBe(1_234);
  });

  it("non-finite now during growth → returns prev unchanged", () => {
    const out = nextLastSpeechAt({
      prevTranscript: "a",
      nextTranscript: "abc",
      prevLastSpeechAt: 999,
      now: Number.NaN,
    });
    expect(out).toBe(999);
  });
});
