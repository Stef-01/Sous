"use client";

import { Hand } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBigHands } from "@/lib/hooks/use-big-hands";

/**
 * BigHandsToggle  -  a tiny, low-emphasis pill that bumps cook UI scale for the
 * rest of the session. No card, no description line, no switch (rule 13): one
 * tap on (tints green), one tap off. Deliberately small so it stays out of the
 * way on the Mission + combined-cook intro.
 */
export function BigHandsToggle() {
  const { enabled, toggle, mounted } = useBigHands();
  if (!mounted) return null;

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label="Bigger controls — larger text and buttons for this cook"
        title="Bigger controls — larger text and buttons for this cook"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
          enabled
            ? "border-[var(--nourish-green)]/40 bg-[var(--nourish-green)]/8 text-[var(--nourish-green)]"
            : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300",
        )}
      >
        <Hand size={13} strokeWidth={2} />
        Bigger controls
      </button>
    </div>
  );
}
