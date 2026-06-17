"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronsUpDown, Minus, Plus, X } from "lucide-react";
import {
  diaryRemoveEntry,
  diaryRestoreEntry,
  diaryUpdateServings,
  type DiaryEntry,
} from "@/lib/hooks/use-nutrition-diary";
import { haptic } from "@/lib/motion/haptics";
import { SPRING } from "@/lib/motion/tokens";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

/**
 * One diary entry row — name, servings, provenance, remove-with-undo, and the
 * stage-3 in-place servings stepper (before this, the only "edit" was remove +
 * re-log, which lost the count).
 *
 * Stepper design — approaches compared:
 *  - always-visible − / + : fastest (1 tap per step) but two extra controls on
 *    every row all the time (rule 6 fail);
 *  - ×½ / ×1 / ×2 presets: fast but can't express 1.5 or 3;
 *  - CHOSEN: the ×N pill is itself the button — tap to reveal − / + (0.5
 *    steps, min 0.5), tap elsewhere keeps it open while adjusting, auto-quiet.
 *    Clean default, 2 taps to first adjustment, 1 tap per step after.
 */
export function DiaryEntryRow({
  entry,
  date,
}: {
  entry: DiaryEntry;
  date: Date;
}) {
  const [editing, setEditing] = useState(false);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  // Auto-quiet (the design note's promise): tapping anywhere outside this row
  // closes the open stepper, so stray ±controls don't linger across the diary.
  useEffect(() => {
    if (!editing) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setEditing(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [editing]);

  const step = (delta: number) => {
    const next = Math.max(0.5, Math.round((entry.servings + delta) * 2) / 2);
    if (next !== entry.servings) {
      haptic("select");
      diaryUpdateServings(entry.at, next, date);
    }
  };

  return (
    <motion.div
      ref={rootRef}
      layout={reducedMotion ? false : "position"}
      initial={reducedMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
      transition={reducedMotion ? { duration: 0 } : SPRING.soft}
      className="flex items-center gap-2 rounded-xl border border-neutral-200/70 bg-white px-3 py-2.5"
    >
      <span className="min-w-0 flex-1 text-[13px] text-[var(--nourish-dark)]">
        <span className="font-semibold">{entry.name}</span>
        {entry.brand && (
          <span className="text-[var(--nourish-subtext-faint)]">
            {" "}
            · {entry.brand}
          </span>
        )}
        {entry.auto && (
          <span className="text-[var(--nourish-subtext-faint)]"> · cooked</span>
        )}
      </span>

      {/* Servings — the pill toggles the stepper. */}
      {editing ? (
        <span className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => step(-0.5)}
            aria-label={`Reduce ${entry.name} servings`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 active:scale-95"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            aria-label="Done adjusting servings"
            className="min-w-[40px] rounded-full bg-[var(--nourish-green)]/10 px-2 py-1 text-center text-[12px] font-semibold text-[var(--nourish-green)]"
          >
            ×{entry.servings}
          </button>
          <button
            type="button"
            onClick={() => step(0.5)}
            aria-label={`Increase ${entry.name} servings`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 active:scale-95"
          >
            <Plus size={13} />
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Adjust ${entry.name} servings (currently ${entry.servings})`}
          className={cn(
            "flex shrink-0 items-center gap-0.5 rounded-full py-1 pl-2 pr-1.5 text-[12px] font-medium transition-colors",
            entry.servings !== 1
              ? "bg-neutral-100 text-[var(--nourish-dark)]"
              : "bg-neutral-100/70 text-[var(--nourish-subtext)] hover:bg-neutral-100",
          )}
        >
          ×{entry.servings}
          <ChevronsUpDown size={11} className="opacity-50" aria-hidden />
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          haptic("select");
          diaryRemoveEntry(entry.at, date);
          toast.push({
            variant: "info",
            title: `Removed ${entry.name}`,
            dedupKey: `rm-${entry.at}`,
            action: {
              label: "Undo",
              onClick: () => diaryRestoreEntry(entry, date),
            },
          });
        }}
        aria-label={`Remove ${entry.name}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:text-[var(--nourish-dark)]"
      >
        <X size={15} />
      </button>
    </motion.div>
  );
}
