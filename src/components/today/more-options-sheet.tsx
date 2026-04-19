"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Moon, Users, Snowflake, Gamepad2, Sparkles } from "lucide-react";
import { TonightChip } from "@/components/today/tonight-chip";
import { CookForTwoChip } from "@/components/today/cook-for-two-chip";
import { cn } from "@/lib/utils/cn";

interface MoreOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  onRescueFridge?: () => void;
  onPlayGame?: () => void;
  onPersonalize?: () => void;
}

/**
 * MoreOptionsSheet  -  a bottom-sheet that gathers the Today page's
 * non-primary controls into a single hidden surface.
 *
 * Rationale: older first-time users were seeing Tonight-commit, Cook-for-two,
 * Rescue-fridge, and Play-game all on the home surface at once. Each of
 * these is a side-pocket feature; collectively they clutter the hero. This
 * drawer lets them live at one tap remove without being cut from the product.
 */
export function MoreOptionsSheet({
  open,
  onClose,
  onRescueFridge,
  onPlayGame,
  onPersonalize,
}: MoreOptionsSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close more options"
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="More options"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-[var(--nourish-cream)] px-5 pt-4 pb-6 shadow-2xl sm:rounded-3xl sm:m-4"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--nourish-border-strong)] sm:hidden" />
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
                More options
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-white/70"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--nourish-subtext)]">
                  <Moon size={11} />
                  Tonight&apos;s cook
                </p>
                <TonightChip mode="commit-only" />
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--nourish-subtext)]">
                  <Users size={11} />
                  Cooking for two?
                </p>
                <CookForTwoChip />
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--nourish-subtext)]">
                  Quick helpers
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {onRescueFridge && (
                    <SheetActionButton
                      icon={Snowflake}
                      label="Rescue my fridge"
                      onClick={() => {
                        onRescueFridge();
                        onClose();
                      }}
                    />
                  )}
                  {onPlayGame && (
                    <SheetActionButton
                      icon={Gamepad2}
                      label="Play a game"
                      onClick={() => {
                        onPlayGame();
                        onClose();
                      }}
                    />
                  )}
                  {onPersonalize && (
                    <SheetActionButton
                      icon={Sparkles}
                      label="Personalize"
                      onClick={() => {
                        onPersonalize();
                        onClose();
                      }}
                      tone="accent"
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SheetActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "neutral",
}: {
  icon: typeof Snowflake;
  label: string;
  onClick: () => void;
  tone?: "neutral" | "accent";
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "flex min-h-[52px] items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
        tone === "accent"
          ? "border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/8 text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/12"
          : "border-[var(--nourish-border)] bg-white text-[var(--nourish-dark)] hover:border-[var(--nourish-green)]/30",
      )}
    >
      <Icon size={16} className="shrink-0" strokeWidth={2} />
      <span className="leading-tight">{label}</span>
    </motion.button>
  );
}
