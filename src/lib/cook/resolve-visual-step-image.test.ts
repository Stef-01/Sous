import { describe, expect, it } from "vitest";
import { resolveVisualStepImage } from "./resolve-visual-step-image";

describe("resolveVisualStepImage", () => {
  it("uses the step image when present", () => {
    const result = resolveVisualStepImage(
      "/food_images/step-bloom-cumin.png",
      "/food_images/dish-hero.png",
    );
    expect(result).toEqual({
      src: "/food_images/step-bloom-cumin.png",
      isFallback: false,
      isPlaceholder: false,
    });
  });

  it("falls back to the dish hero when step image is missing", () => {
    const result = resolveVisualStepImage(null, "/food_images/dish-hero.png");
    expect(result).toEqual({
      src: "/food_images/dish-hero.png",
      isFallback: true,
      isPlaceholder: false,
    });
  });

  it("falls back to the dish hero when step image is undefined", () => {
    const result = resolveVisualStepImage(
      undefined,
      "/food_images/dish-hero.png",
    );
    expect(result.src).toBe("/food_images/dish-hero.png");
    expect(result.isFallback).toBe(true);
  });

  it("treats whitespace-only step URLs as missing", () => {
    const result = resolveVisualStepImage("   ", "/food_images/dish-hero.png");
    expect(result).toEqual({
      src: "/food_images/dish-hero.png",
      isFallback: true,
      isPlaceholder: false,
    });
  });

  it("treats empty step URL as missing", () => {
    const result = resolveVisualStepImage("", "/food_images/dish-hero.png");
    expect(result.src).toBe("/food_images/dish-hero.png");
    expect(result.isFallback).toBe(true);
  });

  it("returns placeholder when both step and hero are missing", () => {
    const result = resolveVisualStepImage(null, null);
    expect(result).toEqual({
      src: null,
      isFallback: false,
      isPlaceholder: true,
    });
  });

  it("returns placeholder when both inputs are undefined", () => {
    const result = resolveVisualStepImage(undefined, undefined);
    expect(result).toEqual({
      src: null,
      isFallback: false,
      isPlaceholder: true,
    });
  });

  it("returns placeholder when both inputs are whitespace", () => {
    const result = resolveVisualStepImage("  ", "\t\n");
    expect(result.isPlaceholder).toBe(true);
    expect(result.src).toBe(null);
  });

  it("step image wins even when hero is also present", () => {
    const result = resolveVisualStepImage(
      "/step.png",
      "/should-not-be-used.png",
    );
    expect(result.src).toBe("/step.png");
    expect(result.isFallback).toBe(false);
  });

  it("is pure — repeated calls return identical shape", () => {
    const a = resolveVisualStepImage("/step.png", "/hero.png");
    const b = resolveVisualStepImage("/step.png", "/hero.png");
    expect(a).toEqual(b);
  });
});
