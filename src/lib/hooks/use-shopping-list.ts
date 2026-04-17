"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizePantryName } from "./use-pantry";

/**
 * Shopping list — ingredients you've wanted but not yet cooked with. Each
 * entry tracks display name (to preserve casing for humans) and normalized
 * key (to dedupe against the pantry).
 *
 * Flow: any ingredient you uncheck on the Grab screen or send to the list
 * via `addMany` accumulates here until you buy it (tap to toggle bought)
 * or clear the list.
 */

const SHOPPING_KEY = "sous-shopping-list-v1";
const MAX_ITEMS = 100;

export interface ShoppingItem {
  /** Normalized key — unique identifier. */
  key: string;
  /** Human-readable name as originally captured. */
  name: string;
  /** ISO timestamp added. */
  addedAt: string;
  /** True if the user marked it purchased. Stays in list until cleared. */
  bought: boolean;
}

interface StoredState {
  items: ShoppingItem[];
}

function readState(): ShoppingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHOPPING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredState | ShoppingItem[] | null;
    if (!parsed) return [];
    const items = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(items)) return [];
    return items.filter(
      (i): i is ShoppingItem =>
        typeof i?.key === "string" &&
        typeof i?.name === "string" &&
        typeof i?.bought === "boolean",
    );
  } catch {
    return [];
  }
}

function writeState(items: ShoppingItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SHOPPING_KEY,
      JSON.stringify({ items } satisfies StoredState),
    );
  } catch {
    // ignore
  }
}

export interface UseShoppingListResult {
  items: ShoppingItem[];
  mounted: boolean;
  unboughtCount: number;
  add: (name: string) => void;
  addMany: (names: string[]) => void;
  remove: (key: string) => void;
  toggleBought: (key: string) => void;
  clear: () => void;
  clearBought: () => void;
}

export function useShoppingList(): UseShoppingListResult {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydration guard: must read localStorage after mount */
  useEffect(() => {
    setItems(readState());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const add = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = normalizePantryName(trimmed);
    if (!key) return;
    setItems((prev) => {
      if (prev.some((i) => i.key === key)) return prev;
      const next = [
        ...prev,
        {
          key,
          name: trimmed,
          addedAt: new Date().toISOString(),
          bought: false,
        },
      ].slice(-MAX_ITEMS);
      writeState(next);
      return next;
    });
  }, []);

  const addMany = useCallback((names: string[]) => {
    if (names.length === 0) return;
    setItems((prev) => {
      let changed = false;
      const existingKeys = new Set(prev.map((i) => i.key));
      const additions: ShoppingItem[] = [];
      const now = new Date().toISOString();
      for (const raw of names) {
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const key = normalizePantryName(trimmed);
        if (!key || existingKeys.has(key)) continue;
        existingKeys.add(key);
        additions.push({ key, name: trimmed, addedAt: now, bought: false });
        changed = true;
      }
      if (!changed) return prev;
      const next = [...prev, ...additions].slice(-MAX_ITEMS);
      writeState(next);
      return next;
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => {
      if (!prev.some((i) => i.key === key)) return prev;
      const next = prev.filter((i) => i.key !== key);
      writeState(next);
      return next;
    });
  }, []);

  const toggleBought = useCallback((key: string) => {
    setItems((prev) => {
      if (!prev.some((i) => i.key === key)) return prev;
      const next = prev.map((i) =>
        i.key === key ? { ...i, bought: !i.bought } : i,
      );
      writeState(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    writeState([]);
  }, []);

  const clearBought = useCallback(() => {
    setItems((prev) => {
      if (!prev.some((i) => i.bought)) return prev;
      const next = prev.filter((i) => !i.bought);
      writeState(next);
      return next;
    });
  }, []);

  const unboughtCount = items.reduce((n, i) => n + (i.bought ? 0 : 1), 0);

  return {
    items,
    mounted,
    unboughtCount,
    add,
    addMany,
    remove,
    toggleBought,
    clear,
    clearBought,
  };
}
