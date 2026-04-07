"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { SkillNodeComponent } from "./skill-node";
import { SkillConnector } from "./skill-connector";
import type { SkillNode, SkillNodeStatus } from "@/data/skill-tree";

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
/** Container width used for x-position calculation */
const TREE_WIDTH = 340;
/** Extra bottom padding */
const BOTTOM_PAD = 80;

/**
 * Skill Tree — vertically scrollable node map.
 *
 * Renders SVG connector lines behind positioned node buttons.
 * Nodes are placed on a grid using their position.x (0–100) and position.y (row).
 * Auto-scrolls to the first available or in-progress node on mount.
 */
export function SkillTree({ nodes, onNodeTap }: SkillTreeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute pixel positions for each node
  const nodePositions = useMemo(() => {
    const positions: Record<
      string,
      { cx: number; cy: number; node: NodeWithStatus }
    > = {};
    for (const node of nodes) {
      const cx = (node.position.x / 100) * TREE_WIDTH;
      const cy = node.position.y * ROW_HEIGHT + NODE_RADIUS + 40; // 40px top offset
      positions[node.id] = { cx, cy, node };
    }
    return positions;
  }, [nodes]);

  // Total canvas height
  const canvasHeight = useMemo(() => {
    const maxY = Math.max(...nodes.map((n) => n.position.y));
    return (maxY + 1) * ROW_HEIGHT + BOTTOM_PAD + 80;
  }, [nodes]);

  // Build connector edges: parent → child
  const edges = useMemo(() => {
    const result: Array<{
      from: string;
      to: string;
      targetStatus: SkillNodeStatus;
    }> = [];
    for (const node of nodes) {
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
  }, [nodes, nodePositions]);

  // Auto-scroll to first available/in-progress node on mount.
  // Walks up to the nearest scrollable ancestor (phone frame on desktop)
  // and falls back to window scroll (real mobile).
  useEffect(() => {
    const target =
      nodes.find((n) => n.status === "in_progress") ||
      nodes.find((n) => n.status === "available");
    if (target && scrollRef.current) {
      const pos = nodePositions[target.id];
      if (pos) {
        requestAnimationFrame(() => {
          if (!scrollRef.current) return;
          const scrollTarget = Math.max(0, pos.cy - 200);
          // Find nearest scrollable ancestor (e.g. the phone frame inner div)
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
          // Fallback: real mobile — scroll the window
          const containerTop =
            scrollRef.current.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: containerTop + scrollTarget,
            behavior: "smooth",
          });
        });
      }
    }
  }, [nodes, nodePositions]);

  // Tier separator labels
  const tierLabels = useMemo(() => {
    const labels: Array<{ label: string; y: number }> = [];
    const tiers = [
      {
        tier: "foundation",
        label: "FOUNDATION",
        startY: 0,
      },
      {
        tier: "intermediate",
        label: "INTERMEDIATE",
        startY: 9,
      },
      {
        tier: "specialization",
        label: "CUISINE MASTERY",
        startY: 12,
      },
    ];
    for (const t of tiers) {
      labels.push({
        label: t.label,
        y: t.startY * ROW_HEIGHT + 12,
      });
    }
    return labels;
  }, []);

  const handleNodeTap = useCallback(
    (nodeId: string) => onNodeTap(nodeId),
    [onNodeTap],
  );

  return (
    <div ref={scrollRef} className="relative w-full overflow-x-hidden">
      <div
        className="relative mx-auto"
        style={{ width: TREE_WIDTH, height: canvasHeight }}
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
          width={TREE_WIDTH}
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

        {/* Nodes */}
        {nodes.map((node) => {
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
