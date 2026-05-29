import { describe, expect, it } from "vitest";
import {
  applyConfirmationOp,
  detectPantryItemsStub,
  mergeWithExistingPantry,
  type DetectedItem,
} from "./photo-pipeline";

// ── detectPantryItemsStub ─────────────────────────────────

describe("detectPantryItemsStub", () => {
  it("returns 4-6 items for a positive byte length", () => {
    const out = detectPantryItemsStub(12345);
    expect(out.detected.length).toBeGreaterThanOrEqual(4);
    expect(out.detected.length).toBeLessThanOrEqual(6);
  });

  it("zero byte length → 6 items from the head of the fixture pool", () => {
    const out = detectPantryItemsStub(0);
    expect(out.detected.length).toBe(6);
  });

  it("non-finite byte length → defensive fallback", () => {
    const out = detectPantryItemsStub(Number.NaN);
    expect(out.detected.length).toBe(6);
  });

  it("deterministic — same input → same output", () => {
    const a = detectPantryItemsStub(5000);
    const b = detectPantryItemsStub(5000);
    expect(a).toEqual(b);
  });

  it("mode flag set to 'stub'", () => {
    expect(detectPantryItemsStub(1).mode).toBe("stub");
  });

  it("each detected item has name + confidence + itemClass", () => {
    const out = detectPantryItemsStub(100);
    for (const item of out.detected) {
      expect(typeof item.name).toBe("string");
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.confidence).toBeGreaterThan(0);
      expect(item.confidence).toBeLessThanOrEqual(1);
      expect(typeof item.itemClass).toBe("string");
    }
  });

  it("byte-length rotation surfaces different subsets", () => {
    const a = detectPantryItemsStub(0);
    const b = detectPantryItemsStub(7);
    // Different byte lengths should pick different starting
    // offsets in the rotation. Lists may share items but
    // shouldn't be identical.
    const aNames = a.detected.map((i) => i.name).sort();
    const bNames = b.detected.map((i) => i.name).sort();
    expect(JSON.stringify(aNames)).not.toBe(JSON.stringify(bNames));
  });
});

// ── applyConfirmationOp ───────────────────────────────────

describe("applyConfirmationOp", () => {
  const seed: DetectedItem[] = [
    { name: "fresh basil", confidence: 0.9, itemClass: "fresh-herb" },
    { name: "lemon", confidence: 0.95, itemClass: "citrus" },
    { name: "garlic", confidence: 0.88, itemClass: "allium" },
  ];

  it("accept-all → returns a copy unchanged", () => {
    const out = applyConfirmationOp(seed, { kind: "accept-all" });
    expect(out).toEqual(seed);
    expect(out).not.toBe(seed); // new array
  });

  it("reject removes the named item", () => {
    const out = applyConfirmationOp(seed, {
      kind: "reject",
      itemName: "lemon",
    });
    expect(out.length).toBe(2);
    expect(out.find((i) => i.name === "lemon")).toBeUndefined();
  });

  it("reject normalises the name (case + qualifier-strip)", () => {
    const out = applyConfirmationOp(seed, {
      kind: "reject",
      itemName: "FRESH BASIL LEAVES",
    });
    expect(out.length).toBe(2);
    expect(out.find((i) => i.name === "fresh basil")).toBeUndefined();
  });

  it("reject of a non-existent item → list unchanged", () => {
    const out = applyConfirmationOp(seed, {
      kind: "reject",
      itemName: "saffron",
    });
    expect(out).toEqual(seed);
  });

  it("rename swaps the name in place", () => {
    const out = applyConfirmationOp(seed, {
      kind: "rename",
      oldName: "lemon",
      newName: "meyer lemon",
    });
    expect(out.length).toBe(3);
    expect(out.find((i) => i.name === "meyer lemon")).toBeDefined();
    expect(out.find((i) => i.name === "lemon")).toBeUndefined();
  });

  it("rename preserves confidence + itemClass", () => {
    const out = applyConfirmationOp(seed, {
      kind: "rename",
      oldName: "lemon",
      newName: "meyer lemon",
    });
    const renamed = out.find((i) => i.name === "meyer lemon");
    expect(renamed?.confidence).toBe(0.95);
    expect(renamed?.itemClass).toBe("citrus");
  });

  it("does not mutate the input list", () => {
    const before = [...seed];
    applyConfirmationOp(seed, { kind: "reject", itemName: "lemon" });
    expect(seed).toEqual(before);
  });
});

// ── mergeWithExistingPantry ───────────────────────────────

describe("mergeWithExistingPantry", () => {
  const detected: DetectedItem[] = [
    { name: "fresh basil", confidence: 0.9, itemClass: "fresh-herb" },
    { name: "lemon", confidence: 0.95, itemClass: "citrus" },
  ];

  it("empty pantry → all detections written + reported as added", () => {
    const out = mergeWithExistingPantry(detected, []);
    expect(out.nextPantry.length).toBe(2);
    expect(out.addedNames).toEqual(["fresh basil", "lemon"]);
  });

  it("existing matches skip the duplicate write", () => {
    const out = mergeWithExistingPantry(detected, ["lemon"]);
    expect(out.nextPantry.length).toBe(2);
    expect(out.addedNames).toEqual(["fresh basil"]);
  });

  it("normalised match — 'fresh basil leaves' covers 'basil'", () => {
    // The W15 normaliser drops 'fresh' and 'leaves' qualifiers.
    const out = mergeWithExistingPantry(detected, ["basil"]);
    // 'fresh basil' normalises to 'basil', already present.
    expect(out.addedNames).toEqual(["lemon"]);
  });

  it("preserves the existing pantry order", () => {
    const out = mergeWithExistingPantry(detected, ["salt", "pepper"]);
    expect(out.nextPantry[0]).toBe("salt");
    expect(out.nextPantry[1]).toBe("pepper");
  });

  it("does not mutate the existing pantry array", () => {
    const existing = ["salt"];
    mergeWithExistingPantry(detected, existing);
    expect(existing).toEqual(["salt"]);
  });

  it("empty detections → pantry unchanged + no adds reported", () => {
    const out = mergeWithExistingPantry([], ["salt", "pepper"]);
    expect(out.nextPantry).toEqual(["salt", "pepper"]);
    expect(out.addedNames).toEqual([]);
  });

  it("repeated detections de-dup against each other (same scan)", () => {
    const dups: DetectedItem[] = [
      { name: "lemon", confidence: 0.95, itemClass: "citrus" },
      { name: "lemons", confidence: 0.92, itemClass: "citrus" },
    ];
    const out = mergeWithExistingPantry(dups, []);
    // 'lemon' and 'lemons' may or may not normalise the same;
    // the helper should at minimum not write the literal-same
    // string twice. (If the W15 normaliser strips trailing 's',
    // both collapse to 'lemon'.)
    expect(new Set(out.nextPantry).size).toBe(out.nextPantry.length);
  });
});
