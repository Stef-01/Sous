"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccessoryId } from "@/lib/nutrition/pet-accessories";

/**
 * usePetAccessories — owned + equipped pet accessories (the variable-reward
 * loot). Persisted in localStorage and kept in lock-step across components via a
 * same-tab custom event (+ the cross-tab storage event), so a drop granted on
 * the win screen shows up immediately on the pet in the mini-game without a
 * reload. (The cross-instance sync the saved-dishes review taught us — built in.)
 */

const OWNED_KEY = "sous-pet-accessories-owned";
const EQUIPPED_KEY = "sous-pet-accessories-equipped";
const EVENT = "sous-pet-accessories-changed";

function loadOwned(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OWNED_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function loadEquipped(): AccessoryId | null {
  if (typeof window === "undefined") return null;
  try {
    return (localStorage.getItem(EQUIPPED_KEY) as AccessoryId | null) || null;
  } catch {
    return null;
  }
}

function broadcast() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export function usePetAccessories() {
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [equipped, setEquipped] = useState<AccessoryId | null>(null);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate + sync across instances/tabs */
  useEffect(() => {
    const read = () => {
      setOwned(new Set(loadOwned()));
      setEquipped(loadEquipped());
    };
    read();
    setMounted(true);
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Grant a freshly-dropped accessory: add to owned + auto-equip it so the
   *  reward is immediately visible. Returns false if already owned. */
  const grant = useCallback((id: AccessoryId): boolean => {
    const current = loadOwned();
    if (current.includes(id)) return false;
    const next = [...current, id];
    try {
      localStorage.setItem(OWNED_KEY, JSON.stringify(next));
      localStorage.setItem(EQUIPPED_KEY, id);
    } catch {
      /* private mode / quota */
    }
    setOwned(new Set(next));
    setEquipped(id);
    broadcast();
    return true;
  }, []);

  const equip = useCallback((id: AccessoryId | null) => {
    try {
      if (id) localStorage.setItem(EQUIPPED_KEY, id);
      else localStorage.removeItem(EQUIPPED_KEY);
    } catch {
      /* private mode */
    }
    setEquipped(id);
    broadcast();
  }, []);

  return { owned, equipped, grant, equip, mounted };
}
