export interface ShoppingRecipeSourceItem {
  sourceRecipeSlug?: string | null;
  contributedBy?: readonly string[] | null;
}

function cleanSlug(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function sourceSlugsForItem(item: ShoppingRecipeSourceItem): string[] {
  const slugs: string[] = [];
  const primary = cleanSlug(item.sourceRecipeSlug);
  if (primary) slugs.push(primary);
  for (const slug of item.contributedBy ?? []) {
    const cleaned = cleanSlug(slug);
    if (cleaned) slugs.push(cleaned);
  }
  return slugs;
}

/** Distinct recipe slugs represented by shopping rows, preserving first-seen order. */
export function shoppingRecipeSourceSlugs(
  items: readonly ShoppingRecipeSourceItem[],
): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];

  for (const item of items) {
    for (const slug of sourceSlugsForItem(item)) {
      if (seen.has(slug)) continue;
      seen.add(slug);
      slugs.push(slug);
    }
  }

  return slugs;
}

/** True when a row belongs to a recipe, either as the primary or merged source. */
export function shoppingItemHasRecipeSource(
  item: ShoppingRecipeSourceItem,
  slug: string,
): boolean {
  const target = cleanSlug(slug);
  if (!target) return false;
  return sourceSlugsForItem(item).includes(target);
}
