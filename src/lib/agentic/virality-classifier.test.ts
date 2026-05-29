import { describe, expect, it } from "vitest";
import {
  CELEBRITY_BOOST,
  ENGAGEMENT_BOOST,
  KEYWORD_BOOST,
  RECENCY_BOOST,
  SOCIAL_DOMAIN_BOOST,
  VIRALITY_RECENCY_DAYS,
  classifyVirality,
} from "./virality-classifier";
import type { SearchResult } from "./search-adapter";

const DAY_MS = 24 * 60 * 60 * 1000;

const NOW = new Date("2026-05-15T12:00:00");

function fixtureResult(over: Partial<SearchResult> = {}): SearchResult {
  return {
    title: "Recipe page",
    url: "https://example.test/recipe",
    snippet: "A nice recipe.",
    publishedAt: null,
    sourceDomain: "example.test",
    ...over,
  };
}

// ── empty / malformed input ───────────────────────────────

describe("classifyVirality — empty / malformed", () => {
  it("missing title → score 0", () => {
    const out = classifyVirality(
      { ...fixtureResult(), title: undefined as unknown as string },
      { now: NOW },
    );
    expect(out.score).toBe(0);
    expect(out.reasons).toEqual([]);
  });

  it("baseline (no signals) → score 0", () => {
    const out = classifyVirality(fixtureResult(), { now: NOW });
    expect(out.score).toBe(0);
    expect(out.reasons).toEqual([]);
  });
});

// ── recency ───────────────────────────────────────────────

describe("classifyVirality — recency", () => {
  it("published today → recency boost", () => {
    const out = classifyVirality(
      fixtureResult({ publishedAt: NOW.toISOString() }),
      { now: NOW },
    );
    expect(out.score).toBeCloseTo(RECENCY_BOOST, 5);
    expect(out.reasons[0]?.toLowerCase()).toContain("recent");
  });

  it("published exactly at window edge → boost (inclusive)", () => {
    const ts = new Date(NOW.getTime() - VIRALITY_RECENCY_DAYS * DAY_MS);
    const out = classifyVirality(
      fixtureResult({ publishedAt: ts.toISOString() }),
      { now: NOW },
    );
    expect(out.score).toBeCloseTo(RECENCY_BOOST, 5);
  });

  it("published past window → no recency boost", () => {
    const ts = new Date(NOW.getTime() - (VIRALITY_RECENCY_DAYS + 1) * DAY_MS);
    const out = classifyVirality(
      fixtureResult({ publishedAt: ts.toISOString() }),
      { now: NOW },
    );
    expect(out.score).toBe(0);
  });

  it("invalid publishedAt → no recency boost (defensive)", () => {
    const out = classifyVirality(fixtureResult({ publishedAt: "not-a-date" }), {
      now: NOW,
    });
    expect(out.score).toBe(0);
  });
});

// ── viral keywords ────────────────────────────────────────

describe("classifyVirality — viral keywords", () => {
  it("'viral' in title → keyword boost", () => {
    const out = classifyVirality(
      fixtureResult({ title: "The viral pasta everyone is making" }),
      { now: NOW },
    );
    expect(out.score).toBeGreaterThanOrEqual(KEYWORD_BOOST);
  });

  it("'tiktok' in snippet → keyword boost", () => {
    const out = classifyVirality(
      fixtureResult({ snippet: "blew up on TikTok last week" }),
      { now: NOW },
    );
    expect(out.score).toBeGreaterThanOrEqual(KEYWORD_BOOST);
  });

  it("multi-word phrase 'everyone is making' triggers", () => {
    const out = classifyVirality(
      fixtureResult({ title: "the soup everyone is making in 2026" }),
      { now: NOW },
    );
    expect(out.score).toBeGreaterThanOrEqual(KEYWORD_BOOST);
  });

  it("does NOT trigger on word-substring like 'viralised'", () => {
    const out = classifyVirality(
      fixtureResult({ title: "a viralised pasta sauce" }),
      { now: NOW },
    );
    expect(out.score).toBe(0);
  });

  it("only one keyword boost stacks (not multiple)", () => {
    const out = classifyVirality(
      fixtureResult({
        title: "viral tiktok trending recipe",
        snippet: "must-try",
      }),
      { now: NOW },
    );
    // 4 keywords match, but only ONE keyword boost is applied.
    // No other boosts — so total = exactly KEYWORD_BOOST.
    expect(out.score).toBeCloseTo(KEYWORD_BOOST, 5);
  });
});

// ── social-media domain ───────────────────────────────────

