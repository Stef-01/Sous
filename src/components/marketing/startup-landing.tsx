"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  containerStagger,
  fadeUpItem,
  fadeUpTight,
  viewportOnce,
  easeOutExpo,
} from "./startup-landing-variants";
import type { CatalogStats } from "./diet-journey-comparison";
import { LandingHeroChart } from "./landing-hero-chart";

// Below-the-fold modules are loaded lazily on the client to improve LCP on the
// marketing page. Each lands with a subtle opacity-only fade once intersected,
// so there is no layout shift during hydration.
const AppPreviewSection = dynamic(
  () =>
    import("./app-preview-section").then((mod) => ({
      default: mod.AppPreviewSection,
    })),
  { ssr: false, loading: () => <div className="min-h-[40vh]" /> },
);
const TrustStrip = dynamic(
  () => import("./trust-strip").then((mod) => ({ default: mod.TrustStrip })),
  { ssr: false, loading: () => <div className="min-h-[20vh]" /> },
);
const DietJourneyComparison = dynamic(
  () =>
    import("./diet-journey-comparison").then((mod) => ({
      default: mod.DietJourneyComparison,
    })),
  { ssr: false, loading: () => <div className="min-h-[50vh]" /> },
);

/** ----------------------------------------------------------------------
 * Sous  -  editorial landing.
 *
 * Principles:
 *  - Typography does the work. No bordered cards, no blocks, no slabs.
 *  - Every section earns its space with a novel visual moment  -  a tally,
 *    a meter, a week strip, a trajectory  -  rendered as type, not chart.
 *  - Strategic claims (moat-shaped, network-effect-shaped) are never
 *    stated. They hide under hover on specific words, phrased as quiet
 *    sensory observations. Readers who look closely are rewarded; the
 *    page never pitches.
 * -------------------------------------------------------------------- */

/* ======================================================================
 * Primitives
 * ==================================================================== */

/** Inline word with a hairline underline that reveals a margin note on hover/focus. */
function Aside({ label, children }: { label: string; children: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
    >
      <span className="border-b border-dotted border-[#b5bac1] text-[#1a1a1a] transition-colors duration-200 hover:text-[#2d5a3d] focus:text-[#2d5a3d]">
        {label}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            role="note"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.22, ease: easeOutExpo }}
            className="absolute left-1/2 top-full z-30 mt-3 w-[min(86vw,320px)] -translate-x-1/2 rounded-[14px] border border-[#e8eaef] bg-white px-4 py-3 text-left text-[13px] font-normal leading-[1.6] tracking-normal text-[#4b5563] shadow-[0_14px_32px_rgba(15,20,28,0.10)]"
          >
            <span
              aria-hidden
              className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-[#e8eaef] bg-white"
            />
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <motion.p
      variants={fadeUpTight}
      className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#9aa0a6]"
    >
      {children}
    </motion.p>
  );
}

function Rule() {
  return (
    <div className="mx-auto max-w-[1040px] px-6 md:px-10">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.1, ease: easeOutExpo }}
        className="h-px origin-left bg-[#e5e7eb]"
      />
    </div>
  );
}

/* ======================================================================
 * Novel moment #1  -  Saved / Cooked tally
 * Typographic dot-tally. The gap is the insight.
 * ==================================================================== */

function Tally() {
  const reduceMotion = useReducedMotion();
  const saved = 7;
  const cooked = 2;
  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={containerStagger}
      className="grid max-w-[520px] grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-4 font-mono text-[13px] tracking-tight text-[#0d0d0d] md:text-[14px]"
    >
      <motion.span
        variants={fadeUpTight}
        className="text-[11px] uppercase tracking-[0.22em] text-[#9aa0a6]"
      >
        Saved
      </motion.span>
      <motion.div variants={fadeUpTight} className="flex items-center gap-1.5">
        {Array.from({ length: saved }).map((_, idx) => (
          <motion.span
            key={`s-${idx}`}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={viewportOnce}
            transition={{
              delay: 0.25 + idx * 0.06,
              duration: 0.35,
              ease: easeOutExpo,
            }}
            className="h-2 w-2 rounded-full bg-[#d8dbe0]"
          />
        ))}
      </motion.div>
      <motion.span
        variants={fadeUpTight}
        className="text-right text-[12px] text-[#6b6b6b]"
      >
        seven dinners
      </motion.span>

      <motion.span
        variants={fadeUpTight}
        className="text-[11px] uppercase tracking-[0.22em] text-[#9aa0a6]"
      >
        Cooked
      </motion.span>
      <motion.div variants={fadeUpTight} className="flex items-center gap-1.5">
        {Array.from({ length: saved }).map((_, idx) => (
          <motion.span
            key={`c-${idx}`}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{
              scale: 1,
              opacity: 1,
            }}
            viewport={viewportOnce}
            transition={{
              delay: 0.7 + idx * 0.06,
              duration: 0.4,
              ease: easeOutExpo,
            }}
            className={cn(
              "h-2 w-2 rounded-full",
              idx < cooked
                ? "bg-[#2d5a3d]"
                : "border border-[#d8dbe0] bg-transparent",
            )}
          />
        ))}
      </motion.div>
      <motion.span
        variants={fadeUpTight}
        className="text-right text-[12px] text-[#6b6b6b]"
      >
        two
      </motion.span>
    </motion.div>
  );
}

