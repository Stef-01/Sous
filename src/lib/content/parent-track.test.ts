import { describe, expect, it } from "vitest";
import { rankForParentMode } from "./parent-track";

const items = [
  { id: "a", audience: "general" as const },
  { id: "b", audience: "parent" as const },
  { id: "c", audience: "general" as const },
  { id: "d", audience: "parent" as const },
  { id: "e" }, // no audience set — defaults to general
];

describe("rankForParentMode", () => {
  it("returns the input order when PM is off", () => {
    expect(rankForParentMode(items, false).map((i) => i.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
  });

  it("promotes parent items above general items when PM is on", () => {
    expect(rankForParentMode(items, true).map((i) => i.id)).toEqual([
      "b",
      "d",
      "a",
      "c",
      "e",
    ]);
  });

  it("preserves original order within each group (stable)", () => {
    const out = rankForParentMode(items, true);
    expect(out.slice(0, 2).map((i) => i.id)).toEqual(["b", "d"]); // parent order
    expect(out.slice(2).map((i) => i.id)).toEqual(["a", "c", "e"]); // general order
  });

  it("does not mutate the input array", () => {
    const before = items.map((i) => i.id);
    rankForParentMode(items, true);
    expect(items.map((i) => i.id)).toEqual(before);
  });

  it("handles empty input", () => {
    expect(rankForParentMode([], true)).toEqual([]);
    expect(rankForParentMode([], false)).toEqual([]);
  });

  it("returns input untouched when no items are tagged 'parent'", () => {
    const onlyGeneral = [{ id: "a", audience: "general" as const }];
    expect(rankForParentMode(onlyGeneral, true)).toEqual(onlyGeneral);
  });
});
