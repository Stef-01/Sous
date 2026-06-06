import { cn } from "@/lib/utils/cn";
import { mealTypeMeta, type MealType } from "@/lib/utils/meal-type";

/**
 * MealTypeTag — the colour-coded Breakfast / Lunch / Dinner / Snack pill. Soft
 * tint background + same-hue text, the ONE accent on the planner. Pure (no
 * motion); colours resolve to the `--meal-*` tokens via inline style.
 */
export function MealTypeTag({
  type,
  className,
}: {
  type: MealType;
  className?: string;
}) {
  const m = mealTypeMeta(type);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-[13px] font-semibold leading-none",
        className,
      )}
      style={{ backgroundColor: m.bg, color: m.fg }}
    >
      {m.label}
    </span>
  );
}
