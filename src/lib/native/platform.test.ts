import { describe, expect, it } from "vitest";
import { detectPlatform, nativeFeatures } from "./platform";

describe("detectPlatform", () => {
  it("returns web when no Capacitor + bland UA", () => {
    const out = detectPlatform({ userAgent: "Mozilla/5.0" });
    expect(out.platform).toBe("web");
    expect(out.isNative).toBe(false);
  });

  it("returns iOS when Capacitor reports ios", () => {
    const out = detectPlatform({
      capacitor: { getPlatform: () => "ios" },
    });
    expect(out.platform).toBe("ios");
    expect(out.isNative).toBe(true);
  });

  it("returns android when Capacitor reports android", () => {
    const out = detectPlatform({
      capacitor: { getPlatform: () => "android" },
    });
    expect(out.platform).toBe("android");
    expect(out.isNative).toBe(true);
  });

  it("falls back to web when Capacitor reports an unknown platform", () => {
    const out = detectPlatform({
      capacitor: { getPlatform: () => "electron" },
    });
    expect(out.platform).toBe("web");
  });

  it("UA sniff signals iOS via 'sous-ios' marker", () => {
    const out = detectPlatform({
      userAgent: "MyShell sous-ios/1.0",
    });
    expect(out.platform).toBe("ios");
  });

  it("UA sniff signals android via 'sous-android' marker", () => {
    const out = detectPlatform({
      userAgent: "MyShell sous-android/1.0",
    });
    expect(out.platform).toBe("android");
  });

  it("Capacitor takes precedence over UA sniff when both present", () => {
    const out = detectPlatform({
      capacitor: { getPlatform: () => "ios" },
      userAgent: "MyShell sous-android/1.0",
    });
    expect(out.platform).toBe("ios");
  });

  it("ignores Capacitor without getPlatform", () => {
    const out = detectPlatform({ capacitor: { other: "thing" } });
    expect(out.platform).toBe("web");
  });
});

describe("nativeFeatures", () => {
  it("disables every flag on web", () => {
    const out = nativeFeatures({ platform: "web", isNative: false });
    expect(out).toEqual({
      haptics: false,
      nativeCamera: false,
      pushNotifications: false,
      appBadge: false,
    });
  });

  it("enables core flags on iOS, including appBadge", () => {
    const out = nativeFeatures({ platform: "ios", isNative: true });
    expect(out.haptics).toBe(true);
    expect(out.nativeCamera).toBe(true);
    expect(out.pushNotifications).toBe(true);
    expect(out.appBadge).toBe(true);
  });

  it("enables core flags on Android but disables appBadge (per-launcher)", () => {
    const out = nativeFeatures({ platform: "android", isNative: true });
    expect(out.haptics).toBe(true);
    expect(out.nativeCamera).toBe(true);
    expect(out.pushNotifications).toBe(true);
    expect(out.appBadge).toBe(false);
  });
});
