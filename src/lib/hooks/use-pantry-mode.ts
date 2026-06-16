"use client";

/**
 * Pantry Mode (Feature C) — anchor recommendations to what's in the pantry.
 *
 * `{ enabled, tolerance }`: when enabled, the Today deck floats recipes you can
 * make within `tolerance` *additional* (non-staple) ingredients to the top.
 * tolerance 0 = only what you can make right now; higher = more flexible.
 *
 * Shared-store pattern (snapshot + listeners + useSyncExternalStore) so the
 * settings toggle/slider re-ranks the open deck live — no remount. The pure
 * `parsePantryMode` is exported for DOM-free unit tests.
 */

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "sous-pantry-mode-v1";

export const PANTRY_TOLERANCE_MIN = 0;
export const PANTRY_TOLERANCE_MAX = 10;

export interface PantryMode {
  enabled: boolean;
  /** Max additional (non-staple) ingredients a recipe may need and still be
   *  prioritised. Clamped to [MIN, MAX]. */
  tolerance: number;
}

export const DEFAULT_PANTRY_MODE: PantryMode = { enabled: false, tolerance: 3 };

function clampTolerance(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PANTRY_MODE.tolerance;
  return Math.min(
    PANTRY_TOLERANCE_MAX,
    Math.max(PANTRY_TOLERANCE_MIN, Math.round(n)),
  );
}

/** Pure parser — returns the default for malformed/missing input. */
export function parsePantryMode(raw: string | null): PantryMode {
  if (!raw) return DEFAULT_PANTRY_MODE;
  try {
    const p = JSON.parse(raw) as Partial<PantryMode>;
    return {
      enabled: typeof p.enabled === "boolean" ? p.enabled : false,
      tolerance:
        typeof p.tolerance === "number"
          ? clampTolerance(p.tolerance)
          : DEFAULT_PANTRY_MODE.tolerance,
    };
  } catch {
    return DEFAULT_PANTRY_MODE;
  }
}

let snapshot: PantryMode | undefined;
const listeners = new Set<() => void>();

function read(): PantryMode {
  if (typeof window === "undefined") return DEFAULT_PANTRY_MODE;
  return parsePantryMode(window.localStorage.getItem(STORAGE_KEY));
}
function getSnapshot(): PantryMode {
  if (snapshot === undefined) snapshot = read();
  return snapshot;
}
function getServer(): PantryMode {
  return DEFAULT_PANTRY_MODE;
}
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function commit(next: PantryMode): void {
  snapshot = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // quota / unavailable — UX-acceptable in prototype
    }
  }
  listeners.forEach((l) => l());
}

export function setPantryModeEnabled(enabled: boolean): void {
  commit({ ...getSnapshot(), enabled });
}
export function setPantryTolerance(tolerance: number): void {
  commit({ ...getSnapshot(), tolerance: clampTolerance(tolerance) });
}

/** Reactive Pantry Mode reader for the deck + settings sheet. */
export function usePantryMode(): PantryMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServer);
}
