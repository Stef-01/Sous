import { describe, expect, it } from "vitest";
import {
  vitaminCoverage,
  fiberCoverage,
  activityFeed,
  xpToLevel,
  XP_PER_LEVEL,
  buildPetHealthStats,
} from "./pet-screen-data";
import { NUTRIENT_DISPLAY } from "@/data/nutrition/nutrient-display";
import { getDishNutrition } from "@/lib/engine/dish-nutrition";
import type { PerServingNutrition } from "@/types/nutrition";
import type { DiaryEntry } from "@/lib/hooks/use-nutrition-diary";

// Vitamin rows straight from the shared DV table — the same set the module
// averages over, so these tests can't drift from the data.
const VITAMINS = NUTRIENT_DISPLAY.filter(
  (m) => m.group === "Vitamins" && m.dv !== null,
);

/** An aggregate with every vitamin at `frac` × its DV. */
function aggAtFraction(frac: number): PerServingNutrition {
  const agg: Record<string, number> = {};
  for (const m of VITAMINS) agg[m.key] = m.dv! * frac;
  return agg as unknown as PerServingNutrition;
}

const entry = (over: Partial<DiaryEntry>): DiaryEntry => ({
  slug: "naan",
  name: "Naan",
  servings: 1,
  at: "2026-06-10T12:00:00.000Z",
  ...over,
});

describe("vitaminCoverage", () => {
  it("returns 0 for a null aggregate", () => {
    expect(vitaminCoverage(null)).toBe(0);
  });

  it("returns 1 when every vitamin hits its DV", () => {
    expect(vitaminCoverage(aggAtFraction(1))).toBeCloseTo(1);
  });

  it("clamps each vitamin at its DV — megadosing can't exceed 1", () => {
    expect(vitaminCoverage(aggAtFraction(10))).toBeCloseTo(1);
  });

  it("averages across all table vitamins; missing values count as 0", () => {
    expect(vitaminCoverage(aggAtFraction(0.5))).toBeCloseTo(0.5);
    // Only vitamin C present, at exactly its DV → 1/N of full coverage.
    const cMeta = VITAMINS.find((m) => m.key === "vitaminC_mg")!;
    const onlyC = {
      vitaminC_mg: cMeta.dv!,
    } as unknown as PerServingNutrition;
    expect(vitaminCoverage(onlyC)).toBeCloseTo(1 / VITAMINS.length);
  });
});

describe("fiberCoverage", () => {
  const fiberDv = NUTRIENT_DISPLAY.find((m) => m.key === "fiber_g")!.dv!;

  it("returns 0 for null, half DV → 0.5, over-DV clamps to 1", () => {
    expect(fiberCoverage(null)).toBe(0);
    const half = { fiber_g: fiberDv / 2 } as unknown as PerServingNutrition;
    expect(fiberCoverage(half)).toBeCloseTo(0.5);
    const over = { fiber_g: fiberDv * 3 } as unknown as PerServingNutrition;
    expect(fiberCoverage(over)).toBe(1);
  });
});

