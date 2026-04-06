"use client";

import type { SkillNodeStatus } from "@/data/skill-tree";

interface ConnectorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  targetStatus: SkillNodeStatus;
}

/**
 * SVG path connector between two skill tree nodes.
 * Uses smooth S-curve beziers. Color and style reflect progression state.
 */
export function SkillConnector({
  x1,
  y1,
  x2,
  y2,
  targetStatus,
}: ConnectorProps) {
  const midY = (y1 + y2) / 2;
  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  if (targetStatus === "completed") {
    return (
      <path
        d={path}
        fill="none"
        stroke="#22c55e"
        strokeWidth={3}
        strokeOpacity={0.9}
        strokeLinecap="round"
      />
    );
  }

  if (targetStatus === "in_progress") {
    return (
      <>
        {/* Base green line */}
        <path
          d={path}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2.5}
          strokeOpacity={0.7}
          strokeLinecap="round"
          strokeDasharray="6 3"
        />
      </>
    );
  }

  if (targetStatus === "available") {
    return (
      <path
        d={path}
        fill="none"
        stroke="#d1d5db"
        strokeWidth={2}
        strokeOpacity={0.8}
        strokeLinecap="round"
        strokeDasharray="5 4"
      />
    );
  }

  // locked — very subtle
  return (
    <path
      d={path}
      fill="none"
      stroke="#e2e8f0"
      strokeWidth={1.5}
      strokeOpacity={0.5}
      strokeLinecap="round"
      strokeDasharray="3 6"
    />
  );
}
