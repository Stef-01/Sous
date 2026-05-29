import { describe, expect, it } from "vitest";
import { parseStoredVoiceCookPref } from "./use-voice-cook-pref";

describe("parseStoredVoiceCookPref", () => {
  it("returns default when raw is null", () => {
    expect(parseStoredVoiceCookPref(null)).toEqual({
      enabled: false,
      lang: "en-US",
    });
  });

  it("returns default when raw is undefined", () => {
    expect(parseStoredVoiceCookPref(undefined)).toEqual({
      enabled: false,
      lang: "en-US",
    });
  });

  it("returns default when raw is empty string", () => {
    expect(parseStoredVoiceCookPref("")).toEqual({
      enabled: false,
      lang: "en-US",
    });
  });

  it("parses valid enabled+lang payload", () => {
    expect(
      parseStoredVoiceCookPref(
        JSON.stringify({ enabled: true, lang: "es-ES" }),
      ),
    ).toEqual({ enabled: true, lang: "es-ES" });
  });

  it("falls back to default when raw is corrupt JSON", () => {
    expect(parseStoredVoiceCookPref("{not json")).toEqual({
      enabled: false,
      lang: "en-US",
    });
  });

  it("treats non-boolean enabled as false", () => {
    expect(
      parseStoredVoiceCookPref(JSON.stringify({ enabled: "yes" })),
    ).toEqual({ enabled: false, lang: "en-US" });
  });

  it("treats missing lang as en-US", () => {
    expect(parseStoredVoiceCookPref(JSON.stringify({ enabled: true }))).toEqual(
      { enabled: true, lang: "en-US" },
    );
  });

  it("ignores extra unknown fields", () => {
    expect(
      parseStoredVoiceCookPref(
        JSON.stringify({ enabled: true, lang: "en-GB", garbage: "x" }),
      ),
    ).toEqual({ enabled: true, lang: "en-GB" });
  });

  // W15 stress loop 1 — poisoned-data + race-condition.
  it("survives a 5000-char payload without crashing", () => {
    const long = JSON.stringify({
      enabled: true,
      lang: "en-US",
      junk: "x".repeat(5000),
    });
    expect(parseStoredVoiceCookPref(long)).toEqual({
      enabled: true,
      lang: "en-US",
    });
  });

  it("is deterministic across 1000 repeat calls", () => {
    const raw = JSON.stringify({ enabled: true, lang: "en-US" });
    let last = parseStoredVoiceCookPref(raw);
    for (let i = 0; i < 1000; i += 1) {
      const next = parseStoredVoiceCookPref(raw);
      expect(next).toEqual(last);
      last = next;
    }
  });

  it("returns a fresh object reference (no shared state)", () => {
    const a = parseStoredVoiceCookPref(null);
    const b = parseStoredVoiceCookPref(null);
    expect(a).toEqual(b);
    // Mutating a must not affect b — defensive contract.
    a.enabled = true;
    expect(b.enabled).toBe(false);
  });

  it("handles JSON null payload by returning default", () => {
    expect(parseStoredVoiceCookPref("null")).toEqual({
      enabled: false,
      lang: "en-US",
    });
  });

  it("handles JSON array payload by returning default", () => {
    expect(parseStoredVoiceCookPref("[1,2,3]")).toEqual({
      enabled: false,
      lang: "en-US",
    });
  });
});
