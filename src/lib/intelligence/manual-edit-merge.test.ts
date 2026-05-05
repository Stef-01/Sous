import { describe, expect, it } from "vitest";
import type {
  ManualTags,
  PreferenceProfile,
  TagWeightMap,
} from "@/types/preference-profile";
import { freshPreferenceProfile } from "@/types/preference-profile";
import {
  applyEditAction,
  applySuppressionsToInferred,
  classifyManualState,
  isTagSuppressed,
  mergeAxis,
  mergePreferenceProfile,
} from "./manual-edit-merge";

const emptyManual: ManualTags = { likes: [], dislikes: [], suppressed: [] };

describe("mergeAxis", () => {
  it("passes inferred through when no manual edits", () => {
    const inferred: TagWeightMap = { italian: 0.7, thai: 0.4 };
    const out = mergeAxis({ inferred, manual: emptyManual });
    expect(out).toEqual({ italian: 0.7, thai: 0.4 });
  });

  it("hard-suppresses dislike tags to -1", () => {
    const inferred: TagWeightMap = { italian: 0.7, beef: 0.5 };
    const out = mergeAxis({
      inferred,
      manual: { ...emptyManual, dislikes: ["beef"] },
    });
    expect(out.beef).toBe(-1);
    expect(out.italian).toBe(0.7);
  });

  it("omits suppressed tags entirely (treated as neutral, not negative)", () => {
    const inferred: TagWeightMap = { italian: 0.7, fennel: 0.5 };
    const out = mergeAxis({
      inferred,
      manual: { ...emptyManual, suppressed: ["fennel"] },
    });
    expect("fennel" in out).toBe(false);
    expect(out.italian).toBe(0.7);
  });

  it("boosts liked tags to at least 0.7", () => {
    const inferred: TagWeightMap = { italian: 0.3 };
    const out = mergeAxis({
      inferred,
      manual: { ...emptyManual, likes: ["italian"] },
    });
    expect(out.italian).toBe(0.7);
  });

  it("preserves a higher inferred weight when liking it", () => {
    const inferred: TagWeightMap = { italian: 0.9 };
    const out = mergeAxis({
      inferred,
      manual: { ...emptyManual, likes: ["italian"] },
    });
    expect(out.italian).toBe(0.9);
  });

  it("introduces manual likes that have zero inferred signal", () => {
    const inferred: TagWeightMap = {};
    const out = mergeAxis({
      inferred,
      manual: { ...emptyManual, likes: ["thai"] },
    });
    expect(out.thai).toBe(0.7);
  });

  it("introduces manual dislikes that have zero inferred signal", () => {
    const inferred: TagWeightMap = {};
    const out = mergeAxis({
      inferred,
      manual: { ...emptyManual, dislikes: ["beef"] },
    });
    expect(out.beef).toBe(-1);
  });

  it("treats tag-matching as case-insensitive", () => {
    const inferred: TagWeightMap = { italian: 0.5 };
    const out = mergeAxis({
      inferred,
      manual: { ...emptyManual, likes: ["ITALIAN"] },
    });
    expect(out.italian).toBe(0.7);
  });

  it("trims whitespace on manual tags", () => {
    const inferred: TagWeightMap = {};
    const out = mergeAxis({
      inferred,
      manual: { ...emptyManual, likes: ["  thai  "] },
    });
    expect(out.thai).toBe(0.7);
  });

  it("dislike beats like when both lists contain the same tag (defensive)", () => {
    // Shouldn't happen via applyEditAction (it makes them mutually
    // exclusive), but if persisted state ever has both, dislike wins.
    const inferred: TagWeightMap = { beef: 0.5 };
    const out = mergeAxis({
      inferred,
      manual: { likes: ["beef"], dislikes: ["beef"], suppressed: [] },
    });
    expect(out.beef).toBe(-1);
  });

  it("clamps inferred-only weights to [-1, 1]", () => {
    const inferred: TagWeightMap = { x: 1.5, y: -1.5 };
    const out = mergeAxis({ inferred, manual: emptyManual });
    expect(out.x).toBe(1);
    expect(out.y).toBe(-1);
  });

  it("drops zero-weight inferred tags from output", () => {
    const inferred: TagWeightMap = { x: 0, y: 0.5 };
    const out = mergeAxis({ inferred, manual: emptyManual });
    expect("x" in out).toBe(false);
    expect(out.y).toBe(0.5);
  });
});

describe("mergePreferenceProfile", () => {
  it("merges all four axes uniformly", () => {
    const profile: PreferenceProfile = {
      ...freshPreferenceProfile(),
      inferredTags: {
        cuisines: { italian: 0.4 },
        flavors: { spicy: 0.6 },
        proteins: { chicken: 0.3 },
        dishClasses: { bowl: 0.5 },
      },
      manualTags: {
        likes: ["thai"],
        dislikes: ["beef"],
        suppressed: ["fennel"],
      },
    };
    const out = mergePreferenceProfile(profile);
    // Manual likes apply to every axis output (the function doesn't
    // know which axis a tag belongs to — that's by design).
    expect(out.cuisines.thai).toBe(0.7);
    expect(out.flavors.thai).toBe(0.7);
    // Inferred values pass through clamped.
    expect(out.cuisines.italian).toBe(0.4);
    expect(out.flavors.spicy).toBe(0.6);
    // Dislike applies as -1 across all axes.
    expect(out.cuisines.beef).toBe(-1);
  });
});

