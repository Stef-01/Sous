"use client";

import { useRef, useEffect, useMemo, useCallback, useState, memo } from "react";
import { SkillNodeComponent } from "./skill-node";
import { SkillConnector } from "./skill-connector";
import { useHaptic } from "@/lib/hooks/use-haptic";
import type { SkillNode, SkillNodeStatus } from "@/data/skill-tree";
import { getSkillTrainingHover } from "@/data/skill-node-training-hovers";
import { TrainingHoverPanel } from "@/components/path/training-hover-panel";

interface NodeWithStatus extends SkillNode {
  status: SkillNodeStatus;
  progress: { cooksCompleted: number; completedAt?: string };
}

interface SkillTreeProps {
  nodes: NodeWithStatus[];
  onNodeTap: (nodeId: string) => void;
}

/** Row height in pixels between node rows */
const ROW_HEIGHT = 120;
/** Node visual radius for connector calculations */
const NODE_RADIUS = 32;
/** Horizontal padding so edge nodes aren't clipped */
const H_PAD = NODE_RADIUS + 4;
/** Maximum tree width — scales down to fit narrow screens */
const MAX_TREE_WIDTH = 420;
/** Extra bottom padding */
const BOTTOM_PAD = 80;

/**
 * Cuisine mastery card — shown in the grid section below the skill tree.
 * Wider card format rather than a circular node since these are parallel paths.
 */
function MasteryCuisineCard({
  node,
  onTap,
}: {
  node: NodeWithStatus;
  onTap: (id: string) => void;
}) {
  const isInteractive = node.status !== "locked";
  const trainingHover = getSkillTrainingHover(node.id);

  return (
    <button
      type="button"
      title={trainingHover.oneLiner}
      onClick={() => isInteractive && onTap(node.id)}
      disabled={!isInteractive}
      className={[
        "group relative flex w-full flex-col items-center gap-2 overflow-visible rounded-2xl border p-4 text-center transition-all duration-200",
        node.status === "completed"
          ? "border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5"
          : node.status === "in_progress"
            ? "border-[var(--nourish-green)]/50 bg-white shadow-md"
            : node.status === "available"
              ? "border-neutral-200 bg-white active:scale-95"
              : "border-neutral-100 bg-neutral-50 opacity-40 cursor-default",
      ].join(" ")}
    >
      <span className="text-3xl leading-none">{node.emoji}</span>
      <span
        className={[
          "text-[11px] font-semibold leading-tight",
          node.status === "locked"
            ? "text-neutral-300"
            : "text-[var(--nourish-dark)]",
        ].join(" ")}
      >
        {node.name}
      </span>
      {node.status === "in_progress" && (
        <span className="text-[10px] text-[var(--nourish-green)] font-medium">
          {node.progress.cooksCompleted}/{node.cooksRequired} dishes
        </span>
      )}
      {node.status === "completed" && (
        <span className="text-[10px] font-bold text-[var(--nourish-green)]">
          ✓ Mastered
        </span>
      )}
      {node.status === "available" && (
        <span className="text-[10px] text-[var(--nourish-subtext)]">
          {node.cooksRequired} dishes
        </span>
      )}
      {node.status === "locked" && (
        <span className="text-[10px] text-neutral-300">Locked</span>
      )}

      <TrainingHoverPanel hover={trainingHover} />
    </button>
  );
}

/**
 * Skill Tree — vertically scrollable node map.
 *
 * Renders SVG connector lines behind positioned node buttons.
 * Nodes are placed on a grid using their position.x (0–100) and position.y (row).
 * Auto-scrolls to the first available or in-progress node on mount.
 * Mastery-tier nodes render below in a 2-column grid, not in the tree.
 */
