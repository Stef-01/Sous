import { describe, it, expect } from "vitest";
import { buildTodayStats, FALLBACK_TARGETS } from "./today-stats";

const TARGETS = { kcal: 2000, carbs_g: 200, fat_g: 70, protein_g: 100 };

describe("buildTodayStats", () => {
  it("computes calories consumed / target / left / pct", () => {
    const s = buildTodayStats({ calories: 1240 }, TARGETS, null);
    expect(s.kcal).toEqual({
      consumed: 1240,
      target: 2000,
      left: 760,
      pct: 62,
    });
    expect(s.logged).toBe(true);
  });

  it("never shows negative 'left' when over target", () => {
    const s = buildTodayStats({ calories: 2400 }, TARGETS, null);
    expect(s.kcal.left).toBe(0);
    expect(s.kcal.pct).toBe(100); // capped
  });

  it("computes per-macro grams / target / capped pct", () => {
    const s = buildTodayStats(
      { calories: 1000, totalCarbs_g: 100, totalFat_g: 35, protein_g: 120 },
      TARGETS,
      null,
    );
    expect(s.macros.find((m) => m.key === "carbs")).toMatchObject({
      grams: 100,
      target: 200,
      pct: 50,
    });
    expect(s.macros.find((m) => m.key === "fat")).toMatchObject({
      grams: 35,
      target: 70,
      pct: 50,
    });
    // protein over target → capped at 100
    expect(s.macros.find((m) => m.key === "protein")).toMatchObject({
      grams: 120,
      pct: 100,
    });
  });

  it("is not 'logged' when nothing is logged today", () => {
    expect(buildTodayStats(null, TARGETS, null).logged).toBe(false);
    expect(buildTodayStats({ calories: 0 }, TARGETS, null).logged).toBe(false);
  });

  it("falls back to FDA-ish targets when no profile is set", () => {
    const s = buildTodayStats({ calories: 500 }, null, null);
    expect(s.kcal.target).toBe(FALLBACK_TARGETS.kcal);
    expect(s.macros.find((m) => m.key === "protein")!.target).toBe(
      FALLBACK_TARGETS.protein_g,
    );
  });

  it("surfaces the biggest gap + caps the suggestions", () => {
    const fill = {
      deficit: { label: "Fiber" },
      suggestions: [
        { slug: "lentil-soup", name: "Lentil soup", closesPct: 40 },
        { slug: "black-beans", name: "Black beans", closesPct: 30 },
        { slug: "oats", name: "Oats", closesPct: 25 },
      ],
    };
    const s = buildTodayStats({ calories: 800 }, TARGETS, fill, 2);
    expect(s.gap?.label).toBe("Fiber");
    expect(s.gap?.suggestions).toHaveLength(2);
    expect(s.gap?.suggestions[0].slug).toBe("lentil-soup");
  });

  it("has no gap when the day is well covered (deficitFill null)", () => {
    expect(buildTodayStats({ calories: 1800 }, TARGETS, null).gap).toBeNull();
  });

  it("tolerates NaN / missing fields without throwing", () => {
    const s = buildTodayStats(
      { calories: NaN, totalCarbs_g: undefined },
      TARGETS,
      null,
    );
    expect(s.kcal.consumed).toBe(0);
    expect(s.macros.find((m) => m.key === "carbs")!.grams).toBe(0);
  });

  it("lists what was eaten today — deduped, trimmed, in log order", () => {
    const s = buildTodayStats({ calories: 900 }, TARGETS, null, 1, [
      "Pho",
      "Caesar Salad",
      "Pho", // dup
      "  ", // blank
      " Oatmeal ", // trimmed
    ]);
    expect(s.meals).toEqual(["Pho", "Caesar Salad", "Oatmeal"]);
  });

  it("has an empty meals list when nothing was passed", () => {
    expect(buildTodayStats({ calories: 0 }, TARGETS, null).meals).toEqual([]);
  });
});
