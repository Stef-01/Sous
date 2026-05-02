"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  Clock,
  Flame,
  Heart,
  Moon,
  Send,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { easeOutExpo, viewportOnce } from "./startup-landing-variants";

/**
 * AppPreviewSection  -  phone-frame marketing row showing the three canonical
 * Sous screens: Today, Path, Win.
 *
 * Rather than slot in opaque PNG screenshots that drift out of date the moment
 * we touch the app, each frame renders a compact HTML/CSS representation of
 * the real screen using real app typography, colors, and components. When
 * the app changes, we update the mockup in one place here.
 *
 * Inspired in structure by healthifyme.com/in's phone-frame fold (two or
 * three devices beside the hero claim); adapted to Sous's quieter aesthetic.
 */
export function AppPreviewSection() {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  return (
    <section
      aria-label="What Sous looks like"
      className="scroll-mt-[80px] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1160px]">
        <div className="grid gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#9aa0a6]">
              What you&rsquo;ll actually see
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, ease: easeOutExpo }}
              className="mt-5 font-serif text-[38px] leading-[1.06] tracking-tight text-[#0d0d0d] md:text-[52px]"
            >
              Three screens.
              <br />
              <span className="italic text-[#2d5a3d]">
                That&rsquo;s the app.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.1 }}
              className="mt-6 max-w-[42ch] text-[15px] leading-[1.72] text-[#4b5563] md:text-[16px]"
            >
              No tabs stacked four deep, no feed, no settings drawer. A craving
              becomes a cook in under ten taps. The Path tab grows as you cook.
              The Win screen remembers the hit and lets you send it to a friend.
            </motion.p>
          </div>

          <div className="md:col-span-7">
            <div className="relative grid grid-cols-3 items-end gap-3 md:gap-4">
              <PhoneFrame delay={0} rotate={-4} scale={0.92}>
                <TodayMini />
                <PhoneCaption text="Today" tone="default" />
              </PhoneFrame>
              <PhoneFrame delay={0.1} rotate={0} scale={1} elevated>
                <PathMini />
                <PhoneCaption text="Path" tone="accent" />
              </PhoneFrame>
              <PhoneFrame delay={0.2} rotate={4} scale={0.92}>
                <WinMini />
                <PhoneCaption text="Win" tone="default" />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Phone frame + caption
// ----------------------------------------------------------------------------

