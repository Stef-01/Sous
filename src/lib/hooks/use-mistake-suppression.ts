"use client";

import { useCallback, useEffect, useState } from "react";

export const MISTAKE_STORAGE_KEY = "sous-mistake-suppressions-v1";
const STORAGE_KEY = MISTAKE_STORAGE_KEY;
const SUPPRESSION_MS = 180 * 24 * 60 * 60 * 1000;

/**
 * Internal shape: map of "<dishSlug>::<mistakeId>" -> suppression start ISO.
 * We scope per dish (not globally) so expertise on pad thai doesn't silence
 * different, distinct mistakes on a shakshuka.
 */
export type SuppressionMap = Record<string, string>;

export function mistakeSuppressionKey(
  dishSlug: string,
  mistakeId: string,
): string {
  return `${dishSlug}::${mistakeId}`;
}

/**
 * Normalize raw localStorage payload: drop malformed, expired, or non-string
 * entries. Exported for unit tests.
 */
export function normalizeSuppressionPayload(
  raw: unknown,
  now: number = Date.now(),
): SuppressionMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: SuppressionMap = {};
  for (const [key, ts] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof ts !== "string") continue;
    const start = new Date(ts).getTime();
    if (!Number.isFinite(start)) continue;
    if (now - start <= SUPPRESSION_MS) out[key] = ts;
  }
  return out;
}

function loadMap(): SuppressionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return normalizeSuppressionPayload(JSON.parse(raw) as unknown);
  } catch {
    return {};
  }
}

function persistMap(map: SuppressionMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota / disabled — not worth surfacing; behaviour falls back to "show".
  }
}

function keyFor(dishSlug: string, mistakeId: string): string {
  return mistakeSuppressionKey(dishSlug, mistakeId);
}

/**
 * useMistakeSuppression — lets experienced cooks dismiss a specific mistake
 * chip for a specific dish. Dismissals persist for 180 days and are scoped
 * per dish so the chip still appears on new recipes. After 180 days it
 * returns once as a low-frequency reminder.
 */
export function useMistakeSuppression() {
  const [map, setMap] = useState<SuppressionMap>({});
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    setMap(loadMap());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isSuppressed = useCallback(
    (dishSlug: string, mistakeId: string): boolean => {
      if (!dishSlug || !mistakeId) return false;
      if (!mounted) return false;
      const ts = map[keyFor(dishSlug, mistakeId)];
      if (!ts) return false;
      const start = new Date(ts).getTime();
      if (!Number.isFinite(start)) return false;
      return Date.now() - start <= SUPPRESSION_MS;
    },
    [map, mounted],
  );

  const suppress = useCallback((dishSlug: string, mistakeId: string) => {
    if (!dishSlug || !mistakeId) return;
    setMap((prev) => {
      const next: SuppressionMap = {
        ...prev,
        [keyFor(dishSlug, mistakeId)]: new Date().toISOString(),
      };
      persistMap(next);
      return next;
    });
  }, []);

  const restore = useCallback((dishSlug: string, mistakeId: string) => {
    if (!dishSlug || !mistakeId) return;
    setMap((prev) => {
      if (!(keyFor(dishSlug, mistakeId) in prev)) return prev;
      const next = { ...prev };
      delete next[keyFor(dishSlug, mistakeId)];
      persistMap(next);
      return next;
    });
  }, []);

  return { isSuppressed, suppress, restore, mounted };
}

export const MISTAKE_SUPPRESSION_MS = SUPPRESSION_MS;
