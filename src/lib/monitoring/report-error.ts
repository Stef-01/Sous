/**
 * Error-reporting abstraction (founder-gated: Sentry).
 *
 * `reportError()` is the single funnel every catch-site in the app calls. It is
 * dependency-free and works today: in dev it logs to the console; in prod it is
 * a safe no-op UNTIL a real sink is installed. When the founder is ready to wire
 * Sentry, it's one call (see WIRING below) — no catch-site changes.
 *
 * WIRING (one credential drop, rule 12):
 *   1. `pnpm add @sentry/nextjs`
 *   2. set SENTRY_DSN (server) + NEXT_PUBLIC_SENTRY_DSN (client) in the env
 *   3. in a client + a server bootstrap, once:
 *        import * as Sentry from "@sentry/nextjs";
 *        Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
 *        setErrorSink((e, ctx) => Sentry.captureException(e, { extra: ctx }));
 * After that every existing reportError() call flows to Sentry automatically.
 *
 * We deliberately do NOT statically import @sentry here — that would force the
 * dependency now and risk the bundler resolving a missing module. The sink seam
 * keeps the dependency out of the graph until it's genuinely installed.
 */

export type ErrorContext = Record<string, unknown>;
export type ErrorSink = (error: unknown, context?: ErrorContext) => void;

let sink: ErrorSink | null = null;

/** Install the real reporter (e.g. Sentry). Call once at startup. */
export function setErrorSink(fn: ErrorSink | null): void {
  sink = fn;
}

/** True once a monitoring backend DSN is configured via the env contract. */
export function isMonitoringConfigured(): boolean {
  return Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/**
 * Report a caught error. Never throws — error reporting must not become a new
 * source of errors. Without an installed sink: logs in dev, no-ops in prod.
 */
export function reportError(error: unknown, context?: ErrorContext): void {
  try {
    if (sink) {
      sink(error, context);
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("[reportError]", error, context ?? "");
    }
    // prod with no sink → swallow (see WIRING to enable a real backend).
  } catch {
    // Swallow — a failing reporter must never break the app.
  }
}
