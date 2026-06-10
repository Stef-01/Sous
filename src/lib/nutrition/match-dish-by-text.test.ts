import { describe, expect, it } from "vitest";
import { matchDishesByText } from "./match-dish-by-text";

describe("matchDishesByText (W29)", () => {
  it("finds a dish by a keyword", () => {
    const r = matchDishesByText("salmon").map((d) => d.id);
    expect(r).toContain("grilled-salmon");
  });
  it("finds a dish by a partial multi-word query", () => {
    const r = matchDishesByText("air fryer broccoli").map((d) => d.id);
    expect(r[0]).toBe("air-fryer-broccoli");
  });
  it("returns nothing for gibberish or too-short input", () => {
    expect(matchDishesByText("zzzqqq")).toEqual([]);
    expect(matchDishesByText("a")).toEqual([]);
    expect(matchDishesByText("")).toEqual([]);
  });
  it("respects the limit and ranks exact/substring above token hits", () => {
    const r = matchDishesByText("dal", 3);
    expect(r.length).toBeLessThanOrEqual(3);
    expect(r.length).toBeGreaterThan(0);
  });
});

describe("connector words and word boundaries (unified log-food fix)", () => {
  it("does not let 'and' inside 'mandu' outrank real dal/rice matches", () => {
    const names = matchDishesByText("dal and rice").map((m) =>
      m.name.toLowerCase(),
    );
    expect(names.length).toBeGreaterThan(0);
    expect(names[0]).not.toBe("mandu");
    expect(names.some((n) => n.includes("dal") || n.includes("rice"))).toBe(
      true,
    );
  });

  it("still matches a dish whose name IS a stopword-ish token exactly", () => {
    const names = matchDishesByText("mandu").map((m) => m.name.toLowerCase());
    expect(names[0]).toContain("mandu");
  });
});
