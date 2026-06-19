import { NextResponse } from "next/server";
import { cravingForNow } from "@/lib/engine/craving-for-now";
import { widgetTodaySchema } from "@/types/everywhere";

/**
 * GET /api/widget/today — the single JSON contract every ambient Sous surface
 * consumes: the one most crave-worthy real meal right now + its deep link.
 * Cacheable, no auth (trusted-cohort phase). The future native home/lock
 * widget + Apple Watch glance poll exactly this shape (validated by
 * `widgetTodaySchema`).
 *
 * Optional `?hour=&month=` let a client pass its LOCAL clock (the server clock
 * is UTC on Vercel); otherwise the server clock is used as a best-effort
 * default.
 */

function dateSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function intParam(v: string | null): number | null {
  if (v == null) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const now = new Date();
    const hour = intParam(url.searchParams.get("hour")) ?? now.getHours();
    const month = intParam(url.searchParams.get("month")) ?? now.getMonth();

    const result = cravingForNow({ hour, month, seed: dateSeed(now) });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }
    const payload = widgetTodaySchema.parse(result.data);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "widget unavailable" }, { status: 500 });
  }
}