/* ======================================================================
 * Novel moment #3  -  Six-axis meter
 * The pairing logic, as a set of thin animated bars.
 * ==================================================================== */

const AXES: { label: string; value: number; note: string }[] = [
  { label: "Cuisine fit", value: 0.94, note: "Thai ↔ Thai" },
  { label: "Flavor contrast", value: 0.88, note: "rich ↔ sharp, cold" },
  { label: "Nutrition balance", value: 0.72, note: "adds fiber, fresh greens" },
  { label: "Prep burden", value: 0.86, note: "five minutes, one bowl" },
  { label: "Temperature", value: 0.81, note: "hot bowl, cool side" },
  { label: "Your taste", value: 0.79, note: "based on your last 30 cooks" },
];

function AxisMeter() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={containerStagger}
      className="grid gap-y-3 md:grid-cols-2 md:gap-x-10"
    >
      {AXES.map((a) => (
        <motion.div
          key={a.label}
          variants={fadeUpTight}
          className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#0d0d0d]">{a.label}</p>
            <p className="mt-0.5 text-[12px] leading-[1.5] text-[#6b6b6b]">
              {a.note}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-[2px] w-[120px] overflow-hidden rounded-full bg-[#ececee]">
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: a.value }}
                viewport={viewportOnce}
                transition={{
                  duration: 1.1,
                  ease: easeOutExpo,
                  delay: 0.15,
                }}
                className="block h-full origin-left bg-[#2d5a3d]"
              />
            </span>
            <span className="w-8 text-right font-mono text-[11px] tabular-nums text-[#9aa0a6]">
              {a.value.toFixed(2)}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ======================================================================
 * Novel moment #4  -  Trajectory
 * Three dots on a hairline, showing the arc from weeknight to hosting.
 * ==================================================================== */

const ARC = [
  { x: 0.08, y: 0.72, month: "Week 1", note: "first pad thai" },
  { x: 0.48, y: 0.46, month: "Month 3", note: "plating, mostly on the plate" },
  { x: 0.9, y: 0.2, month: "Month 9", note: "a dinner you\u2019d host" },
];

function TrajectoryArc() {
  return (
    <motion.figure
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={containerStagger}
      className="mt-10 max-w-[640px]"
    >
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-[120px] w-full"
        aria-hidden
      >
        <motion.path
          d="M 8 32  C 28 28, 44 22, 48 18  S 76 8, 90 8"
          stroke="#d8dbe0"
          strokeWidth="0.3"
          strokeDasharray="0.6 0.9"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.6, ease: easeOutExpo }}
        />
        {ARC.map((p, idx) => {
          const cx = p.x * 100;
          const cy = p.y * 40;
          const r = idx === ARC.length - 1 ? 1.4 : 1;
          const label = `${p.month}: ${p.note}`;
          return (
            <g key={p.month}>
              {/* Wide invisible hit target so hover titles work at real viewport sizes */}
              <circle
                cx={cx}
                cy={cy}
                r="5"
                fill="transparent"
                pointerEvents="all"
              >
                <title>{label}</title>
              </circle>
              <motion.circle
                cx={cx}
                cy={cy}
                r={r}
                fill={idx === ARC.length - 1 ? "#2d5a3d" : "#0d0d0d"}
                pointerEvents="none"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={viewportOnce}
                transition={{
                  delay: 0.4 + idx * 0.25,
                  duration: 0.4,
                  ease: easeOutExpo,
                }}
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 grid grid-cols-3 gap-6">
        {ARC.map((p) => (
          <motion.figcaption
            key={p.month}
            variants={fadeUpTight}
            className="text-left"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#9aa0a6]">
              {p.month}
            </p>
            <p className="mt-1 text-[12px] leading-[1.55] text-[#4b5563]">
              {p.note}
            </p>
          </motion.figcaption>
        ))}
      </div>
    </motion.figure>
  );
}

/* ======================================================================
 * Page
 * ==================================================================== */

export function StartupLanding({
  catalogStats,
}: {
  catalogStats: CatalogStats;
}) {
  const reduceMotion = useReducedMotion();
  const [headerElevated, setHeaderElevated] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  const { scrollY, scrollYProgress } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    setHeaderElevated(y > 8);
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroLift = useTransform(
    heroProgress,
    [0, 1],
    [0, reduceMotion ? 0 : -20],
  );
  const heroFade = useTransform(heroProgress, [0, 0.85], [1, 0.6]);

  return (
    <div className="bg-[#fdfdfc] text-[#1a1a1a] antialiased [scroll-behavior:smooth]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#1a3d25] focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Scroll-progress hairline */}
      <motion.div
        aria-hidden
        className="fixed left-0 right-0 top-0 z-[60] h-px origin-left bg-[#2d5a3d]/70"
        style={{ width: progressWidth }}
      />

      {/* ============================================================
          HEADER  -  serif wordmark, minimal nav, single CTA.
         ============================================================ */}
      <motion.header
        className={cn(
          "sticky top-0 z-50 transition-[background,border-color] duration-300",
          headerElevated
            ? "border-b border-[#eceef2] bg-[#fdfdfc]/94 backdrop-blur-sm"
            : "border-b border-transparent bg-[#fdfdfc]/80",
        )}
      >
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-6 py-5 md:px-10">
          <Link
            href="/"
            className="font-serif text-[22px] leading-none tracking-tight text-[#0d0d0d]"
            aria-label="Sous home"
          >
            Sous
          </Link>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-8 text-[13px] text-[#6b6b6b] md:flex"
          >
            <a href="#truth" className="transition-colors hover:text-[#0d0d0d]">
              Approach
            </a>
            <a href="#idea" className="transition-colors hover:text-[#0d0d0d]">
              The gap
            </a>
            <a href="#arc" className="transition-colors hover:text-[#0d0d0d]">
              Practice
            </a>
          </nav>
          <Link
            href="/today"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#0d0d0d]/10 bg-[#0d0d0d] px-4 py-2 text-[13px] font-medium text-white transition-transform duration-200 hover:translate-y-[-1px] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5a3d] focus-visible:ring-offset-2"
          >
            Open the demo
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </motion.header>

      <main id="main">
        {/* Hero: headline + illustrative chart (first screenful) */}
        <motion.section
          ref={heroRef}
          style={{ y: heroLift, opacity: heroFade }}
          className="relative px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-20"
        >
          <div className="mx-auto max-w-[920px]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerStagger}
              className="text-center"
            >
              <Eyebrow>An app for cooking at home</Eyebrow>

              <motion.h1
                variants={fadeUpItem}
                className="mt-5 text-balance font-serif text-[clamp(2.4rem,9vw,4.25rem)] leading-[1.02] tracking-[-0.03em] text-[#0d0d0d]"
              >
                You don&rsquo;t need more{" "}
                <span className="italic text-[#2d5a3d]">recipes</span>.
              </motion.h1>

              <motion.p
                variants={fadeUpItem}
                className="mx-auto mt-6 max-w-[34ch] font-serif text-[1.35rem] leading-snug tracking-tight text-[#1a1a1a] md:text-[1.6rem]"
              >
                Make your diet work for you, not the perfect diet on paper.{" "}
                <span className="text-[#2d5a3d]">Your</span> perfect diet.
              </motion.p>
            </motion.div>

            <LandingHeroChart className="mx-auto mt-10 max-w-[640px] md:mt-12" />

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUpItem}
              className="mx-auto mt-8 max-w-[40ch] text-center text-[15px] leading-relaxed text-[#6b7280]"
            >
              One main, three pairings, one short cook flow. No feed, no endless
              scroll.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55, ease: easeOutExpo }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
              <Link
                href="/today"
                className="group inline-flex items-center gap-2 rounded-full bg-[#0d0d0d] px-6 py-3.5 text-[14px] font-medium text-white transition-all duration-200 hover:translate-y-[-1px] hover:bg-[#1a1a1a] hover:shadow-[0_12px_28px_-10px_rgba(13,13,13,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5a3d] focus-visible:ring-offset-2"
              >
                Try it tonight
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={1.8}
                  aria-hidden
                />
              </Link>
              <a
                href="#idea"
                className="group inline-flex items-baseline gap-2 text-[14px] font-medium text-[#1a1a1a] transition-colors hover:text-[#2d5a3d]"
              >
                Why Sous
                <span
                  aria-hidden
                  className="inline-block h-px w-6 translate-y-[-3px] bg-[#1a1a1a] transition-all duration-300 group-hover:w-10 group-hover:bg-[#2d5a3d]"
                />
              </a>
            </motion.div>
          </div>
        </motion.section>

        <Rule />

        <DietJourneyComparison stats={catalogStats} />

        <Rule />

        {/* ==========================================================
            IDEA  -  "Saved six, cooked two"  -  the gap is the product.
            Novel moment: typographic tally.
           ========================================================= */}
        <section
          id="idea"
          className="scroll-mt-[80px] px-6 py-20 md:px-10 md:py-24"
        >
          <div className="mx-auto max-w-[1160px]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={containerStagger}
              className="grid gap-12 md:grid-cols-12"
            >
              <div className="md:col-span-3">
                <Eyebrow>The gap</Eyebrow>
              </div>
              <div className="md:col-span-9">
                <motion.h2
                  variants={fadeUpItem}
                  className="font-serif text-[40px] leading-[1.04] tracking-tight text-[#0d0d0d] md:text-[64px]"
                >
                  Saved six.
                  <br />
                  <span className="text-[#4b5563]">Cooked two.</span>
                </motion.h2>

                <motion.div variants={fadeUpItem} className="mt-10">
                  <Tally />
                </motion.div>

                <motion.p
                  variants={fadeUpItem}
                  className="mt-12 max-w-[56ch] text-[17px] leading-[1.75] text-[#374151] md:text-[18px]"
                >
                  The feed gives you ten thousand good ideas and zero answers
                  for <span className="italic">tonight</span>. The gap between
                  what you saved and what you cooked is where the week goes
                  sideways.
                </motion.p>
                <motion.p
                  variants={fadeUpItem}
                  className="mt-5 max-w-[56ch] text-[17px] leading-[1.75] text-[#374151] md:text-[18px]"
                >
                  Sous starts after the idea: a craving, a photo, a half-empty
                  pantry, and ends at the plate. One short sequence, every time.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </section>

        <Rule />

        <AppPreviewSection />

        <Rule />

        {/* ==========================================================
            PAIRING  -  "How it decides."
            Novel moment: six-axis meter rendered as editorial type.
           ========================================================= */}
        <section
          id="pairing"
          className="scroll-mt-[80px] px-6 py-20 md:px-10 md:py-24"
        >
          <div className="mx-auto max-w-[1160px]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={containerStagger}
              className="grid gap-12 md:grid-cols-12"
            >
              <div className="md:col-span-5">
                <Eyebrow>How it decides</Eyebrow>
                <motion.h2
                  variants={fadeUpItem}
                  className="mt-6 font-serif text-[40px] leading-[1.04] tracking-tight text-[#0d0d0d] md:text-[60px]"
                >
                  Six axes.
                  <br />
                  One short list.
                </motion.h2>
                <motion.p
                  variants={fadeUpItem}
                  className="mt-8 max-w-[36ch] text-[16px] leading-[1.75] text-[#374151] md:text-[17px]"
                >
                  No feed-guessing. Every candidate is scored on six dimensions,
                  and the top three ship. Deterministic: same inputs, same
                  picks. The inputs include everything you&rsquo;ve{" "}
                  <Aside label="actually cooked">
                    What you&rsquo;ve cooked is a better signal than what
                    you&rsquo;ve saved. The more you cook, the less guessing the
                    short list has to do; it starts to feel like cooking with
                    someone who knows your kitchen.
                  </Aside>
                  .
                </motion.p>
              </div>

              <div className="md:col-span-7 md:mt-3">
                <motion.div variants={fadeUpItem}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-[#eceef2] pb-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#9aa0a6]">
                        Tonight
                      </p>
                      <p className="mt-1 font-serif text-[22px] leading-tight tracking-tight text-[#0d0d0d] md:text-[26px]">
                        Pad thai, tofu and egg
                        <span className="ml-2 text-[#9aa0a6]">·</span>{" "}
                        <span className="font-sans text-[13px] font-medium text-[#2d5a3d]">
                          + som tum
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#9aa0a6]">
                      0.42s
                    </span>
                  </div>
                  <div className="mt-6">
                    <AxisMeter />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <Rule />

        {/* ==========================================================
            ARC  -  "Cooking that looks like practice."
            Novel moment: three-dot trajectory arc.
           ========================================================= */}
        <section
          id="arc"
          className="scroll-mt-[80px] px-6 py-20 md:px-10 md:py-24"
        >
          <div className="mx-auto max-w-[1160px]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={containerStagger}
              className="grid gap-12 md:grid-cols-12"
            >
              <div className="md:col-span-3">
                <Eyebrow>The slow payoff</Eyebrow>
              </div>

              <div className="md:col-span-9">
                <motion.h2
                  variants={fadeUpItem}
                  className="font-serif text-[40px] leading-[1.04] tracking-tight text-[#0d0d0d] md:text-[60px]"
                >
                  Cooking that looks
                  <br />
                  like <span className="italic">practice</span>,
                  <br />
                  <span className="text-[#4b5563]">not a feed.</span>
                </motion.h2>

                <motion.p
                  variants={fadeUpItem}
                  className="mt-8 max-w-[56ch] text-[17px] leading-[1.75] text-[#374151] md:text-[18px]"
                >
                  Every finished plate joins a{" "}
                  <Aside label="scrapbook">
                    Private by default. Shared between cooking friends, it
                    slowly becomes the only food feed you want to open, because
                    it is only people you actually trust with dinner.
                  </Aside>{" "}
                  with plating notes and the techniques you&rsquo;ve used. Six
                  months in, you can see the arc: not as a number, as the plates
                  themselves.
                </motion.p>

                <TrajectoryArc />
              </div>
            </motion.div>
          </div>
        </section>

        <Rule />

        {/* ==========================================================
            TRUST  -  editorial dotted strip + Stanford line.
           ========================================================= */}
        <TrustStrip />

        {/* ==========================================================
            CLOSER  -  "Try it tonight." Confident, minimal.
           ========================================================= */}
        <section className="px-6 pb-28 pt-8 md:px-10 md:pb-40">
          <div className="mx-auto max-w-[1160px]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={containerStagger}
              className="border-t border-[#eceef2] pt-20"
            >
              <motion.h2
                variants={fadeUpItem}
                className="font-serif text-[48px] leading-[0.98] tracking-[-0.025em] text-[#0d0d0d] md:text-[96px]"
              >
                Try it
                <br />
                <span className="italic text-[#2d5a3d]">tonight.</span>
              </motion.h2>

              <motion.div
                variants={fadeUpItem}
                className="mt-10 grid gap-6 md:grid-cols-12 md:items-end"
              >
                <p className="text-[16px] leading-[1.72] text-[#4b5563] md:col-span-6 md:text-[17px]">
                  The demo is the product: a craving, three pairings, a short
                  cook flow. Five minutes, no signup.
                </p>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-6 md:justify-end">
                  <Link
                    href="/today"
                    className="group inline-flex items-center gap-2 rounded-full bg-[#0d0d0d] px-7 py-4 text-[15px] font-medium text-white transition-all duration-200 hover:translate-y-[-1px] hover:bg-[#1a1a1a] hover:shadow-[0_16px_32px_-12px_rgba(13,13,13,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5a3d] focus-visible:ring-offset-2"
                  >
                    Open the demo
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-[-2px]"
                      strokeWidth={1.8}
                      aria-hidden
                    />
                  </Link>
                  <Link
                    href="/path"
                    className="group inline-flex items-baseline gap-2 text-[14px] font-medium text-[#1a1a1a] transition-colors hover:text-[#2d5a3d]"
                  >
                    See the practice path
                    <span
                      aria-hidden
                      className="inline-block h-px w-6 translate-y-[-3px] bg-[#1a1a1a] transition-all duration-300 group-hover:w-10 group-hover:bg-[#2d5a3d]"
                    />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ============================================================
          FOOTER  -  minimal, colophon-style.
         ============================================================ */}
      <footer className="border-t border-[#eceef2] px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-4 text-[13px] text-[#6b6b6b] md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-[18px] text-[#0d0d0d]">Sous</p>
          <p className="max-w-[46ch] leading-[1.6]">
            An app for home cooks who are tired of the feed. The landing is a
            description; the demo is the thing.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/today"
              className="text-[#1a1a1a] underline-offset-4 transition-colors hover:text-[#2d5a3d] hover:underline"
            >
              Demo
            </Link>
            <Link
              href="/path"
              className="text-[#1a1a1a] underline-offset-4 transition-colors hover:text-[#2d5a3d] hover:underline"
            >
              Path
            </Link>
            <Link
              href="/path/scrapbook"
              className="text-[#1a1a1a] underline-offset-4 transition-colors hover:text-[#2d5a3d] hover:underline"
            >
              Scrapbook
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
