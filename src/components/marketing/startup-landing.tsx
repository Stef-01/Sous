"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Bookmark,
  CalendarRange,
  Refrigerator,
  ShoppingCart,
  Brain,
  Layers,
  BookOpen,
  Camera,
  Cloud,
  Shield,
  ArrowRight,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const flowSteps = [
  {
    icon: Sparkles,
    title: "Discover",
    body: "A tailored feed of recipe reels and creators matched to your tastes, health goals, budget, and habits.",
  },
  {
    icon: Bookmark,
    title: "Save",
    body: "Keep meals you actually want to eat — not another abandoned folder of screenshots.",
  },
  {
    icon: CalendarRange,
    title: "Plan the week",
    body: "Turn saves into a weekly plan without hopping between apps and notes.",
  },
  {
    icon: Refrigerator,
    title: "Match the pantry",
    body: "Compare recipes against ingredients you already have so cooking feels possible tonight.",
  },
  {
    icon: ShoppingCart,
    title: "Fill the gaps",
    body: "Order what’s missing in-line so the loop never breaks.",
  },
];

const aiPillars = [
  {
    icon: Brain,
    title: "Conversational planning",
    body: "Foundation models via Amazon Bedrock for meal planning, recipe adaptation, and guided cooking — not a generic chatbot bolt-on.",
  },
  {
    icon: Layers,
    title: "Personalization",
    body: "Recommendation and ranking tuned to you: what you watch, save, cook, skip, substitute, and share.",
  },
  {
    icon: BookOpen,
    title: "Grounded nutrition",
    body: "Retrieval pipelines anchor guidance in trusted nutrition sources so advice stays defensible.",
  },
  {
    icon: Camera,
    title: "Multimodal pantry",
    body: "Image-based pantry understanding so “what’s in my fridge?” becomes structured state, not guesswork.",
  },
];

