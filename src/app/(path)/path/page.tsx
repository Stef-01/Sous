"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";
import {
  Bookmark,
  ChefHat,
  ChevronDown,
  Heart,
  Leaf,
  NotebookText,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { PathHeader } from "@/components/path/path-header";
import { HydrationCard } from "@/components/path/hydration-card";
import { WeeklyTrendCard } from "@/components/path/weekly-trend-card";
import { BrandedFoodSearch } from "@/components/path/branded-food-search";
import { JourneySummary } from "@/components/path/journey-summary";
import { WeeklyGoalCard } from "@/components/path/weekly-goal-card";
import { SkillTree } from "@/components/path/skill-tree";
import { UpNextBanner, pickUpNextNode } from "@/components/path/up-next-banner";
import { SkillDetailSheet } from "@/components/path/skill-detail-sheet";
import { useSkillProgress } from "@/lib/hooks/use-skill-progress";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useAchievements } from "@/lib/hooks/use-achievements";
import { useXPSystem } from "@/lib/hooks/use-xp-system";
import { toast } from "@/lib/hooks/use-toast";
import {
  AchievementsLauncher,
  type AchievementsLauncherHandle,
} from "@/components/path/achievements-launcher";
import { PathTutorial } from "@/components/path/path-tutorial";
import { usePathTutorial } from "@/lib/hooks/use-path-tutorial";
import { useSkillDetailSheet } from "@/lib/hooks/use-skill-detail-sheet";
import { SectionKicker } from "@/components/shared/section-kicker";

/**
 * Path home  -  Duolingo-style skill tree for cooking progression.
 *
 * Three tiers: Foundation → Intermediate → Cuisine Specializations.
 * Nodes unlock as prerequisites are completed. Tapping a node opens
 * a detail sheet with associated practice dishes.
 */
