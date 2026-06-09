"use client";

import { useEffect, useState } from "react";
import { ArrowUp, X } from "lucide-react";
import { isFirstRunSeen, markFirstRunSeen } from "@/lib/engagement/first-run";

/**
 * Phase 4 — first-run coachmark. One dismissible, self-clearing line under the
 * craving search (points UP at it — Rule 2: the existing primary, not a rival).
 * Shows once for a fresh user; sets `sous-firstrun-seen` on dismiss + never
 * reappears. The quiz modal renders above it, so it naturally surfaces after the
 * quiz closes.
 */
export function FirstRunCoachmark() {
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

  return (
    <div className="flex items-center gap-2 rounded-full bg-[var(--nourish-green)]/10 px-3 py-1.5 text-[12px] font-medium text-[var(--nourish-green)]">
      <ArrowUp size={13} aria-hidden />
      <span className="flex-1">Search a craving to cook your first dish</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss tip"
        className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
      >
        <X size={13} />
      </button>
    </div>
  );
}
