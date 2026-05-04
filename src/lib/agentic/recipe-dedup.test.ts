import { describe, expect, it } from "vitest";
import {
  findDuplicateInPool,
  normaliseDedupTitle,
  recipeDedupHash,
  type DedupShape,
} from "./recipe-dedup";

// ── normaliseDedupTitle ───────────────────────────────────

describe("normaliseDedupTitle", () => {
  it("lowercases", () => {
    expect(normaliseDedupTitle("Carbonara")).toBe("carbonara");
  });

  it("strips noise words", () => {
    expect(normaliseDedupTitle("The Best Easy Carbonara Recipe")).toBe(
      "carbonara",
    );
  });

  it("preserves dish-distinguishing adjectives", () => {
    // "spicy" / "vegan" mean different recipes — survives.
    expect(normaliseDedupTitle("The Spicy Carbonara")).toBe("spicy carbonara");
  });

  it("strips punctuation", () => {
    expect(normaliseDedupTitle("carbonara!!!")).toBe("carbonara");
  });

  it("collapses whitespace", () => {
    expect(normaliseDedupTitle("the   best  carbonara")).toBe("carbonara");
  });

  it("non-string → empty", () => {
    expect(normaliseDedupTitle(null as unknown as string)).toBe("");
  });
});

// ── recipeDedupHash ───────────────────────────────────────

describe("recipeDedupHash", () => {
  it("same recipe under different titles → same hash", () => {
    const a: DedupShape = {
      title: "The Best Carbonara",
      cuisineFamily: "italian",
      ingredients: ["spaghetti", "egg", "guanciale", "pecorino"],
    };
    const b: DedupShape = {
      title: "Easy Carbonara Recipe",
      cuisineFamily: "italian",
      ingredients: ["egg", "spaghetti", "guanciale", "pecorino"],
    };
    expect(recipeDedupHash(a)).toBe(recipeDedupHash(b));
  });

  it("different cuisines → different hash even with same title", () => {
    const a: DedupShape = {
      title: "Carbonara",
      cuisineFamily: "italian",
      ingredients: ["spaghetti"],
    };
    const b: DedupShape = {
      title: "Carbonara",
      cuisineFamily: "french",
      ingredients: ["spaghetti"],
    };
    expect(recipeDedupHash(a)).not.toBe(recipeDedupHash(b));
  });

  it("ingredient order doesn't change the hash", () => {
    const a: DedupShape = {
      title: "x",
      cuisineFamily: "x",
      ingredients: ["c", "a", "b"],
    };
    const b: DedupShape = {
      title: "x",
      cuisineFamily: "x",
      ingredients: ["b", "c", "a"],
    };
    expect(recipeDedupHash(a)).toBe(recipeDedupHash(b));
  });

  it("ingredient case doesn't change the hash", () => {
    const a: DedupShape = {
      title: "x",
      cuisineFamily: "x",
      ingredients: ["FRESH BASIL", "GARLIC"],
    };
    const b: DedupShape = {
      title: "x",
      cuisineFamily: "x",
      ingredients: ["fresh basil", "garlic"],
    };
    expect(recipeDedupHash(a)).toBe(recipeDedupHash(b));
  });

  it("different ingredient sets → different hash", () => {
    const a: DedupShape = {
      title: "x",
      cuisineFamily: "x",
      ingredients: ["a", "b"],
    };
    const b: DedupShape = {
      title: "x",
      cuisineFamily: "x",
      ingredients: ["a", "c"],
    };
    expect(recipeDedupHash(a)).not.toBe(recipeDedupHash(b));
  });

  it("ingredient duplicates collapse (Set-style)", () => {
    const a: DedupShape = {
      title: "x",
      cuisineFamily: "x",
      ingredients: ["basil", "basil", "garlic"],
    };
    const b: DedupShape = {
      title: "x",
      cuisineFamily: "x",
      ingredients: ["basil", "garlic"],
    };
    expect(recipeDedupHash(a)).toBe(recipeDedupHash(b));
  });
});

// ── findDuplicateInPool ───────────────────────────────────

describe("findDuplicateInPool", () => {
  const pool = [
    {
      slug: "existing-carbonara",
      title: "Carbonara",
      cuisineFamily: "italian",
      ingredients: ["spaghetti", "egg", "guanciale", "pecorino"],
    },
    {
      slug: "existing-cacio",
      title: "Cacio e Pepe",
      cuisineFamily: "italian",
      ingredients: ["spaghetti", "pecorino", "black pepper"],
    },
  ];

  it("dupe in pool → returns existing slug", () => {
    const candidate: DedupShape = {
      title: "The Best Easy Carbonara",
      cuisineFamily: "italian",
      ingredients: ["egg", "spaghetti", "guanciale", "pecorino"],
    };
    expect(findDuplicateInPool(candidate, pool)).toBe("existing-carbonara");
  });

  it("not a dupe → returns null", () => {
    const candidate: DedupShape = {
      title: "Pad Thai",
      cuisineFamily: "thai",
      ingredients: ["rice noodles", "tamarind"],
    };
    expect(findDuplicateInPool(candidate, pool)).toBe(null);
  });

  it("empty pool → null", () => {
    const candidate: DedupShape = {
      title: "x",
      cuisineFamily: "x",
      ingredients: [],
    };
    expect(findDuplicateInPool(candidate, [])).toBe(null);
  });
});
