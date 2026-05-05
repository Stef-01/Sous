"use client";

/**
 * usePreferenceProfile — localStorage-backed preference profile
 * (Y5 D, audit P0 #7).
 *
 * Wires the Y5 C intelligence-layer substrate into a React hook
 * with the W15 RCA persistence pattern (freshDefault factory ·
 * schema-version check · safe parser).
 *
 * The hook does three jobs:
 *   1. Hydrate the stored signals from localStorage on mount.
 *   2. Expose `recordSignal(...)` so callers (QuestCard / cook
 *      flow / Eat Out / search) emit signals at every meaningful
 *      action.
 *   3. Re-derive the merged profile (inferredTags +
 *      manualTags + timeOfDayPatterns) on demand.
 *
 * Manual-edit mutations (`setLikes`, `setDislikes`, `applyEdit`)
 * compose with the inferred state via the W15-pattern parser
 * already shipped at `lib/intelligence/manual-edit-merge.ts`.
 *
 * Real-mode wire-up: Sprint C of Y6 swaps this localStorage
 * layer for a Postgres-backed sync. The hook surface stays
 * unchanged.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PREFERENCE_PROFILE_SCHEMA_VERSION,
  type ConfidenceTier,
  type ManualTags,
  type PreferenceProfile,
  type PreferenceSignal,
  type SignalKind,
  type SignalFacets,
  type TimeOfDay,
} from "@/types/preference-profile";
import {
  aggregateSignals,
  type AggregatedTags,
} from "@/lib/intelligence/signal-aggregator";
import {
  applyEditAction,
  mergePreferenceProfile,
  type MergedProfile,
} from "@/lib/intelligence/manual-edit-merge";
import { classifyDate } from "@/lib/intelligence/time-of-day";
import { confidenceTier } from "@/types/preference-profile";

export const PREFERENCE_PROFILE_STORAGE_KEY = "sous-preference-profile-v1";

interface StoredShape {
  v: number;
  signals: PreferenceSignal[];
  manualTags: ManualTags;
}

const EMPTY_MANUAL: ManualTags = { likes: [], dislikes: [], suppressed: [] };

function freshStored(): StoredShape {
  return {
    v: PREFERENCE_PROFILE_SCHEMA_VERSION,
    signals: [],
    manualTags: { ...EMPTY_MANUAL },
  };
}

/** Pure: parse the stored payload defensively. Drops invalid
 *  individual signals rather than nuking the whole list. */
export function parseStoredPreferenceState(
  raw: string | null | undefined,
): StoredShape {
  if (!raw) return freshStored();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return freshStored();
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return freshStored();
  }
  const obj = parsed as Partial<StoredShape>;
  if (obj.v !== PREFERENCE_PROFILE_SCHEMA_VERSION) return freshStored();

  const signals: PreferenceSignal[] = Array.isArray(obj.signals)
    ? obj.signals.filter((s): s is PreferenceSignal =>
        Boolean(
          s &&
          typeof s === "object" &&
          typeof (s as PreferenceSignal).id === "string" &&
          typeof (s as PreferenceSignal).kind === "string" &&
          typeof (s as PreferenceSignal).capturedAt === "string" &&
          (s as PreferenceSignal).facets,
        ),
      )
    : [];

  const manualTags: ManualTags = {
    likes: Array.isArray(obj.manualTags?.likes)
      ? obj.manualTags!.likes.filter((t) => typeof t === "string")
      : [],
    dislikes: Array.isArray(obj.manualTags?.dislikes)
      ? obj.manualTags!.dislikes.filter((t) => typeof t === "string")
      : [],
    suppressed: Array.isArray(obj.manualTags?.suppressed)
      ? obj.manualTags!.suppressed.filter((t) => typeof t === "string")
      : [],
  };

  return {
    v: PREFERENCE_PROFILE_SCHEMA_VERSION,
    signals,
    manualTags,
  };
}

export interface RecordSignalInput {
  kind: SignalKind;
  facets: SignalFacets;
  /** Caller's "now" — defaults to new Date(). Override for tests. */
  now?: Date;
}

