"use client";

/**
 * AttentionPointerOverlay — MVP 4 of the cook-nav initiative.
 *
 * Renders one or more SVG pointers absolutely-positioned over a
 * step image, each anchored at a normalised (x, y) offset and
 * shaped as a pulsing circle or a small arrow. An optional short
 * label sits next to the pointer for cases where the visual alone
 * doesn't tell the cook what to look for.
 *
 * The overlay is purely decorative — `aria-hidden` on the SVG +
 * `role="presentation"` on the container — and the labels carry
 * `aria-live="polite"` so they're announced once when the step
 * changes (without colonising the screen reader for every pulse
 * tick).
 *
 * Animation is gated by the W7 ESLint rule's `useReducedMotion`
 * helper. Reduced motion → static circles, no pulse.
 *
 * MVP 5 (W36) will add sequenced animation across pointers; the
 * current shape returns one frame per pointer, which is a clean
 * substrate for that follow-on.
 */

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  resolvePointer,
  type AttentionPointer,
} from "@/lib/cook/attention-pointer";

export interface AttentionPointerOverlayProps {
  pointers: ReadonlyArray<AttentionPointer> | null | undefined;
  className?: string;
}

export function AttentionPointerOverlay({
  pointers,
  className,
}: AttentionPointerOverlayProps) {
  const reducedMotion = useReducedMotion();
  if (!pointers || pointers.length === 0) return null;

  return (
    <div
      role="presentation"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {pointers.map((p, idx) => {
        const r = resolvePointer(p);
        return (
          <div
            key={`pointer-${idx}-${r.xPct}-${r.yPct}`}
            className="absolute"
            style={{
              left: `${r.xPct}%`,
              top: `${r.yPct}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {r.shape === "circle" ? (
              <CirclePointer reducedMotion={!!reducedMotion} />
            ) : (
              <ArrowPointer reducedMotion={!!reducedMotion} />
            )}
            {r.label && (
              <span
                aria-live="polite"
                className="absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur"
              >
                {r.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CirclePointer({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden
      initial={false}
      animate={
        reducedMotion
          ? undefined
          : { scale: [1, 1.18, 1], opacity: [0.9, 1, 0.9] }
      }
      transition={
        reducedMotion
          ? undefined
          : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <circle
        cx="18"
        cy="18"
        r="14"
        stroke="white"
        strokeWidth="2.5"
        strokeOpacity="0.9"
      />
      <circle
        cx="18"
        cy="18"
        r="14"
        stroke="var(--nourish-green)"
        strokeWidth="1.5"
      />
    </motion.svg>
  );
}

function ArrowPointer({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      initial={false}
      animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <path
        d="M14 4 L20 16 L15 16 L15 24 L13 24 L13 16 L8 16 Z"
        fill="white"
        stroke="var(--nourish-green)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
