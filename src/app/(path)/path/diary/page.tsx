"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Flame,
  Plus,
  X,
  UtensilsCrossed,
  Barcode,
  ChevronDown,
} from "lucide-react";
import { BrandedFoodSearch } from "@/components/path/branded-food-search";
import { cn } from "@/lib/utils/cn";
import {
  useNutritionDiary,
  useDiaryHistory,
} from "@/lib/hooks/use-nutrition-diary";
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";
import { haptic } from "@/lib/motion/haptics";
import { streakMilestone } from "@/lib/engagement/milestones";
import { toast } from "@/lib/hooks/use-toast";
import { StaggerList, StaggerItem } from "@/components/shared/stagger-list";

/**
 * Today's diary (W5) — a compact day view: a logging-streak header (W15), the
 * day's nutrition ring, the entry list (swipe-free remove), and a quick-add tray
 * of recent dishes (W8). One screen, no forms.
 */
export default function DiaryPage() {
  const router = useRouter();
  const { mounted, entries, dayNutrition, logCook, removeEntry, restoreEntry } =
    useNutritionDiary();
  const history = useDiaryHistory();
  const [showBranded, setShowBranded] = useState(false);

  // W14 — celebrate a streak milestone once (deduped in localStorage).
  useEffect(() => {
    if (!history.mounted) return;
    const m = streakMilestone(history.streak);
    if (!m) return;
    const seenKey = `sous-celebrated-${m.id}`;
    try {
      if (window.localStorage.getItem(seenKey)) return;
      window.localStorage.setItem(seenKey, "1");
    } catch {
      return;
    }
    toast.push({
      variant: "achievement",
      emoji: m.emoji,
      title: m.title,
      body: m.body,
    });
  }, [history.mounted, history.streak]);

  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)]">
      <header className="app-header page-x py-2.5">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="sous-label">Today</p>
            <h1 className="font-serif text-[19px] leading-tight text-[var(--nourish-dark)]">
              Your diary
            </h1>
          </div>
          {mounted && history.streak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-gold)]/15 px-2.5 py-1 text-[12px] font-semibold text-[var(--nourish-gold)]">
              <Flame size={13} />
              {history.streak}-day
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md page-x space-y-4 pb-28 pt-4">
        {/* Day ring */}
        {dayNutrition ? (
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
            <NutritionRingCard nutrition={dayNutrition} />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center">
            <UtensilsCrossed
              size={22}
              className="mx-auto text-[var(--nourish-subtext-faint)]"
            />
            <p className="mt-2 text-[13px] text-[var(--nourish-subtext)]">
              Nothing logged yet today. Tap a dish below — or “Log it” on any
              dish’s Info.
            </p>
          </div>
        )}

        {/* Entry list */}
        {entries.length > 0 && (
          <section>
            <p className="sous-label mb-1.5">Logged today</p>
            <StaggerList className="space-y-1.5">
              {entries.map((e) => (
                <StaggerItem
                  key={e.at}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200/70 bg-white px-3 py-2.5"
                >
                  <span className="flex-1 text-[13px] text-[var(--nourish-dark)]">
                    <span className="font-semibold">{e.name}</span>
                    {e.servings !== 1 && (
                      <span className="text-[var(--nourish-subtext)]">
                        {" "}
                        ×{e.servings}
                      </span>
                    )}
                    {e.brand && (
                      <span className="text-[var(--nourish-subtext-faint)]">
                        {" "}
                        · {e.brand}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      haptic("select");
                      removeEntry(e.at);
                      toast.push({
                        variant: "info",
                        title: `Removed ${e.name}`,
                        dedupKey: `rm-${e.at}`,
                        action: {
                          label: "Undo",
                          onClick: () => restoreEntry(e),
                        },
                      });
                    }}
                    aria-label={`Remove ${e.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-[var(--nourish-dark)]"
                  >
                    <X size={15} />
                  </button>
                </StaggerItem>
              ))}
            </StaggerList>
          </section>
        )}

        {/* Quick-add recents */}
        {mounted && history.recents.length > 0 && (
          <section>
            <p className="sous-label mb-1.5">Quick add</p>
            <StaggerList className="flex flex-wrap gap-2">
              {history.recents.map((r) => (
                <StaggerItem key={r.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      haptic("commit");
                      logCook(r.slug, r.name, 1);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 hover:bg-[var(--nourish-green)]/5"
                  >
                    <Plus size={12} className="text-[var(--nourish-green)]" />
                    {r.name}
                  </button>
                </StaggerItem>
              ))}
            </StaggerList>
          </section>
        )}

        {/* W21 — log a packaged/branded food (barcode scan is founder-gated). */}
        <section>
          <button
            type="button"
            onClick={() => setShowBranded((s) => !s)}
            aria-expanded={showBranded}
            className="flex w-full items-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 text-left"
          >
            <Barcode size={15} className="text-[var(--nourish-subtext)]" />
            <span className="flex-1 text-[13px] font-medium text-[var(--nourish-dark)]">
              Add a packaged food
            </span>
            <ChevronDown
              size={16}
              className={cn(
                "text-[var(--nourish-subtext)] transition-transform",
                showBranded && "rotate-180",
              )}
            />
          </button>
          {showBranded && (
            <div className="mt-2">
              <BrandedFoodSearch />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
