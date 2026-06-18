"use client";

/**
 * useServerRecipes — the READ half of multi-clinician recipe sharing (Stage 0d
 * of docs/MULTI-CLINICIAN-RECIPES-PLAN.md). Reads PUBLISHED recipes across the
 * trusted cohort via `recipes.listVisible`, plus a `dbConnected` health probe.
 *
 * Dormant until the founder sets POSTGRES_URL on Vercel (FG-1): `listVisible`
 * returns [] with no DB, and `dbConnected` is false — so the UI can show a
 * "server offline" indicator instead of silently appearing to publish nothing
 * (Risk R1). Pairs with `useRecipeDrafts` (the local, optimistic source of
 * truth for the author's own recipes).
 */

import { trpc } from "@/lib/trpc/client";
import type { UserRecipe } from "@/types/user-recipe";

export function useServerRecipes() {
  // Cohort-wide published recipes. Refetch is cheap + bounded (limit 500
  // server-side); a minute of staleness is fine for a shared library.
  const visible = trpc.recipes.listVisible.useQuery(undefined, {
    staleTime: 60_000,
  });
  const health = trpc.recipes.health.useQuery(undefined, {
    staleTime: 60_000,
  });

  return {
    serverRecipes: (visible.data?.recipes ?? []) as UserRecipe[],
    isLoading: visible.isLoading,
    /** False until POSTGRES_URL is wired (FG-1) — drives the "offline" pill. */
    dbConnected: health.data?.dbConnected ?? false,
  };
}

/**
 * Pure: merge the author's local drafts with the cohort's published server
 * recipes into one list, keyed by id. A server row WINS over a local copy of
 * the same id (the server is canonical once published); local-only drafts
 * (not yet synced/published) are kept. Sorted by updatedAt desc.
 *
 * Exported pure so it's unit-testable without the network (the hooks above own
 * the data fetching; this owns the reconciliation).
 */
export function mergeRecipeLists(
  localDrafts: readonly UserRecipe[],
  serverRecipes: readonly UserRecipe[],
): UserRecipe[] {
  const byId = new Map<string, UserRecipe>();
  for (const r of localDrafts) byId.set(r.id, r);
  for (const r of serverRecipes) byId.set(r.id, r); // server wins on collision
  return Array.from(byId.values()).sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0,
  );
}
