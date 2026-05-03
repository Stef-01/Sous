"use client";

/**
 * useRecipeFilter — localStorage-backed source-filter chip state
 * for `/path/recipes` and the templates row.
 *
 * W47 from `docs/RECIPE-ECOSYSTEM-V2.md` (Sprint J Recipe
 * Ecosystem V2). Mirrors the W15 / W22 / W24 / W32 / W35 /
 * W45 pref-hook pattern: freshDefault factory, schema-version
 * check, object-shape gate, partial-recovery parser.
 *
 * Pure parser `parseStoredRecipeFilter` is exported so tests
 * exercise it without a DOM.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sous-recipe-filter-v1";
const SCHEMA_VERSION = 1 as const;

export const RECIPE_FILTERS = [
  "all",
  "mine",
  "community",
  "nourish-verified",
] as const;
export type RecipeFilter = (typeof RECIPE_FILTERS)[number];

interface PersistedShape {
  schemaVersion: typeof SCHEMA_VERSION;
  filter: RecipeFilter;
}

function freshDefault(): PersistedShape {
  return { schemaVersion: SCHEMA_VERSION, filter: "all" };
}

/** Pure parser. Defends against:
 *   - missing key → fresh default ("all")
 *   - corrupt JSON → fresh default
 *   - JSON null / array / primitive → fresh default
 *   - schema-version mismatch → fresh default
 *   - bogus filter value → fresh default
 */
export function parseStoredRecipeFilter(
  raw: string | null | undefined,
): PersistedShape {
  if (!raw) return freshDefault();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return freshDefault();
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return freshDefault();
  }
  const obj = parsed as Partial<PersistedShape>;
  if (obj.schemaVersion !== SCHEMA_VERSION) return freshDefault();
  if (!RECIPE_FILTERS.includes(obj.filter as RecipeFilter)) {
    return freshDefault();
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    filter: obj.filter as RecipeFilter,
  };
}

function persist(state: PersistedShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore — quota / privacy mode
  }
}

/** Hook return shape: `{ filter, mounted, setFilter }`. */
export function useRecipeFilter() {
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
      setState(parseStoredRecipeFilter(raw));
    } catch {
      setState(freshDefault());
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setFilter = useCallback((next: RecipeFilter) => {
    setState((prev) => {
      if (prev.filter === next) return prev;
      const result: PersistedShape = {
        schemaVersion: SCHEMA_VERSION,
        filter: next,
      };
      persist(result);
      return result;
    });
  }, []);

  return {
    filter: state.filter,
    mounted,
    setFilter,
  };
}

/** Pure helper: does a recipe (or template) match the active
 *  filter? Used by `/path/recipes` list rendering and the
 *  templates row. Templates are treated as `nourish-verified`
 *  since they're seed-catalog-backed by W43 design. */
export function matchesRecipeFilter(
  source: "user" | "community" | "nourish-verified",
  filter: RecipeFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "mine") return source === "user";
  if (filter === "community") return source === "community";
  if (filter === "nourish-verified") return source === "nourish-verified";
  return true;
}
