"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "sous-saved-dishes";
const MAX_SAVED = 50;

export interface SavedDish {
  slug: string;
  name: string;
  savedAt: number;
}

function loadSaved(): SavedDish[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(dishes: SavedDish[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
  } catch {
    // localStorage full or unavailable
  }
}

export function useSavedDishes() {
  const [saved, setSaved] = useState<SavedDish[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage on mount
    setSaved(loadSaved());
  }, []);

  const saveDish = useCallback((slug: string, name: string): boolean => {
    const existing = loadSaved();
    if (existing.some((d) => d.slug === slug)) return false;

    let updated = [{ slug, name, savedAt: Date.now() }, ...existing];
    if (updated.length > MAX_SAVED) {
      updated = updated.slice(0, MAX_SAVED);
    }

    persist(updated);
    setSaved(updated);
    return true;
  }, []);

  const removeDish = useCallback((slug: string) => {
    const existing = loadSaved();
    const updated = existing.filter((d) => d.slug !== slug);
    persist(updated);
    setSaved(updated);
  }, []);

  const isDishSaved = useCallback(
    (slug: string): boolean => {
      return saved.some((d) => d.slug === slug);
    },
    [saved],
  );

  return { saved, saveDish, removeDish, isDishSaved };
}
