import { describe, expect, it } from "vitest";
import {
  buildSlotKey,
  dayKeyFromDate,
  isoWeekKey,
  mealPlanSlotSchema,
  mealPlanWeekSchema,
  nextDayKey,
  parseSlotKey,
} from "./meal-plan";

describe("buildSlotKey + parseSlotKey", () => {
  it("round-trips for every day × meal combination", () => {
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
    const meals = ["breakfast", "lunch", "dinner"] as const;
    for (const d of days) {
      for (const m of meals) {
        const key = buildSlotKey(d, m);
        const parsed = parseSlotKey(key);
        expect(parsed).toEqual({ day: d, meal: m });
      }
    }
  });

  it("parseSlotKey returns null on malformed input", () => {
    expect(parseSlotKey("not-a-key")).toBeNull();
    expect(parseSlotKey("monday-breakfast")).toBeNull();
    expect(parseSlotKey("mon-snack")).toBeNull();
  });
});

describe("nextDayKey", () => {
  it("mon → tue", () => expect(nextDayKey("mon")).toBe("tue"));
  it("sat → sun", () => expect(nextDayKey("sat")).toBe("sun"));
  it("sun wraps to mon", () => expect(nextDayKey("sun")).toBe("mon"));
});

describe("dayKeyFromDate", () => {
  it("Monday → 'mon'", () => {
    expect(dayKeyFromDate(new Date("2026-05-11T12:00:00"))).toBe("mon");
  });
  it("Saturday → 'sat'", () => {
    expect(dayKeyFromDate(new Date("2026-05-16T12:00:00"))).toBe("sat");
  });
  it("invalid date → defensive 'mon'", () => {
    expect(dayKeyFromDate(new Date("not-a-date"))).toBe("mon");
  });
});

describe("isoWeekKey", () => {
  it("returns YYYY-Www format", () => {
    expect(isoWeekKey(new Date("2026-05-11T00:00:00Z"))).toMatch(
      /^\d{4}-W\d{2}$/,
    );
  });
  it("invalid date → empty", () => {
    expect(isoWeekKey(new Date("not-a-date"))).toBe("");
  });
  it("dates within the same ISO week return the same key", () => {
    const a = isoWeekKey(new Date("2026-05-11T08:00:00Z"));
    const b = isoWeekKey(new Date("2026-05-15T20:00:00Z"));
    expect(a).toBe(b);
  });
});

describe("mealPlanSlotSchema", () => {
  it("accepts a well-formed slot", () => {
    const out = mealPlanSlotSchema.safeParse({
      slot: "tue-lunch",
      recipeSlug: "chicken-rice-bowl",
      source: "leftovers-auto",
      scheduledAt: "2026-05-12T18:00:00.000Z",
    });
    expect(out.success).toBe(true);
  });

  it("rejects malformed slot key", () => {
    expect(
      mealPlanSlotSchema.safeParse({
        slot: "monday-lunch",
        recipeSlug: "x",
        source: "manual",
        scheduledAt: "2026-05-12T18:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("rejects unknown source", () => {
    expect(
      mealPlanSlotSchema.safeParse({
        slot: "tue-lunch",
        recipeSlug: "x",
        source: "rolled-dice",
        scheduledAt: "2026-05-12T18:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

describe("mealPlanWeekSchema", () => {
  it("accepts a well-formed week with empty scheduled list", () => {
    const out = mealPlanWeekSchema.safeParse({
      schemaVersion: 1,
      weekKey: "2026-W19",
      scheduled: [],
      updatedAt: "2026-05-11T00:00:00.000Z",
    });
    expect(out.success).toBe(true);
  });

  it("rejects mismatched schemaVersion", () => {
    expect(
      mealPlanWeekSchema.safeParse({
        schemaVersion: 99,
        weekKey: "2026-W19",
        scheduled: [],
        updatedAt: "2026-05-11T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("rejects malformed weekKey", () => {
    expect(
      mealPlanWeekSchema.safeParse({
        schemaVersion: 1,
        weekKey: "May Week 19",
        scheduled: [],
        updatedAt: "2026-05-11T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});
