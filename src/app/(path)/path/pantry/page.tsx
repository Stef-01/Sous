"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Bookmark, Sparkles, X } from "lucide-react";
import { usePantry } from "@/lib/hooks/use-pantry";
import { usePantryInventory } from "@/lib/hooks/use-pantry-inventory";
import { AiImportSheet } from "@/components/import/ai-import-sheet";
import { EmptyStateCTA } from "@/components/shared/empty-state-cta";
import { MetaPill } from "@/components/shared/meta-pill";
import { GLIDE, RM } from "@/lib/utils/motion";

/**
 * Pantry  -  the quiet ledger. Ingredients you've marked as "I have this".
 *
 * Every cook's Grab screen auto-checks items in this set, so the more you
 * cook the less ticking off you do. Users can remove items here if their
 * fridge changes.
 */
export default function PantryPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { items, mounted, remove, clear, size } = usePantry();
  const inventory = usePantryInventory();
  const [showImport, setShowImport] = useState(false);

  // Quantity lookup — pantry names are normalized, matching the inventory key.
  const invByKey = useMemo(
    () => new Map(inventory.items.map((it) => [it.key, it])),
    [inventory.items],
  );

  return (
    <div className="min-h-full bg-[var(--nourish-cream)]">
      <header className="app-header page-x py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <motion.button
            onClick={() => router.push("/path")}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
            type="button"
            aria-label="Back to Path"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Pantry
          </h1>
          <button
            onClick={() => setShowImport(true)}
            type="button"
            className="ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/[0.06] px-3 text-[12px] font-semibold text-[var(--nourish-green)] transition-colors hover:bg-[var(--nourish-green)]/12"
          >
            <Sparkles size={13} aria-hidden />
            Import
          </button>
          {size > 0 && (
            <span className="text-xs text-[var(--nourish-subtext)]">
              {size} item{size !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md page-x pt-2 pb-28">
        {!mounted ? (
          <div className="space-y-2 animate-pulse">
            <div className="rounded-xl bg-neutral-100 h-12" />
            <div className="rounded-xl bg-neutral-100 h-12" />
            <div className="rounded-xl bg-neutral-100 h-12" />
          </div>
        ) : items.length === 0 ? (
          <EmptyStateCTA
            icon={Bookmark}
            iconSize={24}
            primary="Nothing stashed yet."
            helper="Bookmark ingredients while you cook."
            cta={{ label: "Find something to cook" }}
            href="/today"
          />
        ) : (
          <>
            <MetaPill variant="green" className="mb-3">
              <Sparkles size={11} aria-hidden />
              <span>Auto-applied to your next cook&rsquo;s Grab screen.</span>
            </MetaPill>

            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {items.map((name) => (
                  <motion.li
                    key={name}
                    layout={!reducedMotion}
                    initial={
                      reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      reducedMotion ? { opacity: 0 } : { opacity: 0, x: 40 }
                    }
                    transition={reducedMotion ? RM : GLIDE}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  >
                    <Bookmark
                      size={14}
                      className="shrink-0 text-[var(--nourish-green)]"
                      fill="currentColor"
                    />
                    <span className="flex-1 truncate text-sm capitalize text-[var(--nourish-dark)]">
                      {invByKey.get(name)?.name ?? name}
                    </span>
                    {(() => {
                      const inv = invByKey.get(name);
                      if (!inv?.quantity && !inv?.unit) return null;
                      return (
                        <span className="shrink-0 rounded-full bg-[var(--nourish-green)]/[0.08] px-2 py-0.5 text-[11px] font-medium tabular-nums text-[var(--nourish-green)]">
                          {inv.quantity ?? ""}
                          {inv.unit ? ` ${inv.unit}` : ""}
                        </span>
                      );
                    })()}
                    <button
                      onClick={() => {
                        remove(name);
                        inventory.remove(name);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-[var(--nourish-dark)]"
                      type="button"
                      aria-label={`Remove ${name} from pantry`}
                    >
                      <X size={14} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {items.length > 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.confirm("Clear your whole pantry?")
                    ) {
                      clear();
                      inventory.clear();
                    }
                  }}
                  className="text-xs font-medium text-[var(--nourish-subtext)] underline decoration-dotted underline-offset-4 hover:text-[var(--nourish-dark)]"
                  type="button"
                >
                  Clear pantry
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <AiImportSheet
        open={showImport}
        onClose={() => setShowImport(false)}
        initialKind="pantry"
      />
    </div>
  );
}
