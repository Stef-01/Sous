"use client";

/**
 * FoodGlyph — a single-file registry of line-art food icons used as UI chrome
 * (planning.md §6.2 W2). They replace the "ugly emoji" fallbacks across the
 * app (cuisine card fallbacks, planner/grocery/journey thumbnails) with a
 * consistent, currentColor-tinted set in the same visual grammar:
 *   24×24 viewBox · stroke 1.75 · round caps + joins · no fill.
 *
 * These are inline-SVG UI chrome (precedent: pet `pixel-icons.tsx`), NOT dish
 * imagery — the food_images pipeline (rules 7/11) is untouched.
 *
 * Provenance: glyphs marked `(lucide)` vendor path data from lucide-react
 * (v0.460.0, ISC license — https://lucide.dev) so the standard shapes match a
 * battle-tested icon set; the cuisine- and dish-type glyphs lucide lacks (sushi,
 * taco, takeout, pho, noodles, curry, rice, bread, pizza, burger, bowl,
 * dumpling) are authored here in the same grammar. Each glyph is visually
 * verified at render size.
 */

import type { SVGProps } from "react";
import { getDishGlyph } from "@/lib/utils/dish-glyph";
import { getDishEmoji } from "@/lib/utils/dish-emoji";

export type FoodGlyphName =
  // standard shapes (lucide ISC)
  | "soup"
  | "salad"
  | "fish"
  | "beef"
  | "drumstick"
  | "dessert"
  | "flame"
  | "utensils"
  | "pot"
  | "egg"
  // cuisine-specific (authored)
  | "sushi"
  | "noodles"
  | "takeout"
  | "pho"
  | "curry"
  | "pasta"
  | "taco"
  | "rice"
  | "bread"
  // dish-type (authored) — give image-less Western + bowl dishes their own read
  | "pizza"
  | "burger"
  | "bowl"
  | "dumpling";

/** A primitive SVG element: [tag, attributes]. Mirrors lucide's data shape so
 *  vendored glyphs can be pasted verbatim and the renderer stays trivial. */
type GlyphPart = readonly [
  "path" | "circle" | "ellipse" | "line" | "rect",
  Readonly<Record<string, string | number>>,
];

const p = (d: string): GlyphPart => ["path", { d }];

/** Reusable bowl body (lucide `soup`) — rim at y≈12, foot at y≈21. Shared by
 *  every bowl-based cuisine glyph so they read as one family. */
const BOWL: GlyphPart[] = [
  p("M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"),
  p("M7 21h10"),
];