function PhoneFrame({
  children,
  delay = 0,
  rotate = 0,
  scale = 1,
  elevated = false,
}: {
  children: React.ReactNode;
  delay?: number;
  rotate?: number;
  scale?: number;
  elevated?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={viewportOnce}
      transition={{ duration: 0.8, ease: easeOutExpo, delay }}
      style={{ transform: `scale(${scale})` }}
      className={`relative mx-auto aspect-[9/19] w-full max-w-[220px] overflow-hidden rounded-[32px] border border-neutral-200 bg-[#fdfdfc] ${
        elevated
          ? "shadow-[0_30px_60px_-20px_rgba(13,13,13,0.35)]"
          : "shadow-[0_20px_40px_-18px_rgba(13,13,13,0.22)]"
      }`}
    >
      {/* Inner safe-area  -  leaves room for notch + caption */}
      <div className="flex h-full flex-col">
        <div className="h-[18px] bg-transparent" aria-hidden />
        {children}
      </div>

      {/* Notch */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1 h-3 w-14 -translate-x-1/2 rounded-full bg-neutral-900/90"
      />
    </motion.div>
  );
}

function PhoneCaption({
  text,
  tone,
}: {
  text: string;
  tone: "default" | "accent";
}) {
  return (
    <div
      className={`mt-auto flex items-center justify-center gap-1 px-2 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] ${
        tone === "accent" ? "text-[#2d5a3d]" : "text-[#9aa0a6]"
      }`}
    >
      {text}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Today screen mini
// ----------------------------------------------------------------------------

function TodayMini() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--nourish-cream)] px-2 pt-1 text-[var(--nourish-dark)]">
      <div className="flex items-center justify-between">
        <span className="font-serif text-[10px] font-semibold">Sous</span>
        <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-300/60 bg-amber-50 px-1 py-[1px] text-[6px] font-bold text-amber-700">
          <Flame size={6} strokeWidth={2.4} />3
        </span>
      </div>
      <div className="mt-1.5 rounded-lg border border-neutral-200 bg-white px-1.5 py-1 text-[7px] text-[var(--nourish-subtext)]">
        What are you craving?
      </div>

      {/* Quest card */}
      <div className="mt-1.5 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/food_images/pizza_margherita.png"
            alt="Pizza Margherita"
            fill
            sizes="200px"
            className="object-cover"
          />
        </div>
        <div className="px-1.5 py-1">
          <p className="text-[8px] font-semibold leading-tight">
            Pizza Margherita
          </p>
          <p className="text-[6px] text-[var(--nourish-subtext)]">
            Italian · 25 min
          </p>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-end gap-1 pr-0.5">
        <span className="inline-flex items-center gap-0.5 rounded-full border border-[var(--nourish-green)] bg-[var(--nourish-green)]/10 px-1 py-[1px] text-[6px] font-medium text-[var(--nourish-green)]">
          <Clock size={5} strokeWidth={2.4} />≤ 30
        </span>
        <span className="inline-flex items-center gap-0.5 rounded-full border border-neutral-300 bg-white px-1 py-[1px] text-[6px] font-medium text-[var(--nourish-subtext)]">
          Any cuisine
        </span>
      </div>

      {/* Friends row */}
      <div className="mt-1.5">
        <p className="px-0.5 text-[6px] font-bold uppercase tracking-wide text-[var(--nourish-subtext)]">
          Friends cooked
        </p>
        <div className="mt-0.5 flex gap-1 overflow-hidden">
          {[
            {
              src: "/food_images/pasta_carbonara.png",
              alt: "Friend’s cook: pasta carbonara",
            },
            {
              src: "/food_images/butter_chicken.png",
              alt: "Friend’s cook: butter chicken",
            },
            {
              src: "/food_images/pad_thai.png",
              alt: "Friend’s cook: pad thai",
            },
          ].map(({ src, alt }, i) => (
            <div
              key={src}
              className="relative aspect-[4/5] w-1/3 overflow-hidden rounded-md"
              style={{ transform: `translateY(${i * 1}px)` }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* tab bar spacer */}
      <div className="mt-auto border-t border-neutral-200/70 pt-1 text-center text-[6px] text-[var(--nourish-subtext)]">
        Today · Path
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Path screen mini
// ----------------------------------------------------------------------------

function PathMini() {
  return (
    <div className="flex flex-1 flex-col bg-[#fdfaf3] px-2 pt-1 text-[#1a2e26]">
      <div className="flex items-center justify-between">
        <span className="font-serif text-[10px] font-semibold">Your Path</span>
        <span className="text-[6px] text-[#6b6b6b]">Lvl 2</span>
      </div>

      {/* Confidence arc */}
      <div className="relative mt-1.5 flex justify-center">
        <svg viewBox="0 0 80 50" className="w-[70%]">
          <path
            d="M 5 45 A 35 35 0 0 1 75 45"
            fill="none"
            stroke="#e8e4df"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 5 45 A 35 35 0 0 1 55 10"
            fill="none"
            stroke="#2d5a3d"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 text-center">
          <span className="text-[5px] font-bold uppercase tracking-wider text-[#9aa0a6]">
            Confidence
          </span>
          <span className="font-serif text-[10px] font-semibold text-[#1a2e26]">
            Bold
          </span>
        </div>
      </div>

      {/* Skill grid */}
      <div className="mt-1.5 grid grid-cols-3 gap-1">
        {[
          { label: "Dry-Heat", done: true },
          { label: "Moist-Heat", done: true },
          { label: "Sauces", done: false },
          { label: "Veg.", done: true },
          { label: "Eggs", done: false },
          { label: "Stock", done: false },
        ].map((n) => (
          <div
            key={n.label}
            className={`flex flex-col items-center gap-0.5 rounded-md border px-1 py-1 text-[5px] leading-tight ${
              n.done
                ? "border-[#2d5a3d]/30 bg-[#2d5a3d]/6 text-[#1a2e26]"
                : "border-neutral-200 bg-white text-[#9aa0a6]"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                n.done ? "bg-[#2d5a3d]" : "bg-neutral-200"
              }`}
            />
            <span>{n.label}</span>
          </div>
        ))}
      </div>

      {/* Badges pill */}
      <div className="mt-1.5 flex justify-end">
        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[6px] font-semibold text-amber-800">
          Badges 4/20
        </span>
      </div>

      <div className="mt-auto border-t border-neutral-200/70 pt-1 text-center text-[6px] text-[var(--nourish-subtext)]">
        Today · Path
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Win screen mini
// ----------------------------------------------------------------------------

function WinMini() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--nourish-cream)] px-2 pt-1 text-[var(--nourish-dark)]">
      <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
        <div className="rounded-full bg-[var(--nourish-green)]/10 p-1">
          <UtensilsCrossed
            size={14}
            strokeWidth={1.6}
            className="text-[var(--nourish-green)]"
          />
        </div>
        <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--nourish-subtext)]">
          You cooked it
        </p>
        <p className="font-serif text-[11px] font-semibold leading-tight">
          Pasta Carbonara
        </p>
        <div className="mt-0.5 flex items-center gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <Star
              key={i}
              size={8}
              className="fill-amber-400 text-amber-400"
              strokeWidth={1.5}
            />
          ))}
          <Star size={8} className="text-neutral-300" strokeWidth={1.5} />
        </div>
        <button
          type="button"
          disabled
          className="mt-1 inline-flex items-center gap-0.5 rounded-full border border-[var(--nourish-green)] bg-[var(--nourish-green)]/8 px-1.5 py-0.5 text-[6px] font-semibold text-[var(--nourish-green)]"
        >
          <Send size={6} strokeWidth={2.4} />
          Send to a friend
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1 text-[6px] text-[var(--nourish-subtext)]">
        <span className="inline-flex items-center gap-0.5">
          <Heart size={6} strokeWidth={2.4} />
          Save
        </span>
        <span className="inline-flex items-center gap-0.5">
          <Moon size={6} strokeWidth={2.4} />
          Sleep well
        </span>
      </div>
    </div>
  );
}
