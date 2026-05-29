"use client";

/**
 * /eat-out — Michelin-Guide-style dish-first venue surface
 * (Y5 J, per Sprint J in `docs/YEAR-5-VIBECODE-PLAN.md`).
 *
 * The substrate ships first: 4 venues × 2 dishes = 8 cards in
 * `src/data/eat-out-fixtures.ts`. The intelligence-layer profile
 * boosts dishes whose cuisine + flavor tags overlap the user's
 * inferred + manual preferences.
 *
 * Real Yelp / Google Places API integration is Y7 K; until then
 * the fixtures are clearly badged "Curated picks" so the user
 * never mistakes them for a live local-restaurant search.
 *
 * Surface shape:
 *   - Card stack (one card visible, swipe-back/forward)
 *   - Each card = dish hero + venue meta + "Why here" reveal +
 *     "Save for later" + "Open map link" actions
 *   - Cuisine filter chips above the stack
 *   - Empty state when filter excludes everything
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { EAT_OUT_DISHES, EAT_OUT_VENUES } from "@/data/eat-out-fixtures";
import { rankEatOut } from "@/lib/eat-out/ranking";
import { usePreferenceProfile } from "@/lib/hooks/use-preference-profile";
import type { EatOutCard } from "@/types/eat-out";
import { cn } from "@/lib/utils/cn";

const CUISINE_FILTERS: ReadonlyArray<{ id: string | null; label: string }> = [
  { id: null, label: "For you" },
  { id: "italian", label: "Italian" },
  { id: "chinese", label: "Chinese" },
  { id: "american", label: "American" },
  { id: "comfort-classic", label: "Tasting" },
];

export default function EatOutPage() {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const { merged, mounted } = usePreferenceProfile();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const cards = useMemo<EatOutCard[]>(
    () =>
      rankEatOut({
        dishes: EAT_OUT_DISHES,
        venues: EAT_OUT_VENUES,
        profile: mounted ? merged : null,
        cuisineFilter: activeFilter,
      }),
    [mounted, merged, activeFilter],
  );

  // Clamp the index whenever the deck changes (filter switch).
  const safeIndex = Math.min(index, Math.max(0, cards.length - 1));
  const card = cards[safeIndex] ?? null;

  const handleNext = () => {
    if (cards.length === 0) return;
    setIndex((i) => (i + 1) % cards.length);
  };
  const handlePrev = () => {
    if (cards.length === 0) return;
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)] pb-28">
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href="/today"
            aria-label="Back to Today"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
              Eat Out
            </p>
            <h1 className="font-serif text-lg font-semibold leading-tight text-[var(--nourish-dark)]">
              Curated picks tonight
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {/* Cuisine filter chips */}
        <div
          role="radiogroup"
          aria-label="Filter by cuisine"
          className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex gap-2 whitespace-nowrap">
            {CUISINE_FILTERS.map((f) => {
              const active = f.id === activeFilter;
              return (
                <li key={f.label}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setActiveFilter(f.id);
                      setIndex(0);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                      active
                        ? "border-[var(--nourish-green)] bg-[var(--nourish-green)] text-white"
                        : "border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-subtext)] hover:bg-neutral-50",
                    )}
                  >
                    {f.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {card ? (
          <>
            <p className="px-1 text-[11px] text-[var(--nourish-subtext)]">
              Card {safeIndex + 1} of {cards.length} ·{" "}
              <span className="font-semibold text-[var(--nourish-green)]">
                Curated picks
              </span>
              {" — "}live restaurant search arrives in Y7 K.
            </p>

            <AnimatePresence mode="wait">
              <DishCard key={card.dish.slug} card={card} />
            </AnimatePresence>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous card"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] hover:border-neutral-300 disabled:opacity-50"
                disabled={cards.length <= 1}
              >
                <ChevronLeft size={18} />
              </button>
              <p
                className="text-[11px] uppercase tracking-[0.14em] text-[var(--nourish-subtext)]"
                aria-live="polite"
              >
                Swipe through the deck
              </p>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next card"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)] disabled:opacity-50"
                disabled={cards.length <= 1}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <section className="rounded-2xl border border-dashed border-neutral-200/80 bg-white/40 p-6 text-center">
            <p className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
              Nothing in that cuisine yet.
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-[var(--nourish-subtext)]">
              The curated set is small — try a different filter, or jump back to
              &ldquo;For you&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)] px-3 py-1.5 text-[12px] font-semibold text-white"
            >
              Show everything
              <ArrowRight size={12} aria-hidden />
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function DishCard({ card }: { card: EatOutCard }) {
  const { dish, venue, score } = card;
  const isPlaceholder = dish.imageUrl.startsWith("placeholder:");
  const emoji = isPlaceholder
    ? dish.imageUrl.slice("placeholder:".length) || "🍽️"
    : null;

  return (
    <motion.article
      key={dish.slug}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="space-y-3 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
    >
      {/* Hero */}
      {emoji ? (
        <div className="flex h-36 w-full items-center justify-center rounded-xl bg-gradient-to-br from-[var(--nourish-cream)] to-white text-6xl shadow-inner">
          <span aria-hidden>{emoji}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- public/ paths or external; avoiding next/image ceremony for the curated stack
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="h-36 w-full rounded-xl object-cover shadow-inner"
        />
      )}

      {/* Title block */}
      <header className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--nourish-green)]">
          {venue.priceTier} · {dish.cuisineFamily}
        </p>
        <h2 className="font-serif text-xl font-semibold leading-tight text-[var(--nourish-dark)]">
          {dish.name}
        </h2>
        <p className="flex items-center gap-1 text-[12px] text-[var(--nourish-subtext)]">
          <MapPin size={11} aria-hidden />
          <span className="font-semibold text-[var(--nourish-dark)]">
            {venue.name}
          </span>
          <span>·</span>
          <span>
            {venue.city}, {venue.country}
          </span>
        </p>
      </header>

      {/* Why here */}
      <p className="text-[13px] leading-snug text-[var(--nourish-dark)]">
        {dish.whyHere}
      </p>

      {/* Vibe */}
      <p className="rounded-lg bg-[var(--nourish-cream)] px-3 py-2 text-[11px] leading-snug text-[var(--nourish-subtext)]">
        {venue.vibe}
      </p>

      {/* Score footer */}
      <footer className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-[11px] text-[var(--nourish-subtext)]">
        <span>
          Match score{" "}
          <span className="font-semibold tabular-nums text-[var(--nourish-dark)]">
            {Math.round(score * 100)}%
          </span>
        </span>
        <span>
          {venue.priceTier} · ${dish.priceUsd}
        </span>
      </footer>
    </motion.article>
  );
}
