import { describe, expect, it } from "vitest";
import {
  parseStoredPreferenceState,
  PREFERENCE_PROFILE_STORAGE_KEY,
} from "./use-preference-profile";
import { PREFERENCE_PROFILE_SCHEMA_VERSION } from "@/types/preference-profile";

describe("parseStoredPreferenceState", () => {
  it("returns fresh shape on null/undefined/empty", () => {
    expect(parseStoredPreferenceState(null).signals).toEqual([]);
    expect(parseStoredPreferenceState(undefined).signals).toEqual([]);
    expect(parseStoredPreferenceState("").manualTags.likes).toEqual([]);
  });

  it("returns fresh shape on malformed JSON", () => {
    expect(parseStoredPreferenceState("{not json").signals).toEqual([]);
  });

  it("returns fresh on schema-version mismatch", () => {
    const stale = JSON.stringify({
      v: 99,
      signals: [
        {
          id: "s-1",
          kind: "cooked",
          capturedAt: "2026-05-01T00:00:00Z",
          facets: {
            cuisine: "indian",
            flavors: [],
            proteins: [],
            dishClass: "",
            ingredients: [],
          },
          timeOfDay: "dinner",
          dayOfWeek: 1,
        },
      ],
      manualTags: { likes: ["thai"], dislikes: [], suppressed: [] },
    });
    expect(parseStoredPreferenceState(stale).signals).toEqual([]);
    expect(parseStoredPreferenceState(stale).manualTags.likes).toEqual([]);
  });

  it("preserves valid signals + manualTags round-trip", () => {
    const valid = JSON.stringify({
      v: PREFERENCE_PROFILE_SCHEMA_VERSION,
      signals: [
        {
          id: "s-1",
          kind: "swipe-right",
          capturedAt: "2026-05-01T10:00:00Z",
          facets: {
            cuisine: "italian",
            flavors: ["umami"],
            proteins: ["chicken"],
            dishClass: "pasta",
            ingredients: [],
          },
          timeOfDay: "dinner",
          dayOfWeek: 3,
        },
      ],
      manualTags: { likes: ["thai"], dislikes: ["beef"], suppressed: [] },
    });
    const parsed = parseStoredPreferenceState(valid);
    expect(parsed.signals).toHaveLength(1);
    expect(parsed.signals[0].kind).toBe("swipe-right");
    expect(parsed.manualTags.likes).toEqual(["thai"]);
    expect(parsed.manualTags.dislikes).toEqual(["beef"]);
  });

  it("drops malformed signals individually (partial recovery)", () => {
    const mixed = JSON.stringify({
      v: PREFERENCE_PROFILE_SCHEMA_VERSION,
      signals: [
        {
          id: "good",
          kind: "cooked",
          capturedAt: "2026-05-01T10:00:00Z",
          facets: {
            cuisine: "indian",
            flavors: [],
            proteins: [],
            dishClass: "",
            ingredients: [],
          },
          timeOfDay: "dinner",
          dayOfWeek: 1,
        },
        { id: 42, kind: null }, // malformed
        null,
        "garbage",
      ],
      manualTags: { likes: [], dislikes: [], suppressed: [] },
    });
    const parsed = parseStoredPreferenceState(mixed);
    expect(parsed.signals).toHaveLength(1);
    expect(parsed.signals[0].id).toBe("good");
  });

  it("filters non-string entries from manualTags lists (defensive)", () => {
    const corrupt = JSON.stringify({
      v: PREFERENCE_PROFILE_SCHEMA_VERSION,
      signals: [],
      manualTags: {
        likes: ["thai", 42, null, "italian"],
        dislikes: [undefined, "beef"],
        suppressed: ["fennel"],
      },
    });
    const parsed = parseStoredPreferenceState(corrupt);
    expect(parsed.manualTags.likes).toEqual(["thai", "italian"]);
    expect(parsed.manualTags.dislikes).toEqual(["beef"]);
    expect(parsed.manualTags.suppressed).toEqual(["fennel"]);
  });

  it("treats non-object payload as fresh", () => {
    expect(parseStoredPreferenceState("[]").signals).toEqual([]);
    expect(parseStoredPreferenceState("42").signals).toEqual([]);
    expect(parseStoredPreferenceState("null").signals).toEqual([]);
  });

  it("treats missing manualTags shape as empty", () => {
    const partial = JSON.stringify({
      v: PREFERENCE_PROFILE_SCHEMA_VERSION,
      signals: [],
    });
    const parsed = parseStoredPreferenceState(partial);
    expect(parsed.manualTags).toEqual({
      likes: [],
      dislikes: [],
      suppressed: [],
    });
  });
});

describe("PREFERENCE_PROFILE_STORAGE_KEY", () => {
  it("is the v1 namespaced storage key", () => {
    expect(PREFERENCE_PROFILE_STORAGE_KEY).toBe("sous-preference-profile-v1");
  });
});
