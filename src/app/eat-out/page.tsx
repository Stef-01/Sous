"use client";

/**
 * /eat-out — Stanford-area demo (founder-directed prototype, 2026-06-10).
 *
 * Photo-led venue list → dish sheet → ONE-TAP LOG into the same diary every
 * other surface reads (brand = restaurant, estimates marked approximated).
 * The "Fits goals" filter and per-dish goal badges run off the user's REAL
 * starred nutrients, so eating out plugs into the same goal loop as cooking.
 *
 * Replaces the Y5 card-stack fixtures (L'Artusi/Noma — wrong continent for a
 * "near me" surface). Live Places/hours integration remains Y7; this set is
 * clearly badged as curated demo picks.
 */

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  MapPin,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import {
  STANFORD_VENUES,
  ALL_CUISINES,
  demoDishToBrandedFood,
  type DemoVenue,
  type DemoDish,
} from "@/data/eat-out/stanford-demo";
import { diaryLogBranded } from "@/lib/hooks/use-nutrition-diary";
import { useNutrientGoals } from "@/lib/hooks/use-nutrient-goals";
import { usePreferenceProfile } from "@/lib/hooks/use-preference-profile";
import { dishToFacets } from "@/lib/intelligence/dish-to-facets";
import { toast } from "@/lib/hooks/use-toast";
import { haptic } from "@/lib/motion/haptics";
import { cn } from "@/lib/utils/cn";

/** Starred nutrient keys → the demo dishes' goal-fit tag vocabulary. */
const STAR_TO_TAG: Record<string, DemoDish["tags"][number]> = {
  omega3_g: "omega-3",
  iron_mg: "iron",
  fiber_g: "fiber",
};

/** Demo venue cuisine string → the preference profile's lowercase family key. */
const CUISINE_KEY: Record<string, string> = {
  "pakistani-indian": "indian",
  israeli: "mediterranean",
};
function cuisineKeyFor(cuisine: string): string {
  const k = cuisine.toLowerCase();
  return CUISINE_KEY[k] ?? k;
}
/** A cuisine the user demonstrably leans toward (weight ∈ [-1,1]). */
const TASTE_MATCH = 0.25;
/** Enough signal to lead with a "for your taste" hero. */
const TASTE_HERO = 0.18;

function walkOrDrive(km: number): string {
  if (km <= 3) return `${Math.round(km * 12)} min walk`;
  return `${Math.max(4, Math.round(km * 2.5))} min drive`;
}

/**
 * A single dish, as an individually-selectable object: hover highlights it, click
 * selects it (green object-box) and drills into its blurb + the Log action.
 */
function DishObject({
  dish,
  fits,
  selected,
  onSelect,
  onLog,
}: {
  dish: DemoDish;
  fits: boolean;
  selected: boolean;
  onSelect: () => void;
  onLog: () => void;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-colors",
        selected
          ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]/[0.06] ring-2 ring-[var(--nourish-green)]/25"
          : "border-neutral-200/80 bg-white hover:border-[var(--nourish-green)]/55",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={selected}
        className="flex w-full items-center gap-3 p-2.5 text-left"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[13.5px] font-semibold text-[var(--nourish-dark)]">
              {dish.name}
            </p>
            <span className="shrink-0 text-[12px] font-medium text-[var(--nourish-subtext)]">
              ${dish.priceUsd}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="text-[11px] font-semibold tabular-nums text-[var(--nourish-dark)]">
              ~{dish.kcal} kcal
            </span>
            <span className="text-[11px] tabular-nums text-[var(--nourish-subtext-faint)]">
              P{dish.protein_g}·C{dish.carbs_g}·F{dish.fat_g}
            </span>
            {fits && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--nourish-gold)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--nourish-gold)]">
                <Star size={8} className="fill-[var(--nourish-gold)]" /> goal
                fit
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          size={16}
          aria-hidden
          className={cn(
            "shrink-0 text-[var(--nourish-subtext-faint)] transition-transform",
            selected && "rotate-180",
          )}
        />
      </button>
      {selected && (
        <div className="px-2.5 pb-2.5">
          <p className="text-[12px] leading-snug text-[var(--nourish-subtext)]">
            {dish.blurb}
          </p>
          <button
            type="button"
            onClick={onLog}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--nourish-green)] px-4 py-2 text-[12px] font-semibold text-white transition active:scale-[0.96] motion-reduce:active:scale-100"
          >
            <Plus size={13} aria-hidden /> Log this dish
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * A single venue, as an individually-selectable object: hover highlights it, click
 * selects it (gold object-box) and drills its dishes inline (each a DishObject).
 */
