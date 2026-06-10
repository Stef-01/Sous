/**
 * Diary export (#13) — the clinician-shareable CSV: one row per entry with the
 * SAME per-serving resolution the day ring uses (composed USDA vectors,
 * coverage-gated; branded foods use their embedded label data), plus a daily
 * TOTAL row. Pure + deterministic so it's unit-testable; the page wraps it in
 * a Blob download.
 */

import {
  aggregateDay,
  dayKey,
  type DiaryEntry,
} from "@/lib/hooks/use-nutrition-diary";

type DiaryStore = Record<string, DiaryEntry[]>;

function csvEscape(s: string): string {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function fmt(v: number | undefined): string {
  return v == null ? "" : (Math.round(v * 10) / 10).toString();
}

export function buildDiaryCsv(
  store: DiaryStore,
  daysBack = 7,
  now: Date = new Date(),
): string {
  const lines: string[] = [
    "date,item,brand,servings,source,kcal,protein_g,carbs_g,fat_g",
  ];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const entries = store[key] ?? [];
    for (const e of entries) {
      // Per-entry nutrition = the entry aggregated alone (same resolution
      // path as the ring, scaled by its servings).
      const n = aggregateDay([e]);
      lines.push(
        [
          key,
          csvEscape(e.name),
          csvEscape(e.brand ?? ""),
          String(e.servings),
          e.brand ? "label" : e.auto ? "cooked" : "logged",
          fmt(n?.calories),
          fmt(n?.protein_g),
          fmt(n?.totalCarbs_g),
          fmt(n?.totalFat_g),
        ].join(","),
      );
    }
    if (entries.length > 0) {
      const total = aggregateDay(entries);
      lines.push(
        [
          key,
          "TOTAL",
          "",
          "",
          "",
          fmt(total?.calories),
          fmt(total?.protein_g),
          fmt(total?.totalCarbs_g),
          fmt(total?.totalFat_g),
        ].join(","),
      );
    }
  }
  return lines.join("\n");
}
