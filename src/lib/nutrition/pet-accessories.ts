/**
 * Pet accessories — the variable-reward loot for the Doberman. UNLIKE the
 * level-earned cosmetics (toque/collar, which are a deterministic goal-gradient),
 * these are RANDOM drops: finishing a cook has a chance to make your pup "find" a
 * cute accessory you can equip and see in the pet's mini-game. The variable ratio
 * (not a milestone schedule) is the dopamine loop — every cook might surprise you.
 *
 * The catalog + the drop roll are pure (roll injected) so they're unit-tested;
 * the owned/equipped store is a thin localStorage hook.
 */

export const ACCESSORIES = [
  { id: "bandana", name: "Bandana", emoji: "🧣" },
  { id: "bowtie", name: "Bow tie", emoji: "🎀" },
  { id: "party", name: "Party hat", emoji: "🎉" },
  { id: "shades", name: "Cool shades", emoji: "🕶️" },
  { id: "crown", name: "Tiny crown", emoji: "👑" },
] as const;

export type AccessoryId = (typeof ACCESSORIES)[number]["id"];

export const ACCESSORY_IDS: AccessoryId[] = ACCESSORIES.map((a) => a.id);

export function accessoryById(id: string | null | undefined) {
  return ACCESSORIES.find((a) => a.id === id) ?? null;
}

/** Chance a finished cook drops a NEW accessory. A variable-ratio reward — high
 *  enough to feel alive early, and it self-limits as the wardrobe fills. */
export const ACCESSORY_DROP_CHANCE = 0.34;

/**
 * Pure drop roll. `roll` is a uniform [0,1) supplied by the caller (Math.random
 * in the app, a fixed value in tests). Returns a not-yet-owned accessory id when
 * the roll lands inside the drop window, else null. Once everything is owned it
 * always returns null (no dupes, no infinite tease).
 */
export function rollAccessoryDrop(
  owned: ReadonlySet<string>,
  roll: number,
): AccessoryId | null {
  const unowned = ACCESSORY_IDS.filter((id) => !owned.has(id));
  if (unowned.length === 0) return null;
  if (!(roll >= 0) || roll >= ACCESSORY_DROP_CHANCE) return null;
  // Spread the in-window roll across the unowned set so which one drops is also
  // pseudo-random, not always the first.
  const idx = Math.floor((roll / ACCESSORY_DROP_CHANCE) * unowned.length);
  return unowned[Math.min(idx, unowned.length - 1)];
}
