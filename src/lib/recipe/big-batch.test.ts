import { describe, expect, it } from "vitest";
import {
  findSuccessorRecipe,
  formatLeftoverChipCopy,
  isBigBatchRecipe,
  type BigBatchTag,
  type SuccessorCandidate,
} from "./big-batch";

const tagTable: BigBatchTag[] = [
  {
    recipeSlug: "rotisserie-chicken",
    leftoverLabel: "rotisserie chicken meat",
    expectedLeftoverItems: ["chicken-meat"],
    successorRecipeSlugs: [
      "chicken-rice-bowl",
      "chicken-salad-wrap",
      "chicken-noodle-soup",
    ],
  },
  {
    recipeSlug: "marinara-batch",
    leftoverLabel: "leftover marinara",
    expectedLeftoverItems: ["tomato-sauce"],
    successorRecipeSlugs: ["spaghetti-marinara", "shakshuka"],
  },
];

const successorTable: SuccessorCandidate[] = [
  {
    recipeSlug: "chicken-rice-bowl",
    requiredIngredients: ["chicken meat", "rice"],
  },
  {
    recipeSlug: "chicken-salad-wrap",
    requiredIngredients: ["chicken meat", "tortilla", "lettuce", "mayo"],
  },
  {
    recipeSlug: "chicken-noodle-soup",
    requiredIngredients: ["chicken meat", "noodles", "broth", "carrot"],
  },
  {
    recipeSlug: "spaghetti-marinara",
    requiredIngredients: ["spaghetti", "tomato sauce"],
  },
  {
    recipeSlug: "shakshuka",
    requiredIngredients: ["tomato sauce", "egg", "onion"],
  },
];

// ── isBigBatchRecipe ──────────────────────────────────────

describe("isBigBatchRecipe", () => {
  it("tagged slug → true", () => {
    expect(isBigBatchRecipe("rotisserie-chicken", tagTable)).toBe(true);
  });

  it("untagged slug → false", () => {
    expect(isBigBatchRecipe("caesar-salad", tagTable)).toBe(false);
  });

  it("empty tag table → false", () => {
    expect(isBigBatchRecipe("rotisserie-chicken", [])).toBe(false);
  });
});

// ── findSuccessorRecipe ──────────────────────────────────

describe("findSuccessorRecipe — happy paths", () => {
  it("rotisserie chicken + full pantry → picks highest-coverage successor", () => {
    const out = findSuccessorRecipe({
      cookedSlug: "rotisserie-chicken",
      pantry: [
        "chicken meat",
        "rice",
        "tortilla",
        "lettuce",
        "mayo",
        "noodles",
        "broth",
        "carrot",
      ],
      recentCookSlugs: [],
      tagTable,
      successorTable,
    });
    expect(out.ok).toBe(true);
    if (out.ok) {
      // chicken-rice-bowl needs 2/2; chicken-salad-wrap needs 4/4;
      // chicken-noodle-soup needs 4/4. With ties, alphabetical
      // tiebreaker → chicken-noodle-soup (c-n-s < c-r-b in alpha order).
      expect(out.slug).toBe("chicken-noodle-soup");
    }
  });

  it("partial pantry → picks the successor with best coverage", () => {
    const out = findSuccessorRecipe({
      cookedSlug: "rotisserie-chicken",
      pantry: ["chicken meat", "rice"],
      recentCookSlugs: [],
      tagTable,
      successorTable,
    });
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.slug).toBe("chicken-rice-bowl");
    }
  });

  it("includes the leftover label in the result", () => {
    const out = findSuccessorRecipe({
      cookedSlug: "rotisserie-chicken",
      pantry: ["chicken meat", "rice"],
      recentCookSlugs: [],
      tagTable,
      successorTable,
    });
    if (out.ok) {
      expect(out.leftoverLabel).toBe("rotisserie chicken meat");
    }
  });

  it("alphabetical tie-break when coverage equal", () => {
    const out = findSuccessorRecipe({
      cookedSlug: "marinara-batch",
      pantry: ["spaghetti", "tomato sauce", "egg", "onion"],
      recentCookSlugs: [],
      tagTable,
      successorTable,
    });
    if (out.ok) {
      // both 100%; shakshuka < spaghetti-marinara alphabetically
      expect(out.slug).toBe("shakshuka");
    }
  });
});

describe("findSuccessorRecipe — refusal paths", () => {
  it("non-big-batch slug → ok=false", () => {
    const out = findSuccessorRecipe({
      cookedSlug: "caesar-salad",
      pantry: [],
      recentCookSlugs: [],
      tagTable,
      successorTable,
    });
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.reason.toLowerCase()).toContain("not tagged");
    }
  });

  it("recent-cook history excludes all successors → ok=false", () => {
    const out = findSuccessorRecipe({
      cookedSlug: "rotisserie-chicken",
      pantry: [
        "chicken meat",
        "rice",
        "tortilla",
        "lettuce",
        "mayo",
        "noodles",
        "broth",
        "carrot",
      ],
      recentCookSlugs: [
        "chicken-rice-bowl",
        "chicken-salad-wrap",
        "chicken-noodle-soup",
      ],
      tagTable,
      successorTable,
    });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason.toLowerCase()).toContain("recent-cook");
  });

  it("low pantry coverage (< 70%) → ok=false (no shopping trip)", () => {
    const out = findSuccessorRecipe({
      cookedSlug: "rotisserie-chicken",
      pantry: ["chicken meat"], // 1/2 for rice-bowl, 1/4 for others
      recentCookSlugs: [],
      tagTable,
      successorTable,
    });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toContain("70%");
  });

  it("avoids picking a recently-cooked successor", () => {
    const out = findSuccessorRecipe({
      cookedSlug: "rotisserie-chicken",
      pantry: ["chicken meat", "rice", "tortilla", "lettuce", "mayo"],
      recentCookSlugs: ["chicken-noodle-soup"], // exclude soup
      tagTable,
      successorTable,
    });
    if (out.ok) {
      expect(out.slug).not.toBe("chicken-noodle-soup");
    }
  });
});

// ── formatLeftoverChipCopy ───────────────────────────────

describe("formatLeftoverChipCopy", () => {
  it("includes leftover + successor name", () => {
    expect(
      formatLeftoverChipCopy({
        leftoverLabel: "rotisserie chicken meat",
        successorDisplayName: "chicken rice bowl",
      }),
    ).toBe("rotisserie chicken meat for tomorrow's chicken rice bowl? →");
  });

  it("missing leftover label → simpler copy", () => {
    expect(
      formatLeftoverChipCopy({
        leftoverLabel: "",
        successorDisplayName: "rice bowl",
      }),
    ).toBe("Tomorrow's lunch: rice bowl →");
  });

  it("trims whitespace in inputs", () => {
    expect(
      formatLeftoverChipCopy({
        leftoverLabel: "  marinara  ",
        successorDisplayName: "  pasta  ",
      }),
    ).toContain("marinara");
  });

  it("never uses FOMO framing — curiosity-styled", () => {
    const out = formatLeftoverChipCopy({
      leftoverLabel: "leftover chicken",
      successorDisplayName: "chicken sandwich",
    });
    // Tone discipline: no "everyone is" / "you should" / "must"
    expect(out.toLowerCase()).not.toContain("must");
    expect(out.toLowerCase()).not.toContain("you should");
    expect(out.toLowerCase()).not.toContain("everyone");
  });
});
