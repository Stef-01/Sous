import { describe, expect, it, vi } from "vitest";
import {
  QUERY_MAX_LENGTH,
  extractDomain,
  normaliseRawResults,
  pickSearchProvider,
  sanitiseSearchQuery,
  searchRecipeWeb,
  stubSearchFixture,
} from "./search-adapter";

// ── pickSearchProvider ────────────────────────────────────

describe("pickSearchProvider", () => {
  it("Tavily key present → tavily", () => {
    expect(pickSearchProvider({ TAVILY_API_KEY: "t" })).toBe("tavily");
  });

  it("only Brave key → brave", () => {
    expect(pickSearchProvider({ BRAVE_SEARCH_API_KEY: "b" })).toBe("brave");
  });

  it("only SerpAPI key → serpapi", () => {
    expect(pickSearchProvider({ SERPAPI_API_KEY: "s" })).toBe("serpapi");
  });

  it("multiple keys → Tavily wins (preferred)", () => {
    expect(
      pickSearchProvider({
        TAVILY_API_KEY: "t",
        BRAVE_SEARCH_API_KEY: "b",
        SERPAPI_API_KEY: "s",
      }),
    ).toBe("tavily");
  });

  it("no keys → stub", () => {
    expect(pickSearchProvider({})).toBe("stub");
  });

  it("master switch 'false' → stub even with keys", () => {
    expect(
      pickSearchProvider({
        TAVILY_API_KEY: "t",
        SOUS_AGENTIC_SEARCH_ENABLED: "false",
      }),
    ).toBe("stub");
  });

  it("empty key strings → treated as missing", () => {
    expect(pickSearchProvider({ TAVILY_API_KEY: "" })).toBe("stub");
  });
});

// ── sanitiseSearchQuery ───────────────────────────────────

describe("sanitiseSearchQuery", () => {
  it("trims leading/trailing whitespace", () => {
    expect(sanitiseSearchQuery("  pasta  ")).toBe("pasta");
  });

  it("collapses internal whitespace", () => {
    expect(sanitiseSearchQuery("viral    smoothie    recipe")).toBe(
      "viral smoothie recipe",
    );
  });

  it("preserves Unicode letters (café, naan, 東京)", () => {
    expect(sanitiseSearchQuery("café au lait")).toBe("café au lait");
    expect(sanitiseSearchQuery("naan recipe")).toBe("naan recipe");
    expect(sanitiseSearchQuery("東京の料理")).toBe("東京の料理");
  });

  it("strips control characters", () => {
    expect(sanitiseSearchQuery("pasta\x00\x01\x02")).toBe("pasta");
  });

  it("caps to QUERY_MAX_LENGTH", () => {
    const huge = "x".repeat(QUERY_MAX_LENGTH * 2);
    expect(sanitiseSearchQuery(huge).length).toBeLessThanOrEqual(
      QUERY_MAX_LENGTH,
    );
  });

  it("non-string input → empty", () => {
    expect(sanitiseSearchQuery(null as unknown as string)).toBe("");
  });

  it("empty input → empty", () => {
    expect(sanitiseSearchQuery("")).toBe("");
  });
});

// ── extractDomain ─────────────────────────────────────────

describe("extractDomain", () => {
  it("extracts host from a normal URL", () => {
    expect(extractDomain("https://example.com/recipe")).toBe("example.com");
  });

  it("strips port", () => {
    expect(extractDomain("https://example.com:8080/x")).toBe("example.com");
  });

  it("lowercases the host", () => {
    expect(extractDomain("https://EXAMPLE.COM/x")).toBe("example.com");
  });

  it("malformed URL → empty string", () => {
    expect(extractDomain("not-a-url")).toBe("");
  });
});

// ── normaliseRawResults ───────────────────────────────────

