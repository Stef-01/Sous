import { describe, expect, it } from "vitest";
import { blendPreferences } from "./use-taste-blend";

describe("blendPreferences", () => {
  const prefs = { italian: 0.8, spicy: -0.4, cozy: 1 };

  it("returns the original map unchanged when duo is off", () => {
    const result = blendPreferences(prefs, false, 0.2);
    expect(result).toEqual(prefs);
  });

  it("returns undefined when given undefined", () => {
    expect(blendPreferences(undefined, true, 0.5)).toBeUndefined();
  });

  it("scales every weight by alpha when duo is on", () => {
    const result = blendPreferences(prefs, true, 0.5);
    expect(result).toEqual({ italian: 0.4, spicy: -0.2, cozy: 0.5 });
  });

  it("collapses to all-zero when alpha is 0 (More theirs)", () => {
    const result = blendPreferences(prefs, true, 0);
    expect(result).toEqual({ italian: 0, spicy: 0, cozy: 0 });
  });

  it("passes through unchanged when alpha is 1 (More yours)", () => {
    const result = blendPreferences(prefs, true, 1);
    expect(result).toEqual(prefs);
  });

  it("clamps alpha above 1", () => {
    const result = blendPreferences(prefs, true, 2);
    expect(result).toEqual(prefs);
  });

  it("clamps alpha below 0", () => {
    const result = blendPreferences(prefs, true, -0.5);
    expect(result).toEqual({ italian: 0, spicy: 0, cozy: 0 });
  });

  it("does not mutate the input", () => {
    const snapshot = { ...prefs };
    blendPreferences(prefs, true, 0.5);
    expect(prefs).toEqual(snapshot);
  });
});
