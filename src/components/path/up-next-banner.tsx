"use client";

import { ChevronRight, Flame } from "lucide-react";
import { SkillIcon } from "@/components/shared/skill-icon";
import type { SkillNode, SkillNodeStatus } from "@/data/skill-tree";

type NodeWithStatus = SkillNode & { status: SkillNodeStatus };

/**
 * Phase 7 — pick the single "up next" skill: the one in progress, else the first
 * available (unlocked, not started). Pure + testable; returns null for a fully
 * complete or all-locked tree so the banner simply doesn't render.
 */
export function pickUpNextNode(
  nodes: readonly NodeWithStatus[],
): NodeWithStatus | null {
  return (
    nodes.find((n) => n.status === "in_progress") ??
    nodes.find((n) => n.status === "available") ??
    null
  );
}

/**
 * A slim action banner (NOT a tree-node card) that names the active skill + carries
 * the live streak, sharing the tree's exact tap handler so there's one source of
 * truth. One row, Rule 13: a button with a label, not a paragraph.
 */
export function UpNextBanner({
  node,
  streak,
  onTap,
}: {
  node: NodeWithStatus | null;
  streak: number;
  onTap: (id: string) => void;
}) {
  if (!node) return null;
  return (
    <button
      type="button"
      onClick={() => onTap(node.id)}
      aria-label={`Up next: ${node.name}`}
      className="flex w-full items-center gap-3 rounded-2xl border border-[var(--nourish-green)]/25 bg-[var(--nourish-green)]/5 px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--nourish-green)]/10"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[var(--nourish-green)]">
        <SkillIcon skillId={node.id} size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="sous-label block text-[var(--nourish-green)]">
          Up next
        </span>
        <span className="block truncate text-[14px] font-semibold text-[var(--nourish-dark)]">
          {node.name}
        </span>
      </span>
      {streak >= 1 && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[var(--nourish-green)]">
          <Flame size={12} />
          {streak}-day
        </span>
      )}
      <ChevronRight
        size={16}
        className="shrink-0 text-[var(--nourish-subtext)]"
        aria-hidden
      />
    </button>
  );
}
