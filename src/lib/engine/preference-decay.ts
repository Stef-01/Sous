/**
 * Preference decay — the same 10 %/30 days rate used in the pairing engine,
 * surfaced here for the UI so users see their practice cooling off.
 *
 * Returns a value in [0, 1]. A freshly cooked skill reads as 1. Every 30
 * days it drops by ~10 %. We clamp the floor at 0.15 so a completed skill
 * still carries a whisper of warmth; full decay to zero would feel
 * punitive for a system that already rewards practice elsewhere.
 */
export const DECAY_PER_30_DAYS = 0.1;
const DAY_MS = 24 * 60 * 60 * 1000;
const FRESHNESS_FLOOR = 0.15;

export function computeFreshness(
  lastCookedAt: string | undefined,
  now: number = Date.now(),
): number {
  if (!lastCookedAt) return 0;
  const ts = new Date(lastCookedAt).getTime();
  if (!Number.isFinite(ts)) return 0;
  const ageMs = Math.max(0, now - ts);
  const ageDays = ageMs / DAY_MS;
  const raw = 1 - (DECAY_PER_30_DAYS * ageDays) / 30;
  if (raw >= 1) return 1;
  if (raw <= FRESHNESS_FLOOR) return FRESHNESS_FLOOR;
  return raw;
}
