"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

/**
 * Curated cooking tips — one shown per day, deterministically rotated.
 * Each tip is ≤ 2 sentences and teaches something actionable in 10 seconds.
 * These build confidence toward actually cooking, not trivia for trivia's sake.
 */
const DAILY_TIPS = [
  "Salt your pasta water until it tastes like the sea. It's the only chance to season the pasta itself.",
  "Let your pan heat up before adding oil. A hot pan sears instead of steaming.",
  "Pat meat dry with a paper towel before cooking. Surface moisture blocks browning.",
  "Taste as you go — seasoning at the end is a rescue, not a plan.",
  "Rest your meat after cooking. Five minutes lets juices redistribute instead of running out.",
  "A sharp knife is safer than a dull one. Dull blades slip; sharp blades go where you aim.",
  "Don't crowd the pan. Ingredients need space to brown, not steam.",
  "Acid brightens everything. A squeeze of lemon can rescue a flat dish.",
  "Read the whole recipe before you start. Surprises belong in movies, not mid-cook.",
  "Mise en place — prep everything before you turn on the heat. It makes cooking calm instead of chaotic.",
  "Toast your spices in a dry pan for 30 seconds before using them. The aroma will tell you when they're ready.",
  "Deglaze your pan with a splash of liquid after searing. Those brown bits are pure flavor.",
  "Room temperature ingredients cook more evenly. Take eggs and butter out 20 minutes early.",
  "A pinch of sugar can balance too much acid. A dash of vinegar can cut too much sweetness.",
  "Finish pasta in the sauce, not on the plate. The last 60 seconds in the pan marry everything together.",
  "Garlic burns fast. Add it after your onions are soft, not at the start.",
  "Taste your rice water — if it's bland, your rice will be bland. Season it.",
  "Stir less than you think. Constant stirring prevents the fond that builds flavor.",
  "Invest in one good pan rather than a full set. A 12-inch stainless skillet handles 80% of cooking.",
  "Residual heat keeps cooking food after you remove it. Pull things off a touch early.",
  "Fresh herbs go in at the end; dried herbs go in at the start. They release flavor differently.",
  "When in doubt, add less. You can always add more salt, but you can't take it back.",
  "Onions need patience. Low heat and 15 minutes gives you caramelization. High heat gives you burnt edges.",
  "The best seasoning is contrast. Sweet with salty, rich with acidic, soft with crunchy.",
  "If your sauce is thin, let it simmer uncovered. Evaporation is a free thickener.",
  "Warm your plates before serving. Hot food on a cold plate loses heat fast.",
  "Scrambled eggs are done before they look done. Pull them off when slightly wet — carryover finishes the job.",
  "Fresh ginger peels easily with a spoon. No knife needed, less waste.",
  "Bloom your tomato paste in oil for 30 seconds before adding liquid. It deepens the flavor dramatically.",
  "Your nose knows before your timer does. If something smells done, check it.",
];

const DISMISS_KEY = "sous-daily-tip-dismissed";

/** Returns the day-of-year (0–365) for deterministic tip rotation. */
function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isDismissedToday(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return false;
    return stored === String(dayOfYear());
  } catch {
    return false;
  }
}

function dismissToday(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISMISS_KEY, String(dayOfYear()));
  } catch {
    // localStorage unavailable
  }
}

/**
 * CookingTipCard — a single daily micro-content card that teaches
 * something actionable in 10 seconds. Dismissible per day.
 * Noom's insight: daily touchpoints outside the core action build habit.
 */
export function CookingTipCard() {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(isDismissedToday());
  }, []);

  if (!mounted || dismissed) return null;

  const tipIndex = dayOfYear() % DAILY_TIPS.length;
  const tip = DAILY_TIPS[tipIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="rounded-xl border border-[var(--nourish-gold)]/20 bg-[var(--nourish-gold)]/[0.06] px-3.5 py-3"
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--nourish-gold)]/15">
            <Lightbulb
              size={13}
              className="text-[var(--nourish-gold)]"
              strokeWidth={2.2}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nourish-gold)] mb-0.5">
              Today&apos;s tip
            </p>
            <p className="text-[13px] leading-relaxed text-[var(--nourish-dark)]">
              {tip}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              dismissToday();
              setDismissed(true);
            }}
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--nourish-subtext)]/50 hover:text-[var(--nourish-subtext)] transition-colors"
            aria-label="Dismiss today's tip"
          >
            <X size={13} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
