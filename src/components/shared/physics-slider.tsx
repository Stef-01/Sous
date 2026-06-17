"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, SPRING } from "@/lib/motion/tokens";
import { fractionToValue, valueToFraction } from "@/lib/motion/slider-math";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { cn } from "@/lib/utils/cn";

/**
 * PhysicsSlider (E5) — a tactile replacement for a dead native `<input
 * type=range>`. The thumb springs to magnetic integer stops, a ripple flashes
 * on each catch, and a light haptic fires — so a settings slider feels physical,
 * not like a web input.
 *
 * Real, not decorative:
 *  - Full slider a11y: role=slider + aria-valuemin/max/now/valuetext + keyboard
 *    (←/↓ −step, →/↑ +step, Home/End to the bounds).
 *  - Reduced-motion: the spring + ripple collapse to instant; drag + keyboard
 *    still work.
 * Momentum + rubber-band are intentionally omitted — for a short discrete slider
 * crisp magnetic snaps read better than overshoot (they belong on free-scroll).
 */
export function PhysicsSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
  formatValue,
  className,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  ariaLabel: string;
  /** aria-valuetext + the optional on-thumb readout. */
  formatValue?: (v: number) => string;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const haptic = useHaptic();
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [catches, setCatches] = useState(0); // bumped on each new stop (ripple key)
  const fraction = valueToFraction(value, min, max);

  const commit = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped !== value) {
      onChange(clamped);
      setCatches((n) => n + 1);
      haptic();
    }
  };

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    commit(fractionToValue((clientX - rect.left) / rect.width, min, max, step));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromClientX(e.clientX);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = value - step;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = value + step;
    else if (e.key === "Home") next = min;
    else if (e.key === "End") next = max;
    if (next === null) return;
    e.preventDefault();
    commit(next);
  };

  // Springy glide to each integer stop = the magnetic feel (instant under RM).
  const thumbTransition = reducedMotion ? { duration: 0 } : SPRING.snappy;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={formatValue ? formatValue(value) : String(value)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex h-9 w-full cursor-pointer touch-none select-none items-center focus-visible:outline-none",
        className,
      )}
    >
      {/* track */}
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-neutral-200" />
      {/* fill */}
      <div
        className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--nourish-green)]"
        style={{ width: `${fraction * 100}%` }}
      />
      {/* thumb (springs to the stop) */}
      <motion.div
        className="absolute top-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-[var(--shadow-card)] ring-1 ring-[var(--nourish-green)]/35"
        style={{ x: "-50%", y: "-50%" }}
        animate={{ left: `${fraction * 100}%`, scale: dragging ? 1.12 : 1 }}
        transition={thumbTransition}
      >
        {/* catch ripple — a quick pulse each time the thumb lands on a new stop */}
        {!reducedMotion && catches > 0 && (
          <motion.span
            key={catches}
            aria-hidden
            initial={{ scale: 0.5, opacity: 0.45 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE.out }}
            className="absolute inset-0 rounded-full bg-[var(--nourish-green)]/40"
          />
        )}
      </motion.div>
    </div>
  );
}
