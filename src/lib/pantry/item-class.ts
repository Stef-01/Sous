/**
 * ItemClass taxonomy + expiration / storage-zone helpers (Y3 W15).
 *
 * Closed taxonomy of pantry-item categories. Each class carries:
 *   - default storage zone (pantry / fridge / freezer)
 *   - default expiration window in days
 *   - human-readable label
 *
 * The Y3 W13 photo-pipeline DetectedItem.itemClass references
 * these slugs. The W16 pantry page groups items by storage zone.
 * The future aroma-pairing engine (W17) reads itemClass as the
 * key into the aroma-profile catalog.
 *
 * Pure / dependency-free / deterministic.
 */

export type StorageZone = "pantry" | "fridge" | "freezer";

export interface ItemClassDef {
  /** Slug — referenced by other modules. */
  slug: string;
  /** Display label. */
  label: string;
  /** Default storage zone for items in this class. */
  storageZone: StorageZone;
  /** Default shelf-life in days for items in this class. */
  defaultShelfLifeDays: number;
}

/** Curated taxonomy. ~30 entries cover the most common pantry
 *  shapes; expand as new ItemClass references surface. */
export const ITEM_CLASSES: ReadonlyArray<ItemClassDef> = [
  // Produce — fridge
  {
    slug: "leafy-green",
    label: "Leafy green",
    storageZone: "fridge",
    defaultShelfLifeDays: 5,
  },
  {
    slug: "fresh-herb",
    label: "Fresh herb",
    storageZone: "fridge",
    defaultShelfLifeDays: 5,
  },
  {
    slug: "produce",
    label: "Produce",
    storageZone: "fridge",
    defaultShelfLifeDays: 7,
  },
  {
    slug: "citrus",
    label: "Citrus",
    storageZone: "fridge",
    defaultShelfLifeDays: 14,
  },
  {
    slug: "allium",
    label: "Allium",
    storageZone: "pantry",
    defaultShelfLifeDays: 21,
  },
  // Dairy + egg — fridge
  {
    slug: "dairy-egg",
    label: "Dairy + egg",
    storageZone: "fridge",
    defaultShelfLifeDays: 14,
  },
  {
    slug: "soft-cheese",
    label: "Soft cheese",
    storageZone: "fridge",
    defaultShelfLifeDays: 7,
  },
  {
    slug: "hard-cheese",
    label: "Hard cheese",
    storageZone: "fridge",
    defaultShelfLifeDays: 28,
  },
  // Protein — fridge / freezer
  {
    slug: "raw-protein",
    label: "Raw protein",
    storageZone: "fridge",
    defaultShelfLifeDays: 2,
  },
  {
    slug: "cooked-protein",
    label: "Cooked protein",
    storageZone: "fridge",
    defaultShelfLifeDays: 4,
  },
  {
    slug: "frozen-protein",
    label: "Frozen protein",
    storageZone: "freezer",
    defaultShelfLifeDays: 90,
  },
  {
    slug: "chicken-meat",
    label: "Chicken meat",
    storageZone: "fridge",
    defaultShelfLifeDays: 4,
  },
  {
    slug: "pulled-pork",
    label: "Pulled pork",
    storageZone: "fridge",
    defaultShelfLifeDays: 4,
  },
  // Pantry staples
  {
    slug: "dry-pasta",
    label: "Dry pasta",
    storageZone: "pantry",
    defaultShelfLifeDays: 540,
  },
  {
    slug: "dry-rice",
    label: "Dry rice",
    storageZone: "pantry",
    defaultShelfLifeDays: 365,
  },
  {
    slug: "cooked-rice",
    label: "Cooked rice",
    storageZone: "fridge",
    defaultShelfLifeDays: 4,
  },
  {
    slug: "cooked-beans",
    label: "Cooked beans",
    storageZone: "fridge",
    defaultShelfLifeDays: 4,
  },
  {
    slug: "cooked-lentils",
    label: "Cooked lentils",
    storageZone: "fridge",
    defaultShelfLifeDays: 5,
  },
  {
    slug: "pantry-oil",
    label: "Cooking oil",
    storageZone: "pantry",
    defaultShelfLifeDays: 365,
  },
  {
    slug: "vinegar",
    label: "Vinegar",
    storageZone: "pantry",
    defaultShelfLifeDays: 730,
  },
  {
    slug: "spice",
    label: "Spice",
    storageZone: "pantry",
    defaultShelfLifeDays: 540,
  },
  {
    slug: "condiment",
    label: "Condiment",
    storageZone: "fridge",
    defaultShelfLifeDays: 90,
  },
  {
    slug: "tomato-sauce",
    label: "Tomato sauce",
    storageZone: "fridge",
    defaultShelfLifeDays: 7,
  },
  {
    slug: "bolognese",
    label: "Bolognese",
    storageZone: "fridge",
    defaultShelfLifeDays: 4,
  },
  // Bakery
  {
    slug: "bread",
    label: "Bread",
    storageZone: "pantry",
    defaultShelfLifeDays: 5,
  },
  // Frozen
  {
    slug: "frozen-veg",
    label: "Frozen veg",
    storageZone: "freezer",
    defaultShelfLifeDays: 180,
  },
  // Roasted/leftovers
  {
    slug: "roasted-veg",
    label: "Roasted veg",
    storageZone: "fridge",
    defaultShelfLifeDays: 5,
  },
];

