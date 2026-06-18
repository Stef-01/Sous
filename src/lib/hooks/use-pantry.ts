"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

/**
 * Pantry  -  a lightweight, local-first set of ingredient names the user
 * currently has at home. Every cook checks against this set so routine
 * ingredients are pre-checked on the Grab screen.
 *
 * This is the quiet ledger the landing page alludes to: the longer you
 * cook, the more your pantry graph knows about you.
 *
 * Shared-store pattern (module snapshot + listener set + useSyncExternalStore)
 * so every consumer stays in sync live — e.g. the AI import sheet adds names
 * and the open Pantry page reflects them immediately, no reload.
 */

const PANTRY_KEY = "sous-pantry-v1";
const MAX_PANTRY_SIZE = 200;
const EMPTY: string[] = [];

export function normalizePantryName(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, " ").replace(/[.,]/g, "");
}

let snapshot: string[] | undefined;
const listeners = new Set<() => void>();

function read(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(PANTRY_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): string[] {
  if (snapshot === undefined) snapshot = read();
  return snapshot;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function commit(next: string[]): void {
  snapshot = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PANTRY_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }
  listeners.forEach((l) => l());
}

/** Module-level mutators — usable without a hook (e.g. from the importer). */
export function pantryAdd(name: string): void {
  const normalized = normalizePantryName(name);
  if (!normalized) return;
  const prev = getSnapshot();
  if (prev.includes(normalized)) return;
  commit([...prev, normalized].slice(-MAX_PANTRY_SIZE));
}

export function pantryRemove(name: string): void {
  const normalized = normalizePantryName(name);
  const prev = getSnapshot();
  if (!prev.includes(normalized)) return;
  commit(prev.filter((n) => n !== normalized));
}

export function pantryToggle(name: string): void {
  const normalized = normalizePantryName(name);
  if (!normalized) return;
  const prev = getSnapshot();
  commit(
    prev.includes(normalized)
      ? prev.filter((n) => n !== normalized)
      : [...prev, normalized].slice(-MAX_PANTRY_SIZE),
  );
}

export function pantryClear(): void {
  commit([]);
}

/** Restore a full name list — undo for pantryClear. */
export function pantryRestore(names: string[]): void {
  commit(names.slice(-MAX_PANTRY_SIZE));
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
  restore: (names: string[]) => void;
  size: number;
}

export function usePantry(): UsePantryResult {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard: flip mounted once after first client render
  useEffect(() => setMounted(true), []);

  const set = useMemo(() => new Set(items), [items]);

  const has = useMemo(
    () => (name: string) => set.has(normalizePantryName(name)),
    [set],
  );

  return {
    items,
    set,
    mounted,
    has,
    add: pantryAdd,
    remove: pantryRemove,
    toggle: pantryToggle,
    clear: pantryClear,
    restore: pantryRestore,
    size: items.length,
  };
}
