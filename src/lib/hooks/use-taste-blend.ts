"use client";

import { useCallback, useEffect, useState } from "react";

/** Household taste blend  -  a single knob that dampens the user's own
 *  preference vector so pairings lean more toward a partner's taste.
 *
 *  We don't model a second user's profile: onboarding-for-two would violate
 *  the "no settings page" rule, and in practice the partner rarely has a
 *  history on Sous anyway. Instead, a slider `alpha ∈ [0, 1]` scales the
 *  acting preference vector:
 *
 *    alpha = 1.0 → "More yours"  -  full personal preferences
 *    alpha = 0.5 → blend         -  half-strength preferences (widens pool)
 *    alpha = 0.0 → "More theirs"  -  preferences disabled (pure pairing fit)
 *
 *  The effect: when you drag toward "theirs," the pairing engine stops
 *  biasing for your learned tastes and falls back to cuisine/flavor
 *  fit, which naturally surfaces dishes you wouldn't typically pick.
 */

const STORAGE_KEY = "sous-taste-blend";

export interface TasteBlendState {
  /** Are we currently cooking for two? When false, preferences are applied
   *  at full strength regardless of `alpha`. */
  duo: boolean;
  /** Blend factor 0..1. See module doc for semantics. */
  alpha: number;
  /** Timestamp when we last showed the initial "cooking for someone else
   *  tonight too?" prompt  -  null means never shown. Used to gate the
   *  one-time Path prompt. */
  promptedAt: number | null;
}

const DEFAULT_STATE: TasteBlendState = {
  duo: false,
  alpha: 0.5,
  promptedAt: null,
};

function loadState(): TasteBlendState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<TasteBlendState>;
    return {
      duo: Boolean(parsed.duo),
      alpha:
        typeof parsed.alpha === "number"
          ? Math.max(0, Math.min(1, parsed.alpha))
          : DEFAULT_STATE.alpha,
      promptedAt:
        typeof parsed.promptedAt === "number" ? parsed.promptedAt : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function persistState(state: TasteBlendState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently ignore quota / private-mode errors.
  }
}

/** Apply blend to a preference vector. Returns a new Record  -  never mutates.
 *  When `duo` is false, this is an identity transform. */
export function blendPreferences(
  prefs: Record<string, number> | undefined,
  duo: boolean,
  alpha: number,
): Record<string, number> | undefined {
  if (!prefs) return prefs;
  if (!duo) return prefs;
  const clamped = Math.max(0, Math.min(1, alpha));
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(prefs)) {
    const scaled = v * clamped;
    // Normalize -0 → 0 so downstream equality checks (and serialisation)
    // are well-behaved when alpha collapses the vector.
    out[k] = scaled === 0 ? 0 : scaled;
  }
  return out;
}

export function useTasteBlend() {
  const [state, setState] = useState<TasteBlendState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydration from localStorage must happen client-side only so SSR and
    // first paint agree  -  this is the intended use of set-in-effect here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
    setMounted(true);
  }, []);

  const update = useCallback((next: Partial<TasteBlendState>) => {
    setState((prev) => {
      const merged = { ...prev, ...next };
      persistState(merged);
      return merged;
    });
  }, []);

  const setDuo = useCallback(
    (duo: boolean) => update({ duo, promptedAt: Date.now() }),
    [update],
  );

  const setAlpha = useCallback(
    (alpha: number) => update({ alpha: Math.max(0, Math.min(1, alpha)) }),
    [update],
  );

  const dismissPrompt = useCallback(
    () => update({ promptedAt: Date.now() }),
    [update],
  );

  return {
    mounted,
    duo: state.duo,
    alpha: state.alpha,
    /** True if the one-time Path onboarding prompt has never been shown. */
    shouldPrompt: mounted && state.promptedAt === null,
    setDuo,
    setAlpha,
    dismissPrompt,
  };
}
