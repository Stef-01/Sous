"use client";

/**
 * TodayNutritionGlance — the compact, glanceable metrics doorway on the Today
 * page. Integrates food stats (calories + what you ate), nutrient stats (macros
 * + the biggest gap), and cravings (the gap's dishes link straight to /cook) in
 * one quiet strip. The header still opens the full dashboard at /nutrition.
 *
 * Depth rule (CLAUDE.md "DEPTH OVER SPEED"): each metric — Energy + every macro —
 * is its OWN first-class selectable object (hover / focus / selected object-box)
 * that drills into its detail INLINE on tap, mirroring the Dobe-nutrition gold
 * standard, rather than being a static bar in a panel that only opens the whole
 * tab. The drill surfaces the target + % (otherwise hidden) on demand (rule 13),
 * so the at-rest strip stays quiet and subordinate to the QuestCard hero (rule 2).
 *
 * The pet lives in the Doge game now (its health stats are this same nutrition),
 * not on the home screen. Reads the shared aggregate via useTodayStats — one
 * source of truth with the Nutrition page. See docs/TODAY-DASHBOARD-PLAN.md.
 */
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTodayStats } from "@/lib/today/use-today-stats";
import type { TodayMacro } from "@/lib/today/today-stats";
import { cn } from "@/lib/utils/cn";

const MACRO_LETTER: Record<TodayMacro["key"], string> = {
  carbs: "C",
  fat: "F",
  protein: "P",
};

function MacroBar({ macro }: { macro: TodayMacro }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <span className="text-[11px] font-bold tabular-nums text-[var(--nourish-subtext)]">
        {MACRO_LETTER[macro.key]}
      </span>
      <span
        className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--nourish-cream)]"
        role="img"
        aria-label={`${macro.label} ${macro.grams} of ${macro.target} grams`}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--nourish-green)]/70"
          style={{ width: `${macro.pct}%` }}
        />
      </span>
      <span className="text-[10.5px] tabular-nums text-[var(--nourish-subtext-faint)]">
        {macro.grams}
      </span>
    </div>
  );
}

/** Object-box styling shared by every selectable metric (depth rule). */
function metricBoxClass(active: boolean): string {
  return cn(
    "-mx-1.5 rounded-lg px-1.5 py-1 text-left transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
    active
      ? "bg-[var(--nourish-green)]/[0.08] ring-1 ring-[var(--nourish-green)]/30"
      : "hover:bg-neutral-50",
  );
}

