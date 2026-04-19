"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Pantry  -  a lightweight, local-first set of ingredient names the user
 * currently has at home. Every cook checks against this set so routine
 * ingredients are pre-checked on the Grab screen.
 *
 * This is the quiet ledger the landing page alludes to: the longer you
 * cook, the more your pantry graph knows about you.
 */

const PANTRY_KEY = "sous-pantry-v1";
const MAX_PANTRY_SIZE = 200;

export function normalizePantryName(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, " ").replace(/[.,]/g, "");
}

function readPantry(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PANTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function writePantry(items: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export interface UsePantryResult {
  /** Normalized ingredient names currently in the pantry. */
  items: string[];
  /** Set form for O(1) membership checks. */
  set: Set<string>;
  /** True once hydrated from localStorage (avoids SSR flicker). */
  mounted: boolean;
  has: (name: string) => boolean;
  add: (name: string) => void;
  remove: (name: string) => void;
  toggle: (name: string) => void;
  clear: () => void;
  size: number;
}

export function usePantry(): UsePantryResult {
  const [items, setItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydration guard: must read localStorage after mount */
  useEffect(() => {
    setItems(readPantry());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const set = useMemo(() => new Set(items), [items]);

  const has = useCallback(
    (name: string) => set.has(normalizePantryName(name)),
    [set],
  );

  const add = useCallback((name: string) => {
    const normalized = normalizePantryName(name);
    if (!normalized) return;
    setItems((prev) => {
      if (prev.includes(normalized)) return prev;
      const next = [...prev, normalized].slice(-MAX_PANTRY_SIZE);
      writePantry(next);
      return next;
    });
  }, []);

  const remove = useCallback((name: string) => {
    const normalized = normalizePantryName(name);
    setItems((prev) => {
      if (!prev.includes(normalized)) return prev;
      const next = prev.filter((n) => n !== normalized);
      writePantry(next);
      return next;
    });
  }, []);

  const toggle = useCallback((name: string) => {
    const normalized = normalizePantryName(name);
    if (!normalized) return;
    setItems((prev) => {
      const next = prev.includes(normalized)
        ? prev.filter((n) => n !== normalized)
        : [...prev, normalized].slice(-MAX_PANTRY_SIZE);
      writePantry(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    writePantry([]);
  }, []);

  return {
    items,
    set,
    mounted,
    has,
    add,
    remove,
    toggle,
    clear,
    size: items.length,
  };
}
