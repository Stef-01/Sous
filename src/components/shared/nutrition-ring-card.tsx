"use client";

/**
 * NutritionRingCard — the macro-ring nutrition view (energy donut + macro
 * legend + target bars + key micros + an expandable complete-nutrient summary),
 * adapted to Sous's cream theme and --data-* macro palette. Reusable across the
 * cook flow, the Today "Info" sheet, and side-pairing detail.
 *
 * Dependency-free: the ring is hand-rolled SVG (stroke-dasharray arcs).
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PerServingNutrition } from "@/types/nutrition";
import { proteinQuality } from "@/lib/nutrition/protein-quality";
import { isNutrientDense } from "@/lib/nutrition/nutrient-density";
import {
  NUTRIENT_DISPLAY,
  NUTRIENT_GROUP_ORDER,
  type NutrientGroup,
} from "@/data/nutrition/nutrient-display";

// FDA reference daily values for the macro target bars (21 CFR 101.9, 2000kcal).
const MACRO_DV = { energy: 2000, protein: 50, carbs: 275, fat: 78 };

const MACRO = {
  protein: { label: "Protein", color: "var(--data-protein)", kcalPerG: 4 },
  carbs: { label: "Carbs", color: "var(--data-carb)", kcalPerG: 4 },
  fat: { label: "Fat", color: "var(--data-fat)", kcalPerG: 9 },
} as const;

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

/** Macro donut: three arcs sized by each macro's share of calories. */
function MacroRing({
  calories,
  shares,
}: {
  calories: number;
  shares: { protein: number; carbs: number; fat: number };
}) {
  const r = 52;
  const C = 2 * Math.PI * r;
  const order = ["protein", "carbs", "fat"] as const;
  let offset = 0;
  return (
    <svg
      viewBox="0 0 128 128"
      className="h-[128px] w-[128px] shrink-0"
      role="img"
      aria-label={`Macronutrient ring: ${Math.round(calories)} kcal — ${Math.round(
        shares.protein * 100,
      )}% protein, ${Math.round(shares.carbs * 100)}% carbs, ${Math.round(
        shares.fat * 100,
      )}% fat`}
    >
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="var(--nourish-border)"
        strokeWidth="12"
      />
      {order.map((k) => {
        const frac = shares[k];
        const len = frac * C;
        const seg = (
          <circle
            key={k}
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={MACRO[k].color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, len - 4)} ${C - Math.max(0, len - 4)}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 64 64)"
          />
        );
        offset += len;
        return seg;
      })}
      <text
        x="64"
        y="60"
        textAnchor="middle"
        className="fill-[var(--nourish-dark)] text-[26px] font-bold"
      >
        {Math.round(calories)}
      </text>
      <text
        x="64"
        y="78"
        textAnchor="middle"
        className="fill-[var(--nourish-subtext)] text-[12px]"
      >
        kcal
      </text>
    </svg>
  );
}

/** A target row: label, value/target, % bar. */
function TargetRow({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color?: string;
}) {
  const p = pct(value, target);
  const over = p >= 100;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-[13px]">
        <span className="text-[var(--nourish-dark)]">
          <span className="font-semibold">{label}</span>{" "}
          <span className="text-[var(--nourish-subtext)]">
            {value.toFixed(value < 10 ? 1 : 0)} / {target} {unit}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 font-semibold tabular-nums",
            over
              ? "text-[var(--tier-strong)]"
              : "text-[var(--nourish-subtext)]",
          )}
        >
          {p}%
        </span>
      </div>
      <span className="block h-1.5 overflow-hidden rounded-full bg-[var(--nourish-border)]">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${Math.min(100, p)}%`,
            backgroundColor: over
              ? "var(--tier-strong)"
              : (color ?? "var(--nourish-subtext)"),
          }}
        />
      </span>
    </div>
  );
}

interface NRow {
  key: string;
  label: string;
  unit: string;
  dv: number | null;
  value: number;
  group: NutrientGroup;
}

/** Build every composed nutrient row (value + optional %DV), scaled by servings,
 *  driven by the full NUTRIENT_DISPLAY table (~50 nutrients). */
function buildRows(n: PerServingNutrition, mult = 1): NRow[] {
  const rows: NRow[] = [];
  for (const m of NUTRIENT_DISPLAY) {
    const raw = n[m.key] as number | undefined;
    if (raw == null) continue; // not composed for this dish
    rows.push({
      key: String(m.key),
      label: m.label,
      unit: m.unit,
      dv: m.dv,
      value: raw * mult,
      group: m.group,
    });
  }
  return rows;
}

function fmtAmount(v: number): string {
  if (v >= 100) return Math.round(v).toString();
  if (v >= 10) return v.toFixed(0);
  if (v >= 1) return v.toFixed(1);
  return v.toFixed(2);
}

/** A nutrient row: label + a %DV bar, or the value when there's no daily target. */
function NutrientBar({ row }: { row: NRow }) {
  const p = row.dv ? pct(row.value, row.dv) : null;
  const strong = p != null && p >= 100;
  const good = p != null && p >= 20;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-[13px]">
        <span className="truncate text-[var(--nourish-dark)]">{row.label}</span>
        <span
          className={cn(
            "shrink-0 font-semibold tabular-nums",
            strong
              ? "text-[var(--tier-strong)]"
              : "text-[var(--nourish-subtext)]",
          )}
        >
          {p != null ? `${p}%` : `${fmtAmount(row.value)} ${row.unit}`}
        </span>
      </div>
      <span className="block h-1.5 overflow-hidden rounded-full bg-[var(--nourish-border)]">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${p != null ? Math.min(100, p) : 0}%`,
            backgroundColor: strong
              ? "var(--tier-strong)"
              : good
                ? "var(--nourish-light-green)"
                : "var(--nourish-subtext-faint)",
          }}
        />
      </span>
    </div>
  );
}

