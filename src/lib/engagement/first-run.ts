/**
 * Phase 4 — first-run coachmark gate. A single dismissible, self-clearing flag so
 * the "search a craving to cook your first dish" nudge shows once and never again.
 * Pure localStorage accessors so the gate is unit-testable.
 */

const KEY = "sous-firstrun-seen";

/** True once the coachmark has been seen/dismissed. SSR + errors return true so
 *  the nudge never flashes before hydration or in a privacy-locked browser. */
export function isFirstRunSeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markFirstRunSeen(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // ignore quota / privacy mode
  }
}