export function StartupLanding() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)] text-[var(--nourish-dark)]">
      {/* ── Ambient hero backdrop (extends under nav) ── */}
      <div className="relative bg-[#0c1a12] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(45,90,61,0.85),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(212,168,75,0.12),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_60%,rgba(255,255,255,0.06),transparent_35%)]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <header className="relative z-20 border-b border-white/10 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
            <Link
              href="/"
              className="font-serif text-xl font-semibold tracking-tight text-white md:text-2xl"
            >
              Sous
            </Link>
            <nav className="flex items-center gap-3">
              <a
                href="#flow"
                className="hidden text-sm text-white/70 transition hover:text-white sm:inline"
              >
                One flow
              </a>
              <a
                href="#trust"
                className="hidden text-sm text-white/70 transition hover:text-white md:inline"
              >
                Trust
              </a>
              <Link
                href="/today"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition",
                  "bg-[var(--nourish-gold)] text-[#1a1408] hover:bg-[#e0b85a]",
                )}
              >
                Try the demo
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
              </Link>
            </nav>
          </div>
        </header>

        <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-16">
          <div className="max-w-3xl">
            <motion.p
              className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nourish-gold)]/90"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              One product surface
            </motion.p>
            <motion.h1
              className="font-serif text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.35rem]"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              From endless food media to meals you actually cook.
            </motion.h1>
            <motion.p
              className="mt-6 text-base leading-relaxed text-white/75 md:text-lg md:leading-relaxed"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
            >
              Sous combines discovery, planning, pantry fit, and checkout into
              one continuous flow — so healthy eating feels as engaging as
              social food content, and far more actionable.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
            >
              <Link
                href="/today"
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold shadow-xl transition",
                  "bg-white text-[var(--nourish-dark-green)] hover:bg-white/95",
                )}
              >
                Open the live demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#systems"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-base font-medium text-white/90 transition hover:border-white/40 hover:bg-white/5"
              >
                Why advanced AI
              </a>
            </motion.div>
          </div>

          {/* Hero panel — product story */}
          <motion.div
            className="mt-14 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm md:mt-20 md:grid-cols-3 md:p-8"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
          >
            {[
              {
                k: "Feed",
                v: "Reels and creators aligned to your tastes and goals.",
              },
              {
                k: "Plan",
                v: "Saves become a week you can defend against real life.",
              },
              {
                k: "Shop",
                v: "Gap-fill orders without leaving the moment you decided to cook.",
              },
            ].map((cell) => (
              <div
                key={cell.k}
                className="border-white/10 md:border-l md:pl-6 first:md:border-l-0 first:md:pl-0"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nourish-gold)]">
                  {cell.k}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {cell.v}
                </p>
              </div>
            ))}
          </motion.div>
        </section>
      </div>

      {/* ── One flow ── */}
      <section
        id="flow"
        className="scroll-mt-20 border-b border-neutral-200/80 bg-[var(--nourish-cream)] py-20 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold text-[var(--nourish-dark)] md:text-4xl">
              One flow, not five tabs.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--nourish-subtext)] md:text-lg">
              A person opens Sous and moves from inspiration to execution
              without the usual hand-offs. The product learns from what you
              watch, save, cook, skip, substitute, and share — so tomorrow’s
              feed is sharper than today’s.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {flowSteps.map((step, i) => (
              <motion.article
                key={step.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="group relative flex flex-col rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm transition hover:border-[var(--nourish-green)]/25 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10 text-[var(--nourish-green)] transition group-hover:bg-[var(--nourish-green)]/15">
                  <step.icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="font-semibold text-[var(--nourish-dark)]">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--nourish-subtext)]">
                  {step.body}
                </p>
                {i < flowSteps.length - 1 && (
                  <div
                    className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-[var(--nourish-green)]/30 to-transparent lg:block"
                    aria-hidden
                  />
                )}
              </motion.article>
            ))}
          </div>

          <motion.p
            className="mx-auto mt-12 max-w-3xl text-center text-sm text-[var(--nourish-subtext)]"
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            The demo you are about to open is the shipping slice of that vision:
            craving in → intelligent pairing → guided cook. The full surface
            area above rolls out behind the same product philosophy.
          </motion.p>
        </div>
      </section>

      {/* ── Systems ── */}
      <section id="systems" className="scroll-mt-20 bg-white py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                Built like a nutrition company, feels like your favorite feed.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--nourish-subtext)]">
                Delivering this experience takes more than a wrapper around a
                foundation model: conversational agents, ranking, retrieval, and
                multimodal understanding — composed so latency stays low and
                trust stays high.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-[var(--nourish-cream)] px-4 py-2 text-xs font-medium text-[var(--nourish-subtext)]">
              <Cloud
                className="h-3.5 w-3.5 text-[var(--nourish-green)]"
                aria-hidden
              />
              Media, state, and personalization on AWS-scale infrastructure
            </div>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {aiPillars.map((pillar, i) => (
              <motion.article
                key={pillar.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-24px" }}
                className="rounded-2xl border border-neutral-100 bg-[var(--nourish-cream)]/50 p-6 md:p-8"
              >
                <pillar.icon
                  className="h-8 w-8 text-[var(--nourish-green)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mt-4 font-serif text-xl font-semibold text-[var(--nourish-dark)]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--nourish-subtext)] md:text-base">
                  {pillar.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section
        id="trust"
        className="scroll-mt-20 border-t border-neutral-200/80 bg-[#122818] py-20 text-white md:py-28"
      >
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--nourish-gold)]">
                <Shield className="h-3.5 w-3.5" aria-hidden />
                Trust is the product
              </div>
              <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight md:text-4xl">
                Credible guidance should be as loud as the algorithm.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-white/75">
                Sous is being designed with input from Stanford clinicians so
                healthy eating guidance is not buried under misinformation. Our
                bet is simple: the next winning nutrition product will feel as
                engaging as social food media — and be dramatically more useful
                because you can trust what it tells you.
              </p>
            </motion.div>

            <motion.figure
              className="relative overflow-hidden rounded-2xl border border-[var(--nourish-gold)]/35 bg-gradient-to-br from-white/[0.08] to-transparent p-8 md:p-10"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <blockquote className="font-serif text-xl leading-snug text-white md:text-2xl">
                &ldquo;Engagement without evidence is entertainment. Evidence
                without engagement never ships. Sous lives in the
                overlap.&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm text-white/55">
                Product thesis — clinical credibility × habit-forming UX
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </section>

      {/* ── CTA footer band ── */}
      <section className="border-t border-neutral-200 bg-[var(--nourish-cream)] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 text-center md:px-8">
          <h2 className="font-serif text-2xl font-semibold text-[var(--nourish-dark)] md:text-3xl">
            See the demo the team ships against every week.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--nourish-subtext)]">
            Today tab: craving, pairing, and guided cook — the core loop behind
            the larger vision above.
          </p>
          <Link
            href="/today"
            className={cn(
              "mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-lg transition",
              "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
            )}
          >
            Enter Sous
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-center text-xs text-[var(--nourish-subtext)] md:flex-row md:text-left md:px-8">
          <p className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
            Sous
          </p>
          <p>Forward-looking product narrative. Demo reflects current build.</p>
          <Link
            href="/today"
            className="font-medium text-[var(--nourish-green)] hover:underline"
          >
            Try demo →
          </Link>
        </div>
      </footer>
    </div>
  );
}
