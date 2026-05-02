import { describe, expect, it } from "vitest";
import {
  detectSpeechSynthesis,
  pickVoiceForLang,
  type VoiceLike,
} from "./use-text-to-speech";

describe("detectSpeechSynthesis — capability check", () => {
  it("returns false for empty global", () => {
    expect(detectSpeechSynthesis({})).toBe(false);
  });

  it("returns false for undefined input (SSR)", () => {
    expect(detectSpeechSynthesis(undefined)).toBe(false);
  });

  it("returns true when speechSynthesis is present", () => {
    expect(detectSpeechSynthesis({ speechSynthesis: {} })).toBe(true);
  });

  it("returns false when speechSynthesis is explicitly undefined", () => {
    expect(detectSpeechSynthesis({ speechSynthesis: undefined })).toBe(false);
  });
});

const v = (name: string, lang: string, isDefault = false): VoiceLike => ({
  name,
  lang,
  default: isDefault,
});

describe("pickVoiceForLang", () => {
  it("returns null for an empty voice list", () => {
    expect(pickVoiceForLang([], "en-US")).toBe(null);
  });

  it("prefers exact-match default voice", () => {
    const voices = [v("Alex", "en-US"), v("Samantha", "en-US", true)];
    expect(pickVoiceForLang(voices, "en-US")?.name).toBe("Samantha");
  });

  it("picks first exact-match voice when no default flagged", () => {
    const voices = [v("Alex", "en-US"), v("Karen", "en-US")];
    expect(pickVoiceForLang(voices, "en-US")?.name).toBe("Alex");
  });

  it("falls back to language-prefix match when exact missing", () => {
    const voices = [v("Daniel", "en-GB"), v("Maria", "es-ES")];
    expect(pickVoiceForLang(voices, "en-US")?.name).toBe("Daniel");
  });

  it("falls back to first voice when nothing matches", () => {
    const voices = [v("Maria", "es-ES"), v("Yuna", "ko-KR")];
    expect(pickVoiceForLang(voices, "fr-FR")?.name).toBe("Maria");
  });
});

// W14 Loop 1 — stress per docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md
describe("pickVoiceForLang — stress: long-content", () => {
  it("picks deterministically across a 200-voice list", () => {
    const voices: VoiceLike[] = Array.from({ length: 200 }, (_, i) =>
      v(`Voice ${i}`, i === 100 ? "en-US" : `xx-${i}`, i === 100),
    );
    const result = pickVoiceForLang(voices, "en-US");
    expect(result?.name).toBe("Voice 100");
  });

  it("handles a 5000-character voice name without crashing", () => {
    const longName = "VoiceName".repeat(556); // ~5000 chars
    const voices = [v(longName, "en-US")];
    expect(pickVoiceForLang(voices, "en-US")?.name).toBe(longName);
  });
});

describe("pickVoiceForLang — stress: race-condition", () => {
  it("returns the same reference across 1000 repeat calls", () => {
    const voices = [v("Samantha", "en-US", true), v("Alex", "en-US")];
    const target = voices[0];
    for (let i = 0; i < 1000; i += 1) {
      expect(pickVoiceForLang(voices, "en-US")).toBe(target);
    }
  });

  it("doesn't share state when voice list mutates between calls", () => {
    let voices: VoiceLike[] = [v("Alex", "en-US")];
    const a = pickVoiceForLang(voices, "en-US");
    voices = [v("Samantha", "en-US", true), v("Alex", "en-US")];
    const b = pickVoiceForLang(voices, "en-US");
    expect(a?.name).toBe("Alex");
    expect(b?.name).toBe("Samantha");
  });
});

describe("pickVoiceForLang — stress: poisoned-data", () => {
  it("handles a malformed lang tag (no hyphen)", () => {
    const voices = [v("Alex", "en"), v("Maria", "es")];
    expect(pickVoiceForLang(voices, "en")?.name).toBe("Alex");
  });

  it("handles an empty preferredLang string by returning first voice", () => {
    const voices = [v("Alex", "en-US"), v("Maria", "es-ES")];
    // empty prefix matches everything via startsWith — returns first.
    expect(pickVoiceForLang(voices, "")?.name).toBe("Alex");
  });

  it("when multiple voices flag default, picks the first matching", () => {
    // Defensive: real platform might emit multiple defaults.
    const voices = [v("Samantha", "en-US", true), v("Karen", "en-US", true)];
    expect(pickVoiceForLang(voices, "en-US")?.name).toBe("Samantha");
  });
});
