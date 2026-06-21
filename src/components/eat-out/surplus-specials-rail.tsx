"use client";

/**
 * Surplus-Specials rail — the STRATEGY §12.11 rule-12 stub (PARKED feature).
 *
 * DEFAULT OFF: renders NOTHING until `isHomeChefEnabledClient()` is true (env
 * unlock or the `?homechef=1` dev override) — no fake marketplace shipped to
 * users. When on, it shows surplus home-chef batches sorted by the SAME taste
 * weights the eat-out page uses, and a tap records the taste signal through the
 * existing preference flywheel. The data is an injectable prop (demo fixtures by
 * default) so a real partner feed is a one-line swap.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Leaf, Clock } from "lucide-react";
import { isHomeChefEnabledClient } from "@/lib/home-chef/flag";
import { DEMO_HOME_CHEF_BATCHES } from "@/data/home-chef/demo-batches";
import {
  batchDiscountPct,
  isBatchAvailable,
  type HomeChefBatch,
} from "@/types/home-chef";
import { usePreferenceProfile } from "@/lib/hooks/use-preference-profile";
import { dishToFacets } from "@/lib/intelligence/dish-to-facets";
import { cuisineKeyFor } from "@/data/eat-out/cuisine-key";
import { toast } from "@/lib/hooks/use-toast";
import { haptic } from "@/lib/motion/haptics";
import { cn } from "@/lib/utils/cn";

export function SurplusSpecialsRail({
  batches = DEMO_HOME_CHEF_BATCHES,
  isSample = batches === DEMO_HOME_CHEF_BATCHES,
}: {
  batches?: HomeChefBatch[];
  isSample?: boolean;
}) {
  // Resolve the flag AFTER mount so SSR + first paint render null (no hydration
  // mismatch) — the rail simply appears if the override/env says so.
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(isHomeChefEnabledClient()), []);

  const { merged, recordSignal } = usePreferenceProfile();
  const [reserved, setReserved] = useState<Set<string>>(new Set());

  // Snapshot the taste weights at first render so the rail's ORDER stays put when
  // a tap records a new signal (a horizontal rail reshuffling under the finger is
  // jarring). The flywheel still learns; only the visible order is pinned.
  const tasteRef = useRef<Record<string, number> | null>(null);
  if (tasteRef.current === null) tasteRef.current = merged.cuisines;
  const tasteAtMount = tasteRef.current;

  // Lead with the user's taste (same cuisine weights as the venue sort), then the
  // deepest discount, then most available.
  const sorted = useMemo(() => {
    const taste = (b: HomeChefBatch) =>
      tasteAtMount[cuisineKeyFor(b.cuisine)] ?? 0;
    return [...batches].sort((a, b) => {
      const dt = taste(b) - taste(a);
      if (Math.abs(dt) > 0.05) return dt;
      const dd = batchDiscountPct(b) - batchDiscountPct(a);
      if (dd !== 0) return dd;
      return b.qtyAvailable - a.qtyAvailable;
    });
  }, [batches, tasteAtMount]);

  if (!enabled || sorted.length === 0) return null;

  const reserve = (b: HomeChefBatch) => {
    haptic("commit");
    // Wire the existing flywheel — browsing a surplus special is a taste signal.
    recordSignal({
      kind: "search-result-tapped",
      facets: dishToFacets({ cuisineFamily: cuisineKeyFor(b.cuisine) }),
    });
    setReserved((prev) => new Set(prev).add(b.id));
    toast.push({
      variant: "success",
      title: isSample ? "Reserved — sample" : "Reserved",
      body: `${b.dishName} · pickup ${b.pickupWindow}`,
      dedupKey: "home-chef-reserve",
    });
  };

  return (
    <section className="mt-7">
      <div className="mb-2 flex items-end justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-neutral-900">
            <Leaf className="size-4 text-[var(--nourish-green)]" aria-hidden />
            Surplus specials near you
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Discounted home-packed meals from rescued ingredients
            {isSample ? " · sample pilot" : ""}
          </p>
        </div>
      </div>

      <div className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sorted.map((b) => {
          const pct = batchDiscountPct(b);
          const soldOut = !isBatchAvailable(b);
          const isReserved = reserved.has(b.id);
          const status = isReserved
            ? "reserved"
            : soldOut
              ? "sold out"
              : `${b.qtyAvailable} left`;
          // Screen readers otherwise hear an ambiguous "$11 $18" for the struck
          // price — spell the offer out explicitly.
          const label = `${b.dishName} from ${b.restaurantName}, ${
            pct > 0
              ? `now $${b.surplusPrice}, was $${b.regularPrice}, ${pct}% off`
              : `$${b.surplusPrice}`
          }, pickup ${b.pickupWindow}, ${status}`;
          return (
            <button
              key={b.id}
              type="button"
              aria-label={label}
              disabled={soldOut || isReserved}
              onClick={() => reserve(b)}
              className={cn(
                "w-[12.5rem] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white p-3 text-left shadow-sm transition-transform",
                "border-neutral-200/70 active:scale-[0.97] motion-reduce:active:scale-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--nourish-green)]",
                (soldOut || isReserved) && "opacity-60 active:scale-100",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 text-sm font-semibold text-neutral-900">
                  {b.dishName}
                </span>
                {pct > 0 && (
                  <span className="shrink-0 rounded-full bg-[var(--nourish-green)]/12 px-1.5 py-0.5 text-[0.65rem] font-bold text-[var(--nourish-green)]">
                    −{pct}%
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">
                {b.restaurantName}
              </p>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-neutral-900">
                  ${b.surplusPrice}
                </span>
                <span className="text-xs text-neutral-400 line-through">
                  ${b.regularPrice}
                </span>
              </div>

              <p className="mt-1.5 line-clamp-2 text-[0.7rem] leading-snug text-neutral-600">
                <Leaf
                  className="mr-0.5 inline size-3 text-[var(--nourish-green)]"
                  aria-hidden
                />
                {b.surplusIngredients.join(", ")}
              </p>

              <div className="mt-2 flex items-center gap-1 text-[0.7rem] text-neutral-500">
                <Clock className="size-3" aria-hidden />
                <span className="truncate">{b.pickupWindow}</span>
              </div>
              <p className="mt-1 text-[0.7rem] font-medium text-neutral-700">
                {isReserved
                  ? "Reserved ✓"
                  : soldOut
                    ? "Sold out"
                    : `${b.qtyAvailable} left`}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
