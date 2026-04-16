"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import {
  Sparkles,
  MessageCircle,
  Zap,
  ShieldCheck,
  ArrowRight,
  Camera,
  Handshake,
  Server,
  HeartPulse,
  Github,
  BookOpen,
  ChefHat,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  containerStagger,
  fadeUpItem,
  fadeUpTight,
  scaleIn,
  springSnappy,
  viewportOnce,
  easeOutExpo,
} from "./startup-landing-variants";

const PARTNER_INQUIRY_URL =
  "https://github.com/Stef-01/Sous/issues/new?title=Partnership%20inquiry%20%E2%80%94%20Sous&body=Tell%20us%20about%20your%20organization%20and%20what%20you%20are%20exploring%20with%20Sous.";

const coachingPrompts = [
  "Suggest a low-cost high-protein dinner",
  "What can I cook in 20 minutes?",
  "Plan meals around my cardio days",
];

const capabilityCards = [
  {
    icon: MessageCircle,
    title: "Conversational planning",
    body: "Foundation models via Amazon Bedrock power meal planning, recipe adaptation, and guided cooking support.",
  },
  {
    icon: Zap,
    title: "Adaptive personalization",
    body: "Recommendations improve from what you watch, save, cook, skip, substitute, and share.",
  },
  {
    icon: Camera,
    title: "Multimodal pantry context",
    body: "Image-based pantry understanding helps match recipes to what you already have before checkout.",
  },
  {
    icon: ShieldCheck,
    title: "Credible healthy guidance",
    body: "Designed with input from Stanford clinicians so trust is built into the product, not bolted on.",
  },
];

const partnerHighlights = [
  {
    icon: HeartPulse,
    title: "Clinical-grade trust layer",
    body: "Healthy guidance is designed with clinician input so recommendations stay credible as the product scales.",
  },
  {
    icon: Server,
    title: "AI + infrastructure moat",
    body: "Bedrock-driven reasoning, retrieval-backed nutrition context, and AWS-native data systems built for low-latency personalization.",
  },
  {
    icon: Handshake,
    title: "Distribution-ready product surface",
    body: "Social-style engagement mechanics tied directly to meal execution, shopping conversion, and retained behavior loops.",
  },
];

const waysToSous = [
  {
    tag: "Learn",
    icon: BookOpen,
    title: "Personalized guidance on the go",
    body: "Signals from your goals, habits, and saves shape what surfaces next — not a generic feed.",
  },
  {
    tag: "Act",
    icon: ChefHat,
    title: "Plans that respect real life",
    body: "Turn inspiration into a week you can execute: pantry-aware picks, substitutions, and gap-fill flow.",
  },
  {
    tag: "Ask",
    icon: Compass,
    title: "Answers grounded in nutrition context",
    body: "Coach-style help when you are deciding — tuned to stay credible as the product scales.",
  },
];

const chipLabels = [
  "Personalized feed + creators",
  "Pantry-aware planning",
  "Stanford clinician input on guidance",
];

