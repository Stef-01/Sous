"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Heart } from "lucide-react";
import { PathHeader } from "@/components/path/path-header";
import { JourneySummary } from "@/components/path/journey-summary";
import { WeeklyGoalCard } from "@/components/path/weekly-goal-card";
import { NextUnlockCard } from "@/components/path/next-unlock-card";
import { SkillTree } from "@/components/path/skill-tree";
import { SkillDetailSheet } from "@/components/path/skill-detail-sheet";
import { useSkillProgress } from "@/lib/hooks/use-skill-progress";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useAchievements } from "@/lib/hooks/use-achievements";
import { useXPSystem } from "@/lib/hooks/use-xp-system";
import { AchievementToast } from "@/components/shared/achievement-toast";
import { AchievementsLauncher } from "@/components/path/achievements-launcher";
import { PathTutorial } from "@/components/path/path-tutorial";
import { getSkillNode, skillTreeNodes } from "@/data/skill-tree";

/**
 * Path home — Duolingo-style skill tree for cooking progression.
 *
 * Three tiers: Foundation → Intermediate → Cuisine Specializations.
 * Nodes unlock as prerequisites are completed. Tapping a node opens
 * a detail sheet with associated practice dishes.
 */
export default function PathPage() {
  const {
    mounted,
    nodesWithStatus,
    getNodeStatus,
    getNodeProgress,
    totalXP,
    level,
    levelProgress,
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
  const { level: xpLevel } = useXPSystem();
  const router = useRouter();

  const [pathTutorialOpen, setPathTutorialOpen] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => {
      try {
        if (localStorage.getItem("sous-path-tutorial-v1") !== "done") {
          setPathTutorialOpen(true);
        }
      } catch {
        setPathTutorialOpen(true);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [mounted]);

  const completePathTutorial = useCallback(() => {
    setPathTutorialOpen(false);
  }, []);

  const replayPathTutorial = useCallback(() => {
    setPathTutorialOpen(true);
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

  // Compute the next skill to unlock for NextUnlockCard
  const nextUnlockData = useMemo(() => {
    if (!mounted) return { nextNode: null, lockedPreview: null };

    // First: any in_progress node
    const inProgress = nodesWithStatus.find((n) => n.status === "in_progress");
    if (inProgress) {
      return {
        nextNode: {
          node: inProgress,
          status: inProgress.status,
          cooksCompleted: inProgress.progress.cooksCompleted,
        },
        lockedPreview: null,
      };
    }

    // Second: first available node
    const available = nodesWithStatus.find((n) => n.status === "available");
    if (available) {
      return {
        nextNode: {
          node: available,
          status: available.status,
          cooksCompleted: available.progress.cooksCompleted,
        },
        lockedPreview: null,
      };
    }

    // Third: first locked node as a teaser
    const firstLocked = skillTreeNodes.find(
      (n) => getNodeStatus(n.id) === "locked",
    );
    if (firstLocked) {
      return {
        nextNode: null,
        lockedPreview: {
          node: firstLocked,
          cooksNeeded: firstLocked.cooksRequired,
        },
      };
    }

    return { nextNode: null, lockedPreview: null };
  }, [mounted, nodesWithStatus, getNodeStatus]);

  // Detail sheet state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = selectedNodeId
    ? (getSkillNode(selectedNodeId) ?? null)
    : null;
  const selectedStatus = selectedNodeId
    ? getNodeStatus(selectedNodeId)
    : "locked";
  const selectedProgress = selectedNodeId
    ? getNodeProgress(selectedNodeId)
    : { cooksCompleted: 0 };

  const handleNodeTap = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleStartCook = useCallback(
    (dishSlug: string) => {
      setSelectedNodeId(null);
      router.push(`/cook/${dishSlug}`);
    },
    [router],
  );

  const handlePracticeDish = useCallback(
    (displayName: string) => {
      setSelectedNodeId(null);
      router.push(`/today?craving=${encodeURIComponent(displayName)}`);
    },
    [router],
  );

  const handleCloseSheet = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-dvh bg-[var(--nourish-cream)]">
        {/* Header skeleton */}
        <header className="border-b border-neutral-100/80 bg-white px-4 py-3">
          <div className="mx-auto max-w-md flex items-center justify-between">
            <div className="h-5 w-20 rounded shimmer" />
            <div className="flex gap-3">
              <div className="h-5 w-12 rounded-full shimmer" />
              <div className="h-5 w-12 rounded-full shimmer" />
            </div>
          </div>
        </header>
        {/* Stats cards skeleton */}
        <div className="mx-auto max-w-md px-4 pt-4 space-y-3">
          <div className="h-16 rounded-2xl shimmer" />
          <div className="h-16 rounded-2xl shimmer" />
        </div>
        {/* Skill tree nodes skeleton — alternating offsets to mimic real layout */}
        <div className="mx-auto max-w-md px-4 pt-8 pb-8">
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
    <motion.div
      className="min-h-dvh bg-[var(--nourish-cream)]"
      // initial={false}: avoid opacity:0 on first paint — it makes Playwright treat
      // the whole subtree as non-visible until the animation runs.
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      {/* Header with stats */}
      <PathHeader
        streak={stats.currentStreak}
        totalXP={totalXP}
        level={level}
        levelProgress={levelProgress}
        skillsCompleted={skillsCompleted}
        onReplayTutorial={replayPathTutorial}
      />

      {/* Journey summary + next unlock + weekly goal — reveal as you scroll into view */}
      <motion.div
        className="mx-auto max-w-md space-y-2 px-4 pt-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25, margin: "0px 0px -40px 0px" }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.08, delayChildren: 0.04 },
          },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 320, damping: 28 },
            },
          }}
        >
          <JourneySummary stats={stats} />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 320, damping: 28 },
            },
          }}
        >
          <NextUnlockCard
            nextNode={nextUnlockData.nextNode}
            lockedPreview={nextUnlockData.lockedPreview}
            skillsCompleted={skillsCompleted}
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 320, damping: 28 },
            },
          }}
        >
          <WeeklyGoalCard completedSessions={completedSessions} />
        </motion.div>
      </motion.div>

      {(unlockedAchievements.length > 0 || lockedAchievements.length > 0) && (
        <AchievementsLauncher
          unlocked={unlockedAchievements}
          locked={lockedAchievements}
        />
      )}

      {/* Skill tree */}
      <SkillTree nodes={nodesWithStatus} onNodeTap={handleNodeTap} />

      {/* Quick links at bottom (above tab bar) */}
      <div className="px-4 pb-24 pt-2">
        <div className="mx-auto max-w-md flex gap-2">
          <motion.div
            className="flex-1"
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Link
              href="/path/scrapbook"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
            >
              <BookOpen size={14} />
              Scrapbook
            </Link>
          </motion.div>
          <motion.div
            className="flex-1"
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Link
              href="/path/favorites"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
            >
              <Heart size={14} />
              Favorites
            </Link>
          </motion.div>
        </div>
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

      <AchievementToast
        achievements={newlyUnlocked}
        onDismiss={dismissNewUnlocks}
      />

      <PathTutorial open={pathTutorialOpen} onComplete={completePathTutorial} />
    </motion.div>
  );
}
