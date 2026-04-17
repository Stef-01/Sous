"use client";

import { motion } from "framer-motion";
import { Hand } from "lucide-react";
import { useBigHands } from "@/lib/hooks/use-big-hands";

/**
 * BigHandsToggle — a single inline row on the Mission screen that lets the
 * user bump cook UI scale for the rest of the session. No settings page,
 * no permanent preference. One tap on, one tap off.
 */
export function BigHandsToggle() {
  const { enabled, toggle, mounted } = useBigHands();
  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className="flex w-full items-center gap-3 rounded-xl border border-[var(--nourish-border-strong)] bg-white/70 px-3.5 py-3 text-left transition-colors hover:border-[var(--nourish-green)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
          enabled
            ? "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
            : "bg-neutral-100 text-[var(--nourish-subtext)]"
        }`}
      >
        <Hand size={16} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-[var(--nourish-dark)]">
          Make everything bigger during this cook
        </span>
        <span className="block text-[12px] text-[var(--nourish-subtext)]">
          {enabled
            ? "On — bigger text and buttons until the session ends."
            : "Larger text and easier-to-tap buttons. Just for this cook."}
        </span>
      </span>
      <motion.span
        layout
        aria-hidden
        className="relative inline-flex h-6 w-10 shrink-0 items-center rounded-full"
        style={{
          background: enabled ? "var(--nourish-green)" : "rgba(0,0,0,0.12)",
        }}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
          style={{ left: enabled ? 20 : 2 }}
        />
      </motion.span>
    </button>
  );
}
