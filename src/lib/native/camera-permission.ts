/**
 * Native camera permission helpers (Y4 W15).
 *
 * Pure helpers that classify the camera-permission state +
 * pick the right user-facing copy based on platform.
 *
 * Sprint D / E wire @capacitor/camera. The Y3 W13 pantry-scan
 * stub flow already calls navigator.mediaDevices.getUserMedia()
 * inside Capacitor — this module gates the request UI based
 * on platform + previous state.
 *
 * Pure / dependency-free.
 */

import type { PlatformDetection } from "./platform";

export type CameraPermissionStatus =
  | "granted"
  | "denied"
  | "prompt"
  | "unknown";

export interface CameraPromptCopy {
  title: string;
  body: string;
  primaryCta: string;
  secondaryCta?: string;
}

/** Pure: pick the explanation copy. iOS guards permission
 *  flips behind Settings; Android lets the user re-prompt
 *  inline. The copy explains the path. */
export function buildCameraPermissionCopy(input: {
  detection: PlatformDetection;
  status: CameraPermissionStatus;
}): CameraPromptCopy {
  const { detection, status } = input;
  if (status === "granted") {
    return {
      title: "Camera ready",
      body: "Tap Capture when your pantry is in frame.",
      primaryCta: "Capture",
    };
  }
  if (status === "denied") {
    if (detection.platform === "ios") {
      return {
        title: "Camera access blocked",
        body: "Open Settings → Sous → Camera and toggle it on, then come back.",
        primaryCta: "Open Settings",
        secondaryCta: "Skip for now",
      };
    }
    if (detection.platform === "android") {
      return {
        title: "Camera access blocked",
        body: "Tap the Camera switch in app permissions to re-enable.",
        primaryCta: "Open settings",
        secondaryCta: "Skip for now",
      };
    }
    return {
      title: "Camera access blocked",
      body: "Update site permissions in your browser to use the camera here.",
      primaryCta: "Skip for now",
    };
  }
  if (status === "prompt") {
    return {
      title: "Photograph your pantry?",
      body: "We process photos on-device first. Nothing leaves until you confirm.",
      primaryCta: "Allow camera",
      secondaryCta: "Type ingredients instead",
    };
  }
  // unknown
  return {
    title: "Camera",
    body: "Checking access…",
    primaryCta: "Continue",
  };
}

/** Pure: should we show the inline re-prompt banner? */
export function shouldShowCameraReprompt(input: {
  detection: PlatformDetection;
  status: CameraPermissionStatus;
  /** "Asked before but the user dismissed" — we don't badger. */
  dismissedAt?: string;
  /** ISO now. */
  now: string;
  /** Days to silence the banner after a dismiss. */
  silenceDays?: number;
}): boolean {
  if (input.status === "granted") return false;
  if (input.status === "unknown") return false;
  if (!input.dismissedAt) return true;
  const silenceDays = input.silenceDays ?? 7;
  const dismissed = new Date(input.dismissedAt).getTime();
  const now = new Date(input.now).getTime();
  if (!Number.isFinite(dismissed) || !Number.isFinite(now)) return true;
  const elapsedDays = (now - dismissed) / (24 * 60 * 60 * 1000);
  return elapsedDays >= silenceDays;
}
