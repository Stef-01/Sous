"use client";

import { useState, useCallback, useEffect } from "react";
import { persistSavedDishToggle } from "@/lib/trpc/vanilla";

const STORAGE_KEY = "sous-saved-dishes";
const SAVED_EVENT = "sous-saved-dishes-changed";
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

/** Same-tab broadcast so every useSavedDishes instance stays in lock-step — the
 *  deck reads `saved` from one instance while the heart button writes via
 *  another, so without this the crave-it resurface wouldn't fire until reload. */
function broadcast() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SAVED_EVENT));
  }
}

export function useSavedDishes() {
  const [saved, setSaved] = useState<SavedDish[]>([]);

   
  useEffect(() => {
    const read = () => setSaved(loadSaved());
    read();
    window.addEventListener(SAVED_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(SAVED_EVENT, read);
      window.removeEventListener("storage", read);
    };
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
    persistSavedDishToggle({ sideDishSlug: slug, saved: true });
    broadcast();
    return true;
  }, []);

  const removeDish = useCallback((slug: string) => {
    const existing = loadSaved();
    const updated = existing.filter((d) => d.slug !== slug);
    persist(updated);
    setSaved(updated);
    persistSavedDishToggle({ sideDishSlug: slug, saved: false });
    broadcast();
  }, []);

  const isDishSaved = useCallback(
    (slug: string): boolean => {
      return saved.some((d) => d.slug === slug);
    },
    [saved],
  );

  return { saved, saveDish, removeDish, isDishSaved };
}
