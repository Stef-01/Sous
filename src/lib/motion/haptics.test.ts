import { describe, expect, it, vi } from "vitest";
import { haptic } from "./haptics";

describe("haptic vocabulary (W4)", () => {
  it("calls navigator.vibrate with a pattern per intent, and never throws", () => {
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate });
    for (const p of ["select", "commit", "success", "warn"] as const) {
      haptic(p);
    }
    expect(vibrate).toHaveBeenCalledTimes(4);
    vi.unstubAllGlobals();
  });

  it("is silent when the Vibration API is absent", () => {
    vi.stubGlobal("navigator", {});
    expect(() => haptic("commit")).not.toThrow();
    vi.unstubAllGlobals();
  });
});
