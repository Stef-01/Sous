import { NextResponse } from "next/server";
import { cravingForNow } from "@/lib/engine/craving-for-now";

/**
 * GET /api/wallpaper/today?w=&h= — the ONE stable daily URL (the published iOS
 * Shortcut polls it). Resolves today's craving server-side and 302-redirects to
 * the concrete `/api/wallpaper/[slug]`, preserving the size query.
 */

function dateSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const now = new Date();
  const result = cravingForNow({
    hour: now.getHours(),
    month: now.getMonth(),
    seed: dateSeed(now),
  });
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