export interface UsePreferenceProfileResult {
  mounted: boolean;
  /** Composite profile: aggregated + manual-merged. */
  profile: PreferenceProfile;
  /** Merged per-axis weights ready for the recommender. */
  merged: MergedProfile;
  /** Confidence tier (cold-start / weak / medium / strong / very-strong). */
  confidence: ConfidenceTier;
  /** Surface a single time-of-day pattern (for chips on Today). */
  patternFor: (bucket: TimeOfDay) => string[];
  /** Append a signal — typed helper for call sites. */
  recordSignal: (input: RecordSignalInput) => void;
  /** Apply a manual edit (like/dislike/suppress + clears). */
  applyEdit: Parameters<typeof applyEditAction>[0]["action"] extends infer A
    ? (action: A) => void
    : never;
  /** Wipe manual + inferred state (Profile sheet "reset learned"). */
  reset: () => void;
}

const DAY_OF_WEEK_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;
type DayOfWeek = (typeof DAY_OF_WEEK_VALUES)[number];
function dayOfWeek(d: Date): DayOfWeek {
  const day = d.getDay();
  return (DAY_OF_WEEK_VALUES.find((v) => v === day) ?? 0) as DayOfWeek;
}

export function usePreferenceProfile(): UsePreferenceProfileResult {
  const [stored, setStored] = useState<StoredShape>(() => freshStored());
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate hydration guard: load localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(PREFERENCE_PROFILE_STORAGE_KEY);
      setStored(parseStoredPreferenceState(raw));
    } catch {
      setStored(freshStored());
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback((next: StoredShape) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        PREFERENCE_PROFILE_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // ignore — quota / privacy mode
    }
  }, []);

  const recordSignal = useCallback(
    (input: RecordSignalInput) => {
      const now = input.now ?? new Date();
      const signal: PreferenceSignal = {
        id: `sig-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        kind: input.kind,
        facets: input.facets,
        capturedAt: now.toISOString(),
        timeOfDay: classifyDate(now),
        dayOfWeek: dayOfWeek(now),
      };
      setStored((prev) => {
        const next: StoredShape = {
          ...prev,
          // Cap at 500 signals to keep localStorage bounded; drop
          // oldest. Decay handles correctness; cap handles size.
          signals: [...prev.signals, signal].slice(-500),
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const applyEdit = useCallback<UsePreferenceProfileResult["applyEdit"]>(
    (action) => {
      setStored((prev) => {
        const nextManual = applyEditAction({
          manual: prev.manualTags,
          action,
        });
        const next: StoredShape = { ...prev, manualTags: nextManual };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    setStored(() => {
      const next = freshStored();
      persist(next);
      return next;
    });
  }, [persist]);

  // Per-render aggregate compute — cap of 500 signals keeps this
  // O(500) which is fine. useMemo so unrelated re-renders don't
  // re-run the aggregation.
  const aggregated: AggregatedTags = useMemo(
    () =>
      aggregateSignals({
        signals: stored.signals,
        now: new Date(),
      }),
    [stored.signals],
  );

  const profile: PreferenceProfile = useMemo(
    () => ({
      schemaVersion: PREFERENCE_PROFILE_SCHEMA_VERSION,
      inferredTags: aggregated.inferred,
      manualTags: stored.manualTags,
      timeOfDayPatterns: aggregated.timeOfDayPatterns,
      signalCount: aggregated.contributingSignalCount,
      updatedAt: new Date().toISOString(),
    }),
    [aggregated, stored.manualTags],
  );

  const merged = useMemo(() => mergePreferenceProfile(profile), [profile]);

  const confidence = confidenceTier(profile.signalCount);

  const patternFor = useCallback(
    (bucket: TimeOfDay): string[] =>
      profile.timeOfDayPatterns[bucket]?.topTags ?? [],
    [profile.timeOfDayPatterns],
  );

  return {
    mounted,
    profile,
    merged,
    confidence,
    patternFor,
    recordSignal,
    applyEdit,
    reset,
  };
}
