"use client";

/**
 * /path/recipes/quick-add — agentic recipe autogen.
 *
 * W50 from `docs/RECIPE-ECOSYSTEM-V2.md`. The user types a
 * free-text recipe description; the LLM (or the V1 stub when
 * no ANTHROPIC_API_KEY is configured) returns a structured
 * first-draft. We then redirect to /path/recipes/new with the
 * draft pre-populated for editing.
 *
 * Cross-page state lives in sessionStorage (single key, single
 * recipe) so the recipient page can pick it up without prop-
 * threading. This is throwaway state — cleared on read.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { adaptAutogenToDraft } from "@/lib/recipe-authoring/autogen-parser";
import { toast } from "@/lib/hooks/use-toast";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils/cn";

const SAMPLE = `\
Chana masala. Bloom cumin and coriander seeds in oil for 30 \
seconds. Sauté one large yellow onion until deep golden — about \
8 minutes. Stir in 1 tbsp ginger-garlic paste. Add 2 cups \
chopped tomatoes and a pinch of salt; simmer 10 minutes until \
jammy. Add 2 cans of chickpeas with a splash of water; simmer \
15 minutes. Finish with garam masala, lime, and cilantro.`;

/** Throwaway sessionStorage key the /path/recipes/new page reads
 *  on mount. Single-recipe scope; cleared on read. */
export const QUICK_ADD_DRAFT_KEY = "sous-quick-add-draft";

export default function QuickAddPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [description, setDescription] = useState("");

  const draftMutation = trpc.recipeAutogen.draft.useMutation({
    onSuccess: (result) => {
      if (!result.ok) {
        toast.push({
          variant: "info",
          title: "Couldn't generate the draft",
          body: result.error,
          dedupKey: "autogen-failed",
        });
        return;
      }
      const draft = adaptAutogenToDraft(result.response);
      try {
        sessionStorage.setItem(QUICK_ADD_DRAFT_KEY, JSON.stringify(draft));
      } catch {
        toast.push({
          variant: "info",
          title: "Couldn't stash the draft",
          body: "Try opening the recipe form directly.",
          dedupKey: "autogen-stash-failed",
        });
        return;
      }
      toast.push({
        variant: "success",
        title:
          result.mode === "stub"
            ? "Draft generated (stub mode)"
            : "Draft generated",
        body: "Edit it before saving.",
        dedupKey: "autogen-success",
      });
      router.push("/path/recipes/new?from=quick-add");
    },
    onError: (err) => {
      toast.push({
        variant: "info",
        title: "Couldn't reach the autogen service",
        body: err.message,
        dedupKey: "autogen-network-fail",
      });
    },
  });

  const canSubmit = description.trim().length > 0 && !draftMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    draftMutation.mutate({ description: description.trim() });
  };

  return (
    <motion.div
      className="min-h-full bg-[var(--nourish-cream)] pb-24"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href="/path/recipes"
            aria-label="Back to My recipes"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Quick add
          </h1>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md space-y-6 px-4 pt-4"
      >
        <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
          <SectionKicker as="p" size="10px">
            Describe the recipe
          </SectionKicker>
          <p className="text-xs text-[var(--nourish-subtext)]">
            Plain text. The autogen drafts it into structured form; you edit
            before saving.
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={SAMPLE}
            rows={10}
            maxLength={4000}
            className={cn(
              "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[14px] text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)]/60",
              "focus:border-[var(--nourish-green)] focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/20",
              "resize-none",
            )}
          />
          <p className="text-[10px] text-[var(--nourish-subtext)]/70">
            {description.length}/4000
          </p>
        </section>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          <Sparkles size={14} aria-hidden />
          {draftMutation.isPending ? "Drafting…" : "Generate first draft"}
        </button>

        <p className="px-1 text-center text-[11px] text-[var(--nourish-subtext)]/80">
          Stays a draft until you save in the form. The autogen never publishes
          on your behalf.
        </p>
      </form>
    </motion.div>
  );
}
