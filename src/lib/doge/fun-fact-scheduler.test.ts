import { describe, it, expect } from "vitest";
import { pickFact } from "./fun-fact-scheduler";
import { ALL_FUN_FACTS } from "@/data/pet-fun-facts";

describe("pickFact", () => {
  it("prefers a fact about the dish just cooked", () => {
    const f = pickFact({ dishSlug: "pho" }, 0);
    expect(f).not.toBeNull();
    expect(f!.dishSlugs).toContain("pho");
  });

  it("falls to a need-matched nutrition fact when no dish matches", () => {
    const f = pickFact({ need: "iron" }, 0);
    expect(f).not.toBeNull();
    expect(f!.nutrient).toBe("iron");
  });

  it("falls to a cuisine fact when dish + need don't match", () => {
    const f = pickFact({ cuisine: "Korean" }, 0);
    expect(f).not.toBeNull();
    expect(f!.cuisines).toContain("Korean");
  });

  it("always returns something from the generic pool (never dry)", () => {
    const f = pickFact({}, 0.5);
    expect(f).not.toBeNull();
    expect(ALL_FUN_FACTS).toContainEqual(f);
  });

  it("is deterministic given the same roll", () => {
    expect(pickFact({ cuisine: "Vietnamese" }, 0.3)).toEqual(
      pickFact({ cuisine: "Vietnamese" }, 0.3),
    );
  });

  it("recycles an exhausted tier rather than returning null", () => {
    // All pho facts marked seen → still returns a pho fact (recycled), not null
    // and not a fall-through to a different dish.
    const phoFacts = ALL_FUN_FACTS.filter((f) => f.dishSlugs?.includes("pho"));
    const seen = new Set(phoFacts.map((f) => f.id));
    const f = pickFact({ dishSlug: "pho", seen }, 0);
    expect(f).not.toBeNull();
    expect(f!.dishSlugs).toContain("pho");
  });

  it("skips seen facts when fresh ones remain in the tier", () => {
    const ironFacts = ALL_FUN_FACTS.filter((f) => f.nutrient === "iron");
    if (ironFacts.length >= 2) {
      const seen = new Set([ironFacts[0].id]);
      // With roll 0 it would pick index 0 of the fresh pool, which excludes the seen one.
      const f = pickFact({ need: "iron", seen }, 0);
      expect(f!.id).not.toBe(ironFacts[0].id);
    }
  });
});
