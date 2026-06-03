import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { MOCK_USER_ID, isAuthEnabled } from "@/lib/auth/auth-flag";
import { reportError } from "@/lib/monitoring/report-error";
import { checkRateLimit } from "@/lib/rate-limit/rate-limit";

// Lazy imports  -  only load when credentials are available
let _db: unknown = null;
function getDbSafe() {
  if (_db) return _db;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { hasDatabaseUrl } = require("@/lib/db/connection");
  if (!hasDatabaseUrl()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dbModule = require("@/lib/db");
    _db = dbModule.db;
    return _db;
  } catch {
    return null;
  }
}

export type TRPCContext = {
  db: unknown;
  userId: string | null;
};

export async function createTRPCContext(opts?: {
  req?: Request;
}): Promise<TRPCContext> {
  let userId: string | null = null;
  // Y2 Sprint A W1: auth-flag substrate. isAuthEnabled() reads
  // CLERK_SECRET_KEY + SOUS_AUTH_ENABLED override. When the
  // flag is on we attempt the real Clerk auth; when off we use the
  // device-scoped anonymous id (MVP identity — see
  // docs/MVP-FEATURE-PLAN.md Stage A) so per-device data has an owner
  // without login, falling back to the stable mock user.
  if (isAuthEnabled()) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const result = await auth();
      userId = result.userId;
    } catch {
      // Clerk import / call failed - continue as anonymous so
      // requests don't 500 in transient configurations.
    }
  } else {
    const deviceId = opts?.req?.headers.get("x-sous-device-id")?.trim();
    userId =
      deviceId && deviceId.length > 0 ? deviceId.slice(0, 100) : MOCK_USER_ID;
  }
  return { db: getDbSafe(), userId };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Funnel only UNEXPECTED server errors to the reporter — not the expected
    // BAD_REQUEST (Zod) / NOT_FOUND / UNAUTHORIZED / TOO_MANY_REQUESTS paths,
    // which are normal control flow, not incidents.
    if (error.code === "INTERNAL_SERVER_ERROR") {
      reportError(error.cause ?? error, {
        source: "trpc",
        path: shape.data?.path,
      });
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

/**
 * Rate-limited procedure factory (founder-gated scale: Upstash). Keys by the
 * per-device ctx.userId so anonymous callers are still bucketed, throttling
 * cost-sensitive endpoints (Vision / Claude). Fail-open: the limiter itself
 * never 500s a request. In-memory by default (per-instance burst protection);
 * one env drop (UPSTASH_REDIS_REST_URL/TOKEN) makes it global — see
 * src/lib/rate-limit/rate-limit.ts.
 */
export function rateLimitedProcedure(opts: {
  bucket: string;
  limit: number;
  windowMs: number;
}) {
  return t.procedure.use(async ({ ctx, next }) => {
    const key = `${opts.bucket}:${ctx.userId ?? "anon"}`;
    const result = await checkRateLimit({
      key,
      limit: opts.limit,
      windowMs: opts.windowMs,
    });
    if (!result.allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "You're going a little fast — give it a few seconds.",
      });
    }
    return next();
  });
}
