/**
 * Agentic Pod recipe picker (Y2 Sprint I W35).
 *
 * Picks the next pod-challenge recipe given the pod's metadata,
 * last 4 weeks of cooked cuisines (avoid repeats), the
 * dietary-flag union across active members, and the optional
 * voted twist for the upcoming week.
 *
 * Two modes (stub-mode-V1 pattern, same shape as Y2 W7 V3,
 * W20 push, W28 conversation):
 *   - **Stub mode** (no Anthropic key): deterministic rotation
 *     through the Nourish-verified pool. Output is reproducible
 *     given (week, candidate-list, dietary union) — same
 *     three inputs always yield the same recipe, which makes
 *     unit tests + per-pod replay analytics trivial.
 *   - **Real mode** (ANTHROPIC_API_KEY set): structured-output
 *     LLM call. The pure prompt-builder + response-validator
 *     live here; the dispatcher wires the fetch.
 *
 * The picker NEVER returns a recipe whose dietaryFlags don't
 * cover the dietary union — that's a hard filter, not a soft
 * preference. Repeat-avoidance over the last 4 weeks is also
 * hard (the pool is large enough that 4-week diversity is
 * always achievable).
 *
 * Pure / dependency-free except for the optional fetch in real
 * mode (mockable via the options.fetchImpl override).
 */

/** Minimal recipe shape the picker reads. Real-mode response
 *  must include slug + cuisineFamily + dietaryFlags so the
 *  validator can verify the LLM stayed within the candidate
 *  pool. */
export interface PickerCandidate {
  slug: string;
  cuisineFamily: string;
  /** Dietary flags this dish IS compatible with (vegan,
   *  vegetarian, gluten-free, dairy-free, nut-allergy,
   *  shellfish-allergy). Same semantics as
   *  SideDishCandidate.dietaryFlags. */
  dietaryFlags: ReadonlyArray<string>;
}

export interface AgenticPickerInput {
  /** All Nourish-verified candidate recipes. The picker filters
   *  this pool by dietary union + recent-cuisine avoidance,
   *  then picks one. */
  candidates: ReadonlyArray<PickerCandidate>;
  /** Cuisines cooked by the pod in the last 4 weeks. Picker
   *  avoids these when possible (hard avoid when the eligible
   *  pool size > 1). */
  recentCuisines: ReadonlyArray<string>;
  /** Dietary union across active pod members. The picked
   *  recipe MUST be a superset of this set. Empty union = no
   *  dietary constraint. */
  dietaryUnion: ReadonlyArray<string>;
  /** Optional voted twist for the upcoming week — a free-text
   *  hint like "spicier than usual" / "vegetarian only" / "use
   *  one new spice". Stub mode ignores this; real mode passes
   *  it to the LLM as a soft constraint. */
  votedTwist?: string;
  /** ISO week-of-year for deterministic stub-mode seeding. */
  isoWeek: number;
}

export interface PodPickerEnv {
  ANTHROPIC_API_KEY?: string | undefined;
  SOUS_POD_AGENTIC_ENABLED?: string | undefined;
}

export type AgenticPickerResult =
  | { ok: true; slug: string; mode: "stub" | "llm"; reason: string }
  | { ok: false; reason: string };

/** Pure: is the LLM agentic-picker enabled in this env? */
export function isPodAgenticEnabled(env: PodPickerEnv): boolean {
  if (env.SOUS_POD_AGENTIC_ENABLED === "false") return false;
  if (!env.ANTHROPIC_API_KEY) return false;
  if (env.ANTHROPIC_API_KEY.length === 0) return false;
  return true;
}

/** Pure: filter candidates by dietary-union compatibility +
 *  recent-cuisine avoidance. Exposed for tests + the real-mode
 *  validator. */
export function filterEligibleCandidates(
  input: AgenticPickerInput,
): PickerCandidate[] {
  const dietRequired = new Set(input.dietaryUnion.map((d) => d.toLowerCase()));
  const recent = new Set(input.recentCuisines.map((c) => c.toLowerCase()));

  // Hard filter: dietaryFlags must be a superset of dietRequired.
  const dietOk = input.candidates.filter((c) => {
    const flags = new Set(c.dietaryFlags.map((f) => f.toLowerCase()));
    for (const r of dietRequired) {
      if (!flags.has(r)) return false;
    }
    return true;
  });

  if (dietOk.length === 0) return [];

  // Soft filter: drop recent cuisines if doing so leaves at
  // least one candidate. If recent-avoidance leaves nothing, we
  // fall back to the full diet-OK pool — better to repeat a
  // cuisine than to fail to pick.
  const cuisineDiverse = dietOk.filter(
    (c) => !recent.has(c.cuisineFamily.toLowerCase()),
  );
  return cuisineDiverse.length > 0 ? cuisineDiverse : dietOk;
}

