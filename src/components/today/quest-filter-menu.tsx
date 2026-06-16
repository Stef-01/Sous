"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { FilterOption } from "@/components/shared/filter-dropdown";
import type {
  useQuestFilters,
  MealTypeFilter,
  DishRoleFilter,
  CookTimeFilter,
} from "@/lib/hooks/use-quest-filters";
import type { SourceFilter } from "@/lib/utils/dish-source";

type Filters = ReturnType<typeof useQuestFilters>;

const ROLE_OPTIONS: FilterOption<DishRoleFilter>[] = [
  { value: "main", label: "Main" },
  { value: "side", label: "Side" },
  { value: "drink", label: "Drink" },
  { value: "snack", label: "Snack" },
];
const MEAL_TYPE_OPTIONS: FilterOption<MealTypeFilter>[] = [
  { value: "any", label: "Any time" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];
const COOK_TIME_OPTIONS: FilterOption<CookTimeFilter>[] = [
  { value: "any", label: "Any time" },
  { value: "15", label: "≤ 15 min" },
  { value: "20", label: "≤ 20 min" },
  { value: "30", label: "≤ 30 min" },
  { value: "45", label: "≤ 45 min" },
  { value: "60", label: "≤ 60 min" },
];

type CategoryKey = "role" | "mealType" | "cuisine" | "cookTime" | "source";

const labelFor = <T extends string>(
  options: FilterOption<T>[],
  value: string,
): string => options.find((o) => o.value === value)?.label ?? value;

/**
 * QuestFilterMenu (Today Filter) — a minimal TEXT dropdown in the same family as
 * FilterDropdown (not a chip sheet). The "Filter" pill opens a compact category
 * list; tapping a category drills into its text options, selecting returns to the
 * list. The role row shows its current value ("Main") rather than a "Size" label.
 */
export function QuestFilterMenu({
  filters,
  cuisineOptions,
  sourceOptions,
}: {
  filters: Filters;
  cuisineOptions: FilterOption<string>[];
  /** Honest, role-aware source options (built from the live feed). The Source
   *  row is hidden entirely when only "Any" is available. */
  sourceOptions: FilterOption<SourceFilter>[];
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setCategory(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (category) setCategory(null);
        else close();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, category, close]);

  const active = filters.activeFilterCount > 0;

  // The category rows. Meal type only applies to mains (sides aren't daypart-bound).
  const rows: {
    key: CategoryKey;
    // The role row shows its value as the row text (no "Size" label).
    rowLabel: string;
    value: string | null;
    options: FilterOption<string>[];
    onSelect: (v: string) => void;
  }[] = [
    {
      key: "role",
      rowLabel: labelFor(ROLE_OPTIONS, filters.role),
      value: null,
      options: ROLE_OPTIONS,
      onSelect: (v) => filters.setRole(v as DishRoleFilter),
    },
    ...(filters.role === "main"
      ? [
          {
            key: "mealType" as const,
            rowLabel: "Meal type",
            value: labelFor(MEAL_TYPE_OPTIONS, filters.mealType),
            options: MEAL_TYPE_OPTIONS as FilterOption<string>[],
            onSelect: (v: string) => filters.setMealType(v as MealTypeFilter),
          },
        ]
      : []),
    {
      key: "cuisine",
      rowLabel: "Cuisine",
      value: labelFor(cuisineOptions, filters.cuisine),
      options: cuisineOptions,
      onSelect: (v) => filters.setCuisine(v),
    },
    {
      key: "cookTime",
      rowLabel: "Cook time",
      value: labelFor(COOK_TIME_OPTIONS, filters.cookTime),
      options: COOK_TIME_OPTIONS as FilterOption<string>[],
      onSelect: (v) => filters.setCookTime(v as CookTimeFilter),
    },
    // Source is only meaningful when the live feed actually carries more than
    // one provenance — buildSourceOptions returns just "Any" otherwise, and we
    // drop the row so the menu never offers a dead facet.
    ...(sourceOptions.length > 1
      ? [
          {
            key: "source" as const,
            rowLabel: "Source",
            value: labelFor(sourceOptions, filters.source),
            options: sourceOptions as FilterOption<string>[],
            onSelect: (v: string) => filters.setSource(v as SourceFilter),
          },
        ]
      : []),
  ];

  const activeRow = category ? rows.find((r) => r.key === category) : null;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={active ? "Filter — active" : "Filter"}
        className={cn(
          "inline-flex min-h-[44px] items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
          active
            ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
            : "border-[var(--nourish-border-strong)] bg-white/80 text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)]/40 hover:text-[var(--nourish-green)]",
        )}
      >
        <span className="whitespace-nowrap">Filter</span>
        <ChevronDown
          size={11}
          strokeWidth={2.2}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-[var(--nourish-border-strong)] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
        >
          {!activeRow ? (
            <ul className="py-1">
              {rows.map((r) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => setCategory(r.key)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12px] text-[var(--nourish-dark)] transition-colors hover:bg-[var(--nourish-cream)]"
                  >
                    <span className="font-medium">{r.rowLabel}</span>
                    <span className="flex items-center gap-1 text-[var(--nourish-subtext)]">
                      {r.value && <span>{r.value}</span>}
                      <ChevronRight size={13} strokeWidth={2.2} />
                    </span>
                  </button>
                </li>
              ))}
              {active && (
                <li className="mt-1 border-t border-[var(--nourish-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      filters.reset();
                      setCategory(null);
                    }}
                    className="w-full px-3 py-2 text-left text-[12px] text-[var(--nourish-subtext)] transition-colors hover:bg-[var(--nourish-cream)]"
                  >
                    Reset
                  </button>
                </li>
              )}
            </ul>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="flex w-full items-center gap-1.5 border-b border-[var(--nourish-border)] px-3 py-2 text-[12px] font-medium text-[var(--nourish-subtext)] transition-colors hover:bg-[var(--nourish-cream)]"
              >
                <ChevronLeft size={13} strokeWidth={2.2} />
                {activeRow.rowLabel}
              </button>
              <ul className="max-h-[240px] overflow-y-auto py-1">
                {activeRow.options.map((opt) => {
                  const current =
                    (activeRow.key === "role" && filters.role === opt.value) ||
                    (activeRow.key === "mealType" &&
                      filters.mealType === opt.value) ||
                    (activeRow.key === "cuisine" &&
                      filters.cuisine === opt.value) ||
                    (activeRow.key === "cookTime" &&
                      filters.cookTime === opt.value) ||
                    (activeRow.key === "source" &&
                      filters.source === opt.value);
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() => {
                          activeRow.onSelect(opt.value);
                          setCategory(null);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12px] transition-colors",
                          current
                            ? "bg-[var(--nourish-green)]/8 font-semibold text-[var(--nourish-green)]"
                            : "text-[var(--nourish-dark)] hover:bg-[var(--nourish-cream)]",
                        )}
                      >
                        <span>{opt.label}</span>
                        {current && <Check size={13} strokeWidth={2.5} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
