import { describe, expect, it } from "vitest";
import { deriveSeasonalTags, enrichTagsWithSeasonal } from "./seasonal-tags";

// ── deriveSeasonalTags ─────────────────────────────────────

describe("deriveSeasonalTags — empty / null", () => {
  it("empty tags + no description → []", () => {
    expect(deriveSeasonalTags({ tags: [] })).toEqual([]);
  });

  it("empty tags + null description → []", () => {
    expect(deriveSeasonalTags({ tags: [], description: null })).toEqual([]);
  });

  it("unrelated tags + bland description → []", () => {
    expect(
      deriveSeasonalTags({
        tags: ["italian", "side"],
        description: "A nice dish.",
      }),
    ).toEqual([]);
  });
});

describe("deriveSeasonalTags — winter-warming", () => {
  it("'soup' tag → winter-warming", () => {
    expect(deriveSeasonalTags({ tags: ["soup"] })).toContain("winter-warming");
  });

  it("'stew' tag → winter-warming", () => {
    expect(deriveSeasonalTags({ tags: ["stew"] })).toContain("winter-warming");
  });

  it("'roasted' tag → winter-warming", () => {
    expect(deriveSeasonalTags({ tags: ["roasted"] })).toContain(
      "winter-warming",
    );
  });

  it("description 'slow-cooked and hearty' → winter-warming", () => {
    expect(
      deriveSeasonalTags({
        tags: ["beef"],
        description: "Slow-cooked and hearty for cold nights.",
      }),
    ).toContain("winter-warming");
  });

  it("case-insensitive tag match", () => {
    expect(deriveSeasonalTags({ tags: ["SOUP"] })).toContain("winter-warming");
  });
});

describe("deriveSeasonalTags — summer-fresh", () => {
  it("'salad' tag → summer-fresh", () => {
    expect(deriveSeasonalTags({ tags: ["salad"] })).toContain("summer-fresh");
  });

  it("'gazpacho' tag → summer-fresh", () => {
    expect(deriveSeasonalTags({ tags: ["gazpacho"] })).toContain(
      "summer-fresh",
    );
  });

  it("'ceviche' tag → summer-fresh", () => {
    expect(deriveSeasonalTags({ tags: ["ceviche"] })).toContain("summer-fresh");
  });

  it("description 'fresh and refreshing' → summer-fresh", () => {
    expect(
      deriveSeasonalTags({
        tags: ["vegetable"],
        description: "Fresh and refreshing on a hot day.",
      }),
    ).toContain("summer-fresh");
  });

  it("'no-cook' tag → summer-fresh", () => {
    expect(deriveSeasonalTags({ tags: ["no-cook"] })).toContain("summer-fresh");
  });
});

describe("deriveSeasonalTags — spring-fresh", () => {
  it("'asparagus' tag → spring-fresh", () => {
    expect(deriveSeasonalTags({ tags: ["asparagus"] })).toContain(
      "spring-fresh",
    );
  });

  it("'peas' tag → spring-fresh", () => {
    expect(deriveSeasonalTags({ tags: ["peas"] })).toContain("spring-fresh");
  });

  it("'ramps' tag → spring-fresh", () => {
    expect(deriveSeasonalTags({ tags: ["ramps"] })).toContain("spring-fresh");
  });
});

describe("deriveSeasonalTags — autumn-pick", () => {
  it("'squash' tag → autumn-pick", () => {
    expect(deriveSeasonalTags({ tags: ["squash"] })).toContain("autumn-pick");
  });

  it("'pumpkin' tag → autumn-pick", () => {
    expect(deriveSeasonalTags({ tags: ["pumpkin"] })).toContain("autumn-pick");
  });

  it("'harvest' tag → autumn-pick", () => {
    expect(deriveSeasonalTags({ tags: ["harvest"] })).toContain("autumn-pick");
  });
});

describe("deriveSeasonalTags — multi-season", () => {
  it("'spring pea soup' tags → spring-fresh + winter-warming", () => {
    const out = deriveSeasonalTags({ tags: ["soup", "peas", "spring"] });
    expect(out).toContain("spring-fresh");
    expect(out).toContain("winter-warming");
  });

  it("'roasted squash' tags → autumn-pick + winter-warming", () => {
    const out = deriveSeasonalTags({ tags: ["roasted", "squash"] });
    expect(out).toContain("autumn-pick");
    expect(out).toContain("winter-warming");
  });

  it("a candidate that hits no hints stays empty", () => {
    expect(
      deriveSeasonalTags({
        tags: ["italian", "rice", "pasta"],
        description: "A simple dish.",
      }),
    ).toEqual([]);
  });
});

// ── enrichTagsWithSeasonal ────────────────────────────────

describe("enrichTagsWithSeasonal", () => {
  it("returns a new array (no mutation)", () => {
    const tags = ["soup", "italian"];
    const out = enrichTagsWithSeasonal({ tags });
    expect(out).not.toBe(tags);
    expect(tags).toEqual(["soup", "italian"]);
  });

  it("appends derived seasonal tags after the originals", () => {
    const out = enrichTagsWithSeasonal({ tags: ["soup", "italian"] });
    expect(out).toContain("soup");
    expect(out).toContain("italian");
    expect(out).toContain("winter-warming");
  });

  it("no derivation → original tags preserved", () => {
    const out = enrichTagsWithSeasonal({ tags: ["italian", "rice"] });
    expect(out).toEqual(["italian", "rice"]);
  });

  it("normalises to lowercase + dedupes", () => {
    const out = enrichTagsWithSeasonal({
      tags: ["Soup", "soup", "italian", "ITALIAN"],
    });
    // Should appear once each, lowercased
    expect(out.filter((t) => t === "soup").length).toBe(1);
    expect(out.filter((t) => t === "italian").length).toBe(1);
    expect(out).toContain("winter-warming");
  });

  it("missing description still works (uses tags only)", () => {
    const out = enrichTagsWithSeasonal({ tags: ["salad"] });
    expect(out).toContain("summer-fresh");
  });
});
