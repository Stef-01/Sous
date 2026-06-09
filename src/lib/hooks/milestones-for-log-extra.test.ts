import { describe, expect, it } from "vitest";
import {
  milestonesForLog,
  loggingStreak,
  dayKey,
  type DiaryEntry,
} from "./use-nutrition-diary";

/**
 * Phase 3 / R4 — adversarial coverage for the PURE celebration decision.
 * milestonesForLog is the single source of truth the celebrate effect consumes,
 * so it must be exhaustively pinned: lifetime counting (incl. branded + multi-day),
 * streak-vs-first precedence, and "no milestone" on the common path. Pure → no DOM.
 */

const today = new Date("2026-06-09T12:00:00");
const entry = (slug = "x", at = "2026-06-09T12:00:00.000Z"): DiaryEntry => ({
  slug,
  name: "X",
  servings: 1,
  at,
});
const brandedEntry = (): DiaryEntry => ({
  slug: "off:123",
  name: "Yogurt",
  brand: "Acme",
  servings: 1,
  at: "2026-06-09T12:00:00.000Z",
  nutrition: { calories: 100 } as DiaryEntry["nutrition"],
});
const dayBack = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return dayKey(d);
};
const days = (n: number): Record<string, DiaryEntry[]> =>
  Object.fromEntries(
    Array.from({ length: n }, (_, i) => [dayBack(i), [entry()]]),
  );

describe("milestonesForLog — lifetime counting (first-log gate)", () => {
  it("first-log fires only at lifetime EXACTLY 1 (a second log same day does not)", () => {
    const ids = milestonesForLog(
      { [dayBack(0)]: [entry(), entry()] },
      today,
    ).map((m) => m.id);
    expect(ids).not.toContain("first-log");
    expect(ids).toEqual([]); // a 1-day, 2-log day crosses no threshold
  });

  it("counts lifetime across multiple days, not just today", () => {
    const store = { [dayBack(0)]: [entry()], [dayBack(1)]: [entry()] };
    const ids = milestonesForLog(store, today).map((m) => m.id);
    expect(ids).not.toContain("first-log");
  });

  it("a branded-only first entry still counts toward lifetime (first-log fires)", () => {
    const ids = milestonesForLog({ [dayBack(0)]: [brandedEntry()] }, today).map(
      (m) => m.id,
    );
    expect(ids).toContain("first-log");
  });
});

describe("milestonesForLog — every celebrated streak threshold", () => {
  for (const n of [3, 7, 14, 30, 100]) {
    it(`a ${n}-day streak earns streak-${n} and never first-log`, () => {
      const ids = milestonesForLog(days(n), today).map((m) => m.id);
      expect(ids).toContain(`streak-${n}`);
      expect(ids).not.toContain("first-log");
    });
  }

  it("non-threshold streaks (4, 5, 8, 31) earn nothing", () => {
    for (const n of [4, 5, 8, 31]) {
      expect(milestonesForLog(days(n), today)).toEqual([]);
    }
  });

  it("returns at most one milestone per log (streak and first are mutually exclusive here)", () => {
    expect(milestonesForLog(days(3), today)).toHaveLength(1);
    expect(milestonesForLog({ [dayBack(0)]: [entry()] }, today)).toHaveLength(
      1,
    );
  });
});

describe("milestonesForLog — streak anchoring matches loggingStreak", () => {
  it("an un-logged today does not reset a live streak (yesterday-anchored)", () => {
    const store = {
      [dayBack(1)]: [entry()],
      [dayBack(2)]: [entry()],
      [dayBack(3)]: [entry()],
    };
    expect(loggingStreak(store, today)).toBe(3);
    expect(milestonesForLog(store, today).map((m) => m.id)).toContain(
      "streak-3",
    );
  });

  it("a gap before today breaks the streak (no milestone)", () => {
    const store = { [dayBack(0)]: [entry()], [dayBack(2)]: [entry()] };
    expect(loggingStreak(store, today)).toBe(1);
    expect(milestonesForLog(store, today)).toEqual([]);
  });
});

describe("milestonesForLog — empty / degenerate stores", () => {
  it("an empty store earns nothing", () => {
    expect(milestonesForLog({}, today)).toEqual([]);
  });

  it("a store whose only day is an empty array earns nothing", () => {
    expect(milestonesForLog({ [dayBack(0)]: [] }, today)).toEqual([]);
  });
});