function VenueObject({
  venue,
  hero = false,
  reason = null,
  tasteHit,
  goalHit,
  open,
  onToggle,
  children,
}: {
  venue: DemoVenue;
  hero?: boolean;
  reason?: string | null;
  tasteHit: boolean;
  goalHit: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-sm transition-colors",
        open
          ? "border-2 border-[var(--nourish-gold)] ring-2 ring-[var(--nourish-gold)]/30"
          : hero
            ? "border-2 border-[var(--nourish-gold)]/45 hover:border-[var(--nourish-gold)]/70"
            : "border border-neutral-200 hover:border-[var(--nourish-gold)]/45",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="block w-full text-left"
      >
        <div className={cn("relative w-full", hero ? "h-52" : "h-40")}>
          <Image
            src={venue.heroImage ?? venue.dishes[0].image}
            alt={venue.name}
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover"
          />
          <div
            className={cn(
              "absolute inset-0",
              hero
                ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                : "bg-gradient-to-t from-black/72 to-transparent",
            )}
          />
          {hero ? (
            <span className="absolute left-4 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--nourish-gold)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">
              <Sparkles size={11} aria-hidden /> For your taste
            </span>
          ) : (
            tasteHit && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--nourish-gold)]/95 px-2.5 py-1 text-[11px] font-semibold text-white">
                <Sparkles size={10} aria-hidden /> Your kind of spot
              </span>
            )
          )}
          {goalHit && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-[var(--nourish-dark)]">
              <Star
                size={10}
                className="fill-[var(--nourish-gold)] text-[var(--nourish-gold)]"
              />
              Fits your goals
            </span>
          )}
          <div className="absolute bottom-3 left-4 right-12">
            {hero && reason && (
              <p className="text-[11.5px] font-semibold text-white/85">
                {reason}
              </p>
            )}
            <h2
              className={cn(
                "font-serif font-semibold leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,.6)]",
                hero ? "text-[26px]" : "text-[20px]",
              )}
            >
              {venue.name}
            </h2>
            <p className="mt-0.5 text-[12px] font-medium text-white/85">
              {venue.cuisine} · {walkOrDrive(venue.distanceKm)} · {venue.price}
            </p>
          </div>
          <ChevronDown
            size={20}
            aria-hidden
            className={cn(
              "absolute bottom-3 right-3 text-white/90 transition-transform [filter:drop-shadow(0_1px_1px_rgba(0,0,0,.55))]",
              open && "rotate-180",
            )}
          />
        </div>
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-neutral-100 bg-[var(--nourish-cream)]/50 p-2">
          {children}
        </div>
      )}
    </div>
  );
}

