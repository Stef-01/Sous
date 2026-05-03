import { describe, expect, it, vi } from "vitest";
import {
  buildAgenticPrompt,
  filterEligibleCandidates,
  isPodAgenticEnabled,
  pickAgenticChallenge,
  pickStubAgentic,
  validateAgenticResponse,
  type AgenticPickerInput,
  type PickerCandidate,
} from "./agentic-picker";

const POOL: PickerCandidate[] = [
  {
    slug: "carbonara",
    cuisineFamily: "italian",
    dietaryFlags: ["vegetarian"],
  },
  {
    slug: "tikka-masala",
    cuisineFamily: "indian",
    dietaryFlags: ["gluten-free"],
  },
  {
    slug: "ratatouille",
    cuisineFamily: "french",
    dietaryFlags: ["vegan", "vegetarian", "gluten-free"],
  },
  {
    slug: "pad-see-ew",
    cuisineFamily: "thai",
    dietaryFlags: ["dairy-free"],
  },
  {
    slug: "shakshuka",
    cuisineFamily: "middle-eastern",
    dietaryFlags: ["vegetarian", "gluten-free"],
  },
];

function fixtureInput(
  over: Partial<AgenticPickerInput> = {},
): AgenticPickerInput {
  return {
    candidates: POOL,
    recentCuisines: [],
    dietaryUnion: [],
    isoWeek: 18,
    ...over,
  };
}

// ── isPodAgenticEnabled ───────────────────────────────────

describe("isPodAgenticEnabled", () => {
  it("ANTHROPIC_API_KEY present → true", () => {
    expect(isPodAgenticEnabled({ ANTHROPIC_API_KEY: "sk" })).toBe(true);
  });

  it("missing key → false", () => {
    expect(isPodAgenticEnabled({})).toBe(false);
  });

  it("empty key → false", () => {
    expect(isPodAgenticEnabled({ ANTHROPIC_API_KEY: "" })).toBe(false);
  });

  it("master switch 'false' → false even with key", () => {
    expect(
      isPodAgenticEnabled({
        ANTHROPIC_API_KEY: "sk",
        SOUS_POD_AGENTIC_ENABLED: "false",
      }),
    ).toBe(false);
  });
});

// ── filterEligibleCandidates ──────────────────────────────

describe("filterEligibleCandidates — dietary union", () => {
  it("empty union → all candidates eligible", () => {
    expect(filterEligibleCandidates(fixtureInput()).length).toBe(POOL.length);
  });

  it("vegan union → only ratatouille", () => {
    expect(
      filterEligibleCandidates(fixtureInput({ dietaryUnion: ["vegan"] })).map(
        (c) => c.slug,
      ),
    ).toEqual(["ratatouille"]);
  });

  it("multi-flag union → must satisfy ALL", () => {
    expect(
      filterEligibleCandidates(
        fixtureInput({ dietaryUnion: ["vegetarian", "gluten-free"] }),
      ).map((c) => c.slug),
    ).toEqual(expect.arrayContaining(["ratatouille", "shakshuka"]));
  });

  it("union no candidate satisfies → empty list", () => {
    expect(
      filterEligibleCandidates(
        fixtureInput({ dietaryUnion: ["nut-allergy", "shellfish-allergy"] }),
      ),
    ).toEqual([]);
  });

  it("case-insensitive flag matching", () => {
    expect(
      filterEligibleCandidates(fixtureInput({ dietaryUnion: ["VEGAN"] })).map(
        (c) => c.slug,
      ),
    ).toEqual(["ratatouille"]);
  });
});

describe("filterEligibleCandidates — recent-cuisine soft avoidance", () => {
  it("recent cuisine excluded when alternatives exist", () => {
    const out = filterEligibleCandidates(
      fixtureInput({ recentCuisines: ["italian"] }),
    );
    expect(out.find((c) => c.cuisineFamily === "italian")).toBeUndefined();
  });

  it("recent-avoidance falls back to full pool when nothing else qualifies", () => {
    // Strict diet + recent — if recent kills the only candidate
    // we fall back rather than fail.
    const restricted: PickerCandidate[] = [
      { slug: "only-vegan", cuisineFamily: "italian", dietaryFlags: ["vegan"] },
    ];
    const out = filterEligibleCandidates({
      candidates: restricted,
      recentCuisines: ["italian"],
      dietaryUnion: ["vegan"],
      isoWeek: 1,
    });
    expect(out.map((c) => c.slug)).toEqual(["only-vegan"]);
  });

  it("multiple recent cuisines all excluded simultaneously", () => {
    const out = filterEligibleCandidates(
      fixtureInput({ recentCuisines: ["italian", "indian"] }),
    );
    expect(
      out.find((c) => ["italian", "indian"].includes(c.cuisineFamily)),
    ).toBeUndefined();
  });
});

// ── pickStubAgentic — determinism ─────────────────────────