describe("classifyVirality — social-media domain", () => {
  it("tiktok.com → social boost", () => {
    const out = classifyVirality(
      fixtureResult({ sourceDomain: "tiktok.com" }),
      { now: NOW },
    );
    expect(out.score).toBeCloseTo(SOCIAL_DOMAIN_BOOST, 5);
  });

  it("subdomain match (m.tiktok.com) → social boost", () => {
    const out = classifyVirality(
      fixtureResult({ sourceDomain: "m.tiktok.com" }),
      { now: NOW },
    );
    expect(out.score).toBeCloseTo(SOCIAL_DOMAIN_BOOST, 5);
  });

  it("non-social domain → no social boost", () => {
    expect(
      classifyVirality(fixtureResult({ sourceDomain: "nytimes.com" }), {
        now: NOW,
      }).score,
    ).toBe(0);
  });

  it("case-insensitive domain match", () => {
    expect(
      classifyVirality(fixtureResult({ sourceDomain: "TIKTOK.COM" }), {
        now: NOW,
      }).score,
    ).toBeCloseTo(SOCIAL_DOMAIN_BOOST, 5);
  });
});

// ── celebrity allowlist ───────────────────────────────────

describe("classifyVirality — celebrity allowlist", () => {
  it("'kim k' in title → celebrity boost", () => {
    const out = classifyVirality(
      fixtureResult({ title: "Kim K's morning smoothie" }),
      { now: NOW },
    );
    expect(out.score).toBeCloseTo(CELEBRITY_BOOST, 5);
  });

  it("snippet mention also triggers", () => {
    const out = classifyVirality(
      fixtureResult({ snippet: "as featured by Stanley Tucci" }),
      { now: NOW },
    );
    expect(out.score).toBeCloseTo(CELEBRITY_BOOST, 5);
  });

  it("non-allowlisted name → no celebrity boost", () => {
    expect(
      classifyVirality(
        fixtureResult({ title: "Random Personal Blogger's recipe" }),
        { now: NOW },
      ).score,
    ).toBe(0);
  });

  it("custom allowlist override works", () => {
    const out = classifyVirality(
      fixtureResult({ title: "Tester McTesty's recipe" }),
      { now: NOW, celebrityAllowlist: ["tester mctesty"] },
    );
    expect(out.score).toBeCloseTo(CELEBRITY_BOOST, 5);
  });
});

// ── engagement signals ────────────────────────────────────

describe("classifyVirality — engagement signals", () => {
  it("'2.5M views' in snippet → engagement boost", () => {
    const out = classifyVirality(
      fixtureResult({ snippet: "Hit 2.5M views in three days" }),
      { now: NOW },
    );
    expect(out.score).toBeGreaterThanOrEqual(ENGAGEMENT_BOOST);
  });

  it("'gone viral' phrase counts as engagement signal", () => {
    const out = classifyVirality(
      fixtureResult({ snippet: "This dish has gone viral overnight" }),
      { now: NOW },
    );
    expect(out.score).toBeGreaterThanOrEqual(KEYWORD_BOOST);
  });

  it("plain dish name → no engagement boost", () => {
    expect(
      classifyVirality(fixtureResult({ snippet: "Mango chutney for summer" }), {
        now: NOW,
      }).score,
    ).toBe(0);
  });
});

// ── score composition + clamp ─────────────────────────────

describe("classifyVirality — composition", () => {
  it("recency + keyword + social + celebrity stacks (all 4)", () => {
    const ts = new Date(NOW.getTime() - 3 * DAY_MS).toISOString();
    const out = classifyVirality(
      fixtureResult({
        title: "Kim K's viral smoothie",
        snippet: "blew up on TikTok",
        publishedAt: ts,
        sourceDomain: "tiktok.com",
      }),
      { now: NOW },
    );
    // 0.30 + 0.20 + 0.20 + 0.20 = 0.90
    expect(out.score).toBeCloseTo(0.9, 5);
    expect(out.reasons.length).toBe(4);
  });

  it("score clamps to 1.0 max even when all boosts fire", () => {
    const ts = new Date(NOW.getTime() - 1 * DAY_MS).toISOString();
    const out = classifyVirality(
      fixtureResult({
        title: "Kim K's viral TikTok smoothie",
        snippet: "Hit 2.5M views — gone viral overnight",
        publishedAt: ts,
        sourceDomain: "tiktok.com",
      }),
      { now: NOW },
    );
    expect(out.score).toBeLessThanOrEqual(1);
  });

  it("reasons array preserves the order the rules fired", () => {
    const ts = new Date(NOW.getTime() - 1 * DAY_MS).toISOString();
    const out = classifyVirality(
      fixtureResult({
        title: "viral pasta",
        publishedAt: ts,
      }),
      { now: NOW },
    );
    // recency runs first, then keywords
    expect(out.reasons[0]?.toLowerCase()).toContain("recent");
    expect(out.reasons[1]?.toLowerCase()).toContain("viral");
  });
});

// ── monotonicity ──────────────────────────────────────────

describe("classifyVirality — monotonicity", () => {
  it("adding a signal never decreases the score", () => {
    const baseline = fixtureResult({});
    const enhanced = fixtureResult({ title: "viral pasta" });
    expect(
      classifyVirality(enhanced, { now: NOW }).score,
    ).toBeGreaterThanOrEqual(classifyVirality(baseline, { now: NOW }).score);
  });

  it("determinism — same input → same output", () => {
    const r = fixtureResult({ title: "Kim K's viral pasta" });
    const a = classifyVirality(r, { now: NOW });
    const b = classifyVirality(r, { now: NOW });
    expect(a).toEqual(b);
  });
});
