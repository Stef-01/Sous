"use client";

/**
 * EmptyState — Y3 W30 reusable empty-state component.
 *
 * Single component that the recipes / scrapbook / cuisines /
 * shopping-list / pantry surfaces all use for visual rhythm
 * across cold-start states. Same shape every time:
 *   icon (in coloured frame) → headline → body → optional CTA.
 *
 * Pure-rendering. Reduced-motion safe (no animations).
 *
 * The Sprint K accessibility audit (W41-W44) will assert that
 * every empty surface in the app routes through this component
 * so the audit only has to check one component for WCAG 2.1
 * AA compliance.
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  /** Lucide icon rendered in the coloured frame above the
   *  headline. Calm, on-brand visual signal. */
  icon: LucideIcon;
  /** Short headline — 1 line, "what's missing here". */
  headline: string;
  /** Optional supporting copy — 1-2 sentences explaining
   *  WHY this surface is empty + what filling it does. */
  body?: string;
  /** Optional primary CTA — e.g. "Add your first recipe". */
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Visual tone. 'subtle' for in-list empties (filter
   *  result none), 'warm' for first-cold-start surfaces. */
  tone?: "subtle" | "warm";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  headline,
  body,
  primaryAction,
  tone = "warm",
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-dashed text-center",
        tone === "warm"
          ? "border-[var(--nourish-border-strong)] bg-white/70 px-6 py-12 shadow-inner"
          : "border-neutral-200 bg-white/40 px-4 py-6",
        className,
      )}
    >
      {tone === "warm" && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
          <Icon
            size={24}
            className="text-[var(--nourish-green)]"
            strokeWidth={1.8}
            aria-hidden
          />
        </div>
      )}
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-[var(--nourish-dark)]">
          {headline}
        </p>
        {body && (
          <p className="mx-auto max-w-[260px] text-xs leading-relaxed text-[var(--nourish-subtext)]">
            {body}
          </p>
        )}
      </div>
      {primaryAction && (
        <button
          type="button"
          onClick={primaryAction.onClick}
          className={cn(
            "rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition-colors",
            "hover:bg-[var(--nourish-dark-green)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
          )}
        >
          {primaryAction.label}
        </button>
      )}
    </div>
  );
}
