"use client";

import { useCallback, useEffect, useState } from "react";

export const SUBSTITUTION_STORAGE_KEY = "sous-sub-memory-v1";
const STORAGE_KEY = SUBSTITUTION_STORAGE_KEY;
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

type SubMemoryEntry = { sub: string; at: string };
export type SubMemoryMap = Record<string, SubMemoryEntry>;

export function subMemoryKey(dishSlug: string, ingredientId: string): string {
  return `${dishSlug}::${ingredientId}`;
}
function keyFor(dishSlug: string, ingredientId: string): string {
  return subMemoryKey(dishSlug, ingredientId);
}

/**
 * Normalize a raw localStorage payload into a pruned, valid SubMemoryMap
 * (drops expired, malformed, or type-invalid entries). Exported for unit
 * tests.
 */
export function normalizeSubMemoryPayload(
  raw: unknown,
  now: number = Date.now(),
): SubMemoryMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: SubMemoryMap = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const entry = v as { sub?: unknown; at?: unknown };
    if (typeof entry.sub !== "string" || typeof entry.at !== "string") continue;
    const ts = new Date(entry.at).getTime();
    if (!Number.isFinite(ts)) continue;
    if (now - ts > TTL_MS) continue;
    out[k] = { sub: entry.sub, at: entry.at };
  }
  return out;
}

function loadMap(): SubMemoryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return normalizeSubMemoryPayload(JSON.parse(raw) as unknown);
  } catch {
    return {};
  }
}

function persistMap(map: SubMemoryMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota / disabled — silent fallback.
  }
}

/**
 * useSubstitutionMemory — remembers accepted substitutions keyed by
 * `<dishSlug>::<ingredientId>` for 90 days so the next cook of the same dish
 * auto-suggests the same swap.
 */
export function useSubstitutionMemory() {
  const [map, setMap] = useState<SubMemoryMap>({});
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    setMap(loadMap());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const remember = useCallback(
    (dishSlug: string, ingredientId: string, sub: string) => {
      if (!dishSlug || !ingredientId || !sub.trim()) return;
      setMap((prev) => {
        const next: SubMemoryMap = {
          ...prev,
          [keyFor(dishSlug, ingredientId)]: {
            sub: sub.trim(),
            at: new Date().toISOString(),
          },
        };
        persistMap(next);
        return next;
      });
    },
    [],
  );

  const forget = useCallback((dishSlug: string, ingredientId: string) => {
    if (!dishSlug || !ingredientId) return;
    setMap((prev) => {
      if (!(keyFor(dishSlug, ingredientId) in prev)) return prev;
      const next = { ...prev };
      delete next[keyFor(dishSlug, ingredientId)];
      persistMap(next);
      return next;
    });
  }, []);

  const get = useCallback(
    (dishSlug: string, ingredientId: string): string | null => {
      if (!dishSlug || !ingredientId || !mounted) return null;
      const entry = map[keyFor(dishSlug, ingredientId)];
      if (!entry) return null;
      const ts = new Date(entry.at).getTime();
      if (!Number.isFinite(ts)) return null;
      if (Date.now() - ts > TTL_MS) return null;
      return entry.sub;
    },
    [map, mounted],
  );

  return { remember, forget, get, mounted };
}

export const SUBSTITUTION_MEMORY_TTL_MS = TTL_MS;
