import { describe, expect, it } from "vitest";
import {
  isSpiceTolerance,
  parseStoredSpiceTolerance,
  SPICE_TOLERANCE_DEFAULT,
  SPICE_TOLERANCE_STORAGE_KEY,
} from "./use-spice-tolerance";

describe("SPICE_TOLERANCE_STORAGE_KEY", () => {
  it("uses a versioned key", () => {
    expect(SPICE_TOLERANCE_STORAGE_KEY).toMatch(/v\d+$/);
  });
});

describe("isSpiceTolerance", () => {
  it("accepts 1..5", () => {
    for (const v of [1, 2, 3, 4, 5]) expect(isSpiceTolerance(v)).toBe(true);
  });
  it("rejects out-of-range and non-integers", () => {
    for (const v of [0, 6, 3.5, -1, "3", null, undefined, {}]) {
      expect(isSpiceTolerance(v)).toBe(false);
    }
  });
});

describe("parseStoredSpiceTolerance", () => {
  it("returns default when null", () => {
    expect(parseStoredSpiceTolerance(null)).toBe(SPICE_TOLERANCE_DEFAULT);
  });
  it("returns default for malformed JSON", () => {
    expect(parseStoredSpiceTolerance("{not")).toBe(SPICE_TOLERANCE_DEFAULT);
  });
  it("returns default for out-of-range stored value", () => {
    expect(parseStoredSpiceTolerance("0")).toBe(SPICE_TOLERANCE_DEFAULT);
    expect(parseStoredSpiceTolerance("6")).toBe(SPICE_TOLERANCE_DEFAULT);
  });
  it("preserves a valid stored value", () => {
    expect(parseStoredSpiceTolerance("4")).toBe(4);
  });
});
