import { describe, expect, it } from "vitest";
import {
  buildCameraPermissionCopy,
  shouldShowCameraReprompt,
} from "./camera-permission";

describe("buildCameraPermissionCopy", () => {
  it("returns ready copy when granted", () => {
    const copy = buildCameraPermissionCopy({
      detection: { platform: "ios", isNative: true },
      status: "granted",
    });
    expect(copy.title).toMatch(/ready/i);
    expect(copy.primaryCta).toBe("Capture");
  });

  it("instructs Settings flow on iOS when denied", () => {
    const copy = buildCameraPermissionCopy({
      detection: { platform: "ios", isNative: true },
      status: "denied",
    });
    expect(copy.title).toMatch(/blocked/i);
    expect(copy.body).toMatch(/Settings/);
    expect(copy.primaryCta).toMatch(/Settings/);
  });

  it("instructs app-permissions flow on Android when denied", () => {
    const copy = buildCameraPermissionCopy({
      detection: { platform: "android", isNative: true },
      status: "denied",
    });
    expect(copy.body).toMatch(/permissions/);
  });

  it("instructs site-permissions flow on web when denied", () => {
    const copy = buildCameraPermissionCopy({
      detection: { platform: "web", isNative: false },
      status: "denied",
    });
    expect(copy.body).toMatch(/site permissions|browser/i);
  });

  it("opens with privacy-respecting prompt when status is prompt", () => {
    const copy = buildCameraPermissionCopy({
      detection: { platform: "web", isNative: false },
      status: "prompt",
    });
    expect(copy.body).toMatch(/on-device/);
    expect(copy.primaryCta).toMatch(/Allow/);
  });

  it("falls back to neutral copy on unknown", () => {
    const copy = buildCameraPermissionCopy({
      detection: { platform: "web", isNative: false },
      status: "unknown",
    });
    expect(copy.body).toMatch(/Checking/);
  });
});

describe("shouldShowCameraReprompt", () => {
  it("does not show when granted", () => {
    expect(
      shouldShowCameraReprompt({
        detection: { platform: "ios", isNative: true },
        status: "granted",
        now: "2026-05-03T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("does not show when status is unknown", () => {
    expect(
      shouldShowCameraReprompt({
        detection: { platform: "ios", isNative: true },
        status: "unknown",
        now: "2026-05-03T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("shows when denied + never dismissed", () => {
    expect(
      shouldShowCameraReprompt({
        detection: { platform: "android", isNative: true },
        status: "denied",
        now: "2026-05-03T12:00:00Z",
      }),
    ).toBe(true);
  });

  it("silences for 7 days after a dismiss", () => {
    expect(
      shouldShowCameraReprompt({
        detection: { platform: "android", isNative: true },
        status: "denied",
        dismissedAt: "2026-05-01T00:00:00Z",
        now: "2026-05-03T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("re-shows after 7 days", () => {
    expect(
      shouldShowCameraReprompt({
        detection: { platform: "android", isNative: true },
        status: "denied",
        dismissedAt: "2026-04-20T00:00:00Z",
        now: "2026-05-03T12:00:00Z",
      }),
    ).toBe(true);
  });

  it("respects custom silenceDays override", () => {
    expect(
      shouldShowCameraReprompt({
        detection: { platform: "android", isNative: true },
        status: "denied",
        dismissedAt: "2026-05-01T00:00:00Z",
        now: "2026-05-03T12:00:00Z",
        silenceDays: 1,
      }),
    ).toBe(true);
  });
});
