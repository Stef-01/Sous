import { NextResponse } from "next/server";
import { cravingForNow } from "@/lib/engine/craving-for-now";

/**
 * GET /api/wallpaper/today?w=&h=&hour=&month= — the ONE stable daily URL (the
 * published iOS Shortcut polls it). Resolves today's craving and 302-redirects
 * to the concrete `/api/wallpaper/[slug]`, preserving the size query.
 *
 * The server clock is UTC on Vercel, which would pick the wrong daypart pool for
 * the western hemisphere (a Pacific 8pm reads as UTC-morning → breakfast). So
 * the Shortcut/native client should pass its LOCAL `?hour=&month=`; absent them
 * we fall back to the server clock as a best effort (same contract as
 * /api/widget/today).
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
  const url = new URL(req.url);
  const now = new Date();
  const hour = intParam(url.searchParams.get("hour")) ?? now.getHours();
  const month = intParam(url.searchParams.get("month")) ?? now.getMonth();
  const result = cravingForNow({ hour, month, seed: dateSeed(now) });
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }
  const target = new URL(`/api/wallpaper/${result.data.slug}`, url.origin);
  const w = url.searchParams.get("w");
  const h = url.searchParams.get("h");
  if (w) target.searchParams.set("w", w);
  if (h) target.searchParams.set("h", h);
  // 302 (not 301) — the daily target changes; never cache the redirect itself.
  return NextResponse.redirect(target, { status: 302 });
}
