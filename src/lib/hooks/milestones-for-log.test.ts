import { describe, expect, it } from "vitest";
import {
  milestonesForLog,
  dayKey,
  type DiaryEntry,
} from "./use-nutrition-diary";

const today = new Date("2026-06-09T12:00:00");
const entry = (slug = "x"): DiaryEntry => ({
  slug,
  name: "X",
  servings: 1,
  at: "2026-06-09T12:00:00.000Z",
});
const dayBack = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

describe("milestonesForLog — Phase 3 / R4 decision", () => {
  it("the first-ever log earns the first-log milestone", () => {
    const ids = milestonesForLog({ [dayBack(0)]: [entry()] }, today).map(
      (m) => m.id,
    );
    expect(ids).toContain("first-log");
  });

  it("crossing a 3-day streak earns streak-3, not first-log", () => {
    const store = {
      [dayBack(0)]: [entry()],
      [dayBack(1)]: [entry()],
      [dayBack(2)]: [entry()],
    };
    const ids = milestonesForLog(store, today).map((m) => m.id);
    expect(ids).toContain("streak-3");
    expect(ids).not.toContain("first-log");
  });

  it("a non-milestone day (2-day streak, 2 logs) earns nothing", () => {
    const store = { [dayBack(0)]: [entry()], [dayBack(1)]: [entry()] };
    expect(milestonesForLog(store, today)).toEqual([]);
  });

  it("an empty store earns nothing", () => {
    expect(milestonesForLog({}, today)).toEqual([]);
  });
});
