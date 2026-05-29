import { describe, expect, it } from "vitest";
import {
  VOICE_MAX_TRANSCRIPT_LENGTH,
  VOICE_MIN_TRANSCRIPT_LENGTH,
  scrubVoiceTranscript,
  voiceTranscriptToDraft,
} from "./voice-to-draft";

// ── scrubVoiceTranscript ──────────────────────────────────

describe("scrubVoiceTranscript", () => {
  it("strips 'um' fillers", () => {
    expect(scrubVoiceTranscript("um make pasta um with sauce")).not.toMatch(
      /\bum\b/i,
    );
  });

  it("strips elongated 'uhhh' fillers", () => {
    expect(scrubVoiceTranscript("uhhh add the salt")).not.toMatch(/\buhh+\b/i);
  });

  it("strips 'you know' verbal padding", () => {
    expect(scrubVoiceTranscript("add salt you know to taste")).not.toMatch(
      /you know/i,
    );
  });

  it("strips 'like,' as filler but keeps semantic 'like'", () => {
    // "like, " (with comma + space) is the filler form. Using
    // "like" in semantic position ("tastes like lemon") is
    // preserved.
    expect(scrubVoiceTranscript("um, like, add salt")).not.toMatch(/like,/i);
    expect(scrubVoiceTranscript("tastes like lemon")).toContain("like lemon");
  });

  it("collapses repeated whitespace introduced by filler removal", () => {
    expect(scrubVoiceTranscript("um   make    um   pasta")).toBe("make pasta");
  });

  it("idempotent (applying twice yields the same)", () => {
    const once = scrubVoiceTranscript("um make um pasta");
    expect(scrubVoiceTranscript(once)).toBe(once);
  });

  it("preserves numerical content", () => {
    expect(scrubVoiceTranscript("add 2 cups of flour")).toContain("2 cups");
  });
});

// ── voiceTranscriptToDraft ────────────────────────────────

describe("voiceTranscriptToDraft — reject paths", () => {
  it("empty string → ok=false / empty", () => {
    expect(voiceTranscriptToDraft("")).toEqual({
      ok: false,
      reason: "empty",
    });
  });

  it("only filler words → ok=false / empty (after scrub it's blank)", () => {
    expect(voiceTranscriptToDraft("um uh uhhh")).toEqual({
      ok: false,
      reason: "empty",
    });
  });

  it("only whitespace → ok=false / empty", () => {
    expect(voiceTranscriptToDraft("   \n  ")).toEqual({
      ok: false,
      reason: "empty",
    });
  });

  it("below min length → ok=false / too-short", () => {
    const short = "ok pasta"; // < MIN_LEN
    expect(voiceTranscriptToDraft(short).ok).toBe(false);
    expect((voiceTranscriptToDraft(short) as { reason: string }).reason).toBe(
      "too-short",
    );
  });

  it("non-string input → empty", () => {
    expect(voiceTranscriptToDraft(null as unknown as string)).toEqual({
      ok: false,
      reason: "empty",
    });
  });
});

describe("voiceTranscriptToDraft — accept path", () => {
  const sample =
    "I want to make a tomato pasta with garlic and basil for two people";

  it("clean transcript ≥ MIN → ok=true with prompt", () => {
    const out = voiceTranscriptToDraft(sample);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.prompt).toBeDefined();
      expect(out.prompt.user).toContain("tomato pasta");
      expect(out.transcript.length).toBeGreaterThanOrEqual(
        VOICE_MIN_TRANSCRIPT_LENGTH,
      );
    }
  });

  it("transcript with fillers → scrubbed before prompt", () => {
    const noisy = `um I want to make ${sample}`;
    const out = voiceTranscriptToDraft(noisy);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.transcript.toLowerCase()).not.toContain(" um ");
      expect(out.transcript.toLowerCase()).not.toMatch(/^um\b/);
    }
  });

  it("transcript over MAX → silently truncated, still ok", () => {
    const huge =
      sample + " ".repeat(10) + "x".repeat(VOICE_MAX_TRANSCRIPT_LENGTH * 2);
    const out = voiceTranscriptToDraft(huge);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.transcript.length).toBeLessThanOrEqual(
        VOICE_MAX_TRANSCRIPT_LENGTH,
      );
    }
  });

  it("returned prompt bundle has both system + user", () => {
    const out = voiceTranscriptToDraft(sample);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.prompt.system).toBeTruthy();
      expect(out.prompt.user).toBeTruthy();
    }
  });

  it("MIN length constant exposed", () => {
    expect(VOICE_MIN_TRANSCRIPT_LENGTH).toBe(20);
  });

  it("MAX length constant exposed", () => {
    expect(VOICE_MAX_TRANSCRIPT_LENGTH).toBe(2000);
  });
});
