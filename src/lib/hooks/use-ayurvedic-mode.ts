"use client";

import { useCallback } from "react";
import { useHealthLens } from "@/lib/hooks/use-health-lens";

/**
 * useAyurvedicMode — the "Ayurvedic lens", now a thin DERIVED selector over the
 * unified health lens (Phase 10): enabled ⟺ lens === "ayurvedic". Keeps the same
 * {enabled, mounted, toggle} API so every caller (the Profile toggle, the dish
 * note, the mode section) works unchanged AND stays in sync with the Info-sheet
 * lens switcher — one source of truth. (useSyncExternalStore handles SSR, so the
 * mounted flash-guard is no longer needed; kept as `true` for API compatibility.)
 */
export function useAyurvedicMode() {
  const { lens, setLens } = useHealthLens();
  const enabled = lens === "ayurvedic";
  const toggle = useCallback(
    () => setLens(enabled ? "everyday" : "ayurvedic"),
    [enabled, setLens],
  );
  return { enabled, mounted: true, toggle };
}
