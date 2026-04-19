"use client";

import { motion } from "framer-motion";
import { ChefHat, Leaf, Video } from "lucide-react";
import {
  containerStagger,
  fadeUpItem,
  fadeUpTight,
  viewportOnce,
} from "./startup-landing-variants";

export type CatalogStats = {
  meals: number;
  sides: number;
};

function PathwaySteps() {
  const steps = [
    {
      icon: Leaf,
      title: "Start with sides",
      body: "Keep the mains you already make. Add vegetable-forward sides that fit your cravings, not a forced meal plan.",
    },
    {
      icon: ChefHat,
      title: "Layer in mains from the library",
      body: `Full plates developed with working chefs and reviewed alongside Stanford Medicine-affiliated clinicians: taste-forward, realistic portions.`,
    },
    {
      icon: Video,
      title: "Follow creators you trust",
      body: "Roadmap: short chef-led videos from creators you choose, tied to validated recipes so you know the flavor and the nutrition story.",
    },
  ];
  return (
    <ol className="mt-10 flex flex-col gap-10 border-t border-[#eceef2] pt-10">
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
      className="scroll-mt-[80px] px-6 py-20 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-[720px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={containerStagger}
          className="grid gap-12"
        >
          <div>
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
              all day, and a full lifestyle swap, then blame you when Wednesday
              happens. We think the opposite:{" "}
              <strong className="font-medium text-[#1a1a1a]">
                make your diet work for you
              </strong>
              . Not the perfect diet on paper.{" "}
              <em className="text-[#2d5a3d]">Your</em> perfect diet fits what
              you already cook, what you actually like, and what you can repeat
              without burning out.
            </motion.p>
            <motion.p
              variants={fadeUpItem}
              className="mt-5 text-[15px] leading-[1.72] text-[#6b7280]"
            >
              Big-picture habits beat fixation on counting every calorie. Small,
              easy wins stack, especially when they taste good.
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
            <motion.p
              variants={fadeUpItem}
              className="mt-10 max-w-[52ch] text-[15px] leading-[1.75] text-[#374151]"
            >
              Behavior-change research keeps pointing to the same idea:
              sustainability beats intensity. Sous is built around that: add
              sides to meals you already make first, then expand into mains and
              (soon) creator-led videos for recipes you trust.
            </motion.p>
            <PathwaySteps />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
