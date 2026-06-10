import { describe, expect, it } from "vitest";
import {
  weeksWithFiveLogs,
  availableFreezes,
  loggingStreakWithFreezes,
} from "./streak-freeze";
import { dayKey, type DiaryEntry } from "./use-nutrition-diary";

const NOW = new Date("2026-06-09T12:00:00");
const e = (): DiaryEntry[] => [
  { slug: "x", name: "X", servings: 1, at: "2026-06-09T08:00:00Z" },
];
const back = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return dayKey(d);
};
/** A store with entries on the given offsets-from-today. */
const storeWith = (...offsets: number[]) =>
  Object.fromEntries(offsets.map((o) => [back(o), e()]));

describe("streak freeze (#10)", () => {
  it("a 5-logged-day week earns 1; sparse weeks earn 0", () => {
    expect(weeksWithFiveLogs(storeWith(0, 1, 2, 3, 4), NOW)).toBe(1);
    expect(weeksWithFiveLogs(storeWith(0, 3, 6), NOW)).toBe(0);
  });

  it("availableFreezes caps at 2 and subtracts recent spends", () => {
    // 21 straight days = 3 earning weeks → capped at 2
    const dense = storeWith(...Array.from({ length: 21 }, (_, i) => i));
    expect(availableFreezes(dense, [], NOW)).toBe(2);
    expect(availableFreezes(dense, [back(2)], NOW)).toBe(1);
    expect(availableFreezes(dense, [back(40)], NOW)).toBe(2); // old spend expired
  });

  it("a frozen day BRIDGES the chain but does not count", () => {
    // logged today + 2 days ago; yesterday missed.
    const store = storeWith(0, 2, 3);
    expect(loggingStreakWithFreezes(store, [], NOW)).toBe(1); // chain breaks
    expect(loggingStreakWithFreezes(store, [back(1)], NOW)).toBe(3); // bridged: today + d2 + d3
  });

  it("matches plain streak when no freezes are used", () => {
    const store = storeWith(0, 1, 2);
    expect(loggingStreakWithFreezes(store, [], NOW)).toBe(3);
  });
});
