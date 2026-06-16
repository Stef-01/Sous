"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { X, Check, Quote } from "lucide-react";
import { FoodGlyph, isFoodGlyphName } from "@/components/icons/food-glyphs";
import type { SurveyStatement } from "@/types/survey";

const SWIPE_COMMIT = 100;

/**
 * StatementSwipe — a quote-card stack (planning.md §6.2 W1, Family A). The top
 * card drags with a slight rotate; releasing past the threshold records agree
 * (✓) or disagree (✗). A peeked next card telegraphs the deck. Two circle
 * buttons are the tap fallback and the ONLY control under
 * `prefers-reduced-motion` (no drag). The value maps statement id → agreed.
 */
export function StatementSwipe({
  statements,
  value,
  onChange,
}: {
  statements: SurveyStatement[];
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
}) {
  const reduced = useReducedMotion();
  const decidedCount = statements.filter((s) => s.id in value).length;
  const current = statements[decidedCount];
  const next = statements[decidedCount + 1];

  const decide = (agreed: boolean) => {
    if (!current) return;
    onChange({ ...value, [current.id]: agreed });
  };

  if (!current) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]">
          <Check size={24} strokeWidth={2.2} />
        </span>
        <p className="text-sm font-medium text-[var(--nourish-subtext)]">
          All set — tap Continue.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 pt-2">
      <div className="relative h-[260px] w-full max-w-[320px]">
        {next && (
          <div
            aria-hidden
            className="absolute inset-x-2 top-3 h-[236px] rounded-[var(--radius-lg)] border border-[var(--nourish-border)] bg-white"
            style={{ transform: "translateY(12px) scale(0.96)" }}
          />
        )}
        <StatementCard
          key={current.id}
          statement={current}
          reduced={!!reduced}
          onDecide={decide}
        />
      </div>

      <div className="flex items-center gap-12">
        <button
          type="button"
          onClick={() => decide(false)}
          aria-label={`Disagree: ${current.text}`}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--nourish-border)] bg-white text-[var(--nourish-evaluate)] shadow-[var(--shadow-raised)] transition-transform active:scale-95"
        >
          <X size={26} strokeWidth={2.4} />
        </button>
        <button
          type="button"
          onClick={() => decide(true)}
          aria-label={`Agree: ${current.text}`}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--nourish-border)] bg-white text-[var(--tier-strong)] shadow-[var(--shadow-raised)] transition-transform active:scale-95"
        >
          <Check size={26} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

function StatementCard({
  statement,
  reduced,
  onDecide,
}: {
  statement: SurveyStatement;
  reduced: boolean;
  onDecide: (agreed: boolean) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const noOpacity = useTransform(x, [-120, -20], [1, 0]);
  const yesOpacity = useTransform(x, [20, 120], [0, 1]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_COMMIT) onDecide(true);
    else if (info.offset.x < -SWIPE_COMMIT) onDecide(false);
  };

  return (
    <motion.div
      className="absolute inset-0 flex cursor-grab flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--nourish-border)] bg-white p-6 shadow-[var(--shadow-raised)] active:cursor-grabbing"
      style={reduced ? undefined : { x, rotate }}
      drag={reduced ? false : "x"}
      dragSnapToOrigin
      dragElastic={0.5}
      onDragEnd={reduced ? undefined : onDragEnd}
      whileTap={reduced ? undefined : { scale: 0.99 }}
    >
      <div className="flex items-center justify-between">
        <Quote
          size={28}
          strokeWidth={2}
          className="text-[var(--nourish-green)]/35"
          aria-hidden
        />
        {isFoodGlyphName(statement.glyph) && (
          <FoodGlyph
            name={statement.glyph}
            size={26}
            className="text-[var(--nourish-green)]/70"
          />
        )}
      </div>
      <p className="font-serif text-[22px] leading-[1.2] [text-wrap:balance] text-[var(--nourish-dark)]">
        {statement.text}
      </p>
      {!reduced && (
        <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-wide">
          <motion.span
            style={{ opacity: noOpacity }}
            className="text-[var(--nourish-evaluate)]"
          >
            Nope
          </motion.span>
          <motion.span
            style={{ opacity: yesOpacity }}
            className="text-[var(--tier-strong)]"
          >
            Yes
          </motion.span>
        </div>
      )}
    </motion.div>
  );
}
