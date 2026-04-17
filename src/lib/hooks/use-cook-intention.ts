"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sous-cook-intention-v1";

export interface CookIntention {
  /** Freeform dish name — what the user is committing to. */
  dishName: string;
  /** ISO timestamp the commitment was made. */
  createdAt: string;
  /** Local calendar date (YYYY-MM-DD) the intention applies to. */
  targetDate: string;
}

interface StoredShape {
  intention: CookIntention | null;
}

/** Today's calendar date in the local timezone, normalized to YYYY-MM-DD. */
function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function load(): CookIntention | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredShape>;
    const intention = parsed.intention ?? null;
    if (!intention) return null;
    // Auto-expire if the stored target date is in the past — tonight's
    // commitment should silently fade, never nag.
    if (intention.targetDate !== localDateKey()) return null;
    if (
      typeof intention.dishName !== "string" ||
      typeof intention.createdAt !== "string" ||
      typeof intention.targetDate !== "string"
    ) {
      return null;
    }
    return intention;
  } catch {
    return null;
  }
}

function save(intention: CookIntention | null): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredShape = { intention };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage quota/SSR — silent fallback. Intention is ephemeral anyway.
  }
}

export interface UseCookIntentionResult {
  intention: CookIntention | null;
  mounted: boolean;
  commit: (dishName: string) => void;
  clear: () => void;
}

/**
 * useCookIntention — lightweight "I'm cooking X tonight" commitment store.
 *
 * The commitment is intentionally fragile: it auto-expires at local midnight
 * and can be cleared at any time with zero friction. The win is a small
 * ritual that reinforces the habit loop without turning into a chore.
 */
export function useCookIntention(): UseCookIntentionResult {
  const [intention, setIntention] = useState<CookIntention | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydrate once from localStorage — intentional client-side state seed,
    // so the UI can render a mount-aware fallback until storage is read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIntention(load());
    setMounted(true);
  }, []);

  const commit = useCallback((dishName: string) => {
    const trimmed = dishName.trim();
    if (!trimmed) return;
    const next: CookIntention = {
      dishName: trimmed,
      createdAt: new Date().toISOString(),
      targetDate: localDateKey(),
    };
    save(next);
    setIntention(next);
  }, []);

  const clear = useCallback(() => {
    save(null);
    setIntention(null);
  }, []);

  return { intention, mounted, commit, clear };
}
