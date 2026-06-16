"use client";

import { useCallback, useEffect, useState } from "react";
import { coerceSourceFacets, type SourceFacet } from "@/lib/utils/dish-source";

export type CookTimeFilter = "any" | "15" | "20" | "30" | "45" | "60";
export type CuisineFilter = string; // normalized cuisine family key
export type MealTypeFilter = "breakfast" | "lunch" | "dinner";
export type DishRoleFilter = "main" | "side" | "drink" | "snack";
export type { SourceFacet } from "@/lib/utils/dish-source";

const MEAL_TYPES: ReadonlySet<MealTypeFilter> = new Set([
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
  /** Multi-select cuisine families (empty = any cuisine). */
  cuisines: CuisineFilter[];
  /** Multi-select meal times / dayparts (empty = any time). Constrains mains. */
  mealTypes: MealTypeFilter[];
  /** Multi-select dish roles (empty = all roles). Defaults to mains-only. */
  roles: DishRoleFilter[];
  /** Multi-select provenance / verified-badge facets (empty = any source). */
  source: SourceFacet[];
}

const DEFAULT_STATE: QuestFilterState = {
  cookTime: "any",
  cuisines: [],
  mealTypes: [],
  roles: ["main"],
  source: [],
};

/** Pure: toggle a value in/out of a string array (multi-select). */
export function toggleInArray<T extends string>(current: T[], value: T): T[] {
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}

/** Back-compat alias — source uses the same generic toggle. */
export const toggleSourceFacet = toggleInArray<SourceFacet>;

/** Coerce one legacy single-select value (incl. "any") into an array. */
function coerceLegacyToArray<T extends string>(
  value: unknown,
  valid: ReadonlySet<T>,
): T[] {
  if (Array.isArray(value))
    return value.filter((v): v is T => valid.has(v as T));
  if (typeof value === "string" && value !== "any" && valid.has(value as T)) {
    return [value as T];
  }
  return [];
}

/** Coerce free-text cuisine (legacy single string / "any") into an array. */
function coerceCuisines(value: unknown): CuisineFilter[] {
  if (Array.isArray(value))
    return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string" && value !== "any") return [value];
  return [];
}

/** Coerce arbitrary parsed storage into a valid state — missing or corrupt /
 *  older-version values fall back to defaults. Pure; exported for tests. */
export function coerceQuestFilterState(parsed: unknown): QuestFilterState {
  const p = (parsed ?? {}) as Record<string, unknown>;
  const roles = coerceLegacyToArray<DishRoleFilter>(
    p.roles ?? p.role,
    DISH_ROLES,
  );
  return {
    cookTime: (p.cookTime as CookTimeFilter) ?? DEFAULT_STATE.cookTime,
    cuisines: coerceCuisines(p.cuisines ?? p.cuisine),
    mealTypes: coerceLegacyToArray<MealTypeFilter>(
      p.mealTypes ?? p.mealType,
      MEAL_TYPES,
    ),
    // Empty roles after coercion → fall back to the mains-first default.
    roles: roles.length > 0 ? roles : [...DEFAULT_STATE.roles],
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

/**
 * useQuestFilters  -  session-scoped filter state for the Today quest card.
 *
 * Persists in sessionStorage so filters survive navigation within a tab but
 * reset fresh when the user closes and reopens the app. Matches the Sous
 * philosophy that preferences are a felt-sense, not a settings page.
 *
 * Role / cuisine / meal-time / source are all MULTI-SELECT (OR semantics, empty
 * = any). Cook time stays single-select (a ceiling, not a set).
 */
export function useQuestFilters() {
  const [state, setState] = useState<QuestFilterState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
    setMounted(true);
  }, []);

  const update = useCallback(
    (mut: (prev: QuestFilterState) => QuestFilterState) => {
      setState((prev) => {
        const next = mut(prev);
        persistState(next);
        return next;
      });
    },
    [],
  );

  const setCookTime = useCallback(
    (cookTime: CookTimeFilter) => update((p) => ({ ...p, cookTime })),
    [update],
  );

  const toggleRole = useCallback(
    (role: DishRoleFilter) =>
      update((p) => ({ ...p, roles: toggleInArray(p.roles, role) })),
    [update],
  );
  const clearRoles = useCallback(
    () => update((p) => ({ ...p, roles: [] })),
    [update],
  );

  const toggleCuisine = useCallback(
    (cuisine: CuisineFilter) =>
      update((p) => ({ ...p, cuisines: toggleInArray(p.cuisines, cuisine) })),
    [update],
  );
  const clearCuisines = useCallback(
    () => update((p) => ({ ...p, cuisines: [] })),
    [update],
  );

  const toggleMealType = useCallback(
    (mealType: MealTypeFilter) =>
      update((p) => ({
        ...p,
        mealTypes: toggleInArray(p.mealTypes, mealType),
      })),
    [update],
  );
  const clearMealTypes = useCallback(
    () => update((p) => ({ ...p, mealTypes: [] })),
    [update],
  );

  const toggleSource = useCallback(
    (facet: SourceFacet) =>
      update((p) => ({ ...p, source: toggleInArray(p.source, facet) })),
    [update],
  );
  const clearSource = useCallback(
    () => update((p) => ({ ...p, source: [] })),
    [update],
  );

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
    toggleRole,
    clearRoles,
    toggleCuisine,
    clearCuisines,
    toggleMealType,
    clearMealTypes,
    toggleSource,
    clearSource,
    reset,
  };
}

/** True when roles differ from the mains-only default. */
function rolesAreDefault(roles: DishRoleFilter[]): boolean {
  return roles.length === 1 && roles[0] === "main";
}

/** Pure helper: count of non-default facets in a state. Exported for tests. */
export function countActiveFilters(state: QuestFilterState): number {
  return (
    (state.cookTime !== "any" ? 1 : 0) +
    (state.cuisines.length > 0 ? 1 : 0) +
    (state.mealTypes.length > 0 ? 1 : 0) +
    (!rolesAreDefault(state.roles) ? 1 : 0) +
    (state.source.length > 0 ? 1 : 0)
  );
}
