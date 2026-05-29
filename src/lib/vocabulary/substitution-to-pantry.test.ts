import { describe, expect, it } from "vitest";
import {
  applySubstitutionToPantry,
  extractSwapIngredients,
} from "./substitution-to-pantry";

// ── extractSwapIngredients ────────────────────────────────

describe("extractSwapIngredients", () => {
  it("simple '+' separated list", () => {
    expect(extractSwapIngredients("lime + brown sugar")).toEqual([
      "lime",
      "brown sugar",
    ]);
  });

  it("comma-separated list", () => {
    expect(extractSwapIngredients("lime, brown sugar")).toEqual([
      "lime",
      "brown sugar",
    ]);
  });

  it("'and'-separated list", () => {
    expect(extractSwapIngredients("lime and brown sugar")).toEqual([
      "lime",
      "brown sugar",
    ]);
  });

  it("cuts at 'for' — head is the swap, tail is the original", () => {
    expect(extractSwapIngredients("leeks for onion")).toEqual(["leeks"]);
  });

  it("cuts at 'instead of'", () => {
    expect(
      extractSwapIngredients("lime + brown sugar instead of tamarind"),
    ).toEqual(["lime", "brown sugar"]);
  });

  it("cuts at 'in place of'", () => {
    expect(extractSwapIngredients("vinegar in place of wine")).toEqual([
      "vinegar",
    ]);
  });

  it("dedupes within a single swap", () => {
    expect(extractSwapIngredients("salt, salt, salt")).toEqual(["salt"]);
  });

  it("normalises case + punctuation via pantry normaliser", () => {
    const out = extractSwapIngredients("LIME, Brown Sugar.");
    expect(out).toContain("lime");
    expect(out).toContain("brown sugar");
  });

  it("empty / non-string → empty list", () => {
    expect(extractSwapIngredients("")).toEqual([]);
    expect(extractSwapIngredients(null as unknown as string)).toEqual([]);
  });
});

// ── applySubstitutionToPantry ─────────────────────────────

describe("applySubstitutionToPantry", () => {
  it("adds swap items to an empty pantry", () => {
    const out = applySubstitutionToPantry([], {
      swap: "lime + brown sugar",
      note: "for tamarind",
    });
    expect(out.added).toEqual(["lime", "brown sugar"]);
    expect(out.nextPantry).toEqual(["lime", "brown sugar"]);
  });

  it("preserves existing pantry items", () => {
    const out = applySubstitutionToPantry(["basil", "garlic"], {
      swap: "lime",
      note: "x",
    });
    expect(out.nextPantry).toContain("basil");
    expect(out.nextPantry).toContain("garlic");
    expect(out.nextPantry).toContain("lime");
  });

  it("no-double-write: existing item not added again", () => {
    const out = applySubstitutionToPantry(["lime"], {
      swap: "lime + brown sugar",
      note: "x",
    });
    expect(out.added).toEqual(["brown sugar"]);
    // 'lime' appears exactly once
    expect(out.nextPantry.filter((p) => p === "lime").length).toBe(1);
  });

  it("case-insensitive de-dup", () => {
    const out = applySubstitutionToPantry(["LIME"], {
      swap: "lime + brown sugar",
      note: "x",
    });
    expect(out.added).toEqual(["brown sugar"]);
  });

  it("does not mutate the input pantry", () => {
    const before: string[] = ["basil"];
    applySubstitutionToPantry(before, {
      swap: "lime",
      note: "x",
    });
    expect(before).toEqual(["basil"]);
  });

  it("swap field with no extractable items → empty added list", () => {
    const out = applySubstitutionToPantry(["basil"], {
      swap: "for tamarind", // entire string is the cut head
      note: "x",
    });
    expect(out.added).toEqual([]);
    expect(out.nextPantry).toEqual(["basil"]);
  });
});
