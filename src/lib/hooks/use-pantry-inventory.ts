"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { normalizePantryName } from "./use-pantry";

/**
 * Pantry inventory — the quantity-aware layer over the plain `usePantry` name
 * set (planning: AI paste-bridge import). The engine's pantry-fit scoring still
 * reads the name set in `use-pantry`; this store adds the "how much" the import
 * captures, keyed by the same normalized name so the two stay aligned.
 *
 * Shared-store pattern (the diary/lens style): one module snapshot + a listener
 * set + localStorage, read through useSyncExternalStore. Mutations are exported
 * as plain functions so the importer can write without a hook.
 */

/** The macro panel imported alongside each inventory line (per quantity). */
export interface InventoryNutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface InventoryItem {
  /** Normalized name — the unique id (matches the pantry set). */
  key: string;
  /** Display name as imported. */
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  /** Macro panel for the item (required on import; older rows may lack it). */
  nutrition?: InventoryNutrition;
  addedAt: string;
}

/** A row ready to merge (no addedAt — stamped on write). */
export type InventoryDraft = Omit<InventoryItem, "addedAt">;

const STORAGE_KEY = "sous-pantry-inventory-v1";
const MAX_ITEMS = 300;
const EMPTY: InventoryItem[] = [];

let snapshot: InventoryItem[] | undefined;
const listeners = new Set<() => void>();

function read(): InventoryItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as InventoryItem[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): InventoryItem[] {
  if (snapshot === undefined) snapshot = read();
  return snapshot;
}

function getServerSnapshot(): InventoryItem[] {
  return EMPTY;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function commit(next: InventoryItem[]): void {
  snapshot = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // quota / unavailable — acceptable in prototype
    }
  }
  listeners.forEach((l) => l());
}

/** Merge drafts into the inventory by normalized key (newer quantity/unit/
 *  category win; first-seen addedAt is kept). Caps at MAX_ITEMS. */
export function addInventoryItems(drafts: InventoryDraft[], at: string): void {
  if (drafts.length === 0) return;
  const byKey = new Map(getSnapshot().map((it) => [it.key, it]));
  for (const d of drafts) {
    const key = d.key || normalizePantryName(d.name);
    if (!key) continue;
    const existing = byKey.get(key);
    byKey.set(key, {
      key,
      name: d.name || existing?.name || key,
      quantity: d.quantity ?? existing?.quantity,
      unit: d.unit ?? existing?.unit,
      category: d.category ?? existing?.category,
      nutrition: d.nutrition ?? existing?.nutrition,
      addedAt: existing?.addedAt ?? at,
    });
  }
  // Most-recently-touched first, capped.
  const next = Array.from(byKey.values()).slice(-MAX_ITEMS);
  commit(next);
}

export function removeInventoryItem(key: string): void {
  commit(getSnapshot().filter((it) => it.key !== key));
}

export function clearInventory(): void {
  commit([]);
}

/** Restore a full inventory snapshot — undo for clearInventory. Exact re-set
 *  (bypasses the merge in addInventoryItems). */
export function restoreInventory(items: InventoryItem[]): void {
  commit(items.slice(-MAX_ITEMS));
}

export function usePantryInventory() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard: flip mounted once after first client render
  useEffect(() => setMounted(true), []);

  return {
    items,
    mounted,
    size: items.length,
    addMany: addInventoryItems,
    remove: removeInventoryItem,
    clear: clearInventory,
    restore: restoreInventory,
  };
}
