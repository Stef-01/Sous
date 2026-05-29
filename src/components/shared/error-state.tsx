"use client";

/**
 * ErrorState — Y3 W43 error-state primitive.
 *
 * Standard error visual the recipe list / pod gallery / Today
 * search / pantry scan all use when a render or fetch fails.
 * Three tiers per the W43 plan:
 *   - 'recoverable':  fetch failed; offer retry
 *   - 'degraded':     fell back to stub mode; offer details +
 *                     'use anyway' affordance
 *   - 'blocking':     unrecoverable; show with a clear next-step
 *
 * Aria-live for the recoverable + degraded tiers so screen-
 * reader users hear the new error state. Blocking tier uses
 * role='alert' for assertive announcement.
 *
 * Sprint K accessibility audit (W41-W44) routes every error
 * surface through this component for one-place WCAG 2.1 AA
 * compliance.
 */

import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ErrorStateTier = "recoverable" | "degraded" | "blocking";

export interface ErrorStateProps {
  tier: ErrorStateTier;
  /** Headline — what failed in plain English. */
  headline: string;
  /** Optional supporting copy. Brief; the user is already
   *  frustrated. */
  body?: string;
  /** Optional retry handler — only shown when tier is
   *  'recoverable'. */
  onRetry?: () => void;
  /** Optional secondary action — 'use anyway' for degraded
   *  tier; 'tell us about this' / 'get help' for blocking. */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Custom child content rendered below the body — for
   *  callers that want to embed extra detail (e.g. error code,
   *  sentry id). */
  children?: ReactNode;
  className?: string;
}

const TIER_VISUAL: Record<
  ErrorStateTier,
  {
    icon: typeof AlertCircle;
    iconColour: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  recoverable: {
    icon: RefreshCw,
    iconColour: "text-[var(--nourish-gold)]",
    bgClass: "bg-[var(--nourish-gold)]/8",
    borderClass: "border-[var(--nourish-gold)]/25",
  },
  degraded: {
    icon: AlertTriangle,
    iconColour: "text-[var(--nourish-gold)]",
    bgClass: "bg-[var(--nourish-input-bg)]",
    borderClass: "border-[var(--nourish-border-strong)]",
  },
  blocking: {
    icon: AlertCircle,
    iconColour: "text-[var(--nourish-evaluate)]",
    bgClass: "bg-[var(--nourish-evaluate)]/5",
    borderClass: "border-[var(--nourish-evaluate)]/30",
  },
};

export function ErrorState({
  tier,
  headline,
  body,
  onRetry,
  secondaryAction,
  children,
  className,
}: ErrorStateProps) {
  const visual = TIER_VISUAL[tier];
  const Icon = visual.icon;
  const role = tier === "blocking" ? "alert" : "status";
  const ariaLive = tier === "blocking" ? "assertive" : "polite";

  return (
    <section
      role={role}
      aria-live={ariaLive}
      className={cn(
        "rounded-2xl border px-4 py-3",
        visual.bgClass,
        visual.borderClass,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white",
          )}
        >
          <Icon size={16} className={visual.iconColour} aria-hidden />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--nourish-dark)]">
            {headline}
          </p>
          {body && (
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--nourish-subtext)]">
              {body}
            </p>
          )}
          {children}
        </div>
      </div>
      {(onRetry || secondaryAction) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tier === "recoverable" && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl bg-[var(--nourish-green)] px-3 py-1.5 text-xs font-semibold text-white shadow-[var(--shadow-cta)] transition-colors",
                "hover:bg-[var(--nourish-dark-green)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
              )}
            >
              <RefreshCw size={12} aria-hidden />
              Try again
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border border-[var(--nourish-border-strong)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--nourish-subtext)] transition-colors",
                "hover:bg-neutral-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
              )}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
