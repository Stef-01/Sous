"use client";

import { motion } from "framer-motion";
import type { SkillTrainingHover } from "@/data/skill-node-training-hovers";

/**
 * Desktop-only micro preview on hover. Full story lives in SkillDetailSheet.
 */
export function TrainingHoverPanel({ hover }: { hover: SkillTrainingHover }) {
  return (
    <motion.div
      className="skill-hover-preview pointer-events-none absolute left-1/2 top-full z-[80] mt-2 w-[min(13rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-[#e8e4df] bg-[var(--nourish-cream)]/98 p-2.5 text-left shadow-[0_10px_28px_rgba(15,23,42,0.1)] backdrop-blur-sm"
      role="tooltip"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded-md bg-[var(--nourish-green)]/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--nourish-green)]">
          {hover.badge}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] font-medium leading-snug text-[var(--nourish-dark)]">
        {hover.hoverTeaser}
      </p>
      <p className="mt-1.5 text-[9px] font-medium text-[var(--nourish-subtext)]">
        Tap for details
      </p>
    </motion.div>
  );
}
