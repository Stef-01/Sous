"use client";

/**
 * /path/recap — Spotify-Wrapped-style annual recap surface
 * (Y5 F, per Sprint F in `docs/YEAR-5-VIBECODE-PLAN.md`).
 *
 * Pure renderer over `buildAnnualRecap`. Cold-start friendly:
 * when the user has no completed cooks for the target year,
 * surfaces an inviting empty state instead of a wall of zeros.
 *
 * Year picker chips so a user with multi-year history can scrub
 * back. Defaults to the current UTC year.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { buildAnnualRecap } from "@/lib/recap/annual-recap";
import { cn } from "@/lib/utils/cn";

export default function RecapPage() {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const router = useRouter();
  const { completedSessions } = useCookSessions();

  // Available years (UTC) inferred from the session log so the
  // chip row only ever renders years the user actually cooked in.
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    for (const s of completedSessions) {
      if (!s.completedAt) continue;
      const ts = new Date(s.completedAt);
      if (Number.isFinite(ts.getTime())) set.add(ts.getUTCFullYear());
    }
    const arr = Array.from(set).sort((a, b) => b - a);
    if (arr.length === 0) arr.push(new Date().getUTCFullYear());
    return arr;
  }, [completedSessions]);

  const [year, setYear] = useState<number>(availableYears[0]);

  const recap = useMemo(
    () => buildAnnualRecap({ sessions: completedSessions, year }),
    [completedSessions, year],
  );

  const empty = recap.totalCooks === 0;

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
              Annual recap
            </p>
            <h1 className="font-serif text-lg font-semibold leading-tight text-[var(--nourish-dark)]">
              Your year of cooking
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {/* Year picker — quiet chip row, only renders when the
            user has multi-year history. */}
        {availableYears.length > 1 && (
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Select year"
          >
            {availableYears.map((y) => {
              const active = y === year;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  role="radio"
                  aria-checked={active}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                    active
                      ? "bg-[var(--nourish-green)] text-white"
                      : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
                  )}
                >
                  {y}
                </button>
              );
            })}
          </div>
        )}

        {empty ? (
          <section className="rounded-2xl border border-dashed border-neutral-200/80 bg-white/40 p-6 text-center">
            <Sparkles
              size={20}
              className="mx-auto mb-3 text-[var(--nourish-gold)]"
              aria-hidden
            />
            <p className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
              {recap.windowLabel} is still a blank page.
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-[var(--nourish-subtext)]">
              Cook something this week and it&apos;ll show up in your recap. The
              page fills itself in.
            </p>
          </section>
        ) : (
          <>
            {/* Hero stats */}
            <section className="rounded-2xl border border-neutral-100/80 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
                {recap.windowLabel}
              </p>
              <p className="mt-1.5 font-serif text-3xl font-bold leading-snug text-[var(--nourish-dark)]">
                {recap.totalCooks} cook{recap.totalCooks === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
                Across {recap.distinctCuisines} cuisine
                {recap.distinctCuisines === 1 ? "" : "s"} ·{" "}
                {recap.distinctDishes} distinct dish
                {recap.distinctDishes === 1 ? "" : "es"}
                {recap.ratingCount > 0
                  ? ` · ${recap.avgRating.toFixed(1)}★ avg`
                  : ""}
                .
              </p>
            </section>

            {/* Top cuisines */}
            {recap.topCuisines.length > 0 && (
              <section className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-subtext)]">
                  Top cuisines
                </p>
                <ol className="mt-2 space-y-1.5">
                  {recap.topCuisines.map((c, i) => (
                    <li
                      key={c.label}
                      className="flex items-center gap-3 text-[13px]"
                    >
                      <span className="w-4 text-[var(--nourish-subtext)] tabular-nums">
                        {i + 1}.
                      </span>
                      <span className="flex-1 capitalize text-[var(--nourish-dark)]">
                        {c.label}
                      </span>
                      <span className="tabular-nums text-[var(--nourish-subtext)]">
                        {c.count}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Top dishes */}
            {recap.topDishes.length > 0 && (
              <section className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-subtext)]">
                  Most-cooked dishes
                </p>
                <ol className="mt-2 space-y-1.5">
                  {recap.topDishes.map((d, i) => (
                    <li
                      key={d.label}
                      className="flex items-center gap-3 text-[13px]"
                    >
                      <span className="w-4 text-[var(--nourish-subtext)] tabular-nums">
                        {i + 1}.
                      </span>
                      <span className="flex-1 truncate text-[var(--nourish-dark)]">
                        {d.label}
                      </span>
                      <span className="tabular-nums text-[var(--nourish-subtext)]">
                        {d.count}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* By month — sparkline-style bars. */}
            <section className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-subtext)]">
                By month
              </p>
              <ul
                className="mt-3 grid grid-cols-12 items-end gap-1"
                aria-label="Cooks per month"
              >
                {recap.byMonth.map((m) => {
                  const maxCount = Math.max(
                    1,
                    ...recap.byMonth.map((b) => b.cookCount),
                  );
                  const heightPct = (m.cookCount / maxCount) * 100;
                  return (
                    <li
                      key={m.monthLabel}
                      className="flex flex-col items-center gap-1"
                      aria-label={`${m.monthLabel}: ${m.cookCount} cook${m.cookCount === 1 ? "" : "s"}`}
                    >
                      <div className="flex h-16 w-full items-end">
                        <div
                          className={cn(
                            "w-full rounded-t",
                            m.cookCount > 0
                              ? "bg-[var(--nourish-green)]/80"
                              : "bg-neutral-200/60",
                          )}
                          style={{
                            height: `${Math.max(4, heightPct)}%`,
                          }}
                          aria-hidden
                        />
                      </div>
                      <span className="text-[8px] uppercase tracking-[0.05em] text-[var(--nourish-subtext)]/70">
                        {m.monthLabel.slice(0, 1)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Signature dish CTA */}
            {recap.signatureDishSlug && (
              <button
                type="button"
                onClick={() => router.push(`/cook/${recap.signatureDishSlug}`)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--nourish-green)] py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--nourish-dark-green)]"
              >
                <Sparkles size={14} aria-hidden />
                Cook this year&apos;s signature again
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