export const FOOD_GLYPHS: Record<FoodGlyphName, GlyphPart[]> = {
  // ── standard shapes (lucide ISC, path data vendored verbatim) ──────────
  soup: [
    ...BOWL,
    p("M19.5 12 22 6"),
    p(
      "M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62",
    ),
    p(
      "M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62",
    ),
    p(
      "M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62",
    ),
  ],
  salad: [
    p("M7 21h10"),
    p("M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"),
    p(
      "M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1",
    ),
    p("m13 12 4-4"),
    p("M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"),
  ],
  fish: [
    p(
      "M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z",
    ),
    p("M18 12v.5"),
    p("M16 17.93a9.77 9.77 0 0 1 0-11.86"),
    p(
      "M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33",
    ),
    p("M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"),
    p("m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"),
  ],
  beef: [
    ["circle", { cx: 12.5, cy: 8.5, r: 2.5 }],
    p(
      "M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z",
    ),
    p(
      "m18.5 6 2.19 4.5a6.48 6.48 0 0 1 .31 2 6.49 6.49 0 0 1-2.6 5.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5",
    ),
  ],
  drumstick: [
    p("M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23"),
    p(
      "m8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59",
    ),
  ],
  dessert: [
    ["circle", { cx: 12, cy: 4, r: 2 }],
    p(
      "M10.2 3.2C5.5 4 2 8.1 2 13a2 2 0 0 0 4 0v-1a2 2 0 0 1 4 0v4a2 2 0 0 0 4 0v-4a2 2 0 0 1 4 0v1a2 2 0 0 0 4 0c0-4.9-3.5-9-8.2-9.8",
    ),
    p("M3.2 14.8a9 9 0 0 0 17.6 0"),
  ],
  flame: [
    p(
      "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
    ),
  ],
  utensils: [
    p("m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"),
    p(
      "M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7",
    ),
    p("m2.1 21.8 6.4-6.3"),
    p("m19 5-7 7"),
  ],
  pot: [
    p("M2 12h20"),
    p("M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"),
    p("m4 8 16-4"),
    p(
      "m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8",
    ),
  ],
  egg: [
    ["circle", { cx: 11.5, cy: 12.5, r: 3.5 }],
    p(
      "M3 8c0-3.5 2.5-6 6.5-6 5 0 4.83 3 7.5 5s5 2 5 6c0 4.5-2.5 6.5-7 6.5-2.5 0-2.5 2.5-6 2.5s-7-2-7-5.5c0-3 1.5-3 1.5-5C3.5 10 3 9 3 8Z",
    ),
  ],

  // ── cuisine-specific (authored in the same grammar) ────────────────────

  /** Nigiri — a rice pillow under a draped fish fillet with a stripe. (japanese) */
  sushi: [
    p("M5.5 15h13a1.8 1.8 0 0 1 0 3.6h-13a1.8 1.8 0 0 1 0-3.6Z"),
    p("M4.6 15c0-2.2 3.3-3.8 7.4-3.8s7.4 1.6 7.4 3.8Z"),
    p("M7.5 12.8c2.2-.9 6.8-.9 9 0"),
  ],

  /** Noodle bowl with chopsticks lifting a strand + steam. (thai) */
  noodles: [
    ...BOWL,
    p("M13.7 11.6 21 4.4M15.6 12.6 22 7"),
    p("M14.4 8.3c1.4 0 1.4 1.8 2.8 1.8"),
    p("M8 9.2c.7-.8.7-1.5 0-2.3M11 9.2c.7-.8.7-1.5 0-2.3"),
  ],

  /** Oyster-pail takeout box with a wire handle. (chinese) */
  takeout: [
    p("M6 9h12l-1.2 9.6a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8Z"),
    p("M4.4 9 7.6 6h8.8l3.2 3"),
    p("M12 6v3"),
    p("M9.4 6a2.6 2.6 0 0 1 5.2 0"),
  ],

  /** Pho bowl with a soup spoon + steam. (vietnamese) */
  pho: [
    ...BOWL,
    p(
      "M15.6 11.4a2.4 2.4 0 1 1 3 3l3.1 3.1a.9.9 0 0 1-1.2 1.2l-3.1-3.1a2.4 2.4 0 0 1-1.8-4.2Z",
    ),
    p("M8 9.2c.7-.8.7-1.5 0-2.3M11.2 9.2c.7-.8.7-1.5 0-2.3"),
  ],

  /** Curry bowl with a crescent of naan on the rim. (indian) */
  curry: [
    ...BOWL,
    p("M8 14.6c1.1-1.4 2.5-1.4 3.6 0s2.5 1.4 3.6 0"),
    p("M9.6 11.3h.01M14.4 11.3h.01"),
  ],

  /** Pasta bowl with a fork twirling a noodle swirl. (italian) */
  pasta: [
    ...BOWL,
    p("M9 15a2.6 2.2 0 1 1 4.8 1"),
    p("M16.6 4.4 15.2 11.6"),
    p("M15.5 4.2 15.2 7M16.6 4.4 16.3 7M17.7 4.6 17.4 7M15 7h2.6"),
  ],

  /** Folded taco shell with filling spilling out the top. (mexican) */
  taco: [
    p("M3.5 13a8.5 7 0 0 1 17 0Z"),
    p("M3.5 13h17"),
    p(
      "M5 12.6c1.6-1.7 3-1 4.3-1 1.4 0 2-1 3.4-1s2.2 1 3.5 1c1 0 1.6-.4 2.3-.2",
    ),
  ],

  /** Heaping rice bowl with grain ticks. (rice dishes) */
  rice: [
    ...BOWL,
    p("M6.4 12c1.5-2.3 9.7-2.3 11.2 0"),
    p("M9 10.4 9.6 9.6M12 9.9l.6-.8M15 10.4l.6-.8"),
  ],

  /** Scored bread loaf. (bread / toast / baked) */
  bread: [
    p(
      "M4 14a8 5 0 0 1 16 0v.6a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 14.6Z",
    ),
    p("M8.6 11.4 7.4 13.6M12 11 10.8 13.6M15.4 11.4 14.2 13.6"),
  ],

  /** Pizza slice — crust dome over a wedge with three pepperoni. (pizza) */
  pizza: [
    p("M4 8h16l-7.18 12.02a1 1 0 0 1-1.64 0Z"),
    p("M4 8a8.5 3.4 0 0 1 16 0"),
    ["circle", { cx: 10, cy: 11.2, r: 0.9 }],
    ["circle", { cx: 13.6, cy: 11.6, r: 0.9 }],
    ["circle", { cx: 12, cy: 14.6, r: 0.9 }],
  ],

  /** Stacked burger — top bun, patty, lettuce wave, bottom bun. (burger) */
  burger: [
    p("M5 10a7 3.4 0 0 1 14 0Z"),
    p("M4.6 12.6h14.8"),
    p("M5.4 15q2 1.2 4.2 0 2.2-1.2 4.2 0 2 1.2 4 0"),
    p("M5 17a7 2.6 0 0 0 14 0"),
  ],

  /** Grain / poke bowl — the shared bowl with three toppings. (bowl) */
  bowl: [
    ...BOWL,
    ["circle", { cx: 9, cy: 14, r: 1.2 }],
    ["circle", { cx: 12.4, cy: 14.4, r: 1.2 }],
    ["circle", { cx: 15.4, cy: 13.6, r: 1 }],
  ],

  /** Pleated half-moon dumpling. (dumpling / gyoza / potsticker) */
  dumpling: [
    p("M5 15.5a7 5.2 0 0 1 14 0Z"),
    p("M5 15.5h14"),
    p("M8 15.5v-2.3M11 15.5v-3M14 15.5v-2.3"),
  ],
};

