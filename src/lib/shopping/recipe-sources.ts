import {
  canonicalIngredientId,
  combineQuantities,
} from "@/lib/shopping/aggregate-quantity";

export interface ShoppingRecipeContribution {
  sourceRecipeSlug: string;
  sourceRecipeName?: string;
  quantity?: string;
}

export interface ShoppingRecipeSourceItem {
  name?: string | null;
  quantity?: string | null;
  sourceRecipeSlug?: string | null;
  sourceRecipeName?: string | null;
  contributedBy?: readonly string[] | null;
  contributions?: readonly ShoppingRecipeContribution[] | null;
}

function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanSlug(value: string | null | undefined): string | null {
  return cleanText(value);
}

function uniqueSlugs(slugs: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    result.push(slug);
  }
  return result;
}

export function shoppingContributionForSource(source: {
  sourceRecipeSlug?: string | null;
  sourceRecipeName?: string | null;
  quantity?: string | null;
}): ShoppingRecipeContribution | null {
  const sourceRecipeSlug = cleanSlug(source.sourceRecipeSlug);
  if (!sourceRecipeSlug) return null;
  const sourceRecipeName = cleanText(source.sourceRecipeName);
  const quantity = cleanText(source.quantity);
  return {
    sourceRecipeSlug,
    ...(sourceRecipeName ? { sourceRecipeName } : {}),
    ...(quantity ? { quantity } : {}),
  };
}

export function shoppingContributionsForItem(
  item: ShoppingRecipeSourceItem,
): ShoppingRecipeContribution[] {
  return (item.contributions ?? [])
    .map((source) => shoppingContributionForSource(source))
    .filter((source): source is ShoppingRecipeContribution => source !== null);
}

function sourceSlugsForItem(item: ShoppingRecipeSourceItem): string[] {
  const slugs: string[] = [];
  const primary = cleanSlug(item.sourceRecipeSlug);
  if (primary) slugs.push(primary);
  for (const slug of item.contributedBy ?? []) {
    const cleaned = cleanSlug(slug);
    if (cleaned) slugs.push(cleaned);
  }
  for (const source of item.contributions ?? []) {
    const cleaned = cleanSlug(source.sourceRecipeSlug);
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

function combineShoppingQuantities(
  ingredientName: string | null | undefined,
  current: string | undefined,
  next: string | undefined,
): string | undefined {
  const name = cleanText(ingredientName);
  const canon = name ? canonicalIngredientId(name) : null;
  if (canon) return combineQuantities(current, next, canon);

  const left = cleanText(current);
  const right = cleanText(next);
  if (!left) return right ?? undefined;
  if (!right) return left;
  if (left.toLowerCase() === right.toLowerCase()) return left;
  return `${left} + ${right}`;
}

function combinedContributionQuantity(
  item: ShoppingRecipeSourceItem,
  contributions: readonly ShoppingRecipeContribution[],
): string | undefined {
  let quantity: string | undefined;
  for (const contribution of contributions) {
    quantity = combineShoppingQuantities(
      item.name,
      quantity,
      contribution.quantity,
    );
  }
  return quantity;
}

/**
 * Remove one recipe source from a shopping row. Rows shared with other recipes
 * are kept; rows that only came from the removed recipe return null.
 */
export function removeRecipeSourceFromShoppingItem<
  T extends ShoppingRecipeSourceItem,
>(item: T, slug: string): T | null {
  const target = cleanSlug(slug);
  if (!target || !shoppingItemHasRecipeSource(item, target)) return item;

  const allSources = shoppingRecipeSourceSlugs([item]);
  const remainingSlugs = allSources.filter((source) => source !== target);
  if (remainingSlugs.length === 0) return null;

  const contributions = shoppingContributionsForItem(item);
  const contributionBySlug = new Map(
    contributions.map((source) => [source.sourceRecipeSlug, source]),
  );
  const hasFullConcreteLedger = allSources.every((source) =>
    contributionBySlug.has(source),
  );
  const remainingContributions = uniqueSlugs(
    contributions
      .filter((source) => source.sourceRecipeSlug !== target)
      .map((source) => source.sourceRecipeSlug),
  )
    .map((source) => contributionBySlug.get(source))
    .filter(
      (source): source is ShoppingRecipeContribution => source !== undefined,
    );

  const primary = contributionBySlug.get(remainingSlugs[0]) ?? {
    sourceRecipeSlug: remainingSlugs[0],
    ...(remainingSlugs[0] === cleanSlug(item.sourceRecipeSlug) &&
    cleanText(item.sourceRecipeName)
      ? { sourceRecipeName: cleanText(item.sourceRecipeName)! }
      : {}),
  };
  const quantity = hasFullConcreteLedger
    ? combinedContributionQuantity(
        item,
        remainingSlugs
          .map((source) => contributionBySlug.get(source))
          .filter(
            (source): source is ShoppingRecipeContribution =>
              source !== undefined,
          ),
      )
    : (cleanText(item.quantity) ?? undefined);
  const nextContributions =
    remainingContributions.length > 0 ? remainingContributions : undefined;

  return {
    ...item,
    ...(quantity ? { quantity } : { quantity: undefined }),
    sourceRecipeSlug: primary.sourceRecipeSlug,
    sourceRecipeName: primary.sourceRecipeName,
    contributedBy: remainingSlugs,
    contributions: nextContributions,
  };
}
