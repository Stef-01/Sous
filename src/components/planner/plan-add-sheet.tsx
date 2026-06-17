"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { sheetMotion } from "@/lib/motion/sheet";
import { searchDishes, customDishSlug } from "@/lib/utils/dish-lookup";
import { parseSlotKey, type SlotKey } from "@/types/meal-plan";

const DAY_LABEL: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/**
 * Plan add sheet — search the meal + side catalog (or type a custom meal) and
 * schedule it straight into a slot, so the planner isn't stuck on swipe cards.
 * A "Browse ideas" escape hatch still opens the swipe planner for discovery.
 */
export function PlanAddSheet({
  slot,
  onPick,
  onClose,
  onBrowseCards,
}: {
  slot: SlotKey;
  onPick: (slug: string) => void;
  onClose: () => void;
  onBrowseCards: () => void;
}) {
  const [q, setQ] = useState("");
  const trimmed = q.trim();
  const results = useMemo(() => searchDishes(trimmed), [trimmed]);
  const parsed = parseSlotKey(slot);
  const heading = parsed
    ? `Add to ${DAY_LABEL[parsed.day]} ${parsed.meal}`
    : "Add a meal";
  const exact = results.some(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const reducedMotion = useReducedMotion();

  const submitTop = () => {
    const pick = results[0]?.slug ?? (trimmed ? customDishSlug(trimmed) : null);
    if (pick) onPick(pick);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <button
        type="button"
        aria-label="Close"
        className="flex-1"
        onClick={onClose}
      />
      <motion.div
        {...sheetMotion(reducedMotion)}
        role="dialog"
        aria-modal="true"
        aria-label="Add a meal to the plan"
        className="rounded-t-3xl bg-[var(--nourish-cream)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <p className="text-[15px] font-semibold capitalize text-[var(--nourish-dark)]">
          {heading}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 transition-colors focus-within:border-[var(--nourish-green)]/45">
          <Search
            size={15}
            className="shrink-0 text-[var(--nourish-subtext)]"
            aria-hidden
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitTop();
              }
            }}
            placeholder="Search a dish, or type your own…"
            aria-label="Search dishes to add to the plan"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)] focus:outline-none"
          />
        </div>

        {trimmed.length >= 2 ? (
          <ul className="mt-2 max-h-[42vh] space-y-1 overflow-y-auto">
            {results.map((r) => (
              <li key={r.slug}>
                <button
                  type="button"
                  onClick={() => onPick(r.slug)}
                  className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left transition-colors hover:border-[var(--nourish-green)]/40"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-[var(--nourish-dark)]">
                    {r.name}
                  </span>
                  <Plus
                    size={15}
                    className="shrink-0 text-[var(--nourish-green)]"
                    aria-hidden
                  />
                </button>
              </li>
            ))}

            {!exact && (
              <li>
                <button
                  type="button"
                  onClick={() => onPick(customDishSlug(trimmed))}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-2 text-left text-sm text-[var(--nourish-subtext)] transition-colors hover:border-[var(--nourish-green)]/40"
                >
                  <Plus
                    size={15}
                    className="shrink-0 text-[var(--nourish-green)]"
                    aria-hidden
                  />
                  <span className="truncate">
                    Add &ldquo;
                    <span className="font-medium text-[var(--nourish-dark)]">
                      {trimmed}
                    </span>
                    &rdquo;
                  </span>
                </button>
              </li>
            )}
          </ul>
        ) : (
          <button
            type="button"
            onClick={onBrowseCards}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-border-strong)] bg-white py-2.5 text-[13px] font-medium text-[var(--nourish-subtext)] transition hover:bg-neutral-50"
          >
            Browse ideas instead →
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
