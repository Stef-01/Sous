"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import { derivePreferenceObservations } from "@/lib/engine/preference-observations";

/** After this many expansions we default collapsed. The strip is meant to
 *  be a quiet, returnable observation  -  not a thing the user needs to close
 *  every time. */
const COLLAPSE_AFTER_VIEWS = 3;
const VIEW_COUNT_KEY = "sous-preference-strip-views-v1";

function readViewCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(VIEW_COUNT_KEY);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeViewCount(n: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIEW_COUNT_KEY, String(n));
  } catch {
    // quota / disabled  -  silent failure, strip just stays expanded next time.
  }
}

interface PreferenceStripProps {
  sessions: CookSessionRecord[];
}

/**
 * PreferenceStrip  -  "What Sous has learned."
 *
 * Shows up to three deterministic, warm observations derived from
 * completed cook sessions (cuisine concentration, day-of-week patterns,
 * weekend range, top-rated clusters, recent momentum). Silent by default
 * for users with fewer than five completed cooks. Expanded on the first
 * three visits, then collapsed by default so it never feels like noise.
 */
export function PreferenceStrip({ sessions }: PreferenceStripProps) {
  const observations = useMemo(
    () => derivePreferenceObservations(sessions),
    [sessions],
  );

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate view count from localStorage on mount */
  useEffect(() => {
    const views = readViewCount();
    setOpen(views < COLLAPSE_AFTER_VIEWS);
    writeViewCount(views + 1);
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (observations.length === 0) return null;

  return (
    <section
      aria-label="What Sous has learned"
      className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white/70"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 rounded-2xl"
      >
        <span className="flex items-center gap-2">
          <Sparkles
            size={14}
            className="text-[var(--nourish-green)]"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
            What Sous has learned
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="text-[var(--nourish-subtext)]"
        >
          <ChevronDown size={14} aria-hidden />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {mounted && open && (
          <motion.ul
            key="observations"
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
            }
            transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 px-4 pb-3">
              {observations.map((o, i) => (
                <motion.li
                  key={o.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : i * 0.06,
                  }}
                  className="text-[13px] leading-relaxed text-[var(--nourish-dark)]"
                >
                  <span
                    className="text-[var(--nourish-green)] mr-1.5"
                    aria-hidden
                  >
                    ·
                  </span>
                  {o.text}.
                </motion.li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}
