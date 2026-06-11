import { describe, expect, it } from "vitest";
import { selectKeyNutrientRows, type KeyRow } from "./key-nutrient-rows";

const row = (key: string, value: number, dv: number | null = 100): KeyRow => ({
  key,
  label: key,
  unit: "mg",
  dv,
  value,
  group: "Minerals",
});

// A day with big C/K numbers and small everything else — the reported state.
const DAY: KeyRow[] = [
  row("vitaminC_mg", 521, 100),
  row("vitaminK_mcg", 452, 100),
  row("fiber_g", 49, 100),
  row("magnesium_mg", 27, 100),
  row("iron_mg", 4, 100),
  row("omega3_g", 0, 100), // composed at ZERO (ate none)
];

describe("selectKeyNutrientRows", () => {
  it("no stars → top-4 by %DV (the original behaviour)", () => {
    const keys = selectKeyNutrientRows(DAY, new Set()).map((r) => r.key);
    expect(keys).toEqual([
      "vitaminC_mg",
      "vitaminK_mcg",
      "fiber_g",
      "magnesium_mg",
    ]);
  });

  it("a starred ZERO-value nutrient pins (the RCA bug)", () => {
    const keys = selectKeyNutrientRows(DAY, new Set(["omega3_g"])).map(
      (r) => r.key,
    );
    expect(keys[0]).toBe("omega3_g");
    expect(keys).toHaveLength(4);
  });

  it("a starred nutrient ABSENT from the vector is synthesized at 0", () => {
    const out = selectKeyNutrientRows(DAY, new Set(["zinc_mg"]));
    const zinc = out.find((r) => r.key === "zinc_mg");
    expect(zinc).toBeDefined();
    expect(zinc!.value).toBe(0);
    expect(zinc!.dv).not.toBeNull(); // pulled from the FDA display table
    expect(out[0].key).toBe("zinc_mg");
  });

  it("MANY stars overflow the 4-slot grid — every star shows, C/K unseated", () => {
    const stars = new Set([
      "omega3_g",
      "iron_mg",
      "magnesium_mg",
      "zinc_mg",
      "calcium_mg",
      "fiber_g",
    ]);
    const out = selectKeyNutrientRows(DAY, stars);
    expect(out).toHaveLength(6); // all six starred, no fillers
    expect(out.every((r) => stars.has(r.key))).toBe(true);
    expect(out.map((r) => r.key)).not.toContain("vitaminC_mg");
    expect(out.map((r) => r.key)).not.toContain("vitaminK_mcg");
  });

  it("starred rows lead, fillers top up to the minimum", () => {
    const out = selectKeyNutrientRows(DAY, new Set(["iron_mg"]));
    expect(out[0].key).toBe("iron_mg");
    expect(out).toHaveLength(4);
    expect(out.slice(1).map((r) => r.key)).toEqual([
      "vitaminC_mg",
      "vitaminK_mcg",
      "fiber_g",
    ]);
  });

  it("headline macros never pin even when starred", () => {
    const out = selectKeyNutrientRows(DAY, new Set(["protein_g"]));
    expect(out.map((r) => r.key)).not.toContain("protein_g");
    expect(out).toHaveLength(4);
  });
});
