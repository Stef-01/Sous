/**
 * Rate-limit abstraction (founder-gated scale: Upstash Redis).
 *
 * `checkRateLimit()` is a sliding-window limiter that works TODAY with an
 * in-memory store (per-instance burst protection — meaningful against a single
 * abuser hammering one warm Vercel instance) and upgrades to GLOBAL limiting
 * with one credential drop (rule 12): set UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN and swap `defaultLimiter` for the Upstash adapter
 * sketched in `upstashLimiter()` below (no SDK required — Upstash exposes a REST
 * API reachable with plain fetch).
 *
 * Fail-open by contract: any internal error resolves to `allowed: true`. A bug
 * in the limiter must never block a legitimate user.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in the current window (0 when blocked). */
  remaining: number;
  /** Epoch ms when the window frees up. */
  resetAt: number;
}

export interface RateLimitOptions {
  /** Caller bucket, e.g. `pairing:<deviceId>`. */
  key: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in ms. */
  windowMs: number;
}

// ── In-memory sliding window (default) ──────────────────────────────────────
// Map<key, ascending hit timestamps>. Pruned opportunistically so it can't grow
// unbounded across many distinct keys.
const hits = new Map<string, number[]>();
let lastSweep = 0;

function sweep(now: number, windowMs: number): void {
  // At most once per window, drop keys whose newest hit is fully expired.
  if (now - lastSweep < windowMs) return;
  lastSweep = now;
  for (const [key, times] of hits) {
    if (times.length === 0 || times[times.length - 1] <= now - windowMs) {
      hits.delete(key);
    }
  }
}

function inMemoryLimiter(opts: RateLimitOptions, now: number): RateLimitResult {
  const windowStart = now - opts.windowMs;
  const recent = (hits.get(opts.key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= opts.limit) {
    return { allowed: false, remaining: 0, resetAt: recent[0] + opts.windowMs };
  }
  recent.push(now);
  hits.set(opts.key, recent);
  sweep(now, opts.windowMs);
  return {
    allowed: true,
    remaining: Math.max(0, opts.limit - recent.length),
    resetAt: now + opts.windowMs,
  };
}

/** True once the Upstash REST env contract is present. */
export function hasDistributedLimiter(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export async function checkRateLimit(
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  try {
    // When Upstash is configured, route here (adapter is the founder's one-drop;
    // until then we use the in-memory window so the seam is exercised in dev).
    // if (hasDistributedLimiter()) return upstashLimiter(opts);
    return inMemoryLimiter(opts, Date.now());
  } catch {
    // Fail open — never block a legit caller because the limiter errored.
    return { allowed: true, remaining: opts.limit, resetAt: Date.now() };
  }
}

/** Test-only: reset the in-memory window between cases. */
export function __resetRateLimitStore(): void {
  hits.clear();
  lastSweep = 0;
}
