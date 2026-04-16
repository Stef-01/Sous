"use client";

import type { SkillTrainingHover } from "@/data/skill-node-training-hovers";

export function TrainingHoverPanel({ hover }: { hover: SkillTrainingHover }) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-full z-[80] mt-2 hidden w-[min(17.5rem,calc(100vw-2rem)))] -translate-x-1/2 rounded-xl border border-neutral-200/95 bg-white/98 p-3 text-left shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-sm md:block md:opacity-0 md:invisible md:transition-all md:duration-150 md:group-hover:visible md:group-hover:opacity-100"
      role="tooltip"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--nourish-green)]">
        {hover.courseStage}
      </p>
      <p className="mt-1.5 text-[11px] font-medium leading-snug text-[var(--nourish-dark)]">
        You will be able to:
      </p>
      <ul className="mt-1.5 space-y-1 text-[10px] leading-snug text-[var(--nourish-subtext)]">
        {hover.youWill.map((line) => (
          <li key={line} className="flex gap-1.5">
            <span className="shrink-0 text-[var(--nourish-green)]">▸</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