export function NutritionRingCard({
  nutrition,
  servings = 1,
  coverage,
  className,
  compact = false,
}: {
  nutrition: PerServingNutrition;
  /** Servings being made — scales the absolute totals shown so the cook slider
   *  visibly drives the ring. Per-serving values are invariant by design, so
   *  without this the ring would never move. */
  servings?: number;
  /** Ingredient coverage (W35) — how many of the recipe's ingredients were
   *  actually counted. Shown in the footnote so a partial total is honest. */
  coverage?: { massed: number; total: number };
  className?: string;
  /** Phase 1 — glance mode: ring + macro legend + servings line + footnote only.
   *  Skips the Nutrient-dense badge, Daily targets, Key nutrients, and the full
   *  breakdown (the Sous-read glance owns those). Default false = unchanged. */
  compact?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);

  const mult = Math.max(1, servings);
  // Per-serving values drive the macro PROPORTIONS (ring arcs are ratios — they
  // don't change with batch size); the slider scales the absolute totals shown.
  const proteinBase = nutrition.protein_g ?? 0;
  const carbsBase = nutrition.totalCarbs_g ?? 0;
  const fatBase = nutrition.totalFat_g ?? 0;
  const protein = proteinBase * mult;
  const carbs = carbsBase * mult;
  const fat = fatBase * mult;
  const calories = nutrition.calories * mult;
  const pCal = proteinBase * MACRO.protein.kcalPerG;
  const cCal = carbsBase * MACRO.carbs.kcalPerG;
  const fCal = fatBase * MACRO.fat.kcalPerG;
  const totalMacroCal = pCal + cCal + fCal || 1;
  const shares = {
    protein: pCal / totalMacroCal,
    carbs: cCal / totalMacroCal,
    fat: fCal / totalMacroCal,
  };
  const rows = buildRows(nutrition, mult);
  // Headline macros live in the ring + Daily targets; exclude them from the
  // micronutrient highlight.
  const HEADLINE = new Set([
    "calories",
    "protein_g",
    "totalCarbs_g",
    "totalFat_g",
  ]);
  const keyRows = rows
    .filter((r) => r.dv != null && r.value > 0 && !HEADLINE.has(r.key))
    .sort((a, b) => pct(b.value, b.dv!) - pct(a.value, a.dv!))
    .slice(0, 4);
  const groupedRows = NUTRIENT_GROUP_ORDER.map((g) => ({
    group: g,
    items: rows.filter((r) => r.group === g),
  })).filter((g) => g.items.length > 0);
  // Protein completeness (DIAAS-lite) — invariant to servings.
  const pq = proteinQuality(nutrition);
  // W35: the footnote tells the truth about data completeness. Coverage (how
  // many of the recipe's ingredients were actually counted) is the variable,
  // informative signal — most dishes have a few unmapped ingredients that
  // undercount the totals. Confidence is the fallback (uniformly USDA-mapped).
  const sourcePhrase =
    coverage && coverage.massed < coverage.total
      ? `from ${coverage.massed} of ${coverage.total} ingredients`
      : nutrition.confidence === "approximated"
        ? "composed from USDA data, some ingredients estimated"
        : "composed from USDA ingredient data";

  const legend: Array<["protein" | "carbs" | "fat", number]> = [
    ["protein", protein],
    ["carbs", carbs],
    ["fat", fat],
  ];

  return (
    <div className={cn("space-y-5", className)}>
      {/* Energy summary — ring + macro legend (totals for the chosen servings). */}
      <div className="flex items-center gap-4">
        <MacroRing calories={calories} shares={shares} />
        <div className="min-w-0 flex-1 space-y-1.5">
          {legend.map(([k, grams]) => (
            <p key={k} className="text-[15px]">
              <span style={{ color: MACRO[k].color }} className="font-medium">
                {MACRO[k].label} ({Math.round(shares[k] * 100)}%)
              </span>{" "}
              <span className="font-semibold text-[var(--nourish-dark)]">
                {grams.toFixed(1)}g
              </span>
            </p>
          ))}
        </div>
      </div>

      {/* When making more than one serving, anchor the per-plate number. */}
      {mult > 1 && (
        <p className="-mt-2 text-[12px] text-[var(--nourish-subtext)]">
          For {Math.round(mult)} servings ·{" "}
          <span className="font-semibold text-[var(--nourish-dark)]">
            {Math.round(nutrition.calories)} kcal
          </span>{" "}
          per serving
        </p>
      )}

      {/* W24: lots of micronutrients per calorie — a quiet quality cue. (Hidden
          in compact/glance mode; the Sous-read facet owns it there.) */}
      {!compact && isNutrientDense(nutrition) && (
        <span className="inline-flex w-fit rounded-full bg-[var(--tier-strong)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--tier-strong)]">
          Nutrient-dense
        </span>
      )}

      {/* Macronutrient targets — vs FDA daily value. */}
      {!compact && (
        <div className="space-y-3">
          <p className="sous-label" style={{ color: "var(--data-protein)" }}>
            Daily targets
          </p>
          <TargetRow
            label="Energy"
            value={calories}
            target={MACRO_DV.energy}
            unit="kcal"
          />
          <TargetRow
            label="Protein"
            value={protein}
            target={MACRO_DV.protein}
            unit="g"
            color={MACRO.protein.color}
          />
          <TargetRow
            label="Carbs"
            value={carbs}
            target={MACRO_DV.carbs}
            unit="g"
            color={MACRO.carbs.color}
          />
          <TargetRow
            label="Fat"
            value={fat}
            target={MACRO_DV.fat}
            unit="g"
            color={MACRO.fat.color}
          />
        </div>
      )}

      {/* Key micronutrients. */}
      {!compact && keyRows.length > 0 && (
        <div className="space-y-3">
          <p className="sous-label" style={{ color: "var(--data-protein)" }}>
            Key nutrients
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {keyRows.map((row) => (
              <NutrientBar key={row.key} row={row} />
            ))}
          </div>
        </div>
      )}

      {/* Expandable complete nutrient summary — every composed nutrient,
          grouped (General · Carbs · Fats · Protein · Vitamins · Minerals). */}
      {!compact && groupedRows.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            aria-expanded={showAll}
            className="flex w-full items-center justify-between py-1 text-[13px] font-medium text-[var(--nourish-subtext)] transition-colors hover:text-[var(--nourish-dark)]"
          >
            {showAll ? "Hide full breakdown" : "Complete nutrient summary"}
            <ChevronDown
              size={15}
              className={cn("transition-transform", showAll && "rotate-180")}
              aria-hidden
            />
          </button>
          {showAll && (
            <div className="mt-3 space-y-4">
              {groupedRows.map(({ group, items }) => (
                <div key={group} className="space-y-2.5">
                  <p
                    className="sous-label flex items-center gap-1.5"
                    style={{ color: "var(--grocery-cat)" }}
                  >
                    {group}
                    {group === "Protein" && pq && (
                      <span
                        className="text-[11px] font-medium normal-case tracking-normal"
                        style={{
                          color: pq.complete
                            ? "var(--tier-strong)"
                            : "var(--nourish-subtext)",
                        }}
                      >
                        {pq.complete
                          ? "· complete protein"
                          : `· limited by ${pq.limiting}`}
                      </span>
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {items.map((row) => (
                      <NutrientBar key={row.key} row={row} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] leading-snug text-[var(--nourish-subtext-faint)]">
        {mult > 1 ? `Totals for ${Math.round(mult)} servings` : "Per serving"} ·{" "}
        {sourcePhrase} · % of FDA Daily Value · an estimate.
      </p>
    </div>
  );
}
