"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SkillNodeStatus } from "@/data/skill-tree";

interface ConnectorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  targetStatus: SkillNodeStatus;
  /** Index within the edge list — used to stagger draw timing */
  index?: number;
  /** Called once when stroke-draw finishes on a completed edge */
  onDrawn?: () => void;
}

const STATUS_STYLE: Record<
  SkillNodeStatus,
  { stroke: string; width: number; opacity: number }
> = {
  completed: { stroke: "#22c55e", width: 2, opacity: 0.95 },
  in_progress: { stroke: "#4ade80", width: 2, opacity: 0.85 },
  available: { stroke: "#cbd5e1", width: 1.5, opacity: 0.9 },
  locked: { stroke: "#e2e8f0", width: 1.25, opacity: 0.65 },
};

export function SkillConnector({
  x1,
  y1,
  x2,
  y2,
  targetStatus,
  index = 0,
  onDrawn,
}: ConnectorProps) {
  const reduced = useReducedMotion();
  const midY = (y1 + y2) / 2;
  const d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  const s = STATUS_STYLE[targetStatus];

  if (reduced) {
    return (
      <path
        d={d}
        fill="none"
        stroke={s.stroke}
        strokeWidth={s.width}
        strokeOpacity={s.opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={s.stroke}
      strokeWidth={s.width}
      strokeOpacity={s.opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-20px", amount: 0.1 }}
      transition={{
        pathLength: {
          duration: 0.55,
          delay: index * 0.04,
          ease: [0.22, 1, 0.36, 1],
        },
        opacity: { duration: 0.2, delay: index * 0.04 },
      }}
      onAnimationComplete={(def) => {
        if (
          typeof def === "object" &&
          def !== null &&
          "pathLength" in def &&
          targetStatus === "completed" &&
          onDrawn
        ) {
          onDrawn();
        }
      }}
    />
  );
}
