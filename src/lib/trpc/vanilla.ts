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
import { getDeviceId } from "@/lib/hooks/use-device-id";

let _client: ReturnType<typeof createTRPCClient<AppRouter>> | null = null;

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