export default function PathPage() {
  // W7 follow-up: reduced-motion gate available across this file's
  // motion sites. Consumed by the page-shell entrance below.
  const reducedMotion = useReducedMotion();
  const {
    mounted,
    nodesWithStatus,
    getNodeStatus,
    getNodeProgress,
    totalXP,
    level,
    skillsCompleted,
  } = useSkillProgress();

  const { stats, completedSessions } = useCookSessions();
  const {
    unlockedAchievements,
    lockedAchievements,
    checkAchievements,
    newlyUnlocked,
    dismissNewUnlocks,
  } = useAchievements();

  useEffect(() => {
    if (newlyUnlocked.length === 0) return;
    toast.pushMany(
      newlyUnlocked.map((a) => ({
        variant: "achievement" as const,
        title: a.name,
        body: a.description,
        emoji: a.emoji,
        dedupKey: `achievement:${a.id}`,
      })),
    );
    dismissNewUnlocks();
  }, [newlyUnlocked, dismissNewUnlocks]);
  const { level: xpLevel } = useXPSystem();
  const {
    open: pathTutorialOpen,
    complete: completePathTutorial,
    replay: replayPathTutorial,
  } = usePathTutorial(mounted);

  // "Your kitchen" toolset is collapsed by default — keeps Path's default view
  // condensed; the tools are one tap away.
  const [kitchenOpen, setKitchenOpen] = useState(false);

  const achievementsRef = useRef<AchievementsLauncherHandle>(null);
  const openBadges = useCallback(() => {
    achievementsRef.current?.open();
  }, []);

  // Check achievements whenever stats change
  useEffect(() => {
    if (!mounted) return;
    checkAchievements({
      cooksCompleted: stats.completedCooks,
      cuisinesExplored: stats.cuisinesCovered?.length ?? 0,
      streakDays: stats.currentStreak,
      skillsCompleted,
      dishesRated: completedSessions.filter((s) => s.rating).length,
      photosAdded: completedSessions.filter((s) => s.photoUri).length,
      xpEarned: totalXP,
      level: xpLevel,
    });
  }, [
    mounted,
    stats,
    skillsCompleted,
    completedSessions,
    totalXP,
    xpLevel,
    checkAchievements,
  ]);

  // Skill-detail bottom-sheet orchestration (extracted hook), aliased to the
  // local names the render below already uses.
  const {
    selectedNodeId,
    node: selectedNode,
    status: selectedStatus,
    progress: selectedProgress,
    onNodeTap: handleNodeTap,
    onStartCook: handleStartCook,
    onPracticeDish: handlePracticeDish,
    onClose: handleCloseSheet,
  } = useSkillDetailSheet({ getNodeStatus, getNodeProgress });

  if (!mounted) {
    return (
      <div className="min-h-dvh bg-[var(--nourish-cream)]">
        {/* Header skeleton */}
        <header className="app-header page-x py-3">
          <div className="mx-auto max-w-md flex items-center justify-between">
            <div className="h-5 w-20 rounded shimmer" />
            <div className="flex gap-3">
              <div className="h-5 w-12 rounded-full shimmer" />
              <div className="h-5 w-12 rounded-full shimmer" />
            </div>
          </div>
        </header>
        {/* Stats cards skeleton */}
        <div className="mx-auto max-w-md page-x pt-4 space-y-3">
          <div className="h-16 rounded-2xl shimmer" />
          <div className="h-16 rounded-2xl shimmer" />
        </div>
        {/* Skill tree nodes skeleton  -  alternating offsets to mimic real layout */}
        <div className="mx-auto max-w-md page-x pt-8 pb-8">
          {["mx-auto", "ml-auto mr-12", "mx-auto", "ml-12", "mx-auto"].map(
            (cls, i) => (
              <div key={i} className={`flex ${i > 0 ? "mt-8" : ""}`}>
                <div className={`w-16 h-16 rounded-full shimmer ${cls}`} />
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  return (
    <LayoutGroup>
      <motion.div
        className="min-h-dvh bg-[var(--nourish-cream)]"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.18 }}
      >
        {/* Header with stats */}
        <PathHeader
          totalXP={totalXP}
          level={level}
          skillsCompleted={skillsCompleted}
          onReplayTutorial={replayPathTutorial}
          badgesUnlocked={unlockedAchievements.length}
          badgesTotal={unlockedAchievements.length + lockedAchievements.length}
          onOpenBadges={openBadges}
        />

        {/* Phase 7 — a slim "Up next" action banner naming the active skill +
            carrying the live streak. It SHARES handleNodeTap with the tree (one
            source of truth) — a thin action row, not a duplicate node card. */}
        <UpNextBanner
          node={pickUpNextNode(nodesWithStatus)}
          streak={stats.currentStreak}
          onTap={handleNodeTap}
        />

        {/* Skill tree is the single hero — the signature journey map leads the
            page. Tapping the banner above or the active node opens the same
            SkillDetailSheet. */}
        <SkillTree nodes={nodesWithStatus} onNodeTap={handleNodeTap} />

        {/* Path = the longer arc (journey). "Today's plate" now lives on Today
            (TodayEatingCard) — the canonical daily surface — so it isn't
            duplicated here; the editable full day stays at /path/diary. Phase 4. */}
        <div className="mx-auto max-w-md page-x space-y-3 pt-4">
          <HydrationCard />
          <WeeklyTrendCard />
          <BrandedFoodSearch />
        </div>

        {/* Looking back: lifetime stats + this week's goal. Demoted below the
            hero so the dashboard never crowds the top, and merged into ONE
            grouped card (iOS-style, hairline divider between rows) so the
            section reads as a single surface instead of two floating cards. */}
        <motion.div
          className="mx-auto max-w-md page-x pt-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
            <motion.div
              className="p-5"
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 28 },
                },
              }}
            >
              <JourneySummary
                bare
                stats={stats}
                recentSessions={completedSessions}
                // Phase 7 — the Up-next banner is the single live streak readout
                // when present, so don't double-print it here (Rule 13).
                showStreak={
                  !(
                    stats.currentStreak >= 1 &&
                    pickUpNextNode(nodesWithStatus) != null
                  )
                }
              />
            </motion.div>
            <motion.div
              className="p-4"
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 28 },
                },
              }}
            >
              <WeeklyGoalCard bare completedSessions={completedSessions} />
            </motion.div>
          </div>
        </motion.div>

        {(unlockedAchievements.length > 0 || lockedAchievements.length > 0) && (
          <AchievementsLauncher
            unlocked={unlockedAchievements}
            locked={lockedAchievements}
            openRef={achievementsRef}
          />
        )}

        {/* Quick links at bottom (above tab bar). Section kicker uses
            the same uppercase tracking pattern as the rest of Path
            home and the Content tab — visual rhythm consistency. */}
        <div className="mx-auto max-w-md page-x pb-24 pt-4">
          <button
            type="button"
            onClick={() => setKitchenOpen((o) => !o)}
            aria-expanded={kitchenOpen}
            className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-1 text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          >
            <SectionKicker>Your kitchen</SectionKicker>
            <motion.span
              animate={{ rotate: kitchenOpen ? 180 : 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-[var(--nourish-subtext)]"
            >
              <ChevronDown size={18} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {kitchenOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    {
                      href: "/path/diary",
                      icon: NotebookText,
                      label: "Diary",
                    },
                    {
                      href: "/path/pantry",
                      icon: Bookmark,
                      label: "Pantry",
                    },
                    {
                      href: "/path/shopping-list",
                      icon: ShoppingCart,
                      label: "Shopping list",
                    },
                    {
                      href: "/path/favorites",
                      icon: Heart,
                      label: "Favorites",
                    },
                    {
                      href: "/path/recipes",
                      icon: ChefHat,
                      label: "My recipes",
                    },
                    {
                      href: "/path/household",
                      icon: Users,
                      label: "Household",
                    },
                    {
                      href: "/path/eco",
                      icon: Leaf,
                      label: "Eco Mode",
                    },
                    {
                      href: "/path/recap",
                      icon: Sparkles,
                      label: "Recap",
                    },
                  ].map(({ href, icon: Icon, label }) => (
                    <motion.div
                      key={href}
                      whileTap={{ scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      <Link
                        href={href}
                        className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-medium text-[var(--nourish-subtext)] transition-colors hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
                      >
                        <Icon size={14} />
                        {label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detail sheet */}
        <SkillDetailSheet
          node={selectedNode}
          status={selectedStatus}
          cooksCompleted={selectedProgress.cooksCompleted}
          open={selectedNodeId !== null}
          onClose={handleCloseSheet}
          onStartCook={handleStartCook}
          onPracticeDish={handlePracticeDish}
        />

        <PathTutorial
          open={pathTutorialOpen}
          onComplete={completePathTutorial}
        />
      </motion.div>
    </LayoutGroup>
  );
}
