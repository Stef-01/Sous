"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  X,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ClipboardPaste,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBodyScrollLock, useFocusTrap } from "@/lib/hooks/use-overlay-a11y";
import { toast } from "@/lib/hooks/use-toast";
import { RECIPE_PASTE_PROMPT } from "@/lib/recipe-authoring/autogen-prompt";
import { parseRecipeAutogenJson } from "@/lib/recipe-authoring/autogen-parser";
import { commitDraft } from "@/lib/recipe-authoring/recipe-draft";
import { RECIPE_SOURCE_TAGS, type UserRecipe } from "@/types/user-recipe";

/**
 * RecipeAiImportSheet — the no-API paste-bridge for authoring a recipe fast +
 * accurately: copy the prompt into ChatGPT, describe the dish, paste the JSON
 * reply back, tag where it came from, import. Mirrors the nutrition
 * `AiImportSheet`; the parsed draft commits straight into the recipe store, so
 * it appears on /path/recipes AND the Today deck (via userRecipeToQuestDish)
 * and cooks through the same Mission→Grab→Cook→Win shell.
 */
export function RecipeAiImportSheet({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  /** Persist the committed recipe through the PARENT's recipe-drafts store
   *  instance — so the parent surface (the recipes list) updates reactively.
   *  (useRecipeDrafts is per-instance state, not a shared store.) */
  onImport: (recipe: UserRecipe) => void;
}) {
  const reducedMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);
  useFocusTrap(open, sheetRef);

  const [paste, setPaste] = useState("");
  const [copied, setCopied] = useState(false);
  const [sourceTags, setSourceTags] = useState<string[]>(["ChatGPT"]);

  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional: clear the form on each open */
    setPaste("");
    setCopied(false);
    setSourceTags(["ChatGPT"]);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const parsed = useMemo(
    () => (paste.trim() ? parseRecipeAutogenJson(paste) : null),
    [paste],
  );

  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(RECIPE_PASTE_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.push({
        variant: "info",
        title: "Couldn't copy automatically",
        body: "Select the prompt text below and copy it.",
        dedupKey: "recipe-import-copy-fail",
      });
    }
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSourceTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleImport = useCallback(() => {
    if (!parsed?.ok) return;
    const recipe = commitDraft({
      ...parsed.draft,
      sourceTags: sourceTags.length ? sourceTags : undefined,
    });
    onImport(recipe);
    toast.push({
      variant: "success",
      title: `Added "${recipe.title}" to your recipes`,
      body: `${recipe.ingredients.length} ingredients · ${recipe.steps.length} steps · tap to cook`,
      emoji: "📖",
      dedupKey: "recipe-import",
    });
    onClose();
  }, [parsed, sourceTags, onImport, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
          />
          <motion.div
            ref={sheetRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Import a recipe from AI"
            initial={reducedMotion ? false : { y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col rounded-t-3xl bg-[var(--nourish-cream)] shadow-[var(--shadow-raised)] sm:m-4 sm:rounded-3xl"
          >
            <div className="px-5 pt-4">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--nourish-border-strong)] sm:hidden" />
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-[var(--nourish-dark)]">
                  <Sparkles size={16} className="text-[var(--nourish-green)]" />
                  Import a recipe from AI
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-white/70"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-4">
              <p className="text-[13px] leading-snug text-[var(--nourish-subtext)]">
                Copy the prompt, tell ChatGPT your dish (a name, a pasted
                recipe, or a rough idea), then bring the JSON reply back here.
              </p>

              {/* Step 1 — copy prompt */}
              <div className="rounded-[var(--radius-md)] bg-white p-3 shadow-[var(--ring-hairline)]">
                <p className="sous-label mb-2">
                  1 · Copy the prompt into ChatGPT or Claude
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyPrompt}
                    className={cn(
                      "inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors",
                      copied
                        ? "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
                        : "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]",
                    )}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? "Copied" : "Copy prompt"}
                  </button>
                  <a
                    href="https://chatgpt.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-full px-3 text-[13px] font-medium text-[var(--nourish-subtext)] shadow-[var(--ring-hairline)] hover:text-[var(--nourish-green)]"
                  >
                    Open
                    <ExternalLink size={13} />
                  </a>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-[12px] text-[var(--nourish-subtext)]">
                    Preview prompt
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--nourish-cream)] p-2 text-[11px] leading-relaxed text-[var(--nourish-dark)]">
                    {RECIPE_PASTE_PROMPT}
                  </pre>
                </details>
              </div>

              {/* Step 2 — paste */}
              <div className="rounded-[var(--radius-md)] bg-white p-3 shadow-[var(--ring-hairline)]">
                <p className="sous-label mb-2 flex items-center gap-1.5">
                  <ClipboardPaste size={12} />2 · Paste the JSON reply
                </p>
                <textarea
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  rows={4}
                  placeholder='{ "title": "…", "ingredients": [ … ], "steps": [ … ] }'
                  spellCheck={false}
                  aria-label="Paste the recipe JSON"
                  className="w-full resize-y rounded-lg bg-[var(--nourish-cream)] p-2.5 font-mono text-[12px] text-[var(--nourish-dark)] shadow-[var(--ring-hairline)] outline-none focus:shadow-[0_0_0_2px_var(--nourish-green)]"
                />
                {parsed && !parsed.ok && (
                  <p className="mt-2 text-[12px] leading-snug text-[var(--nourish-evaluate)]">
                    {parsed.reason}
                  </p>
                )}
              </div>

              {/* Step 3 — source tags + preview (once parsed) */}
              {parsed?.ok && (
                <>
                  <div className="rounded-[var(--radius-md)] bg-white p-3 shadow-[var(--ring-hairline)]">
                    <p className="sous-label mb-2">3 · Where&apos;s it from?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {RECIPE_SOURCE_TAGS.map((tag) => {
                        const on = sourceTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggleTag(tag)}
                            className={cn(
                              "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                              on
                                ? "bg-[var(--nourish-green)] text-white"
                                : "bg-[var(--nourish-cream)] text-[var(--nourish-subtext)] shadow-[var(--ring-hairline)] hover:text-[var(--nourish-green)]",
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <RecipePreview draft={parsed.draft} />
                </>
              )}
            </div>

            {/* Footer CTA */}
            <div className="border-t border-[var(--nourish-border)] bg-[var(--nourish-cream)] px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
              <button
                type="button"
                onClick={handleImport}
                disabled={!parsed?.ok}
                className={cn(
                  "flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-all",
                  parsed?.ok
                    ? "bg-[var(--nourish-green)] text-white shadow-[var(--shadow-cta)] active:scale-[0.99]"
                    : "cursor-not-allowed bg-[var(--nourish-border-strong)] text-[var(--nourish-subtext)]",
                )}
              >
                {parsed?.ok
                  ? `Add "${truncate(parsed.draft.title, 22)}" to my recipes`
                  : "Paste a reply to import"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RecipePreview({
  draft,
}: {
  draft: import("@/lib/recipe-authoring/recipe-draft").RecipeDraft;
}) {
  return (
    <div>
      {/* Review the FULL parsed recipe before it lands in the cookable library —
          the accuracy gate (a mis-parsed "2 cans"→"2 cups" is visible here). */}
      <p className="sous-label mb-2">Review before adding</p>
      <div className="space-y-3 rounded-lg bg-white p-3 shadow-[var(--ring-hairline)]">
        <div>
          <p className="font-serif text-[15px] text-[var(--nourish-dark)]">
            {draft.title}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--nourish-subtext)]">
            {draft.cuisineFamily} ·{" "}
            {draft.prepTimeMinutes + draft.cookTimeMinutes} min · serves{" "}
            {draft.serves}
          </p>
        </div>

        <div>
          <p className="sous-label mb-1">
            Ingredients · {draft.ingredients.length}
          </p>
          <ul className="space-y-0.5 text-[12.5px] text-[var(--nourish-dark)]">
            {draft.ingredients.map((ing, i) => (
              <li key={i} className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate">
                  {ing.name}
                  {ing.isOptional && (
                    <span className="text-[var(--nourish-subtext-faint)]">
                      {" "}
                      · optional
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums text-[var(--nourish-subtext)]">
                  {ing.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="sous-label mb-1">Steps · {draft.steps.length}</p>
          <ol className="space-y-1.5 text-[12.5px] leading-snug text-[var(--nourish-subtext)]">
            {draft.steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 font-semibold text-[var(--nourish-green)]">
                  {i + 1}
                </span>
                <span>{s.instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
