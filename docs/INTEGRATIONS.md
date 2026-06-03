# Integrations — env contracts for the founder-gated services

> Each service below has its **abstraction + wiring stub + env contract** in the
> repo already (rule 12). The app runs today with a safe fallback for every one;
> turning a service ON is the single credential drop noted under it. Nothing in
> the app's call-sites changes when a service goes live.

Set these in Vercel → Project → Environment Variables (never commit secrets).

---

## Error monitoring — Sentry

**Abstraction:** `src/lib/monitoring/report-error.ts` (`reportError()` is the
single funnel; already called from the React `ErrorBoundary`, the tRPC
`errorFormatter`, and the `safeAI` AI-fallback wrapper).

**Today:** logs in dev, no-ops in prod.

**Env contract:**

| Var                      | Scope  | Purpose             |
| ------------------------ | ------ | ------------------- |
| `SENTRY_DSN`             | server | server-side capture |
| `NEXT_PUBLIC_SENTRY_DSN` | client | browser capture     |

**Go live (one drop):**

```bash
pnpm add @sentry/nextjs
```

```ts
// in a client + a server bootstrap, once:
import * as Sentry from "@sentry/nextjs";
import { setErrorSink } from "@/lib/monitoring/report-error";
Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
setErrorSink((e, ctx) => Sentry.captureException(e, { extra: ctx }));
```

Every existing `reportError()` call then flows to Sentry automatically.

---

## Rate limiting — Upstash Redis

**Abstraction:** `src/lib/rate-limit/rate-limit.ts` (`checkRateLimit()`) +
`rateLimitedProcedure()` in `src/lib/trpc/server.ts`. Already applied to the
paid AI endpoints: `pairing.suggest` + `pairing.rerollSide` (30/min/device,
shared bucket) and `recognition.identify` (15/min/device). Keyed by the
device-scoped `ctx.userId`. **Fail-open** by contract.

**Today:** in-memory sliding window — real per-instance burst protection on a
warm serverless instance.

**Env contract:**

| Var                        | Scope  | Purpose              |
| -------------------------- | ------ | -------------------- |
| `UPSTASH_REDIS_REST_URL`   | server | global limiter store |
| `UPSTASH_REDIS_REST_TOKEN` | server | auth                 |

**Go live:** implement the `upstashLimiter()` seam in `rate-limit.ts` (a single
`fetch` to the Upstash REST API — no SDK required) and flip the commented
`if (hasDistributedLimiter()) return upstashLimiter(opts)` line. Limits then
apply globally across instances instead of per-instance.

---

## Image storage — Supabase Storage (R2 superseded)

The roadmap's "Cloudflare R2" item is **superseded by Supabase Storage**, which
is already implemented: `src/lib/storage/upload-cook-photo.ts` uploads Win-screen
photos to the `cook-photos` bucket, best-effort with a null fallback (the cook is
never blocked by an upload failure). No further wiring is required beyond the
Supabase env already documented in `docs/SUPABASE-SETUP.md`. If a CDN/egress
reason to move to R2 ever arises, swap the body of `uploadCookPhoto()` — the
call-site contract (`(file, ownerId) => Promise<string | null>`) stays the same.

---

## Auth — Clerk

Provider (`src/components/auth-provider.tsx`) + middleware + the
`isAuthEnabled()` flag are wired; `createTRPCContext` already prefers a real
Clerk `userId` when the flag is on and falls back to the device id otherwise.

**Env contract:** `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
`SOUS_AUTH_ENABLED=1`.
