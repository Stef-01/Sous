/**
 * room-binding — the pure, read-only resolver from a `DogeHealthPayload` + an
 * `ObjectSlot` to what the in-world object should show (Month 1 Week 1).
 *
 * No rendering, no writes, never throws. It mirrors the CONTRACT of the shipped
 * receiver helpers (`pctWord`/`fmtDetail` in `sous-bridge.js`) so the room objects
 * speak the same language as the cream HUD. The runtime (`room-objects.js`, Week 2)
 * calls these against the cached snapshot.
 */

import type { DogeHealthPayload } from "./doge-health-store";
import type { ObjectSlot } from "./room-manifest";

export type RoomBindingState = "ok" | "empty" | "error";

export interface RoomBinding {
  state: RoomBindingState;
  /** 0..100, clamped. */
  pct: number;
  /** Short qualitative word for the hover caption. */
  word: string;
  /** Exact "value / target unit" for the drill — present only for detail metrics. */
  detailText?: string;
  /** Coverage copy for number-less metrics (mood/vitamins) — never a value/target. */
  coverageText?: string;
  /** Deduped meals, for the feed companions (bag + notebook). */
  meals?: string[];
}

/** Matches the receiver's `pctWord` (sous-bridge.js) exactly. */
export function pctWord(p: number): string {
  return p >= 80
    ? "Great"
    : p >= 55
      ? "On track"
      : p >= 30
        ? "Getting there"
        : "Low";
}

/** Matches the receiver's `fmtDetail` (sous-bridge.js) exactly. */
export function fmtDetail(
  d: { value: number; target: number; unit: string } | undefined | null,
): string | undefined {
  if (!d || typeof d.value !== "number" || typeof d.target !== "number") {
    return undefined;
  }
  if (d.unit === "glass") return `${d.value} / ${d.target} glasses`;
  if (d.unit === "g") return `${d.value}g / ${d.target}g`;
  return `${d.value} / ${d.target} ${d.unit ?? ""}`.trim();
}

/**
 * Resolve a `coverageCopy` template. Only the `{pct}` token is interpolated, live
 * from the bound pct — so a coverage line can never carry a fabricated, stale, or
 * hard-coded data number (rule 7). Structural constants (e.g. "/5") are untouched.
 */
export function resolveCoverage(template: string, pct: number): string {
  return template.replace(/\{pct\}/g, String(Math.round(pct)));
}

function clampPct(p: unknown): number {
  const n = typeof p === "number" && Number.isFinite(p) ? p : 0;
  return Math.max(0, Math.min(100, n));
}

/**
 * Parse the raw localStorage value into a payload, NEVER throwing — a corrupt
 * (non-null, non-JSON) value returns null, not an exception that would blank the
 * canvas every frame (plan §3 / A7). The caller renders the error state on null.
 */
export function parseRoomPayload(
  raw: string | null | undefined,
): DogeHealthPayload | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    return p && typeof p === "object" && Array.isArray(p.stats)
      ? (p as DogeHealthPayload)
      : null;
  } catch {
    return null;
  }
}

/**
 * Resolve one slot against the payload. Pure + total: on a missing payload,
 * missing stat, or anything unexpected it returns the `error` state rather than
 * throwing. `detailUnit` present ⇒ emit `detailText` (value/target); absent ⇒ emit
 * `coverageText`, NEVER a fabricated number (rule 7). Feed slots return `meals`.
 */
export function readRoomBinding(
  payload: DogeHealthPayload | null | undefined,
  slot: ObjectSlot,
): RoomBinding {
  if (!payload || !Array.isArray(payload.stats)) {
    return { state: "error", pct: 0, word: pctWord(0) };
  }

  if (slot.bind.feed) {
    const meals = Array.isArray(payload.meals) ? payload.meals : [];
    return {
      state: meals.length > 0 ? "ok" : "empty",
      pct: 0,
      word: "",
      meals,
    };
  }

  const stat = payload.stats.find((s) => s && s.label === slot.label);
  if (!stat) return { state: "error", pct: 0, word: pctWord(0) };

  const pct = clampPct(stat.pct);
  const binding: RoomBinding = {
    state: pct > 0 ? "ok" : "empty",
    pct,
    word: pctWord(pct),
  };

  if (slot.bind.detailUnit) {
    binding.detailText = fmtDetail(stat.detail);
  } else if (slot.bind.coverageCopy) {
    binding.coverageText = resolveCoverage(slot.bind.coverageCopy, pct);
  }

  return binding;
}
