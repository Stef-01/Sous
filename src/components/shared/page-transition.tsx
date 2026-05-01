"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * PageTransition — wraps a page in a fade + slide entrance.
 *
 * W22b: direction-aware. Tab order Today (0) → Path (1) → Content (2).
 * If the user came from a tab on the LEFT, the new page slides in
 * from the RIGHT (positive x). If they came from the RIGHT, it slides
 * in from the LEFT. First mount uses the original neutral slide-up.
 *
 * Anything outside the three top-level tabs (cook flow, gift, games)
 * keeps the neutral slide-up — directional motion only makes sense
 * between sibling tabs.
 *
 * Implementation note: the previous pathname is held in component
 * state (NOT a ref) because the repo's react-hooks/refs rule forbids
 * reading ref values during render. Updating state in the effect
 * after each pathname change still allows the current render to read
 * the previous pathname for direction inference.
 */

const TAB_ORDER: Record<string, number> = {
  "/today": 0,
  "/path": 1,
  "/community": 2,
};

function tabOrderFor(pathname: string): number | null {
  for (const [prefix, order] of Object.entries(TAB_ORDER)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return order;
    }
  }
  return null;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  const currentOrder = tabOrderFor(pathname);
  const previousOrder = prevPathname ? tabOrderFor(prevPathname) : null;

  let initialX = 0;
  if (
    currentOrder !== null &&
    previousOrder !== null &&
    currentOrder !== previousOrder
  ) {
    // Going from a left tab → right tab: new page enters from the
    // right (positive x). Reverse for the other direction.
    initialX = currentOrder > previousOrder ? 24 : -24;
  }

  useEffect(() => {
    if (prevPathname !== pathname) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate: capture previous pathname for next-render direction inference
      setPrevPathname(pathname);
    }
  }, [pathname, prevPathname]);

  // Reduced motion: collapse the directional slide to an opacity-only
  // fade. Keeps page swaps visually distinct without the lateral move
  // that triggers vestibular sensitivity.
  if (reducedMotion) {
    return (
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: initialX, y: initialX === 0 ? 6 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
    >
      {children}
    </motion.div>
  );
}
