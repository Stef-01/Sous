import { describe, expect, it } from "vitest";
import {
  buildAdaptiveIconConfig,
  buildSplashScreenConfig,
  clampSplashDuration,
  isValidHexColor,
  SPLASH_DEFAULT_DURATION_MS,
  SPLASH_MAX_DURATION_MS,
  SPLASH_MIN_DURATION_MS,
} from "./adaptive-icon";

const brand = {
  cream: "#F8F2E4",
  green: "#3A6B4D",
  dark: "#1F1B16",
};

describe("clampSplashDuration", () => {
  it("returns default for non-finite", () => {
    expect(clampSplashDuration(Number.NaN)).toBe(SPLASH_DEFAULT_DURATION_MS);
  });

  it("clamps below minimum", () => {
    expect(clampSplashDuration(0)).toBe(SPLASH_MIN_DURATION_MS);
  });

  it("clamps above maximum", () => {
    expect(clampSplashDuration(10_000)).toBe(SPLASH_MAX_DURATION_MS);
  });

  it("passes through valid range", () => {
    expect(clampSplashDuration(1500)).toBe(1500);
  });

  it("floors fractional input", () => {
    expect(clampSplashDuration(1500.7)).toBe(1500);
  });
});

describe("buildAdaptiveIconConfig", () => {
  it("uses cream as the background", () => {
    const out = buildAdaptiveIconConfig(brand);
    expect(out.backgroundColor).toBe(brand.cream);
  });

  it("references the canonical foreground + monochrome paths", () => {
    const out = buildAdaptiveIconConfig(brand);
    expect(out.foregroundAsset).toMatch(/icon-foreground/);
    expect(out.monochromeAsset).toMatch(/icon-monochrome/);
  });
});

describe("buildSplashScreenConfig", () => {
  it("uses cream as background + canonical logo path", () => {
    const out = buildSplashScreenConfig({ brand });
    expect(out.backgroundColor).toBe(brand.cream);
    expect(out.logoAsset).toMatch(/splash-logo/);
  });

  it("applies default duration when not specified", () => {
    const out = buildSplashScreenConfig({ brand });
    expect(out.showDurationMs).toBe(SPLASH_DEFAULT_DURATION_MS);
  });

  it("clamps an out-of-range custom duration", () => {
    const out = buildSplashScreenConfig({ brand, durationMs: 99_999 });
    expect(out.showDurationMs).toBe(SPLASH_MAX_DURATION_MS);
  });

  it("respects fadeOut override", () => {
    const fade = buildSplashScreenConfig({ brand, fadeOut: true });
    const cut = buildSplashScreenConfig({ brand, fadeOut: false });
    expect(fade.fadeOut).toBe(true);
    expect(cut.fadeOut).toBe(false);
  });
});

describe("isValidHexColor", () => {
  it("accepts 3-digit, 6-digit, and 8-digit hex", () => {
    expect(isValidHexColor("#fff")).toBe(true);
    expect(isValidHexColor("#FFFFFF")).toBe(true);
    expect(isValidHexColor("#80808080")).toBe(true);
  });

  it("rejects missing #, wrong length, or non-hex chars", () => {
    expect(isValidHexColor("ffffff")).toBe(false);
    expect(isValidHexColor("#fffff")).toBe(false);
    expect(isValidHexColor("#zzz")).toBe(false);
  });
});
