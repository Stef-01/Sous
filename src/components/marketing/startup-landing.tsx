"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

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

export function StartupLanding() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="scroll-smooth bg-[#f2f3f7] text-[#101418] antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#123129] focus:shadow-lg"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-[#e2e5eb] bg-[#f2f3f7]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3.5 md:px-8">
          <Link
            href="/"
            className="font-semibold tracking-tight text-[#123129] md:text-lg"
          >
            Sous
          </Link>
          <nav
            className="hidden items-center gap-6 text-sm font-medium text-[#4b5563] md:flex"
            aria-label="Page sections"
          >
            <a href="#systems" className="transition hover:text-[#123129]">
              Platform
            </a>
            <a href="#partner" className="transition hover:text-[#123129]">
              Partner
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/today"
              className="inline-flex items-center justify-center rounded-xl bg-[#2f6c5d] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(47,108,93,0.22)] transition hover:bg-[#265a4c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6c5d]"
            >
              Try demo
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div
                className="mb-5 flex items-center gap-2 text-[#2f6c5d]"
                aria-hidden
              >
                <Sparkles className="h-5 w-5" strokeWidth={1.8} />
                <Sparkles className="h-3 w-3" strokeWidth={1.8} />
              </div>

              <p className="text-[2rem] font-semibold leading-[1.12] tracking-tight text-[#2f6c5d] sm:text-[2.5rem] md:text-[3rem]">
                Meet Sous.
              </p>
              <h1 className="mt-1 max-w-[16ch] text-[2.15rem] font-semibold leading-[1.1] tracking-tight text-[#0b0f14] sm:text-[2.85rem] md:text-[3.5rem]">
                Healthy cooking made easy with AI.
              </h1>
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-[#2b3137] md:text-xl">
                A tailored feed of recipe reels and food creators matched to
                your tastes, health goals, budget, and cooking habits.
              </p>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-[#4b535c] md:text-lg">
                Save meals you actually want to eat, turn them into a weekly
                plan, compare recipes against ingredients you already have, and
                order what is missing without breaking the flow. The product
                improves as it learns from what you watch, save, cook, skip,
                substitute, and share.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Link
                  href="/today"
                  className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-2xl bg-[#2f6c5d] px-7 py-3.5 text-base font-semibold text-white shadow-[0_14px_28px_rgba(47,108,93,0.22)] transition hover:bg-[#265a4c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6c5d]"
                >
                  Try Sous demo
                </Link>
                <a
                  href="#systems"
                  className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-2xl border border-[#b4bcc8] bg-white/80 px-7 py-3.5 text-base font-semibold text-[#2a3644] shadow-sm transition hover:border-[#9aa6b5] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6c5d]"
                >
                  Why this is different
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  "Personalized feed + creators",
                  "Pantry-aware planning",
                  "Stanford clinician input on guidance",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-[#d7dce6] bg-white/90 px-3.5 py-1.5 text-xs font-medium text-[#4f5a66] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative mx-auto min-h-[520px] w-full max-w-[560px] sm:min-h-[560px] lg:mx-0 lg:max-w-none"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              aria-hidden
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_70%_35%,rgba(47,108,93,0.12),transparent_60%)]" />

              <div className="absolute right-[20%] top-2 h-[418px] w-[224px] rounded-[28px] border-[4px] border-[#0d1015] bg-[#cfd4dc] shadow-[0_28px_50px_rgba(15,20,28,0.22)] sm:right-[22%] sm:h-[438px] sm:w-[238px]">
                <div className="absolute left-1/2 top-1.5 z-10 h-4 w-[104px] -translate-x-1/2 rounded-b-xl bg-[#0d1015]" />
                <div className="h-full w-full overflow-hidden rounded-[22px]">
                  <div className="h-[52%] w-full bg-[radial-gradient(circle_at_55%_28%,#ffb18a_0,#f06b52_22%,#1f2a3d_78%)]" />
                  <div className="h-[48%] w-full bg-[linear-gradient(180deg,#162436,#0f1624)]" />
                </div>
              </div>

              <div
                className={cn(
                  "absolute right-[12%] top-[42%] w-[min(92vw,300px)] rounded-[20px] border border-white/70 p-4 shadow-[0_20px_40px_rgba(24,32,44,0.12)] sm:w-[min(92vw,318px)]",
                  "bg-white/75 backdrop-blur-[12px]",
                )}
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
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-xl bg-[#f0f2f6] px-1.5 py-2 text-center"
                    >
                      <p className="text-[11px] font-semibold tabular-nums text-[#1a2028]">
                        {value}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#7b8591]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-[#e8ecf2] pt-3 text-xs text-[#8a949f]">
                  <span className="font-semibold text-[#2f6c5d]">Sous</span>
                  <span className="text-[#b0b8c2]">·</span>
                  <span>Pantry-aware meal card</span>
                </div>
              </div>

              <div className="absolute right-0 top-[6%] w-[min(46vw,200px)] space-y-2 sm:w-[200px]">
                {coachingPrompts.map((prompt, i) => (
                  <motion.div
                    key={prompt}
                    initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
                    className="rounded-xl border border-[#e3e7ee] bg-white/85 px-3 py-2.5 text-[11px] leading-snug text-[#5a6570] shadow-[0_8px_18px_rgba(24,32,44,0.06)] backdrop-blur-sm"
                  >
                    {prompt}
                  </motion.div>
                ))}
              </div>

              <div className="absolute bottom-[4%] right-[0%] w-[min(52vw,220px)] rounded-2xl border border-[#e8ecf2] bg-white p-3.5 shadow-[0_16px_32px_rgba(24,32,44,0.1)] sm:right-[1%]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f4ef] text-[#2f6c5d]">
                    <Sparkles className="h-4 w-4" strokeWidth={2} />
                  </div>
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
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#f4f6fa] px-2.5 py-2"
                    >
                      <span className="text-xs font-medium text-[#2f3844]">
                        {row.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-[#7b8591]">
                        {row.kcal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="systems"
          className="border-t border-[#e4e7ee] bg-white scroll-mt-[72px]"
        >
          <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-20">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6774]">
                  Advanced systems
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f1216] md:text-[2.35rem] md:leading-tight">
                  Not a chatbot wrapper — a full-stack nutrition intelligence
                  surface.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#55606d] md:text-lg">
                  Bedrock for conversational planning and adaptation, ranking
                  for personalization, retrieval to ground outputs in trusted
                  nutrition content, multimodal models for pantry understanding,
                  and AWS-scale infrastructure for media, user state, and
                  low-latency delivery.
                </p>
              </div>
              <Link
                href="/today"
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-[#2f6c5d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#265a4c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6c5d]"
              >
                Open live demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {capabilityCards.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#e6eaf0] bg-[#f8fafc] p-6 transition hover:border-[#cfd8e6] hover:shadow-[0_12px_28px_rgba(24,32,44,0.06)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#e8ecf2]">
                    <item.icon
                      className="h-5 w-5 text-[#2f6c5d]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#0f1216]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#55606d]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>

            <div
              id="partner"
              className="mt-14 scroll-mt-[72px] rounded-[28px] border border-[#dfe6ea] bg-[linear-gradient(145deg,#0c1412_0%,#1a3d34_48%,#2f6c5d_100%)] p-6 text-white shadow-[0_24px_48px_rgba(15,24,20,0.18)] md:p-10"
            >
              <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                    Partner with Sous
                  </p>
                  <h3 className="mt-3 max-w-[20ch] text-3xl font-semibold leading-[1.15] md:text-4xl">
                    Trust-forward nutrition, built like a platform company.
                  </h3>
                  <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/80 md:text-base">
                    We are designing healthy eating guidance with input from
                    Stanford clinicians so credibility stays visible as the
                    product scales. If you are exploring strategic partnerships,
                    distribution, or infrastructure alignment, we would love to
                    compare notes.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/today"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#123129] transition hover:bg-white/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      Explore product demo
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <a
                      href={PARTNER_INQUIRY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Github className="h-4 w-4" aria-hidden />
                      Start partnership thread
                    </a>
                  </div>
                </div>

                <div className="grid gap-3">
                  {partnerHighlights.map((item) => (
                    <article
                      key={item.title}
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
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e4e7ee] bg-[#f2f3f7]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-10 text-sm text-[#5c6672] md:flex-row md:items-center md:justify-between md:px-8">
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
      </footer>
    </div>
  );
}
