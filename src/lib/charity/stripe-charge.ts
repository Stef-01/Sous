/**
 * Charity charge dispatcher (Y2 Sprint L W49 — stub mode V1).
 *
 * Pure helpers + an async dispatcher for the per-pod weekly
 * charity charge. When Stripe Connect is not configured, the
 * dispatcher logs the would-be charge to console + writes a
 * stub-mode response. Real mode (W49 founder-unlock) lands the
 * fetch wire-up to api.stripe.com.
 *
 * Idempotency: each (podId, recipeWeekKey, nonprofitId) tuple
 * generates a stable Stripe-idempotency-key. Retried weeks
 * never double-charge — Stripe enforces uniqueness server-side.
 *
 * Pure / dependency-free except for the optional fetch in
 * real mode.
 */

import {
  podPledgeSchema,
  type Nonprofit,
  type PodPledge,
} from "@/types/charity";

export interface StripeChargeEnv {
  STRIPE_SECRET_KEY?: string | undefined;
  SOUS_CHARITY_CHARGE_ENABLED?: string | undefined;
}

/** Pure: is real-mode Stripe charging enabled? */
export function isStripeChargeEnabled(env: StripeChargeEnv): boolean {
  if (env.SOUS_CHARITY_CHARGE_ENABLED === "false") return false;
  if (!env.STRIPE_SECRET_KEY) return false;
  if (env.STRIPE_SECRET_KEY.length === 0) return false;
  return true;
}

/** Pure: derive a stable idempotency key for the (pod, week,
 *  nonprofit) tuple. Same triple always yields the same key —
 *  Stripe rejects duplicates server-side, which is the
 *  no-double-charge safety net.
 *
 *  Format: 'sous-charity-<podId>-<recipeWeekKey>-<nonprofitId>'.
 *  Long but readable; well under Stripe's 255-char limit. */
export function chargeIdempotencyKey(
  pledge: Pick<PodPledge, "podId" | "recipeWeekKey" | "nonprofitId">,
): string {
  return `sous-charity-${pledge.podId}-${pledge.recipeWeekKey}-${pledge.nonprofitId}`;
}

/** Pure: compute the line-item amount for a week. Per the W48
 *  schema, amountPerCookMinor is in minor units (cents, pence,
 *  etc.); total = perCook × completedCooksThisWeek. */
export function computeWeeklyChargeAmount(opts: {
  amountPerCookMinor: number;
  completedCooks: number;
}): number {
  if (!Number.isFinite(opts.amountPerCookMinor)) return 0;
  if (!Number.isFinite(opts.completedCooks)) return 0;
  if (opts.amountPerCookMinor <= 0) return 0;
  if (opts.completedCooks <= 0) return 0;
  return Math.round(opts.amountPerCookMinor * opts.completedCooks);
}

/** Pure: produce the Stripe charge body shape. The dispatcher
 *  serialises this to JSON. */
export interface StripeChargeBody {
  amount: number;
  currency: string;
  description: string;
  metadata: {
    sousPodId: string;
    sousRecipeWeekKey: string;
    sousNonprofitId: string;
    sousCompletedCooks: string;
  };
}

export function buildStripeChargeBody(opts: {
  pledge: PodPledge;
  nonprofit: Nonprofit;
  completedCooks: number;
}): StripeChargeBody | null {
  const amount = computeWeeklyChargeAmount({
    amountPerCookMinor: opts.pledge.amountPerCookMinor,
    completedCooks: opts.completedCooks,
  });
  if (amount <= 0) return null;
  if (!opts.nonprofit.verifiedByFounder) return null; // safety gate
  return {
    amount,
    currency: opts.pledge.currency.toLowerCase(),
    description: `Sous pod charity — ${opts.nonprofit.name} — week ${opts.pledge.recipeWeekKey} — ${opts.completedCooks} cooks`,
    metadata: {
      sousPodId: opts.pledge.podId,
      sousRecipeWeekKey: opts.pledge.recipeWeekKey,
      sousNonprofitId: opts.nonprofit.id,
      sousCompletedCooks: String(opts.completedCooks),
    },
  };
}

