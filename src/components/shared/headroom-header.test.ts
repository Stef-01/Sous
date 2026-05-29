/**
 * HeadroomHeader contract tests.
 *
 * Pure-state tests on the threshold logic. The DOM-side scroll
 * listener is wired in the component; we import the predicate
 * directly so the component + tests share one source of truth.
 */

import { describe, expect, it } from "vitest";
import { classifyHeaderHidden } from "./headroom-header";

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

  // Loop 2 edge cases ────────────────────────────────────────

  it("treats negative scrollY (iOS rubber-band overscroll) as top", () => {
    // iOS Safari can produce negative scrollY when overscrolling
    // at the top — must keep header visible, not hide.
    expect(
      classifyHeaderHidden({
        currentY: -20,
        lastY: 0,
        prevHidden: true,
        ...opts,
      }),
    ).toBe(false);
  });

  it("re-shows on instant scroll-to-top (status-bar tap)", () => {
    // Tapping iOS status bar jumps scrollY directly to 0 from
    // any deep scroll position — the y ≤ 8 invariant covers it.
    expect(
      classifyHeaderHidden({
        currentY: 0,
        lastY: 1500,
        prevHidden: true,
        ...opts,
      }),
    ).toBe(false);
  });

  it("hides on big jump-down (anchor-link or hash navigation)", () => {
    // Programmatic jump from top to mid-page → user is now at
    // their target; hiding the header is the right call (matches
    // Headspace behaviour).
    expect(
      classifyHeaderHidden({
        currentY: 800,
        lastY: 0,
        prevHidden: false,
        ...opts,
      }),
    ).toBe(true);
  });

  it("showOnUpPx=0 re-shows on any negative delta (boundary fix)", () => {
    // Strict `delta < -0` would be unreachable; the predicate
    // handles this case explicitly.
    expect(
      classifyHeaderHidden({
        currentY: 100,
        lastY: 101,
        prevHidden: true,
        hideAfterPx: 24,
        showOnUpPx: 0,
      }),
    ).toBe(false);
  });

  it("showOnUpPx=0 still preserves hidden state on zero delta", () => {
    expect(
      classifyHeaderHidden({
        currentY: 100,
        lastY: 100,
        prevHidden: true,
        hideAfterPx: 24,
        showOnUpPx: 0,
      }),
    ).toBe(true);
  });

  it("preserves prevHidden when scroll values are non-finite", () => {
    // Defensive: NaN currentY (e.g. weird browser quirk) shouldn't
    // accidentally toggle the header.
    expect(
      classifyHeaderHidden({
        currentY: Number.NaN,
        lastY: 100,
        prevHidden: true,
        ...opts,
      }),
    ).toBe(true);
    expect(
      classifyHeaderHidden({
        currentY: 100,
        lastY: Number.NaN,
        prevHidden: false,
        ...opts,
      }),
    ).toBe(false);
  });

  it("handles huge upward delta beyond threshold", () => {
    // Scroll-to-top from very deep page → delta is large negative.
    expect(
      classifyHeaderHidden({
        currentY: 50,
        lastY: 5000,
        prevHidden: true,
        ...opts,
      }),
    ).toBe(false);
  });
});
