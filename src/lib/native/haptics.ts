/**
 * Native haptics adapter (Y4 W15).
 *
 * Pure helper that resolves a "haptic intent" into the right
 * native call once Sprint D / E ship the Capacitor shell. On
 * the web build the resolver returns "no-op" so callers can
 * unconditionally dispatch — no platform-branch at the call
 * site.
 *
 * Sprint D wires the actual @capacitor/haptics import inside
 * the iOS shell; Sprint E mirrors for Android. Until then this
 * module is the contract (intent enum + intensity mapping +
 * web-fallback) so call sites are forward-compatible.
 *
 * Pure / dependency-free.
 */

import type { PlatformDetection } from "./platform";

export type HapticIntent =
  /** A meal slot was filled (low-key positive). */
  | "schedule-success"
  /** Cook win-screen tap (peak-end emphasis). */
  | "win-celebrate"
  /** Tap on a primary CTA. */
  | "tap-primary"
  /** Selection-change in a chip row. */
  | "selection-change"
  /** Validation error / forbidden gesture. */
  | "error";

export interface HapticPlan {
  /** Pattern enum the native plugin understands. The mapping
   *  to actual taps lives in the iOS / Android shells. */
  pattern: "light" | "medium" | "heavy" | "success" | "warning" | "error";
  /** Optional follow-on tick (for two-stage celebrations). */
  followUpMs?: number;
}

/** Pure: classify an intent into a native haptic plan. */
export function planHaptic(intent: HapticIntent): HapticPlan {
  switch (intent) {
    case "schedule-success":
      return { pattern: "success" };
    case "win-celebrate":
      return { pattern: "heavy", followUpMs: 100 };
    case "tap-primary":
      return { pattern: "medium" };
    case "selection-change":
      return { pattern: "light" };
    case "error":
      return { pattern: "error" };
  }
}

export interface HapticDispatchInput {
  intent: HapticIntent;
  detection: PlatformDetection;
  /** Web fallback: vibrate via navigator.vibrate. Most browsers
   *  on desktop ignore this; mobile Chrome supports it. */
  webFallback?: boolean;
}

export interface HapticDispatchResult {
  dispatched: boolean;
  via: "native" | "web-vibrate" | "noop";
  pattern: HapticPlan["pattern"];
}

/** Pure: decide what dispatch path to take. The actual fire-
 *  and-forget invocation lives in a thin per-platform adapter
 *  Sprint D ships; this helper just decides the path so
 *  consumers can branch deterministically. */
export function planHapticDispatch(
  input: HapticDispatchInput,
): HapticDispatchResult {
  const plan = planHaptic(input.intent);
  if (input.detection.isNative) {
    return { dispatched: true, via: "native", pattern: plan.pattern };
  }
  if (input.webFallback) {
    return { dispatched: true, via: "web-vibrate", pattern: plan.pattern };
  }
  return { dispatched: false, via: "noop", pattern: plan.pattern };
}
