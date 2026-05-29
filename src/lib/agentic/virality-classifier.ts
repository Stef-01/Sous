/**
 * Virality classifier (Y2 Sprint J W40).
 *
 * Scores how "viral-recipe-shaped" a SearchResult looks. The
 * W42 chip eligibility gate fires only when this score crosses
 * the 0.7 threshold AND the W41 dedup / cool-down checks pass.
 *
 * Heuristics (each contributes a positive nudge, capped to
 * [0, 1]):
 *   - Recent published-date (within 14 days): +0.30
 *   - "viral" / "tiktok" / "trending" / etc tokens in title /
 *     snippet: +0.20
 *   - Social-media source domain (TikTok, IG, Reddit, etc):
 *     +0.20
 *   - Celebrity / creator-name match against the small
 *     in-process allowlist: +0.20
 *   - Engagement-signal hints in the snippet ("M views",
 *     "K likes"): +0.10
 *
 * Total clamps to 1.0. Each contribution adds to the
 * `reasons` array so callers (the W42 chip + dev tools) can
 * explain WHY a candidate scored high.
 *
 * Pure / dependency-free / deterministic.
 */

import type { SearchResult } from "./search-adapter";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Window inside which a recent published-date triggers the
 *  recency boost. Plan calls for 14 days. */
export const VIRALITY_RECENCY_DAYS = 14;
export const RECENCY_BOOST = 0.3;
export const KEYWORD_BOOST = 0.2;
export const SOCIAL_DOMAIN_BOOST = 0.2;
export const CELEBRITY_BOOST = 0.2;
export const ENGAGEMENT_BOOST = 0.1;

/** Domains we treat as social-media sources for the +0.20
 *  social boost. Hostnames are matched case-insensitively
 *  against the candidate's sourceDomain. */
const SOCIAL_DOMAINS: ReadonlyArray<string> = [
  "tiktok.com",
  "instagram.com",
  "reddit.com",
  "youtube.com",
  "youtu.be",
  "x.com",
  "twitter.com",
  "facebook.com",
  "pinterest.com",
];

/** Tokens that, when present in title or snippet, hint at
 *  viral content. Lower-case + whole-word matched to avoid
 *  triggering on "viralised" → "viral". */
const VIRAL_KEYWORDS: ReadonlyArray<string> = [
  "viral",
  "tiktok",
  "trending",
  "everyone is making",
  "internet's favourite",
  "internet's favorite",
  "famous",
  "must-try",
];

/** Engagement signals — substrings in the snippet that hint
 *  at a high-engagement post. Conservative regex so we don't
 *  match noise like "Mango". */
const ENGAGEMENT_PATTERNS: ReadonlyArray<RegExp> = [
  /\b\d+(?:\.\d+)?\s*[mkb]\s*(?:view|likes?|shares?)/i,
  /\b\d+(?:\.\d+)?\s*million\s+(?:views|likes|shares)/i,
  /\bgone\s+viral\b/i,
];

/** Small starter celebrity / creator allowlist. The W40 plan
 *  notes an LLM-extension can grow this in real mode; the
 *  static allowlist is the cheap default. Names lower-case +
 *  exact substring on title/snippet. */
const CELEBRITY_ALLOWLIST: ReadonlyArray<string> = [
  "kim k",
  "kim kardashian",
  "stanley tucci",
  "salt bae",
  "ina garten",
  "samin nosrat",
  "alison roman",
  "joshua weissman",
  "ottolenghi",
  "padma lakshmi",
];

export interface ViralityScore {
  /** 0..1 composite score. */
  score: number;
  /** Per-rule reason traces in priority order. The W42 chip
   *  template can pluck the strongest reason for the copy. */
  reasons: string[];
}

export interface ClassifyOptions {
  /** Reference "now" for the recency check. Tests inject a
   *  fixed Date for determinism. */
  now?: Date;
  /** Override the celebrity allowlist (for testing or
   *  per-region customisation). */
  celebrityAllowlist?: ReadonlyArray<string>;
}

/** Pure: classify how viral-recipe-shaped a result looks.
 *  Empty / malformed inputs collapse to score 0 with no
 *  reasons. */
export function classifyVirality(
  result: SearchResult,
  options: ClassifyOptions = {},
): ViralityScore {
  const now = options.now ?? new Date();
  const allowlist = options.celebrityAllowlist ?? CELEBRITY_ALLOWLIST;

  if (
    typeof result !== "object" ||
    result === null ||
    typeof result.title !== "string" ||
    typeof result.url !== "string"
  ) {
    return { score: 0, reasons: [] };
  }

  let score = 0;
  const reasons: string[] = [];
  const lowerTitle = result.title.toLowerCase();
  const lowerSnippet = (result.snippet ?? "").toLowerCase();
  const haystack = `${lowerTitle} ${lowerSnippet}`;

  // ── Recency ────────────────────────────────────────
  if (result.publishedAt) {
    const ts = new Date(result.publishedAt).getTime();
    if (Number.isFinite(ts)) {
      const ageDays = (now.getTime() - ts) / DAY_MS;
      if (ageDays >= 0 && ageDays <= VIRALITY_RECENCY_DAYS) {
        score += RECENCY_BOOST;
        reasons.push(`recent (published ${Math.floor(ageDays)} days ago)`);
      }
    }
  }

  // ── Viral keywords ────────────────────────────────
  for (const kw of VIRAL_KEYWORDS) {
    if (containsWord(haystack, kw)) {
      score += KEYWORD_BOOST;
      reasons.push(`keyword "${kw}"`);
      break; // single boost, not stacked
    }
  }

  // ── Social-media domain ───────────────────────────
  if (typeof result.sourceDomain === "string") {
    const lowerDomain = result.sourceDomain.toLowerCase();
    for (const sd of SOCIAL_DOMAINS) {
      if (lowerDomain === sd || lowerDomain.endsWith(`.${sd}`)) {
        score += SOCIAL_DOMAIN_BOOST;
        reasons.push(`social-media source (${sd})`);
        break;
      }
    }
  }

  // ── Celebrity / creator allowlist ─────────────────
  for (const name of allowlist) {
    if (haystack.includes(name.toLowerCase())) {
      score += CELEBRITY_BOOST;
      reasons.push(`creator "${name}"`);
      break;
    }
  }

  // ── Engagement signal ─────────────────────────────
  for (const re of ENGAGEMENT_PATTERNS) {
    if (re.test(haystack)) {
      score += ENGAGEMENT_BOOST;
      reasons.push("engagement signal in snippet");
      break;
    }
  }

  // Clamp.
  if (score < 0) score = 0;
  if (score > 1) score = 1;

  return { score, reasons };
}

/** Pure helper: case-insensitive whole-phrase match. Avoids
 *  triggering on substring noise like "viralised" matching
 *  "viral". For multi-word phrases ("everyone is making"),
 *  uses substring match — the phrase itself is unlikely to
 *  appear inside a longer word. */
function containsWord(haystack: string, phrase: string): boolean {
  const lower = phrase.toLowerCase();
  if (lower.includes(" ")) {
    return haystack.includes(lower);
  }
  // Single word — require word boundaries.
  const re = new RegExp(`\\b${escapeRegex(lower)}\\b`);
  return re.test(haystack);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
