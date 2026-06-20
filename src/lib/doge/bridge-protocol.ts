/**
 * Doge bridge protocol — the single typed source of truth for every message that
 * crosses the Sous(React parent) ↔ Doge(vendored game, in an iframe) seam.
 *
 * It is imported by the parent bridge (`sous-bridge.ts`) and mirrored, as plain
 * JS shape comments, by the game-side receiver (`public/tamaweb/src/sous-bridge.js`).
 * Keep the two in sync: this file is the contract.
 *
 * Design: ONE channel, a small set of verbs, an origin + nonce guard, and an
 * outbox so a cook completed off `/doge` still pays out next time the game opens.
 * See docs/DOGE-INTEGRATION-PLAN.md §1.
 */

export const DOGE_CHANNEL = "sous-doge" as const;
export const DOGE_PROTOCOL_V = 1 as const;

/** Doberman mood vocabulary — identical to Sous's `PetMood` (pet-state.ts:11) so
 * the Today-header pet and the in-game pet always read the same. */
export type DogeMood = "asleep" | "hungry" | "peckish" | "content" | "thriving";

/** Why gold was credited (telemetry/label only — never gates anything). */
export type GoldReason = "cook_complete" | "checkin" | "log_meal";

/**
 * A single feedable serving derived from a REAL Sous dish (rule 7: only
 * meals.json/sides.json ids, only the dish's own image or an existing native
 * sprite — never invented). Travels inside `doge:grantDish` so the game needn't
 * know Sous's catalog ahead of time. `hunger/fun/health_replenish` are a
 * deterministic gameplay band, NEVER surfaced as a nutrition claim.
 */
export interface DogeFoodDef {
  /** inventory key == dish id, e.g. "pho" */
  id: string;
  /** real dish display name */
  name: string;
  /** "/food_images/pho.png" when a hero exists, else null → use spriteFallback */
  customImage: string | null;
  /** a REAL existing foods_on.png atlas cell (per-cuisine) when no hero */
  spriteFallback: number;
  hunger_replenish: number;
  fun_replenish: number;
  health_replenish: number;
  cuisine: string;
}

// ───────────────────────── parent → game ─────────────────────────

interface Base {
  channel: typeof DOGE_CHANNEL;
  v: typeof DOGE_PROTOCOL_V;
}

export type SousHello = Base & { type: "sous:hello"; nonce: string };
export type SousGoldCredit = Base & {
  type: "sous:gold:credit";
  nonce: string;
  txnId: string;
  amount: number;
  reason: GoldReason;
  juice: boolean;
  label?: string;
};
export type DogeGrantDish = Base & {
  type: "doge:grantDish";
  nonce: string;
  txnId: string;
  def: DogeFoodDef;
};
export type DogeSay = Base & {
  type: "doge:say";
  nonce: string;
  sayId: string;
  text: string;
  ms?: number;
};
export type SousSetMood = Base & {
  type: "sous:setMood";
  nonce: string;
  mood: DogeMood;
};

export type SousToDoge =
  | SousHello
  | SousGoldCredit
  | DogeGrantDish
  | DogeSay
  | SousSetMood;

// ───────────────────────── game → parent ─────────────────────────

export type DogeReady = Base & { type: "doge:ready" };
export type DogeAck = Base & {
  type: "doge:ack";
  txnId: string;
  credited: number;
};
export type DogeGranted = Base & {
  type: "doge:granted";
  txnId: string;
  id: string;
};
export type DogeSaid = Base & { type: "doge:said"; sayId: string };

export type DogeToSous = DogeReady | DogeAck | DogeGranted | DogeSaid;

// ───────────────────────── guards ─────────────────────────

/** True when `data` is a well-formed message on our channel at our version. */
export function isDogeMessage(data: unknown): data is Base & { type: string } {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    d.channel === DOGE_CHANNEL &&
    d.v === DOGE_PROTOCOL_V &&
    typeof d.type === "string"
  );
}

/** Narrow a validated message to the game→parent union. */
export function isDogeToSous(data: unknown): data is DogeToSous {
  return (
    isDogeMessage(data) &&
    (data.type === "doge:ready" ||
      data.type === "doge:ack" ||
      data.type === "doge:granted" ||
      data.type === "doge:said")
  );
}
