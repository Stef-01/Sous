import { describe, expect, it } from "vitest";
import { detectSpeechRecognitionCtor } from "./use-voice-transcript";

// Minimal stub matching the SpeechRecognitionLike contract — vitest
// runs in node, so there's no real SpeechRecognition global.
class StubRecognition {
  continuous = false;
  interimResults = false;
  lang = "en-US";
  start() {}
  stop() {}
  abort() {}
  onresult = null;
  onerror = null;
  onend = null;
}

describe("detectSpeechRecognitionCtor — capability check", () => {
  it("returns null for an empty global", () => {
    expect(detectSpeechRecognitionCtor({})).toBe(null);
  });

  it("returns null for undefined input (SSR)", () => {
    expect(detectSpeechRecognitionCtor(undefined)).toBe(null);
  });

  it("prefers standard SpeechRecognition over webkit-prefixed", () => {
    class Standard extends StubRecognition {}
    class Webkit extends StubRecognition {}
    const result = detectSpeechRecognitionCtor({
      SpeechRecognition: Standard,
      webkitSpeechRecognition: Webkit,
    });
    expect(result).toBe(Standard);
  });

  it("falls back to webkitSpeechRecognition when standard is absent", () => {
    class Webkit extends StubRecognition {}
    const result = detectSpeechRecognitionCtor({
      webkitSpeechRecognition: Webkit,
    });
    expect(result).toBe(Webkit);
  });

  it("returns the standard ctor when only it is present", () => {
    class Standard extends StubRecognition {}
    const result = detectSpeechRecognitionCtor({
      SpeechRecognition: Standard,
    });
    expect(result).toBe(Standard);
  });
});

// W12 Loop 1 — stress: capability detection across degenerate
// platform-globals shapes (the kind a polyfill or a malformed
// shim might produce).
describe("detectSpeechRecognitionCtor — stress: poisoned-platform", () => {
  it("returns null when SpeechRecognition is set to undefined explicitly", () => {
    expect(detectSpeechRecognitionCtor({ SpeechRecognition: undefined })).toBe(
      null,
    );
  });

  it("returns null when both keys are explicitly null-ish", () => {
    expect(
      detectSpeechRecognitionCtor({
        SpeechRecognition: undefined,
        webkitSpeechRecognition: undefined,
      }),
    ).toBe(null);
  });

  it("doesn't throw when called 1000× (race-condition / call-order)", () => {
    class Stub extends StubRecognition {}
    const platform = { SpeechRecognition: Stub };
    let result = null;
    for (let i = 0; i < 1000; i += 1) {
      result = detectSpeechRecognitionCtor(platform);
    }
    expect(result).toBe(Stub);
  });

  it("returns the same ctor reference across repeated calls (deterministic)", () => {
    class Stub extends StubRecognition {}
    const platform = { SpeechRecognition: Stub };
    const a = detectSpeechRecognitionCtor(platform);
    const b = detectSpeechRecognitionCtor(platform);
    const c = detectSpeechRecognitionCtor(platform);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });
});
