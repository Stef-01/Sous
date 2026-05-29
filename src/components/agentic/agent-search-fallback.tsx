"use client";

/**
 * AgentSearchFallback — empty-state CTA for /today/search that
 * sends the user's craving to the recipe autogen agent and
 * surfaces the result as an Unverified card (Y5 E, audit P0).
 *
 * Stub mode (no `ANTHROPIC_API_KEY`): the autogen-provider returns
 * a deterministic STUB_AUTOGEN_RESPONSE so the UI is exercised
 * end-to-end on every demo. Real-mode flips automatically when
 * the founder ships the key.
 *
 * Behaviour:
 *   - No mutation runs until the user taps "Send agent". This is
 *     deliberate — the agent CTA is a power affordance the user
 *     opts into, never automatic.
 *   - On success, render <UnverifiedRecipeCard /> with a "Open as
 *     draft" button that stashes the response under
 *     QUICK_ADD_DRAFT_KEY and routes to the existing
 *     /path/recipes/new flow.
 *   - On failure, surface an inline retry message — never a hard
 *     error wall.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { adaptAutogenToDraft } from "@/lib/recipe-authoring/autogen-parser";
import { QUICK_ADD_DRAFT_KEY } from "@/app/(path)/path/recipes/quick-add/page";
import { UnverifiedRecipeCard } from "./unverified-recipe-card";

interface AgentSearchFallbackProps {
  /** The user's craving — feeds the autogen prompt as
   *  description. The component is responsible for guarding
   *  empty values. */
  query: string;
}

export function AgentSearchFallback({ query }: AgentSearchFallbackProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = trpc.recipeAutogen.draft.useMutation({
    onSuccess: (result) => {
      if (!result.ok) {
        setErrorMessage(result.error);
      } else {
        setErrorMessage(null);
      }
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  const handleSendAgent = () => {
    const description = query.trim();
    if (description.length === 0) return;
    setErrorMessage(null);
    mutation.mutate({ description });
  };

  const handleOpenDraft = () => {
    if (!mutation.data || !mutation.data.ok) return;
    const draft = adaptAutogenToDraft(mutation.data.response);
    try {
      sessionStorage.setItem(QUICK_ADD_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      setErrorMessage("Couldn't stash the draft. Try again.");
      return;
    }
    router.push("/path/recipes/new?from=quick-add");
  };

  // Render the card if we have a successful response in flight or
  // settled. The button below the card stays the primary handoff.
  if (mutation.data && mutation.data.ok) {
    return (
      <UnverifiedRecipeCard
        recipe={mutation.data.response}
        onOpen={handleOpenDraft}
      />
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-dashed border-[var(--nourish-border-strong)] bg-white/40 px-4 py-5">
      <p className="text-[12px] leading-snug text-[var(--nourish-subtext)]">
        Nothing in the catalog yet. Want me to generate a starter draft for{" "}
        <span className="font-semibold text-[var(--nourish-dark)]">
          {query.trim() || "this craving"}
        </span>
        ?
      </p>
      <button
        type="button"
        onClick={handleSendAgent}
        disabled={mutation.isPending || query.trim().length === 0}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--nourish-green)] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--nourish-dark-green)] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
      >
        <Sparkles size={14} aria-hidden />
        {mutation.isPending ? "Sending agent…" : "Send agent"}
      </button>
      {errorMessage && (
        <p className="text-[11px] text-[var(--nourish-warm)]">
          {errorMessage} · Tap Send agent to retry.
        </p>
      )}
      <p className="text-[10px] text-[var(--nourish-subtext)]/70">
        Drafts are unverified — review before you cook.
      </p>
    </div>
  );
}