/** Stable list of every registered glyph name (used by the completeness test
 *  and any glyph-grid survey step). */
export const FOOD_GLYPH_NAMES = Object.keys(FOOD_GLYPHS) as FoodGlyphName[];

/** Narrow an arbitrary string (e.g. a survey option's `glyph`) to a registered
 *  glyph name. Lets callers render `<FoodGlyph>` only when the name is valid. */
export function isFoodGlyphName(value: unknown): value is FoodGlyphName {
  return typeof value === "string" && value in FOOD_GLYPHS;
}

export interface FoodGlyphProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: FoodGlyphName;
  /** Square px size. Default 24 (the native viewBox). */
  size?: number;
  /** Stroke width in viewBox units. Default 1.75 (the glyph grammar). */
  strokeWidth?: number;
  /** Accessible label. Omit (default) to render decoratively (aria-hidden). */
  title?: string;
}

/** Render a registered food glyph. Decorative by default; pass `title` to make
 *  it an accessible image. */
export function FoodGlyph({
  name,
  size = 24,
  strokeWidth = 1.75,
  title,
  ...rest
}: FoodGlyphProps) {
  const parts = FOOD_GLYPHS[name];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {parts.map((part, i) => {
        const [tag, attrs] = part;
        switch (tag) {
          case "circle":
            return <circle key={i} {...attrs} />;
          case "ellipse":
            return <ellipse key={i} {...attrs} />;
          case "line":
            return <line key={i} {...attrs} />;
          case "rect":
            return <rect key={i} {...attrs} />;
          default:
            return <path key={i} {...attrs} />;
        }
      })}
    </svg>
  );
}

/**
 * Dish thumbnail glyph: the line-art glyph when the dish's cuisine/type maps to
 * one, else the legacy emoji (no regression). Decorative by default.
 */
export function DishGlyph({
  tags,
  cuisine,
  size = 24,
  className,
}: {
  tags: string[];
  cuisine: string;
  size?: number;
  className?: string;
}) {
  const glyph = getDishGlyph(tags, cuisine);
  if (glyph) {
    return <FoodGlyph name={glyph} size={size} className={className} />;
  }
  return (
    <span aria-hidden className={className}>
      {getDishEmoji(tags, cuisine)}
    </span>
  );
}
