import { IngredientIcon } from "@/components/shared/ingredient-icon";
import { resolveIngredientIcon } from "@/lib/ingredients/ingredient-icons";
import { ingredientEmoji } from "@/lib/utils/ingredient-meta";
import { cn } from "@/lib/utils/cn";

interface ShoppingIngredientMarkProps {
  name: string;
  bought?: boolean;
  className?: string;
}

export function ShoppingIngredientMark({
  name,
  bought = false,
  className,
}: ShoppingIngredientMarkProps) {
  const icon = resolveIngredientIcon(name);
  const muted = bought && "opacity-45 grayscale";

  if (icon.family !== "unknown") {
    return (
      <span
        aria-hidden="true"
        data-shopping-ingredient-mark="icon"
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center",
          muted,
          className,
        )}
      >
        <IngredientIcon name={name} size="sm" />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      data-shopping-ingredient-mark="emoji"
      data-ingredient-label="aisle-fallback"
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-[18px] leading-none ring-1 ring-inset ring-neutral-100",
        muted,
        className,
      )}
    >
      {ingredientEmoji(name)}
    </span>
  );
}