describe("applyEditAction", () => {
  it("'like' adds the tag and clears matching dislike/suppress", () => {
    const out = applyEditAction({
      manual: { likes: [], dislikes: ["thai"], suppressed: ["thai"] },
      action: { kind: "like", tag: "thai" },
    });
    expect(out.likes).toContain("thai");
    expect(out.dislikes).not.toContain("thai");
    expect(out.suppressed).not.toContain("thai");
  });

  it("'dislike' adds and clears the other lists", () => {
    const out = applyEditAction({
      manual: { likes: ["beef"], dislikes: [], suppressed: ["beef"] },
      action: { kind: "dislike", tag: "beef" },
    });
    expect(out.dislikes).toContain("beef");
    expect(out.likes).not.toContain("beef");
    expect(out.suppressed).not.toContain("beef");
  });

  it("'suppress' adds and clears the other lists", () => {
    const out = applyEditAction({
      manual: { likes: ["fennel"], dislikes: ["fennel"], suppressed: [] },
      action: { kind: "suppress", tag: "fennel" },
    });
    expect(out.suppressed).toContain("fennel");
    expect(out.likes).not.toContain("fennel");
    expect(out.dislikes).not.toContain("fennel");
  });

  it("'clear-like' removes only from the likes list", () => {
    const out = applyEditAction({
      manual: { likes: ["thai", "italian"], dislikes: [], suppressed: [] },
      action: { kind: "clear-like", tag: "thai" },
    });
    expect(out.likes).not.toContain("thai");
    expect(out.likes).toContain("italian");
  });

  it("does not duplicate when adding an existing tag", () => {
    const out = applyEditAction({
      manual: { likes: ["thai"], dislikes: [], suppressed: [] },
      action: { kind: "like", tag: "thai" },
    });
    expect(out.likes.filter((t) => t === "thai")).toHaveLength(1);
  });

  it("ignores empty-string tag inputs", () => {
    const before: ManualTags = {
      likes: ["thai"],
      dislikes: [],
      suppressed: [],
    };
    const out = applyEditAction({
      manual: before,
      action: { kind: "like", tag: "   " },
    });
    expect(out).toEqual(before);
  });

  it("normalises case + whitespace when adding", () => {
    const out = applyEditAction({
      manual: { likes: [], dislikes: [], suppressed: [] },
      action: { kind: "like", tag: "  THAI  " },
    });
    expect(out.likes).toEqual(["thai"]);
  });
});

describe("classifyManualState", () => {
  const manual: ManualTags = {
    likes: ["thai"],
    dislikes: ["beef"],
    suppressed: ["fennel"],
  };

  it("returns 'liked' for a liked tag", () => {
    expect(classifyManualState({ tag: "thai", manual })).toBe("liked");
  });

  it("returns 'disliked' for a disliked tag", () => {
    expect(classifyManualState({ tag: "beef", manual })).toBe("disliked");
  });

  it("returns 'suppressed' for a suppressed tag", () => {
    expect(classifyManualState({ tag: "fennel", manual })).toBe("suppressed");
  });

  it("returns 'none' for any tag not in the manual lists", () => {
    expect(classifyManualState({ tag: "italian", manual })).toBe("none");
  });

  it("matches case-insensitively", () => {
    expect(classifyManualState({ tag: "BEEF", manual })).toBe("disliked");
  });
});

describe("isTagSuppressed", () => {
  it("true for dislikes + suppressed; false for likes + neutral", () => {
    const manual: ManualTags = {
      likes: ["thai"],
      dislikes: ["beef"],
      suppressed: ["fennel"],
    };
    expect(isTagSuppressed({ tag: "beef", manual })).toBe(true);
    expect(isTagSuppressed({ tag: "fennel", manual })).toBe(true);
    expect(isTagSuppressed({ tag: "thai", manual })).toBe(false);
    expect(isTagSuppressed({ tag: "italian", manual })).toBe(false);
  });
});

describe("applySuppressionsToInferred", () => {
  it("removes suppressed + disliked tags from every axis", () => {
    const out = applySuppressionsToInferred({
      inferred: {
        cuisines: { italian: 0.5, thai: 0.7 },
        flavors: { spicy: 0.6, fennel: 0.3 },
        proteins: { beef: 0.4, chicken: 0.5 },
        dishClasses: { bowl: 0.5 },
      },
      manual: {
        likes: [],
        dislikes: ["beef"],
        suppressed: ["fennel"],
      },
    });
    expect("beef" in out.proteins).toBe(false);
    expect("fennel" in out.flavors).toBe(false);
    // Other tags survive.
    expect(out.cuisines.italian).toBe(0.5);
    expect(out.proteins.chicken).toBe(0.5);
  });
});
