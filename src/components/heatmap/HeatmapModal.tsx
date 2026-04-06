"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scoreToHsl } from "@/lib/scoreColor";

interface HeatmapData {
  mains: string[];
  sides: string[];
  matrix: number[][]; // >0 = engine score, -1 = curated pool, 0 = no relation
  sourceTypes: ("engine" | "curated")[];
}

interface HeatmapModalProps {
  open: boolean;
  onClose: () => void;
}

interface TooltipInfo {
  main: string;
  side: string;
  score: number;
  source: "engine" | "curated";
  x: number;
  y: number;
}

const CURATED_COLOR = "#93c5fd"; // blue-300 — visually distinct from score gradient

export default function HeatmapModal({ open, onClose }: HeatmapModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "score">("default");
  const [filter, setFilter] = useState<"all" | "engine" | "curated">("all");

  useEffect(() => {
    if (open && !data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching external data and updating state on resolution
      setLoading(true);
      fetch("/api/heatmap")
        .then((r) => r.json())
        .then((d) => setData(d))
        .finally(() => setLoading(false));
    }
  }, [open, data]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const filteredData = useMemo(() => {
    if (!data) return null;

    let indices: number[];
    if (filter === "all") {
      indices = data.mains.map((_, i) => i);
    } else {
      indices = data.mains
        .map((_, i) => i)
        .filter((i) => data.sourceTypes[i] === filter);
    }

    const mains = indices.map((i) => data.mains[i]);
    const matrix = indices.map((i) => data.matrix[i]);
    const sourceTypes = indices.map((i) => data.sourceTypes[i]);

    // Sort sides
    if (sortBy === "score") {
      const sideAvgs = data.sides.map((side, colIdx) => {
        let total = 0;
        let count = 0;
        for (const row of matrix) {
          if (row[colIdx] > 0) {
            total += row[colIdx];
            count++;
          }
        }
        return { side, colIdx, avg: count > 0 ? total / count : 0 };
      });
      sideAvgs.sort((a, b) => b.avg - a.avg);

      const newSides = sideAvgs.map((s) => s.side);
      const colOrder = sideAvgs.map((s) => s.colIdx);
      const newMatrix = matrix.map((row) => colOrder.map((ci) => row[ci]));

      return { mains, sides: newSides, matrix: newMatrix, sourceTypes };
    }

    return { mains, sides: [...data.sides], matrix, sourceTypes };
  }, [data, sortBy, filter]);

  const handleCellHover = (
    mainIdx: number,
    sideIdx: number,
    e: React.MouseEvent
  ) => {
    if (!filteredData) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      main: filteredData.mains[mainIdx],
      side: filteredData.sides[sideIdx],
      score: filteredData.matrix[mainIdx][sideIdx],
      source: filteredData.sourceTypes[mainIdx],
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const getTierLabel = (score: number) => {
    if (score >= 85) return "excellent";
    if (score >= 70) return "strong";
    if (score >= 55) return "good";
    if (score >= 40) return "experimental";
    return "low";
  };

  const getCellColor = (score: number) => {
    if (score > 0) return scoreToHsl(score);
    if (score === -1) return CURATED_COLOR;
    return "#f3f4f6";
  };

  const engineCount = data?.sourceTypes.filter((s) => s === "engine").length ?? 0;
  const curatedCount = data?.sourceTypes.filter((s) => s === "curated").length ?? 0;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label="Pairing Heatmap"
        >
          <motion.div
            className="fixed inset-0 bg-black/30"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ perspective: 800 }}
          >
            <motion.div
              ref={dialogRef}
              className="bg-white rounded-2xl shadow-xl w-full max-w-[95vw] max-h-[90vh] p-6 relative overflow-hidden flex flex-col"
              initial={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 60, scale: 0.9, rotateX: 8 }
              }
              animate={
                prefersReduced
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1, rotateX: 0 }
              }
              exit={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 40, scale: 0.95 }
              }
              transition={
                prefersReduced ? { duration: 0.2 } : springs.modal
              }
            >
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 text-nourish-subtext hover:text-nourish-dark transition-colors text-xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold rounded p-1 z-10"
                aria-label="Close heatmap"
                whileHover={prefersReduced ? {} : { scale: 1.1, rotate: 90 }}
                whileTap={prefersReduced ? {} : { scale: 0.85 }}
                transition={springs.snappy}
              >
                ✕
              </motion.button>

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pr-8 gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-nourish-dark">
                    Pairing Heatmap
                  </h2>
                  <p className="text-xs text-nourish-subtext mt-0.5">
                    {data
                      ? `${data.mains.length} meals \u00d7 ${data.sides.length} sides \u2014 ${engineCount} scored, ${curatedCount} curated`
                      : "Loading..."}
                  </p>
                </div>
                {data && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-[11px]">
                      {(["all", "engine", "curated"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-3 py-1 transition-colors ${
                            filter === f
                              ? "bg-nourish-button text-white"
                              : "text-nourish-subtext hover:text-nourish-dark"
                          }`}
                        >
                          {f === "all" ? "All" : f === "engine" ? "Scored" : "Curated"}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setSortBy((s) => (s === "default" ? "score" : "default"))
                      }
                      className="text-[11px] text-nourish-subtext border border-gray-200 rounded-full px-3 py-1 hover:border-nourish-button hover:text-nourish-button transition-colors"
                    >
                      {sortBy === "default" ? "Sort by score" : "Default order"}
                    </button>
                  </div>
                )}
              </div>

              {/* Heatmap grid */}
              {loading && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-nourish-subtext text-sm">
                    Loading heatmap data...
                  </p>
                </div>
              )}

              {filteredData && (
                <div className="flex-1 overflow-auto min-h-0">
                  <div className="inline-block min-w-full">
                    <table className="border-collapse">
                      <thead>
                        <tr>
                          <th className="sticky left-0 z-[5] bg-white min-w-[140px] p-0" />
                          {filteredData.sides.map((side) => (
                            <th
                              key={side}
                              className="p-0 text-[9px] text-nourish-subtext font-normal"
                            >
                              <div className="w-8 h-[100px] flex items-end justify-center pb-1">
                                <span
                                  className="block whitespace-nowrap origin-bottom-left"
                                  style={{
                                    transform: "rotate(-55deg)",
                                    transformOrigin: "bottom left",
                                    width: "90px",
                                    textAlign: "left",
                                    marginLeft: "14px",
                                  }}
                                >
                                  {side}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.mains.map((main, rowIdx) => (
                          <tr key={main}>
                            <td className="sticky left-0 z-[5] bg-white text-xs text-nourish-dark font-medium pr-3 py-0 whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                {main}
                                <span
                                  className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    filteredData.sourceTypes[rowIdx] === "engine"
                                      ? "bg-emerald-400"
                                      : "bg-blue-300"
                                  }`}
                                  title={filteredData.sourceTypes[rowIdx] === "engine" ? "Engine scored" : "Curated"}
                                />
                              </span>
                            </td>
                            {filteredData.sides.map((_, colIdx) => {
                              const score = filteredData.matrix[rowIdx][colIdx];
                              return (
                                <td
                                  key={colIdx}
                                  className="p-0"
                                  onMouseEnter={(e) =>
                                    handleCellHover(rowIdx, colIdx, e)
                                  }
                                  onMouseLeave={() => setTooltip(null)}
                                >
                                  <div
                                    className="w-8 h-7 border border-white/50 cursor-crosshair transition-transform hover:scale-125 hover:z-10 relative"
                                    style={{
                                      backgroundColor: getCellColor(score),
                                    }}
                                    aria-label={`${main} + ${filteredData.sides[colIdx]}: ${score === -1 ? "curated" : score}`}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Legend */}
              {filteredData && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-nourish-subtext">Scored:</span>
                    <div className="flex items-center gap-0.5">
                      {[20, 35, 50, 65, 80, 100].map((score) => (
                        <div
                          key={score}
                          className="w-5 h-3.5 rounded-sm"
                          style={{ backgroundColor: scoreToHsl(score) }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-nourish-subtext">low</span>
                    <span className="text-[10px] text-nourish-subtext">{"\u2192"}</span>
                    <span className="text-[10px] text-nourish-subtext">excellent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-3.5 rounded-sm"
                      style={{ backgroundColor: CURATED_COLOR }}
                    />
                    <span className="text-[10px] text-nourish-subtext">Curated (in side pool)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-3.5 rounded-sm bg-gray-100" />
                    <span className="text-[10px] text-nourish-subtext">No pairing</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Floating tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                className="fixed z-[110] pointer-events-none bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: "translate(-50%, -100%)",
                }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                <p className="font-medium text-nourish-dark">
                  {tooltip.main}
                </p>
                <p className="text-nourish-subtext">
                  + {tooltip.side}
                </p>
                <p className="mt-0.5">
                  {tooltip.score > 0 ? (
                    <>
                      <span
                        className="font-semibold"
                        style={{ color: scoreToHsl(tooltip.score) }}
                      >
                        {tooltip.score}
                      </span>
                      <span className="text-nourish-subtext ml-1.5">
                        {getTierLabel(tooltip.score)}
                      </span>
                    </>
                  ) : tooltip.score === -1 ? (
                    <span style={{ color: CURATED_COLOR }} className="font-medium">
                      Curated pairing
                    </span>
                  ) : (
                    <span className="text-gray-400">No pairing</span>
                  )}
                </p>
                <p className="text-[10px] text-nourish-subtext/60 mt-0.5">
                  {tooltip.source === "engine" ? "Engine scored" : "Curated selection"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
