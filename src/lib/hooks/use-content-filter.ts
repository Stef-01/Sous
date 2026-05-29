"use client";

import { useCallback, useEffect, useState } from "react";

export type ContentFilter =
  | "for-you"
  | "reels"
  | "articles"
  | "research"
  | "experts"
  | "forum";

export const CONTENT_FILTER_LABELS: Record<ContentFilter, string> = {
  "for-you": "For You",
  reels: "Reels",
  articles: "Articles",
  research: "Research",
  experts: "Experts",
  forum: "Forum",
};

export const CONTENT_FILTERS: ContentFilter[] = [
  "for-you",
  "reels",
  "articles",
  "research",
  "experts",
  "forum",
];

const STORAGE_KEY = "sous-content-filter";
const DEFAULT: ContentFilter = "for-you";

function load(): ContentFilter {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw && (CONTENT_FILTERS as string[]).includes(raw)) {
      return raw as ContentFilter;
    }
  } catch {
    // ignore
  }
  return DEFAULT;
}

/**
 * useContentFilter — sessionStorage-backed active category pill on the
 * Content home page. Resets on tab close (intentional — discovery surface).
 */
export function useContentFilter() {
  const [filter, setFilterState] = useState<ContentFilter>(DEFAULT);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setFilterState(load());
  }, []);

  const setFilter = useCallback((next: ContentFilter) => {
    setFilterState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return { filter, setFilter };
}
