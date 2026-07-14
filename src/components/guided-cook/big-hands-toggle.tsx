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
    <div className="flex justify-start">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label="Bigger controls — larger text and buttons for this cook"
        title="Bigger controls — larger text and buttons for this cook"
        className={cn(
          "inline-flex min-h-[44px] items-center gap-1.5 px-1 text-xs font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
          enabled
            ? "text-[var(--nourish-green)]"
            : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]",
        )}
      >
        <Hand size={13} strokeWidth={2} />
        Bigger controls
      </button>
    </div>
  );
}
