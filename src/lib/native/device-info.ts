/**
 * Cross-platform device-info reporter (Y4 W19).
 *
 * Pure helpers that classify device class, screen, and locale
 * from a normalised input. The native shell collects via
 * @capacitor/device; the web fallback uses navigator + screen.
 *
 * Privacy posture: this module never reads from globals — every
 * input is passed in. The hosting layer collects raw signals,
 * sanitises (strip OS minor versions, round screen dims), and
 * THEN passes here. Output is deliberately coarse so the
 * eventual analytics ledger doesn't fingerprint a single user.
 *
 * Pure / dependency-free.
 */

import type { AppPlatform } from "./platform";

export type DeviceClass = "phone" | "tablet" | "desktop" | "other";

export interface DeviceInfoInput {
  platform: AppPlatform;
  /** Width in CSS pixels. */
  screenWidth: number;
  /** Height in CSS pixels. */
  screenHeight: number;
  /** Sanitised OS major version, e.g. "iOS 17", "Android 14". */
  osLabel?: string;
  /** Locale code, e.g. "en-US". */
  locale?: string;
}

export interface DeviceInfo {
  platform: AppPlatform;
  deviceClass: DeviceClass;
  /** Coarse bucket: "small" / "medium" / "large" — keeps the
   *  reporter from reading exact pixel dims into the ledger. */
  screenBucket: "small" | "medium" | "large";
  osLabel?: string;
  locale: string;
}

/** Pure: classify a device based on the smaller dimension. */
export function classifyDeviceClass(input: {
  platform: AppPlatform;
  screenWidth: number;
  screenHeight: number;
}): DeviceClass {
  const min = Math.min(input.screenWidth, input.screenHeight);
  if (input.platform === "web") {
    if (min >= 768) return "desktop";
    return "phone";
  }
  // Native: tablet threshold ~600 dp short side.
  if (min >= 600) return "tablet";
  if (min > 0) return "phone";
  return "other";
}

/** Pure: bucket the screen size into small/medium/large. */
export function classifyScreenBucket(input: {
  screenWidth: number;
  screenHeight: number;
}): "small" | "medium" | "large" {
  const max = Math.max(input.screenWidth, input.screenHeight);
  if (max < 700) return "small";
  if (max < 1100) return "medium";
  return "large";
}

/** Pure: build the coarse device-info report. */
export function buildDeviceInfo(input: DeviceInfoInput): DeviceInfo {
  return {
    platform: input.platform,
    deviceClass: classifyDeviceClass({
      platform: input.platform,
      screenWidth: input.screenWidth,
      screenHeight: input.screenHeight,
    }),
    screenBucket: classifyScreenBucket({
      screenWidth: input.screenWidth,
      screenHeight: input.screenHeight,
    }),
    osLabel: input.osLabel,
    locale: input.locale ?? "en-US",
  };
}

/** Pure: redaction. Strips any field that could narrow the
 *  user beyond a coarse bucket — used when forwarding the
 *  report to a third-party analytics consumer. */
export function redactForAnalytics(info: DeviceInfo): DeviceInfo {
  return {
    platform: info.platform,
    deviceClass: info.deviceClass,
    screenBucket: info.screenBucket,
    // Drop osLabel + collapse locale to language only.
    osLabel: undefined,
    locale: info.locale.split("-")[0] ?? "en",
  };
}
