import { describe, it, expect } from "vitest";
import { applyToggleThanks } from "./use-forum-thanks";

describe("applyToggleThanks — pure toggle helper", () => {
  it("starts a fresh entry as thanked when the reply was untracked", () => {
    expect(applyToggleThanks({}, "reply-1")).toEqual({
      "reply-1": { thanked: true },
    });
  });

  it("toggles a thanked reply back to not-thanked", () => {
    const initial = { "reply-1": { thanked: true } };
    expect(applyToggleThanks(initial, "reply-1")).toEqual({
      "reply-1": { thanked: false },
    });
  });

  it("toggles a previously-thanked-then-untoggled reply back to thanked", () => {
    const initial = { "reply-1": { thanked: false } };
    expect(applyToggleThanks(initial, "reply-1")).toEqual({
      "reply-1": { thanked: true },
    });
  });

  it("preserves other replies' state when toggling one", () => {
    const initial = {
      "reply-1": { thanked: true },
      "reply-2": { thanked: false },
    };
    expect(applyToggleThanks(initial, "reply-1")).toEqual({
      "reply-1": { thanked: false },
      "reply-2": { thanked: false },
    });
  });

  it("returns a new object reference (immutable update)", () => {
    const initial = { "reply-1": { thanked: true } };
    const result = applyToggleThanks(initial, "reply-1");
    expect(result).not.toBe(initial);
  });
});