/** Pure: stub-mode pick. Deterministic rotation through the
 *  eligible pool, seeded by isoWeek. Same (eligibles, isoWeek)
 *  always picks the same slug. */
export function pickStubAgentic(
  input: AgenticPickerInput,
): AgenticPickerResult {
  const eligible = filterEligibleCandidates(input);
  if (eligible.length === 0) {
    return {
      ok: false,
      reason: "no candidates pass dietary union + recent-cuisine filters",
    };
  }
  // Stable order so the modulo pick is reproducible — sort by
  // slug, then index by isoWeek mod len.
  const sorted = [...eligible].sort((a, b) => a.slug.localeCompare(b.slug));
  const safeWeek = Number.isFinite(input.isoWeek)
    ? Math.max(0, Math.floor(input.isoWeek))
    : 0;
  const idx = safeWeek % sorted.length;
  const pick = sorted[idx];
  if (!pick) {
    return {
      ok: false,
      reason: "indexing into the sorted pool returned nothing",
    };
  }
  return {
    ok: true,
    slug: pick.slug,
    mode: "stub",
    reason: `stub rotation (week ${safeWeek} mod ${sorted.length}) → ${pick.slug}`,
  };
}

/** Pure: build the structured-output prompt for the real-mode
 *  LLM call. The prompt enforces "pick exactly one slug from
 *  the provided list; reply with JSON {slug: ...}". */
export function buildAgenticPrompt(input: AgenticPickerInput): {
  system: string;
  user: string;
} {
  const eligible = filterEligibleCandidates(input);
  const slugList = eligible
    .map((c) => `- ${c.slug} (${c.cuisineFamily})`)
    .join("\n");
  const twistLine = input.votedTwist
    ? `Voted twist for the week: ${input.votedTwist.trim()}`
    : "(no voted twist)";

  const system = [
    "You are picking one recipe slug for a cooking pod's weekly challenge.",
    'Reply with ONLY this JSON shape: {"slug": "<chosen-slug>"}.',
    "Pick EXACTLY one slug from the provided eligible list.",
    "Do not invent slugs. Do not reply with anything else.",
  ].join(" ");

  const user = [
    "Eligible recipes (already filtered for dietary union + recent-cuisine avoidance):",
    slugList,
    "",
    twistLine,
    "",
    "Recent cuisines cooked (avoid if possible): " +
      (input.recentCuisines.join(", ") || "(none)"),
  ].join("\n");

  return { system, user };
}

/** Pure: validate a real-mode response. Parses the JSON,
 *  checks the slug is in the eligible pool. Returns the slug
 *  on success, null on rejection. */
export function validateAgenticResponse(
  raw: string,
  input: AgenticPickerInput,
): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  // Some models wrap JSON in code fences. Strip them.
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as { slug?: unknown };
  if (typeof obj.slug !== "string" || obj.slug.length === 0) return null;

  const eligible = filterEligibleCandidates(input);
  const eligibleSet = new Set(eligible.map((c) => c.slug));
  if (!eligibleSet.has(obj.slug)) return null;

  return obj.slug;
}

export interface AgenticPickerOptions {
  env?: PodPickerEnv;
  fetchImpl?: typeof fetch;
}

/** Async dispatcher. Returns AgenticPickerResult, never throws.
 *  Falls back to stub on any error / rejection. */
export async function pickAgenticChallenge(
  input: AgenticPickerInput,
  options: AgenticPickerOptions = {},
): Promise<AgenticPickerResult> {
  const env =
    options.env ??
    (typeof process !== "undefined" && process.env != null
      ? {
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          SOUS_POD_AGENTIC_ENABLED: process.env.SOUS_POD_AGENTIC_ENABLED,
        }
      : {});

  if (!isPodAgenticEnabled(env)) {
    return pickStubAgentic(input);
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const prompt = buildAgenticPrompt(input);

  try {
    const res = await fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 100,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
      }),
    });
    if (!res.ok) return pickStubAgentic(input);
    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const rawText = (data.content ?? [])
      .filter((c) => c.type === "text" && typeof c.text === "string")
      .map((c) => c.text ?? "")
      .join("");
    const validated = validateAgenticResponse(rawText, input);
    if (validated === null) return pickStubAgentic(input);
    return {
      ok: true,
      slug: validated,
      mode: "llm",
      reason: "agentic LLM pick passed validation",
    };
  } catch {
    return pickStubAgentic(input);
  }
}