export default function EatOutPage() {
  const router = useRouter();
  const { stars } = useNutrientGoals();
  const { merged, recordSignal } = usePreferenceProfile();
  const tasteScore = (v: DemoVenue) =>
    merged.cuisines[cuisineKeyFor(v.cuisine)] ?? 0;
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [goalsOnly, setGoalsOnly] = useState(false);
  // Selection state: which venue is drilled-open (the gold object-box), and which
  // dish inside it is selected (the green object-box). Single-select at each level.
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const toggleVenue = (slug: string) => {
    setSelectedDish(null);
    setExpandedVenue((prev) => (prev === slug ? null : slug));
  };
  const toggleDish = (slug: string) =>
    setSelectedDish((prev) => (prev === slug ? null : slug));

  const goalTags = useMemo(() => {
    const tags = new Set<DemoDish["tags"][number]>();
    for (const key of stars) {
      const tag = STAR_TO_TAG[key];
      if (tag) tags.add(tag);
    }
    return tags;
  }, [stars]);

  const dishFitsGoals = (dish: DemoDish) =>
    dish.tags.some((t) => goalTags.has(t));

  // Featured bar — every dish across the area, swipeable; goal-fit dishes
  // lead, then nearest venue. Tap = open that venue's sheet.
  const featured = useMemo(() => {
    const all = STANFORD_VENUES.flatMap((venue) =>
      venue.dishes.map((dish) => ({ dish, venue })),
    );
    return all
      .sort((a, b) => {
        const af = a.dish.tags.some((t) => goalTags.has(t)) ? 1 : 0;
        const bf = b.dish.tags.some((t) => goalTags.has(t)) ? 1 : 0;
        if (af !== bf) return bf - af;
        return a.venue.distanceKm - b.venue.distanceKm;
      })
      .slice(0, 14);
  }, [goalTags]);

  // "Your taste, near you": lead with cuisines you lean toward (from your real
  // cook/log signals via usePreferenceProfile), then nearest. Falls back to pure
  // distance at cold-start (all weights ~0). The strongest match (>= TASTE_HERO)
  // becomes the editorial hero above the list.
  const topMatch = useMemo(() => {
    if (cuisine || goalsOnly) return null; // only on the default view
    const best = [...STANFORD_VENUES].sort(
      (a, b) =>
        (merged.cuisines[cuisineKeyFor(b.cuisine)] ?? 0) -
        (merged.cuisines[cuisineKeyFor(a.cuisine)] ?? 0),
    )[0];
    return best &&
      (merged.cuisines[cuisineKeyFor(best.cuisine)] ?? 0) >= TASTE_HERO
      ? best
      : null;
  }, [merged, cuisine, goalsOnly]);

  const venues = useMemo(() => {
    let list = [...STANFORD_VENUES].sort((a, b) => {
      const ta = merged.cuisines[cuisineKeyFor(a.cuisine)] ?? 0;
      const tb = merged.cuisines[cuisineKeyFor(b.cuisine)] ?? 0;
      if (Math.abs(tb - ta) > 0.05) return tb - ta; // real taste signal leads
      return a.distanceKm - b.distanceKm; // else nearest
    });
    if (cuisine) list = list.filter((v) => v.cuisine === cuisine);
    if (goalsOnly && goalTags.size > 0)
      list = list.filter((v) =>
        v.dishes.some((dd) => dd.tags.some((t) => goalTags.has(t))),
      );
    if (topMatch) list = list.filter((v) => v.slug !== topMatch.slug);
    return list;
  }, [cuisine, goalsOnly, goalTags, merged, topMatch]);

  const logDish = (dish: DemoDish, venue: DemoVenue) => {
    haptic("commit");
    diaryLogBranded(demoDishToBrandedFood(dish, venue), 1);
    // Feed the taste profile: eating out teaches Sous your cuisine leanings just
    // like cooking does — closing the eat-out data-flywheel hole.
    recordSignal({
      kind: "saved",
      facets: dishToFacets({ cuisineFamily: venue.cuisine, tags: dish.tags }),
    });
    toast.push({
      variant: "success",
      title: `Logged ${dish.name}`,
      body: `${venue.name} · ~${dish.kcal} kcal`,
      dedupKey: "eat-out-log",
    });
  };

  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)]">
      <header className="app-header page-x py-2.5">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            onClick={() => router.push("/today")}
            type="button"
            aria-label="Back to Today"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--nourish-subtext)] transition hover:bg-white hover:text-[var(--nourish-dark)] active:scale-90 motion-reduce:active:scale-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-[19px] leading-tight text-[var(--nourish-dark)]">
              Eat out
            </h1>
            <p className="flex items-center gap-1 text-[11px] text-[var(--nourish-subtext)]">
              <MapPin size={10} aria-hidden /> Near Stanford · curated demo
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md page-x space-y-4 pb-24 pt-2">
        {/* Featured dishes — swipe across the whole area's menus. */}
        <div className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featured.map(({ dish, venue }) => {
            const fits = dish.tags.some((t) => goalTags.has(t));
            return (
              <button
                key={dish.slug}
                type="button"
                onClick={() => {
                  setExpandedVenue(venue.slug);
                  setSelectedDish(dish.slug);
                }}
                className="w-[8.5rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-neutral-200/70 bg-white text-left shadow-sm transition-transform hover:border-[var(--nourish-gold)]/55 active:scale-[0.97] motion-reduce:active:scale-100"
              >
                <div className="relative h-24 w-full">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="136px"
                    className="object-cover"
                  />
                  {fits && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/92">
                      <Star
                        size={10}
                        className="fill-[var(--nourish-gold)] text-[var(--nourish-gold)]"
                      />
                    </span>
                  )}
                </div>
                <div className="px-2.5 py-2">
                  <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-[var(--nourish-dark)]">
                    {dish.name}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] text-[var(--nourish-subtext)]">
                    ~{dish.kcal} kcal · {venue.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters — cuisines + the goal lens (real starred nutrients). */}
        <div className="-mx-[var(--gutter)] flex gap-1.5 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {goalTags.size > 0 && (
            <button
              type="button"
              onClick={() => setGoalsOnly((g) => !g)}
              aria-pressed={goalsOnly}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                goalsOnly
                  ? "border-[var(--nourish-gold)] bg-[var(--nourish-gold)]/15 text-[var(--nourish-gold)]"
                  : "border-neutral-200 bg-white text-[var(--nourish-dark)]",
              )}
            >
              <Star
                size={11}
                className={cn(goalsOnly && "fill-[var(--nourish-gold)]")}
              />
              Fits goals
            </button>
          )}
          {[null, ...ALL_CUISINES].map((c) => (
            <button
              key={c ?? "all"}
              type="button"
              onClick={() => setCuisine(c)}
              aria-pressed={cuisine === c}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                cuisine === c
                  ? "border-[var(--nourish-green)] bg-[var(--nourish-green)] text-white"
                  : "border-neutral-200 bg-white text-[var(--nourish-dark)] hover:border-[var(--nourish-green)]/50",
              )}
            >
              {c ?? "All"}
            </button>
          ))}
        </div>

        {/* Editorial hero — the strongest taste match, itself an open-able object. */}
        {topMatch && (
          <VenueObject
            venue={topMatch}
            hero
            reason={`Because you love ${topMatch.cuisine}`}
            tasteHit={tasteScore(topMatch) >= TASTE_MATCH}
            goalHit={goalTags.size > 0 && topMatch.dishes.some(dishFitsGoals)}
            open={expandedVenue === topMatch.slug}
            onToggle={() => toggleVenue(topMatch.slug)}
          >
            <p className="px-1 pb-1 text-[12px] italic leading-snug text-[var(--nourish-subtext)]">
              {topMatch.vibe}
            </p>
            {topMatch.dishes.map((dish) => (
              <DishObject
                key={dish.slug}
                dish={dish}
                fits={dishFitsGoals(dish)}
                selected={selectedDish === dish.slug}
                onSelect={() => toggleDish(dish.slug)}
                onLog={() => logDish(dish, topMatch)}
              />
            ))}
          </VenueObject>
        )}

        {/* Venue objects — taste leads, then nearest. Each is individually
            selectable: tap to drill its dishes; tap a dish to log it. */}
        <div className="space-y-3">
          {venues.map((v) => (
            <VenueObject
              key={v.slug}
              venue={v}
              tasteHit={tasteScore(v) >= TASTE_MATCH}
              goalHit={goalTags.size > 0 && v.dishes.some(dishFitsGoals)}
              open={expandedVenue === v.slug}
              onToggle={() => toggleVenue(v.slug)}
            >
              <p className="px-1 pb-1 text-[12px] italic leading-snug text-[var(--nourish-subtext)]">
                {v.vibe}
              </p>
              {v.dishes.map((dish) => (
                <DishObject
                  key={dish.slug}
                  dish={dish}
                  fits={dishFitsGoals(dish)}
                  selected={selectedDish === dish.slug}
                  onSelect={() => toggleDish(dish.slug)}
                  onLog={() => logDish(dish, v)}
                />
              ))}
            </VenueObject>
          ))}
          {venues.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-center text-[13px] text-[var(--nourish-subtext)]">
              No spots match that filter — try another cuisine.
            </p>
          )}
        </div>

        <p className="px-1 text-center text-[10.5px] leading-snug text-[var(--nourish-subtext-faint)]">
          Curated Stanford-area demo · nutrition is an estimate · menus and
          hours change — check the restaurant.
        </p>
      </main>
    </div>
  );
}
