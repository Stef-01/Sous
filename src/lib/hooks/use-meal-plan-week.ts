"use client";

/**
 * useMealPlanWeek — persistent meal plan hook (Y3 W23).
 *
 * Wraps `MealPlanWeek` in a localStorage-backed React hook
 * following the W15 RCA pattern: freshDefault factory,
 * object-shape gate, schema-version check, partial-recovery
 * parser. Same shape as Y2 W19 useRhythm + Y1 W30 user-weight
 * hooks.
 *
 * Real-mode wire-up: Y4 W3 swaps the localStorage layer for
 * the Postgres-backed sync. The hook surface stays unchanged.
 */

import { useCallback, useEffect, useState } from "react";
import {
  MEAL_PLAN_SCHEMA_VERSION,
  isoWeekKey,
  mealPlanWeekSchema,
  type MealPlanSlot,
  type MealPlanSource,
  type MealPlanWeek,
  type SlotKey,
} from "@/types/meal-plan";

const STORAGE_KEY_PREFIX = "sous-meal-plan-";

function freshDefaultWeek(weekKey: string): MealPlanWeek {
  return {
    schemaVersion: MEAL_PLAN_SCHEMA_VERSION,
    weekKey,
    scheduled: [],
    updatedAt: new Date(0).toISOString(),
  };
}

/** Pure: parse a stored week payload. Defends against missing
 *  key, malformed JSON, schema mismatch, partial corruption. */
export function parseStoredMealPlanWeek(
  raw: string | null | undefined,
  weekKey: string,
): MealPlanWeek {
  if (!raw) return freshDefaultWeek(weekKey);
  try {
    const parsed = JSON.parse(raw);
    const result = mealPlanWeekSchema.safeParse(parsed);
    if (!result.success) return freshDefaultWeek(weekKey);
    if (result.data.weekKey !== weekKey) return freshDefaultWeek(weekKey);
    return result.data;
  } catch {
    return freshDefaultWeek(weekKey);
  }
}

export interface UseMealPlanWeekResult {
  weekKey: string;
  week: MealPlanWeek;
  mounted: boolean;
  /** Slot-key → recipe slug lookup. Empty when no slots filled. */
  slotMap: Record<string, string>;
  /** Schedule a recipe in a slot. Replaces any existing slot
   *  occupant; emits a write to localStorage. */
  scheduleSlot: (
    slot: SlotKey,
    recipeSlug: string,
    source: MealPlanSource,
  ) => void;
  /** Clear a slot. */
  clearSlot: (slot: SlotKey) => void;
  /** Wipe all slots for the current week. */
  clearAll: () => void;
}

/** React hook: load + persist the meal plan for the given
 *  week. Defaults to the current ISO week when omitted. */
export function useMealPlanWeek(
  explicitWeekKey?: string,
): UseMealPlanWeekResult {
  const [weekKey] = useState(() => explicitWeekKey ?? isoWeekKey(new Date()));
  const [week, setWeek] = useState<MealPlanWeek>(() =>
    freshDefaultWeek(weekKey),
  );
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${weekKey}`);
      setWeek(parseStoredMealPlanWeek(raw, weekKey));
    } catch {
      setWeek(freshDefaultWeek(weekKey));
    }
    setMounted(true);
  }, [weekKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback(
    (next: MealPlanWeek) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${weekKey}`,
          JSON.stringify(next),
        );
      } catch {
        // ignore — quota / privacy mode
      }
    },
    [weekKey],
  );

  const scheduleSlot = useCallback(
    (slot: SlotKey, recipeSlug: string, source: MealPlanSource) => {
      setWeek((prev) => {
        const filtered = prev.scheduled.filter((s) => s.slot !== slot);
        const newSlot: MealPlanSlot = {
          slot,
          recipeSlug,
          source,
          scheduledAt: new Date().toISOString(),
        };
        const next: MealPlanWeek = {
          ...prev,
          scheduled: [...filtered, newSlot],
          updatedAt: new Date().toISOString(),
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearSlot = useCallback(
    (slot: SlotKey) => {
      setWeek((prev) => {
        const next: MealPlanWeek = {
          ...prev,
          scheduled: prev.scheduled.filter((s) => s.slot !== slot),
          updatedAt: new Date().toISOString(),
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearAll = useCallback(() => {
    setWeek((prev) => {
      const next: MealPlanWeek = {
        ...prev,
        scheduled: [],
        updatedAt: new Date().toISOString(),
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const slotMap: Record<string, string> = {};
  for (const s of week.scheduled) {
    slotMap[s.slot] = s.recipeSlug;
  }

  return {
    weekKey,
    week,
    mounted,
    slotMap,
    scheduleSlot,
    clearSlot,
    clearAll,
  };
}
