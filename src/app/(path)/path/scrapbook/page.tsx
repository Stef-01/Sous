"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Camera } from "lucide-react";
import { ScrapbookEntryCard } from "@/components/path/scrapbook-entry-card";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { stableEvaluatorScores } from "@/lib/utils/scrapbook-evaluator";

/**
 * Scrapbook — memory lane + meal evaluator preview.
 * Dual use: sentimental archive and longitudinal plating / technique growth.
 */
export default function ScrapbookPage() {
  const { completedSessions, toggleFavorite } = useCookSessions();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard
  useEffect(() => setMounted(true), []);

  const handleReplay = useCallback(
    (slug: string) => {
      router.push(`/cook/${slug}`);
    },
    [router],
  );

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#fffdf8_0%,#faf7f2_45%,#f4efe8_100%)]">
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
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
              Crumbs · Polaroids
            </p>
            <h1 className="font-serif text-lg font-semibold leading-tight text-[var(--nourish-dark)]">
              Your teeny-tiny trophy case
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#e5dfd4] bg-white/80 p-4 shadow-sm ring-1 ring-white/60">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 shadow-inner ring-1 ring-amber-100">
              <Sparkles
                size={20}
                className="text-[var(--nourish-gold)]"
                strokeWidth={1.8}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                Wonder, then measure the wonder.
              </p>
              <p className="text-xs leading-relaxed text-[var(--nourish-subtext)]">
                Every finished plate lands here as a keepsake. The same wall
                will feed the upcoming{" "}
                <span className="font-semibold text-[var(--nourish-dark)]">
                  meal evaluator
                </span>{" "}
                — plating eye, technique line, and coach notes — so you can feel
                the arc from home-cook nights to confident dinner-party energy.
              </p>
              <p className="flex items-center gap-1 text-[10px] font-medium text-[var(--nourish-green)]">
                <Sparkles className="h-3 w-3" aria-hidden />
                Placeholder scores below are deterministic previews until rubric
                data ships on each cook.
              </p>
            </div>
          </div>
        </section>

        {!mounted ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-48 rounded-2xl bg-neutral-100/80" />
            <div className="h-48 rounded-2xl bg-neutral-100/80" />
          </div>
        ) : completedSessions.length > 0 ? (
          <div className="space-y-5">
            {completedSessions.map((session, idx) => (
              <ScrapbookEntryCard
                key={session.sessionId}
                session={session}
                onReplay={handleReplay}
                onToggleFavorite={toggleFavorite}
                index={idx}
                evaluatorScores={stableEvaluatorScores(
                  session.sessionId,
                  session.rating,
                )}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#d9d0c4] bg-white/70 px-6 py-14 text-center shadow-inner"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
              <Camera
                size={24}
                className="text-[var(--nourish-green)]"
                strokeWidth={1.8}
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                No polaroids yet — your first victory lap is one cook away.
              </p>
              <p className="text-xs leading-relaxed text-[var(--nourish-subtext)] max-w-[260px]">
                Finish a guided cook from Today. We will frame the plate, tuck
                in your note, and start the invisible graph of how your hands
                are leveling up.
              </p>
            </div>
            <motion.button
              onClick={() => router.push("/today")}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-semibold text-white cta-shadow transition-colors hover:bg-[var(--nourish-dark-green)]"
              type="button"
            >
              Cook something now →
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
