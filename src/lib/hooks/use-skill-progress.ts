"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  skillTreeNodes,
  getSkillNode,
  XP_PER_COOK,
  computeLevel,
} from "@/data/skill-tree";
import type { SkillNodeStatus } from "@/data/skill-tree";

// ── Types ───────────────────────────────────────────────────

interface NodeProgress {
  cooksCompleted: number;
  completedAt?: string;
  /** ISO timestamp of the most recent cook recorded against this node.
   *  Drives the skill-tree decay halo on the Path screen. */
  lastCookedAt?: string;
}

interface SkillProgressState {
  [nodeId: string]: NodeProgress;
}

const STORAGE_KEY = "sous-skill-progress";

// ── Helpers ─────────────────────────────────────────────────

function loadProgress(): SkillProgressState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(state: SkillProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable
  }
}

// ── Hook ────────────────────────────────────────────────────

export function useSkillProgress() {
  const [progress, setProgress] = useState<SkillProgressState>({});
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    setProgress(loadProgress());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Get the visual status of a node */
  const getNodeStatus = useCallback(
    (nodeId: string): SkillNodeStatus => {
      const node = getSkillNode(nodeId);
      if (!node) return "locked";

      const nodeProgress = progress[nodeId];

      // Check if completed
      if (nodeProgress && nodeProgress.cooksCompleted >= node.cooksRequired) {
        return "completed";
      }

      // Check if prerequisites are met
      const prereqsMet = node.requiredSkills.every((reqId) => {
        const req = getSkillNode(reqId);
        const reqProgress = progress[reqId];
        return (
          req && reqProgress && reqProgress.cooksCompleted >= req.cooksRequired
        );
      });

      if (!prereqsMet) return "locked";

      // Available or in progress
      if (nodeProgress && nodeProgress.cooksCompleted > 0) {
        return "in_progress";
      }

      return "available";
    },
    [progress],
  );

  /** Record a cook toward a skill node */
  const recordSkillCook = useCallback((nodeId: string) => {
    const node = getSkillNode(nodeId);
    if (!node) return;

    setProgress((prev) => {
      const current = prev[nodeId] || { cooksCompleted: 0 };
      const newCount = current.cooksCompleted + 1;
      const isNowComplete = newCount >= node.cooksRequired;
      const nowIso = new Date().toISOString();

      const updated: SkillProgressState = {
        ...prev,
        [nodeId]: {
          ...current,
          cooksCompleted: newCount,
          lastCookedAt: nowIso,
          ...(isNowComplete && !current.completedAt
            ? { completedAt: nowIso }
            : {}),
        },
      };

      saveProgress(updated);
      return updated;
    });
  }, []);

  /** Get progress for a specific node */
  const getNodeProgress = useCallback(
    (nodeId: string): NodeProgress => {
      return progress[nodeId] || { cooksCompleted: 0 };
    },
    [progress],
  );

  /** Total XP from all completed cooks */
  const totalXP = useMemo(() => {
    let xp = 0;
    for (const node of skillTreeNodes) {
      const np = progress[node.id];
      if (np) {
        const cooks = Math.min(np.cooksCompleted, node.cooksRequired);
        xp += cooks * XP_PER_COOK[node.tier];
      }
    }
    return xp;
  }, [progress]);

  /** Current level */
  const level = useMemo(() => computeLevel(totalXP), [totalXP]);

  /** XP progress within current level (0–100) */
  const levelProgress = useMemo(() => totalXP % 100, [totalXP]);

  /** Total skills completed */
  const skillsCompleted = useMemo(() => {
    return skillTreeNodes.filter((node) => {
      const np = progress[node.id];
      return np && np.cooksCompleted >= node.cooksRequired;
    }).length;
  }, [progress]);

  /** Get all available (unlocked, not completed) nodes */
  const availableNodes = useMemo(() => {
    return skillTreeNodes.filter(
      (node) => getNodeStatus(node.id) === "available",
    );
  }, [getNodeStatus]);

  /** Get nodes with enriched status */
  const nodesWithStatus = useMemo(() => {
    return skillTreeNodes.map((node) => ({
      ...node,
      status: getNodeStatus(node.id),
      progress: getNodeProgress(node.id),
    }));
  }, [getNodeStatus, getNodeProgress]);

  return {
    mounted,
    progress,
    nodesWithStatus,
    getNodeStatus,
    getNodeProgress,
    recordSkillCook,
    totalXP,
    level,
    levelProgress,
    skillsCompleted,
    availableNodes,
  };
}
