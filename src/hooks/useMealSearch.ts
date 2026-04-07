"use client";

import { useState, useCallback, useRef } from "react";
import type { Meal, SideDish } from "@/types";
import { trackEvent } from "@/lib/analytics";

interface SearchState {
  status: "idle" | "loading" | "success" | "error";
  meal: Meal | null;
  sides: SideDish[];
  errorMessage: string | null;
  suggestions: string[];
  nextOffset: number;
  isRanked: boolean;
}

const INITIAL_STATE: SearchState = {
  status: "idle",
  meal: null,
  sides: [],
  errorMessage: null,
  suggestions: [],
  nextOffset: 0,
  isRanked: false,
};

// If response arrives faster than this, skip the shimmer entirely
const SHIMMER_THRESHOLD_MS = 100;

export function useMealSearch() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>(INITIAL_STATE);
  const shimmerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submit = useCallback(
    async (searchQuery?: string, verifiedOnly?: boolean) => {
      const q = searchQuery ?? query;
      if (!q.trim()) return;

      trackEvent("pairSubmit", { query: q });

      // Delay showing shimmer — only show if response takes > threshold
      shimmerTimerRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, status: "loading" }));
      }, SHIMMER_THRESHOLD_MS);

      try {
        const params = new URLSearchParams({ q: q.trim() });
        if (verifiedOnly) params.set("verified", "1");
        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();

        // Cancel the shimmer timer if response arrived fast
        if (shimmerTimerRef.current) {
          clearTimeout(shimmerTimerRef.current);
          shimmerTimerRef.current = null;
        }

        if (!res.ok) {
          trackEvent("pairNotFound", { query: q });
          setState({
            status: "error",
            meal: null,
            sides: [],
            errorMessage: data.error,
            suggestions: data.suggestions ?? [],
            nextOffset: 0,
            isRanked: false,
          });
          return;
        }

        trackEvent("pairSuccess", { query: q, meal: data.meal.name });
        setState({
          status: "success",
          meal: data.meal,
          sides: data.sides,
          errorMessage: null,
          suggestions: [],
          nextOffset: data.nextOffset ?? 0,
          isRanked: data.isRanked ?? false,
        });
      } catch {
        if (shimmerTimerRef.current) {
          clearTimeout(shimmerTimerRef.current);
          shimmerTimerRef.current = null;
        }
        setState({
          status: "error",
          meal: null,
          sides: [],
          errorMessage: "Something went wrong. Please try again.",
          suggestions: [],
          nextOffset: 0,
          isRanked: false,
        });
      }
    },
    [query],
  );

  const reset = useCallback(() => {
    setQuery("");
    setState(INITIAL_STATE);
  }, []);

  const setSides = useCallback((sides: SideDish[]) => {
    setState((prev) => ({ ...prev, sides }));
  }, []);

  return {
    query,
    setQuery,
    submit,
    reset,
    setSides,
    ...state,
  };
}
