import { describe, expect, it } from "vitest";
import {
  parseStoredTheme,
  resolveActiveTheme,
  serialiseTheme,
} from "./use-theme";

// ── parseStoredTheme ─────────────────────────────────────

describe("parseStoredTheme", () => {
  it("null / undefined / empty → 'light' default", () => {
    expect(parseStoredTheme(null)).toBe("light");
    expect(parseStoredTheme(undefined)).toBe("light");
    expect(parseStoredTheme("")).toBe("light");
  });

  it("malformed JSON → 'light'", () => {
    expect(parseStoredTheme("{not-json")).toBe("light");
  });

  it("non-object JSON → 'light'", () => {
    expect(parseStoredTheme("[]")).toBe("light");
    expect(parseStoredTheme("42")).toBe("light");
    expect(parseStoredTheme("null")).toBe("light");
  });

  it("schema-version mismatch → 'light'", () => {
    const raw = JSON.stringify({ schemaVersion: 99, choice: "dark" });
    expect(parseStoredTheme(raw)).toBe("light");
  });

  it("unknown choice value → 'light'", () => {
    const raw = JSON.stringify({ schemaVersion: 1, choice: "neon" });
    expect(parseStoredTheme(raw)).toBe("light");
  });

  it("valid 'dark' round-trips", () => {
    expect(parseStoredTheme(serialiseTheme("dark"))).toBe("dark");
  });

  it("valid 'system' round-trips", () => {
    expect(parseStoredTheme(serialiseTheme("system"))).toBe("system");
  });

  it("valid 'light' round-trips", () => {
    expect(parseStoredTheme(serialiseTheme("light"))).toBe("light");
  });
});

// ── resolveActiveTheme ───────────────────────────────────

describe("resolveActiveTheme", () => {
  it("'light' choice → light regardless of system", () => {
    expect(resolveActiveTheme("light", true)).toBe("light");
    expect(resolveActiveTheme("light", false)).toBe("light");
  });

  it("'dark' choice → dark regardless of system", () => {
    expect(resolveActiveTheme("dark", true)).toBe("dark");
    expect(resolveActiveTheme("dark", false)).toBe("dark");
  });

  it("'system' choice → follows OS preference", () => {
    expect(resolveActiveTheme("system", true)).toBe("dark");
    expect(resolveActiveTheme("system", false)).toBe("light");
  });
});

// ── serialiseTheme ───────────────────────────────────────

describe("serialiseTheme", () => {
  it("emits a versioned payload", () => {
    const out = serialiseTheme("dark");
    const parsed = JSON.parse(out);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.choice).toBe("dark");
  });

  it("round-trips through parseStoredTheme", () => {
    for (const choice of ["light", "dark", "system"] as const) {
      expect(parseStoredTheme(serialiseTheme(choice))).toBe(choice);
    }
  });
});
