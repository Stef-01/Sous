import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

// Lazy imports  -  only load when credentials are available
let _db: unknown = null;
function getDbSafe() {
  if (_db) return _db;
  if (!process.env.DATABASE_URL) return null;
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

export async function createTRPCContext(): Promise<TRPCContext> {
  let userId: string | null = null;
  // Only attempt Clerk auth if keys are configured
  if (process.env.CLERK_SECRET_KEY) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const result = await auth();
      userId = result.userId;
    } catch {
      // Clerk not configured  -  continue as anonymous
    }
  } else {
    // TODO: Re-enable Clerk auth for V1 launch
    // Stub user so protectedProcedures work without real auth
    userId = "mock-user-dev";
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
