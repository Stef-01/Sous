"use client";

import { useCallback, useEffect, useState } from "react";
import { bookmarkKey, type SaveableKind } from "@/types/content";

const STORAGE_KEY = "sous-content-bookmarks-v1";
const MAX_BOOKMARKS = 100;

export interface ContentBookmark {
  /** kind:id composite key, e.g. "articles:art-myth-carbs". */
  key: string;
  kind: SaveableKind;
  id: string;
  savedAt: number;
}

function load(): ContentBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ContentBookmark[]) : [];
  } catch {
    return [];
  }
}

function persist(bookmarks: ContentBookmark[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // ignore quota errors — UX-acceptable in prototype
  }
}

/**
 * useContentBookmarks — localStorage-backed save state for Articles, Reels,
 * Research briefs, and Forum threads. Keys are namespaced by content kind
 * so collisions across categories are impossible.
 */
export function useContentBookmarks() {
  const [bookmarks, setBookmarks] = useState<ContentBookmark[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setBookmarks(load());
  }, []);

  const isBookmarked = useCallback(
    (kind: SaveableKind, id: string) =>
      bookmarks.some((b) => b.key === bookmarkKey(kind, id)),
    [bookmarks],
  );

  const toggle = useCallback((kind: SaveableKind, id: string): boolean => {
    const key = bookmarkKey(kind, id);
    const current = load();
    const exists = current.some((b) => b.key === key);
    let next: ContentBookmark[];
    if (exists) {
      next = current.filter((b) => b.key !== key);
    } else {
      next = [{ key, kind, id, savedAt: Date.now() }, ...current].slice(
        0,
        MAX_BOOKMARKS,
      );
    }
    persist(next);
    setBookmarks(next);
    return !exists;
  }, []);

  const remove = useCallback((kind: SaveableKind, id: string) => {
    const key = bookmarkKey(kind, id);
    const next = load().filter((b) => b.key !== key);
    persist(next);
    setBookmarks(next);
  }, []);

  return { bookmarks, isBookmarked, toggle, remove };
}
