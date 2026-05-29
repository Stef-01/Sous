"use client";

/**
 * useRecipeOverlays — minimal "base + overlay" persistence for
 * per-recipe per-step user notes. The base recipe data ships in
 * src/data/meals.json + guided-cook-steps.ts; this hook adds a
 * localStorage layer that callers can use to attach a string note to
 * any (recipeSlug, stepIndex) pair.
 *
 * Write paths:
 *   - Win-screen "save a note" (existing surface, future wiring)
 *   - Parent Mode kid-swap chip (W11) writes the chosen swap as a
 *     step-0 note so it surfaces on the Mission screen at next cook.
 *
 * Versioned key + size cap to keep localStorage tidy.
 */

import { useCallback, useEffect, useState } from "react";

export const RECIPE_OVERLAYS_STORAGE_KEY = "sous-recipe-overlays-v1";
export const RECIPE_OVERLAYS_MAX_ENTRIES = 200;

export interface RecipeStepNote {
  recipeSlug: string;
  stepIndex: number;
  note: string;
  updatedAt: string;
}

export function overlayKey(recipeSlug: string, stepIndex: number): string {
  return `${recipeSlug}::${stepIndex}`;
}

export function parseStoredOverlays(
  raw: string | null,
): Record<string, RecipeStepNote> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }
    const out: Record<string, RecipeStepNote> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidNote(value)) out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function isValidNote(v: unknown): v is RecipeStepNote {
  if (typeof v !== "object" || v === null) return false;
  const n = v as Partial<RecipeStepNote>;
  return (
    typeof n.recipeSlug === "string" &&
    typeof n.stepIndex === "number" &&
    typeof n.note === "string" &&
    typeof n.updatedAt === "string"
  );
}

export function useRecipeOverlays() {
  const [overlays, setOverlays] = useState<Record<string, RecipeStepNote>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setOverlays(
      parseStoredOverlays(localStorage.getItem(RECIPE_OVERLAYS_STORAGE_KEY)),
    );
  }, []);

  const saveStepNote = useCallback(
    (recipeSlug: string, stepIndex: number, note: string) => {
      const key = overlayKey(recipeSlug, stepIndex);
      const next: RecipeStepNote = {
        recipeSlug,
        stepIndex,
        note,
        updatedAt: new Date().toISOString(),
      };
      setOverlays((prev) => {
        const merged = { ...prev, [key]: next };
        // Cap by entry count — drop oldest by updatedAt if needed.
        const entries = Object.entries(merged);
        if (entries.length > RECIPE_OVERLAYS_MAX_ENTRIES) {
          entries.sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt));
          const trimmed = Object.fromEntries(
            entries.slice(0, RECIPE_OVERLAYS_MAX_ENTRIES),
          );
          try {
            localStorage.setItem(
              RECIPE_OVERLAYS_STORAGE_KEY,
              JSON.stringify(trimmed),
            );
          } catch {
            // ignore quota
          }
          return trimmed;
        }
        try {
          localStorage.setItem(
            RECIPE_OVERLAYS_STORAGE_KEY,
            JSON.stringify(merged),
          );
        } catch {
          // ignore quota
        }
        return merged;
      });
    },
    [],
  );

  const getStepNote = useCallback(
    (recipeSlug: string, stepIndex: number): string | null => {
      const entry = overlays[overlayKey(recipeSlug, stepIndex)];
      return entry?.note ?? null;
    },
    [overlays],
  );

  return { overlays, saveStepNote, getStepNote };
}
