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

  it("round-trips a multi-recipe overlay map intact", () => {
    const original: Record<string, RecipeStepNote> = {
      "pad-thai::0": {
        recipeSlug: "pad-thai",
        stepIndex: 0,
        note: "halve the chili on the kid plate",
        updatedAt: "2026-05-04T12:00:00.000Z",
      },
      "bibimbap::3": {
        recipeSlug: "bibimbap",
        stepIndex: 3,
        note: "kid bowl: rice + egg + mild gochujang on the side",
        updatedAt: "2026-05-04T12:30:00.000Z",
      },
    };
    const serialized = JSON.stringify(original);
    const parsed = parseStoredOverlays(serialized);
    expect(Object.keys(parsed).sort()).toEqual(Object.keys(original).sort());
    expect(parsed["pad-thai::0"]?.note).toBe(original["pad-thai::0"]?.note);
    expect(parsed["bibimbap::3"]?.stepIndex).toBe(3);
  });

  it("preserves UTF-8 in notes (round-trip with accented characters)", () => {
    const note = "jalapeño / café au lait / a tiny pinch of garlic — done";
    const raw = JSON.stringify({
      "pasta-carbonara::2": {
        recipeSlug: "pasta-carbonara",
        stepIndex: 2,
        note,
        updatedAt: "2026-05-04T00:00:00Z",
      },
    });
    const parsed = parseStoredOverlays(raw);
    expect(parsed["pasta-carbonara::2"]?.note).toBe(note);
  });
});
