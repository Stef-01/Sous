"use client";

/**
 * useKidsAteIt — append-only post-cook signal log.
 *
 * "Yes" / "Some" / "No" recorded per cook session, used by:
 *   - rebalancer to boost similar-attribute dishes (Yes) or suppress
 *     them for ~14 days (No)
 *   - exposure log to count successful exposures of target ingredients
 *
 * Capped at the most-recent 200 entries to keep localStorage tidy.
 */

import { useCallback, useEffect, useState } from "react";

export const KIDS_ATE_IT_STORAGE_KEY = "sous-kids-ate-it-v1";
export const KIDS_ATE_IT_MAX_ENTRIES = 200;

export type KidsAteItVerdict = "yes" | "some" | "no";

export interface KidsAteItEntry {
  cookSessionId: string;
  recipeSlug: string;
  verdict: KidsAteItVerdict;
  loggedAt: string;
}

export function parseStoredEntries(raw: string | null): KidsAteItEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isKidsAteItEntry);
  } catch {
    return [];
  }
}

function isKidsAteItEntry(value: unknown): value is KidsAteItEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<KidsAteItEntry>;
  return (
    typeof v.cookSessionId === "string" &&
    typeof v.recipeSlug === "string" &&
    (v.verdict === "yes" || v.verdict === "some" || v.verdict === "no") &&
    typeof v.loggedAt === "string"
  );
}

/**
 * Suppression check used by the rebalancer: a recipe slug is suppressed
 * when there's a "no" verdict logged within the past `windowDays`.
 */
export function isRecentlySuppressed(
  entries: KidsAteItEntry[],
  recipeSlug: string,
  now: number,
  windowDays = 14,
): boolean {
  const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
  return entries.some(
    (e) =>
      e.recipeSlug === recipeSlug &&
      e.verdict === "no" &&
      new Date(e.loggedAt).getTime() >= cutoff,
  );
}

/** "Yes"-rate over the most-recent N entries — used for telemetry. */
export function recentYesRate(
  entries: KidsAteItEntry[],
  lookback = 20,
): number {
  if (entries.length === 0) return 0;
  const sample = entries.slice(-lookback);
  const yes = sample.filter((e) => e.verdict === "yes").length;
  return yes / sample.length;
}

export function useKidsAteIt() {
  const [entries, setEntries] = useState<KidsAteItEntry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setEntries(
      parseStoredEntries(localStorage.getItem(KIDS_ATE_IT_STORAGE_KEY)),
    );
  }, []);

  const log = useCallback((entry: Omit<KidsAteItEntry, "loggedAt">) => {
    const next: KidsAteItEntry = {
      ...entry,
      loggedAt: new Date().toISOString(),
    };
    setEntries((prev) => {
      const merged = [...prev, next].slice(-KIDS_ATE_IT_MAX_ENTRIES);
      try {
        localStorage.setItem(KIDS_ATE_IT_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore quota
      }
      return merged;
    });
  }, []);

  return { entries, log };
}
