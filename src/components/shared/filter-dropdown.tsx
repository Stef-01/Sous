"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  /** Optional compact label shown on the pill itself. Falls back to `label`. */
  pillLabel?: string;
}

interface FilterDropdownProps<T extends string> {
  /** Accessible label / hidden caption for screen readers. */
  label: string;
  /** Current value. When equal to `defaultValue`, the pill shows a muted/“empty” state. */
  value: T;
  defaultValue: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
  /** Optional leading icon rendered inside the pill. */
  leadingIcon?: ReactNode;
  /** Align the dropdown menu. */
  align?: "start" | "end";
}

/**
 * FilterDropdown — minimalist clickable pill that opens a tiny dropdown menu.
 *
 * Deliberately lighter-weight than a full Select: no search, no multi-select,
 * no labels — just a single column of short options with a check on the
 * active one. Tap outside or press Escape to dismiss.
 *
 * This is the Sous answer to "settings pages" — one tap, six options, done.
 */
export function FilterDropdown<T extends string>({
  label,
  value,
  defaultValue,
  options,
  onChange,
  leadingIcon,
  align = "start",
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const isActive = value !== defaultValue;
  const current = options.find((o) => o.value === value) ?? options[0];
  const pillText = current?.pillLabel ?? current?.label ?? label;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
          isActive
            ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
            : "border-[var(--nourish-border-strong)] bg-white/80 text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)]/40 hover:text-[var(--nourish-green)]",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`${label}: ${current?.label ?? "Any"}`}
      >
        {leadingIcon}
        <span className="whitespace-nowrap">{pillText}</span>
        <ChevronDown
          size={11}
          strokeWidth={2.2}
          className={cn(
            "transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute z-40 mt-1.5 min-w-[150px] overflow-hidden rounded-xl border border-[var(--nourish-border-strong)] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)]",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            <ul className="max-h-[260px] overflow-y-auto py-1">
              {options.map((opt) => {
                const selected = opt.value === value;
                return (
                  <li key={opt.value} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        close();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12px] transition-colors",
                        selected
                          ? "bg-[var(--nourish-green)]/8 text-[var(--nourish-green)] font-semibold"
                          : "text-[var(--nourish-dark)] hover:bg-[var(--nourish-cream)]",
                      )}
                    >
                      <span>{opt.label}</span>
                      {selected && <Check size={13} strokeWidth={2.5} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
