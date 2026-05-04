import { describe, expect, it } from "vitest";
import { summariseSlotMap } from "./week-calendar";

describe("summariseSlotMap", () => {
  it("empty map → 0/21", () => {
    expect(summariseSlotMap({})).toEqual({ filled: 0, total: 21 });
  });

  it("counts non-empty string entries as filled", () => {
    expect(
      summariseSlotMap({
        "mon-dinner": "carbonara",
        "tue-lunch": "salad",
      }),
    ).toEqual({ filled: 2, total: 21 });
  });

  it("ignores empty-string entries (defensive)", () => {
    expect(
      summariseSlotMap({
        "mon-dinner": "carbonara",
        "tue-lunch": "",
      }),
    ).toEqual({ filled: 1, total: 21 });
  });

  it("total stays 21 regardless of how many keys exist", () => {
    const fullMap: Record<string, string> = {};
    for (const day of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]) {
      for (const meal of ["breakfast", "lunch", "dinner"]) {
        fullMap[`${day}-${meal}`] = `r-${day}-${meal}`;
      }
    }
    expect(summariseSlotMap(fullMap)).toEqual({ filled: 21, total: 21 });
  });
});
