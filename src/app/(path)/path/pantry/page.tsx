"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark, X } from "lucide-react";
import { usePantry } from "@/lib/hooks/use-pantry";

/**
 * Pantry  -  the quiet ledger. Ingredients you've marked as "I have this".
 *
 * Every cook's Grab screen auto-checks items in this set, so the more you
 * cook the less ticking off you do. Users can remove items here if their
 * fridge changes.
 */
export default function PantryPage() {
  const router = useRouter();
  const { items, mounted, remove, clear, size } = usePantry();

  return (
    <div className="min-h-full bg-[var(--nourish-cream)]">
      <header className="app-header px-4 py-3">
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
          {size > 0 && (
            <span className="ml-auto text-xs text-[var(--nourish-subtext)]">
              {size} item{size !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-2 pb-28">
        <p className="mb-4 text-[13px] leading-[1.55] text-[var(--nourish-subtext)]">
          Ingredients you&apos;ve stashed are auto-checked on the Grab screen
          next time a recipe needs them. The more you cook, the less ticking off
          you do.
        </p>

        {!mounted ? (
          <div className="space-y-2 animate-pulse">
            <div className="rounded-xl bg-neutral-100 h-12" />
            <div className="rounded-xl bg-neutral-100 h-12" />
            <div className="rounded-xl bg-neutral-100 h-12" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-5 py-8 text-center">
            <Bookmark
              size={24}
              className="mx-auto mb-2 text-[var(--nourish-subtext)]"
            />
            <p className="text-sm font-medium text-[var(--nourish-dark)]">
              Nothing stashed yet.
            </p>
            <p className="mt-1 text-xs text-[var(--nourish-subtext)]">
              Tap the bookmark next to any ingredient while you cook.
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {items.map((name) => (
                  <motion.li
                    key={name}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  >
                    <Bookmark
                      size={14}
                      className="shrink-0 text-[var(--nourish-green)]"
                      fill="currentColor"
                    />
                    <span className="flex-1 text-sm capitalize text-[var(--nourish-dark)]">
                      {name}
                    </span>
                    <button
                      onClick={() => remove(name)}
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
    </div>
  );
}
