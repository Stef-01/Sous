import { describe, expect, it, vi } from "vitest";
import {
  CONVERSATION_RESPONSE_MAX_CHARS,
  STUB_FALLBACK_MESSAGE,
  buildConversationPrompt,
  isConversationLlmEnabled,
  requestConversationAnswer,
  validateConversationResponse,
} from "./conversation-fallback";
import type { StepRecallStep } from "./step-recall";

const recipe: StepRecallStep[] = [
  { instruction: "Heat oil in a pan." },
  { instruction: "Add chopped onions; cook until translucent." },
  { instruction: "Add garlic; bloom the spices for 30 seconds." },
  { instruction: "Pour in tomatoes and a pinch of salt." },
  { instruction: "Simmer for 15 minutes." },
];

// ── isConversationLlmEnabled ──────────────────────────────

describe("isConversationLlmEnabled", () => {
  it("ANTHROPIC_API_KEY present → true", () => {
    expect(isConversationLlmEnabled({ ANTHROPIC_API_KEY: "sk-..." })).toBe(
      true,
    );
  });

  it("missing key → false (stub mode)", () => {
    expect(isConversationLlmEnabled({})).toBe(false);
  });

  it("empty key → false", () => {
    expect(isConversationLlmEnabled({ ANTHROPIC_API_KEY: "" })).toBe(false);
  });

  it("master switch 'false' → false even with key", () => {
    expect(
      isConversationLlmEnabled({
        ANTHROPIC_API_KEY: "sk-...",
        SOUS_VOICE_LLM_ENABLED: "false",
      }),
    ).toBe(false);
  });

  it("other master-switch values → true (default-on with key)", () => {
    expect(
      isConversationLlmEnabled({
        ANTHROPIC_API_KEY: "sk-...",
        SOUS_VOICE_LLM_ENABLED: "true",
      }),
    ).toBe(true);
  });
});

// ── buildConversationPrompt ───────────────────────────────

describe("buildConversationPrompt", () => {
  it("system prompt enforces step-list-only boundary", () => {
    const out = buildConversationPrompt("did I add salt", recipe, 2);
    expect(out.system.toLowerCase()).toContain("only");
    expect(out.system.toLowerCase()).toContain("step");
  });

  it("user prompt includes the question verbatim", () => {
    const out = buildConversationPrompt("did I add salt?", recipe, 2);
    expect(out.user).toContain("did I add salt?");
  });

  it("user prompt windows around current step (3 prior + next 1)", () => {
    const out = buildConversationPrompt("?", recipe, 3);
    // currentIdx=3, window = max(0, 0)..min(5, 5) = steps 1-5
    expect(out.user).toContain("Heat oil");
    expect(out.user).toContain("Simmer");
  });

  it("at index 0 → window starts at step 1", () => {
    const out = buildConversationPrompt("?", recipe, 0);
    expect(out.user).toContain("1. Heat oil");
  });

  it("at last index → window includes prior 3 + current", () => {
    const out = buildConversationPrompt("?", recipe, recipe.length - 1);
    expect(out.user).toContain("Simmer");
  });

  it("steps numbered 1-indexed in the prompt", () => {
    const out = buildConversationPrompt("?", recipe, 1);
    expect(out.user).toContain("1. ");
    expect(out.user).toContain("2. ");
  });

  it("clamp negative currentStepIndex to 0", () => {
    const out = buildConversationPrompt("?", recipe, -5);
    expect(out.user).toContain("1. Heat oil");
  });
});

// ── validateConversationResponse ─────────────────────────

describe("validateConversationResponse — clean / accept", () => {
  it("clean response → returned as-is", () => {
    const out = validateConversationResponse(
      "Yes, you added salt in step 4.",
      recipe,
    );
    expect(out).toBe("Yes, you added salt in step 4.");
  });

  it("trims leading/trailing whitespace", () => {
    expect(validateConversationResponse("  Yes, in step 4.  ", recipe)).toBe(
      "Yes, in step 4.",
    );
  });

  it("strips wrapping quotes the model sometimes adds", () => {
    expect(validateConversationResponse('"In step 4."', recipe)).toBe(
      "In step 4.",
    );
    expect(validateConversationResponse("'In step 4.'", recipe)).toBe(
      "In step 4.",
    );
  });

  it("response that mentions only on-list ingredients passes", () => {
    expect(
      validateConversationResponse(
        "Add the garlic and tomatoes in step 4.",
        recipe,
      ),
    ).not.toBeNull();
  });
});

