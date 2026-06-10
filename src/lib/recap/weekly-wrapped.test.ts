import { describe, expect, it } from "vitest";
import { buildWeeklyWrapped } from "./weekly-wrapped";
import { dayKey, type DiaryEntry } from "@/lib/hooks/use-nutrition-diary";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

const NOW = new Date("2026-06-09T12:00:00");
const day = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d;
};
const session = (n: number, dish: string, cuisine: string) =>
  ({
    dishName: dish,
    cuisineFamily: cuisine,
    completedAt: day(n).toISOString(),
  }) as unknown as CookSessionRecord;
const entry = (slug: string): DiaryEntry => ({
  slug,
  name: slug,
  servings: 1,
  at: "2026-06-09T08:00:00Z",
});

describe("buildWeeklyWrapped (#8)", () => {
  it("counts week cooks, distinct dishes, top cuisine, logged days", () => {
    const w = buildWeeklyWrapped({
      sessions: [
        session(0, "Pho", "Vietnamese"),
        session(2, "Pho", "Vietnamese"),
        session(3, "Dal", "Indian"),
        session(20, "Old Dish", "Thai"), // outside window
      ],
      diary: {
        [dayKey(day(0))]: [entry("air-fryer-broccoli")],
        [dayKey(day(1))]: [entry("masoor-dal")],
      },
      now: NOW,
    })!;
    expect(w.cooks).toBe(3);
    expect(w.distinctDishes).toBe(2);
    expect(w.topCuisine).toBe("Vietnamese");
    expect(w.loggedDays).toBe(2);
    expect(w.avgKcal).toBeGreaterThan(0); // real composed kcal
    expect(w.bestProteinDay?.protein_g).toBeGreaterThan(0);
  });

  it("returns null for an empty week (cold start stays quiet)", () => {
    expect(buildWeeklyWrapped({ sessions: [], diary: {}, now: NOW })).toBeNull();
  });
});
