"use client";

import { useEffect, type RefObject } from "react";

/**
 * Overlay a11y primitives for hand-rolled modals / bottom sheets (the ones not
 * built on Vaul, which already handles this). Dependency-free hooks:
 *
 *  - useBodyScrollLock(active): freezes background scroll while an overlay is
 *    open, so the page behind a modal doesn't scroll (modal semantics). A
 *    module-level counter makes stacked overlays safe — scroll is only restored
 *    once the LAST lock releases, and the pre-lock overflow value is preserved.
 *  - useDismissOnEscape(active, onDismiss): closes the overlay on the Escape
 *    key, so keyboard-only users are never trapped in a dialog.
 *  - useFocusTrap(active, containerRef): moves focus into the dialog on open,
 *    keeps Tab / Shift+Tab cycling inside it, and restores focus to the
 *    previously-focused element (the trigger) on close. The container must be
 *    focusable (tabIndex={-1}) as the initial focus target.
 *
 * All are SSR-safe and no-op when inactive.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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

export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    // Remember what was focused so we can hand focus back on close.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Move focus into the dialog (the container is tabIndex=-1) so screen
    // readers announce it and Tab starts inside.
    container.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        // Nothing tabbable — keep focus on the container.
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement;

      if (!container.contains(activeEl)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
        return;
      }
      if (event.shiftKey && activeEl === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [active, containerRef]);
}
