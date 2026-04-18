"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Check, X } from "lucide-react";
import { useCookIntention } from "@/lib/hooks/use-cook-intention";
import { cn } from "@/lib/utils/cn";

interface TonightChipProps {
  /**
   * Optional dish name to seed the input with — typically the currently
   * displayed quest dish. Makes "commit to this" a one-tap action.
   */
  suggested?: string;
  /**
   * Rendering mode.
   * - `full` (default): show the commit pill when no intention, banner when one exists.
   * - `banner-only`: render only the active-intention banner (returns `null` when empty).
   *   Used on the Today home page so the surface stays calm.
   * - `commit-only`: render only the commit pill/form (returns `null` if an intention
   *   already exists). Used inside the More options drawer.
   */
  mode?: "full" | "banner-only" | "commit-only";
}

/**
 * TonightChip — a soft, one-line ritual at the top of Today.
 *
 * Pre-commit: a single pill invites the user to name tonight's cook.
 * Post-commit: a calm banner affirms the choice and offers an equally
 * light-weight way to change or drop it. No nagging, no red badges.
 */
export function TonightChip({ suggested, mode = "full" }: TonightChipProps) {
  const { intention, mounted, commit, clear } = useCookIntention();
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [expanded]);

  useEffect(() => {
    if (expanded && suggested && !value) {
      // Seed the field exactly once when the form opens — mirrors the
      // hydration pattern we use elsewhere when a client-only fact must
      // appear in controlled state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(suggested);
    }
  }, [expanded, suggested, value]);

  if (!mounted) {
    // Reserve a tiny placeholder in `full` mode so layout doesn't jump.
    // Drawer + banner-only modes can render nothing — the drawer's own
    // layout handles spacing.
    if (mode === "full") return <div className="h-[46px]" aria-hidden />;
    return null;
  }

  const handleSubmit = () => {
    if (!value.trim()) return;
    commit(value);
    setExpanded(false);
  };

  if (intention) {
    if (mode === "commit-only") return null;
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`banner-${intention.dishName}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2 rounded-full border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/[0.06] px-3.5 py-2.5"
        >
          <Moon
            size={15}
            className="shrink-0 text-[var(--nourish-green)]"
            strokeWidth={2}
          />
          <p className="min-w-0 flex-1 truncate text-[13px] text-[var(--nourish-dark)]">
            Tonight:{" "}
            <span className="font-semibold text-[var(--nourish-green)]">
              {intention.dishName}
            </span>
          </p>
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-8 min-w-[44px] items-center justify-center rounded-full px-2 text-[11px] font-medium text-[var(--nourish-subtext)] hover:bg-white/60 hover:text-[var(--nourish-dark)]"
            aria-label="Clear tonight's cook"
          >
            Change
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (mode === "banner-only") return null;

  return (
    <AnimatePresence initial={false} mode="wait">
      {expanded ? (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2 rounded-full border border-[var(--nourish-border)] bg-white px-3 py-2 shadow-[var(--shadow-card)]"
        >
          <Moon
            size={15}
            className="shrink-0 text-[var(--nourish-subtext)]"
            strokeWidth={2}
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              if (!value.trim()) setExpanded(false);
            }}
            placeholder="What's for dinner?"
            aria-label="Tonight's cook"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)]/70 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Commit to tonight's cook"
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
              value.trim()
                ? "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]"
                : "bg-neutral-200 text-white cursor-not-allowed",
            )}
          >
            <Check size={15} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setValue("");
            }}
            aria-label="Cancel"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-neutral-100"
          >
            <X size={14} />
          </button>
        </motion.form>
      ) : (
        <motion.button
          key="chip"
          type="button"
          onClick={() => setExpanded(true)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          whileTap={{ scale: 0.98 }}
          className="group inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--nourish-border-strong)] bg-white/60 px-3.5 py-2 text-[13px] font-medium text-[var(--nourish-subtext)] transition-colors hover:border-[var(--nourish-green)]/50 hover:text-[var(--nourish-green)]"
        >
          <Moon size={14} className="shrink-0" strokeWidth={2} />
          Commit to tonight&apos;s cook
        </motion.button>
      )}
    </AnimatePresence>
  );
}
