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
  sm: "h-9 w-9 text-[24px]",
  md: "h-11 w-11 text-[30px]",
  lg: "h-12 w-12 text-[34px]",
} as const;

export function IngredientIcon({
  name,
  checked = false,
  size = "md",
  className,
}: IngredientIconProps) {
  const icon = resolveIngredientIcon(name);

  return (
    <span
      aria-hidden="true"
      data-ingredient-family={icon.family}
      title={icon.label}
      className={cn(
        "relative flex shrink-0 items-center justify-center leading-none",
        SIZE_CLASSES[size],
        checked && "opacity-60 grayscale",
        className,
      )}
    >
      <span className="select-none leading-none">{icon.emoji}</span>
      {checked && (
        <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--nourish-green)] text-white ring-2 ring-white">
          <Check size={10} strokeWidth={3} />
        </span>
      )}
    </span>
  );
}
