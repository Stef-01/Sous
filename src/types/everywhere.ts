import { z } from "zod";

/**
 * Sous Everywhere — schemas for the ecosystem surfaces (the widget JSON
 * contract + the wallpaper-render params). Zod is the source of truth; the
 * API routes validate against these and the (future) native widget/watch poll
 * the same `/api/widget/today` shape.
 */

export const mealDaypartSchema = z.enum(["breakfast", "lunch", "dinner"]);
export type MealDaypartT = z.infer<typeof mealDaypartSchema>;

/** The single contract `/api/widget/today` returns — the one feed every
 *  ambient surface (wallpaper, gallery, future native widget) consumes. */
export const widgetTodaySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().nullable(),
  deepLink: z.string().min(1),
  daypart: mealDaypartSchema,
});
export type WidgetToday = z.infer<typeof widgetTodaySchema>;

/** Wallpaper dimensions, clamped to a sane device range (defaults ≈ iPhone). */
export const wallpaperParamsSchema = z.object({
  w: z.coerce.number().int().min(320).max(2160).default(1179),
  h: z.coerce.number().int().min(320).max(3840).default(2556),
});
export type WallpaperParams = z.infer<typeof wallpaperParamsSchema>;

/** A surface's build status on the rule-12 ladder. */
export const surfaceStatusSchema = z.enum(["live", "stub", "soon"]);
export type SurfaceStatus = z.infer<typeof surfaceStatusSchema>;
