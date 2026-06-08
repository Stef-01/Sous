"use client";

import { useEffect, type ReactNode } from "react";
import { X, Utensils, Salad, CupSoda, Cookie } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { FilterOption } from "@/components/shared/filter-dropdown";
import type {
  useQuestFilters,
  MealTypeFilter,
  DishRoleFilter,
  CookTimeFilter,
} from "@/lib/hooks/use-quest-filters";

type Filters = ReturnType<typeof useQuestFilters>;

const ROLE_OPTIONS: {
  value: DishRoleFilter;
  label: string;
  icon: ReactNode;
}[] = [
  { value: "main", label: "Main", icon: <Utensils size={15} aria-hidden /> },
  { value: "side", label: "Side", icon: <Salad size={15} aria-hidden /> },
  { value: "drink", label: "Drink", icon: <CupSoda size={15} aria-hidden /> },
  { value: "snack", label: "Snack", icon: <Cookie size={15} aria-hidden /> },
];

const MEAL_TYPE_OPTIONS: { value: MealTypeFilter; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

const COOK_TIME_OPTIONS: { value: CookTimeFilter; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "15", label: "≤15m" },
  { value: "20", label: "≤20m" },
  { value: "30", label: "≤30m" },
  { value: "45", label: "≤45m" },
  { value: "60", label: "≤60m" },
];

function FacetChip({
  selected,
  onClick,
  children,
  ariaLabel,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors active:scale-95",
        selected
          ? "bg-[var(--nourish-green)] text-white"
          : "border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] hover:bg-neutral-50",
      )}
    >
      {children}
    </button>
  );
}

function FacetSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="sous-label">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/**
 * QuestFilterSheet (Today Filter — Phase C) — the modern, faceted filter sheet.
 * Instant-apply (no Apply button): every tap updates the shared filter state and
 * the meal queue behind the sheet updates live. The Dish-role facet leads
 * (it's the most consequential); Meal type only shows for Main (sides aren't
 * daypart-bound). A Reset clears to defaults when any facet is active.
 */
export function QuestFilterSheet({
  open,
  onClose,
  filters,
  cuisineOptions,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  cuisineOptions: FilterOption<string>[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/30">
      <button
        type="button"
        aria-label="Close filters"
        className="flex-1"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter dishes"
        className="max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-[var(--nourish-cream)] pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--nourish-border)] bg-[var(--nourish-cream)] px-5 py-3.5">
          <span className="text-[15px] font-semibold text-[var(--nourish-dark)]">
            Filter
          </span>
          <div className="flex items-center gap-1">
            {filters.activeFilterCount > 0 && (
              <button
                type="button"
                onClick={filters.reset}
                className="rounded-full px-3 py-1 text-[13px] font-medium text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-neutral-200/60"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 py-4">
          {/* Dish role — leads; labelled by its options, default Main. */}
          <FacetSection label="Type">
            {ROLE_OPTIONS.map((o) => (
              <FacetChip
                key={o.value}
                selected={filters.role === o.value}
                onClick={() => filters.setRole(o.value)}
                ariaLabel={`Show ${o.label.toLowerCase()} dishes`}
              >
                {o.icon}
                {o.label}
              </FacetChip>
            ))}
          </FacetSection>

          {/* Meal type — only meaningful for mains. */}
          {filters.role === "main" && (
            <FacetSection label="Meal type">
              {MEAL_TYPE_OPTIONS.map((o) => (
                <FacetChip
                  key={o.value}
                  selected={filters.mealType === o.value}
                  onClick={() => filters.setMealType(o.value)}
                  ariaLabel={o.label}
                >
                  {o.label}
                </FacetChip>
              ))}
            </FacetSection>
          )}

          <FacetSection label="Cuisine">
            {cuisineOptions.map((o) => (
              <FacetChip
                key={o.value}
                selected={filters.cuisine === o.value}
                onClick={() => filters.setCuisine(o.value)}
                ariaLabel={o.label}
              >
                {o.label}
              </FacetChip>
            ))}
          </FacetSection>

          <FacetSection label="Cook time">
            {COOK_TIME_OPTIONS.map((o) => (
              <FacetChip
                key={o.value}
                selected={filters.cookTime === o.value}
                onClick={() => filters.setCookTime(o.value)}
                ariaLabel={`Cook time ${o.label}`}
              >
                {o.label}
              </FacetChip>
            ))}
          </FacetSection>
        </div>
      </div>
    </div>
  );
}
