"use client";

import { useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { isFirstRunSeen, markFirstRunSeen } from "@/lib/engagement/first-run";

/** Optional personalization appears after the meal, never before it. */
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
    dismiss();
    onPersonalize?.();
  };

  return (
    <div className="flex min-h-11 items-center border-y border-[var(--nourish-border-soft)] py-1">
      <button
        type="button"
        onClick={onPersonalize ? personalize : dismiss}
        aria-label="Tune taste"
        className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left text-[13px] font-medium text-[var(--nourish-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      >
        <span className="min-w-0 flex-1">Tune meals to your taste</span>
        <ChevronRight
          size={16}
          className="shrink-0 text-[var(--nourish-subtext)]"
          aria-hidden
        />
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss tip"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      >
        <X size={15} />
      </button>
    </div>
  );
}
