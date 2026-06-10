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
  CalendarDays,
  Bookmark,
  ChefHat,
  ChevronDown,
  Flame,
  Heart,
  Leaf,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { PathHeader } from "@/components/path/path-header";
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
  // Progression (Up-next + skill tree + journey + badges) lives in a
  // collapsible at the BOTTOM (founder-directed, 2026-06-09) — Path leads with
  // the everyday kitchen utilities; the journey is one tap away.
  const [progressionOpen, setProgressionOpen] = useState(false);

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

        {/* Kitchen WORKFLOW first (founder-directed, 2026-06-09 + -10): the
            loop the user actually runs — what you have (Pantry) → what you'll
            cook (Plan) → what you need (Groceries). Plan was previously
            unreachable from anywhere — the appraisal's biggest catch. */}
        <div className="mx-auto max-w-md page-x pt-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: "/path/pantry", icon: Bookmark, label: "Pantry" },
              { href: "/path/plan/week", icon: CalendarDays, label: "Plan" },
              {
                href: "/path/shopping-list",
                icon: ShoppingCart,
                label: "Groceries",
              },
            ].map(({ href, icon: Icon, label }) => (
              <motion.div
                key={href}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Link
                  href={href}
                  className="flex min-h-[64px] w-full flex-col items-center justify-center gap-1 rounded-2xl border border-neutral-200 bg-white text-[12px] font-semibold text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
                >
                  <Icon size={18} className="text-[var(--nourish-green)]" />
                  {label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* The rest of the kitchen — one tap away. (Diary became the
              Nutrition tab; Pantry + Shopping list moved up.) */}
          <button
            type="button"
            onClick={() => setKitchenOpen((o) => !o)}
            aria-expanded={kitchenOpen}
            className="mt-3 flex min-h-[44px] w-full items-center justify-between rounded-xl px-1 text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
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
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
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

        {/* Progression — collapsible, at the bottom (founder-directed,
            2026-06-09). The header row keeps the ambient momentum signals
            (streak flame) visible even while collapsed; expanding reveals the
            Up-next banner, the skill tree, the journey summary + weekly goal,
            and the badges launcher. */}
        <div className="mx-auto max-w-md page-x pb-24 pt-6">
          <button
            type="button"
            onClick={() => setProgressionOpen((o) => !o)}
            aria-expanded={progressionOpen}
            className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-1 text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          >
            <SectionKicker>Progression</SectionKicker>
            <span className="flex items-center gap-2">
              {stats.currentStreak >= 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-warm)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--nourish-warm)]">
                  <Flame size={11} />
                  {stats.currentStreak}-day
                </span>
              )}
              <motion.span
                animate={{ rotate: progressionOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="text-[var(--nourish-subtext)]"
              >
                <ChevronDown size={18} />
              </motion.span>
            </span>
          </button>
          <AnimatePresence initial={false}>
            {progressionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-3">
                  {/* Phase 7 banner — the section header above now carries the
                      streak (single print, Rule 13), so the banner doesn't. */}
                  <UpNextBanner
                    node={pickUpNextNode(nodesWithStatus)}
                    streak={0}
                    onTap={handleNodeTap}
                  />
                  <SkillTree
                    nodes={nodesWithStatus}
                    onNodeTap={handleNodeTap}
                  />
                  <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
                    <div className="p-5">
                      <JourneySummary
                        bare
                        stats={stats}
                        recentSessions={completedSessions}
                        // The section header carries the live streak readout.
                        showStreak={stats.currentStreak < 1}
                      />
                    </div>
                    <div className="p-4">
                      <WeeklyGoalCard
                        bare
                        completedSessions={completedSessions}
                      />
                    </div>
                  </div>
                  {(unlockedAchievements.length > 0 ||
                    lockedAchievements.length > 0) && (
                    <AchievementsLauncher
                      unlocked={unlockedAchievements}
                      locked={lockedAchievements}
                      openRef={achievementsRef}
                    />
                  )}
                  {/* Recap lives with reflection, not kitchen tools. */}
                  <Link
                    href="/path/recap"
                    className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-medium text-[var(--nourish-subtext)] transition-colors hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
                  >
                    <Sparkles size={14} />
                    Weekly recap
                  </Link>
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
