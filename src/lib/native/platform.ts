/**
 * Native platform detection (Y4 W13 — Sprint D start).
 *
 * Pure helpers for the Capacitor-shell wrapping. The Y3 web
 * surfaces all keep working unchanged inside Capacitor; this
 * module gates the new native-only paths (haptics, camera,
 * push tokens) so they no-op gracefully on the web build.
 *
 * Real-mode wire-up: when the iOS / Android shells ship with
 * `@capacitor/core`, the runtime detection picks "native" and
 * the native-plugin imports become live. Until then, every
 * caller falls back to the Y3 web behaviour.
 *
 * Pure / dependency-free.
 */

export type AppPlatform = "web" | "ios" | "android";

export interface PlatformDetectionInput {
  /** `window.Capacitor` — present in the native shell. */
  capacitor?: unknown;
  /** `navigator.userAgent` for fingerprinting fallback. */
  userAgent?: string;
}

export interface PlatformDetection {
  platform: AppPlatform;
  isNative: boolean;
}

/** Pure: classify the platform. */
export function detectPlatform(
  input: PlatformDetectionInput,
): PlatformDetection {
  // Capacitor shell injects window.Capacitor with a getPlatform()
  // function. We treat its presence as the strong signal.
  const cap = input.capacitor as
    | { getPlatform?: () => string; isNativePlatform?: () => boolean }
    | undefined;
  if (cap && typeof cap.getPlatform === "function") {
    const reported = cap.getPlatform();
    if (reported === "ios" || reported === "android") {
      return { platform: reported, isNative: true };
    }
  }
  // Fallback: UA sniff. Conservative — we only go native if the
  // signal is unambiguous; otherwise stay on the web fallback.
  const ua = (input.userAgent ?? "").toLowerCase();
  if (ua.includes("sous-ios")) return { platform: "ios", isNative: true };
  if (ua.includes("sous-android"))
    return { platform: "android", isNative: true };
  return { platform: "web", isNative: false };
}

/** Pure runtime detection (SSR-safe). */
export function detectCurrentPlatform(): PlatformDetection {
  const win = (
    typeof globalThis !== "undefined"
      ? (globalThis as unknown as { window?: { Capacitor?: unknown } }).window
      : undefined
  ) as { Capacitor?: unknown } | undefined;
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
  return detectPlatform({ capacitor: win?.Capacitor, userAgent: ua });
}

/** Pure: feature-availability gate. Each native-only feature
 *  has a flag here so consumers can branch without import-
 *  cycle hassles. */
export interface NativeFeatureMatrix {
  haptics: boolean;
  nativeCamera: boolean;
  pushNotifications: boolean;
  /** App badge counter on the home screen icon. */
  appBadge: boolean;
}

export function nativeFeatures(
  detection: PlatformDetection,
): NativeFeatureMatrix {
  if (!detection.isNative) {
    return {
      haptics: false,
      nativeCamera: false,
      pushNotifications: false,
      appBadge: false,
    };
  }
  return {
    haptics: true,
    nativeCamera: true,
    pushNotifications: true,
    appBadge: detection.platform === "ios", // Android counter is per-launcher
  };
}
