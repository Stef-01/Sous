"use client";

import { useCallback, useRef } from "react";

export interface UseLongPressOptions {
  /** Milliseconds before the press is considered "long". Default 500. */
  threshold?: number;
  /** Called once the threshold is met. */
  onLongPress: () => void;
  /** Optional: called on normal (short) tap after release. */
  onTap?: () => void;
}

/**
 * useLongPress — returns pointer/touch handlers that distinguish a long-press
 * from a normal tap. Cancels on scroll (> 10 px move) so ingredient lists
 * remain scrollable.  Fires haptic feedback via navigator.vibrate when
 * available.
 *
 * Usage:
 *   const longPress = useLongPress({ onLongPress: () => … });
 *   <div {...longPress} />
 */
export function useLongPress({
  threshold = 500,
  onLongPress,
  onTap,
}: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      firedRef.current = false;
      startPosRef.current = { x: e.clientX, y: e.clientY };

      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        timerRef.current = null;
        // Haptic feedback where available
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(30);
        }
        onLongPress();
      }, threshold);
    },
    [onLongPress, threshold],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPosRef.current) return;
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      // Cancel if the user scrolled / moved > 10px
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        clear();
        startPosRef.current = null;
      }
    },
    [clear],
  );

  const onPointerUp = useCallback(() => {
    const wasFired = firedRef.current;
    clear();
    startPosRef.current = null;
    if (!wasFired && onTap) {
      onTap();
    }
  }, [clear, onTap]);

  const onPointerCancel = useCallback(() => {
    clear();
    startPosRef.current = null;
  }, [clear]);

  // Also handle context-menu suppression on long-press so the browser
  // doesn't open a native menu on Android.
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    if (firedRef.current) {
      e.preventDefault();
    }
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onContextMenu,
  } as const;
}
