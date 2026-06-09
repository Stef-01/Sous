import { describe, expect, it, beforeEach, vi } from "vitest";
import { isFirstRunSeen, markFirstRunSeen } from "./first-run";

describe("first-run coachmark gate (Phase 4)", () => {
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

  it("a fresh user has NOT seen it", () => {
    expect(isFirstRunSeen()).toBe(false);
  });
  it("marking it makes it seen (self-clearing, never reappears)", () => {
    markFirstRunSeen();
    expect(isFirstRunSeen()).toBe(true);
  });
  it("is idempotent", () => {
    markFirstRunSeen();
    markFirstRunSeen();
    expect(isFirstRunSeen()).toBe(true);
  });
});

describe("first-run gate — SSR / locked storage", () => {
  it("returns true (no flash) when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(isFirstRunSeen()).toBe(true);
  });
});
