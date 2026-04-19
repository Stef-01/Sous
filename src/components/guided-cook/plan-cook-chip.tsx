"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X } from "lucide-react";

interface PlanCookChipProps {
  /** Total minutes prep + cook. Includes any parallelization savings if the
   *  caller has already combined them via `cook-sequencer`. */
  totalMinutes: number;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function parseEatTime(value: string): Date | null {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [hh, mm] = value.split(":").map((n) => parseInt(n, 10));
  const now = new Date();
  const target = new Date(now);
  target.setHours(hh, mm, 0, 0);
  if (target.getTime() < now.getTime() - 60_000) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

/**
 * PlanCookChip  -  "When do you want to eat?" → "Start cooking at 6:42 pm."
 *
 * Pure session-local math. No storage, no notifications. A single, quiet
 * scheduling assist that matches the "one decision per screen" rule without
 * adding a new destination.
 */
export function PlanCookChip({ totalMinutes }: PlanCookChipProps) {
  const [eatTime, setEatTime] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startAt = useMemo(() => {
    const eat = parseEatTime(eatTime);
    if (!eat) return null;
    const start = new Date(eat.getTime() - totalMinutes * 60_000);
    return { eat, start };
  }, [eatTime, totalMinutes]);

  const handleOpen = () => {
    setExpanded(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.showPicker?.();
    });
  };

  if (startAt) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="flex items-center gap-2 rounded-xl border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/[0.06] px-3 py-2"
      >
        <Clock
          size={14}
          className="shrink-0 text-[var(--nourish-green)]"
          strokeWidth={2}
        />
        <p className="min-w-0 flex-1 truncate text-[13px] leading-snug text-[var(--nourish-dark)]">
          Start cooking at{" "}
          <span className="font-semibold text-[var(--nourish-green)]">
            {formatTime(startAt.start)}
          </span>{" "}
          <span className="text-[var(--nourish-subtext)]">
            to eat by {formatTime(startAt.eat)}
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            setEatTime("");
            setExpanded(false);
          }}
          className="inline-flex h-8 min-w-[44px] items-center justify-center rounded-full px-2 text-[11px] font-medium text-[var(--nourish-subtext)] hover:bg-white/70 hover:text-[var(--nourish-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          aria-label="Clear planned eat time"
        >
          Change
        </button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {expanded ? (
        <motion.div
          key="input"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 rounded-xl border border-[var(--nourish-border-strong)] bg-white px-3 py-2"
        >
          <Clock
            size={14}
            className="shrink-0 text-[var(--nourish-green)]"
            strokeWidth={2}
          />
          <label
            htmlFor="plan-eat-time"
            className="text-[12px] font-medium text-[var(--nourish-subtext)]"
          >
            Eat by
          </label>
          <input
            ref={inputRef}
            id="plan-eat-time"
            type="time"
            value={eatTime}
            onChange={(e) => setEatTime(e.target.value)}
            className="flex-1 bg-transparent text-[13px] font-medium text-[var(--nourish-dark)] outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setEatTime("");
            }}
            aria-label="Cancel"
            className="inline-flex h-8 w-8 min-w-[44px] items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-neutral-100 hover:text-[var(--nourish-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          >
            <X size={16} />
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="chip"
          type="button"
          onClick={handleOpen}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--nourish-border-strong)] bg-white/60 px-3.5 py-2 text-[13px] font-medium text-[var(--nourish-subtext)] transition-colors hover:border-[var(--nourish-green)]/50 hover:text-[var(--nourish-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
        >
          <Clock size={14} className="shrink-0" strokeWidth={2} />
          When do you want to eat?
        </motion.button>
      )}
    </AnimatePresence>
  );
}
