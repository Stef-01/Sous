"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sous-reel-engagement-v1";

interface ReelEngagement {
  /** reel id → liked? */
  liked: Record<string, boolean>;
  /** reel id → opened count (local, never sent). */
  opened: Record<string, number>;
}

const EMPTY: ReelEngagement = { liked: {}, opened: {} };

function load(): ReelEngagement {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ReelEngagement>;
    return {
      liked: parsed.liked ?? {},
      opened: parsed.opened ?? {},
    };
  } catch {
    return EMPTY;
  }
}

function persist(state: ReelEngagement) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/**
 * useReelEngagement — local like + view-count state for the Reels surface.
 * Like state is purely client-side; view counts are local and never sent.
 */
export function useReelEngagement() {
  const [state, setState] = useState<ReelEngagement>(EMPTY);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setState(load());
  }, []);

  const isLiked = useCallback(
    (reelId: string) => state.liked[reelId] === true,
    [state.liked],
  );

  const toggleLike = useCallback((reelId: string): boolean => {
    const current = load();
    const next: ReelEngagement = {
      ...current,
      liked: { ...current.liked, [reelId]: !current.liked[reelId] },
    };
    persist(next);
    setState(next);
    return next.liked[reelId] === true;
  }, []);

  const markOpened = useCallback((reelId: string) => {
    const current = load();
    const next: ReelEngagement = {
      ...current,
      opened: {
        ...current.opened,
        [reelId]: (current.opened[reelId] ?? 0) + 1,
      },
    };
    persist(next);
    setState(next);
  }, []);

  const openedCount = useCallback(
    (reelId: string) => state.opened[reelId] ?? 0,
    [state.opened],
  );

  return { isLiked, toggleLike, markOpened, openedCount };
}
