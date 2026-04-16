"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

/**
 * Recipe Overlay System — "Base + Overlay" pattern.
 * Users can adjust cook steps without modifying the original recipe.
 * Overlays persist in localStorage and merge with base data at read time.
 */

export interface StepOverride {
  instruction?: string;
  timerSeconds?: number | null;
  personalNote?: string;
}

export interface RecipeOverlay {
  dishSlug: string;
  stepOverrides: Record<number, StepOverride>;
  personalNotes: string;
  substitutions: Array<{
    original: string;
    replacement: string;
    reason: string;
  }>;
  lastModified: string;
}

interface OverlayState {
  overlays: Record<string, RecipeOverlay>;
}

const STORAGE_KEY = "sous-recipe-overrides";

function loadState(): OverlayState {
  if (typeof window === "undefined") return { overlays: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { overlays: {} };
  } catch {
    return { overlays: {} };
  }
}

function saveState(state: OverlayState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export function useRecipeOverlays() {
  const [state, setState] = useState<OverlayState>({ overlays: {} });
  const [mounted, setMounted] = useState(false);

  /* Hydrate from localStorage after mount (SSR-safe). */
  /* eslint-disable react-hooks/set-state-in-effect -- intentional client-only hydration */
  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const getOverlay = useCallback(
    (dishSlug: string): RecipeOverlay | null => {
      return state.overlays[dishSlug] ?? null;
    },
    [state.overlays],
  );

  const hasOverlay = useCallback(
    (dishSlug: string): boolean => {
      return dishSlug in state.overlays;
    },
    [state.overlays],
  );

  const setStepOverride = useCallback(
    (dishSlug: string, stepNumber: number, override: StepOverride) => {
      setState((prev) => {
        const existing = prev.overlays[dishSlug] ?? {
          dishSlug,
          stepOverrides: {},
          personalNotes: "",
          substitutions: [],
          lastModified: new Date().toISOString(),
        };

        const updated: OverlayState = {
          overlays: {
            ...prev.overlays,
            [dishSlug]: {
              ...existing,
              stepOverrides: {
                ...existing.stepOverrides,
                [stepNumber]: {
                  ...existing.stepOverrides[stepNumber],
                  ...override,
                },
              },
              lastModified: new Date().toISOString(),
            },
          },
        };
        saveState(updated);
        return updated;
      });
    },
    [],
  );

  const addSubstitution = useCallback(
    (
      dishSlug: string,
      sub: { original: string; replacement: string; reason: string },
    ) => {
      setState((prev) => {
        const existing = prev.overlays[dishSlug] ?? {
          dishSlug,
          stepOverrides: {},
          personalNotes: "",
          substitutions: [],
          lastModified: new Date().toISOString(),
        };

        const updated: OverlayState = {
          overlays: {
            ...prev.overlays,
            [dishSlug]: {
              ...existing,
              substitutions: [...existing.substitutions, sub],
              lastModified: new Date().toISOString(),
            },
          },
        };
        saveState(updated);
        return updated;
      });
    },
    [],
  );

  const setPersonalNotes = useCallback((dishSlug: string, notes: string) => {
    setState((prev) => {
      const existing = prev.overlays[dishSlug] ?? {
        dishSlug,
        stepOverrides: {},
        personalNotes: "",
        substitutions: [],
        lastModified: new Date().toISOString(),
      };

      const updated: OverlayState = {
        overlays: {
          ...prev.overlays,
          [dishSlug]: {
            ...existing,
            personalNotes: notes,
            lastModified: new Date().toISOString(),
          },
        },
      };
      saveState(updated);
      return updated;
    });
  }, []);

  const resetOverlay = useCallback((dishSlug: string) => {
    setState((prev) => {
      const next = { ...prev.overlays };
      delete next[dishSlug];
      const updated: OverlayState = { overlays: next };
      saveState(updated);
      return updated;
    });
  }, []);

  const totalOverlays = useMemo(
    () => Object.keys(state.overlays).length,
    [state.overlays],
  );

  return {
    mounted,
    getOverlay,
    hasOverlay,
    setStepOverride,
    addSubstitution,
    setPersonalNotes,
    resetOverlay,
    totalOverlays,
  };
}

/**
 * Merge a base step with user overlay at read time.
 * Returns the overlay-enhanced step, or the original if no overlay exists.
 */
export function mergeStepWithOverlay<
  T extends { instruction: string; timerSeconds: number | null },
>(
  baseStep: T,
  overlay: StepOverride | undefined,
): T & { hasOverlay: boolean; personalNote?: string } {
  if (!overlay) return { ...baseStep, hasOverlay: false };
  return {
    ...baseStep,
    instruction: overlay.instruction ?? baseStep.instruction,
    timerSeconds:
      overlay.timerSeconds !== undefined
        ? overlay.timerSeconds
        : baseStep.timerSeconds,
    hasOverlay: true,
    personalNote: overlay.personalNote,
  };
}
