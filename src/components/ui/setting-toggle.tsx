"use client";

import { cn } from "@/lib/utils/cn";

type ToggleSize = "sm" | "md";

interface SettingToggleProps {
  /** Controlled on/off state. */
  checked: boolean;
  /** Fires with the *next* value when the user flips it. */
  onChange: (next: boolean) => void;
  /** Accessible name (the switch's label for screen readers). */
  label?: string;
  disabled?: boolean;
  /** md (default) = 48×28 track / 24px knob. sm = 40×24 / 20px knob. */
  size?: ToggleSize;
  className?: string;
}

const SIZES: Record<ToggleSize, { track: string; knob: string; on: string }> = {
  md: {
    track: "h-7 w-12", // 28 × 48
    knob: "h-6 w-6", // 24
    on: "translate-x-5", // 20px → centers the 24px knob in a 48px track
  },
  sm: {
    track: "h-6 w-10", // 24 × 40
    knob: "h-5 w-5", // 20
    on: "translate-x-[18px]",
  },
};

/**
 * SettingToggle — the one binary on/off switch for the app.
 *
 * Canonical track size, colors (--nourish-green on / neutral-200 off), knob
 * size + travel, and a CSS-transform transition that is automatically
 * neutralised under prefers-reduced-motion by the global rule in globals.css —
 * so no per-component reduced-motion branch is needed. Replaces six hand-rolled
 * toggles that had drifted on animation (spring vs CSS), off-color, knob size,
 * and travel distance.
 *
 * Accessibility: role="switch" + aria-checked, focusable, Space/Enter toggle
 * (native <button>), visible focus ring. Haptics / analytics / optimistic state
 * stay in the caller's onChange so this remains a pure presentational primitive.
 */
export function SettingToggle({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  className,
}: SettingToggleProps) {
  const s = SIZES[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        s.track,
        checked ? "bg-[var(--nourish-green)]" : "bg-neutral-200",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block rounded-full bg-white shadow transition-transform",
          s.knob,
          checked ? s.on : "translate-x-0.5",
        )}
      />
    </button>
  );
}
