import { describe, expect, it } from "vitest";
import { pickCurrentMeal } from "./today-planned-slot";

describe("pickCurrentMeal", () => {
  it("morning hours → breakfast", () => {
    expect(pickCurrentMeal(new Date(2026, 0, 1, 7))).toBe("breakfast");
    expect(pickCurrentMeal(new Date(2026, 0, 1, 10, 59))).toBe("breakfast");
  });

  it("midday hours → lunch", () => {
    expect(pickCurrentMeal(new Date(2026, 0, 1, 11))).toBe("lunch");
    expect(pickCurrentMeal(new Date(2026, 0, 1, 13))).toBe("lunch");
    expect(pickCurrentMeal(new Date(2026, 0, 1, 15, 59))).toBe("lunch");
  });

  it("afternoon + evening → dinner", () => {
    expect(pickCurrentMeal(new Date(2026, 0, 1, 16))).toBe("dinner");
    expect(pickCurrentMeal(new Date(2026, 0, 1, 19))).toBe("dinner");
    expect(pickCurrentMeal(new Date(2026, 0, 1, 23))).toBe("dinner");
  });

  it("very early morning (pre-breakfast) → breakfast", () => {
    expect(pickCurrentMeal(new Date(2026, 0, 1, 4))).toBe("breakfast");
  });

  it("invalid date → defensive 'dinner'", () => {
    expect(pickCurrentMeal(new Date("not-a-date"))).toBe("dinner");
  });

  it("11:00 boundary → lunch (inclusive)", () => {
    expect(pickCurrentMeal(new Date(2026, 0, 1, 11, 0))).toBe("lunch");
  });

  it("16:00 boundary → dinner (inclusive)", () => {
    expect(pickCurrentMeal(new Date(2026, 0, 1, 16, 0))).toBe("dinner");
  });
});
