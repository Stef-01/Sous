"use client";

/**
 * Nutrient goals (founder feature, 2026-06-10) — manual STARS + an optional
 * goal PLAN. Starred nutrients pin to the top of the Key-nutrients readout
 * with a star; a plan contributes its bundle to the starred set. Shared
 * reactive store; synced through device_kv like the profile (adopt only when
 * this device has nothing set).
 */

import { useSyncExternalStore } from "react";
import { GOAL_PLANS, goalPlanById } from "@/lib/nutrition/goal-plans";
import { registerKvHandler } from "@/lib/hooks/use-nutrition-diary";
import { enqueueKvSync } from "@/lib/sync/diary-sync";

const KEY = "sous-nutrient-goals-v1";

export interface NutrientGoals {
  starred: string[];
  planId: string | null;
}

const EMPTY: NutrientGoals = { starred: [], planId: null };
let snapshot: NutrientGoals | undefined;
const listeners = new Set<() => void>();

function getSnapshot(): NutrientGoals {
  if (snapshot === undefined) {
    try {
      const raw = window.localStorage.getItem(KEY);
      const p = raw ? (JSON.parse(raw) as NutrientGoals) : null;
      snapshot = p && Array.isArray(p.starred) ? p : EMPTY;
    } catch {
      snapshot = EMPTY;
    }
  }
  return snapshot;
}
const getServerSnapshot = () => EMPTY;
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function commit(next: NutrientGoals, opts?: { sync?: boolean }): void {
  snapshot = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // privacy mode — session-only
  }
  listeners.forEach((l) => l());
  if (opts?.sync !== false) {
    enqueueKvSync({
      key: "nutrient-goals",
      value: { starred: next.starred, planId: next.planId },
    });
  }
}

export function toggleStar(key: string): void {
  const prev = getSnapshot();
  commit({
    ...prev,
    starred: prev.starred.includes(key)
      ? prev.starred.filter((k) => k !== key)
      : [...prev.starred, key],
  });
}

export function setGoalPlan(planId: string | null): void {
  commit({ ...getSnapshot(), planId });
}

/** Manual stars ∪ the active plan's bundle. */
export function effectiveStars(goals: NutrientGoals): Set<string> {
  const plan = goalPlanById(goals.planId);
  return new Set([...goals.starred, ...(plan?.nutrients ?? [])]);
}

// Pull-side: adopt remote goals only when this device has none set.
registerKvHandler("nutrient-goals", (value) => {
  const v = value as { starred?: string[]; planId?: string | null };
  const local = getSnapshot();
  if (
    local.starred.length === 0 &&
    local.planId === null &&
    Array.isArray(v.starred)
  ) {
    commit({ starred: v.starred, planId: v.planId ?? null }, { sync: false });
  }
});

export function useNutrientGoals() {
  const goals = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    goals,
    stars: effectiveStars(goals),
    plan: goalPlanById(goals.planId),
    plans: GOAL_PLANS,
    toggleStar,
    setPlan: setGoalPlan,
  };
}
