"use client";

import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  CONTENT_FILTERS,
  CONTENT_FILTER_LABELS,
  type ContentFilter,
} from "@/lib/hooks/use-content-filter";

interface Props {
  active: ContentFilter;
  onChange: (next: ContentFilter) => void;
}

/**
 * CategoryFilterStrip — horizontal pill row matching the Today
 * `FilterDropdown` visual language. Active pill animates with a
 * shared layoutId background so transitions feel native.
 */
export function CategoryFilterStrip({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Content categories"
      className="-mx-4 overflow-x-auto px-4 scrollbar-hide"
    >
      <LayoutGroup>
        {/* W19b delta #1: pill height + horizontal padding bumped ~12%
            for a tap-target that lands cleanly on a thumb (Apple News /
            Headspace pattern). gap also bumped from 2 → 2.5 so pills
            breathe rather than stack visually. */}
        <ul className="flex items-center gap-2.5 py-1.5">
          {CONTENT_FILTERS.map((id) => {
            const isActive = id === active;
            return (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onChange(id)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative rounded-full px-[18px] py-[9px] text-[12px] font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                    isActive
                      ? "text-white"
                      : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="content-filter-pill"
                      className="absolute inset-0 rounded-full bg-[var(--nourish-green)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {CONTENT_FILTER_LABELS[id]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}
