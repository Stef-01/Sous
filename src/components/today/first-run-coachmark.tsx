"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { isFirstRunSeen, markFirstRunSeen } from "@/lib/engagement/first-run";
import { DobermanGlyph } from "@/components/today/mascot";

/**
 * Phase 4 — first-run coachmark. One dismissible, self-clearing line under the
 * craving search (points UP at it — Rule 2: the existing primary, not a rival).
 * Shows once for a fresh user; sets `sous-firstrun-seen` on dismiss + never
 * reappears. Personalization is opt-in so a fresh user reaches food first.
 */
export function FirstRunCoachmark({
  onPersonalize,
}: {
  onPersonalize?: () => void;
}) {
  const [show, setShow] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- read the first-run flag from localStorage on mount */
  useEffect(() => {
    if (!isFirstRunSeen()) setShow(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!show) return null;

  const dismiss = () => {
    markFirstRunSeen();
    setShow(false);
  };

  const personalize = () => {
    markFirstRunSeen();
    setShow(false);
    onPersonalize?.();
  };

  return (
    <div className="rounded-2xl border border-[var(--nourish-green)]/15 bg-[var(--nourish-green)]/[0.06] p-2.5 text-[12px] font-medium text-[var(--nourish-green)]">
      <div className="flex items-center gap-2">
        <span className="-my-1 shrink-0" aria-hidden>
          <DobermanGlyph mood="happy" size={26} />
        </span>
        <span className="min-w-0 flex-1 leading-snug">
          Search a craving to cook your first dish
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss tip"
          className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full opacity-70 transition hover:bg-white/60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
        >
          <X size={14} />
        </button>
      </div>
      {onPersonalize && (
        <button
          type="button"
          onClick={personalize}
          className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-full bg-white px-3 text-[13px] font-semibold text-[var(--nourish-green)] shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
        >
          Tune taste
        </button>
      )}
    </div>
  );
}
