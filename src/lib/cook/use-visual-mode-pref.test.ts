import { describe, expect, it } from "vitest";
import { parseStoredVisualModePref } from "./use-visual-mode-pref";

describe("parseStoredVisualModePref", () => {
  it("returns default for null", () => {
    expect(parseStoredVisualModePref(null)).toEqual({ enabled: false });
  });

  it("returns default for undefined", () => {
    expect(parseStoredVisualModePref(undefined)).toEqual({ enabled: false });
  });

  it("returns default for empty string", () => {
    expect(parseStoredVisualModePref("")).toEqual({ enabled: false });
  });

  it("parses a valid enabled-true payload", () => {
    expect(
      parseStoredVisualModePref(JSON.stringify({ enabled: true })),
    ).toEqual({ enabled: true });
  });

  it("parses a valid enabled-false payload", () => {
    expect(
      parseStoredVisualModePref(JSON.stringify({ enabled: false })),
    ).toEqual({ enabled: false });
  });

  it("falls back to default when raw is corrupt JSON", () => {
    expect(parseStoredVisualModePref("{not json")).toEqual({
      enabled: false,
    });
  });

  it("treats non-boolean enabled as false", () => {
    expect(
      parseStoredVisualModePref(JSON.stringify({ enabled: "yes" })),
    ).toEqual({ enabled: false });
  });

  it("ignores extra fields", () => {
    expect(
      parseStoredVisualModePref(
        JSON.stringify({ enabled: true, garbage: "x" }),
      ),
    ).toEqual({ enabled: true });
  });

  it("handles JSON null payload by returning default", () => {
    expect(parseStoredVisualModePref("null")).toEqual({ enabled: false });
  });

  it("handles JSON array payload by returning default", () => {
    expect(parseStoredVisualModePref("[1,2,3]")).toEqual({ enabled: false });
  });

  // W22 stress loops mirror the W15 catalog.
  it("survives a 5000-char payload", () => {
    const long = JSON.stringify({
      enabled: true,
      junk: "x".repeat(5000),
    });
    expect(parseStoredVisualModePref(long)).toEqual({ enabled: true });
  });

  it("is deterministic across 1000 repeat calls", () => {
    const raw = JSON.stringify({ enabled: true });
    let last = parseStoredVisualModePref(raw);
    for (let i = 0; i < 1000; i += 1) {
      const next = parseStoredVisualModePref(raw);
      expect(next).toEqual(last);
      last = next;
    }
  });

  it("returns a fresh object reference (no shared state)", () => {
    const a = parseStoredVisualModePref(null);
    const b = parseStoredVisualModePref(null);
    expect(a).toEqual(b);
    a.enabled = true;
    expect(b.enabled).toBe(false);
  });
});
