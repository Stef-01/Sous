"use client";

import { useCallback, useEffect, useState } from "react";
import { coerceSourceFacets, type SourceFacet } from "@/lib/utils/dish-source";

export type CookTimeFilter = "any" | "15" | "20" | "30" | "45" | "60";
export type CuisineFilter = string; // "any" | normalized cuisine family
export type MealTypeFilter = "any" | "breakfast" | "lunch" | "dinner";
export type DishRoleFilter = "main" | "side" | "drink" | "snack";
export type { SourceFacet } from "@/lib/utils/dish-source";

const MEAL_TYPES: ReadonlySet<MealTypeFilter> = new Set([
  "any",
  "breakfast",
  "lunch",
  "dinner",
]);
const DISH_ROLES: ReadonlySet<DishRoleFilter> = new Set([
  "main",
  "side",
  "drink",
  "snack",
]);

const STORAGE_KEY = "sous-quest-filters-v1";

export interface QuestFilterState {
  cookTime: CookTimeFilter;
  cuisine: CuisineFilter;
  mealType: MealTypeFilter;
  role: DishRoleFilter;
  /** Multi-select provenance / verified-badge facets (empty = any source). */
  source: SourceFacet[];
}

const DEFAULT_STATE: QuestFilterState = {
  cookTime: "any",
  cuisine: "any",
  mealType: "any",
  role: "main",
  source: [],
};

/** Coerce arbitrary parsed storage into a valid state — missing or corrupt /
 *  older-version values fall back to defaults. Pure; exported for tests. */
export function coerceQuestFilterState(parsed: unknown): QuestFilterState {
  const p = (parsed ?? {}) as Partial<QuestFilterState>;
  return {
    cookTime: (p.cookTime as CookTimeFilter) ?? DEFAULT_STATE.cookTime,
    cuisine: typeof p.cuisine === "string" ? p.cuisine : DEFAULT_STATE.cuisine,
    mealType: MEAL_TYPES.has(p.mealType as MealTypeFilter)
      ? (p.mealType as MealTypeFilter)
      : DEFAULT_STATE.mealType,
    role: DISH_ROLES.has(p.role as DishRoleFilter)
      ? (p.role as DishRoleFilter)
      : DEFAULT_STATE.role,
    source: coerceSourceFacets(p.source),
  };
}

function loadState(): QuestFilterState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return coerceQuestFilterState(JSON.parse(raw));
  } catch {
    return DEFAULT_STATE;
  }
}

function persistState(state: QuestFilterState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable  -  filters will reset on reload, no big deal.
  }
}

/** Parse a cook-time filter value into a minutes cap. Returns `Infinity`
 *  for "any" so numeric comparisons always work. */
export function cookTimeCapMinutes(filter: CookTimeFilter): number {
  if (filter === "any") return Number.POSITIVE_INFINITY;
  return Number.parseInt(filter, 10);
}

/** Pure helper: toggle a source facet in/out of the selection. Exported for tests. */
export function toggleSourceFacet(
  current: SourceFacet[],
  facet: SourceFacet,
): SourceFacet[] {
  return current.includes(facet)
    ? current.filter((f) => f !== facet)
    : [...current, facet];
}

/**
 * useQuestFilters  -  session-scoped filter state for the Today quest card.
 *
 * Persists in sessionStorage so filters survive navigation within a tab but
 * reset fresh when the user closes and reopens the app. Matches the Sous
 * philosophy that preferences are a felt-sense, not a settings page.
 */
export function useQuestFilters() {
  const [state, setState] = useState<QuestFilterState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
    setMounted(true);
  }, []);

  const setCookTime = useCallback((cookTime: CookTimeFilter) => {
    setState((prev) => {
      const next = { ...prev, cookTime };
      persistState(next);
      return next;
    });
  }, []);

  const setCuisine = useCallback((cuisine: CuisineFilter) => {
    setState((prev) => {
      const next = { ...prev, cuisine };
      persistState(next);
      return next;
    });
  }, []);

  const setMealType = useCallback((mealType: MealTypeFilter) => {
    setState((prev) => {
      const next = { ...prev, mealType };
      persistState(next);
      return next;
    });
  }, []);

  const setRole = useCallback((role: DishRoleFilter) => {
    setState((prev) => {
      const next = { ...prev, role };
      persistState(next);
      return next;
    });
  }, []);

  /** Tick / untick a single source facet (multi-select). */
  const toggleSource = useCallback((facet: SourceFacet) => {
    setState((prev) => {
      const next = { ...prev, source: toggleSourceFacet(prev.source, facet) };
      persistState(next);
      return next;
    });
  }, []);

  const clearSource = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, source: [] };
      persistState(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    persistState(DEFAULT_STATE);
    setState(DEFAULT_STATE);
  }, []);

  // Non-default facets — drives the "Filter · N" badge.
  const activeFilterCount = countActiveFilters(state);

  return {
    ...state,
    mounted,
    activeFilterCount,
    setCookTime,
    setCuisine,
    setMealType,
    setRole,
    toggleSource,
    clearSource,
    reset,
  };
}

/** Pure helper: count of non-default facets in a state. Exported for tests. */
export function countActiveFilters(state: QuestFilterState): number {
  return (
    (state.cookTime !== "any" ? 1 : 0) +
    (state.cuisine !== "any" ? 1 : 0) +
    (state.mealType !== "any" ? 1 : 0) +
    (state.role !== "main" ? 1 : 0) +
    (state.source.length > 0 ? 1 : 0)
  );
}