describe("pickStubAgentic — determinism", () => {
  it("same input → same pick (reproducible)", () => {
    const a = pickStubAgentic(fixtureInput({ isoWeek: 18 }));
    const b = pickStubAgentic(fixtureInput({ isoWeek: 18 }));
    expect(a).toEqual(b);
  });

  it("different week → different pick (with diverse pool)", () => {
    const a = pickStubAgentic(fixtureInput({ isoWeek: 18 }));
    const b = pickStubAgentic(fixtureInput({ isoWeek: 19 }));
    expect(a.ok && b.ok && a.slug !== b.slug).toBe(true);
  });

  it("week wraps modulo eligible pool size", () => {
    const a = pickStubAgentic(fixtureInput({ isoWeek: 0 }));
    const b = pickStubAgentic(fixtureInput({ isoWeek: POOL.length }));
    expect(a.ok && b.ok && a.slug === b.slug).toBe(true);
  });

  it("non-finite week → coerces to 0", () => {
    const a = pickStubAgentic(fixtureInput({ isoWeek: Number.NaN }));
    const b = pickStubAgentic(fixtureInput({ isoWeek: 0 }));
    expect(a.ok && b.ok && a.slug === b.slug).toBe(true);
  });

  it("no eligible candidates → ok=false", () => {
    const out = pickStubAgentic(
      fixtureInput({ dietaryUnion: ["nut-allergy", "shellfish-allergy"] }),
    );
    expect(out.ok).toBe(false);
  });
});

// ── buildAgenticPrompt ────────────────────────────────────

describe("buildAgenticPrompt", () => {
  it("system message enforces structured-output JSON shape", () => {
    const out = buildAgenticPrompt(fixtureInput());
    expect(out.system).toContain("JSON");
    expect(out.system).toContain("slug");
  });

  it("user message lists eligible slugs", () => {
    const out = buildAgenticPrompt(fixtureInput());
    expect(out.user).toContain("carbonara");
    expect(out.user).toContain("ratatouille");
  });

  it("user message includes voted twist when set", () => {
    const out = buildAgenticPrompt(
      fixtureInput({ votedTwist: "spicier than usual" }),
    );
    expect(out.user).toContain("spicier than usual");
  });

  it("user message indicates no twist when absent", () => {
    const out = buildAgenticPrompt(fixtureInput());
    expect(out.user.toLowerCase()).toContain("no voted twist");
  });
});

// ── validateAgenticResponse ───────────────────────────────

describe("validateAgenticResponse", () => {
  it("valid JSON with eligible slug → returns slug", () => {
    expect(
      validateAgenticResponse('{"slug":"carbonara"}', fixtureInput()),
    ).toBe("carbonara");
  });

  it("rejects slug not in eligible pool", () => {
    expect(
      validateAgenticResponse('{"slug":"saffron-rice"}', fixtureInput()),
    ).toBeNull();
  });

  it("rejects non-JSON", () => {
    expect(validateAgenticResponse("just text", fixtureInput())).toBeNull();
  });

  it("strips ```json``` code fences before parsing", () => {
    expect(
      validateAgenticResponse(
        '```json\n{"slug":"carbonara"}\n```',
        fixtureInput(),
      ),
    ).toBe("carbonara");
  });

  it("rejects array / primitive parsed values", () => {
    expect(validateAgenticResponse("[]", fixtureInput())).toBeNull();
    expect(validateAgenticResponse("42", fixtureInput())).toBeNull();
  });

  it("rejects when slug field missing", () => {
    expect(
      validateAgenticResponse('{"recipe":"carbonara"}', fixtureInput()),
    ).toBeNull();
  });

  it("respects dietary filter — slug filtered out is rejected", () => {
    // carbonara is vegetarian — excluded under vegan union.
    expect(
      validateAgenticResponse(
        '{"slug":"carbonara"}',
        fixtureInput({ dietaryUnion: ["vegan"] }),
      ),
    ).toBeNull();
  });
});

// ── pickAgenticChallenge — dispatcher ─────────────────────

describe("pickAgenticChallenge — dispatcher", () => {
  function mockFetchOk(text: string): typeof fetch {
    return vi.fn(
      async () =>
        new Response(JSON.stringify({ content: [{ type: "text", text }] }), {
          status: 200,
        }),
    ) as unknown as typeof fetch;
  }

  it("no API key → stub mode", async () => {
    const out = await pickAgenticChallenge(fixtureInput(), { env: {} });
    expect(out.ok && out.mode === "stub").toBe(true);
  });

  it("with key + valid LLM response → llm mode", async () => {
    const out = await pickAgenticChallenge(fixtureInput(), {
      env: { ANTHROPIC_API_KEY: "sk" },
      fetchImpl: mockFetchOk('{"slug":"ratatouille"}'),
    });
    expect(out.ok && out.mode === "llm" && out.slug === "ratatouille").toBe(
      true,
    );
  });

  it("with key + off-list LLM response → falls back to stub", async () => {
    const out = await pickAgenticChallenge(fixtureInput(), {
      env: { ANTHROPIC_API_KEY: "sk" },
      fetchImpl: mockFetchOk('{"slug":"hallucinated-recipe"}'),
    });
    expect(out.ok && out.mode === "stub").toBe(true);
  });

  it("HTTP error → stub fallback", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("err", { status: 500 }),
    ) as unknown as typeof fetch;
    const out = await pickAgenticChallenge(fixtureInput(), {
      env: { ANTHROPIC_API_KEY: "sk" },
      fetchImpl,
    });
    expect(out.ok && out.mode === "stub").toBe(true);
  });

  it("network throw → stub fallback", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("boom");
    }) as unknown as typeof fetch;
    const out = await pickAgenticChallenge(fixtureInput(), {
      env: { ANTHROPIC_API_KEY: "sk" },
      fetchImpl,
    });
    expect(out.ok && out.mode === "stub").toBe(true);
  });
});
