import { describe, expect, it } from "vitest";
import { formatCoverageStrip } from "./ingredient-pantry-dot";

describe("formatCoverageStrip", () => {
  it("happy path — partial coverage with no expiring", () => {
    expect(
      formatCoverageStrip({ haveCount: 6, lowCount: 0, totalCount: 8 }),
    ).toBe("You have 6 of 8");
  });

  it("partial coverage with low/expiring callout", () => {
    expect(
      formatCoverageStrip({ haveCount: 5, lowCount: 1, totalCount: 8 }),
    ).toBe("You have 6 of 8 — 1 expiring soon");
  });

  it("full coverage", () => {
    expect(
      formatCoverageStrip({ haveCount: 8, lowCount: 0, totalCount: 8 }),
    ).toBe("You have 8 of 8");
  });

  it("zero coverage — single ingredient → singular copy", () => {
    expect(
      formatCoverageStrip({ haveCount: 0, lowCount: 0, totalCount: 1 }),
    ).toBe("Need 1 ingredient");
  });

  it("zero coverage — multi-ingredient → plural copy", () => {
    expect(
      formatCoverageStrip({ haveCount: 0, lowCount: 0, totalCount: 5 }),
    ).toBe("Need 5 ingredients");
  });

  it("empty recipe → empty string", () => {
    expect(
      formatCoverageStrip({ haveCount: 0, lowCount: 0, totalCount: 0 }),
    ).toBe("");
  });

  it("multiple expiring → pluralisation handled in the head, not the tail", () => {
    expect(
      formatCoverageStrip({ haveCount: 4, lowCount: 2, totalCount: 8 }),
    ).toBe("You have 6 of 8 — 2 expiring soon");
  });
});
