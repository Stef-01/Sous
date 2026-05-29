"use client";

/**
 * useSpiceTolerance — household-level heat tolerance, 1 (no heat) to
 * 5 (full adult spice). Default 3.
 *
 * Per-recipe override is session-only (not persisted). Persistence
 * shape is the household default; the per-recipe value lives in the
 * cook-step renderer via a useState in W10.
 */

import { useCallback, useEffect, useState } from "react";

export const SPICE_TOLERANCE_STORAGE_KEY = "sous-spice-tolerance-v1";
export const SPICE_TOLERANCE_DEFAULT: SpiceTolerance = 3;

export type SpiceTolerance = 1 | 2 | 3 | 4 | 5;

export function isSpiceTolerance(value: unknown): value is SpiceTolerance {
  return (
    value === 1 || value === 2 || value === 3 || value === 4 || value === 5
  );
}

export function parseStoredSpiceTolerance(raw: string | null): SpiceTolerance {
  if (raw === null) return SPICE_TOLERANCE_DEFAULT;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isSpiceTolerance(parsed)) return parsed;
  } catch {
    // fall through
  }
  return SPICE_TOLERANCE_DEFAULT;
}

export function useSpiceTolerance() {
  const [tolerance, setToleranceState] = useState<SpiceTolerance>(
    SPICE_TOLERANCE_DEFAULT,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setToleranceState(
      parseStoredSpiceTolerance(
        localStorage.getItem(SPICE_TOLERANCE_STORAGE_KEY),
      ),
    );
  }, []);

  const setTolerance = useCallback((value: SpiceTolerance) => {
    setToleranceState(value);
    try {
      localStorage.setItem(SPICE_TOLERANCE_STORAGE_KEY, String(value));
    } catch {
      // ignore quota
    }
  }, []);

  return { tolerance, setTolerance };
}
