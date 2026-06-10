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

describe("matchMultipleByText (#2 — multi-item logging)", () => {
  it("splits on and/comma/with and matches each segment", async () => {
    const { matchMultipleByText } = await import("./match-dish-by-text");
    const out = matchMultipleByText("masoor dal and jasmine rice");
    expect(out.length).toBe(2);
    expect(out.map((m) => m.name.toLowerCase()).join(" ")).toMatch(/dal/);
    expect(out.map((m) => m.name.toLowerCase()).join(" ")).toMatch(/rice/);
  });

  it("single segment → [] (caller keeps the single-match flow)", async () => {
    const { matchMultipleByText } = await import("./match-dish-by-text");
    expect(matchMultipleByText("masoor dal")).toEqual([]);
  });

  it("de-duplicates segments resolving to the same dish", async () => {
    const { matchMultipleByText } = await import("./match-dish-by-text");
    const out = matchMultipleByText("dal, masoor dal");
    expect(out.length).toBeLessThanOrEqual(1 + 1);
    const ids = out.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
