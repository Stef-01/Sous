/**
 * Unit tests for the groupReplies pure helper used by the W8 forum
 * reply-to-reply nesting.
 *
 * The helper enforces the design rule: only ONE level of nesting.
 * A reply-to-a-reply attaches under its top-level parent. A reply-
 * to-a-reply-to-a-reply also attaches under the same top-level
 * parent — the thread can't grow indented forever.
 */

import { describe, expect, it } from "vitest";
import { groupReplies } from "./page";

interface R {
  id: string;
  authorHandle: string;
  body: string;
  createdAt: string;
  inReplyToId?: string;
  isDraft: boolean;
}

const r = (
  id: string,
  inReplyToId?: string,
  createdAt = "2026-05-01T10:00:00Z",
): R => ({
  id,
  authorHandle: "@user",
  body: "test",
  createdAt,
  inReplyToId,
  isDraft: false,
});

describe("groupReplies", () => {
  it("returns top-level replies as their own groups with empty children", () => {
    const result = groupReplies([r("a"), r("b")]);
    expect(result).toHaveLength(2);
    expect(result[0].top.id).toBe("a");
    expect(result[0].children).toEqual([]);
    expect(result[1].top.id).toBe("b");
    expect(result[1].children).toEqual([]);
  });

  it("attaches a reply-to-X under X as a child", () => {
    const result = groupReplies([r("a"), r("b", "a")]);
    expect(result).toHaveLength(1);
    expect(result[0].top.id).toBe("a");
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].id).toBe("b");
  });

  it("flattens 2nd-level nesting up to the topmost reply (no infinite indent)", () => {
    // a (top) ← b (replies to a) ← c (replies to b)
    // Expected: c attaches under a alongside b, NOT nested under b.
    const result = groupReplies([r("a"), r("b", "a"), r("c", "b")]);
    expect(result).toHaveLength(1);
    expect(result[0].top.id).toBe("a");
    expect(result[0].children.map((c) => c.id)).toEqual(["b", "c"]);
  });

  it("treats a reply with an unknown inReplyToId as top-level", () => {
    // Defensive: if the parent reply was deleted but the child
    // remains in the data, render the child as a top-level reply
    // rather than dropping it.
    const result = groupReplies([r("a", "missing-parent")]);
    expect(result).toHaveLength(1);
    expect(result[0].top.id).toBe("a");
  });

  it("preserves multiple distinct top-level chains independently", () => {
    const result = groupReplies([
      r("a"),
      r("b", "a"),
      r("c"),
      r("d", "c"),
      r("e", "c"),
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].top.id).toBe("a");
    expect(result[0].children.map((c) => c.id)).toEqual(["b"]);
    expect(result[1].top.id).toBe("c");
    expect(result[1].children.map((c) => c.id)).toEqual(["d", "e"]);
  });

  it("returns an empty result for an empty list", () => {
    expect(groupReplies([])).toEqual([]);
  });
});
