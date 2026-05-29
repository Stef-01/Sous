/**
 * Analytics event taxonomy.
 *
 * Stage 2 W17 prep (autonomous-prep stub). All event names + payload
 * shapes for Sous in one typed module. Until Sentry / Vercel Analytics
 * envs land, `track()` no-ops; once the founder provides them the same
 * call sites start firing real events. Zero change to call sites.
 *
 * Why a typed module instead of free-form `track('whatever')`:
 *   - The funnel queries in the W17 dashboard depend on stable names.
 *   - We want the SAFE-phrasings linter to be able to forbid PII in
 *     payloads at build time later (not in this stub but the shape is
 *     the contract).
 */

export type SousEvent =
  // Today + craving
  | { name: "today.search.submitted"; mainDish: string }
  | { name: "today.pairing.viewed"; mainDish: string; sideCount: number }
  | {
      name: "today.questcard.swiped";
      direction: "left" | "right";
      slug: string;
    }
  | { name: "today.questcard.saved"; slug: string }
  // Cook flow
  | { name: "cook.started"; slug: string; isCombined: boolean }
  | {
      name: "cook.completed";
      slug: string;
      durationSec: number;
      rating?: number;
    }
  | { name: "cook.abandoned"; slug: string; lastStep: number }
  // Parent Mode
  | { name: "parent_mode.toggled"; enabled: boolean; ageBand: string }
  | { name: "parent_mode.kid_swap.applied"; slug: string; swap: string }
  | {
      name: "parent_mode.kids_ate_it.logged";
      slug: string;
      verdict: "yes" | "some" | "no";
    }
  | {
      name: "parent_mode.spotlight.shown";
      slug: string;
      nutrient: string;
      tier: string;
    }
  | {
      name: "parent_mode.spice_slider.changed";
      slug: string;
      tolerance: number;
    }
  // Content
  | { name: "content.article.opened"; slug: string }
  | { name: "content.reel.opened"; reelId: string }
  | { name: "content.reel.liked"; reelId: string }
  | { name: "content.research.opened"; slug: string }
  | {
      name: "content.bookmark.toggled";
      kind: string;
      id: string;
      saved: boolean;
    }
  // Auth (post W13)
  | { name: "auth.signed_in"; method: "clerk" }
  | { name: "auth.signed_out" };

let _provider: ((event: SousEvent) => void) | null = null;

/**
 * Lazily wires a real provider when env vars are present. Today this
 * is a no-op; W17 swaps in Sentry breadcrumbs + Vercel Analytics.
 */
function getProvider(): ((event: SousEvent) => void) | null {
  if (_provider !== null) return _provider;
  if (typeof window === "undefined") return null;
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const vaToken = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID;
  if (!sentryDsn && !vaToken) return null;
  // W17 ships the real wiring here. For now: log to console so the
  // event taxonomy is observable during dev when an env hint is set.
  _provider = (event) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[analytics]", event.name, event);
    }
  };
  return _provider;
}

/**
 * Fire-and-forget event. Safe to call from anywhere; SSR-safe (returns
 * early on the server).
 */
export function track(event: SousEvent): void {
  if (typeof window === "undefined") return;
  const provider = getProvider();
  if (!provider) return;
  try {
    provider(event);
  } catch {
    // analytics must never break a user flow
  }
}
