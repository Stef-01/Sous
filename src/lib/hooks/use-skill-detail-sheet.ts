"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSkillNode,
  type SkillNode,
  type SkillNodeStatus,
} from "@/data/skill-tree";

interface SkillDetailSheetDeps {
  getNodeStatus: (nodeId: string) => SkillNodeStatus;
  getNodeProgress: (nodeId: string) => { cooksCompleted: number };
}

/**
 * Skill-detail bottom-sheet orchestration: which node is open, its derived
 * node / status / progress, and the tap → open, start-cook, practice, and
 * close actions. Extracted from PathPage so the page stays orchestration-only.
 * The accessors come from useSkillProgress and are passed in so this hook owns
 * no progress state of its own.
 */
export function useSkillDetailSheet({
  getNodeStatus,
  getNodeProgress,
}: SkillDetailSheetDeps) {
  const router = useRouter();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const node: SkillNode | null = selectedNodeId
    ? (getSkillNode(selectedNodeId) ?? null)
    : null;
  const status: SkillNodeStatus = selectedNodeId
    ? getNodeStatus(selectedNodeId)
    : "locked";
  const progress = selectedNodeId
    ? getNodeProgress(selectedNodeId)
    : { cooksCompleted: 0 };

  const onNodeTap = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const onStartCook = useCallback(
    (dishSlug: string) => {
      setSelectedNodeId(null);
      router.push(`/cook/${dishSlug}`);
    },
    [router],
  );

  const onPracticeDish = useCallback(
    (displayName: string) => {
      setSelectedNodeId(null);
      router.push(`/today?craving=${encodeURIComponent(displayName)}`);
    },
    [router],
  );

  const onClose = useCallback(() => setSelectedNodeId(null), []);

  return {
    selectedNodeId,
    node,
    status,
    progress,
    onNodeTap,
    onStartCook,
    onPracticeDish,
    onClose,
  };
}
