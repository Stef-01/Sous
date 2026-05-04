/**
 * Zod schemas for the W48 charity-bake-sale tooling.
 *
 * Two top-level shapes:
 *   - Nonprofit — curated catalogue entry (name, URL, EIN,
 *     mission). Data lives in src/data/nonprofits.json.
 *   - PodPledge — per-pod donation commitment (podId,
 *     recipeWeekKey, amountPerCook, currency, nonprofitId,
 *     status, stripeSubscriptionId).
 *
 * Both are validated at boot + when API routes accept input,
 * so malformed data fails loud rather than silently producing
 * surprising charity-charge behaviour.
 */

import { z } from "zod";

/** ISO 4217 currency. Restricted to the small set the W48
 *  founder-unlock will support at launch. Expand as needed. */
export const supportedCurrencySchema = z.enum(["USD", "EUR", "GBP", "CAD"]);
export type SupportedCurrency = z.infer<typeof supportedCurrencySchema>;

/** Status of a pod-pledge. Stripe webhooks transition this. */
export const pledgeStatusSchema = z.enum([
  "pending",
  "charged",
  "failed",
  "cancelled",
]);
export type PledgeStatus = z.infer<typeof pledgeStatusSchema>;

export const nonprofitSchema = z.object({
  /** Stable opaque id (uuid or slug). Used as foreign key in
   *  PodPledge. */
  id: z.string().min(1),
  /** Display name as shown in the pod gallery + Stripe receipts. */
  name: z.string().min(1),
  /** Public-facing URL. Validated as URL-shaped. */
  url: z.string().url(),
  /** US-only IRS Employer Identification Number. Empty string
   *  when the nonprofit is non-US (international launches will
   *  expand the schema). */
  ein: z.string(),
  /** 1-paragraph mission statement, original prose. */
  mission: z.string().min(20),
  /** ISO 3166 country code where the nonprofit is registered. */
  country: z.string().length(2),
  /** Founder-verification flag. False = placeholder, the W48
   *  curation pass swaps this to true after EIN + tax-form
   *  collection per the W48 founder-unlock checklist. */
  verifiedByFounder: z.boolean(),
});
export type Nonprofit = z.infer<typeof nonprofitSchema>;

export const nonprofitFileSchema = z.array(nonprofitSchema);
export type NonprofitFile = z.infer<typeof nonprofitFileSchema>;

export const podPledgeSchema = z.object({
  /** UUID for this pledge row. */
  id: z.string().min(1),
  /** Pod that owns this pledge. */
  podId: z.string().min(1),
  /** ISO-8601 Monday-of-week the pledge applies to ('pick-YYYY-
   *  MM-DD' from the W36 weeklyPickToken format). One pod can
   *  pledge multiple weeks. */
  recipeWeekKey: z.string().min(1),
  /** Amount in minor units (cents) per cook completed by any
   *  pod member that week. */
  amountPerCookMinor: z.number().int().nonnegative(),
  /** Currency for the pledge. */
  currency: supportedCurrencySchema,
  /** Foreign key into the nonprofit catalogue. */
  nonprofitId: z.string().min(1),
  /** Lifecycle status. */
  status: pledgeStatusSchema,
  /** Stripe subscription / payment-intent id. Null in stub
   *  mode + before the charge is created. */
  stripeReference: z.string().nullable(),
  /** ISO timestamp when the pledge was first written. */
  createdAt: z.string(),
  /** ISO timestamp of the last status transition. */
  updatedAt: z.string(),
});
export type PodPledge = z.infer<typeof podPledgeSchema>;
