"use client";

/**
 * useRecipeDrafts — localStorage-backed store of user-authored
 * recipes. The user can have N drafts at once (in-progress + saved
 * + previously-committed); this hook is the read/write surface.
 *
 * W24 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint E recipe
 * authoring, persistence layer). Pairs with W17 schema +
 * W23 pure draft helpers.
 *
 * Vibecode-scoped: localStorage only. Sprint-2 founder-unlock
 * swaps to Drizzle / Postgres for cross-device sync.
 *
 * Pure parser `parseStoredRecipeDrafts` exported for unit testing.
 * Mirrors the W15 / W22 pref-hook pattern (freshDefault factory,
 * object-shape gate, validate against schema before adoption).
 */

import { useCallback, useEffect, useState } from "react";
import {
  parseUserRecipeJson,
  serialiseUserRecipe,
  userRecipeSchema,
  type UserRecipe,
} from "@/types/user-recipe";

const STORAGE_KEY = "sous-recipe-drafts-v1";

/** Pure parser. Handles missing key, corrupt JSON, wrong root
 *  shape (must be array), and per-element schema failures
 *  (drops invalid entries silently — better partial recovery than
 *  losing the whole list). */
export function parseStoredRecipeDrafts(
  raw: string | null | undefined,
): UserRecipe[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: UserRecipe[] = [];
  for (const item of parsed) {
    const result = userRecipeSchema.safeParse(item);
    if (result.success) out.push(result.data);
  }
  return out;
}

function persist(recipes: ReadonlyArray<UserRecipe>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    // ignore — quota / privacy mode
  }
}

/** Pure helper: insert or update a recipe in a list keyed by `id`.
 *  Exported for unit testing without DOM. */
export function upsertRecipe(
  list: ReadonlyArray<UserRecipe>,
  recipe: UserRecipe,
): UserRecipe[] {
  const idx = list.findIndex((r) => r.id === recipe.id);
  if (idx === -1) return [...list, recipe];
  const next = [...list];
  next[idx] = recipe;
  return next;
}

/** Pure helper: remove a recipe by id. */
export function removeRecipeById(
  list: ReadonlyArray<UserRecipe>,
  id: string,
): UserRecipe[] {
  return list.filter((r) => r.id !== id);
}

/** Pure helper: validate-then-serialise a recipe. Returns null
 *  if the recipe doesn't satisfy the schema. */
export function safeSerialiseRecipe(recipe: UserRecipe): string | null {
  const result = userRecipeSchema.safeParse(recipe);
  if (!result.success) return null;
  return serialiseUserRecipe(result.data);
}

/** Pure helper: round-trip a single recipe payload through the
 *  parser (defensive against caller-side mutation). */
export function roundTripRecipe(raw: string): UserRecipe | null {
  const result = parseUserRecipeJson(raw);
  return result.ok ? result.recipe : null;
}

export function useRecipeDrafts() {
  const [drafts, setDrafts] = useState<UserRecipe[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") {
      setMounted(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setDrafts(parseStoredRecipeDrafts(raw));
    } catch {
      setDrafts([]);
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const upsert = useCallback((recipe: UserRecipe) => {
    setDrafts((prev) => {
      const next = upsertRecipe(prev, recipe);
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setDrafts((prev) => {
      const next = removeRecipeById(prev, id);
      persist(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    persist([]);
    setDrafts([]);
  }, []);

  const getById = useCallback(
    (id: string) => drafts.find((r) => r.id === id) ?? null,
    [drafts],
  );

  return { drafts, mounted, upsert, remove, clear, getById };
}
