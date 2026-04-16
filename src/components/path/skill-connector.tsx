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
 * Orthogonal connector (vertical–horizontal–vertical) between nodes.
 * Reads cleaner than S-curves when many paths overlap on a narrow canvas.
 */
export function SkillConnector({
  x1,
  y1,
  x2,
  y2,
  targetStatus,
}: ConnectorProps) {
  const midY = (y1 + y2) / 2;
  const path = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;

  if (targetStatus === "completed") {
    return (
      <path
        d={path}
        fill="none"
        stroke="#22c55e"
        strokeWidth={2}
        strokeOpacity={0.95}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  if (targetStatus === "in_progress") {
    return (
      <path
        d={path}
        fill="none"
        stroke="#4ade80"
        strokeWidth={2}
        strokeOpacity={0.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  if (targetStatus === "available") {
    return (
      <path
        d={path}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={1.5}
        strokeOpacity={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  return (
    <path
      d={path}
      fill="none"
      stroke="#e2e8f0"
      strokeWidth={1.25}
      strokeOpacity={0.65}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
