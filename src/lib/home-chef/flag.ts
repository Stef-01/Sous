/**
 * Home-Chef surplus-meal feature flag — STRATEGY §12.11 (PARKED, founder-gated).
 *
 * DEFAULT OFF. The surplus-specials rail renders NOTHING to users until a real
 * partner feed exists — no fake marketplace shipped (depth-over-speed). The
 * founder unlock is a single env var; a dev override (localStorage / query)
 * lets us exercise the wired stub locally, mirroring the diegetic-room flag.
 *
 * Pure core (`isHomeChefEnabled`) + thin readers. No dependencies.
 */

export interface HomeChefEnv {
  /** Founder unlock: set to "true" when a real partner surplus feed is live.
   *  NEXT_PUBLIC_ so the client rail can read it. */
  NEXT_PUBLIC_SOUS_HOME_CHEF_ENABLED?: string | undefined;
}

/** Pure: is the home-chef rail enabled by environment? Only "true" enables. */
export function isHomeChefEnabled(env: HomeChefEnv): boolean {
  return env.NEXT_PUBLIC_SOUS_HOME_CHEF_ENABLED === "true";
}

/** Pure: read the flag env from process.env (empty when unavailable). */
export function readHomeChefEnv(): HomeChefEnv {
  if (typeof process === "undefined" || process.env == null) return {};
  return {
    NEXT_PUBLIC_SOUS_HOME_CHEF_ENABLED:
      process.env.NEXT_PUBLIC_SOUS_HOME_CHEF_ENABLED,
  };
}

/** Local dev override key — same shape as the diegetic-room flag. */
export const HOME_CHEF_DEV_FLAG = "sous-home-chef-v1";

/**
 * Client-side resolution: enabled if the env flag is "true" OR a local dev
 * override is set (`localStorage["sous-home-chef-v1"] = "1"`, or `?homechef=1`).
 * Default OFF. Safe on the server (returns the env-only answer).
 */
export function isHomeChefEnabledClient(): boolean {
  if (isHomeChefEnabled(readHomeChefEnv())) return true;
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(HOME_CHEF_DEV_FLAG) === "1") return true;
    const q = new URLSearchParams(window.location.search);
    if (q.get("homechef") === "1") {
      // sticky for the session so navigation keeps it on
      window.localStorage.setItem(HOME_CHEF_DEV_FLAG, "1");
      return true;
    }
  } catch {
    /* storage disabled — stay OFF */
  }
  return false;
}
