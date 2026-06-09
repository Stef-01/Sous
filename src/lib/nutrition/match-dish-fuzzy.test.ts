import { describe, expect, it } from "vitest";
import { matchDishesByText } from "./match-dish-by-text";

describe("matchDishesByText — stage 6 fuzzy + kcal preview", () => {
  it("prefix matches: 'brocc' finds broccoli dishes", () => {
    const names = matchDishesByText("brocc").map((m) => m.name.toLowerCase());
    expect(names.some((n) => n.includes("broccoli"))).toBe(true);
  });

  it("one-typo tolerance: 'brocoli' still finds broccoli", () => {
    const names = matchDishesByText("brocoli").map((m) => m.name.toLowerCase());
    expect(names.some((n) => n.includes("broccoli"))).toBe(true);
  });

  it("exact substring still outranks fuzzy", () => {
    const out = matchDishesByText("pho");
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].name.toLowerCase()).toContain("pho");
  });

  it("each result carries a kcal preview (number or null, never NaN)", () => {
    for (const m of matchDishesByText("salmon")) {
      expect(m.kcal === null || Number.isFinite(m.kcal)).toBe(true);
    }
    const salmon = matchDishesByText("grilled salmon")[0];
    expect(salmon.kcal).toBeGreaterThan(50);
  });

  it("short/garbage queries return nothing", () => {
    expect(matchDishesByText("a")).toEqual([]);
    expect(matchDishesByText("zzzzqqq")).toEqual([]);
  });
});
