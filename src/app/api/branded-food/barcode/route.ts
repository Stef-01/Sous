import { NextResponse } from "next/server";
import { mapOffProduct } from "@/lib/nutrition/branded-food";
import { checkRateLimit } from "@/lib/rate-limit/rate-limit";

/**
 * Barcode lookup (#14) — proxies Open Food Facts' product-by-code endpoint
 * server-side (same conventions as ./search: polite User-Agent, per-IP rate
 * window, CDN cache, the shared mapOffProduct mapper so a scanned product and
 * a searched product are byte-identical shapes).
 */
export const dynamic = "force-dynamic";

const OFF_PRODUCT = "https://world.openfoodfacts.org/api/v2/product";

export async function GET(request: Request) {
  const code =
    new URL(request.url).searchParams.get("code")?.replace(/\D/g, "") ?? "";
  if (code.length < 8 || code.length > 14) {
    return NextResponse.json({ food: null, error: "Not a valid barcode." });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const limit = await checkRateLimit({
    key: `barcode:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { food: null, error: "Too many scans — give it a moment." },
      { status: 429 },
    );
  }

  try {
    const res = await fetch(
      `${OFF_PRODUCT}/${code}.json?fields=product_name,brands,code,nutriments,serving_size`,
      {
        headers: { "User-Agent": "Sous/1.0 (cooking-fluency app)" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { food: null, error: "Lookup is unavailable right now." },
        { status: 502 },
      );
    }
    const data = (await res.json()) as {
      status?: number;
      product?: Record<string, unknown>;
    };
    const food =
      data.status === 1 && data.product ? mapOffProduct(data.product) : null;
    return NextResponse.json(
      { food, error: food ? undefined : "No product found for that code." },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { food: null, error: "Lookup is unavailable right now." },
      { status: 502 },
    );
  }
}
