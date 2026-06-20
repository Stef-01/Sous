"use client";

/**
 * DogeHealthPanel — the nutrition system, surfaced ON the Doge game screen. A
 * translucent HEALTH STATS panel overlaid on the Tamaweb game: 6 bars driven by
 * the real diary aggregate (Energy · Mood · Hydration · Protein · Fiber ·
 * Vitamins) + a status line from the dog's mood. Collapsible so the game stays
 * playable. Reads useDogeHealth — one source of truth with the Nutrition page.
 *
 * See docs/DOGE-PET-DASHBOARD-PLAN.md.
 */
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Zap,
  Heart,
  Droplet,
  Drumstick,
  Leaf,
  ShieldCheck,
  ArrowUp,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useDogeHealth } from "@/lib/doge/use-doge-health";
import type { PetHealthStat } from "@/lib/nutrition/pet-screen-data";
import type { PetMood } from "@/lib/nutrition/pet-state";

const STAT_META: Record<
  PetHealthStat["key"],
  { icon: typeof Zap; color: string }
> = {
  energy: { icon: Zap, color: "#f5c542" },
  mood: { icon: Heart, color: "#ec6a8e" },
  hydration: { icon: Droplet, color: "#4aa3e0" },
  protein: { icon: Drumstick, color: "#e8893a" },
  fiber: { icon: Leaf, color: "#6fbf4a" },
  vitamins: { icon: ShieldCheck, color: "#4ec5a0" },
};

const MOOD_STATUS: Record<PetMood, string> = {
  asleep: "Dobe's napping — log a meal to wake him",
  hungry: "Dobe's hungry — feed him well today",
  peckish: "Dobe's peckish — a few gaps to fill",
  content: "Dobe's content — nicely fed",
  thriving: "Great job! Dobe is thriving!",
};

function StatRow({ stat }: { stat: PetHealthStat }) {
  const { icon: Icon, color } = STAT_META[stat.key];
  const good = stat.pct >= 70;
  return (
    <div className="flex items-center gap-2">
      <Icon size={13} style={{ color }} aria-hidden className="shrink-0" />
      <span className="w-[68px] shrink-0 text-[10px] font-bold uppercase tracking-wide text-white/80">
        {stat.label}
      </span>
      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-black/45">
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${stat.pct}%`, backgroundColor: color }}
        />
      </span>
      <span className="w-9 shrink-0 text-right text-[10.5px] font-bold tabular-nums text-white">
        {stat.pct}%
      </span>
      <ArrowUp
        size={11}
        className={good ? "text-[#6fbf4a]" : "text-white/20"}
        aria-hidden
      />
    </div>
  );
}

export function DogeHealthPanel() {
  const reduce = useReducedMotion();
  const { stats: cook } = useCookSessions();
  const { stats, mood } = useDogeHealth(cook.currentStreak);
  const [open, setOpen] = useState(true);

  return (
    <div className="pointer-events-none absolute inset-x-2 top-2 z-20 flex justify-end">
      <motion.section
        initial={reduce ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="pointer-events-auto w-[214px] overflow-hidden rounded-xl border border-white/10 bg-[#2a2230]/85 shadow-lg backdrop-blur-sm"
        aria-label="Dobe's health, from your nutrition"
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left"
          aria-expanded={open}
        >
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
            <Heart size={12} className="text-[#ec6a8e]" aria-hidden />
            Health Stats
          </span>
          {open ? (
            <ChevronUp size={14} className="text-white/50" aria-hidden />
          ) : (
            <ChevronDown size={14} className="text-white/50" aria-hidden />
          )}
        </button>

        {open && (
          <div className="space-y-1.5 px-3 pb-2.5">
            {stats.map((s) => (
              <StatRow key={s.key} stat={s} />
            ))}
            <p className="pt-1 text-[10.5px] font-medium leading-snug text-[#f5c542]">
              {MOOD_STATUS[mood]}
            </p>
          </div>
        )}
      </motion.section>
    </div>
  );
}
