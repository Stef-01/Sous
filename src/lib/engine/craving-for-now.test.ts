import { describe, expect, it } from "vitest";
import mealsData from "@/data/meals.json";
import {
  cravingForNow,
  mealDaypartFromHour,
  type CravingContext,
} from "./craving-for-now";

const MEAL_IDS = new Set((mealsData as { id: string }[]).map((m) => m.id));

function ctx(over: Partial<CravingContext> = {}): CravingContext {
  return { hour: 18, month: 0, seed: 20260618, ...over };
}

describe("mealDaypartFromHour", () => {
  it("collapses the clock into the three authored dayparts", () => {
    expect(mealDaypartFromHour(8)).toBe("breakfast");
    expect(mealDaypartFromHour(12)).toBe("lunch");
    expect(mealDaypartFromHour(19)).toBe("dinner");
    // wraps + truncates defensively
    expect(mealDaypartFromHour(-1)).toBe("dinner"); // 23:00
    expect(mealDaypartFromHour(26.9)).toBe("breakfast"); // 02:00
  });

  it("treats pre-dawn hours as breakfast", () => {
    expect(mealDaypartFromHour(2)).toBe("breakfast");
  });
});

describe("cravingForNow", () => {
  it("is deterministic for a fixed (hour, month, seed)", () => {
    const a = cravingForNow(ctx());
    const b = cravingForNow(ctx());
    expect(a).toEqual(b);
  });

  it("only ever returns a real meal slug (rule 7 — never invents a dish)", () => {
    for (const hour of [8, 12, 19, 23]) {
      for (const seed of [1, 42, 20260618, 99999]) {
        const r = cravingForNow(ctx({ hour, seed }));
        expect(r.success).toBe(true);
        if (r.success) {
          expect(MEAL_IDS.has(r.data.slug)).toBe(true);
          expect(r.data.deepLink).toBe(`/cook/${r.data.slug}`);
        }
      }
    }
  });

  it("returns a meal whose dayparts include the resolved daypart", () => {
    const r = cravingForNow(ctx({ hour: 8 }));
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.daypart).toBe("breakfast");
      const meal = (mealsData as { id: string; dayparts?: string[] }[]).find(
        (m) => m.id === r.data.slug,
      );
      // The breakfast pool is non-empty in the catalog, so the pick honours it.
      expect(meal?.dayparts ?? []).toContain("breakfast");
    }
  });

  it("shifts the candidate pool across dayparts", () => {
    const breakfast = cravingForNow(ctx({ hour: 8 }));
    const dinner = cravingForNow(ctx({ hour: 20 }));
    expect(breakfast.success && dinner.success).toBe(true);
    if (breakfast.success && dinner.success) {
      expect(breakfast.data.daypart).toBe("breakfast");
      expect(dinner.data.daypart).toBe("dinner");
    }
  });

  it("rotates the pick across days (different seed → may differ, never errors)", () => {
    const picks = new Set<string>();
    for (let day = 0; day < 30; day++) {
      const r = cravingForNow(ctx({ hour: 19, seed: 20260600 + day }));
      expect(r.success).toBe(true);
      if (r.success) picks.add(r.data.slug);
    }
    // The seeded rotation surfaces more than one dish across a month.
    expect(picks.size).toBeGreaterThan(1);
  });
});
