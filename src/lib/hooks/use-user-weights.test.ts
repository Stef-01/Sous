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
});
