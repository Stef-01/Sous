/**
 * HeadroomHeader contract tests.
 *
 * Pure-state tests on the threshold logic. The DOM-side scroll
 * listener is wired in the component; here we cover the
 * predicate that decides hidden vs visible.
 */

import { describe, expect, it } from "vitest";

/** Pure: classify the scroll-state into hidden/visible. Mirrors
 *  the logic embedded in HeadroomHeader's onScroll handler so
 *  the rules are testable. */
export function classifyHeaderHidden(input: {
  currentY: number;
  lastY: number;
  prevHidden: boolean;
  hideAfterPx: number;
  showOnUpPx: number;
}): boolean {
  const { currentY, lastY, prevHidden, hideAfterPx, showOnUpPx } = input;
  const delta = currentY - lastY;
  if (currentY <= 8) return false;
  if (delta > 0 && currentY > hideAfterPx) return true;
  if (delta < -showOnUpPx) return false;
  return prevHidden;
}

describe("classifyHeaderHidden", () => {
  const opts = { hideAfterPx: 24, showOnUpPx: 4 };

  it("always visible when at top of page", () => {
    expect(
      classifyHeaderHidden({
        currentY: 0,
        lastY: 100,
        prevHidden: true,
        ...opts,
      }),
    ).toBe(false);
  });

  it("visible when scroll near top (≤ 8px)", () => {
    expect(
      classifyHeaderHidden({
        currentY: 8,
        lastY: 200,
        prevHidden: true,
        ...opts,
      }),
    ).toBe(false);
  });

  it("hides when scrolling down past hideAfterPx", () => {
    expect(
      classifyHeaderHidden({
        currentY: 50,
        lastY: 30,
        prevHidden: false,
        ...opts,
      }),
    ).toBe(true);
  });

  it("does NOT hide when scrolling down inside threshold", () => {
    expect(
      classifyHeaderHidden({
        currentY: 20,
        lastY: 10,
        prevHidden: false,
        ...opts,
      }),
    ).toBe(false);
  });

  it("re-shows on upward delta ≥ showOnUpPx", () => {
    expect(
      classifyHeaderHidden({
        currentY: 100,
        lastY: 110,
        prevHidden: true,
        ...opts,
      }),
    ).toBe(false);
  });

  it("ignores tiny upward delta below showOnUpPx", () => {
    expect(
      classifyHeaderHidden({
        currentY: 100,
        lastY: 102,
        prevHidden: true,
        ...opts,
      }),
    ).toBe(true);
  });

  it("preserves hidden state when delta is zero", () => {
    expect(
      classifyHeaderHidden({
        currentY: 100,
        lastY: 100,
        prevHidden: true,
        ...opts,
      }),
    ).toBe(true);
  });

  it("respects custom thresholds", () => {
    expect(
      classifyHeaderHidden({
        currentY: 30,
        lastY: 20,
        prevHidden: false,
        hideAfterPx: 100, // generous threshold
        showOnUpPx: 4,
      }),
    ).toBe(false);
  });
});
