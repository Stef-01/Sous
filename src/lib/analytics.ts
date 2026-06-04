import { track as vercelTrack } from "@vercel/analytics";

/**
 * Product-funnel analytics — one typed funnel for the core journey
 * (search → results → cook → win) plus the key side-actions (evaluate, share,
 * camera recognition).
 *
 * Forwards to Vercel Analytics, which is already mounted in the root layout and
 * only actually sends in production on Vercel. Everywhere else — dev, tests,
 * SSR — `track()` is a guarded no-op and never throws.
 *
 * PRIVACY: props must be non-PII only — enums, counts, booleans, dish slugs,
 * condition *flags* (never raw conditions, never user text). The funnel is for
 * rates, not for reconstructing an individual's session.
 */
export type AnalyticsEvent =
  | "search_submitted"
  | "results_viewed"
  | "cook_started"
  | "cook_completed"
  | "evaluate_opened"
  | "plate_shared"
  | "recognition_used";

type AnalyticsValue = string | number | boolean | null;
export type AnalyticsProps = Record<string, AnalyticsValue>;

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  try {
    if (typeof window === "undefined") return; // SSR / node tests → no-op
    vercelTrack(event, props);
  } catch {
    // Analytics must never break the app.
  }
}
