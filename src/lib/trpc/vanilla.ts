/**
 * Vanilla (non-React) tRPC client.
 *
 * Used for fire-and-forget write-throughs from plain hooks/stores that
 * aren't inside the React-Query provider tree (e.g. `use-cook-sessions`'s
 * `completeSession`). Carries the device-id header like the React client.
 */
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "./routers";
import type { UserRecipe } from "@/types/user-recipe";
import type { ParentProfile } from "@/types/parent-mode";
import type {
  ChallengePod,
  PodChallengeWeek,
  PodSubmission,
} from "@/types/challenge-pod";
import { getDeviceId } from "@/lib/hooks/use-device-id";

let _client: ReturnType<typeof createTRPCClient<AppRouter>> | null = null;

/** Raw vanilla client — for sync modules that need query+mutate directly. */
export function getVanillaTrpc() {
  return client();
}

function client() {
  if (!_client) {
    _client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          headers: () => {
            const id = getDeviceId();
            return id ? { "x-sous-device-id": id } : {};
          },
        }),
      ],
    });
  }
  return _client;
}

/**
 * Persist a completed cook to Supabase. Best-effort + fire-and-forget:
 * localStorage remains the source of truth, so a network failure (or
 * local/static mode) never blocks the win. Only runs in the browser.
 */
export function persistCookCompletion(input: {
  sideDishSlug: string;
  mainDishInput?: string | null;
  rating?: number | null;
  personalNote?: string | null;
  completionPhotoUrl?: string | null;
}): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .cookSession.complete.mutate({ inputMode: "text", ...input })
      .catch(() => {
        /* offline / local mode — localStorage already has it */
      });
  } catch {
    /* never throw from the win path */
  }
}

/** Best-effort write-through for a saved-dish toggle. */
export function persistSavedDishToggle(input: {
  sideDishSlug: string;
  saved: boolean;
}): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .saved.toggleDish.mutate(input)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for a content-bookmark toggle. */
export function persistBookmarkToggle(input: {
  kind: string;
  itemId: string;
  saved: boolean;
}): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .saved.toggleBookmark.mutate(input)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for a user-recipe save/edit. */
export function persistRecipeUpsert(recipe: UserRecipe): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .recipes.upsert.mutate(recipe)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for a user-recipe deletion. */
export function persistRecipeRemove(id: string): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .recipes.remove.mutate({ id })
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for a Parent Mode profile change. */
export function persistParentProfile(p: ParentProfile): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .prefs.setParentProfile.mutate({
        enabled: p.enabled,
        ageBand: p.ageBand,
        spiceTolerance: p.spiceTolerance,
        flaggedAllergens: p.flaggedAllergens,
        enabledAt: p.enabledAt || null,
      })
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for a kids-ate-it verdict. */
export function persistKidsAteIt(input: {
  cookSessionId: string;
  recipeSlug: string;
  verdict: "yes" | "some" | "no";
}): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .prefs.logKidsAteIt.mutate(input)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for a recipe step note. */
export function persistStepNote(input: {
  recipeSlug: string;
  stepIndex: number;
  note: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .prefs.saveStepNote.mutate(input)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for a meal-plan slot schedule. */
export function persistMealPlanSlot(input: {
  weekKey: string;
  slot: string;
  recipeSlug: string;
  source: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .plan.scheduleSlot.mutate(input)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for clearing a meal-plan slot. */
export function persistClearMealPlanSlot(input: {
  weekKey: string;
  slot: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .plan.clearSlot.mutate(input)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for wiping a meal-plan week. */
export function persistClearMealPlanWeek(input: { weekKey: string }): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .plan.clearWeek.mutate(input)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

// ── Cooking pods (Stage G) ──────────────────────────────────────
/** Best-effort write-through for saving a pod (+ its members). */
export function persistPodSave(pod: ChallengePod): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .pod.savePod.mutate(pod)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for a pod challenge week. */
export function persistPodWeek(week: PodChallengeWeek): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .pod.upsertWeek.mutate(week)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for a pod submission. */
export function persistPodSubmission(submission: PodSubmission): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .pod.upsertSubmission.mutate(submission)
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for removing a pod submission. */
export function persistPodRemoveSubmission(id: string): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .pod.removeSubmission.mutate({ id })
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}

/** Best-effort write-through for clearing a pod (cascade). */
export function persistPodClear(podId: string): void {
  if (typeof window === "undefined") return;
  try {
    void client()
      .pod.clearPod.mutate({ podId })
      .catch(() => {});
  } catch {
    /* localStorage already has it */
  }
}
