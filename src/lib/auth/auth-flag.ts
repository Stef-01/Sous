/**
 * Auth-flag substrate (Y2 Sprint A W1).
 *
 * Pure helpers reading environment variables to decide whether
 * the runtime should attempt Clerk auth or fall back to the
 * mock-user-dev path. The actual `auth()` call lives in
 * `user-context.ts`; this module is just the on/off contract.
 *
 * Two env vars are read:
 *   - `CLERK_SECRET_KEY` — Clerk's required server-side key.
 *     When unset, real auth is not possible (key absent).
 *   - `SOUS_AUTH_ENABLED` — explicit override flag. When
 *     "false" (string), forces the mock path even if Clerk
 *     keys are configured (useful for local dev + tests).
 *
 * Contract:
 *   - Real-auth path: CLERK_SECRET_KEY set AND
 *     SOUS_AUTH_ENABLED !== "false".
 *   - Mock path: anything else.
 *
 * Pure / testable. The reader function takes the env source as
 * a parameter so tests can pass mock values without mutating
 * `process.env`.
 */

export interface AuthEnv {
  CLERK_SECRET_KEY?: string;
  SOUS_AUTH_ENABLED?: string;
}

/** Pure helper: decide whether Clerk auth is enabled given an
 *  env-vars snapshot. Returns true iff the secret key is set
 *  AND the explicit override isn't "false". */
export function isAuthEnabledIn(env: AuthEnv): boolean {
  if (!env.CLERK_SECRET_KEY || env.CLERK_SECRET_KEY.length === 0) {
    return false;
  }
  if (env.SOUS_AUTH_ENABLED === "false") return false;
  return true;
}

/** Convenience for callers: read from the live process env.
 *  Wraps `isAuthEnabledIn` for the common runtime path. */
export function isAuthEnabled(): boolean {
  if (typeof process === "undefined") return false;
  return isAuthEnabledIn({
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    SOUS_AUTH_ENABLED: process.env.SOUS_AUTH_ENABLED,
  });
}

/** The user id used when auth is disabled. Stable across the
 *  process lifetime; documented in `docs/FOUNDER-UNLOCK-RUNBOOK.md`
 *  entry #4. */
export const MOCK_USER_ID = "mock-user-dev";
