"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * SurveyShell — the chrome every survey step renders inside (planning.md §6.2
 * W1): a back chevron + segmented progress bar, a serif title + 15px subtitle,
 * a scrollable content slot, and a footer CTA pinned to the bottom with flex
 * `mt-auto` so the primary action is always visible at 375×667 (rule 10).
 */
export function SurveyShell({
  title,
  subtitle,
  stepIndex,
  stepCount,
  onBack,
  canBack,
  children,
  ctaLabel,
  onCta,
  ctaDisabled,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  subtitle?: string;
  /** 0-based index of the current step. */
  stepIndex: number;
  stepCount: number;
  onBack: () => void;
  canBack: boolean;
  children: ReactNode;
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  /** Optional one-tap skip / secondary action below the CTA. */
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col bg-[var(--nourish-cream)]">
      {/* Back + segmented progress (one segment per step). */}
      <div className="flex items-center gap-3 px-[var(--gutter)] pb-1 pt-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canBack}
          aria-label="Back"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
            canBack
              ? "border-[var(--nourish-border-strong)] text-[var(--nourish-dark)] hover:bg-white"
              : "pointer-events-none border-transparent text-transparent",
          )}
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>
        <div
          className="flex flex-1 items-center gap-1"
          role="progressbar"
          aria-label="Survey progress"
          aria-valuemin={1}
          aria-valuenow={stepIndex + 1}
          aria-valuemax={stepCount}
        >
          {Array.from({ length: stepCount }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= stepIndex
                  ? "bg-[var(--nourish-green)]"
                  : "bg-[var(--nourish-border)]",
              )}
            />
          ))}
        </div>
      </div>

      {/* Title + subtitle. Omitted (empty title) for interstitial / mirror
          steps, which render their own centered headline. */}
      {title && (
        <div className="px-[var(--gutter)] pb-2 pt-4">
          <h2 className="font-serif text-[clamp(1.625rem,6vw,1.875rem)] font-normal leading-[1.12] [text-wrap:balance] text-[var(--nourish-dark)]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 text-[15px] leading-snug text-[var(--nourish-subtext)]">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Step content. */}
      <div className="flex-1 overflow-y-auto px-[var(--gutter)] py-2">
        {children}
      </div>

      {/* Footer — pinned with mt-auto (rule 10). */}
      <div className="mt-auto space-y-2 px-[var(--gutter)] pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
        <button
          type="button"
          onClick={onCta}
          disabled={ctaDisabled}
          className={cn(
            "flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-all",
            ctaDisabled
              ? "cursor-not-allowed bg-[var(--nourish-border-strong)] text-[var(--nourish-subtext)]"
              : "bg-[var(--nourish-green)] text-white shadow-[var(--shadow-cta)] hover:bg-[var(--nourish-dark-green)] active:scale-[0.99]",
          )}
        >
          {ctaLabel}
        </button>
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className="h-9 w-full text-[13px] font-medium text-[var(--nourish-subtext)] transition-colors hover:text-[var(--nourish-green)]"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
