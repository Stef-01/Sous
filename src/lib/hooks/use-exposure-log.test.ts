import { describe, expect, it } from "vitest";
import {
  classifyExposure,
  EXPOSURE_LOG_STORAGE_KEY,
  EXPOSURE_THRESHOLD_BIRCH_HIGH,
  EXPOSURE_THRESHOLD_LIKELY_ACCEPTANCE,
  parseStoredLog,
} from "./use-exposure-log";

describe("EXPOSURE_LOG_STORAGE_KEY", () => {
  it("uses a versioned key", () => {
    expect(EXPOSURE_LOG_STORAGE_KEY).toMatch(/v\d+$/);
  });
});

describe("parseStoredLog", () => {
  it("returns empty object for null / malformed", () => {
    expect(parseStoredLog(null)).toEqual({});
    expect(parseStoredLog("{not")).toEqual({});
    expect(parseStoredLog("[1,2,3]")).toEqual({});
    expect(parseStoredLog("null")).toEqual({});
  });

  it("preserves non-negative integer counts", () => {
    expect(parseStoredLog('{"broccoli": 3, "lentils": 0}')).toEqual({
      broccoli: 3,
      lentils: 0,
    });
  });

  it("drops invalid count values silently", () => {
    expect(
      parseStoredLog(
        '{"broccoli": 3, "lentils": "five", "kale": -2, "kohlrabi": 1.7}',
      ),
    ).toEqual({ broccoli: 3, kohlrabi: 1 });
  });
});

describe("classifyExposure", () => {
  it("returns 'early' below the lower threshold", () => {
    for (let i = 0; i < EXPOSURE_THRESHOLD_LIKELY_ACCEPTANCE; i++) {
      expect(classifyExposure(i)).toBe("early");
    }
  });
  it("returns 'likely' between lower and Birch upper bound (inclusive)", () => {
    expect(classifyExposure(EXPOSURE_THRESHOLD_LIKELY_ACCEPTANCE)).toBe(
      "likely",
    );
    expect(classifyExposure(EXPOSURE_THRESHOLD_BIRCH_HIGH)).toBe("likely");
  });
  it("returns 'well-exposed' above Birch upper bound", () => {
    expect(classifyExposure(EXPOSURE_THRESHOLD_BIRCH_HIGH + 1)).toBe(
      "well-exposed",
    );
  });
});
