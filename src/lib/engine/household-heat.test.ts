import { describe, expect, it } from "vitest";
import { sideTooSpicyForTable, LOW_HEAT_TOLERANCE } from "./household-heat";

describe("sideTooSpicyForTable", () => {
  it("excludes an explicitly-spicy side when the table's tolerance is low (≤2)", () => {
    expect(sideTooSpicyForTable(["spicy"], [], 1)).toBe(true);
    expect(sideTooSpicyForTable([], ["Spicy"], 2)).toBe(true); // flavorProfile + case
    expect(sideTooSpicyForTable(["Fiery"], [], 1)).toBe(true);
    // boundary: at the threshold, still excluded
    expect(sideTooSpicyForTable(["spicy"], [], LOW_HEAT_TOLERANCE)).toBe(true);
  });

  it("keeps spicy sides for a tolerant table — and for no table (default 5)", () => {
    expect(sideTooSpicyForTable(["spicy"], [], LOW_HEAT_TOLERANCE + 1)).toBe(
      false,
    );
    expect(sideTooSpicyForTable(["spicy"], [], 5)).toBe(false);
  });

  it("never excludes a non-spicy side, even at the lowest tolerance", () => {
    expect(sideTooSpicyForTable(["salad", "fresh"], ["bright"], 1)).toBe(false);
    expect(sideTooSpicyForTable([], [], 1)).toBe(false);
  });

  it("treats a non-finite tolerance as no restriction (defensive)", () => {
    expect(sideTooSpicyForTable(["spicy"], [], NaN)).toBe(false);
  });
});
