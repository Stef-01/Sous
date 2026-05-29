/**
 * Sentry initialisation shell.
 *
 * Stage 2 W17 prep (autonomous-prep stub). Today this no-ops. The
 * surface area (the export, the env-var contract, the call site at
 * app boot) is locked so when the founder installs `@sentry/nextjs`
 * and provides `NEXT_PUBLIC_SENTRY_DSN`, the integration is a single
 * function-body swap — no rewiring across the codebase.
 *
 * Why we DO NOT eagerly import @sentry/nextjs:
 *   - It is not a current dependency. Importing it (even dynamically
 *     with a string variable) trips Next.js / Turbopack's module
 *     resolver at build time and breaks the build.
 *   - W17 is founder-gated. Until the founder runs
 *       pnpm add @sentry/nextjs
 *     and provides the DSN, the shell stays a deliberate no-op.
 *
 * When W17 lands, replace the body of `initSentryIfConfigured()` with:
 *   const Sentry = await import("@sentry/nextjs");
 *   Sentry.init({ dsn, environment: process.env.NODE_ENV,
 *                 tracesSampleRate: 0.1, beforeBreadcrumb: ... });
 * That swap is ~6 lines of code + 1 dependency add.
 */

let _initialized = false;

export async function initSentryIfConfigured(): Promise<void> {
  if (_initialized) return;
  if (typeof window === "undefined") return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  // W17 founder-gated: real Sentry.init() lands here. Until then we
  // mark the shell as initialised so repeat calls are cheap, and emit
  // a single dev-only breadcrumb so the env hint is observable.
  _initialized = true;
  if (process.env.NODE_ENV !== "production") {
    console.debug(
      "[sentry-shell] DSN configured but @sentry/nextjs not installed; W17 swap pending.",
    );
  }
}

/** Exposed for tests + dashboards. */
export function isSentryConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}
