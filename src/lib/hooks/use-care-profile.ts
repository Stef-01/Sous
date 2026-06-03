"use client";

/**
 * useCareProfile — the user's self-reported health focus (culinary
 * therapeutics). Mirrors useParentMode: versioned localStorage, pure parser,
 * device-scoped. UI lives only in the owl Profile & Settings sheet (rule 3).
 *
 * Source of truth is localStorage (lean posture). A server write path
 * (prefs.setCareProfile + care_profile table) is added when auth lands; until
 * then nothing is lost — the device keeps the profile.
 *
 * Pure helpers are exported so use-care-profile.test.ts can exercise them
 * without a DOM, matching the use-parent-mode.test.ts convention.
 */

import { useCallback, useEffect, useState } from "react";
import type { CareProfile, FodmapPhase } from "@/types/care-profile";
import type { ConditionId } from "@/types/therapeutics";
import type { DietaryFlag } from "@/lib/engine/dietary-inferer";

export const CARE_PROFILE_STORAGE_KEY = "sous-care-profile-v1";

/** Schema version — bump to invalidate stale localStorage on shape changes. */
export const CARE_PROFILE_SCHEMA_VERSION = 1;

export const EMPTY_CARE_PROFILE: CareProfile = {
  v: 1,
  conditions: [],
  avoid: [],
  fodmapPhase: null,
  updatedAt: "",
};

/**
 * Pure parser. Returns EMPTY_CARE_PROFILE when the input is malformed,
 * missing, or carries a stale schema version. Exported for DOM-free tests.
 */
export function parseStoredCareProfile(raw: string | null): CareProfile {
  if (!raw) return EMPTY_CARE_PROFILE;
  try {
    const parsed = JSON.parse(raw) as Partial<CareProfile>;
    if (parsed.v !== CARE_PROFILE_SCHEMA_VERSION) return EMPTY_CARE_PROFILE;
    return {
      ...EMPTY_CARE_PROFILE,
      ...parsed,
      conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
      avoid: Array.isArray(parsed.avoid) ? parsed.avoid : [],
      fodmapPhase: parsed.fodmapPhase ?? null,
    };
  } catch {
    return EMPTY_CARE_PROFILE;
  }
}

export function serializeCareProfile(profile: CareProfile): string {
  return JSON.stringify(profile);
}

function load(): CareProfile {
  if (typeof window === "undefined") return EMPTY_CARE_PROFILE;
  try {
    return parseStoredCareProfile(
      localStorage.getItem(CARE_PROFILE_STORAGE_KEY),
    );
  } catch {
    return EMPTY_CARE_PROFILE;
  }
}

function persist(profile: CareProfile) {
  try {
    localStorage.setItem(
      CARE_PROFILE_STORAGE_KEY,
      serializeCareProfile(profile),
    );
  } catch {
    // localStorage unavailable / quota — UX-acceptable in prototype.
  }
}

function stamp(profile: Omit<CareProfile, "updatedAt">): CareProfile {
  return { ...profile, updatedAt: new Date().toISOString() };
}

export function useCareProfile() {
  const [profile, setProfile] = useState<CareProfile>(EMPTY_CARE_PROFILE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setProfile(load());
  }, []);

  const commit = useCallback((next: CareProfile) => {
    persist(next);
    setProfile(next);
  }, []);

  const toggleCondition = useCallback(
    (id: ConditionId) => {
      const cur = load();
      const has = cur.conditions.includes(id);
      const conditions = has
        ? cur.conditions.filter((c) => c !== id)
        : [...cur.conditions, id];
      // Leaving IBS clears the FODMAP phase — it's meaningless otherwise.
      const fodmapPhase = id === "ibs" && has ? null : cur.fodmapPhase;
      commit(stamp({ ...cur, conditions, fodmapPhase }));
    },
    [commit],
  );

  const toggleAvoid = useCallback(
    (flag: DietaryFlag) => {
      const cur = load();
      const has = cur.avoid.includes(flag);
      const avoid = has
        ? cur.avoid.filter((f) => f !== flag)
        : [...cur.avoid, flag];
      commit(stamp({ ...cur, avoid }));
    },
    [commit],
  );

  const setFodmapPhase = useCallback(
    (phase: FodmapPhase | null) => {
      const cur = load();
      commit(stamp({ ...cur, fodmapPhase: phase }));
    },
    [commit],
  );

  const clear = useCallback(() => {
    commit({ ...EMPTY_CARE_PROFILE, updatedAt: new Date().toISOString() });
  }, [commit]);

  const hasFocus = profile.conditions.length > 0 || profile.avoid.length > 0;

  return {
    profile,
    hasFocus,
    toggleCondition,
    toggleAvoid,
    setFodmapPhase,
    clear,
  };
}
