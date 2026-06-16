"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const ROW_H = 44;
const PAD_ROWS = 2; // rows of padding so first/last value can reach center

/** Display-only conversion for the common unit pairs. The wheel always emits
 *  the canonical value (units[0]); switching units only re-labels. */
function formatValue(
  canonicalValue: number,
  canonicalUnit: string | undefined,
  displayUnit: string,
): string {
  if (!canonicalUnit || displayUnit === canonicalUnit) {
    return canonicalUnit
      ? `${canonicalValue} ${canonicalUnit}`
      : `${canonicalValue}`;
  }
  if (canonicalUnit === "kg" && displayUnit === "lb") {
    return `${Math.round(canonicalValue * 2.20462)} lb`;
  }
  if (canonicalUnit === "cm" && displayUnit === "ftin") {
    const totalIn = Math.round(canonicalValue / 2.54);
    return `${Math.floor(totalIn / 12)}′${totalIn % 12}″`;
  }
  if (canonicalUnit === "cm" && displayUnit === "in") {
    return `${Math.round(canonicalValue / 2.54)} in`;
  }
  return `${canonicalValue} ${displayUnit}`;
}

/**
 * WheelPicker — a scroll-snap value column (planning.md §6.2 W1, Family B). 5
 * visible rows, top/bottom fade masks, a center highlight band; the centered
 * value is the answer. An optional unit segmented control re-labels the column
 * in place while the emitted value stays in the canonical unit (units[0]).
 */
export function WheelPicker({
  min,
  max,
  step = 1,
  value,
  unit,
  units,
  onChange,
}: {
  min: number;
  max: number;
  step?: number;
  value: number;
  /** Canonical unit label (also units[0] when a toggle is offered). */
  unit?: string;
  /** Optional unit toggle; first entry is treated as canonical. */
  units?: { value: string; label: string }[];
  onChange: (next: number) => void;
}) {
  const values = useMemo(() => {
    const out: number[] = [];
    for (let v = min; v <= max; v += step) out.push(Number(v.toFixed(4)));
    return out;
  }, [min, max, step]);

  const canonicalUnit = unit ?? units?.[0]?.value;
  const [displayUnit, setDisplayUnit] = useState(canonicalUnit ?? "");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initialValueRef = useRef(value);
  const centeredRef = useRef(false);

  const indexOf = (v: number) => {
    const i = Math.round((v - min) / step);
    return Math.max(0, Math.min(values.length - 1, i));
  };

  // Centre the initial value once, when the scroll container mounts — a ref
  // callback (not an effect) so there's no dependency-array dance.
  const setScrollRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      if (el && !centeredRef.current) {
        centeredRef.current = true;
        const i = Math.max(
          0,
          Math.min(
            values.length - 1,
            Math.round((initialValueRef.current - min) / step),
          ),
        );
        el.scrollTop = i * ROW_H;
      }
    },
    [values.length, min, step],
  );

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ROW_H);
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      const next = values[clamped];
      if (next !== value) onChange(next);
    }, 90);
  }, [values, value, onChange]);

  useEffect(() => () => clearTimeout(settleRef.current), []);

  const scrollToIndex = (i: number) => {
    scrollRef.current?.scrollTo({ top: i * ROW_H, behavior: "smooth" });
  };

  const selectedIdx = indexOf(value);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-full max-w-[260px]"
        style={{ height: ROW_H * (PAD_ROWS * 2 + 1) }}
      >
        {/* Center highlight band. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-[var(--radius-md)] border-y border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/[0.05]"
          style={{ top: ROW_H * PAD_ROWS, height: ROW_H }}
        />
        {/* Fade masks. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10"
          style={{
            height: ROW_H * PAD_ROWS,
            background:
              "linear-gradient(to bottom, var(--nourish-cream), transparent)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: ROW_H * PAD_ROWS,
            background:
              "linear-gradient(to top, var(--nourish-cream), transparent)",
          }}
        />
        <div
          ref={setScrollRef}
          onScroll={onScroll}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={0}
          className="scrollbar-hide h-full snap-y snap-mandatory overflow-y-auto"
        >
          <div
            style={{
              paddingTop: ROW_H * PAD_ROWS,
              paddingBottom: ROW_H * PAD_ROWS,
            }}
          >
            {values.map((v, i) => (
              <button
                type="button"
                key={v}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  "flex w-full snap-center items-center justify-center text-[18px] tabular-nums transition-colors",
                  i === selectedIdx
                    ? "font-semibold text-[var(--nourish-dark)]"
                    : "text-[var(--nourish-subtext)]",
                )}
                style={{ height: ROW_H }}
              >
                {formatValue(v, canonicalUnit, displayUnit)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {units && units.length > 1 && (
        <div className="inline-flex rounded-full border border-[var(--nourish-border-strong)] bg-white p-0.5">
          {units.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => setDisplayUnit(u.value)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                displayUnit === u.value
                  ? "bg-[var(--nourish-green)] text-white"
                  : "text-[var(--nourish-subtext)]",
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
