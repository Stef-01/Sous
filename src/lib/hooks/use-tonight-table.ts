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
 * Mirrors the W15 / W22 / W24 / W32 pref-hook pattern:
 *   - freshDefault factory (no shared mutable state)
 *   - object-shape gate before destructuring (W15 RCA)
 *   - schema-version check
 *   - graceful fallback on corrupt payloads
 *
 * Pure parser `parseStoredTonightTable` is exported so tests
 * can exercise it without a DOM.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sous-tonight-table-v1";
const SCHEMA_VERSION = 1 as const;

interface PersistedShape {
  schemaVersion: typeof SCHEMA_VERSION;
  selectedIds: string[];
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

export function useTonightTable() {
  const [state, setState] = useState<PersistedShape>(freshDefault);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") {
      setMounted(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setState(parseStoredTonightTable(raw));
    } catch {
      setState(freshDefault());
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = useCallback((id: string) => {
    setState((prev) => {
      const isOn = prev.selectedIds.includes(id);
      const next: PersistedShape = {
        schemaVersion: SCHEMA_VERSION,
        selectedIds: isOn
          ? prev.selectedIds.filter((x) => x !== id)
          : [...prev.selectedIds, id],
      };
      persist(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    const next = freshDefault();
    persist(next);
    setState(next);
  }, []);

  return {
    selectedIds: state.selectedIds,
    mounted,
    toggle,
    clear,
  };
}