export type ChargeResult =
  | {
      ok: true;
      mode: "stub" | "stripe";
      idempotencyKey: string;
      amount: number;
      reason: string;
    }
  | { ok: false; reason: string };

export interface ChargeOptions {
  env?: StripeChargeEnv;
  fetchImpl?: typeof fetch;
  /** Override for the stub-mode logger (tests inject to assert
   *  the would-be-charge call). */
  logImpl?: (line: string) => void;
}

/** Async: process a charity charge for a pledge + week.
 *
 *  Stub mode: logs the would-be charge + returns ok=true.
 *  Real mode: POSTs to Stripe with idempotency key. On any
 *  error → falls back to stub-mode log so weekly cron never
 *  breaks the gallery.
 *
 *  Hard refusal (regardless of mode):
 *  - nonprofit.verifiedByFounder must be true
 *  - amount must be > 0
 *  - pledge must be schema-valid
 */
export async function processCharityCharge(
  opts: {
    pledge: PodPledge;
    nonprofit: Nonprofit;
    completedCooks: number;
  },
  options: ChargeOptions = {},
): Promise<ChargeResult> {
  // Hard schema validation.
  const parsed = podPledgeSchema.safeParse(opts.pledge);
  if (!parsed.success) {
    return { ok: false, reason: "pledge failed schema validation" };
  }
  if (!opts.nonprofit.verifiedByFounder) {
    return {
      ok: false,
      reason: "nonprofit unverified — charge refused",
    };
  }
  const body = buildStripeChargeBody(opts);
  if (!body) {
    return { ok: false, reason: "no chargeable amount" };
  }

  const idempotencyKey = chargeIdempotencyKey(opts.pledge);
  const env =
    options.env ??
    (typeof process !== "undefined" && process.env != null
      ? {
          STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
          SOUS_CHARITY_CHARGE_ENABLED: process.env.SOUS_CHARITY_CHARGE_ENABLED,
        }
      : {});

  if (!isStripeChargeEnabled(env)) {
    const log = options.logImpl ?? ((s: string) => console.log(s));
    log(
      `[sous:charity:stub] would charge ${body.amount} ${body.currency} for pod ${opts.pledge.podId} week ${opts.pledge.recipeWeekKey} → nonprofit ${opts.nonprofit.id} (idempotency: ${idempotencyKey})`,
    );
    return {
      ok: true,
      mode: "stub",
      idempotencyKey,
      amount: body.amount,
      reason: "stub-mode log (no Stripe key configured)",
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const res = await fetchImpl("https://api.stripe.com/v1/charges", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.STRIPE_SECRET_KEY ?? ""}`,
        "idempotency-key": idempotencyKey,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: stripeFormEncode(body),
    });
    if (!res.ok) {
      return { ok: false, reason: `stripe http ${res.status}` };
    }
    return {
      ok: true,
      mode: "stripe",
      idempotencyKey,
      amount: body.amount,
      reason: "stripe charge created",
    };
  } catch (e) {
    return {
      ok: false,
      reason: `stripe fetch threw: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}

/** Pure: encode the charge body as Stripe's
 *  application/x-www-form-urlencoded shape. Stripe's API
 *  doesn't accept JSON for v1/charges. */
export function stripeFormEncode(body: StripeChargeBody): string {
  const parts: string[] = [];
  parts.push(`amount=${encodeURIComponent(String(body.amount))}`);
  parts.push(`currency=${encodeURIComponent(body.currency)}`);
  parts.push(`description=${encodeURIComponent(body.description)}`);
  for (const [k, v] of Object.entries(body.metadata)) {
    parts.push(`metadata[${encodeURIComponent(k)}]=${encodeURIComponent(v)}`);
  }
  return parts.join("&");
}
