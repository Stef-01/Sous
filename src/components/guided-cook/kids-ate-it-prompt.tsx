"use client";

/**
 * KidsAteItPrompt — post-rating two-tap row on the Win screen.
 * Yes / Some / No.
 *
 * Minimalism (POLISH-CHECKLIST §1.5.2):
 *   - Renders only when Parent Mode is on.
 *   - Three short pills, no icons, no expand. The pills ARE the input.
 *   - Submits silently; a quiet confirmation line replaces the chips
 *     after answer so the surface doesn't blink between states.
 *   - Result feeds useKidsAteIt → rebalancer (W6) for next-night.
 */

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import {
  useKidsAteIt,
  type KidsAteItVerdict,
} from "@/lib/hooks/use-kids-ate-it";

interface Props {
  /** Optional caller-provided session id; falls back to a per-mount uuid. */
  cookSessionId?: string;
  recipeSlug: string;
}

function makeSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `kasid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const PILLS: { id: KidsAteItVerdict; label: string }[] = [
  { id: "yes", label: "Yes" },
  { id: "some", label: "Some" },
  { id: "no", label: "No" },
];

const CONFIRM_COPY: Record<KidsAteItVerdict, string> = {
  yes: "Logged. We'll surface more like this next time.",
  some: "Logged. We'll keep similar-but-gentler suggestions in the mix.",
  no: "Logged. We'll ease off this attribute cluster for two weeks.",
};

export function KidsAteItPrompt({ cookSessionId, recipeSlug }: Props) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const { profile } = useParentMode();
  const { log } = useKidsAteIt();
  const haptic = useHaptic();
  const [chosen, setChosen] = useState<KidsAteItVerdict | null>(null);
  // Stable per-mount session id when none is supplied. Cook page can pass
  // a real id later (Stage 2 W14 once cook sessions persist server-side).
  const sessionIdRef = useRef<string>(cookSessionId ?? makeSessionId());

  if (!profile.enabled) return null;

  const handle = (verdict: KidsAteItVerdict) => {
    haptic();
    log({ cookSessionId: sessionIdRef.current, recipeSlug, verdict });
    setChosen(verdict);
  };

  return (
    <section
      aria-label="Did the kids eat it?"
      className="space-y-2 rounded-2xl bg-white/70 p-3 ring-1 ring-[var(--nourish-border)]"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
        Did the kids eat it?
      </p>
      {chosen === null ? (
        <div
          className="flex items-center gap-2"
          role="radiogroup"
          aria-label="Did the kids eat it?"
        >
          {PILLS.map((p) => (
            <motion.button
              key={p.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              onClick={() => handle(p.id)}
              role="radio"
              aria-checked={false}
              className={cn(
                "rounded-full border border-[var(--nourish-border)] bg-white px-4 py-1.5 text-[12px] font-semibold text-[var(--nourish-dark)] hover:bg-[var(--nourish-green)]/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
              )}
            >
              {p.label}
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-[12px] italic text-[var(--nourish-green)]/90">
          {CONFIRM_COPY[chosen]}
        </p>
      )}
    </section>
  );
}
