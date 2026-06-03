"use client";

import { useEffect } from "react";

/**
 * Overlay a11y primitives for hand-rolled modals / bottom sheets (the ones not
 * built on Vaul, which already handles this). Two small, dependency-free hooks:
 *
 *  - useBodyScrollLock(active): freezes background scroll while an overlay is
 *    open, so the page behind a modal doesn't scroll (modal semantics). A
 *    module-level counter makes stacked overlays safe — scroll is only restored
 *    once the LAST lock releases, and the pre-lock overflow value is preserved.
 *  - useDismissOnEscape(active, onDismiss): closes the overlay on the Escape
 *    key, so keyboard-only users are never trapped in a dialog.
 *
 * Both are SSR-safe and no-op when inactive.
 */

let lockCount = 0;
let savedOverflow = "";

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    if (lockCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = savedOverflow;
      }
    };
  }, [active]);
}

export function useDismissOnEscape(
  active: boolean,
  onDismiss: () => void,
): void {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onDismiss]);
}
