"use client";

/**
 * Diary sync (#1 depth work) — local-first write-through between the shared
 * localStorage diary store and Supabase (via the tRPC vanilla client, which
 * carries the x-sous-device-id header).
 *
 * Model:
 *  - Every diary mutation ENQUEUES its row (tombstone for removals) into a
 *    persisted outbox, then a debounced flush pushes the batch. Pushes are
 *    idempotent server-side ((user_id, at) upsert), so retries are safe and
 *    offline writes survive reloads.
 *  - On the first subscriber of the session, pullAndMerge() fetches the
 *    server's last 90 days and reconciles: remote tombstones delete local
 *    entries; unseen remote entries are added to their day; local entries the
 *    server doesn't know about are enqueued for push (first-sync upload).
 *  - device_kv carries the personal profile + streak freezes the same way.
 *
 * Everything degrades gracefully: no env / offline → flushes fail quietly,
 * the outbox persists, localStorage stays the source of truth.
 */

import type { DiaryEntry } from "@/lib/hooks/use-nutrition-diary";

export interface SyncEntry {
  day: string;
  at: string;
  slug: string;
  name: string;
  servings: number;
  brand?: string | null;
  nutrition?: Record<string, unknown> | null;
  auto?: boolean;
  deleted?: boolean;
}

export interface SyncKv {
  key: "personal-profile" | "streak-freezes";
  value: Record<string, unknown>;
}

type DiaryStore = Record<string, DiaryEntry[]>;

const OUTBOX_KEY = "sous-diary-outbox-v1";
const PULLED_KEY = "sous-diary-pulled-v1"; // last successful pull (epoch ms)
const FLUSH_DELAY_MS = 1500;

// ── Outbox (persisted) ───────────────────────────────────────────────────────

interface Outbox {
  entries: SyncEntry[];
  kv: SyncKv[];
}

function readOutbox(): Outbox {
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    const p = raw ? (JSON.parse(raw) as Outbox) : null;
    return p && Array.isArray(p.entries) && Array.isArray(p.kv)
      ? p
      : { entries: [], kv: [] };
  } catch {
    return { entries: [], kv: [] };
  }
}

function writeOutbox(box: Outbox): void {
  try {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(box));
  } catch {
    // privacy mode — sync becomes session-best-effort
  }
}

/** Enqueue (replacing any older queued row with the same identity) + flush. */
export function enqueueEntrySync(entry: SyncEntry): void {
  if (typeof window === "undefined") return;
  const box = readOutbox();
  box.entries = [...box.entries.filter((e) => e.at !== entry.at), entry];
  writeOutbox(box);
  scheduleFlush();
}

export function enqueueKvSync(kv: SyncKv): void {
  if (typeof window === "undefined") return;
  const box = readOutbox();
  box.kv = [...box.kv.filter((k) => k.key !== kv.key), kv];
  writeOutbox(box);
  scheduleFlush();
}

// ── Flush (debounced, retry-safe) ────────────────────────────────────────────

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function scheduleFlush(): void {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushOutbox();
  }, FLUSH_DELAY_MS);
}

export async function flushOutbox(): Promise<boolean> {
  if (flushing || typeof window === "undefined") return false;
  const box = readOutbox();
  if (box.entries.length === 0 && box.kv.length === 0) return true;
  flushing = true;
  try {
    const { getVanillaTrpc } = await import("@/lib/trpc/vanilla");
    const res = await getVanillaTrpc().diary.push.mutate({
      entries: box.entries.slice(0, 200),
      kv: box.kv,
    });
    if (res.persisted) {
      // Clear exactly what we sent; anything enqueued meanwhile stays.
      const sentAts = new Set(box.entries.slice(0, 200).map((e) => e.at));
      const sentKeys = new Set(box.kv.map((k) => k.key));
      const now = readOutbox();
      writeOutbox({
        entries: now.entries.filter((e) => !sentAts.has(e.at)),
        kv: now.kv.filter((k) => !sentKeys.has(k.key)),
      });
      return true;
    }
    return false;
  } catch {
    return false; // outbox persists; next mutation or pull retries
  } finally {
    flushing = false;
  }
}

// ── Pull + merge (pure core, unit-tested) ────────────────────────────────────

export interface MergeResult {
  /** The reconciled store (new object only when something changed). */
  store: DiaryStore;
  changed: boolean;
  /** Local entries the server doesn't know — to enqueue for push. */
  toPush: SyncEntry[];
}

export function mergeRemoteEntries(
  local: DiaryStore,
  remote: ReadonlyArray<SyncEntry>,
): MergeResult {
  const remoteByAt = new Map(remote.map((e) => [e.at, e]));
  let changed = false;
  const next: DiaryStore = { ...local };

  // 1) Apply remote rows: tombstones delete; unseen live rows insert.
  for (const r of remote) {
    const day = next[r.day] ?? [];
    const idx = day.findIndex((e) => e.at === r.at);
    if (r.deleted) {
      if (idx >= 0) {
        next[r.day] = day.filter((e) => e.at !== r.at);
        changed = true;
      }
      continue;
    }
    if (idx === -1) {
      const entry: DiaryEntry = {
        slug: r.slug,
        name: r.name,
        servings: r.servings,
        at: r.at,
        ...(r.brand ? { brand: r.brand } : {}),
        ...(r.nutrition
          ? { nutrition: r.nutrition as unknown as DiaryEntry["nutrition"] }
          : {}),
        ...(r.auto ? { auto: true } : {}),
      };
      next[r.day] = [...day, entry].sort((a, b) => (a.at < b.at ? -1 : 1));
      changed = true;
    }
  }

  // 2) Local entries the server has never seen → push (first-sync upload).
  const toPush: SyncEntry[] = [];
  for (const [day, entries] of Object.entries(local)) {
    for (const e of entries) {
      if (!remoteByAt.has(e.at)) {
        toPush.push({
          day,
          at: e.at,
          slug: e.slug,
          name: e.name,
          servings: e.servings,
          brand: e.brand ?? null,
          nutrition:
            (e.nutrition as unknown as Record<string, unknown>) ?? null,
          auto: e.auto ?? false,
        });
      }
    }
  }
  return { store: changed ? next : local, changed, toPush };
}

// ── Session bootstrap ────────────────────────────────────────────────────────

let pullStarted = false;

/**
 * One pull per session (first diary subscriber triggers it). `applyStore` is
 * the diary store's adopt-remote callback; kv callbacks hand the remote
 * profile/freezes to their stores (each decides adopt-vs-push).
 */
export function ensurePulled(handlers: {
  getLocal: () => DiaryStore;
  applyStore: (next: DiaryStore) => void;
  applyKv: (rows: ReadonlyArray<SyncKv>) => void;
}): void {
  if (pullStarted || typeof window === "undefined") return;
  pullStarted = true;
  void (async () => {
    try {
      const { getVanillaTrpc } = await import("@/lib/trpc/vanilla");
      const res = await getVanillaTrpc().diary.pull.query({ daysBack: 90 });
      if (!res.available) return;
      const merged = mergeRemoteEntries(
        handlers.getLocal(),
        res.entries as SyncEntry[],
      );
      if (merged.changed) handlers.applyStore(merged.store);
      for (const e of merged.toPush) enqueueEntrySync(e);
      handlers.applyKv(res.kv as SyncKv[]);
      try {
        window.localStorage.setItem(PULLED_KEY, String(Date.now()));
      } catch {
        // non-fatal
      }
      void flushOutbox();
    } catch {
      pullStarted = false; // allow a later retry this session
    }
  })();
}
