import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db/connection";

// Deploy smoke probe. Reports whether the app is actually talking to
// Supabase (vs. silently serving static/local content) and the seeded
// row counts. Hit GET /api/health on the deployed URL to confirm wiring.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      mode: "local",
      db: "unset",
      note: "No DATABASE_URL / POSTGRES_URL set — serving bundled static content. Add the Supabase connection string (or the Vercel↔Supabase integration) to go live.",
    });
  }

  try {
    const { getDb } = await import("@/lib/db");
    const { sideDishes, meals } = await import("@/lib/db/schema");
    const { count } = await import("drizzle-orm");
    const db = getDb();

    const [sd] = await db.select({ c: count() }).from(sideDishes);
    const [m] = await db.select({ c: count() }).from(meals);

    return NextResponse.json({
      mode: "supabase",
      db: "ok",
      sideDishes: sd?.c ?? 0,
      meals: m?.c ?? 0,
    });
  } catch (err) {
    return NextResponse.json(
      {
        mode: "supabase",
        db: "error",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
