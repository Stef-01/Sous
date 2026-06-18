"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Lightbulb,
  BookOpen,
  MessageCircleQuestion,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useMistakeSuppression } from "@/lib/hooks/use-mistake-suppression";

/**
 * StepHelpRow  -  the per-step helpers (common mistake / quick hack / cuisine
 * fact / ask) as a single tidy row of ICON buttons, not stacked word-labelled
 * cards (rule 13: minimal visual text, disclosure on tap). Tapping an icon
 * expands its content full-width directly below the row; the meaning lives in
 * the aria-label + the panel, never in inline prose.
 *
 * The "ask" icon is part of this row for visual unity, but its panel (the Q&A
 * input + answer) is owned by the parent StepCard — so the parent renders that
 * panel right below this component when `askActive`.
 */

type ChipKey = "mistake" | "hack" | "fact";

interface HelpItem {
  key: ChipKey;
  icon: LucideIcon;
  /** Accessible name + tooltip. */
  label: string;
  /** Active-state classes for the icon button. */
  activeBtn: string;
  /** The expanded content panel classes. */
  panel: string;
  content: string;
}

interface StepHelpRowProps {
  mistakeWarning?: string | null;
  /** Pass only when the hack should be a chip — the caller gates W5 density. */
  quickHack?: string | null;
  cuisineFact?: string | null;
  expandedChip: ChipKey | null;
  onToggleChip: (chip: ChipKey | null) => void;
  askActive: boolean;
  onToggleAsk: () => void;
  /** Enables per-dish mistake suppression. */
  dishSlug?: string;
  stepNumber?: number;
}

function IconButton({
  icon: Icon,
  label,
  active,
  activeClass,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={reducedMotion ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
        active
          ? activeClass
          : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300 hover:text-[var(--nourish-dark)]",
      )}
    >
      <Icon size={18} strokeWidth={2} />
    </motion.button>
  );
}

export function StepHelpRow({
  mistakeWarning,
  quickHack,
  cuisineFact,
  expandedChip,
  onToggleChip,
  askActive,
  onToggleAsk,
  dishSlug,
  stepNumber,
}: StepHelpRowProps) {
  const reducedMotion = useReducedMotion();
  const { isSuppressed, suppress, mounted } = useMistakeSuppression();
  const mistakeId =
    typeof stepNumber === "number" ? `step-${stepNumber}` : null;
  const canSuppress = !!dishSlug && !!mistakeId;
  const mistakeSuppressed =
    canSuppress && mounted && isSuppressed(dishSlug!, mistakeId!);

  const items: HelpItem[] = [];
  if (mistakeWarning && !mistakeSuppressed) {
    items.push({
      key: "mistake",
      icon: AlertTriangle,
      label: "Common mistake",
      activeBtn: "border-amber-300/60 bg-amber-50 text-amber-700",
      panel: "bg-amber-50/60 text-amber-800",
      content: mistakeWarning,
    });
  }
  if (quickHack) {
    items.push({
      key: "hack",
      icon: Lightbulb,
      label: "Quick hack",
      activeBtn: "border-blue-300/60 bg-blue-50 text-blue-700",
      panel: "bg-blue-50/60 text-blue-800",
      content: quickHack,
    });
  }
  if (cuisineFact) {
    items.push({
      key: "fact",
      icon: BookOpen,
      label: "Cuisine fact",
      activeBtn: "border-purple-300/60 bg-purple-50 text-purple-700",
      panel: "bg-purple-50/60 text-purple-800",
      content: cuisineFact,
    });
  }

  // Nothing to show and no ask trigger → render nothing.
  if (items.length === 0) {
    return (
      <div className="flex items-center">
        <IconButton
          icon={MessageCircleQuestion}
          label="Ask about this step"
          active={askActive}
          activeClass="border-[var(--nourish-green)]/40 bg-[var(--nourish-green)]/8 text-[var(--nourish-green)]"
          onClick={onToggleAsk}
        />
      </div>
    );
  }

  const active = items.find((i) => i.key === expandedChip) ?? null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {items.map((item) => (
          <IconButton
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={expandedChip === item.key}
            activeClass={item.activeBtn}
            onClick={() =>
              onToggleChip(expandedChip === item.key ? null : item.key)
            }
          />
        ))}
        <IconButton
          icon={MessageCircleQuestion}
          label="Ask about this step"
          active={askActive}
          activeClass="border-[var(--nourish-green)]/40 bg-[var(--nourish-green)]/8 text-[var(--nourish-green)]"
          onClick={onToggleAsk}
        />
      </div>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key={active.key}
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "rounded-xl px-3.5 py-3 text-sm leading-relaxed",
                active.panel,
              )}
            >
              <p className="select-text">{active.content}</p>
              {active.key === "mistake" && canSuppress && (
                <button
                  type="button"
                  onClick={() => suppress(dishSlug!, mistakeId!)}
                  className="mt-2 text-xs font-medium text-amber-700/70 underline-offset-2 hover:text-amber-800 hover:underline"
                >
                  Got it — don&apos;t remind me on this dish
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
