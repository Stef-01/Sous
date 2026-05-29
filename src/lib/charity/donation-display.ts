/**
 * Donation display helpers (Y2 Sprint L W50).
 *
 * Pure formatters for the pod gallery's running-total display
 * + the per-pod yearly identity badge. The UI surface
 * (pod-home-content.tsx) calls these once per render with the
 * relevant pledge / charge history.
 *
 * Pure / dependency-free / deterministic.
 */

import type { SupportedCurrency } from "@/types/charity";

/** Pure: format a minor-units integer as a human-readable
 *  display string. Uses Intl.NumberFormat for locale-aware
 *  output; falls back to a manual format if Intl is missing
 *  (SSR + edge-runtime defensive). */
export function formatMoneyMinor(
  minor: number,
  currency: SupportedCurrency,
  locale: string = "en-US",
): string {
  if (!Number.isFinite(minor) || minor < 0) {
    return formatFallback(0, currency);
  }
  const major = minor / 100;
  // Whole amounts render without cents ("$20"); fractional
  // amounts always render with 2 decimals ("$20.50") so
  // trailing zeros aren't dropped.
  const isWhole = major === Math.floor(major);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return formatFallback(major, currency);
  }
}

function formatFallback(major: number, currency: SupportedCurrency): string {
  const symbol =
    currency === "USD" || currency === "CAD"
      ? "$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : "";
  // Round to 2 decimals; strip trailing .00 for whole values.
  const rounded = Math.round(major * 100) / 100;
  const display =
    rounded === Math.floor(rounded)
      ? String(Math.floor(rounded))
      : rounded.toFixed(2);
  return `${symbol}${display}`;
}

/** Pure: format the weekly running-total line for the pod
 *  gallery. Handles 0-cooks gracefully with a different copy
 *  shape ("Pledge active") so the gallery never says "$0
 *  raised". */
export function formatWeeklyDonationLine(opts: {
  amountMinor: number;
  currency: SupportedCurrency;
  nonprofitName: string;
  locale?: string;
}): string {
  const { amountMinor, currency, nonprofitName, locale } = opts;
  const cleanName = nonprofitName.trim();
  if (amountMinor <= 0) {
    return cleanName.length > 0
      ? `Pledge active — ${cleanName}`
      : "Pledge active";
  }
  const money = formatMoneyMinor(amountMinor, currency, locale);
  return cleanName.length > 0
    ? `${money} raised for ${cleanName} this week`
    : `${money} raised this week`;
}

export interface YearTotalEntry {
  /** Charge timestamp, ISO 8601. */
  chargedAt: string;
  /** Charge amount in minor units. */
  amountMinor: number;
  /** Currency for THIS charge. */
  currency: SupportedCurrency;
}

/** Pure: sum charges that fall in the given calendar year +
 *  group by currency. Output is keyed by currency so a pod that
 *  charged across USD + EUR shows two badge lines. Currency
 *  conversion is intentionally NOT done here — the badge surfaces
 *  per-currency, which is honest. */
export function aggregateYearlyDonations(
  charges: ReadonlyArray<YearTotalEntry>,
  year: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of charges) {
    if (typeof c.chargedAt !== "string") continue;
    const ts = new Date(c.chargedAt);
    if (Number.isNaN(ts.getTime())) continue;
    if (ts.getFullYear() !== year) continue;
    if (!Number.isFinite(c.amountMinor) || c.amountMinor <= 0) continue;
    out[c.currency] = (out[c.currency] ?? 0) + c.amountMinor;
  }
  return out;
}

/** Pure: format the year-identity badge. Returns null below the
 *  minimum threshold (so a single-week pledge with $5 doesn't
 *  unlock the identity claim) — the W50 plan calls this
 *  "identity reinforcement, not gamification pressure".
 *
 *  Threshold: 5000 minor units in the dominant currency
 *  (≈ $50 / £50 / €50). Tuned to require a meaningful
 *  contribution before the badge fires. */
export const YEAR_BADGE_MIN_MINOR = 5000;

export function formatYearIdentityBadge(opts: {
  totalsByCurrency: Record<string, number>;
  year: number;
  locale?: string;
}): string | null {
  const { totalsByCurrency, year, locale } = opts;
  const entries = Object.entries(totalsByCurrency).filter(
    ([, amt]) => amt >= YEAR_BADGE_MIN_MINOR,
  );
  if (entries.length === 0) return null;

  // Sort by amount descending; pick the dominant currency.
  entries.sort((a, b) => b[1] - a[1]);
  const head = entries[0];
  if (!head) return null;
  const [currency, minor] = head;
  const money = formatMoneyMinor(minor, currency as SupportedCurrency, locale);
  if (entries.length === 1) {
    return `Pod raised ${money} for charity in ${year}.`;
  }
  return `Pod raised ${money} (${currency} dominant; ${entries.length} currencies) for charity in ${year}.`;
}
