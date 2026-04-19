"use client";

import { motion } from "framer-motion";
import { ChefHat, Leaf, Video } from "lucide-react";
import {
  containerStagger,
  fadeUpItem,
  fadeUpTight,
  viewportOnce,
  easeOutExpo,
} from "./startup-landing-variants";

export type CatalogStats = {
  meals: number;
  sides: number;
};

/**
 * Illustrative dual-curve chart: typical restrictive cycle vs gradual Sous-shaped change.
 * Labeled clearly as a model — not a clinical outcome claim.
 */
function AdherenceComparisonChart() {
  return (
    <figure
      className="w-full max-w-[720px]"
      aria-labelledby="adherence-chart-title adherence-chart-desc"
    >
      <svg
        viewBox="0 0 400 200"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-labelledby="adherence-chart-title adherence-chart-desc"
      >
        <title id="adherence-chart-title">
          Illustrative comparison of diet adherence over time
        </title>
        <desc id="adherence-chart-desc">
          Two curves. A restrictive plan line rises quickly then falls. A
          gradual add-sides-first plan starts lower, dips less sharply, and ends
          higher.
        </desc>
        {/* Axes */}
        <line
          x1="48"
          y1="168"
          x2="360"
          y2="168"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <line
          x1="48"
          y1="28"
          x2="48"
          y2="168"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        {/* Grid lines (subtle) */}
        {[44, 78, 112, 146].map((y) => (
          <line
            key={y}
            x1="48"
            y1={y}
            x2="360"
            y2={y}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}
        {/* Labels */}
        <text
          x="204"
          y="194"
          textAnchor="middle"
          className="fill-[#9aa0a6] text-[10px]"
          fontSize="10"
        >
          Time (weeks) →
        </text>
        <text
          x="12"
          y="100"
          textAnchor="middle"
          className="fill-[#9aa0a6] text-[10px]"
          fontSize="10"
          transform="rotate(-90 12 100)"
        >
          Sticking with it
        </text>
        {/* Restrictive “all-in” path — spike then fade */}
        <motion.path
          d="M 56 140 Q 120 32 168 88 T 280 148 T 352 158"
          fill="none"
          stroke="#c45c5c"
          strokeWidth="2.2"
          strokeDasharray="6 5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.5, ease: easeOutExpo }}
        />
        {/* Gradual path — sides first, then mains, then rhythm */}
        <motion.path
          d="M 56 152 Q 140 148 200 120 T 320 72 L 352 56"
          fill="none"
          stroke="#2d5a3d"
          strokeWidth="2.4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.6, ease: easeOutExpo, delay: 0.12 }}
        />
        {/* End dots */}
        <circle cx="352" cy="158" r="4" fill="#c45c5c" opacity="0.85" />
        <circle cx="352" cy="56" r="4.5" fill="#2d5a3d" />
        <text
          x="64"
          y="24"
          className="fill-[#c45c5c] text-[11px]"
          fontSize="11"
        >
          Typical overhaul
        </text>
        <text
          x="220"
          y="24"
          className="fill-[#2d5a3d] text-[11px]"
          fontSize="11"
        >
          Sous-shaped change
        </text>
      </svg>
      <figcaption className="mt-4 text-[12px] leading-[1.65] text-[#6b7280]">
        Illustrative model only — not a clinical trial. Real life is messier;
        the point is{" "}
        <span className="text-[#374151]">small, repeated wins</span> vs.
        intensity that your week can&apos;t sustain.
      </figcaption>
    </figure>
  );
}

function PathwaySteps() {
  const steps = [
    {
      icon: Leaf,
      title: "Start with sides",
      body: "Keep the mains you already make. Add vegetable-forward sides that fit your cravings — no forced meal plan.",
    },
    {
      icon: ChefHat,
      title: "Layer in mains from the library",
      body: `Full plates developed with working chefs and reviewed alongside Stanford Medicine–affiliated clinicians — taste-forward, realistic portions.`,
    },
    {
      icon: Video,
      title: "Follow creators you trust",
      body: "Roadmap: short chef-led videos from creators you choose, tied to validated recipes — so you know the flavor and the nutrition story.",
    },
  ];
  return (
    <ol className="mt-10 grid gap-8 border-t border-[#eceef2] pt-10 md:grid-cols-3 md:gap-6">
      {steps.map((s, i) => (
        <li key={s.title} className="flex flex-col gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ef] text-[#2d5a3d]">
            <s.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#9aa0a6]">
            Step {i + 1}
          </p>
          <p className="font-serif text-[20px] leading-snug text-[#0d0d0d]">
            {s.title}
          </p>
          <p className="text-[14px] leading-[1.65] text-[#4b5563]">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function DietJourneyComparison({ stats }: { stats: CatalogStats }) {
  return (
    <section
      id="truth"
      className="scroll-mt-[80px] px-6 py-28 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-[1160px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={containerStagger}
          className="grid gap-14 lg:grid-cols-12 lg:gap-16"
        >
          <div className="lg:col-span-5">
            <motion.p
              variants={fadeUpTight}
              className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#9aa0a6]"
            >
              Adherence, not perfection
            </motion.p>
            <motion.h2
              variants={fadeUpItem}
              className="mt-5 font-serif text-[40px] leading-[1.05] tracking-tight text-[#0d0d0d] md:text-[52px]"
            >
              Diets don&apos;t fail you.
              <br />
              <span className="text-[#4b5563]">Unrealistic plans do.</span>
            </motion.h2>
            <motion.p
              variants={fadeUpItem}
              className="mt-8 text-[17px] leading-[1.75] text-[#374151] md:text-[18px]"
            >
              Most programs ask for new foods you don&apos;t love, calorie math
              all day, and a full lifestyle swap — then blame you when Wednesday
              happens. We think the opposite:{" "}
              <strong className="font-medium text-[#1a1a1a]">
                make your diet work for you
              </strong>
              . Not the perfect diet — <em className="text-[#2d5a3d]">your</em>{" "}
              perfect diet: what fits what you already cook, what you actually
              like, and what you can repeat without burning out.
            </motion.p>
            <motion.p
              variants={fadeUpItem}
              className="mt-5 text-[15px] leading-[1.72] text-[#6b7280]"
            >
              Big-picture habits beat fixation on counting every calorie. Small,
              easy wins stack — especially when they taste good.
            </motion.p>

            <motion.div
              variants={fadeUpItem}
              className="mt-10 grid grid-cols-2 gap-6 border-t border-[#eceef2] pt-10 sm:grid-cols-3"
            >
              <div>
                <p className="font-mono text-[28px] tabular-nums text-[#0d0d0d] md:text-[32px]">
                  {stats.sides}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-[#6b7280]">
                  Side dishes with pairing logic
                </p>
              </div>
              <div>
                <p className="font-mono text-[28px] tabular-nums text-[#0d0d0d] md:text-[32px]">
                  {stats.meals}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-[#6b7280]">
                  Mains in the catalog
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="font-mono text-[28px] tabular-nums text-[#2d5a3d] md:text-[32px]">
                  6
                </p>
                <p className="mt-1 text-[12px] leading-snug text-[#6b7280]">
                  Axes scored for every suggestion (deterministic)
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <motion.div variants={fadeUpItem}>
              <AdherenceComparisonChart />
            </motion.div>
            <motion.p
              variants={fadeUpItem}
              className="mt-8 max-w-[52ch] text-[15px] leading-[1.75] text-[#374151]"
            >
              Behavior-change research keeps pointing to the same idea:
              sustainability beats intensity. Sous is built around that friction
              — add sides to meals you already make first, then expand into
              mains and (soon) creator-led videos for recipes you trust.
            </motion.p>
            <PathwaySteps />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
