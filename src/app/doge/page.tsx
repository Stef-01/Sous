"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  SousBridge,
  creditCheckinGold,
  sayPendingCookFact,
  sayAmbientFact,
} from "@/lib/doge/sous-bridge";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useDogeHealth } from "@/lib/doge/use-doge-health";
import {
  buildDogeHealthPayload,
  writeDogeHealth,
  moodGreeting,
} from "@/lib/doge/doge-health-store";

/**
 * /doge — the Doberman virtual-pet game (Track A prototype). Mounts the vendored
 * game (CC BY-NC-SA code + author-permitted assets) in an iframe inside the Sous
 * DeviceFrame; the pet is reskinned to a Doberman.
 *
 * The game lives at /tamaweb/ (public/tamaweb/). A SousBridge is mounted here to
 * carry the typed postMessage protocol (gold credits, dish grants, fun-fact
 * speech) between Sous and the embedded game — see src/lib/doge/bridge-protocol.ts
 * and docs/DOGE-INTEGRATION-PLAN.md. If the bundle is somehow absent we show a
 * calm hint instead of a broken frame.
 *
 * Attribution (CC BY-NC-SA 4.0 + Tamaweb Terms of Use): the engine is
 * autosam/Tamaweb (https://github.com/autosam/Tamaweb). Reskinned to a Doberman;
 * embedded in a Next.js shell. See docs/TAMAWEB-PERMISSION.md + docs/DOGE-GAME-PLAN.md.
 */
export default function DogePage() {
  const router = useRouter();
  const [present, setPresent] = useState<boolean | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // The nutrition system, written to the shared key the game reads NATIVELY in
  // its own stats screen (App.handlers.open_stats → the Nutrition tab). Same
  // origin → the iframe reads the latest whenever stats opens. Re-written
  // whenever the real diary/hydration changes.
  const { stats: cook } = useCookSessions();
  const health = useDogeHealth(cook.currentStreak);
  // Latest health for the bridge's onReady greeting (refs read fresh at fire time).
  const healthRef = useRef(health);
  // The live bridge + a first-run guard, so a separate effect can re-post Dobe's
  // mood whenever your nutrition changes — not only at the onReady greeting.
  const bridgeRef = useRef<SousBridge | null>(null);
  const didInitialMoodRef = useRef(false);
  useEffect(() => {
    healthRef.current = health;
    writeDogeHealth(
      buildDogeHealthPayload(
        health.stats,
        health.mood,
        Date.now(),
        health.meals,
      ),
    );
  }, [health]);

  useEffect(() => {
    // Probe whether the vendored bundle exists. HEAD avoids downloading the page.
    let alive = true;
    fetch("/tamaweb/index.html", { method: "HEAD" })
      .then((r) => alive && setPresent(r.ok))
      .catch(() => alive && setPresent(false));
    return () => {
      alive = false;
    };
  }, []);

  // Mount the Sous↔Doge bridge once. It listens on window for the game's
  // `doge:ready` handshake (resolving the iframe lazily), so construction order
  // vs. iframe load doesn't matter; it tears down on unmount.
  useEffect(() => {
    let factTimer: ReturnType<typeof setInterval> | null = null;
    const bridge = new SousBridge(() => iframeRef.current, {
      onReady: () => {
        // A beat after the dog settles in: greet with a fact about the last cook
        // if there is one, else with how your nutrition is going (the dog speaks
        // your real eating). Then an ambient fact every few minutes.
        setTimeout(() => {
          // Dobe reacts to your real nutrition: a celebratory animation when
          // you've eaten well (cosmetic, never touches the game's stat loop)...
          bridge.postMood(healthRef.current.mood);
          // ...and a spoken greeting (the last cook's fact if any, else status).
          if (!sayPendingCookFact(bridge)) {
            bridge.postSay({
              sayId: `nut:${Date.now()}`,
              text: moodGreeting(healthRef.current.mood),
              ms: 7000,
            });
          }
        }, 2500);
        factTimer = setInterval(() => sayAmbientFact(bridge), 5 * 60 * 1000);
      },
      // The Hydration drill-down asked to log a glass — write it through the real
      // Sous hydration store (ref read fresh); the health payload + HUD update.
      onLogWater: () => healthRef.current.logWater(),
    });
    bridgeRef.current = bridge;
    // Engagement → money: opening Doge counts as the daily check-in (idempotent
    // per calendar day). The credit rides the same outbox the bridge flushes on
    // doge:ready, so it lands as soon as the game handshakes.
    creditCheckinGold();
    return () => {
      if (factTimer) clearInterval(factTimer);
      bridge.destroy();
      bridgeRef.current = null;
    };
  }, []);

  // Keep Dobe's VISIBLE reaction in sync with your LIVE eating: log a meal while
  // the game is open and his mood animation updates to match (cosmetic setMood —
  // handleSetMood is positive-only + sleep/scripted-guarded, never the depleting
  // stat loop). The initial mood rides the onReady greeting, so skip the first
  // run here to avoid double-firing at mount; the bridge's outbox queues until
  // the game handshakes, so an early change is never lost.
  useEffect(() => {
    if (!didInitialMoodRef.current) {
      didInitialMoodRef.current = true;
      return;
    }
    bridgeRef.current?.postMood(health.mood);
  }, [health.mood]);

  return (
    <div
      className={`relative flex h-[100dvh] flex-col ${
        // Match the game's own splash/room backdrop (navajowhite #ffdead) so the
        // brief pre-paint load shows the game's palette, not a black flash
        // (priority A: "use the game's wallpaper/palette … instead of black").
        // The not-available fallback keeps a dark bg so its white text stays legible.
        present === false ? "bg-black" : "bg-[#ffdead]"
      }`}
    >
      <button
        type="button"
        onClick={() => router.push("/today")}
        aria-label="Back to Today"
        // The embedded game toggles this via window.parent (same-origin) — it
        // hides while a game overlay (menu/stats/care) is open, since the game
        // shows its own BACK there and two back buttons collide at top-left.
        data-doge-back=""
        className="absolute left-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <ArrowLeft size={20} />
      </button>

      {present === false ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center text-white/80">
          <p className="font-serif text-xl text-white">
            Doge isn&rsquo;t available here
          </p>
          <p className="text-[13px] leading-relaxed">
            The game bundle isn&rsquo;t present in this build. Expected at{" "}
            <code className="rounded bg-white/15 px-1">public/tamaweb/</code>.
            See{" "}
            <code className="rounded bg-white/15 px-1">
              docs/DOGE-INTEGRATION-PLAN.md
            </code>
            .
          </p>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src="/tamaweb/index.html?fullscreen"
          title="Doge — Doberman virtual pet"
          className="h-full w-full border-0"
          // The game manages its own audio/fullscreen; allow what it needs.
          allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
        />
      )}
    </div>
  );
}