/** Pure: lookup by slug. Returns null when unknown. */
export function lookupItemClass(slug: string): ItemClassDef | null {
  const norm = slug.toLowerCase().trim();
  for (const c of ITEM_CLASSES) {
    if (c.slug === norm) return c;
  }
  return null;
}

/** Pure: estimate the expiration timestamp for a freshly-added
 *  item of the given class. ingestedAt + class.defaultShelfLifeDays. */
export function estimateExpiration(
  itemClassSlug: string,
  ingestedAt: Date,
): string | null {
  const cls = lookupItemClass(itemClassSlug);
  if (!cls) return null;
  if (!Number.isFinite(ingestedAt.getTime())) return null;
  const expMs =
    ingestedAt.getTime() + cls.defaultShelfLifeDays * 24 * 60 * 60 * 1000;
  return new Date(expMs).toISOString();
}

/** Pure: how many days until an item expires? Negative when
 *  expired. NaN-safe (returns null on bad inputs). */
export function daysToExpiration(
  expirationISO: string,
  now: Date,
): number | null {
  const expTs = new Date(expirationISO).getTime();
  if (!Number.isFinite(expTs)) return null;
  if (!Number.isFinite(now.getTime())) return null;
  const ms = expTs - now.getTime();
  return ms / (24 * 60 * 60 * 1000);
}

/** Pure: 0..1 freshness fraction — 1.0 = freshly added,
 *  0.0 = at-or-past expiration. Useful for the freshness
 *  progress bar on /path/pantry. */
export function freshnessFraction(opts: {
  ingestedAt: string;
  expirationISO: string;
  now: Date;
}): number {
  const ingested = new Date(opts.ingestedAt).getTime();
  const exp = new Date(opts.expirationISO).getTime();
  const nowTs = opts.now.getTime();
  if (!Number.isFinite(ingested) || !Number.isFinite(exp)) return 0;
  if (exp <= ingested) return 0;
  if (nowTs <= ingested) return 1;
  if (nowTs >= exp) return 0;
  return (exp - nowTs) / (exp - ingested);
}

export type FreshnessTier = "fresh" | "use-soon" | "expiring" | "stale";

/** Pure: tier the freshness into four user-readable buckets. */
export function freshnessTier(fraction: number): FreshnessTier {
  if (!Number.isFinite(fraction)) return "stale";
  if (fraction >= 0.5) return "fresh";
  if (fraction >= 0.25) return "use-soon";
  if (fraction > 0) return "expiring";
  return "stale";
}

/** Pure: group pantry items by storage zone using their
 *  resolved ItemClass. Items without a recognised class default
 *  to the 'pantry' zone for safety. */
export function groupByStorageZone<T extends { itemClass: string }>(
  items: ReadonlyArray<T>,
): Record<StorageZone, T[]> {
  const out: Record<StorageZone, T[]> = {
    pantry: [],
    fridge: [],
    freezer: [],
  };
  for (const item of items) {
    const cls = lookupItemClass(item.itemClass);
    const zone = cls?.storageZone ?? "pantry";
    out[zone].push(item);
  }
  return out;
}