describe("validateConversationResponse — reject / cap", () => {
  it("empty after trim → null (reject)", () => {
    expect(validateConversationResponse("   ", recipe)).toBeNull();
    expect(validateConversationResponse("", recipe)).toBeNull();
  });

  it("response mentioning off-list ingredient → null (reject)", () => {
    // saffron isn't in any recipe step
    expect(
      validateConversationResponse(
        "Sprinkle saffron at the end for color.",
        recipe,
      ),
    ).toBeNull();
  });

  it("response over MAX chars truncates at last sentence boundary", () => {
    const big = "First sentence is fine. " + "x".repeat(300);
    const out = validateConversationResponse(big, recipe);
    expect(out).not.toBeNull();
    expect(out!.length).toBeLessThanOrEqual(CONVERSATION_RESPONSE_MAX_CHARS);
    // Should include first sentence intact
    expect(out!).toContain("First sentence is fine.");
  });

  it("response over MAX with no sentence boundary → hard truncate", () => {
    const big = "x".repeat(300);
    const out = validateConversationResponse(big, recipe);
    expect(out).not.toBeNull();
    expect(out!.length).toBe(CONVERSATION_RESPONSE_MAX_CHARS);
  });

  it("doesn't false-positive on partial-word ingredient names", () => {
    // "olives" common ingredient — but recipe doesn't contain it.
    // "olive oil" might appear in a recipe; the validator should
    // only flag an EXACT word-boundary match.
    expect(
      validateConversationResponse("Add olives at the end.", recipe),
    ).toBeNull();
  });
});

// ── requestConversationAnswer ─────────────────────────────

describe("requestConversationAnswer — stub mode", () => {
  it("no API key → stub message + fromLlm=false", async () => {
    const out = await requestConversationAnswer("did I add salt", recipe, 2, {
      env: {},
    });
    expect(out.speakable).toBe(STUB_FALLBACK_MESSAGE);
    expect(out.fromLlm).toBe(false);
  });

  it("master switch 'false' → stub mode even with key", async () => {
    const out = await requestConversationAnswer("?", recipe, 0, {
      env: {
        ANTHROPIC_API_KEY: "sk-...",
        SOUS_VOICE_LLM_ENABLED: "false",
      },
    });
    expect(out.fromLlm).toBe(false);
  });
});

describe("requestConversationAnswer — real mode (mocked fetch)", () => {
  function mockFetchOk(text: string): typeof fetch {
    return vi.fn(
      async () =>
        new Response(JSON.stringify({ content: [{ type: "text", text }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    ) as unknown as typeof fetch;
  }

  it("happy path: clean LLM response → fromLlm=true", async () => {
    const out = await requestConversationAnswer("did I add salt", recipe, 2, {
      env: { ANTHROPIC_API_KEY: "sk-..." },
      fetchImpl: mockFetchOk("Yes, in step 4."),
    });
    expect(out.fromLlm).toBe(true);
    expect(out.speakable).toBe("Yes, in step 4.");
  });

  it("off-list response → falls back to stub", async () => {
    const out = await requestConversationAnswer("?", recipe, 0, {
      env: { ANTHROPIC_API_KEY: "sk-..." },
      fetchImpl: mockFetchOk("Add saffron now."),
    });
    expect(out.fromLlm).toBe(false);
    expect(out.speakable).toBe(STUB_FALLBACK_MESSAGE);
  });

  it("HTTP error → stub fallback", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("err", { status: 500 }),
    ) as unknown as typeof fetch;
    const out = await requestConversationAnswer("?", recipe, 0, {
      env: { ANTHROPIC_API_KEY: "sk-..." },
      fetchImpl,
    });
    expect(out.fromLlm).toBe(false);
  });

  it("network error → stub fallback (never throws)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("boom");
    }) as unknown as typeof fetch;
    const out = await requestConversationAnswer("?", recipe, 0, {
      env: { ANTHROPIC_API_KEY: "sk-..." },
      fetchImpl,
    });
    expect(out.fromLlm).toBe(false);
  });

  it("malformed response (no content array) → stub fallback", async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({}), { status: 200 }),
    ) as unknown as typeof fetch;
    const out = await requestConversationAnswer("?", recipe, 0, {
      env: { ANTHROPIC_API_KEY: "sk-..." },
      fetchImpl,
    });
    expect(out.fromLlm).toBe(false);
  });

  it("empty text response → stub fallback", async () => {
    const out = await requestConversationAnswer("?", recipe, 0, {
      env: { ANTHROPIC_API_KEY: "sk-..." },
      fetchImpl: mockFetchOk(""),
    });
    expect(out.fromLlm).toBe(false);
  });

  it("posts to the Anthropic messages endpoint with the API key", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ content: [{ type: "text", text: "ok" }] }),
          { status: 200 },
        ),
    ) as unknown as typeof fetch;
    await requestConversationAnswer("?", recipe, 0, {
      env: { ANTHROPIC_API_KEY: "sk-test-key" },
      fetchImpl,
    });
    expect(fetchImpl).toHaveBeenCalled();
    const call = (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock
      .calls[0];
    expect(call?.[0]).toBe("https://api.anthropic.com/v1/messages");
    const init = call?.[1] as RequestInit | undefined;
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.["x-api-key"]).toBe("sk-test-key");
  });
});