export const SkillTree = memo(function SkillTree({
  nodes,
  onNodeTap,
}: SkillTreeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const haptic = useHaptic();

  // Split mastery (grid) from the rest (tree)
  const treeNodes = useMemo(
    () => nodes.filter((n) => n.tier !== "mastery"),
    [nodes],
  );
  const masteryNodes = useMemo(
    () => nodes.filter((n) => n.tier === "mastery"),
    [nodes],
  );

  // Measure actual container width so we can scale the tree to fit any screen
  const [treeWidth, setTreeWidth] = useState(MAX_TREE_WIDTH);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth;
      setTreeWidth(Math.min(available, MAX_TREE_WIDTH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Usable drawing width after horizontal padding
  const drawWidth = treeWidth - H_PAD * 2;

  // Compute pixel positions for each tree node
  const nodePositions = useMemo(() => {
    const positions: Record<
      string,
      { cx: number; cy: number; node: NodeWithStatus }
    > = {};
    for (const node of treeNodes) {
      const cx = H_PAD + (node.position.x / 100) * drawWidth;
      const cy = node.position.y * ROW_HEIGHT + NODE_RADIUS + 40;
      positions[node.id] = { cx, cy, node };
    }
    return positions;
  }, [treeNodes, drawWidth]);

  // Total canvas height — based on tree nodes only
  const canvasHeight = useMemo(() => {
    if (treeNodes.length === 0) return 300;
    const maxY = Math.max(...treeNodes.map((n) => n.position.y));
    return (maxY + 1) * ROW_HEIGHT + BOTTOM_PAD + 80;
  }, [treeNodes]);

  // Build connector edges: parent → child (tree nodes only)
  const edges = useMemo(() => {
    const result: Array<{
      from: string;
      to: string;
      targetStatus: SkillNodeStatus;
    }> = [];
    for (const node of treeNodes) {
      for (const reqId of node.requiredSkills) {
        if (nodePositions[reqId]) {
          result.push({
            from: reqId,
            to: node.id,
            targetStatus: node.status,
          });
        }
      }
    }
    return result;
  }, [treeNodes, nodePositions]);

  // Auto-scroll to first available/in-progress node on mount.
  useEffect(() => {
    const target =
      treeNodes.find((n) => n.status === "in_progress") ||
      treeNodes.find((n) => n.status === "available");
    if (target && scrollRef.current) {
      const pos = nodePositions[target.id];
      if (pos) {
        requestAnimationFrame(() => {
          if (!scrollRef.current) return;
          const scrollTarget = Math.max(0, pos.cy - 200);
          let ancestor: Element | null = scrollRef.current.parentElement;
          while (ancestor && ancestor !== document.body) {
            const overflow = window.getComputedStyle(ancestor).overflowY;
            if (
              (overflow === "auto" || overflow === "scroll") &&
              ancestor.scrollHeight > ancestor.clientHeight
            ) {
              ancestor.scrollTo({ top: scrollTarget, behavior: "smooth" });
              return;
            }
            ancestor = ancestor.parentElement;
          }
          const containerTop =
            scrollRef.current.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: containerTop + scrollTarget,
            behavior: "smooth",
          });
        });
      }
    }
  }, [treeNodes, nodePositions]);

  // Tier separator labels (tree tiers only)
  const tierLabels = useMemo(() => {
    const labels: Array<{ label: string; y: number }> = [];
    const tiers = [
      { label: "FOUNDATION", startY: 0 },
      { label: "INTERMEDIATE", startY: 5 },
      { label: "ADVANCED", startY: 9 },
      { label: "PRE-MASTERY", startY: 13 },
    ];
    for (const t of tiers) {
      labels.push({ label: t.label, y: t.startY * ROW_HEIGHT + 12 });
    }
    return labels;
  }, []);

  const handleNodeTap = useCallback(
    (nodeId: string) => {
      haptic();
      onNodeTap(nodeId);
    },
    [onNodeTap, haptic],
  );

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      {/* ── Sequential skill tree ─────────────────────────── */}
      <div
        ref={scrollRef}
        className="relative mx-auto"
        style={{ width: treeWidth, height: canvasHeight }}
      >
        {/* Tier labels */}
        {tierLabels.map((tl) => (
          <div
            key={tl.label}
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{ top: tl.y }}
          >
            <span className="text-[10px] font-bold tracking-[0.15em] text-[var(--nourish-subtext)] uppercase">
              {tl.label}
            </span>
          </div>
        ))}

        {/* SVG connectors */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={treeWidth}
          height={canvasHeight}
        >
          {edges.map((edge) => {
            const from = nodePositions[edge.from];
            const to = nodePositions[edge.to];
            if (!from || !to) return null;
            return (
              <SkillConnector
                key={`${edge.from}-${edge.to}`}
                x1={from.cx}
                y1={from.cy + NODE_RADIUS}
                x2={to.cx}
                y2={to.cy - NODE_RADIUS}
                targetStatus={edge.targetStatus}
              />
            );
          })}
        </svg>

        {/* Tree nodes */}
        {treeNodes.map((node) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos.cx, top: pos.cy }}
            >
              <SkillNodeComponent
                id={node.id}
                name={node.name}
                emoji={node.emoji}
                status={node.status}
                cooksCompleted={node.progress.cooksCompleted}
                cooksRequired={node.cooksRequired}
                onTap={handleNodeTap}
                trainingHover={getSkillTrainingHover(node.id)}
              />
            </div>
          );
        })}
      </div>

      {/* ── Cuisine Mastery grid ───────────────────────────── */}
      {masteryNodes.length > 0 && (
        <div className="px-4 pb-8 pt-2">
          <div className="mb-4 text-center">
            <span className="text-[10px] font-bold tracking-[0.15em] text-[var(--nourish-subtext)] uppercase">
              CUISINE MASTERY — Choose Your Path
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 overflow-visible pb-10">
            {masteryNodes.map((node) => (
              <MasteryCuisineCard
                key={node.id}
                node={node}
                onTap={handleNodeTap}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
