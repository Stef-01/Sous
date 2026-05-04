"use client";

/**
 * useExposureLog — counter of times an "exposure target" ingredient
 * has been served on a successful cook (Yes / Some on kids-ate-it).
 *
 * Birch's classic 8-15 exposures literature, refined by newer data
 * showing acceptance plateau at 4-6 exposures (PARENT-MODE-RESEARCH §2.2).
 *
 * Counters are per-ingredient-key. Exposure-target ingredients are a
 * curated list (broccoli, lentils, eggplant, etc.) — the actual list
 * lives in src/data/parent-mode/exposure-targets.ts (post-V1).
 *
 * V1 ships only the counter primitive + the threshold helper; the
 * surfacing UI ("you've exposed your kid to broccoli 5 times — they
 * usually accept by 4-6") lands in W12.
 */

import { useCallback, useEffect, useState } from "react";

export const EXPOSURE_LOG_STORAGE_KEY = "sous-exposure-log-v1";
export const EXPOSURE_THRESHOLD_LIKELY_ACCEPTANCE = 4;
export const EXPOSURE_THRESHOLD_BIRCH_HIGH = 15;

export type ExposureLog = Record<string, number>;

export function parseStoredLog(raw: string | null): ExposureLog {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }
    const out: ExposureLog = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
        out[key] = Math.floor(value);
      }
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Returns "early" before the lower-bound threshold, "likely" between
 * 4-15, and "well-exposed" beyond. Used for the W12 surfacing.
 */
export type ExposureStage = "early" | "likely" | "well-exposed";

export function classifyExposure(count: number): ExposureStage {
  if (count < EXPOSURE_THRESHOLD_LIKELY_ACCEPTANCE) return "early";
  if (count <= EXPOSURE_THRESHOLD_BIRCH_HIGH) return "likely";
  return "well-exposed";
}

export function useExposureLog() {
  const [log, setLog] = useState<ExposureLog>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setLog(parseStoredLog(localStorage.getItem(EXPOSURE_LOG_STORAGE_KEY)));
  }, []);

  const incrementMany = useCallback((ingredientKeys: string[]) => {
    if (ingredientKeys.length === 0) return;
    setLog((prev) => {
      const next: ExposureLog = { ...prev };
      for (const key of ingredientKeys) {
        next[key] = (next[key] ?? 0) + 1;
      }
      try {
        localStorage.setItem(EXPOSURE_LOG_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota
      }
      return next;
    });
  }, []);

  return { log, incrementMany };
}
