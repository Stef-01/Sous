import { describe, expect, it } from "vitest";
import { pickUpNextNode } from "./up-next-banner";

type Arg = Parameters<typeof pickUpNextNode>[0];
const mk = (rows: Array<[string, string]>) =>
  rows.map(([id, status]) => ({ id, name: id, status })) as unknown as Arg;

describe("pickUpNextNode (Phase 7)", () => {
  it("prefers an in_progress node over available", () => {
    const r = pickUpNextNode(
      mk([
        ["a", "completed"],
        ["b", "in_progress"],
        ["c", "available"],
      ]),
    );
    expect(r?.id).toBe("b");
  });

  it("falls back to the FIRST available when none in progress", () => {
    const r = pickUpNextNode(
      mk([
        ["a", "completed"],
        ["c", "available"],
        ["d", "available"],
      ]),
    );
    expect(r?.id).toBe("c");
  });

  it("returns null when all completed or locked", () => {
    expect(
      pickUpNextNode(
        mk([
          ["a", "completed"],
          ["z", "locked"],
        ]),
      ),
    ).toBeNull();
  });

  it("returns null for an empty tree", () => {
    expect(pickUpNextNode(mk([]))).toBeNull();
  });
});
