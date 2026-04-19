"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => void;
  /** Pull distance in px required to trigger refresh (default 72) */
  threshold?: number;
  /** Whether the page is already scrolled so we should ignore (default checks scrollTop) */
  disabled?: boolean;
}

interface PullState {
  pulling: boolean;
  progress: number; // 0–1
  triggered: boolean;
}

/**
 * usePullToRefresh  -  detects pull-down gesture at the top of the scroll container.
 * Returns pull state (for showing an indicator) and a ref to attach to the
 * scrollable container element.
 *
 * Only fires when the container is scrolled to the very top (scrollTop === 0).
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 72,
  disabled = false,
}: UsePullToRefreshOptions) {
  const containerRef = useRef<HTMLElement | null>(null);
  const startYRef = useRef<number | null>(null);
  const [pullState, setPullState] = useState<PullState>({
    pulling: false,
    progress: 0,
    triggered: false,
  });

  const handleTouchStart = useCallback(
    (e: Event) => {
      if (disabled) return;
      const touch = (e as TouchEvent).touches[0];
      if (!touch) return;
      const el = containerRef.current;
      if (el && el.scrollTop > 2) return;
      startYRef.current = touch.clientY;
    },
    [disabled],
  );

  const handleTouchMove = useCallback(
    (e: Event) => {
      if (disabled || startYRef.current === null) return;
      const touch = (e as TouchEvent).touches[0];
      if (!touch) return;
      const el = containerRef.current;
      if (el && el.scrollTop > 2) {
        startYRef.current = null;
        return;
      }
      const dy = touch.clientY - startYRef.current;
      if (dy <= 0) return;

      const progress = Math.min(dy / threshold, 1);
      setPullState({ pulling: true, progress, triggered: progress >= 1 });
    },
    [disabled, threshold],
  );

  const handleTouchEnd = useCallback(() => {
    if (startYRef.current === null) return;
    startYRef.current = null;

    setPullState((prev) => {
      if (prev.triggered) {
        onRefresh();
      }
      return { pulling: false, progress: 0, triggered: false };
    });
  }, [onRefresh]);

  // Attach/detach listeners when containerRef changes
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      if (containerRef.current) {
        containerRef.current.removeEventListener(
          "touchstart",
          handleTouchStart,
        );
        containerRef.current.removeEventListener("touchmove", handleTouchMove);
        containerRef.current.removeEventListener("touchend", handleTouchEnd);
      }
      containerRef.current = el;
      if (el) {
        el.addEventListener("touchstart", handleTouchStart, { passive: true });
        el.addEventListener("touchmove", handleTouchMove, { passive: true });
        el.addEventListener("touchend", handleTouchEnd);
      }
    },
    [handleTouchStart, handleTouchMove, handleTouchEnd],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener(
          "touchstart",
          handleTouchStart,
        );
        containerRef.current.removeEventListener("touchmove", handleTouchMove);
        containerRef.current.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullState, setRef };
}
