import { Check } from "lucide-react";

import { resolveIngredientIcon } from "@/lib/ingredients/ingredient-icons";
import { cn } from "@/lib/utils/cn";

interface IngredientIconProps {
  name: string;
  checked?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: {
    wrap: "h-8 w-8 text-[20px]",
    check: "h-3.5 w-3.5",
    checkIcon: 9,
  },
  md: {
    wrap: "h-10 w-10 text-[26px]",
    check: "h-4 w-4",
    checkIcon: 10,
  },
  lg: {
    wrap: "h-12 w-12 text-[32px]",
    check: "h-[18px] w-[18px]",
    checkIcon: 11,
  },
} as const;

const FAMILY_TONE_CLASSES = {
  protein: "bg-rose-50 ring-rose-100",
  vegetable: "bg-emerald-50 ring-emerald-100",
  fruit: "bg-amber-50 ring-amber-100",
  dairy: "bg-sky-50 ring-sky-100",
  grain: "bg-yellow-50 ring-yellow-100",
  spice: "bg-orange-50 ring-orange-100",
  sauce: "bg-violet-50 ring-violet-100",
  oil: "bg-lime-50 ring-lime-100",
  sweetener: "bg-orange-50 ring-orange-100",
  herb: "bg-green-50 ring-green-100",
  drink: "bg-cyan-50 ring-cyan-100",
  pantry: "bg-stone-50 ring-stone-100",
  unknown: "bg-neutral-50 ring-neutral-100",
} as const;

export function IngredientIcon({
  name,
  checked = false,
  size = "md",
  className,
}: IngredientIconProps) {
  const icon = resolveIngredientIcon(name);
  const sizing = SIZE_CLASSES[size];

  return (
    <span
      aria-hidden="true"
      data-ingredient-family={icon.family}
      data-ingredient-label={icon.label}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full leading-none",
        "ring-1 ring-inset transition-colors duration-150",
        sizing.wrap,
        FAMILY_TONE_CLASSES[icon.family],
        checked && "bg-neutral-50 opacity-75 grayscale",
        className,
      )}
    >
      <span className="select-none leading-none" data-ingredient-emoji>
        {icon.emoji}
      </span>
      {checked && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[var(--nourish-green)] text-white ring-2 ring-white",
            sizing.check,
          )}
        >
          <Check size={sizing.checkIcon} strokeWidth={3} />
        </span>
      )}
    </span>
  );
}
