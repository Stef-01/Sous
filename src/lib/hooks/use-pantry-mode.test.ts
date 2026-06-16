import { describe, it, expect } from "vitest";
import {
  parsePantryMode,
  DEFAULT_PANTRY_MODE,
  PANTRY_TOLERANCE_MAX,
} from "./use-pantry-mode";

describe("parsePantryMode", () => {
  it("returns the default for null / non-JSON", () => {
    expect(parsePantryMode(null)).toEqual(DEFAULT_PANTRY_MODE);
    expect(parsePantryMode("not json")).toEqual(DEFAULT_PANTRY_MODE);
  });

  it("parses a stored value", () => {
    expect(
      parsePantryMode(JSON.stringify({ enabled: true, tolerance: 5 })),
    ).toEqual({ enabled: true, tolerance: 5 });
  });

  it("clamps + rounds tolerance into range", () => {
    expect(
      parsePantryMode(JSON.stringify({ enabled: true, tolerance: 99 }))
        .tolerance,
    ).toBe(PANTRY_TOLERANCE_MAX);
    expect(
      parsePantryMode(JSON.stringify({ enabled: true, tolerance: -4 }))
        .tolerance,
    ).toBe(0);
    expect(
      parsePantryMode(JSON.stringify({ enabled: true, tolerance: 2.7 }))
        .tolerance,
    ).toBe(3);
  });

  it("falls back for missing / wrong-typed fields", () => {
    expect(parsePantryMode(JSON.stringify({ enabled: true })).tolerance).toBe(
      DEFAULT_PANTRY_MODE.tolerance,
    );
    expect(
      parsePantryMode(JSON.stringify({ enabled: "yes", tolerance: 3 })).enabled,
    ).toBe(false);
  });
});
