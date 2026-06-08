import { describe, expect, it } from "vitest";
import {
  loggingStreak,
  recentDistinctDishes,
  dayKey,
  type DiaryEntry,
} from "./use-nutrition-diary";

const today = new Date(2026, 5, 8);
const k = (off: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + off);
  return dayKey(d);
};
const E = (slug: string, at: string): DiaryEntry => ({
  slug,
  name: slug,
  servings: 1,
  at,
});

describe("loggingStreak (W15)", () => {
  it("counts consecutive logged days including today", () => {
    const store = {
      [k(0)]: [E("a", "t0")],
      [k(-1)]: [E("b", "t1")],
      [k(-2)]: [E("c", "t2")],
    };
    expect(loggingStreak(store, today)).toBe(3);
  });

  it("keeps the streak alive when today isn't logged yet", () => {
    const store = { [k(-1)]: [E("b", "t1")], [k(-2)]: [E("c", "t2")] };
    expect(loggingStreak(store, today)).toBe(2);
  });

  it("is 0 when there's a gap before today/yesterday", () => {
    expect(loggingStreak({ [k(-3)]: [E("x", "t")] }, today)).toBe(0);
    expect(loggingStreak({}, today)).toBe(0);
  });
});

describe("recentDistinctDishes (W8)", () => {
  it("returns distinct cooked dishes newest-first, excluding branded", () => {
    const store = {
      [k(-1)]: [E("ramen", "2026-06-07T08:00:00Z")],
      [k(0)]: [
        E("salad", "2026-06-08T09:00:00Z"),
        E("ramen", "2026-06-08T12:00:00Z"),
        { ...E("soda", "2026-06-08T13:00:00Z"), brand: "Cola" },
      ],
    };
    const recents = recentDistinctDishes(store, 6).map((r) => r.slug);
    expect(recents).toEqual(["ramen", "salad"]);
    expect(recents).not.toContain("soda");
  });

  it("respects the limit", () => {
    const store = {
      [k(0)]: ["a", "b", "c", "d"].map((s, i) => E(s, `t${i}`)),
    };
    expect(recentDistinctDishes(store, 2)).toHaveLength(2);
  });
});