describe("activityFeed", () => {
  it("orders entries newest-first", () => {
    const rows = activityFeed(
      [
        entry({ name: "Breakfast", at: "2026-06-10T08:00:00.000Z" }),
        entry({ name: "Dinner", at: "2026-06-10T19:00:00.000Z" }),
        entry({ name: "Lunch", at: "2026-06-10T12:30:00.000Z" }),
      ],
      0,
    );
    expect(rows.map((r) => r.label)).toEqual(["Dinner", "Lunch", "Breakfast"]);
    expect(rows.every((r) => r.icon === "meal")).toBe(true);
  });

  it("uses embedded nutrition for kcal detail, scaled by servings", () => {
    const rows = activityFeed(
      [
        entry({
          name: "Yogurt",
          servings: 2,
          nutrition: { calories: 100 } as unknown as PerServingNutrition,
        }),
      ],
      0,
    );
    expect(rows[0].detail).toBe("200 kcal");
  });

  it("resolves kcal from the registry when coverage clears the floor", () => {
    // guacamole is a fully-massed registry dish (same fixture aggregateDay
    // tests rely on) — expected value traces to the live engine, not a stub.
    const per = getDishNutrition("guacamole").perServing!;
    const rows = activityFeed(
      [entry({ slug: "guacamole", name: "Guacamole", servings: 2 })],
      0,
    );
    expect(rows[0].detail).toBe(`${Math.round(per.calories * 2)} kcal`);
  });

  it('falls back to "logged" when nothing resolves', () => {
    // naan has zero composition coverage in the registry.
    const rows = activityFeed([entry({ slug: "naan", name: "Naan" })], 0);
    expect(rows[0].detail).toBe("logged");
  });

  it("appends one water row, pluralized", () => {
    expect(activityFeed([], 3)).toEqual([
      { icon: "water", label: "Water", detail: "3 cups" },
    ]);
    expect(activityFeed([], 1)[0].detail).toBe("1 cup");
    expect(activityFeed([], 0)).toEqual([]);
  });

  it("caps at 4 rows; water keeps its slot on heavy days", () => {
    const meals = [8, 9, 12, 15, 19].map((h) =>
      entry({
        name: `Meal ${h}`,
        at: `2026-06-10T${String(h).padStart(2, "0")}:00:00.000Z`,
      }),
    );
    const withWater = activityFeed(meals, 2);
    expect(withWater).toHaveLength(4);
    expect(withWater[3]).toEqual({
      icon: "water",
      label: "Water",
      detail: "2 cups",
    });
    // Newest 3 meals survive when water takes a slot.
    expect(withWater.slice(0, 3).map((r) => r.label)).toEqual([
      "Meal 19",
      "Meal 15",
      "Meal 12",
    ]);

    const noWater = activityFeed(meals, 0);
    expect(noWater).toHaveLength(4);
    expect(noWater.map((r) => r.label)).toEqual([
      "Meal 19",
      "Meal 15",
      "Meal 12",
      "Meal 9",
    ]);
  });
});

describe("buildPetHealthStats", () => {
  const base = {
    fullness: 0.5,
    hearts: 5,
    hydration: 0.75,
    strength: 0.9,
    fiber: 0.6,
    vitamins: 0.8,
  };

  it("returns the 6 nutrition bars in reference order", () => {
    expect(buildPetHealthStats(base).map((s) => s.key)).toEqual([
      "energy",
      "mood",
      "hydration",
      "protein",
      "fiber",
      "vitamins",
    ]);
  });

  it("maps each fraction to a 0–100 percent (hearts is /5)", () => {
    const s = buildPetHealthStats(base);
    expect(s.find((x) => x.key === "energy")!.pct).toBe(50);
    expect(s.find((x) => x.key === "mood")!.pct).toBe(100); // 5/5 hearts
    expect(s.find((x) => x.key === "hydration")!.pct).toBe(75);
    expect(s.find((x) => x.key === "protein")!.pct).toBe(90);
  });

  it("clamps + tolerates out-of-range / NaN", () => {
    const s = buildPetHealthStats({
      fullness: 1.4,
      hearts: 7,
      hydration: -0.2,
      strength: NaN,
      fiber: 0,
      vitamins: 0.5,
    });
    expect(s.find((x) => x.key === "energy")!.pct).toBe(100);
    expect(s.find((x) => x.key === "mood")!.pct).toBe(100);
    expect(s.find((x) => x.key === "hydration")!.pct).toBe(0);
    expect(s.find((x) => x.key === "protein")!.pct).toBe(0);
  });
});

describe("xpToLevel", () => {
  it("0 xp → level 1, nothing into it", () => {
    expect(xpToLevel(0)).toEqual({ level: 1, into: 0, needed: XP_PER_LEVEL });
  });

  it("one below the boundary stays in the level", () => {
    expect(xpToLevel(99)).toEqual({ level: 1, into: 99, needed: 100 });
  });

  it("exact boundary rolls to the next level with 0 into it", () => {
    // Matches computeLevel in use-xp-system.ts: floor(xp/100)+1.
    expect(xpToLevel(100)).toEqual({ level: 2, into: 0, needed: 100 });
    expect(xpToLevel(250)).toEqual({ level: 3, into: 50, needed: 100 });
  });
});
