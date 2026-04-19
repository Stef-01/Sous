import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Star, ChefHat } from "lucide-react";
import {
  getStaticCookData,
  getStaticMealCookData,
  type StaticDishData,
} from "@/data/guided-cook-steps";

/** Gift page  -  a read-only preview of a dish a friend has sent you.
 *
 *  Opens anonymously at `/gift/<slug>?from=<firstname>&stars=<rating>`. No
 *  signup wall, no auth  -  the whole point is that a recipient can see what
 *  their friend cooked and enjoyed, and the single CTA drops them into
 *  Today with the dish pre-cued so they can try it themselves.
 *
 *  If the slug doesn't match a real dish we 404. We never render user-
 *  supplied content except for the first-name greeting (escaped via React)
 *  and the clamped star count (parsed to int, bounded 0..5). */

interface GiftPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; stars?: string }>;
}

function lookupDish(slug: string): StaticDishData | null {
  return getStaticCookData(slug) ?? getStaticMealCookData(slug);
}

function clampStars(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, n));
}

function safeFirstName(raw: string | undefined): string {
  if (!raw) return "A friend";
  // Allow letters/numbers/spaces/hyphens/apostrophes  -  strip anything else
  // and clamp length so nobody can jam rendering with a novel.
  const cleaned = raw.replace(/[^\p{L}\p{N}\s'\-]/gu, "").trim();
  return cleaned.slice(0, 24) || "A friend";
}

export default async function GiftPage({
  params,
  searchParams,
}: GiftPageProps) {
  const { slug } = await params;
  const { from, stars } = await searchParams;
  const dish = lookupDish(slug);
  if (!dish) notFound();

  const senderName = safeFirstName(from);
  const starCount = clampStars(stars);
  const totalMins = dish.prepTimeMinutes + dish.cookTimeMinutes;

  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)]">
      <main className="mx-auto flex max-w-md flex-col gap-5 px-5 py-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
            <ChefHat
              size={22}
              className="text-[var(--nourish-green)]"
              strokeWidth={1.8}
            />
          </div>
          <p className="text-xs uppercase tracking-wider text-[var(--nourish-subtext)]">
            A cook from {senderName}
          </p>
          <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
            {senderName} cooked{" "}
            <span className="text-[var(--nourish-green)]">{dish.name}</span>
            {starCount >= 4 ? " and loved it." : "."}
          </h1>
          {starCount > 0 && (
            <div
              className="flex items-center gap-0.5 pt-0.5"
              aria-label={`${senderName} rated this ${starCount} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i <= starCount
                      ? "fill-[var(--nourish-gold)] text-[var(--nourish-gold)]"
                      : "fill-neutral-100 text-neutral-200"
                  }
                />
              ))}
            </div>
          )}
        </header>

        {/* Dish card  -  read-only preview */}
        <section
          aria-label={`${dish.name} preview`}
          className="overflow-hidden rounded-3xl border border-[var(--nourish-border-strong)] bg-white shadow-sm"
        >
          {dish.heroImageUrl ? (
            <div
              aria-hidden
              className="h-44 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${dish.heroImageUrl})` }}
            />
          ) : (
            <div
              aria-hidden
              className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[var(--nourish-green)]/10 to-[var(--nourish-warm)]/10 text-4xl"
            >
              🍽️
            </div>
          )}
          <div className="space-y-3 p-5">
            <p className="text-sm leading-relaxed text-[var(--nourish-dark)]">
              {dish.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--nourish-subtext)]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-cream)] px-2.5 py-1">
                <Clock size={12} />
                {totalMins} min
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-cream)] px-2.5 py-1 capitalize">
                {dish.cuisineFamily}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-cream)] px-2.5 py-1 capitalize">
                {dish.skillLevel}
              </span>
            </div>
          </div>
        </section>

        {/* Single CTA  -  no signup wall, lands on Today with the dish cued */}
        <Link
          href={`/today?craving=${encodeURIComponent(dish.name)}`}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--nourish-green)] py-4 text-base font-semibold text-white shadow-sm shadow-[var(--nourish-green)]/20 transition-colors hover:bg-[var(--nourish-dark-green)]"
        >
          Cook this too
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>

        <p className="text-center text-[11px] text-[var(--nourish-subtext)]">
          Sous - one screen, one action, one win.
        </p>
      </main>
    </div>
  );
}
