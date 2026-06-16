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
import type { SourceFacet } from "@/lib/utils/dish-source";

type Filters = ReturnType<typeof useQuestFilters>;

const ROLE_OPTIONS: FilterOption<DishRoleFilter>[] = [
  { value: "main", label: "Main" },
  { value: "side", label: "Side" },
  { value: "drink", label: "Drink" },
  { value: "snack", label: "Snack" },
];
const MEAL_TYPE_OPTIONS: FilterOption<MealTypeFilter>[] = [
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

/** Summary text for a multi-select row: null (none), the single label, or "N selected". */
function multiSummary(
  selected: ReadonlyArray<string>,
  options: FilterOption<string>[],
): string | null {
  if (selected.length === 0) return null;
  if (selected.length === 1) {
    return options.find((o) => o.value === selected[0])?.label ?? selected[0];
  }
  return `${selected.length} selected`;
}

interface Row {
  key: CategoryKey;
  rowLabel: string;
  /** Right-aligned summary on the category list. */
  summary: string | null;
  options: FilterOption<string>[];
  /** Multi-select rows toggle in place; single-select rows apply + close. */
  multi: boolean;
  isSelected: (value: string) => boolean;
  onSelect: (value: string) => void;
  /** Multi-select only — number selected + the clear action. */
  selectedCount?: number;
  onClear?: () => void;
}

/**
 * QuestFilterMenu (Today Filter) — a minimal TEXT dropdown in the same family as
 * FilterDropdown. The "Filter" pill opens a compact category list; tapping a
 * category drills into its options. Cook time is single-select (tap → apply +
 * back). Role, Meal type, Cuisine and Source are MULTI-SELECT (checkboxes that
 * toggle in place without collapsing the panel; empty = any).
 */
export function QuestFilterMenu({
  filters,
  cuisineOptions,
  sourceOptions,
}: {
  filters: Filters;
  cuisineOptions: FilterOption<string>[];
  /** Honest, role-aware source facets (built from the live feed). The Source
   *  row is hidden when fewer than two facets are available. */
  sourceOptions: FilterOption<SourceFacet>[];
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
  // Meal type only constrains mains, so the row only appears when mains are in
  // scope (selected, or "all roles" via an empty selection).
  const mainsInScope =
    filters.roles.length === 0 || filters.roles.includes("main");

  const rows: Row[] = [
    {
      key: "role",
      rowLabel: "Role",
      summary: multiSummary(filters.roles, ROLE_OPTIONS),
      options: ROLE_OPTIONS as FilterOption<string>[],
      multi: true,
      isSelected: (v) => filters.roles.includes(v as DishRoleFilter),
      onSelect: (v) => filters.toggleRole(v as DishRoleFilter),
      selectedCount: filters.roles.length,
      onClear: filters.clearRoles,
    },
    ...(mainsInScope
      ? [
          {
            key: "mealType" as const,
            rowLabel: "Meal type",
            summary: multiSummary(filters.mealTypes, MEAL_TYPE_OPTIONS),
            options: MEAL_TYPE_OPTIONS as FilterOption<string>[],
            multi: true,
            isSelected: (v: string) =>
              filters.mealTypes.includes(v as MealTypeFilter),
            onSelect: (v: string) =>
              filters.toggleMealType(v as MealTypeFilter),
            selectedCount: filters.mealTypes.length,
            onClear: filters.clearMealTypes,
          },
        ]
      : []),
    {
      key: "cuisine",
      rowLabel: "Cuisine",
      summary: multiSummary(filters.cuisines, cuisineOptions),
      options: cuisineOptions,
      multi: true,
      isSelected: (v) => filters.cuisines.includes(v),
      onSelect: (v) => filters.toggleCuisine(v),
      selectedCount: filters.cuisines.length,
      onClear: filters.clearCuisines,
    },
    {
      key: "cookTime",
      rowLabel: "Cook time",
      summary: labelFor(COOK_TIME_OPTIONS, filters.cookTime),
      options: COOK_TIME_OPTIONS as FilterOption<string>[],
      multi: false,
      isSelected: (v) => filters.cookTime === v,
      onSelect: (v) => filters.setCookTime(v as CookTimeFilter),
    },
    // Source is multi-select and only shown when the live feed carries two or
    // more provenances (buildSourceFacetOptions is honest), so the menu never
    // offers a dead facet.
    ...(sourceOptions.length > 1
      ? [
          {
            key: "source" as const,
            rowLabel: "Source",
            summary: multiSummary(filters.source, sourceOptions),
            options: sourceOptions as FilterOption<string>[],
            multi: true,
            isSelected: (v: string) =>
              filters.source.includes(v as SourceFacet),
            onSelect: (v: string) => filters.toggleSource(v as SourceFacet),
            selectedCount: filters.source.length,
            onClear: filters.clearSource,
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
                      {r.summary && <span>{r.summary}</span>}
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
                {activeRow.multi && (
                  <span className="sous-label ml-auto">Pick any</span>
                )}
              </button>
              <ul className="max-h-[240px] overflow-y-auto py-1">
                {activeRow.options.map((opt) => {
                  const current = activeRow.isSelected(opt.value);
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() => {
                          activeRow.onSelect(opt.value);
                          // Multi-select stays open so several can be ticked.
                          if (!activeRow.multi) setCategory(null);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12px] transition-colors",
                          current
                            ? "bg-[var(--nourish-green)]/8 font-semibold text-[var(--nourish-green)]"
                            : "text-[var(--nourish-dark)] hover:bg-[var(--nourish-cream)]",
                        )}
                      >
                        <span>{opt.label}</span>
                        {activeRow.multi ? (
                          <span
                            aria-hidden
                            className={cn(
                              "flex h-[18px] w-[18px] items-center justify-center rounded-md border-2 transition-colors",
                              current
                                ? "border-[var(--nourish-green)] bg-[var(--nourish-green)] text-white"
                                : "border-[var(--nourish-border-strong)] text-transparent",
                            )}
                          >
                            <Check size={11} strokeWidth={3} />
                          </span>
                        ) : (
                          current && <Check size={13} strokeWidth={2.5} />
                        )}
                      </button>
                    </li>
                  );
                })}
                {activeRow.multi &&
                  activeRow.onClear &&
                  (activeRow.selectedCount ?? 0) > 0 && (
                    <li className="mt-1 border-t border-[var(--nourish-border)]">
                      <button
                        type="button"
                        onClick={() => activeRow.onClear?.()}
                        className="w-full px-3 py-2 text-left text-[12px] text-[var(--nourish-subtext)] transition-colors hover:bg-[var(--nourish-cream)]"
                      >
                        Clear
                      </button>
                    </li>
                  )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
