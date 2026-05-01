"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ShoppingCart, X } from "lucide-react";
import { useShoppingList } from "@/lib/hooks/use-shopping-list";
import { usePantry } from "@/lib/hooks/use-pantry";
import { InstacartHint } from "@/components/guided-cook/instacart-hint";
import { cn } from "@/lib/utils/cn";
import { toast } from "@/lib/hooks/use-toast";

/**
 * Shopping list  -  the inverse of the pantry. Things you wanted to cook with
 * but didn't have. Tap to toggle "bought"; a bought item can be sent
 * straight into your pantry with one tap.
 */
export default function ShoppingListPage() {
  const router = useRouter();
  const {
    items,
    mounted,
    unboughtCount,
    toggleBought,
    remove,
    clear,
    clearBought,
  } = useShoppingList();
  const { add: addToPantry } = usePantry();

  const boughtItems = useMemo(() => items.filter((i) => i.bought), [items]);
  const unboughtItems = useMemo(() => items.filter((i) => !i.bought), [items]);

  const handleMoveBoughtToPantry = () => {
    if (boughtItems.length === 0) return;
    for (const item of boughtItems) addToPantry(item.name);
    clearBought();
    toast.push({
      variant: "success",
      title: `Stashed ${boughtItems.length} in pantry`,
      dedupKey: "shopping-to-pantry",
    });
  };

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
            Shopping list
          </h1>
          {unboughtCount > 0 && (
            <span className="ml-auto text-xs text-[var(--nourish-subtext)]">
              {unboughtCount} to buy
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-2 pb-28">
        <p className="mb-1 text-[13px] leading-[1.55] text-[var(--nourish-subtext)]">
          Missing ingredients from your recent cooks show up here. Tap to mark
          bought - then one tap sends them into your pantry.
        </p>
        {/* Instacart placeholder hint — same minimal pattern as the
            in-cook IngredientList. Encourages "keep going" instead of
            "give up" by surfacing how fast the missing items can land. */}
        <div className="mb-4">
          <InstacartHint missingCount={unboughtCount} />
        </div>

        {!mounted ? (
          <div className="space-y-2 animate-pulse">
            <div className="rounded-xl bg-neutral-100 h-12" />
            <div className="rounded-xl bg-neutral-100 h-12" />
            <div className="rounded-xl bg-neutral-100 h-12" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-5 py-8 text-center">
            <ShoppingCart
              size={24}
              className="mx-auto mb-2 text-[var(--nourish-subtext)]"
            />
            <p className="text-sm font-medium text-[var(--nourish-dark)]">
              List is empty.
            </p>
            <p className="mt-1 text-xs text-[var(--nourish-subtext)]">
              Tap &ldquo;Add to shopping list&rdquo; on the Grab screen while
              you cook.
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {unboughtItems.map((item) => (
                  <ShoppingRow
                    key={item.key}
                    name={item.name}
                    bought={item.bought}
                    onToggle={() => toggleBought(item.key)}
                    onRemove={() => remove(item.key)}
                  />
                ))}
              </AnimatePresence>
            </ul>

            {boughtItems.length > 0 && (
              <>
                <h2 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--nourish-subtext)]">
                  Bought ({boughtItems.length})
                </h2>
                <ul className="space-y-1.5">
                  <AnimatePresence initial={false}>
                    {boughtItems.map((item) => (
                      <ShoppingRow
                        key={item.key}
                        name={item.name}
                        bought={item.bought}
                        onToggle={() => toggleBought(item.key)}
                        onRemove={() => remove(item.key)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </>
            )}

            <div className="mt-6 space-y-2">
              {boughtItems.length > 0 && (
                <button
                  onClick={handleMoveBoughtToPantry}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 py-3 text-sm font-medium text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/10"
                  type="button"
                >
                  <Check size={14} />
                  Move bought ({boughtItems.length}) into pantry
                </button>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.confirm("Clear the whole list?")
                    ) {
                      clear();
                    }
                  }}
                  className="text-xs font-medium text-[var(--nourish-subtext)] underline decoration-dotted underline-offset-4 hover:text-[var(--nourish-dark)]"
                  type="button"
                >
                  Clear list
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function ShoppingRow({
  name,
  bought,
  onToggle,
  onRemove,
}: {
  name: string;
  bought: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
    >
      <button
        onClick={onToggle}
        className="flex h-11 w-11 shrink-0 -m-1.5 items-center justify-center active:scale-90 transition-transform"
        type="button"
        aria-label={bought ? `Mark ${name} unbought` : `Mark ${name} bought`}
      >
        {bought ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--nourish-green)]">
            <Check size={12} className="text-white" strokeWidth={3} />
          </span>
        ) : (
          <span className="h-5 w-5 rounded-full border-2 border-neutral-300" />
        )}
      </button>
      <span
        className={cn(
          "flex-1 text-sm capitalize",
          bought
            ? "text-[var(--nourish-subtext)] line-through"
            : "text-[var(--nourish-dark)]",
        )}
      >
        {name}
      </span>
      <button
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-[var(--nourish-dark)]"
        type="button"
        aria-label={`Remove ${name}`}
      >
        <X size={14} />
      </button>
    </motion.li>
  );
}
