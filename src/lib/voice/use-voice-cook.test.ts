import { describe, expect, it } from "vitest";
import { routeIntent } from "./use-voice-cook";

describe("routeIntent — intent → action mapping", () => {
  it("maps next → { kind: next }", () => {
    expect(routeIntent({ kind: "next" })).toEqual({ kind: "next" });
  });

  it("maps back → { kind: back }", () => {
    expect(routeIntent({ kind: "back" })).toEqual({ kind: "back" });
  });

  it("maps repeat → { kind: repeat }", () => {
    expect(routeIntent({ kind: "repeat" })).toEqual({ kind: "repeat" });
  });

  it("maps done with context → { kind: done, context }", () => {
    expect(routeIntent({ kind: "done", context: "chopping onions" })).toEqual({
      kind: "done",
      context: "chopping onions",
    });
  });

  it("maps done without context", () => {
    expect(routeIntent({ kind: "done", context: null })).toEqual({
      kind: "done",
      context: null,
    });
  });

  it("maps timer-set with seconds payload", () => {
    expect(routeIntent({ kind: "timer-set", seconds: 300 })).toEqual({
      kind: "timer-set",
      seconds: 300,
    });
  });

  it("maps timer-cancel", () => {
    expect(routeIntent({ kind: "timer-cancel" })).toEqual({
      kind: "timer-cancel",
    });
  });

  it("maps timer-status", () => {
    expect(routeIntent({ kind: "timer-status" })).toEqual({
      kind: "timer-status",
    });
  });

  it("maps timer-add with seconds payload", () => {
    expect(routeIntent({ kind: "timer-add", seconds: 30 })).toEqual({
      kind: "timer-add",
      seconds: 30,
    });
  });

  it("collapses pause → ignore", () => {
    expect(routeIntent({ kind: "pause" })).toEqual({ kind: "ignore" });
  });

  it("collapses resume → ignore", () => {
    expect(routeIntent({ kind: "resume" })).toEqual({ kind: "ignore" });
  });

  it("collapses unknown → ignore", () => {
    expect(routeIntent({ kind: "unknown" })).toEqual({ kind: "ignore" });
  });
});

// W19 stress loops — race-condition + poisoned-data on the routing math.
describe("routeIntent — stress: race-condition", () => {
  it("returns equal results across 1000 repeat calls (deterministic)", () => {
    const intent = { kind: "done" as const, context: "chopping onions" };
    let last = routeIntent(intent);
    for (let i = 0; i < 1000; i += 1) {
      expect(routeIntent(intent)).toEqual(last);
      last = routeIntent(intent);
    }
  });

  it("doesn't share state between calls (intent input is preserved)", () => {
    // The router shouldn't mutate the input intent.
    const intent = { kind: "done" as const, context: "x" };
    routeIntent(intent);
    routeIntent(intent);
    expect(intent.context).toBe("x");
  });
});

describe("routeIntent — stress: poisoned-data", () => {
  it("preserves context through routing (even empty string)", () => {
    expect(routeIntent({ kind: "done", context: "" })).toEqual({
      kind: "done",
      context: "",
    });
  });

  it("preserves seconds=0 (caller responsibility to validate)", () => {
    expect(routeIntent({ kind: "timer-set", seconds: 0 })).toEqual({
      kind: "timer-set",
      seconds: 0,
    });
  });

  it("preserves negative seconds (no clamping in router)", () => {
    // Router is a pure pass-through. The page-level reducer that
    // consumes the action is responsible for clamping. Pin the
    // contract so a future router change doesn't accidentally clamp.
    expect(routeIntent({ kind: "timer-add", seconds: -10 })).toEqual({
      kind: "timer-add",
      seconds: -10,
    });
  });

  it("preserves very large seconds without overflow", () => {
    expect(routeIntent({ kind: "timer-set", seconds: 999_999 })).toEqual({
      kind: "timer-set",
      seconds: 999_999,
    });
  });
});
