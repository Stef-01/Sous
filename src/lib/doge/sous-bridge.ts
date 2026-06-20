/**
 * sous-bridge.ts — the Sous(parent) side of the Doge bridge.
 *
 * Owns: nonce minting, the origin-checked `message` listener, a durable
 * localStorage outbox (so a cook completed on a cook page — not `/doge` — still
 * pays out / grants the next time the game opens, and never twice), the boot
 * handshake, and the four `post*` methods. Instantiated once by
 * `src/app/doge/page.tsx`. See docs/DOGE-INTEGRATION-PLAN.md §1.6.
 *
 * The gold path here imports NOTHING from the nutrition/XP/diary/session stores —
 * the toy-economy wall (§3.1) is structural: gold is a write-only postMessage
 * sink, it never flows back into Sous.
 */
import {
  DOGE_CHANNEL,
  DOGE_PROTOCOL_V,
  isDogeToSous,
  type DogeFoodDef,
  type DogeMood,
  type GoldReason,
} from "./bridge-protocol";
import { dishToFood } from "./dish-to-food";

const OUTBOX_KEY = "sous-doge-outbox-v1";

type GoldItem = {
  type: "sous:gold:credit";
  txnId: string;
  amount: number;
  reason: GoldReason;
  juice: boolean;
  label?: string;
};
type GrantItem = { type: "doge:grantDish"; txnId: string; def: DogeFoodDef };
/** Side-effecting messages that must survive a closed game (no nonce stored —
 * it's re-stamped per mount at send time). */
type OutboxItem = GoldItem | GrantItem;

function makeNonce(): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `n_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

function readOutbox(): OutboxItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as OutboxItem[]) : [];
  } catch {
    return [];
  }
}

function writeOutbox(items: OutboxItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
  } catch {
    /* quota / disabled — best effort */
  }
}

/** Append a side-effecting message to the durable outbox (deduped by txnId).
 * Shared by the bridge instance and by cook-time helpers that run with no live
 * bridge (e.g. grantDishToDoge on a cook page) — it flushes on the next
 * doge:ready. */
function enqueueOutbox(item: OutboxItem): void {
  const ob = readOutbox();
  if (!ob.some((x) => x.txnId === item.txnId)) {
    ob.push(item);
    writeOutbox(ob);
  }
}

export class SousBridge {
  private getIframe: () => HTMLIFrameElement | null;
  private nonce: string;
  private ready = false;
  private boundOnMessage: (e: MessageEvent) => void;

  constructor(getIframe: () => HTMLIFrameElement | null) {
    this.getIframe = getIframe;
    this.nonce = makeNonce();
    this.boundOnMessage = (e) => this.onMessage(e);
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.boundOnMessage);
    }
  }

  /** Detach the listener. Call on unmount. */
  destroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("message", this.boundOnMessage);
    }
  }

  // ---- inbound (game → parent) ----------------------------------------------

  private onMessage(e: MessageEvent): void {
    if (typeof window === "undefined") return;
    if (e.origin !== window.location.origin) return;
    if (!isDogeToSous(e.data)) return;
    const d = e.data;
    switch (d.type) {
      case "doge:ready":
        // (re)handshake — re-fires on hatch/age-up; harmless to repeat.
        this.ready = true;
        this.rawSend({ type: "sous:hello", nonce: this.nonce });
        this.flushOutbox();
        break;
      case "doge:ack":
      case "doge:granted":
        this.settle(d.txnId);
        break;
      case "doge:said":
        break;
    }
  }

  // ---- outbound (parent → game) ---------------------------------------------

  /** Low-level: stamp channel/version and post to the iframe if it's mounted. */
  private rawSend(partial: { type: string } & Record<string, unknown>): void {
    if (typeof window === "undefined") return;
    const win = this.getIframe()?.contentWindow;
    if (!win) return;
    win.postMessage(
      { channel: DOGE_CHANNEL, v: DOGE_PROTOCOL_V, ...partial },
      window.location.origin,
    );
  }

  /** Record a side-effecting message durably, then post opportunistically. */
  private enqueue(item: OutboxItem): void {
    enqueueOutbox(item);
    if (this.ready) this.rawSend({ nonce: this.nonce, ...item });
  }

  private flushOutbox(): void {
    for (const item of readOutbox())
      this.rawSend({ nonce: this.nonce, ...item });
  }

  private settle(txnId: string): void {
    const ob = readOutbox();
    const next = ob.filter((x) => x.txnId !== txnId);
    if (next.length !== ob.length) writeOutbox(next);
  }

  // ---- public posters --------------------------------------------------------

  /** Credit Doge gold (toy currency). Idempotency is the caller's ledger; the
   * outbox guarantees delivery; the receiver dedupes by txnId. */
  postGold(args: {
    txnId: string;
    amount: number;
    reason: GoldReason;
    juice: boolean;
    label?: string;
  }): void {
    this.enqueue({ type: "sous:gold:credit", ...args });
  }

  /** Grant one feedable serving of a real cooked dish into the pet's inventory. */
  postGrantDish(args: { txnId: string; def: DogeFoodDef }): void {
    this.enqueue({ type: "doge:grantDish", ...args });
  }

  /** Make the Doberman say a fun fact. Fire-and-forget (no outbox). */
  postSay(args: { sayId: string; text: string; ms?: number }): void {
    if (!this.ready) return;
    this.rawSend({ type: "doge:say", nonce: this.nonce, ...args });
  }

  /** Forward-compat (P6): drive the in-iframe pet's expression. */
  postMood(mood: DogeMood): void {
    if (!this.ready) return;
    this.rawSend({ type: "sous:setMood", nonce: this.nonce, mood });
  }

  /** Whether the game has handshaken at least once this mount. */
  get isReady(): boolean {
    return this.ready;
  }
}

/**
 * Grant one feedable serving of a just-cooked dish to the Doberman. Called from
 * the cook pages on completion (no live bridge required) — it durably enqueues a
 * `doge:grantDish` into the outbox, which the SousBridge flushes the next time
 * `/doge` opens. Returns false (and grants nothing) for non-catalog dishes —
 * rule 7. Each call grants exactly one serving; call once per completed cook.
 */
export function grantDishToDoge(slug: string): boolean {
  if (typeof window === "undefined") return false;
  const def = dishToFood(slug);
  if (!def) return false;
  enqueueOutbox({
    type: "doge:grantDish",
    txnId: `grant:${slug}:${makeNonce()}`,
    def,
  });
  return true;
}
