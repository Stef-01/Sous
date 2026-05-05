"use client";

/**
 * /path/eco — Eco Mode dashboard (Y5 D, audit P0).
 *
 * Quiet, spa-tone single-screen surface that tells the user how
 * much CO₂e they have avoided by cooking at home. Wires together
 * the existing carbon-math primitives:
 *   - `summarizeMonthlySavings` / `summarizeYearlySavings` for
 *     the trailing windows.
 *   - `pickCarbonAnalogy` for the relatable framing.
 *   - `pctOfAvgAmericanAvoided` for a percent-vs-baseline number.
 *   - `buildEncouragementCopy` for the headline copy.
 *
 * Renders a calm cold-start state when no cooks exist, and a
 * baseline-picker so the user can dial down the comparison from
 * the default `delivery`. Never compares pejoratively — every
 * number is framed as a gain.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Leaf } from "lucide-react";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useEcoMode } from "@/lib/hooks/use-eco-mode";
import {
  summarizeMonthlySavings,
  summarizeYearlySavings,
} from "@/lib/eco/summarize-savings";
import {
  buildEncouragementCopy,
  pickCarbonAnalogy,
  pctOfAvgAmericanAvoided,
  type MealContext,
} from "@/lib/eco/carbon-math";
import { cn } from "@/lib/utils/cn";

/** Baselines surfaced on the picker. Order = most → least
 *  forgiving comparison so the default "delivery" sits first. */
const BASELINE_OPTIONS: { id: MealContext; label: string }[] = [
  { id: "delivery", label: "Delivery" },
  { id: "takeout-pickup", label: "Takeout" },
  { id: "restaurant-dine-in", label: "Dine-out" },
  { id: "home-red-meat", label: "Beef-anchored meal" },
];

export default function EcoDashboardPage() {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const router = useRouter();
  const { completedSessions } = useCookSessions();
  const { mounted, profile, toggle, setBaseline } = useEcoMode();

  // Avoid SSR/CSR mismatch flicker on first paint.
  const [hydrated, setHydrated] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard
  useEffect(() => setHydrated(true), []);

  const monthly = summarizeMonthlySavings({
    sessions: completedSessions,
    baseline: profile.comparisonBaseline,
  });
  const yearly = summarizeYearlySavings({
    sessions: completedSessions,
    baseline: profile.comparisonBaseline,
  });

  const heroCopy = buildEncouragementCopy({
    savedKg: yearly.savedKg,
    windowLabel: "this year",
  });
  const analogy = pickCarbonAnalogy(yearly.savedKg).label;
  const pctOfAvg = pctOfAvgAmericanAvoided({ savedKg: yearly.savedKg });

  const ecoOff = !profile.enabled && hydrated && mounted;

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#fffdf8_0%,#faf7f2_45%,#f4efe8_100%)] pb-28">
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <motion.button
            type="button"
            onClick={() => router.push("/path")}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
            aria-label="Back to Path"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
              Eco Mode
            </p>
            <h1 className="font-serif text-lg font-semibold leading-tight text-[var(--nourish-dark)]">
              Your at-home carbon win
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4 space-y-4">
        {/* Off-state: friendly nudge to flip the toggle, never
            shaming. The button below toggles via the same hook
            the Profile sheet uses. */}
        {ecoOff && (
          <section className="rounded-2xl border border-[var(--nourish-green)]/20 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
              >
                <Leaf size={16} />
              </span>
              <div className="space-y-1">
                <p className="text-[13px] font-semibold text-[var(--nourish-dark)]">
                  Eco Mode is off
                </p>
                <p className="text-[12px] leading-snug text-[var(--nourish-subtext)]">
                  Turn it on to tilt suggestions toward lower-carbon picks and
                  surface your savings here.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[var(--nourish-green)] py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--nourish-dark-green)]"
            >
              Turn Eco Mode on
            </button>
          </section>
        )}

        {/* Hero — yearly headline + analogy. */}
        <section className="rounded-2xl border border-neutral-100/80 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
            Year-to-date
          </p>
          <p className="mt-1 font-serif text-2xl font-bold leading-snug text-[var(--nourish-dark)]">
            {yearly.savedKg <= 0
              ? "Your first cook starts the count."
              : heroCopy}
          </p>
          {yearly.savedKg > 0 && (
            <p className="mt-2 text-[12px] text-[var(--nourish-subtext)]">
              {analogy}
              {pctOfAvg > 0
                ? ` · ${pctOfAvg}% of an average year of eating out`
                : ""}
            </p>
          )}
        </section>

        {/* Trailing-30 + cook count side-by-side cards. */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--nourish-subtext)]">
              This month
            </p>
            <p className="mt-1 font-serif text-xl font-bold tabular-nums text-[var(--nourish-green)]">
              {formatKg(monthly.savedKg)}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--nourish-subtext)]">
              CO₂e saved
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--nourish-subtext)]">
              Cooks logged
            </p>
            <p className="mt-1 font-serif text-xl font-bold tabular-nums text-[var(--nourish-dark)]">
              {yearly.cookCount}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--nourish-subtext)]">
              this year
            </p>
          </div>
        </section>

        {/* Baseline picker — chips so the user can dial the
            comparison up or down. Default `delivery` is the most
            forgiving framing. */}
        <section className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-subtext)]">
            Compare against
          </p>
          <p className="mt-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
            We compare home cooking to whatever else you might have eaten. Pick
            what fits.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BASELINE_OPTIONS.map((opt) => {
              const active = profile.comparisonBaseline === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBaseline(opt.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                    active
                      ? "bg-[var(--nourish-green)] text-white"
                      : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
                  )}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Sources — compact citation list so the numbers feel
            grounded. Pulls from the same docs the carbon-math
            substrate cites in source comments. */}
        <section className="rounded-2xl border border-dashed border-neutral-200/80 bg-transparent p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-subtext)]">
            Sources
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-snug text-[var(--nourish-subtext)]/90">
            <li>Poore &amp; Nemecek 2018 (Science) — life-cycle dataset</li>
            <li>WRI Shifting Diets 2016 — diet-shift carbon analysis</li>
            <li>Project Drawdown — Plant-Rich Diets solution</li>
            <li>
              Heller &amp; Keoleian 2015 — US foodservice vs household LCA
            </li>
            <li>EPA 2023 — household carbon footprint shares</li>
          </ul>
          <p className="mt-2 text-[10px] text-[var(--nourish-subtext)]/70">
            All numbers are conservative midpoints, rounded so we never
            overstate. Real-world variance is high.
          </p>
        </section>
      </main>
    </div>
  );
}

function formatKg(kg: number): string {
  if (!Number.isFinite(kg) || kg <= 0) return "0 kg";
  if (kg < 1) return `${Math.round(kg * 1000)} g`;
  return `${Math.round(kg * 10) / 10} kg`;
}
