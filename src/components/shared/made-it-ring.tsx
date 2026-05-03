"use client";

/**
 * MadeItRing — UX-recon pattern #10 (Y3 polish-week backfill).
 *
 * A small circular SVG ring whose fill arc represents progress
 * toward a target — typically "cooks completed in this cuisine /
 * pod / recipe." Three visual states, all driven by the same
 * count/target props:
 *   - empty:   never made (count=0). Outline ring, dim.
 *   - partial: in progress (1 ≤ count < target). Filled arc.
 *   - full:    target reached (count ≥ target). Full ring + tick.
 *
 * Reused across:
 *   - Pod gallery (per-member or per-pod cooks-this-week)
 *   - Cuisine cards on /path/cuisines (cooks-in-cuisine)
 *   - Bake-sale recipe cards (cooks-of-this-recipe)
 *   - Per-recipe rings on /path/recipes
 *
 * Pure-rendering component — no hooks, no effects, no reads of
 * window/document. Safe to render in server components. The
 * arc-math helper is exported separately for unit tests.
 */

import { cn } from "@/lib/utils/cn";

export interface MadeItRingProps {
  /** Number of completed cooks counted toward the ring. */
  count: number;
  /** Target count at which the ring becomes "full". 5 is a
   *  reasonable default for cuisine fluency; pod gallery uses
   *  the pod's `cooksPerWeek` target. */
  target: number;
  /** Pixel diameter of the ring. Defaults to 48. */
  size?: number;
  /** Optional emoji or single character placed at the centre.
   *  Cuisine cards use a flag emoji here; pod gallery uses a
   *  member initial. */
  centerGlyph?: string;
  /** Optional aria-label override. Defaults to a descriptive
   *  count-of-target string. */
  ariaLabel?: string;
  className?: string;
}

/** Arc-stroke metrics for a given count + target. Pure helper
 *  exposed for unit tests. */
export interface RingMetrics {
  /** SVG stroke-dasharray for a 100-unit perimeter. The outer
   *  ring renders the arc; the partial arc is `progress` long
   *  out of 100. */
  progress: number;
  /** Visual state — drives styling (colour + tick). */
  state: "empty" | "partial" | "full";
}

/** Pure: compute the ring metrics from count + target.
 *  Defensive on negative / NaN / 0-target inputs. */
export function ringMetrics(count: number, target: number): RingMetrics {
  if (!Number.isFinite(count) || count <= 0) {
    return { progress: 0, state: "empty" };
  }
  if (!Number.isFinite(target) || target <= 0) {
    // Caller passed a bad target — treat any count as "full"
    // rather than producing NaN-shaped progress.
    return { progress: 100, state: "full" };
  }
  if (count >= target) {
    return { progress: 100, state: "full" };
  }
  return {
    progress: Math.min(99, Math.max(1, (count / target) * 100)),
    state: "partial",
  };
}

export function MadeItRing({
  count,
  target,
  size = 48,
  centerGlyph,
  ariaLabel,
  className,
}: MadeItRingProps) {
  const { progress, state } = ringMetrics(count, target);
  const radius = 18; // viewBox=44; inner ring fits 24x24 glyph
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress / 100);

  const trackStrokeColour =
    state === "empty"
      ? "var(--nourish-border-strong)"
      : "var(--nourish-green)/15";
  const fillStrokeColour =
    state === "full"
      ? "var(--nourish-green)"
      : state === "partial"
        ? "var(--nourish-gold)"
        : "transparent";
  const computedAriaLabel =
    ariaLabel ??
    (state === "empty"
      ? `Not yet cooked — target ${target}`
      : state === "full"
        ? `${count} cooks (target ${target} reached)`
        : `${count} of ${target} cooks`);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={computedAriaLabel}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        className="absolute inset-0"
      >
        {/* Track */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={trackStrokeColour}
          strokeWidth="3"
        />
        {/* Progress arc */}
        {state !== "empty" && (
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={fillStrokeColour}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 22 22)"
          />
        )}
      </svg>
      {/* Center glyph */}
      <span
        aria-hidden
        className={cn(
          "relative flex items-center justify-center",
          state === "empty" && "text-[var(--nourish-subtext)] opacity-60",
          state === "partial" && "text-[var(--nourish-dark)]",
          state === "full" && "text-[var(--nourish-green)]",
        )}
        style={{ fontSize: Math.max(12, size * 0.4) }}
      >
        {centerGlyph ?? (state === "full" ? "✓" : null)}
      </span>
    </div>
  );
}
