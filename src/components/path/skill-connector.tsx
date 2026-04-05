"use client";

import type { SkillNodeStatus } from "@/data/skill-tree";

interface ConnectorProps {
  /** Starting node center x (px) */
  x1: number;
  /** Starting node center y (px) */
  y1: number;
  /** Ending node center x (px) */
  x2: number;
  /** Ending node center y (px) */
  y2: number;
  /** Status of the target (child) node — determines line style */
  targetStatus: SkillNodeStatus;
}

/**
 * SVG path connector between two skill tree nodes.
 * Uses smooth bezier curves for a winding tree aesthetic.
 */
export function SkillConnector({
  x1,
  y1,
  x2,
  y2,
  targetStatus,
}: ConnectorProps) {
  // Create a smooth S-curve bezier between nodes
  const midY = (y1 + y2) / 2;
  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  const strokeColor =
    targetStatus === "completed"
      ? "var(--nourish-green)"
      : targetStatus === "in_progress"
        ? "var(--nourish-green)"
        : targetStatus === "available"
          ? "#d4d4d4"
          : "#e5e5e5";

  const strokeOpacity =
    targetStatus === "locked" ? 0.4 : targetStatus === "available" ? 0.6 : 1;

  const strokeDasharray =
    targetStatus === "completed" || targetStatus === "in_progress"
      ? "none"
      : targetStatus === "available"
        ? "6 4"
        : "3 6";

  return (
    <path
      d={path}
      fill="none"
      stroke={strokeColor}
      strokeWidth={targetStatus === "completed" ? 2.5 : 2}
      strokeOpacity={strokeOpacity}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
    />
  );
}
