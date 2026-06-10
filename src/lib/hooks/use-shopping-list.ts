"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizePantryName } from "./use-pantry";
import {
  canonicalIngredientId,
  combineQuantities,
} from "@/lib/shopping/aggregate-quantity";

/**
 * Shopping list  -  ingredients you've wanted but not yet cooked with. Each
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
  /** Normalized key  -  unique identifier. */
  key: string;
  /** Human-readable name as originally captured. */
  name: string;
  /** ISO timestamp added. */
  addedAt: string;
  /** True if the user marked it purchased. Stays in list until cleared. */
  bought: boolean;
  /** Optional display quantity, e.g. "3 tbsp" (threaded from the cook flow). */
  quantity?: string;
  /** Recipe this item came from — powers the grocery "Recipes" carousel. */
  sourceRecipeSlug?: string;
  sourceRecipeName?: string;
  /** Recipes whose quantities are already folded into this row — makes
   *  same-recipe re-adds idempotent (no double-counting on a second tap). */
  contributedBy?: string[];
}

/** A richer add payload. Plain strings are still accepted by addMany. */
export interface ShoppingAddition {
  name: string;
  quantity?: string;
  sourceRecipeSlug?: string;
  sourceRecipeName?: string;
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
  addMany: (items: Array<string | ShoppingAddition>) => void;
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

  const addMany = useCallback((entries: Array<string | ShoppingAddition>) => {
    if (entries.length === 0) return;
    setItems((prev) => {
      let changed = false;
      const working = [...prev];
      // Two indexes into UNBOUGHT rows: exact key, and canonical registry id
      // (so "granulated sugar" merges into an existing "sugar" row instead of
      // duplicating — the aggregation the reference mockup fails at).
      const byKey = new Map<string, number>();
      const byCanonical = new Map<string, number>();
      working.forEach((i, idx) => {
        if (i.bought) return;
        byKey.set(i.key, idx);
        const canon = canonicalIngredientId(i.name);
        if (canon && !byCanonical.has(canon)) byCanonical.set(canon, idx);
      });
      const now = new Date().toISOString();
      for (const entry of entries) {
        const e: ShoppingAddition =
          typeof entry === "string" ? { name: entry } : entry;
        const trimmed = e.name.trim();
        if (!trimmed) continue;
        const key = normalizePantryName(trimmed);
        if (!key) continue;
        const canon = canonicalIngredientId(trimmed);
        const matchIdx =
          byKey.get(key) ?? (canon ? byCanonical.get(canon) : undefined);
        if (matchIdx !== undefined) {
          // Merge: combine quantities (registry-massed when possible) and
          // adopt the recipe source when the row didn't have one. A recipe
          // that already contributed is a no-op (idempotent re-add).
          const target = working[matchIdx];
          const ledger =
            target.contributedBy ??
            (target.sourceRecipeSlug ? [target.sourceRecipeSlug] : []);
          if (e.sourceRecipeSlug && ledger.includes(e.sourceRecipeSlug))
            continue;
          const quantity = canon
            ? combineQuantities(target.quantity, e.quantity, canon)
            : target.quantity && e.quantity && target.quantity !== e.quantity
              ? `${target.quantity} + ${e.quantity}`
              : (target.quantity ?? e.quantity);
          working[matchIdx] = {
            ...target,
            ...(quantity ? { quantity } : {}),
            ...(!target.sourceRecipeSlug && e.sourceRecipeSlug
              ? {
                  sourceRecipeSlug: e.sourceRecipeSlug,
                  sourceRecipeName: e.sourceRecipeName,
                }
              : {}),
            ...(e.sourceRecipeSlug
              ? { contributedBy: [...ledger, e.sourceRecipeSlug] }
              : {}),
          };
          changed = true;
          continue;
        }
        const item: ShoppingItem = {
          key,
          name: trimmed,
          addedAt: now,
          bought: false,
          ...(e.quantity ? { quantity: e.quantity } : {}),
          ...(e.sourceRecipeSlug
            ? {
                sourceRecipeSlug: e.sourceRecipeSlug,
                sourceRecipeName: e.sourceRecipeName,
                contributedBy: [e.sourceRecipeSlug],
              }
            : {}),
        };
        working.push(item);
        byKey.set(key, working.length - 1);
        if (canon && !byCanonical.has(canon))
          byCanonical.set(canon, working.length - 1);
        changed = true;
      }
      if (!changed) return prev;
      const next = working.slice(-MAX_ITEMS);
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
