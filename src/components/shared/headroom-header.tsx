"use client";

/**
 * HeadroomHeader — hide on scroll-down, show on scroll-up.
 *
 * Wraps a sticky header so it stops blocking content when the
 * user scrolls down, and reappears the moment they pull up.
 * Matches the pattern used by Headspace / Apple Music / NYT
 * Cooking / Strava on their primary home screens.
 *
 * Why not pure `position: sticky`:
 *   - The brand bar persists, covering content the user wants
 *     to read.
 *   - On a max-w-md mobile layout, the header occupies a non-
 *     trivial slice of the viewport.
 *   - The bottom tab bar already gives always-visible nav, so
 *     hiding the top header doesn't strand the user.
 *
 * Behaviour:
 *   - At top of page (scrollY ≤ 8px) → fully visible.
 *   - Scrolling down past 24px → translate -100% (off-canvas).
 *   - Any upward scroll delta ≥ 4px → re-show.
 *   - prefers-reduced-motion → instantaneous transitions.
 *
 * Pure functional component; no module-level state.
 */

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface HeadroomHeaderProps {
  children: ReactNode;
  /** Pixel threshold past which the header can hide. Default 24. */
  hideAfterPx?: number;
  /** Min upward delta to trigger re-show. Default 4. */
  showOnUpPx?: number;
  /** Optional className applied to the inner sticky wrapper. */
  className?: string;
}

/** Pure: classify the next hidden state given the current/last
 *  scroll position + thresholds. Exported so the component AND
 *  the unit tests share one source of truth.
 *
 *  Boundary semantics:
 *    - y ≤ 8: always visible (handles status-bar-tap-to-scroll-
 *      to-top, iOS rubber-band negative overscroll).
 *    - delta > 0 AND y > hideAfterPx: hide.
 *    - delta < 0 AND |delta| ≥ showOnUpPx (or showOnUpPx is 0):
 *      re-show. Any non-zero negative delta counts when threshold
 *      is 0 — guards the otherwise-unreachable `delta < -0` case.
 *    - Otherwise: preserve previous state.
 */
export function classifyHeaderHidden(input: {
  currentY: number;
  lastY: number;
  prevHidden: boolean;
  hideAfterPx: number;
  showOnUpPx: number;
}): boolean {
  const { currentY, lastY, prevHidden, hideAfterPx, showOnUpPx } = input;
  if (!Number.isFinite(currentY) || !Number.isFinite(lastY)) return prevHidden;
  if (currentY <= 8) return false;
  const delta = currentY - lastY;
  if (delta > 0 && currentY > hideAfterPx) return true;
  // showOnUpPx=0 should treat any negative delta as re-show. The
  // strict `delta < -0` always evaluates false, so guard it.
  const triggerThreshold = showOnUpPx === 0 ? 0 : -showOnUpPx;
  if (delta < triggerThreshold) return false;
  return prevHidden;
}

export function HeadroomHeader({
  children,
  hideAfterPx = 24,
  showOnUpPx = 4,
  className,
}: HeadroomHeaderProps) {
  const reducedMotion = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  // Persist the last-known scrollY + the pending RAF id across
  // scroll events using refs (react-compiler-friendly mutable
  // state). Both reset on first effect-run when deps change.
  const lastYRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    lastYRef.current = window.scrollY;
    frameRef.current = 0;
    const onScroll = () => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        const y = window.scrollY;
        const lastY = lastYRef.current;
        setHidden((prevHidden) =>
          classifyHeaderHidden({
            currentY: y,
            lastY,
            prevHidden,
            hideAfterPx,
            showOnUpPx,
          }),
        );
        lastYRef.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [hideAfterPx, showOnUpPx]);

  return (
    <motion.div
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "tween", duration: 0.18, ease: [0.32, 0.72, 0, 1] }
      }
      className={`sticky top-0 z-[100] ${className ?? ""}`}
      // The sticky positioning lives on this outer wrapper so the
      // Y-translate animates independently of the sticky offset.
    >
      {children}
    </motion.div>
  );
}
