import type { ShoppingAddition } from "@/lib/hooks/use-shopping-list";

export interface GrabShoppingIngredient {
  id: string;
  name: string;
  quantity?: string | null;
}

export interface GrabShoppingSection {
  ingredients: readonly GrabShoppingIngredient[];
  sourceRecipeSlug?: string | null;
  sourceRecipeName?: string | null;
}

export interface BuildGrabShoppingAdditionsInput {
  sections: readonly GrabShoppingSection[];
  checkedIds: ReadonlySet<string>;
  fallbackRecipeSlug?: string | null;
  fallbackRecipeName?: string | null;
}

function present(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Convert the unchecked Grab-phase rows into rich shopping-list additions.
 * This preserves quantity and per-dish source context, so the grocery list can
 * render useful amounts and recipe chips after the user leaves the cook flow.
 */
export function buildGrabShoppingAdditions({
  sections,
  checkedIds,
  fallbackRecipeSlug,
  fallbackRecipeName,
}: BuildGrabShoppingAdditionsInput): ShoppingAddition[] {
  const fallbackSlug = present(fallbackRecipeSlug);
  const fallbackName = present(fallbackRecipeName);
  const additions: ShoppingAddition[] = [];

  for (const section of sections) {
    const sourceRecipeSlug = present(section.sourceRecipeSlug) ?? fallbackSlug;
    const sourceRecipeName = sourceRecipeSlug
      ? (present(section.sourceRecipeName) ?? fallbackName)
      : undefined;

    for (const ingredient of section.ingredients) {
      if (checkedIds.has(ingredient.id)) continue;
      const name = present(ingredient.name);
      if (!name) continue;
      const quantity = present(ingredient.quantity);
      additions.push({
        name,
        ...(quantity ? { quantity } : {}),
        ...(sourceRecipeSlug ? { sourceRecipeSlug } : {}),
        ...(sourceRecipeName ? { sourceRecipeName } : {}),
      });
    }
  }

  return additions;
}
