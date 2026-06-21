"use client";

/**
 * Presentational leaves of the fullscreen meal-swipe queue, extracted from
 * quest-card to keep that file focused on the queue's state machine.
 *
 * FullscreenSwipeCard is the draggable Tinder-style card; QueueComplete is the
 * end-of-deck screen. Both are pure (props in, no shared state). Drag stays
 * fully functional under reduced-motion; only the decorative rotate / scale /
 * stack-offset / spring are gated off (satisfies sous/reduced-motion-gate and
 * is a real a11y win — the swipe card previously animated regardless).
 */

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { Check, ChefHat, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { haptic } from "@/lib/motion/haptics";
import { DishImage } from "./dish-image";
import { primaryActionLabel } from "./quest-pool";
import type { QuestDish } from "./quest-card";

export const FULLSCREEN_SWIPE_THRESHOLD = 110;
export const QUEUE_EXIT_MS = 240;

export function FullscreenSwipeCard({
  dish,
  stackIndex,
  isTop,
  exitDirection,
  exitX = 0,
  exitDurationS = QUEUE_EXIT_MS / 1000,
  onSwipe,
}: {
  dish: QuestDish;
  stackIndex: number;
  isTop: boolean;
  exitDirection: "left" | "right" | null;
  /** Signed px the card flies on exit. The overlay velocity-boosts this so a
   *  hard fling rockets off-screen and a gentle release drifts (R3). */
  exitX?: number;
  /** Exit duration (s) — shorter for a fast fling, capped at QUEUE_EXIT_MS so
   *  the deck-advance timeout always outlasts the animation. */
  exitDurationS?: number;
  onSwipe: (direction: "left" | "right", velocityX?: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-13, 13]);

  // W22b "threshold snap": the drag pops a Cook/Pass stamp + fires one haptic
  // the moment the release threshold arms (re-arms when you pull back). The
  // stamp ramps sharply over the last ~50px so it reads as a snap, not a fade.
  const cookStampOpacity = useTransform(
    x,
    [55, FULLSCREEN_SWIPE_THRESHOLD],
    [0, 1],
  );
  const cookStampScale = useTransform(
    x,
    [55, FULLSCREEN_SWIPE_THRESHOLD],
    [0.72, 1],
  );
  const passStampOpacity = useTransform(
    x,
    [-FULLSCREEN_SWIPE_THRESHOLD, -55],
    [1, 0],
  );
  const passStampScale = useTransform(
    x,
    [-FULLSCREEN_SWIPE_THRESHOLD, -55],
    [1, 0.72],
  );
  const armedRef = useRef(false);
  useMotionValueEvent(x, "change", (latest) => {
    const armed = Math.abs(latest) > FULLSCREEN_SWIPE_THRESHOLD;
    if (armed && !armedRef.current) haptic("select");
    armedRef.current = armed;
  });

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const strongVelocity = Math.abs(info.velocity.x) > 650;
    const farEnough = Math.abs(info.offset.x) > FULLSCREEN_SWIPE_THRESHOLD;
    if (farEnough || (strongVelocity && Math.abs(info.offset.x) > 42)) {
      onSwipe(info.offset.x > 0 ? "right" : "left", info.velocity.x);
    }
  };

  const scale = reducedMotion ? 1 : 1 - stackIndex * 0.045;
  const y = reducedMotion ? 0 : stackIndex * 14;
  const peekRotate = reducedMotion
    ? 0
    : stackIndex === 1
      ? 2.2
      : stackIndex === 2
        ? -1.6
        : 0;

  return (
    <motion.div
      className="absolute inset-0 px-3 pb-[126px] pt-[104px]"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? (reducedMotion ? 0 : rotate) : peekRotate,
        zIndex: 20 - stackIndex,
      }}
      initial={
        reducedMotion
          ? { opacity: stackIndex === 0 ? 0 : 1 }
          : {
              opacity: stackIndex === 0 ? 0 : 1,
              scale: scale - 0.02,
              y: y + 10,
            }
      }
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale, y }}
      exit={
        reducedMotion
          ? { opacity: 0, transition: { duration: QUEUE_EXIT_MS / 1000 } }
          : {
              x: exitX,
              rotate:
                exitDirection === "right"
                  ? 18
                  : exitDirection === "left"
                    ? -18
                    : 0,
              opacity: 0,
              // easeOut, not easeIn: a flung card is already moving fast at
              // release, so it should coast off-screen, not pause-then-accelerate.
              transition: { duration: exitDurationS, ease: "easeOut" },
            }
      }
      transition={
        reducedMotion
          ? { duration: 0.2 }
          : { type: "spring", stiffness: 320, damping: 32 }
      }
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.62}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <article
        className={cn(
          "relative h-full overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-white",
          isTop && "cursor-grab active:cursor-grabbing",
        )}
        aria-label={`${dish.dishName}, ${dish.cuisineFamily}`}
      >
        <DishImage dish={dish} priority={isTop} fit="cover" />
        {/* Time pill on the photo — the reference mockups' signature recipe-card
            treatment (translucent pill, bottom-left). The time was removed from the
            meta line below so it isn't duplicated. */}
        {dish.cookTimeMinutes > 0 && (
          <span className="absolute bottom-3 left-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-[var(--nourish-dark)] shadow-sm backdrop-blur-sm">
            {dish.cookTimeMinutes >= 60
              ? `${Math.floor(dish.cookTimeMinutes / 60)}hr ${dish.cookTimeMinutes % 60 ? `${dish.cookTimeMinutes % 60}min` : ""}`.trim()
              : `${dish.cookTimeMinutes} min`}
          </span>
        )}
        {/* Threshold stamps — visible only while dragging the top card. */}
        {isTop && (
          <>
            <motion.span
              aria-hidden
              style={{
                opacity: cookStampOpacity,
                scale: reducedMotion ? 1 : cookStampScale,
              }}
              className="absolute left-4 top-4 z-10 inline-flex -rotate-12 items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[13px] font-bold uppercase tracking-wide text-neutral-950 shadow-lg"
            >
              <ChefHat size={15} strokeWidth={2.4} />
              {primaryActionLabel(dish)}
            </motion.span>
            <motion.span
              aria-hidden
              style={{
                opacity: passStampOpacity,
                scale: reducedMotion ? 1 : passStampScale,
              }}
              className="absolute right-4 top-4 z-10 inline-flex rotate-12 items-center gap-1.5 rounded-xl border-2 border-white bg-black/45 px-3 py-1.5 text-[13px] font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-sm"
            >
              <X size={15} strokeWidth={2.6} />
              Pass
            </motion.span>
          </>
        )}
      </article>
    </motion.div>
  );
}

export function QueueComplete({
  onReset,
  onClose,
}: {
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-7 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/12 text-white">
        <Check size={28} strokeWidth={2.2} />
      </div>
      <h3 className="mt-6 font-serif text-[40px] leading-none tracking-tight">
        Queue complete
      </h3>
      <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-white/64">
        Reset for another pass, or head back to Today.
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/12 bg-white/10 px-5 text-sm font-semibold text-white"
        >
          <RotateCcw size={16} />
          Reset queue
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-12 text-sm font-medium text-white/62"
        >
          Back to Today
        </button>
      </div>
    </div>
  );
}
