import { describe, expect, it } from "vitest";
import { planHaptic, planHapticDispatch } from "./haptics";

describe("planHaptic", () => {
  it("maps each intent to a deterministic pattern", () => {
    expect(planHaptic("schedule-success").pattern).toBe("success");
    expect(planHaptic("win-celebrate").pattern).toBe("heavy");
    expect(planHaptic("tap-primary").pattern).toBe("medium");
    expect(planHaptic("selection-change").pattern).toBe("light");
    expect(planHaptic("error").pattern).toBe("error");
  });

  it("win-celebrate has a follow-up tick", () => {
    expect(planHaptic("win-celebrate").followUpMs).toBe(100);
  });
});

describe("planHapticDispatch", () => {
  it("uses native path when on a native platform", () => {
    const out = planHapticDispatch({
      intent: "tap-primary",
      detection: { platform: "ios", isNative: true },
    });
    expect(out.dispatched).toBe(true);
    expect(out.via).toBe("native");
  });

  it("uses web-vibrate fallback on web when enabled", () => {
    const out = planHapticDispatch({
      intent: "tap-primary",
      detection: { platform: "web", isNative: false },
      webFallback: true,
    });
    expect(out.dispatched).toBe(true);
    expect(out.via).toBe("web-vibrate");
  });

  it("noops on web when web-fallback is disabled", () => {
    const out = planHapticDispatch({
      intent: "tap-primary",
      detection: { platform: "web", isNative: false },
    });
    expect(out.dispatched).toBe(false);
    expect(out.via).toBe("noop");
  });

  it("preserves the planned pattern across dispatch paths", () => {
    const native = planHapticDispatch({
      intent: "win-celebrate",
      detection: { platform: "ios", isNative: true },
    });
    const web = planHapticDispatch({
      intent: "win-celebrate",
      detection: { platform: "web", isNative: false },
      webFallback: true,
    });
    expect(native.pattern).toBe("heavy");
    expect(web.pattern).toBe("heavy");
  });
});
