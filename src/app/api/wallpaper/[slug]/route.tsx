import { ImageResponse } from "next/og";
import mealsData from "@/data/meals.json";
import { wallpaperParamsSchema } from "@/types/everywhere";

/**
 * GET /api/wallpaper/[slug]?w=&h= — a generated craving wallpaper for a real
 * meal: the plated hero photo full-bleed (or a tasteful cuisine gradient when
 * the dish has no photo) under a "tonight you're making" caption, sized to the
 * device. Honest by construction — it never synthesizes food imagery (rule 7):
 * an unknown slug 404s, and the no-photo branch is gradient + type only.
 *
 * The user SAVES this and sets it themselves; a web app cannot set the OS
 * wallpaper (see /everywhere copy + docs/SOUS-EVERYWHERE.md).
 */

export const runtime = "nodejs";

interface MealRecord {
  id: string;
  name: string;
  cuisine: string;
  heroImageUrl?: string | null;
}

const BY_ID = new Map(
  (mealsData as unknown as MealRecord[]).map((m) => [m.id, m]),
);

// Hex mirror of CUISINE_GRADIENTS (src/components/today/dish-image.tsx) —
// ImageResponse can't read CSS vars or the React fallback component.
const CUISINE_GRADIENTS: Record<string, string> = {
  japanese: "linear-gradient(135deg, #c0392b 0%, #e74c3c 30%, #f39c12 100%)",
  korean: "linear-gradient(135deg, #d63031 0%, #e17055 40%, #fdcb6e 100%)",
  thai: "linear-gradient(135deg, #00b894 0%, #55efc4 40%, #ffeaa7 100%)",
  chinese: "linear-gradient(135deg, #d63031 0%, #e74c3c 35%, #f9ca24 100%)",
  vietnamese: "linear-gradient(135deg, #27ae60 0%, #2ecc71 40%, #f1c40f 100%)",
  filipino: "linear-gradient(135deg, #e17055 0%, #fab1a0 40%, #ffeaa7 100%)",
  indian: "linear-gradient(135deg, #e67e22 0%, #f39c12 35%, #f1c40f 100%)",
  italian: "linear-gradient(135deg, #27ae60 0%, #f1f1f1 50%, #e74c3c 100%)",
  mexican: "linear-gradient(135deg, #00b894 0%, #f1f1f1 50%, #d63031 100%)",
  mediterranean:
    "linear-gradient(135deg, #0984e3 0%, #74b9ff 40%, #ffeaa7 100%)",
  american: "linear-gradient(135deg, #b23b3b 0%, #efe9dd 50%, #2e5a8c 100%)",
};

function gradientFor(cuisine: string): string {
  return (
    CUISINE_GRADIENTS[(cuisine || "").toLowerCase()] ??
    "linear-gradient(135deg, #2d5a3d 0%, #4a8c5c 40%, #a8d8b9 100%)"
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const meal = BY_ID.get(slug);
  // Rule 7: only ever render a real catalog dish.
  if (!meal) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  // `.catch()` in the schema clamps/defaults any bad value, so parse never throws.
  const { w, h } = wallpaperParamsSchema.parse({
    w: url.searchParams.get("w"),
    h: url.searchParams.get("h"),
  });

  // Resolve the hero photo against the request origin so it works in dev
  // (localhost) and prod alike. The cuisine gradient is ALWAYS the under-layer,
  // so if the photo fetch fails the wallpaper degrades to the gradient + caption
  // (never a blank dark screen) — and the no-photo branch is gradient + type
  // only, which is why this route can never synthesize food imagery (rule 7).
  const bgImage = meal.heroImageUrl
    ? `${url.origin}${meal.heroImageUrl}`
    : null;
  const padX = Math.round(w * 0.08);
  const padBottom = Math.round(h * 0.14);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        position: "relative",
        background: gradientFor(meal.cuisine),
      }}
    >
      {bgImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgImage}
          alt=""
          width={w}
          height={h}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : null}

      {/* Scrim for caption contrast (present in both branches). */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "60%",
          display: "flex",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: `0 ${padX}px ${padBottom}px ${padX}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: Math.round(w * 0.036),
            letterSpacing: Math.round(w * 0.004),
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.82)",
            fontWeight: 600,
          }}
        >
          Tonight you&rsquo;re making
        </div>
        <div
          style={{
            display: "flex",
            fontSize: Math.round(w * 0.092),
            color: "#ffffff",
            fontWeight: 800,
            lineHeight: 1.04,
            marginTop: Math.round(h * 0.012),
            maxWidth: "92%",
          }}
        >
          {meal.name}
        </div>
      </div>
    </div>,
    { width: w, height: h },
  );
}