export function TodayNutritionGlance() {
  const reduce = useReducedMotion();
  const stats = useTodayStats();
  // Which metric is drilled open (energy | macro.key); null = collapsed glance.
  const [selected, setSelected] = useState<string | null>(null);
  const toggle = (k: string) => setSelected((s) => (s === k ? null : k));

  // Empty state — a warm, single-line invite to start the day's plate. It is a
  // doorway, never a rival to the craving search (rule 2).
  if (!stats.logged) {
    return (
      <Link
        href="/nutrition"
        className="flex items-center justify-between rounded-2xl border border-dashed border-[var(--nourish-green)]/25 bg-white/70 px-4 py-3 text-[var(--nourish-subtext)] shadow-[var(--shadow-card)] transition hover:border-[var(--nourish-green)]/45 active:scale-[0.99]"
        aria-label="Track today's plate"
      >
        <span className="text-[13px]">
          <span className="font-semibold text-[var(--nourish-dark)]">
            Today&rsquo;s plate
          </span>{" "}
          — nothing logged yet
        </span>
        <ChevronRight
          size={16}
          className="text-[var(--nourish-subtext-faint)]"
          aria-hidden
        />
      </Link>
    );
  }

  // Detail for the currently-drilled metric — the target + % that the at-rest
  // bars only encode visually (disclosure on demand, rule 13).
  const drill = (() => {
    if (selected === "energy") {
      const over = stats.kcal.consumed > stats.kcal.target;
      return {
        label: "Energy",
        detail: `${stats.kcal.consumed.toLocaleString()} / ${stats.kcal.target.toLocaleString()} kcal · ${stats.kcal.pct}%`,
        note: over
          ? `${Math.abs(stats.kcal.left).toLocaleString()} over`
          : `${stats.kcal.left.toLocaleString()} left`,
      };
    }
    const m = stats.macros.find((x) => x.key === selected);
    if (m) {
      return {
        label: m.label,
        detail: `${m.grams} / ${m.target} g · ${m.pct}%`,
        note: "",
      };
    }
    return null;
  })();

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]"
      aria-label="Today's nutrition"
    >
      {/* Header row → full dashboard */}
      <Link
        href="/nutrition"
        className="flex items-center justify-between gap-2 px-4 pt-3 active:scale-[0.99]"
      >
        <span className="sous-label">Today&rsquo;s plate</span>
        <span className="flex items-center gap-0.5 text-[12px] font-semibold text-[var(--nourish-green)]">
          {stats.kcal.left.toLocaleString()} left
          <ChevronRight size={14} aria-hidden />
        </span>
      </Link>

      {/* Calories — a selectable metric (tap to drill its target + %). */}
      <div className="px-4 pt-2">
        <button
          type="button"
          onClick={() => toggle("energy")}
          aria-pressed={selected === "energy"}
          aria-label="Energy detail"
          className={cn("block w-full", metricBoxClass(selected === "energy"))}
        >
          <span className="relative block h-2 overflow-hidden rounded-full bg-[var(--nourish-cream)]">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--nourish-green)]"
              style={{ width: `${stats.kcal.pct}%` }}
            />
          </span>
          <span className="mt-1 block text-[11.5px] tabular-nums text-[var(--nourish-subtext)]">
            <span className="font-semibold text-[var(--nourish-dark)]">
              {stats.kcal.consumed.toLocaleString()}
            </span>{" "}
            / {stats.kcal.target.toLocaleString()} kcal
          </span>
        </button>
      </div>

      {/* Macro mini-bars — each its own selectable metric. */}
      <div className="flex items-center gap-2 px-4 pt-2">
        {stats.macros.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => toggle(m.key)}
            aria-pressed={selected === m.key}
            aria-label={`${m.label} detail`}
            className={cn("min-w-0 flex-1", metricBoxClass(selected === m.key))}
          >
            <MacroBar macro={m} />
          </button>
        ))}
      </div>

      {/* Inline drill-down for the selected metric (rule 13: detail on demand). */}
      {/* Inline drill-down for the selected metric (rule 13: detail on demand).
          Conditionally rendered — reliably UNMOUNTS on close (an AnimatePresence
          height-exit left collapsed nodes piling up). Animates in on open; swaps
          content in place when you switch metrics (single stable element). */}
      {drill && (
        <motion.p
          role="status"
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="px-4 pt-1.5 text-[11.5px] text-[var(--nourish-subtext)]"
        >
          <span className="font-semibold text-[var(--nourish-dark)]">
            {drill.label}
          </span>{" "}
          {drill.detail}
          {drill.note ? ` · ${drill.note}` : ""}
        </motion.p>
      )}

      {/* What you actually ate today — the concrete food stats under the macros. */}
      {stats.meals.length > 0 && (
        <p className="truncate px-4 pb-3 pt-1.5 text-[11px] text-[var(--nourish-subtext-faint)]">
          {stats.meals.join(" · ")}
        </p>
      )}

      {/* The integration: biggest nutrient gap → real dishes that close it. */}
      {stats.gap && stats.gap.suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-hidden border-t border-[var(--nourish-cream)] bg-[var(--tier-strong-bg)] px-4 py-2">
          <span className="shrink-0 text-[11.5px] text-[var(--nourish-dark)]">
            Low on <span className="font-semibold">{stats.gap.label}</span>
          </span>
          {stats.gap.suggestions.map((s) => (
            <Link
              key={s.slug}
              href={`/cook/${s.slug}`}
              className="inline-flex min-w-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--nourish-dark)] shadow-[var(--shadow-card)] transition hover:bg-[var(--nourish-green)]/5 active:scale-[0.97]"
              title={s.name}
            >
              <span className="truncate">{s.name}</span>
              <span className="shrink-0 font-semibold text-[var(--tier-strong)]">
                +{Math.min(100, s.closesPct)}%
              </span>
            </Link>
          ))}
        </div>
      )}
    </motion.section>
  );
}
