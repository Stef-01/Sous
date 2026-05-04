/**
 * Adaptive icon + splash-screen helper (Y4 W18).
 *
 * Pure helpers for generating the Capacitor adaptive-icon /
 * splash manifest entries from the design tokens. Keeps the
 * icon set in sync with the W3 brand colours so a swap to
 * dark-mode brand variant doesn't require touching iOS/Android
 * project files manually.
 *
 * Sprint E ships @capacitor/splash-screen + the iOS/Android
 * project scaffolds; W18 lands the manifest contract.
 *
 * Pure / dependency-free.
 */

export interface AdaptiveIconConfig {
  /** Background colour hex (with leading #). */
  backgroundColor: string;
  /** Foreground asset path relative to the resources dir. */
  foregroundAsset: string;
  /** Monochrome asset for Android themed icons (optional). */
  monochromeAsset?: string;
}

export interface SplashScreenConfig {
  /** Backgound colour hex. */
  backgroundColor: string;
  /** Logo asset path. */
  logoAsset: string;
  /** Show duration in ms before fading to app. */
  showDurationMs: number;
  /** Whether to animate the fade-out (respects reduced-motion
   *  via CSS the splash html embeds). */
  fadeOut: boolean;
}

export const SPLASH_DEFAULT_DURATION_MS = 1800;
export const SPLASH_MIN_DURATION_MS = 600;
export const SPLASH_MAX_DURATION_MS = 4000;

export function clampSplashDuration(ms: number): number {
  if (!Number.isFinite(ms)) return SPLASH_DEFAULT_DURATION_MS;
  return Math.min(
    SPLASH_MAX_DURATION_MS,
    Math.max(SPLASH_MIN_DURATION_MS, Math.floor(ms)),
  );
}

export interface BrandTokens {
  /** Cream background — matches Y3 W3 design tokens. */
  cream: string;
  /** Sous green primary. */
  green: string;
  /** Dark text. */
  dark: string;
}

/** Pure: build the adaptive-icon manifest from brand tokens.
 *  Android uses cream as the layer behind the foreground; iOS
 *  uses the same cream as the launch background for consistency. */
export function buildAdaptiveIconConfig(
  brand: BrandTokens,
): AdaptiveIconConfig {
  return {
    backgroundColor: brand.cream,
    foregroundAsset: "assets/icon-foreground.png",
    monochromeAsset: "assets/icon-monochrome.png",
  };
}

/** Pure: splash-screen config matching the brand tokens. */
export function buildSplashScreenConfig(input: {
  brand: BrandTokens;
  durationMs?: number;
  fadeOut?: boolean;
}): SplashScreenConfig {
  return {
    backgroundColor: input.brand.cream,
    logoAsset: "assets/splash-logo.png",
    showDurationMs: clampSplashDuration(
      input.durationMs ?? SPLASH_DEFAULT_DURATION_MS,
    ),
    fadeOut: input.fadeOut ?? true,
  };
}

/** Pure: validate that a hex colour is well-formed. */
export function isValidHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}
