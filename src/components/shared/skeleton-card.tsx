"use client";

/**
 * SkeletonCard — Y3 W42 loading-state primitive.
 *
 * Standard skeleton-shape loading visual the recipe list / pod
 * gallery / scrapbook / cuisine grid all use while content
 * hydrates. Same visual rhythm across surfaces; one component
 * to audit for WCAG compliance during Sprint K.
 *
 * Three variants:
 *   - 'card':       full hero-card placeholder (16:10 image +
 *                   title + meta). For recipe lists.
 *   - 'list-item':  short 2-line row. For ingredient lists +
 *                   shopping list rows.
 *   - 'avatar-row': avatar circle + 2 short lines. For pod
 *                   members + friends strip.
 *
 * Reduced-motion safe: shimmer animation respects user
 * preference. Aria-hidden so screen-reader users don't hear
 * the skeleton structure repeatedly during pagination.
 */

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export type SkeletonVariant = "card" | "list-item" | "avatar-row";

export interface SkeletonCardProps {
  variant?: SkeletonVariant;
  /** Number of skeleton rows to render. Default 1. */
  count?: number;
  className?: string;
}

export function SkeletonCard({
  variant = "card",
  count = 1,
  className,
}: SkeletonCardProps) {
  const reducedMotion = useReducedMotion();
  const items = Array.from({ length: Math.max(1, count) });
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-hidden
      className={cn(
        variant === "card" && "space-y-3",
        variant === "list-item" && "space-y-2",
        variant === "avatar-row" && "space-y-2",
        className,
      )}
    >
      {items.map((_, i) => (
        <SkeletonRow
          key={i}
          variant={variant}
          reducedMotion={reducedMotion ?? false}
        />
      ))}
    </div>
  );
}

function SkeletonRow({
  variant,
  reducedMotion,
}: {
  variant: SkeletonVariant;
  reducedMotion: boolean;
}) {
  const pulseClass = reducedMotion ? "" : "animate-pulse";
  if (variant === "card") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-[var(--nourish-border-soft)] bg-white",
          pulseClass,
        )}
      >
        <div
          className="bg-[var(--nourish-input-bg)]"
          style={{ aspectRatio: "16 / 10" }}
        />
        <div className="space-y-2 p-3">
          <div className="h-2 w-1/4 rounded bg-[var(--nourish-input-bg)]" />
          <div className="h-4 w-3/4 rounded bg-[var(--nourish-input-bg)]" />
          <div className="h-2 w-1/2 rounded bg-[var(--nourish-input-bg)]" />
        </div>
      </div>
    );
  }
  if (variant === "list-item") {
    return (
      <div
        className={cn(
          "rounded-xl border border-[var(--nourish-border-soft)] bg-white px-3 py-2.5",
          pulseClass,
        )}
      >
        <div className="space-y-1.5">
          <div className="h-3 w-2/3 rounded bg-[var(--nourish-input-bg)]" />
          <div className="h-2 w-1/3 rounded bg-[var(--nourish-input-bg)]" />
        </div>
      </div>
    );
  }
  // avatar-row
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-[var(--nourish-border-soft)] bg-white p-3",
        pulseClass,
      )}
    >
      <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--nourish-input-bg)]" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-1/2 rounded bg-[var(--nourish-input-bg)]" />
        <div className="h-2 w-1/3 rounded bg-[var(--nourish-input-bg)]" />
      </div>
    </div>
  );
}
