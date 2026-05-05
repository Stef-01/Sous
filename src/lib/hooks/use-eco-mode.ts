"use client";

/**
 * useEcoMode — Eco Mode profile + toggle.
 *
 * Eco Mode is the carbon-conscious filter, conceptually parallel
 * to Parent Mode: a single boolean toggle layered on top of the
 * normal app, plus a small profile (preferred baseline + region)
 * the dashboard reads from.
 *
 * When Eco Mode is on:
 *   - Pairing engine prefers low-carbon sides (plant-forward,
 *     in-season).
 *   - Recipe + win-screen surfaces show carbon-avoided framing.
 *   - Active seasonal challenges become more prominent on
 *     /community.
 *   - Today page surfaces a quiet "X kg saved this month" chip.
 *
 * Plumbing only — no UI here. The pure carbon math lives in
 * `src/lib/eco/carbon-math.ts`; the challenge resolver lives in
 * `src/lib/eco/seasonal-challenges.ts`. Real-mode wire-up: the
 * server-of-record sync lands in Sprint C (Postgres flip).
 *
 * Same W15 RCA pattern as the meal-plan + Parent Mode hooks:
 * freshDefault factory, schema-version check, partial-recovery
 * parser. Pure helpers exported so tests exercise migration
 * without a DOM.
 */

import { useCallback, useEffect, useState } from "react";
import type { MealContext } from "@/lib/eco/carbon-math";

export const ECO_MODE_STORAGE_KEY = "sous-eco-mode-v1";
export const ECO_MODE_SCHEMA_VERSION = 1;

export interface EcoProfile {
  /** Master toggle. */
  enabled: boolean;
  /** Baseline alternative-meal context for "you saved X kg vs"
   *  comparisons. Default "delivery" (worst-case generous). */
  comparisonBaseline: MealContext;
  /** ISO date Eco Mode was last enabled. Empty when never on. */
  enabledAt: string;
}

export const DEFAULT_ECO_PROFILE: EcoProfile = {
  enabled: false,
  comparisonBaseline: "delivery",
  enabledAt: "",
};

interface StoredShape {
  v: number;
  profile: EcoProfile;
}

const VALID_BASELINES: ReadonlyArray<MealContext> = [
  "home-plant-seasonal",
  "home-mixed",
  "home-red-meat",
  "restaurant-dine-in",
  "takeout-pickup",
  "delivery",
];

/** Pure: parse a stored payload. Defends against missing key,
 *  malformed JSON, schema mismatch, partial corruption. Exposed
 *  for the test suite. */
export function parseStoredEcoProfile(raw: string | null): EcoProfile {
  if (!raw) return DEFAULT_ECO_PROFILE;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredShape>;
    if (
      parsed.v !== ECO_MODE_SCHEMA_VERSION ||
      !parsed.profile ||
      typeof parsed.profile !== "object"
    ) {
      return DEFAULT_ECO_PROFILE;
    }
    const incoming = parsed.profile as Partial<EcoProfile>;
    const baseline =
      typeof incoming.comparisonBaseline === "string" &&
      VALID_BASELINES.includes(incoming.comparisonBaseline as MealContext)
        ? (incoming.comparisonBaseline as MealContext)
        : DEFAULT_ECO_PROFILE.comparisonBaseline;
    return {
      enabled: typeof incoming.enabled === "boolean" ? incoming.enabled : false,
      comparisonBaseline: baseline,
      enabledAt:
        typeof incoming.enabledAt === "string" ? incoming.enabledAt : "",
    };
  } catch {
    return DEFAULT_ECO_PROFILE;
  }
}

/** Pure: serialise back to the canonical storage shape. */
export function serializeEcoProfile(profile: EcoProfile): string {
  return JSON.stringify({
    v: ECO_MODE_SCHEMA_VERSION,
    profile,
  } satisfies StoredShape);
}

export interface UseEcoModeResult {
  mounted: boolean;
  profile: EcoProfile;
  /** Convenience accessor — same as `profile.enabled`. */
  enabled: boolean;
  /** Toggle Eco Mode on/off. Stamps enabledAt on transition to on. */
  toggle: () => void;
  /** Set the baseline used for "saved vs" comparison. */
  setBaseline: (baseline: MealContext) => void;
  /** Reset to defaults (useful for the Profile sheet's "reset"
   *  affordance and tests). */
  reset: () => void;
}

export function useEcoMode(): UseEcoModeResult {
  const [profile, setProfile] = useState<EcoProfile>(DEFAULT_ECO_PROFILE);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate hydration guard: read localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(ECO_MODE_STORAGE_KEY);
      setProfile(parseStoredEcoProfile(raw));
    } catch {
      setProfile(DEFAULT_ECO_PROFILE);
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback((next: EcoProfile) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ECO_MODE_STORAGE_KEY, serializeEcoProfile(next));
    } catch {
      // ignore — quota / privacy mode
    }
  }, []);

  const toggle = useCallback(() => {
    setProfile((prev) => {
      const enabling = !prev.enabled;
      const next: EcoProfile = {
        ...prev,
        enabled: enabling,
        enabledAt: enabling ? new Date().toISOString() : prev.enabledAt,
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const setBaseline = useCallback(
    (baseline: MealContext) => {
      setProfile((prev) => {
        const next: EcoProfile = { ...prev, comparisonBaseline: baseline };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    setProfile(() => {
      persist(DEFAULT_ECO_PROFILE);
      return DEFAULT_ECO_PROFILE;
    });
  }, [persist]);

  return {
    mounted,
    profile,
    enabled: profile.enabled,
    toggle,
    setBaseline,
    reset,
  };
}
