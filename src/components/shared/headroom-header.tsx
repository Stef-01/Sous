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
import { useEffect, useState, type ReactNode } from "react";

interface HeadroomHeaderProps {
  children: ReactNode;
  /** Pixel threshold past which the header can hide. Default 24. */
  hideAfterPx?: number;
  /** Min upward delta to trigger re-show. Default 4. */
  showOnUpPx?: number;
  /** Optional className applied to the inner sticky wrapper. */
  className?: string;
}

export function HeadroomHeader({
  children,
  hideAfterPx = 24,
  showOnUpPx = 4,
  className,
}: HeadroomHeaderProps) {
  const reducedMotion = useReducedMotion();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY;
        if (y <= 8) {
          setHidden(false);
        } else if (delta > 0 && y > hideAfterPx) {
          setHidden(true);
        } else if (delta < -showOnUpPx) {
          setHidden(false);
        }
        lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
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