describe("normaliseRawResults", () => {
  it("happy path with title/url/snippet/published_date", () => {
    const out = normaliseRawResults([
      {
        title: "Viral pasta",
        url: "https://example-cooking.test/pasta",
        snippet: "A trending recipe",
        published_date: "2026-04-12",
      },
    ]);
    expect(out.length).toBe(1);
    expect(out[0]?.title).toBe("Viral pasta");
    expect(out[0]?.url).toBe("https://example-cooking.test/pasta");
    expect(out[0]?.snippet).toBe("A trending recipe");
    expect(out[0]?.publishedAt).toBe("2026-04-12");
    expect(out[0]?.sourceDomain).toBe("example-cooking.test");
  });

  it("alternate field names ('link', 'description') → mapped", () => {
    const out = normaliseRawResults([
      {
        title: "X",
        link: "https://example.test/x",
        description: "Description text",
      },
    ]);
    expect(out[0]?.url).toBe("https://example.test/x");
    expect(out[0]?.snippet).toBe("Description text");
  });

  it("missing url → entry dropped", () => {
    expect(
      normaliseRawResults([{ title: "X" }, { title: "Y", url: "" }]),
    ).toEqual([]);
  });

  it("non-object entries → silently skipped", () => {
    const out = normaliseRawResults([
      null,
      undefined,
      42,
      "string",
      { title: "X", url: "https://example.test/x" },
    ]);
    expect(out.length).toBe(1);
  });

  it("missing title → falls back to url", () => {
    const out = normaliseRawResults([{ url: "https://example.test/x" }]);
    expect(out[0]?.title).toBe("https://example.test/x");
  });

  it("snippet > 200 chars → trimmed", () => {
    const out = normaliseRawResults([
      {
        title: "X",
        url: "https://example.test/x",
        snippet: "x".repeat(500),
      },
    ]);
    expect(out[0]?.snippet.length).toBeLessThanOrEqual(200);
  });

  it("missing publishedAt → null", () => {
    const out = normaliseRawResults([
      { title: "X", url: "https://example.test/x" },
    ]);
    expect(out[0]?.publishedAt).toBe(null);
  });
});

// ── stubSearchFixture ─────────────────────────────────────

describe("stubSearchFixture", () => {
  it("returns 5 results", () => {
    expect(stubSearchFixture("pasta").length).toBe(5);
  });

  it("deterministic — same query → same results", () => {
    expect(stubSearchFixture("pasta")).toEqual(stubSearchFixture("pasta"));
  });

  it("query is sanitised + lowercased into the result text", () => {
    const out = stubSearchFixture("Viral Pasta!");
    expect(out[0]?.title.toLowerCase()).toContain("viral pasta");
  });

  it("each result has a sourceDomain", () => {
    for (const r of stubSearchFixture("pasta")) {
      expect(r.sourceDomain.length).toBeGreaterThan(0);
    }
  });

  it("no result has an empty url (W41 dedup invariant)", () => {
    for (const r of stubSearchFixture("pasta")) {
      expect(r.url.length).toBeGreaterThan(0);
    }
  });
});

// ── searchRecipeWeb dispatcher ────────────────────────────

describe("searchRecipeWeb — dispatcher", () => {
  it("empty query → empty results (skip the call)", async () => {
    const out = await searchRecipeWeb("   ", { env: {} });
    expect(out).toEqual([]);
  });

  it("no API key → stub mode", async () => {
    const out = await searchRecipeWeb("pasta", { env: {} });
    expect(out.length).toBe(5);
  });

  it("with API key + happy fetch → normalised real results", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            results: [
              {
                title: "Real result",
                url: "https://nytimes.com/x",
                snippet: "A real recipe.",
              },
            ],
          }),
          { status: 200 },
        ),
    ) as unknown as typeof fetch;
    const out = await searchRecipeWeb("pasta", {
      env: { TAVILY_API_KEY: "t" },
      fetchImpl,
    });
    expect(out.length).toBe(1);
    expect(out[0]?.sourceDomain).toBe("nytimes.com");
  });

  it("with key + HTTP error → stub fallback", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("err", { status: 500 }),
    ) as unknown as typeof fetch;
    const out = await searchRecipeWeb("pasta", {
      env: { TAVILY_API_KEY: "t" },
      fetchImpl,
    });
    expect(out.length).toBe(5);
  });

  it("network throw → stub fallback (never throws)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("boom");
    }) as unknown as typeof fetch;
    const out = await searchRecipeWeb("pasta", {
      env: { TAVILY_API_KEY: "t" },
      fetchImpl,
    });
    expect(out.length).toBe(5);
  });

  it("real-mode empty results → stub fallback (always something to rank)", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ results: [] }), { status: 200 }),
    ) as unknown as typeof fetch;
    const out = await searchRecipeWeb("pasta", {
      env: { TAVILY_API_KEY: "t" },
      fetchImpl,
    });
    expect(out.length).toBe(5);
  });
});