function HeroMesh({ reduced }: { reduced: boolean | null }) {
  if (reduced) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute -left-[20%] -top-[30%] h-[min(90vw,520px)] w-[min(90vw,520px)] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(47,108,93,0.22)_0%,transparent_68%)] blur-2xl"
        animate={{ x: [0, 24, 0], y: [0, 18, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[15%] top-[10%] h-[min(85vw,480px)] w-[min(85vw,480px)] rounded-full bg-[radial-gradient(circle_at_70%_40%,rgba(255,140,105,0.18)_0%,transparent_65%)] blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 28, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] left-[25%] h-[min(70vw,380px)] w-[min(70vw,380px)] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,179,237,0.12)_0%,transparent_70%)] blur-2xl"
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.04, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function StartupLanding() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const [headerElevated, setHeaderElevated] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    setHeaderElevated(y > 10);
  });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  const parallaxPhone = useTransform(
    heroProgress,
    [0, 0.55],
    [0, reduceMotion ? 0 : 48],
  );
  const parallaxCard = useTransform(
    heroProgress,
    [0, 0.55],
    [0, reduceMotion ? 0 : -28],
  );
  const parallaxPrompts = useTransform(
    heroProgress,
    [0, 0.55],
    [0, reduceMotion ? 0 : 20],
  );
  const heroGlowShift = useTransform(
    heroProgress,
    [0, 1],
    ["42% 35%", "58% 55%"],
  );
  const heroRadialBg = useTransform(
    heroGlowShift,
    (pos) =>
      `radial-gradient(ellipse 70% 55% at ${pos}, rgba(47,108,93,0.14), transparent 62%)`,
  );

  return (
    <div className="scroll-smooth bg-[#f7f8fa] text-[#2a2a2a] antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#123129] focus:shadow-lg"
      >
        Skip to content
      </a>

      <motion.header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300",
          headerElevated
            ? "border-[#e8eaef]/80 bg-[#f7f8fa]/96 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            : "border-transparent bg-[#f7f8fa]/70",
        )}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3.5 md:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springSnappy}
          >
            <Link
              href="/"
              className="font-semibold tracking-tight text-[#123129] md:text-lg"
            >
              Sous
            </Link>
          </motion.div>
          <nav
            className="hidden items-center gap-6 text-sm font-medium text-[#4b5563] md:flex"
            aria-label="Page sections"
          >
            {[
              ["#ways", "Discover"],
              ["#systems", "Platform"],
              ["#partner", "Partner"],
            ].map(([href, label]) => (
              <motion.a
                key={href}
                href={href}
                className="relative transition hover:text-[#123129]"
                whileHover={reduceMotion ? {} : { y: -1 }}
                whileTap={reduceMotion ? {} : { scale: 0.98 }}
              >
                {label}
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-px origin-left bg-[#2f6c5d]/70"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.25, ease: easeOutExpo }}
                />
              </motion.a>
            ))}
          </nav>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springSnappy, delay: 0.05 }}
            className="flex items-center gap-2"
          >
            <Link
              href="/today"
              className="inline-flex items-center justify-center rounded-xl bg-[#2f6c5d] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(47,108,93,0.22)] transition hover:bg-[#265a4c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6c5d]"
            >
              Try demo
            </Link>
          </motion.div>
        </div>
      </motion.header>

      <main id="main">
        <section
          ref={heroRef}
          className="relative mx-auto max-w-[1280px] overflow-hidden px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14"
        >
          <HeroMesh reduced={!!reduceMotion} />
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-90"
            aria-hidden
            style={{ background: heroRadialBg }}
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
            <motion.div
              variants={containerStagger}
              initial="hidden"
              animate="visible"
              className="relative z-[1]"
            >
              <motion.div
                variants={fadeUpTight}
                className="mb-5 flex items-center gap-2 text-[#2f6c5d]"
                aria-hidden
              >
                <motion.span
                  animate={
                    reduceMotion
                      ? {}
                      : { rotate: [0, 8, -6, 0], scale: [1, 1.08, 1] }
                  }
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-flex"
                >
                  <Sparkles className="h-5 w-5" strokeWidth={1.8} />
                </motion.span>
                <Sparkles className="h-3 w-3" strokeWidth={1.8} />
              </motion.div>

              <motion.p
                variants={fadeUpItem}
                className="text-[2rem] font-semibold leading-[1.12] tracking-tight text-[#2f6c5d] sm:text-[2.5rem] md:text-[3rem]"
              >
                Meet Sous.
              </motion.p>
              <motion.h1
                variants={fadeUpItem}
                className="mt-1 max-w-[18ch] text-[2.15rem] font-semibold leading-[1.1] tracking-tight text-[#1a1a1a] sm:text-[2.85rem] md:text-[3.5rem]"
              >
                Healthy cooking made easy with AI.
              </motion.h1>
              <motion.p
                variants={fadeUpItem}
                className="mt-6 max-w-prose text-lg leading-[1.7] text-[#3c3c3c] md:text-xl"
              >
                A tailored feed of recipe reels and food creators matched to
                your tastes, health goals, budget, and cooking habits.
              </motion.p>
              <motion.p
                variants={fadeUpItem}
                className="mt-3 max-w-prose text-base leading-[1.7] text-[#6a6a6a] md:text-lg"
              >
                Save meals you actually want to eat, turn them into a weekly
                plan, compare recipes against ingredients you already have, and
                order what is missing without breaking the flow. The product
                improves as it learns from what you watch, save, cook, skip,
                substitute, and share.
              </motion.p>

              <motion.div
                variants={fadeUpItem}
                className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-stretch"
              >
                <motion.span
                  className="inline-flex sm:contents"
                  whileHover={reduceMotion ? {} : { scale: 1.02 }}
                  whileTap={reduceMotion ? {} : { scale: 0.98 }}
                >
                  <Link
                    href="/today"
                    className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-2xl bg-[#2f6c5d] px-7 py-3.5 text-base font-semibold text-white shadow-[0_14px_28px_rgba(47,108,93,0.22)] transition hover:bg-[#265a4c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6c5d]"
                  >
                    Try Sous demo
                  </Link>
                </motion.span>
                <motion.span
                  className="inline-flex sm:contents"
                  whileHover={reduceMotion ? {} : { scale: 1.01 }}
                  whileTap={reduceMotion ? {} : { scale: 0.99 }}
                >
                  <a
                    href="#systems"
                    className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-2xl border border-[#b4bcc8] bg-white/80 px-7 py-3.5 text-base font-semibold text-[#2a3644] shadow-sm transition hover:border-[#9aa6b5] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6c5d]"
                  >
                    Why this is different
                  </a>
                </motion.span>
              </motion.div>

              <motion.div
                variants={containerStagger}
                initial="hidden"
                animate="visible"
                className="mt-8 flex flex-wrap gap-2"
              >
                {chipLabels.map((label) => (
                  <motion.span
                    key={label}
                    variants={fadeUpTight}
                    whileHover={
                      reduceMotion
                        ? {}
                        : {
                            y: -2,
                            boxShadow: "0 12px 28px rgba(24,32,44,0.08)",
                          }
                    }
                    className="rounded-full border border-[#e4e7ec] bg-white px-3.5 py-1.5 text-xs font-medium text-[#6a6a6a]"
                  >
                    {label}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative z-[1] mx-auto min-h-[520px] w-full max-w-[560px] sm:min-h-[560px] lg:mx-0 lg:max-w-none"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springSnappy, delay: 0.12 }}
              aria-hidden
            >
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{ y: parallaxPrompts }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_70%_35%,rgba(47,108,93,0.12),transparent_60%)]" />
              </motion.div>

              <motion.div
                className="absolute right-[20%] top-2 sm:right-[22%]"
                style={{ y: parallaxPhone }}
              >
                <motion.div
                  className="relative h-[418px] w-[224px] rounded-[28px] border-[4px] border-[#0d1015] bg-[#cfd4dc] shadow-[0_28px_50px_rgba(15,20,28,0.22)] sm:h-[438px] sm:w-[238px]"
                  animate={reduceMotion ? false : { y: [0, -6, 0, 4, 0] }}
                  transition={
                    reduceMotion
                      ? {}
                      : {
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          repeatType: "mirror",
                        }
                  }
                >
                  <div className="absolute left-1/2 top-1.5 z-10 h-4 w-[104px] -translate-x-1/2 rounded-b-xl bg-[#0d1015]" />
                  <div className="h-full w-full overflow-hidden rounded-[22px]">
                    <div className="h-[52%] w-full bg-[radial-gradient(circle_at_55%_28%,#ffb18a_0,#f06b52_22%,#1f2a3d_78%)]" />
                    <div className="h-[48%] w-full bg-[linear-gradient(180deg,#162436,#0f1624)]" />
                  </div>
                  {!reduceMotion && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-tr from-white/0 via-white/12 to-white/0"
                      animate={{ rotate: [0, 3, 0] }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                className={cn(
                  "absolute right-[12%] top-[42%] w-[min(92vw,300px)] rounded-[20px] border border-white/70 p-4 shadow-[0_20px_40px_rgba(24,32,44,0.12)] sm:w-[min(92vw,318px)]",
                  "bg-white/75 backdrop-blur-[12px]",
                )}
                style={{ y: parallaxCard }}
                whileHover={reduceMotion ? {} : { scale: 1.02, rotate: -0.6 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <p className="text-sm font-semibold leading-snug text-[#1d252e]">
                  Roasted pumpkin, quinoa, greens, and tomato salad
                </p>
                <p className="mt-1 text-sm text-[#7b8591]">412 Cal</p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[
                    ["31.4 g", "Protein"],
                    ["39.0 g", "Carbs"],
                    ["14.2 g", "Fats"],
                    ["8.1 g", "Fiber"],
                  ].map(([value, label], i) => (
                    <motion.div
                      key={label}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.35 + i * 0.06,
                        ...springSnappy,
                      }}
                      className="rounded-xl bg-[#f0f2f6] px-1.5 py-2 text-center"
                    >
                      <p className="text-[11px] font-semibold tabular-nums text-[#1a2028]">
                        {value}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#7b8591]">
                        {label}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-[#e8ecf2] pt-3 text-xs text-[#8a949f]">
                  <span className="font-semibold text-[#2f6c5d]">Sous</span>
                  <span className="text-[#b0b8c2]">·</span>
                  <span>Pantry-aware meal card</span>
                </div>
              </motion.div>

              <div className="absolute right-0 top-[6%] w-[min(46vw,200px)] space-y-2 sm:w-[200px]">
                {coachingPrompts.map((prompt, i) => (
                  <motion.div
                    key={prompt}
                    initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07, ...springSnappy }}
                    style={{ y: parallaxPrompts }}
                    whileHover={reduceMotion ? {} : { x: -4 }}
                    className="rounded-xl border border-[#e3e7ee] bg-white/85 px-3 py-2.5 text-[11px] leading-snug text-[#5a6570] shadow-[0_8px_18px_rgba(24,32,44,0.06)] backdrop-blur-sm"
                  >
                    {prompt}
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="absolute bottom-[4%] right-[0%] w-[min(52vw,220px)] rounded-2xl border border-[#e8ecf2] bg-white p-3.5 shadow-[0_16px_32px_rgba(24,32,44,0.1)] sm:right-[1%]"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, ...springSnappy }}
                whileHover={reduceMotion ? {} : { y: -3 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f4ef] text-[#2f6c5d]"
                    animate={
                      reduceMotion
                        ? {}
                        : { scale: [1, 1.06, 1], rotate: [0, -4, 4, 0] }
                    }
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="h-4 w-4" strokeWidth={2} />
                  </motion.div>
                  <p className="text-sm font-semibold text-[#1a222c]">
                    Sous Coach
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#5d6672]">
                  Here are balanced options that fit your week, your pantry, and
                  your budget — grounded in trusted nutrition context.
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { name: "Miso salmon + greens", kcal: "520 kcal" },
                    { name: "Chickpea bowl + yogurt", kcal: "480 kcal" },
                  ].map((row, idx) => (
                    <motion.div
                      key={row.name}
                      initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.08, ...springSnappy }}
                      whileHover={
                        reduceMotion ? {} : { backgroundColor: "#eef1f6" }
                      }
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#f4f6fa] px-2.5 py-2"
                    >
                      <span className="text-xs font-medium text-[#2f3844]">
                        {row.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-[#7b8591]">
                        {row.kcal}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="h-px w-full bg-[#e8eaef]/60" />
        </div>

        <section
          id="ways"
          className="relative scroll-mt-[72px] bg-white py-20 md:py-28"
        >
          {/* Clean section boundary — no decorative gradient */}
          <div className="mx-auto max-w-[1280px] px-4 md:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={containerStagger}
              className="mb-12 max-w-3xl"
            >
              <motion.p
                variants={fadeUpItem}
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9b9b9b]"
              >
                Don&apos;t just scroll recipes
              </motion.p>
              <motion.h2
                variants={fadeUpItem}
                className="mt-3 text-3xl font-semibold tracking-tight text-[#1a1a1a] md:text-[2.5rem] md:leading-[1.12]"
              >
                Sous in many more ways
              </motion.h2>
              <motion.p
                variants={fadeUpItem}
                className="mt-4 text-base leading-[1.7] text-[#6a6a6a] md:text-lg"
              >
                One surface that learns how you eat, nudges what to cook next,
                and closes the loop from inspiration to groceries — the kind of
                vertical depth investors expect from a 2026 AI consumer company.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-5 md:grid-cols-3"
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {waysToSous.map((way) => (
                <motion.article
                  key={way.tag}
                  variants={scaleIn}
                  whileHover={
                    reduceMotion
                      ? {}
                      : {
                          y: -6,
                          boxShadow: "0 24px 48px rgba(24,32,44,0.1)",
                        }
                  }
                  className="group relative overflow-hidden rounded-2xl border border-[#e8eaef]/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:p-7"
                >
                  {!reduceMotion && (
                    <motion.div
                      className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(47,108,93,0.12)_0%,transparent_70%)]"
                      initial={{ opacity: 0.4, scale: 0.8 }}
                      whileHover={{ opacity: 0.9, scale: 1.15 }}
                      transition={{ duration: 0.45 }}
                    />
                  )}
                  <div className="relative flex items-start gap-4">
                    <motion.div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef6f2] text-[#2f6c5d] ring-1 ring-[#dceee6]"
                      whileHover={
                        reduceMotion
                          ? {}
                          : { rotate: [0, -6, 6, 0], scale: 1.05 }
                      }
                      transition={{ duration: 0.5 }}
                    >
                      <way.icon className="h-6 w-6" strokeWidth={1.65} />
                    </motion.div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2f6c5d]">
                        • {way.tag}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#2a2a2a]">
                        {way.title}
                      </h3>
                      <p className="mt-2 text-sm leading-[1.7] text-[#6a6a6a]">
                        {way.body}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="systems" className="bg-[#f7f8fa] scroll-mt-[72px]">
          <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-20">
            <motion.div
              className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={containerStagger}
            >
              <div className="max-w-2xl">
                <motion.p
                  variants={fadeUpItem}
                  className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9b9b9b]"
                >
                  Advanced systems
                </motion.p>
                <motion.h2
                  variants={fadeUpItem}
                  className="mt-3 text-3xl font-semibold tracking-tight text-[#1a1a1a] md:text-[2.35rem] md:leading-tight"
                >
                  Not a chatbot wrapper — a full-stack nutrition intelligence
                  surface.
                </motion.h2>
                <motion.p
                  variants={fadeUpItem}
                  className="mt-4 text-base leading-[1.7] text-[#6a6a6a] md:text-lg"
                >
                  Bedrock for conversational planning and adaptation, ranking
                  for personalization, retrieval to ground outputs in trusted
                  nutrition content, multimodal models for pantry understanding,
                  and AWS-scale infrastructure for media, user state, and
                  low-latency delivery.
                </motion.p>
              </div>
              <motion.div variants={fadeUpItem}>
                <Link
                  href="/today"
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-[#2f6c5d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#265a4c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6c5d]"
                >
                  Open live demo
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid gap-4 sm:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={containerStagger}
            >
              {capabilityCards.map((item) => (
                <motion.article
                  key={item.title}
                  variants={fadeUpItem}
                  whileHover={
                    reduceMotion
                      ? {}
                      : {
                          y: -4,
                          borderColor: "rgb(207 216 230)",
                          transition: { duration: 0.2 },
                        }
                  }
                  className="rounded-2xl border border-[#e8eaef]/50 bg-white p-6 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                >
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#e8ecf2]"
                    whileHover={reduceMotion ? {} : { rotate: [0, -8, 0] }}
                    transition={{ duration: 0.45 }}
                  >
                    <item.icon
                      className="h-5 w-5 text-[#2f6c5d]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </motion.div>
                  <h3 className="mt-4 text-lg font-semibold text-[#2a2a2a]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-[1.7] text-[#6a6a6a]">
                    {item.body}
                  </p>
                </motion.article>
              ))}
            </motion.div>

            <motion.div
              id="partner"
              className="relative mt-14 scroll-mt-[72px] overflow-hidden rounded-[28px] border border-[#dfe6ea] bg-[linear-gradient(145deg,#0c1412_0%,#1a3d34_48%,#2f6c5d_100%)] p-6 text-white shadow-[0_24px_48px_rgba(15,24,20,0.18)] md:p-10"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUpTight}
            >
              {!reduceMotion && (
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  initial={{ x: "-30%" }}
                  animate={{ x: ["-30%", "130%"] }}
                  transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.09) 45%, transparent 90%)",
                  }}
                />
              )}
              <div className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-end">
                <motion.div
                  variants={containerStagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                >
                  <motion.p
                    variants={fadeUpItem}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65"
                  >
                    Partner with Sous
                  </motion.p>
                  <motion.h3
                    variants={fadeUpItem}
                    className="mt-3 max-w-[20ch] text-3xl font-semibold leading-[1.15] md:text-4xl"
                  >
                    Trust-forward nutrition, built like a platform company.
                  </motion.h3>
                  <motion.p
                    variants={fadeUpItem}
                    className="mt-4 max-w-prose text-sm leading-relaxed text-white/80 md:text-base"
                  >
                    We are designing healthy eating guidance with input from
                    Stanford clinicians so credibility stays visible as the
                    product scales. If you are exploring strategic partnerships,
                    distribution, or infrastructure alignment, we would love to
                    compare notes.
                  </motion.p>
                  <motion.div
                    variants={fadeUpItem}
                    className="mt-7 flex flex-wrap gap-3"
                  >
                    <motion.span
                      whileHover={reduceMotion ? {} : { scale: 1.03 }}
                      whileTap={reduceMotion ? {} : { scale: 0.98 }}
                      className="inline-flex"
                    >
                      <Link
                        href="/today"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#123129] transition hover:bg-white/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        Explore product demo
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </motion.span>
                    <motion.span
                      whileHover={reduceMotion ? {} : { scale: 1.02 }}
                      whileTap={reduceMotion ? {} : { scale: 0.98 }}
                      className="inline-flex"
                    >
                      <a
                        href={PARTNER_INQUIRY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <Github className="h-4 w-4" aria-hidden />
                        Start partnership thread
                      </a>
                    </motion.span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="grid gap-3"
                  variants={containerStagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                >
                  {partnerHighlights.map((item) => (
                    <motion.article
                      key={item.title}
                      variants={fadeUpItem}
                      whileHover={
                        reduceMotion
                          ? {}
                          : { backgroundColor: "rgba(255,255,255,0.1)" }
                      }
                      className="rounded-2xl border border-white/14 bg-white/[0.07] p-4 backdrop-blur-md md:p-5"
                    >
                      <item.icon
                        className="h-4 w-4 text-[#a8ebd9]"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <p className="mt-2 text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/75 md:text-sm">
                        {item.body}
                      </p>
                    </motion.article>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <motion.footer
        className="border-t border-[#e8eaef]/60 bg-[#f7f8fa]"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px" }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-12 text-sm text-[#6a6a6a] md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-semibold text-[#123129]">Sous</p>
          <p className="max-w-xl text-xs leading-relaxed md:text-sm">
            Landing narrative describes the product direction. The interactive
            demo reflects the current build on the Today tab.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/today"
              className="font-semibold text-[#2f6c5d] underline-offset-4 hover:underline"
            >
              Launch app
            </Link>
            <a
              href="#partner"
              className="font-semibold text-[#2f6c5d] underline-offset-4 hover:underline"
            >
              Partnerships
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
