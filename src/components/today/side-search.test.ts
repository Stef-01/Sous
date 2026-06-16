import { describe, it, expect } from "vitest";
import { filterSides } from "./side-search";

const sides = [
  { name: "Garlic Naan", tags: ["indian", "bread"] },
  { name: "Steamed Broccoli", tags: ["vegetable", "healthy"] },
  { name: "Mexican Rice", tags: ["mexican", "rice"] },
];

describe("filterSides (minimalist side search)", () => {
  it("returns the list unchanged for an empty / whitespace query", () => {
    expect(filterSides(sides, "")).toHaveLength(3);
    expect(filterSides(sides, "   ")).toHaveLength(3);
  });

  it("matches on name, case-insensitively", () => {
    expect(filterSides(sides, "naan").map((s) => s.name)).toEqual([
      "Garlic Naan",
    ]);
    expect(filterSides(sides, "RICE").map((s) => s.name)).toEqual([
      "Mexican Rice",
    ]);
  });

  it("matches on a tag", () => {
    expect(filterSides(sides, "indian").map((s) => s.name)).toEqual([
      "Garlic Naan",
    ]);
    expect(filterSides(sides, "vegetable").map((s) => s.name)).toEqual([
      "Steamed Broccoli",
    ]);
  });

  it("returns nothing when there is no match", () => {
    expect(filterSides(sides, "sushi")).toHaveLength(0);
  });
});
