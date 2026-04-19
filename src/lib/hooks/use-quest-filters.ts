"use client";

import { useCallback, useEffect, useState } from "react";

export type CookTimeFilter = "any" | "15" | "20" | "30" | "45" | "60";
export type CuisineFilter = string; // "any" | normalized cuisine family

const STORAGE_KEY = "sous-quest-filters-v1";

export interface QuestFilterState {
  cookTime: CookTimeFilter;
  cuisine: CuisineFilter;
}

const DEFAULT_STATE: QuestFilterState = {
  cookTime: "any",
  cuisine: "any",
};

function loadState(): QuestFilterState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<QuestFilterState>;
    return {
      cookTime: (parsed.cookTime as CookTimeFilter) ?? DEFAULT_STATE.cookTime,
      cuisine:
        typeof parsed.cuisine === "string"
          ? parsed.cuisine
          : DEFAULT_STATE.cuisine,
    };
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

  const reset = useCallback(() => {
    persistState(DEFAULT_STATE);
    setState(DEFAULT_STATE);
  }, []);

  return { ...state, mounted, setCookTime, setCuisine, reset };
}
