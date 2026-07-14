"use client";

/**
 * useTonightTable — localStorage-backed selection of which
 * household members are at the table tonight.
 *
 * W35 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint G W32-W36
 * household memory). Pairs with the W32 substrate + W34 form +
 * the W35 picker UI on /today.
 *
 * Storage shape: `{ schemaVersion, selectedIds: string[] }`.
 * Selection persists indefinitely so a user who cooks twice in
 * one evening doesn't have to re-pick — they can clear or
 * change it manually whenever. (A day-stamp auto-reset is a
 * follow-on if usage data shows it's wanted.)
 *
 * Uses one external-store snapshot for every mounted consumer:
 *   - same-tab writes notify every subscriber immediately
 *   - cross-tab storage events refresh the shared snapshot
 *   - freshDefault factory prevents mutable fallback reuse
 *   - object-shape gate before destructuring (W15 RCA)
 *   - schema-version check
 *   - graceful fallback on corrupt payloads
 *
 * Pure parser `parseStoredTonightTable` is exported so tests
 * can exercise it without a DOM.
 */

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "sous-tonight-table-v1";
const SCHEMA_VERSION = 1 as const;

interface PersistedShape {
  schemaVersion: typeof SCHEMA_VERSION;
  selectedIds: string[];
}

interface TonightTableSnapshot extends PersistedShape {
  mounted: boolean;
}

function freshDefault(): PersistedShape {
  return { schemaVersion: SCHEMA_VERSION, selectedIds: [] };
}

/** Pure parser. Defends against missing key, corrupt JSON, JSON
 *  null/array/primitive, schema mismatch, non-array selectedIds,
 *  non-string entries. */
export function parseStoredTonightTable(
  raw: string | null | undefined,
): PersistedShape {
  if (!raw) return freshDefault();
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return freshDefault();
    }
    const obj = parsed as Partial<PersistedShape>;
    if (obj.schemaVersion !== SCHEMA_VERSION) return freshDefault();
    if (!Array.isArray(obj.selectedIds)) return freshDefault();
    return {
      schemaVersion: SCHEMA_VERSION,
      selectedIds: obj.selectedIds.filter(
        (s): s is string => typeof s === "string" && s.length > 0,
      ),
    };
  } catch {
    return freshDefault();
  }
}

function persist(state: PersistedShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore — quota / privacy mode
  }
}

let state = freshDefault();
let mounted = false;
let hydrated = false;
let snapshot: TonightTableSnapshot = { ...state, mounted };
const serverSnapshot: TonightTableSnapshot = {
  ...freshDefault(),
  mounted: false,
};
const listeners = new Set<() => void>();

function rebuildSnapshot() {
  snapshot = { ...state, mounted };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function readStoredState() {
  try {
    return parseStoredTonightTable(localStorage.getItem(STORAGE_KEY));
  } catch {
    return freshDefault();
  }
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  state = parseStoredTonightTable(event.newValue);
  mounted = true;
  rebuildSnapshot();
  emit();
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = readStoredState();
  mounted = true;
  rebuildSnapshot();
  window.addEventListener("storage", handleStorage);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureHydrated();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

function setStoreState(next: PersistedShape) {
  state = next;
  mounted = true;
  rebuildSnapshot();
  persist(next);
  emit();
}

export function useTonightTable() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback((id: string) => {
    const isOn = state.selectedIds.includes(id);
    setStoreState({
      schemaVersion: SCHEMA_VERSION,
      selectedIds: isOn
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id],
    });
  }, []);

  const clear = useCallback(() => {
    setStoreState(freshDefault());
  }, []);

  return {
    selectedIds: current.selectedIds,
    mounted: current.mounted,
    toggle,
    clear,
  };
}
