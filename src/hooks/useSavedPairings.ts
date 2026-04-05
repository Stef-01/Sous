"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "sous-saved-pairings";
const MAX_SAVED = 20;

export interface SavedPairing {
  id: string;
  mealName: string;
  mealImageUrl: string;
  sides: { name: string; imageUrl: string }[];
  timestamp: number;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadPairings(): SavedPairing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistPairings(pairings: SavedPairing[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pairings));
  } catch {
    // localStorage full or unavailable
  }
}

export function useSavedPairings() {
  const [pairings, setPairings] = useState<SavedPairing[]>([]);

  // Load on mount
  useEffect(() => {
    setPairings(loadPairings());
  }, []);

  const savePairing = useCallback(
    (
      mealName: string,
      mealImageUrl: string,
      sides: { name: string; imageUrl: string }[]
    ): boolean => {
      const existing = loadPairings();
      // Check if already saved (same meal + same sides)
      const isDuplicate = existing.some(
        (p) =>
          p.mealName === mealName &&
          p.sides.map((s) => s.name).join(",") ===
            sides.map((s) => s.name).join(",")
      );
      if (isDuplicate) return false;

      const newPairing: SavedPairing = {
        id: generateId(),
        mealName,
        mealImageUrl,
        sides,
        timestamp: Date.now(),
      };

      let updated = [newPairing, ...existing];
      // Trim to max
      if (updated.length > MAX_SAVED) {
        updated = updated.slice(0, MAX_SAVED);
      }

      persistPairings(updated);
      setPairings(updated);
      return true;
    },
    []
  );

  const removePairing = useCallback((id: string) => {
    const existing = loadPairings();
    const updated = existing.filter((p) => p.id !== id);
    persistPairings(updated);
    setPairings(updated);
  }, []);

  const isSaved = useCallback(
    (
      mealName: string,
      sides: { name: string }[]
    ): boolean => {
      return pairings.some(
        (p) =>
          p.mealName === mealName &&
          p.sides.map((s) => s.name).join(",") ===
            sides.map((s) => s.name).join(",")
      );
    },
    [pairings]
  );

  return { pairings, savePairing, removePairing, isSaved };
}
