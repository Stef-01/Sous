import { describe, expect, it, beforeEach } from "vitest";
import {
  checkRateLimit,
  hasDistributedLimiter,
  __resetRateLimitStore,
} from "./rate-limit";

describe("checkRateLimit — in-memory sliding window", () => {
  beforeEach(() => __resetRateLimitStore());

  it("allows up to the limit, then blocks", async () => {
    const opts = { key: "t:user1", limit: 3, windowMs: 60_000 };
    expect((await checkRateLimit(opts)).allowed).toBe(true);
    expect((await checkRateLimit(opts)).allowed).toBe(true);
    const third = await checkRateLimit(opts);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
    const fourth = await checkRateLimit(opts);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("keeps buckets independent by key", async () => {
    const a = { key: "t:a", limit: 1, windowMs: 60_000 };
    const b = { key: "t:b", limit: 1, windowMs: 60_000 };
    expect((await checkRateLimit(a)).allowed).toBe(true);
    expect((await checkRateLimit(a)).allowed).toBe(false);
    // a different key is unaffected by a's exhaustion
    expect((await checkRateLimit(b)).allowed).toBe(true);
  });

  it("decrements remaining each hit", async () => {
    const opts = { key: "t:rem", limit: 3, windowMs: 60_000 };
    expect((await checkRateLimit(opts)).remaining).toBe(2);
    expect((await checkRateLimit(opts)).remaining).toBe(1);
    expect((await checkRateLimit(opts)).remaining).toBe(0);
  });

  it("returns a future resetAt while allowed", async () => {
    const r = await checkRateLimit({
      key: "t:reset",
      limit: 5,
      windowMs: 60_000,
    });
    expect(r.allowed).toBe(true);
    expect(r.resetAt).toBeGreaterThan(Date.now() - 2_000);
  });

  it("isolates state after a store reset", async () => {
    const opts = { key: "t:user1", limit: 1, windowMs: 60_000 };
    expect((await checkRateLimit(opts)).allowed).toBe(true);
    expect((await checkRateLimit(opts)).allowed).toBe(false);
    __resetRateLimitStore();
    expect((await checkRateLimit(opts)).allowed).toBe(true);
  });

  it("reports the distributed limiter as off without the Upstash env", () => {
    expect(hasDistributedLimiter()).toBe(false);
  });
});
