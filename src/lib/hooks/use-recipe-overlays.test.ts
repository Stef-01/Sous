import { describe, expect, it } from "vitest";
import {
  overlayKey,
  parseStoredOverlays,
  RECIPE_OVERLAYS_STORAGE_KEY,
  type RecipeStepNote,
} from "./use-recipe-overlays";

describe("overlayKey", () => {
  it("joins slug and step with :: separator", () => {
    expect(overlayKey("pad-thai", 0)).toBe("pad-thai::0");
    expect(overlayKey("butter-chicken", 5)).toBe("butter-chicken::5");
  });
});

describe("RECIPE_OVERLAYS_STORAGE_KEY", () => {
  it("uses a versioned key", () => {
    expect(RECIPE_OVERLAYS_STORAGE_KEY).toMatch(/v\d+$/);
  });
});

describe("parseStoredOverlays", () => {
  it("returns empty object for null / malformed", () => {
    expect(parseStoredOverlays(null)).toEqual({});
    expect(parseStoredOverlays("{not")).toEqual({});
    expect(parseStoredOverlays("[1,2]")).toEqual({});
  });

  it("filters out non-conforming entries silently", () => {
    const raw = JSON.stringify({
      "pad-thai::0": {
        recipeSlug: "pad-thai",
        stepIndex: 0,
        note: "kid plate: skip the chili",
        updatedAt: "2026-05-04T00:00:00Z",
      },
      "butter-chicken::1": { recipeSlug: "butter-chicken" }, // missing fields
      "broken::nope": "string-value", // wrong type
    });
    const result = parseStoredOverlays(raw);
    const keys = Object.keys(result);
    expect(keys).toEqual(["pad-thai::0"]);
    expect((result["pad-thai::0"] as RecipeStepNote).note).toContain(
      "kid plate",
    );
  });
});
