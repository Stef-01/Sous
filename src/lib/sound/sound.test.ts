import { describe, expect, it, beforeEach, vi } from "vitest";
import { isSoundEnabled, setSoundEnabled, playSound } from "./sound";

describe("optional sound (W36)", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
      },
    });
  });

  it("is OFF by default", () => {
    expect(isSoundEnabled()).toBe(false);
  });
  it("toggles on and off", () => {
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
  });
  it("playSound is a no-op (never throws) when disabled or no Web Audio", () => {
    expect(() => playSound("win")).not.toThrow();
    setSoundEnabled(true);
    expect(() => playSound("select")).not.toThrow(); // no AudioContext in node → silent
  });
});
