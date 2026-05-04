import { describe, expect, it } from "vitest";
import { parseStoredUserWeights } from "./use-user-weights";
import { DEFAULT_WEIGHTS } from "@/lib/engine/types";

describe("parseStoredUserWeights", () => {
  it("returns defaults for null / undefined / empty", () => {
    expect(parseStoredUserWeights(null).weights).toEqual(DEFAULT_WEIGHTS);
    expect(parseStoredUserWeights(undefined).weights).toEqual(DEFAULT_WEIGHTS);
    expect(parseStoredUserWeights("").weights).toEqual(DEFAULT_WEIGHTS);
  });

  it("returns defaults for non-JSON", () => {
    expect(parseStoredUserWeights("{not-json").weights).toEqual(
      DEFAULT_WEIGHTS,
    );
  });

  it("returns defaults for JSON null / array / primitive", () => {
    expect(parseStoredUserWeights("null").weights).toEqual(DEFAULT_WEIGHTS);
    expect(parseStoredUserWeights("[]").weights).toEqual(DEFAULT_WEIGHTS);
    expect(parseStoredUserWeights("42").weights).toEqual(DEFAULT_WEIGHTS);
  });

  it("returns defaults when schemaVersion mismatches", () => {
    const raw = JSON.stringify({
      schemaVersion: 999,
      weights: { ...DEFAULT_WEIGHTS },
    });
    expect(parseStoredUserWeights(raw).weights).toEqual(DEFAULT_WEIGHTS);
  });

  it("returns defaults when a dimension is missing", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      weights: {
        cuisineFit: 0.3,
        flavorContrast: 0.2,
        // nutritionBalance missing
        prepBurden: 0.15,
        temperature: 0.1,
        preference: 0.25,
      },
    });
    expect(parseStoredUserWeights(raw).weights).toEqual(DEFAULT_WEIGHTS);
  });

  it("returns defaults when a dimension is negative", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      weights: { ...DEFAULT_WEIGHTS, cuisineFit: -0.1 },
    });
    expect(parseStoredUserWeights(raw).weights).toEqual(DEFAULT_WEIGHTS);
  });

  it("returns defaults when a dimension is NaN / Infinity", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      weights: { ...DEFAULT_WEIGHTS, cuisineFit: "garbage" },
    });
    expect(parseStoredUserWeights(raw).weights).toEqual(DEFAULT_WEIGHTS);
  });

  it("preserves valid weights round-trip", () => {
    const incoming = {
      cuisineFit: 0.3,
      flavorContrast: 0.2,
      nutritionBalance: 0.15,
      prepBurden: 0.15,
      temperature: 0.1,
      preference: 0.1,
    };
    const raw = JSON.stringify({
      schemaVersion: 1,
      weights: incoming,
      samples: 7,
      trainedAt: "2026-04-01T12:00:00Z",
    });
    const parsed = parseStoredUserWeights(raw);
    expect(parsed.weights).toEqual(incoming);
    expect(parsed.samples).toBe(7);
    expect(parsed.trainedAt).toBe("2026-04-01T12:00:00Z");
  });

  it("falls back to default samples / trainedAt when missing", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      weights: { ...DEFAULT_WEIGHTS },
    });
    const parsed = parseStoredUserWeights(raw);
    expect(parsed.samples).toBe(0);
    expect(parsed.trainedAt).toBe(new Date(0).toISOString());
  });

  it("returns a fresh object every call (no shared mutable state)", () => {
    const a = parseStoredUserWeights(null);
    const b = parseStoredUserWeights(null);
    expect(a).not.toBe(b);
    expect(a.weights).not.toBe(b.weights);
  });

  // Round-4 Partial<ScoreBreakdown> tolerance ─────────────

  it("accepts a 6-key payload (pre-Round-4) without seasonal/antiMonotony", () => {
    const incoming = {
      cuisineFit: 0.3,
      flavorContrast: 0.2,
      nutritionBalance: 0.15,
      prepBurden: 0.15,
      temperature: 0.1,
      preference: 0.1,
    };
    const raw = JSON.stringify({
      schemaVersion: 1,
      weights: incoming,
      samples: 5,
      trainedAt: "2026-04-01T12:00:00Z",
    });
    const parsed = parseStoredUserWeights(raw);
    // 6 required dims preserved; seasonal/antiMonotony absent
    // (deleted) so the round-trip equality holds.
    expect(parsed.weights).toEqual(incoming);
  });

  it("round-trips an 8-key payload (Round 4) including seasonal/antiMonotony", () => {
    const incoming = {
      cuisineFit: 0.22,
      flavorContrast: 0.22,
      nutritionBalance: 0.13,
      prepBurden: 0.13,
      temperature: 0.08,
      preference: 0.08,
      seasonal: 0.07,
      antiMonotony: 0.07,
    };
    const raw = JSON.stringify({
      schemaVersion: 1,
      weights: incoming,
      samples: 12,
      trainedAt: "2026-05-01T12:00:00Z",
    });
    const parsed = parseStoredUserWeights(raw);
    expect(parsed.weights).toEqual(incoming);
  });

  it("drops invalid seasonal/antiMonotony values without nuking required dims", () => {
    // Mixed payload: required dims valid, optional dims corrupt.
    // Should preserve the required 6 + omit the bad optional 2.
    const raw = JSON.stringify({
      schemaVersion: 1,
      weights: {
        cuisineFit: 0.25,
        flavorContrast: 0.25,
        nutritionBalance: 0.15,
        prepBurden: 0.15,
        temperature: 0.1,
        preference: 0.1,
        seasonal: -1, // invalid: negative
        antiMonotony: "oops" as unknown as number, // invalid: not a number
      },
      samples: 3,
    });
    const parsed = parseStoredUserWeights(raw);
    expect(parsed.weights.cuisineFit).toBe(0.25);
    expect(parsed.weights.preference).toBe(0.1);
    // Bad optionals deleted.
    expect("seasonal" in parsed.weights).toBe(false);
    expect("antiMonotony" in parsed.weights).toBe(false);
  });

  it("drops a NaN/Infinity in seasonal but keeps the rest valid", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      weights: {
        cuisineFit: 0.22,
        flavorContrast: 0.22,
        nutritionBalance: 0.13,
        prepBurden: 0.13,
        temperature: 0.08,
        preference: 0.08,
        seasonal: Number.POSITIVE_INFINITY,
        antiMonotony: 0.07,
      },
    });
    const parsed = parseStoredUserWeights(raw);
    expect("seasonal" in parsed.weights).toBe(false);
    expect(parsed.weights.antiMonotony).toBe(0.07);
  });
});
