import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { MOCK_USER_ID, isAuthEnabled } from "@/lib/auth/auth-flag";

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
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
