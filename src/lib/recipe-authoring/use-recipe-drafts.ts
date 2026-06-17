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

import { useCallback, useSyncExternalStore } from "react";
import {
  parseUserRecipeJson,
  serialiseUserRecipe,
  userRecipeSchema,
  type UserRecipe,
} from "@/types/user-recipe";
import { persistRecipeUpsert, persistRecipeRemove } from "@/lib/trpc/vanilla";

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
  if (idx === -1) {
    // New recipe: ensure its slug is unique. The cook page resolves user
    // recipes by SLUG, so two recipes with the same title (same slugified slug)
    // would otherwise both map to whichever was stored first — tapping Cook on
    // the second silently opens the first. Suffix a counter on collision.
    const taken = new Set(list.map((r) => r.slug));
    let slug = recipe.slug;
    if (taken.has(slug)) {
      let n = 2;
      while (taken.has(`${slug}-${n}`)) n += 1;
      slug = `${slug}-${n}`;
    }
    return [...list, slug === recipe.slug ? recipe : { ...recipe, slug }];
  }
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

// ── Shared module store ─────────────────────────────────────
// Originally each useRecipeDrafts() call held its own useState, so every mount
// (the Today deck's quest card, /path/recipes, the cook page, the editor) had
// an INDEPENDENT copy of the list — an import or edit on one surface didn't
// appear on the others until a full reload. This is a single module-level store
// read through useSyncExternalStore: every mount shares ONE array and re-renders
// together, and a `storage` listener adopts writes from other tabs (a clinician
// with the app open twice). The pure helpers above remain the only logic; this
// is just the shared-subscription shell around them.

type DraftsSnapshot = { drafts: UserRecipe[]; hydrated: boolean };

let storeDrafts: UserRecipe[] = [];
let storeHydrated = false;
// Cached snapshot — its reference only changes when the store actually changes,
// which is what useSyncExternalStore requires to avoid an infinite render loop.
let snapshot: DraftsSnapshot = { drafts: storeDrafts, hydrated: storeHydrated };
const SERVER_SNAPSHOT: DraftsSnapshot = { drafts: [], hydrated: false };
const listeners = new Set<() => void>();

function rebuildSnapshot() {
  snapshot = { drafts: storeDrafts, hydrated: storeHydrated };
}

function emit() {
  for (const listener of listeners) listener();
}

function onStorageEvent(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return;
  // Another tab wrote the list — adopt it. Don't re-persist (that tab already
  // did; re-persisting would echo the event back and forth).
  storeDrafts = parseStoredRecipeDrafts(e.newValue);
  rebuildSnapshot();
  emit();
}

function ensureHydrated() {
  if (storeHydrated || typeof window === "undefined") return;
  try {
    storeDrafts = parseStoredRecipeDrafts(localStorage.getItem(STORAGE_KEY));
  } catch {
    storeDrafts = [];
  }
  storeHydrated = true;
  rebuildSnapshot();
  window.addEventListener("storage", onStorageEvent);
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureHydrated(); // first subscriber reads localStorage; later ones no-op
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): DraftsSnapshot {
  return snapshot;
}

function getServerSnapshot(): DraftsSnapshot {
  return SERVER_SNAPSHOT;
}

/** The single mutation path for the shared store: replace the list, persist to
 *  localStorage, notify every subscriber. Reads `storeDrafts` at call time so
 *  it never operates on a stale closure. */
function commitDrafts(next: UserRecipe[]) {
  storeDrafts = next;
  persist(next);
  rebuildSnapshot();
  emit();
}

export function useRecipeDrafts() {
  const { drafts, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const upsert = useCallback((recipe: UserRecipe) => {
    commitDrafts(upsertRecipe(storeDrafts, recipe));
    // Write-through to Supabase (best-effort; localStorage is the optimistic
    // source of truth).
    persistRecipeUpsert(recipe);
  }, []);

  const remove = useCallback((id: string) => {
    commitDrafts(removeRecipeById(storeDrafts, id));
    persistRecipeRemove(id);
  }, []);

  const clear = useCallback(() => {
    commitDrafts([]);
  }, []);

  const getById = useCallback(
    (id: string) => drafts.find((r) => r.id === id) ?? null,
    [drafts],
  );

  // `mounted` kept as the public name (call sites gate render on it) — it now
  // means "the shared store has hydrated from localStorage".
  return { drafts, mounted: hydrated, upsert, remove, clear, getById };
}
