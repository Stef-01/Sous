import { NextResponse } from "next/server";
import { mapOffProduct, type BrandedFood } from "@/lib/nutrition/branded-food";
import { checkRateLimit } from "@/lib/rate-limit/rate-limit";

/**
 * Branded-food search (W20-W21) — proxies Open Food Facts' free-text search
 * server-side (avoids CORS, sets the polite User-Agent OFF asks for, caps the
 * timeout). OFF asks consumers to rate-limit + cache, so we do both: a per-IP
 * window + a CDN cache header on successful results. Maps each product to Sous's
 * per-serving nutrition shape.
 */
export const dynamic = "force-dynamic";

const OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ foods: [] });

  // Be polite to OFF: cap how often one client can fan out searches.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const limit = await checkRateLimit({
    key: `branded-food:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { foods: [], error: "Too many searches — give it a moment." },
      { status: 429 },
    );
  }

  const url =
    `${OFF_SEARCH}?search_terms=${encodeURIComponent(q)}&json=1&page_size=12` +
    `&sort_by=popularity_key&fields=product_name,brands,code,nutriments,serving_size`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Sous/1.0 (cooking-fluency app)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { foods: [], error: "Search is unavailable right now." },
        { status: 502 },
      );
    }
    const data = (await res.json()) as { products?: unknown[] };
    const products = Array.isArray(data.products) ? data.products : [];
    const foods: BrandedFood[] = products
      .map((p) => mapOffProduct(p as Record<string, unknown>))
      .filter((f): f is BrandedFood => f !== null)
      .slice(0, 10);
    // CDN-cache popular queries so repeated searches don't re-hit OFF.
    return NextResponse.json(
      { foods },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { foods: [], error: "Search is unavailable right now." },
      { status: 502 },
    );
  }
}
