"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Heart } from "lucide-react";
import { PathHeader } from "@/components/path/path-header";
import { SkillTree } from "@/components/path/skill-tree";
import { SkillDetailSheet } from "@/components/path/skill-detail-sheet";
import { useSkillProgress } from "@/lib/hooks/use-skill-progress";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { getSkillNode } from "@/data/skill-tree";

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

  const { stats } = useCookSessions();
  const router = useRouter();

  // Detail sheet state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = selectedNodeId
    ? getSkillNode(selectedNodeId) ?? null
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
    [router]
  );

  const handleCloseSheet = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-full bg-[var(--nourish-cream)]">
        <header className="border-b border-neutral-100/80 bg-white px-4 py-3">
          <div className="mx-auto max-w-md">
            <div className="h-6 w-24 rounded bg-neutral-100 animate-pulse" />
          </div>
        </header>
        <div className="mx-auto max-w-md px-4 pt-8 space-y-8 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="mx-auto w-16 h-16 rounded-full bg-neutral-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[var(--nourish-cream)]">
      {/* Header with stats */}
      <PathHeader
        streak={stats.currentStreak}
        totalXP={totalXP}
        level={level}
        levelProgress={levelProgress}
        skillsCompleted={skillsCompleted}
      />

      {/* Skill tree */}
      <SkillTree nodes={nodesWithStatus} onNodeTap={handleNodeTap} />

      {/* Quick links at bottom (above tab bar) */}
      <div className="px-4 pb-24 pt-2">
        <div className="mx-auto max-w-md flex gap-2">
          <Link
            href="/path/scrapbook"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
          >
            <BookOpen size={14} />
            Scrapbook
          </Link>
          <Link
            href="/path/favorites"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
          >
            <Heart size={14} />
            Favorites
          </Link>
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
      />
    </div>
  );
}
