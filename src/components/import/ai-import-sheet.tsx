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
import { usePantry } from "@/lib/hooks/use-pantry";
import { usePantryInventory } from "@/lib/hooks/use-pantry-inventory";
import { diaryLogBranded } from "@/lib/hooks/use-nutrition-diary";
import { toast } from "@/lib/hooks/use-toast";
import { IMPORT_PROMPTS, IMPORT_PROMPT_ORDER } from "@/data/import-prompts";
import { parseImportText } from "@/lib/import/parse-import";
import { toFoodLogs, toInventoryDrafts } from "@/lib/import/apply-import";
import type { ImportKind } from "@/types/import-bridge";

/**
 * AiImportSheet — the paste-bridge surface. Pick a kind, copy the prompt into
 * the assistant you already have, paste the JSON back, preview, and import.
 * No LLM API is called here — Sous just parses + ingests the structured reply.
 */
export function AiImportSheet({
  open,
  onClose,
  initialKind = "pantry",
}: {
  open: boolean;
  onClose: () => void;
  initialKind?: ImportKind;
}) {
  const reducedMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);
  useFocusTrap(open, sheetRef);

  const pantry = usePantry();
  const inventory = usePantryInventory();

  const [kind, setKind] = useState<ImportKind>(initialKind);
  const [paste, setPaste] = useState("");
  const [copied, setCopied] = useState(false);

  // Reset the form each time the sheet opens.
  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional: clear the form on each open */
    setKind(initialKind);
    setPaste("");
    setCopied(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, initialKind]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const def = IMPORT_PROMPTS[kind];
  const parsed = useMemo(
    () => (paste.trim() ? parseImportText(paste) : null),
    [paste],
  );

  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(def.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.push({
        variant: "info",
        title: "Couldn't copy automatically",
        body: "Select the prompt text below and copy it.",
        dedupKey: "ai-import-copy-fail",
      });
    }
  }, [def.prompt]);

  const handleImport = useCallback(() => {
    if (!parsed?.success) return;
    const data = parsed.data;
    if (data.kind === "pantry" || data.kind === "groceries") {
      const { drafts, names } = toInventoryDrafts(data);
      inventory.addMany(drafts, new Date().toISOString());
      for (const name of names) pantry.add(name);
      toast.push({
        variant: "success",
        title: `Added ${drafts.length} ${drafts.length === 1 ? "item" : "items"} to your pantry`,
        body: drafts
          .slice(0, 3)
          .map((d) => d.name)
          .join(", "),
        emoji: "🧺",
        dedupKey: "ai-import-pantry",
      });
    } else {
      const { logs, date } = toFoodLogs(data, new Date());
      for (const log of logs) diaryLogBranded(log.food, log.servings, { date });
      toast.push({
        variant: "success",
        title: `Logged ${logs.length} ${logs.length === 1 ? "food" : "foods"}`,
        body: logs
          .slice(0, 3)
          .map((l) => l.food.name)
          .join(", "),
        emoji: "🍽️",
        dedupKey: "ai-import-food",
      });
    }
    onClose();
  }, [parsed, inventory, pantry, onClose]);

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
            aria-label="Import from AI"
            initial={reducedMotion ? false : { y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col rounded-t-3xl bg-[var(--nourish-cream)] shadow-2xl sm:m-4 sm:rounded-3xl"
          >
            <div className="px-5 pt-4">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--nourish-border-strong)] sm:hidden" />
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-[var(--nourish-dark)]">
                  <Sparkles size={16} className="text-[var(--nourish-green)]" />
                  Import from AI
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

              {/* Kind tabs */}
              <div
                role="tablist"
                aria-label="What to import"
                className="mt-3 flex gap-1 rounded-full border border-[var(--nourish-border-strong)] bg-white/70 p-1"
              >
                {IMPORT_PROMPT_ORDER.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={kind === k}
                    onClick={() => {
                      setKind(k);
                      setPaste("");
                    }}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                      kind === k
                        ? "bg-[var(--nourish-green)] text-white"
                        : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)]",
                    )}
                  >
                    {IMPORT_PROMPTS[k].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-4">
              <p className="text-[13px] leading-snug text-[var(--nourish-subtext)]">
                {def.blurb} Paste {def.inputHint} into the prompt, then bring
                the JSON back here.
              </p>

              {/* Step 1 — copy prompt */}
              <div className="rounded-[var(--radius-md)] border border-[var(--nourish-border-strong)] bg-white p-3">
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
                    className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-full border border-[var(--nourish-border-strong)] px-3 text-[13px] font-medium text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)]"
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
                    {def.prompt}
                  </pre>
                </details>
              </div>

              {/* Step 2 — paste */}
              <div className="rounded-[var(--radius-md)] border border-[var(--nourish-border-strong)] bg-white p-3">
                <p className="sous-label mb-2 flex items-center gap-1.5">
                  <ClipboardPaste size={12} />2 · Paste the JSON reply
                </p>
                <textarea
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  rows={4}
                  placeholder='{ "kind": "…", … }'
                  spellCheck={false}
                  className="w-full resize-y rounded-lg border border-[var(--nourish-border-strong)] bg-[var(--nourish-cream)] p-2.5 font-mono text-[12px] text-[var(--nourish-dark)] outline-none focus:border-[var(--nourish-green)]/50"
                />
                {parsed && !parsed.success && (
                  <p className="mt-2 text-[12px] leading-snug text-[var(--nourish-evaluate)]">
                    {parsed.error}
                  </p>
                )}
              </div>

              {/* Preview */}
              {parsed?.success && <ImportPreview data={parsed.data} />}
            </div>

            {/* Footer CTA */}
            <div className="border-t border-[var(--nourish-border)] bg-[var(--nourish-cream)] px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
              <button
                type="button"
                onClick={handleImport}
                disabled={!parsed?.success}
                className={cn(
                  "flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-all",
                  parsed?.success
                    ? "bg-[var(--nourish-green)] text-white shadow-[var(--shadow-cta)] active:scale-[0.99]"
                    : "cursor-not-allowed bg-[var(--nourish-border-strong)] text-[var(--nourish-subtext)]",
                )}
              >
                {parsed?.success
                  ? `Import ${parsed.itemCount} ${parsed.itemCount === 1 ? "item" : "items"}`
                  : "Paste a reply to import"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ImportPreview({
  data,
}: {
  data: import("@/types/import-bridge").ImportPayload;
}) {
  const isFood = data.kind === "nutrition";
  const rows = isFood ? data.entries : data.items;
  return (
    <div>
      <p className="sous-label mb-2">
        {isFood ? "Foods to log" : "Items to add"} · {rows.length}
      </p>
      <ul className="max-h-52 space-y-1 overflow-y-auto">
        {rows.map((row, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--nourish-border)] bg-white px-3 py-2"
          >
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--nourish-dark)]">
              {row.name}
            </span>
            {isFood ? (
              <span className="shrink-0 text-[12px] tabular-nums text-[var(--nourish-subtext)]">
                {Math.round((row as { calories: number }).calories)} kcal
                {(row as { protein_g?: number }).protein_g != null
                  ? ` · ${(row as { protein_g?: number }).protein_g}g P`
                  : ""}
              </span>
            ) : (
              <span className="shrink-0 text-[12px] text-[var(--nourish-subtext)]">
                {formatQty(row as { quantity?: number; unit?: string })}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatQty(row: { quantity?: number; unit?: string }): string {
  if (row.quantity == null) return row.unit ?? "";
  return `${row.quantity}${row.unit ? ` ${row.unit}` : ""}`;
}
