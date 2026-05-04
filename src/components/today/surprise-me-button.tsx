"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shuffle } from "lucide-react";
import { sides, meals } from "@/data";
import { getAvailableCookSlugs } from "@/data/guided-cook-steps";
import type { CookStats } from "@/lib/hooks/use-cook-sessions";

interface SurpriseMeButtonProps {
  cookHistory?: CookStats;
}

/**
 * "Surprise me" — picks a random dish from cuisines the user hasn't explored.
 * If the user has explored all cuisines, picks from least-cooked ones.
 * Only picks dishes with guided cook data. Navigates through the standard
 * Mission → Grab → Cook → Win flow (quest shell consistency).
 */
export function SurpriseMeButton({ cookHistory }: SurpriseMeButtonProps) {
  const router = useRouter();
  const guidedSlugs = useMemo(() => new Set(getAvailableCookSlugs()), []);

  // All dishes with guided cook data
  const candidates = useMemo(() => {
    const allDishes: { slug: string; cuisine: string; isMeal: boolean }[] = [];

    for (const meal of meals) {
      if (guidedSlugs.has(meal.id)) {
        allDishes.push({
          slug: meal.id,
          cuisine: meal.cuisine.toLowerCase(),
          isMeal: true,
        });
      }
    }

    for (const side of sides) {
      if (guidedSlugs.has(side.id)) {
        const cuisine = (
          side.tags.find((t) =>
            [
              "italian",
              "indian",
              "japanese",
              "korean",
              "thai",
              "chinese",
              "mexican",
              "mediterranean",
              "vietnamese",
              "filipino",
            ].includes(t.toLowerCase()),
          ) ?? "classic"
        ).toLowerCase();
        allDishes.push({ slug: side.id, cuisine, isMeal: false });
      }
    }

    return allDishes;
  }, [guidedSlugs]);

  const handleSurprise = useCallback(() => {
    if (candidates.length === 0) return;

    const covered = new Set(
      (cookHistory?.cuisinesCovered ?? []).map((c) => c.toLowerCase()),
    );

    // Prefer unexplored cuisines
    let pool = candidates.filter((d) => !covered.has(d.cuisine));
    // Fall back to all candidates if user has explored everything
    if (pool.length === 0) pool = candidates;

    // Pick a random one
    const pick = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/cook/${pick.slug}`);
  }, [candidates, cookHistory, router]);

  if (candidates.length === 0) return null;

  return (
    <motion.button
      type="button"
      onClick={handleSurprise}
      whileTap={{ scale: 0.95, rotate: 15 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)]/40 hover:text-[var(--nourish-green)] transition-colors shadow-sm"
      aria-label="Surprise me with a random dish"
    >
      <Shuffle size={14} strokeWidth={2} />
      Surprise me
    </motion.button>
  );
}
