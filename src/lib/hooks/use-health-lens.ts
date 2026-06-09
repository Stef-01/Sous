"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Phase 10 — the unified health-reading lens. One segmented choice replaces the
 * two independently-wired layers (the Ayurvedic toggle + the therapeutic view).
 *
 *  - everyday    (DEFAULT): composition + nutrition + the synthesized headline;
 *                no evidence rows, no herb notes — the casual-cook view.
 *  - therapeutic: food-first evidence rows (gated exactly as before by
 *                reviewed/clinicianReview — the lens NEVER upgrades claim status).
 *  - ayurvedic:   evidence-validated herb notes.
 *
 * Backed by a module store + useSyncExternalStore so the lens is reactive across
 * every component that reads it (the panel segmented control, the herb note via
 * the derived useAyurvedicMode, the Profile toggle) — no prop-drilling, no drift.
 */

export type HealthLens = "everyday" | "therapeutic" | "ayurvedic";

const KEY = "sous-health-lens-v1";
const LENSES: readonly HealthLens[] = ["everyday", "therapeutic", "ayurvedic"];

let snapshot: HealthLens | null = null; // null = not yet hydrated from storage
const listeners = new Set<() => void>();

function getSnapshot(): HealthLens {
  if (snapshot === null) {
    try {
      const v = window.localStorage.getItem(KEY) as HealthLens | null;
      snapshot = v && LENSES.includes(v) ? v : "everyday";
    } catch {
      snapshot = "everyday";
    }
  }
  return snapshot;
}

function getServerSnapshot(): HealthLens {
  return "everyday";
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Set the lens (persisted) and notify every subscriber. */
export function setHealthLens(lens: HealthLens): void {
  snapshot = lens;
  try {
    window.localStorage.setItem(KEY, lens);
  } catch {
    // ignore quota / privacy mode
  }
  listeners.forEach((l) => l());
}

export function useHealthLens() {
  const lens = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setLens = useCallback((l: HealthLens) => setHealthLens(l), []);
  return { lens, setLens };
}

/** Pure: what the panel renders for a lens. The honesty contract (status badge +
 *  hedge) renders regardless of this — these only gate the OPTIONAL layers. */
export function lensFilter(lens: HealthLens): {
  showEvidence: boolean;
  showHerbs: boolean;
} {
  return {
    showEvidence: lens === "therapeutic",
    showHerbs: lens === "ayurvedic",
  };
}

export const HEALTH_LENSES = LENSES;
