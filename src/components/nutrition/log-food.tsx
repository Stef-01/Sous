"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Mic, Plus, Search, X } from "lucide-react";
import {
  matchDishesByText,
  matchMultipleByText,
} from "@/lib/nutrition/match-dish-by-text";
import { extractFoodQuery } from "@/lib/nutrition/extract-food-query";
import type { BrandedFood } from "@/lib/nutrition/branded-food";
import { diaryLogBranded, diaryLogCook } from "@/lib/hooks/use-nutrition-diary";
import { haptic } from "@/lib/motion/haptics";
import { toast } from "@/lib/hooks/use-toast";

/**
 * LogFood — ONE logging surface (the leading-tracker pattern: a single entry
 * point, not "add packaged food" / "photo log" / "quick log" stacked):
 *
 *  - type → one merged result list: your dishes & recipes (instant, offline,
 *    kcal previews) then packaged/restaurant foods (Open Food Facts, debounced)
 *  - camera → READS, doesn't guess: barcode when one is visible, otherwise OCR
 *    (tesseract.js, lazy-loaded) extracts the product/menu name and runs the
 *    same search. No vision model, no API key.
 *  - empty field → your staples as one row of quick chips (usual portions),
 *    not a feed of everything ever eaten.
 */

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: (e: {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
  }) => void;
  start: () => void;
}
function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: {
  formats?: string[];
}) => BarcodeDetectorLike;
function getBarcodeDetector(): BarcodeDetectorCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
  return w.BarcodeDetector ?? null;
}

export interface FrequentChip {
  slug: string;
  name: string;
  usual: number;
}

export function LogFood({
  date,
  frequents = [],
}: {
  date?: Date;
  frequents?: FrequentChip[];
}) {
  const [q, setQ] = useState("");
  const [branded, setBranded] = useState<BrandedFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [camOpen, setCamOpen] = useState(false);
  const [camStatus, setCamStatus] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<BrandedFood | null>(null);
  const [alternates, setAlternates] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const SR = getSpeechRecognition();

  const locals = matchDishesByText(q);
  const multi = matchMultipleByText(q);

  // Packaged/restaurant results ride the SAME box, debounced.

  useEffect(() => {
    const term = q.trim();
    if (term.length < 3) {
      setBranded([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/branded-food/search?q=${encodeURIComponent(term)}`, {
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((data: { foods?: BrandedFood[] }) =>
          setBranded((data.foods ?? []).slice(0, 4)),
        )
        .catch(() => {
          if (!ctrl.signal.aborted) setBranded([]);
        })
        .finally(() => setSearching(false));
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOpen(false);
    setCamStatus(null);
  };
  useEffect(() => stopCamera, []);

  const lookupBarcode = async (code: string) => {
    setCamStatus("Looking up…");
    try {
      const res = await fetch(
        `/api/branded-food/barcode?code=${encodeURIComponent(code)}`,
      );
      const data = (await res.json()) as { food: BrandedFood | null };
      if (data.food) {
        haptic("select");
        setFoundProduct(data.food);
        setCamStatus(null);
        stopCamera();
      } else {
        setCamStatus("No product for that code — snap the name instead.");
      }
    } catch {
      setCamStatus("Lookup failed — snap the name instead.");
    }
  };

  const openCamera = async () => {
    setFoundProduct(null);
    setAlternates([]);
    setCamStatus(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCamOpen(true);
      requestAnimationFrame(async () => {
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        // Passive barcode polling while the user lines up the shot.
        const Detector = getBarcodeDetector();
        if (Detector) {
          const detector = new Detector({
            formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
          });
          const tick = async () => {
            if (!streamRef.current) return;
            try {
              const codes = await detector.detect(video);
              const code = codes[0]?.rawValue;
              if (code) {
                await lookupBarcode(code);
                return;
              }
            } catch {
              // detection hiccup — keep polling
            }
            setTimeout(tick, 200);
          };
          tick();
        }
      });
    } catch {
      setCamStatus("Camera unavailable — type the name instead.");
    }
  };

  /** Shutter: freeze a frame, OCR it, run the search on what it says. */
  const readText = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setCamStatus("Camera is still warming up — try again.");
      return;
    }
    setCamStatus("Reading…");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(canvas);
      await worker.terminate();
      const { query, alternates: alts } = extractFoodQuery(text);
      if (query) {
        haptic("select");
        setQ(query);
        setAlternates(alts);
        stopCamera();
      } else {
        setCamStatus("Couldn't read a name — get closer, or type it.");
      }
    } catch {
      setCamStatus("Reading failed — type the name instead.");
    }
  };

  const logLocal = (slug: string, name: string, servings = 1) => {
    haptic("commit");
    diaryLogCook(slug, name, servings, { date });
    setQ("");
    setAlternates([]);
  };

  const logBrandedFood = (f: BrandedFood) => {
    haptic("commit");
    diaryLogBranded(f, 1, { date });
    toast.push({
      variant: "success",
      title: `Logged ${f.name}`,
      dedupKey: "log-food",
    });
    setQ("");
    setBranded([]);
    setFoundProduct(null);
    setAlternates([]);
  };

  const showResults = q.trim().length >= 2;

  return (
    <section>
      <p className="sous-label mb-1.5">Log food</p>

      <div className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2">
        <Search size={15} className="shrink-0 text-[var(--nourish-subtext)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Anything you ate — dish, brand, restaurant…"
          aria-label="Log food"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--nourish-dark)] outline-none placeholder:text-[var(--nourish-subtext-faint)]"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setAlternates([]);
            }}
            aria-label="Clear"
            className="shrink-0 text-[var(--nourish-subtext-faint)] hover:text-[var(--nourish-dark)]"
          >
            <X size={14} />
          </button>
        )}
        {SR && (
          <button
            type="button"
            onClick={() => {
              try {
                const rec = new SR();
                rec.lang = "en-US";
                rec.interimResults = false;
                rec.onresult = (e) => {
                  const t = e.results?.[0]?.[0]?.transcript;
                  if (t) setQ(t);
                };
                rec.start();
              } catch {
                // mic unavailable — silent
              }
            }}
            aria-label="Dictate"
            className="shrink-0 text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)]"
          >
            <Mic size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={camOpen ? stopCamera : openCamera}
          aria-label="Read a label with the camera"
          className="shrink-0 text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)]"
        >
          <Camera size={15} />
        </button>
      </div>

      {/* Camera — barcode auto-detects; the shutter reads TEXT. */}
      {camOpen && (
        <div className="relative mt-2 overflow-hidden rounded-xl border border-neutral-200">
          <video ref={videoRef} className="h-44 w-full object-cover" muted />
          <button
            type="button"
            onClick={stopCamera}
            aria-label="Close camera"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
          >
            <X size={15} />
          </button>
          <button
            type="button"
            onClick={readText}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-[var(--nourish-dark)] shadow-md active:scale-[0.97]"
          >
            Read the label
          </button>
        </div>
      )}
      {camStatus && (
        <p className="mt-1.5 text-[12px] text-[var(--nourish-subtext)]">
          {camStatus}
        </p>
      )}

      {/* Barcode hit → one-tap log card. */}
      {foundProduct && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
          <span className="min-w-0 flex-1 text-[13px] text-[var(--nourish-dark)]">
            <span className="font-semibold">{foundProduct.name}</span>
            {foundProduct.brand && (
              <span className="text-[var(--nourish-subtext-faint)]">
                {" "}
                · {foundProduct.brand}
              </span>
            )}
            {typeof foundProduct.nutrition.calories === "number" && (
              <span className="text-[var(--nourish-subtext)]">
                {" "}
                · {Math.round(foundProduct.nutrition.calories)} kcal
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => logBrandedFood(foundProduct)}
            className="shrink-0 rounded-full bg-[var(--nourish-green)] px-3 py-1.5 text-[12px] font-semibold text-white active:scale-[0.97]"
          >
            Log it
          </button>
        </div>
      )}

      {/* OCR read something else useful? Offer the alternates as one quiet row. */}
      {alternates.length > 0 && q && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[var(--nourish-subtext-faint)]">
            or try
          </span>
          {alternates.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setQ(a)}
              className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)]/50"
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {/* "dal and rice" → both in one tap. */}
      {multi.length >= 2 && (
        <button
          type="button"
          onClick={() => {
            haptic("commit");
            for (const m of multi) diaryLogCook(m.id, m.name, 1, { date });
            setQ("");
          }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--nourish-green)] px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--nourish-dark-green)] active:scale-[0.97]"
        >
          <Plus size={12} />
          Log all {multi.length}: {multi.map((m) => m.name).join(" + ")}
        </button>
      )}

      {/* ONE merged list: your dishes first, then packaged/restaurant. */}
      {showResults &&
        (locals.length > 0 || branded.length > 0 || searching) && (
          <ul className="mt-2 space-y-1">
            {locals.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => logLocal(m.id, m.name)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-left transition-colors hover:border-[var(--nourish-green)]/50"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--nourish-dark)]">
                    {m.name}
                  </span>
                  {m.kcal !== null && (
                    <span className="shrink-0 text-[12px] text-[var(--nourish-subtext-faint)]">
                      {m.kcal} kcal
                    </span>
                  )}
                  <Plus
                    size={14}
                    className="shrink-0 text-[var(--nourish-green)]"
                  />
                </button>
              </li>
            ))}
            {branded.map((f) => (
              <li key={f.barcode}>
                <button
                  type="button"
                  onClick={() => logBrandedFood(f)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-left transition-colors hover:border-[var(--nourish-green)]/50"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--nourish-dark)]">
                    {f.name}
                    {f.brand && (
                      <span className="text-[var(--nourish-subtext-faint)]">
                        {" "}
                        · {f.brand}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[12px] text-[var(--nourish-subtext-faint)]">
                    {Math.round(f.nutrition.calories)} kcal
                  </span>
                  <Plus
                    size={14}
                    className="shrink-0 text-[var(--nourish-green)]"
                  />
                </button>
              </li>
            ))}
            {searching && branded.length === 0 && (
              <li className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--nourish-subtext-faint)]">
                <Loader2 size={12} className="animate-spin" aria-hidden />
                packaged foods…
              </li>
            )}
          </ul>
        )}

      {/* No-match state — the most common failure moment for a logger. */}
      {showResults &&
        !searching &&
        locals.length === 0 &&
        branded.length === 0 && (
          <p className="mt-2 rounded-xl bg-white px-3 py-3 text-[12.5px] leading-snug text-[var(--nourish-subtext)] shadow-[var(--ring-hairline)]">
            No matches for &ldquo;{q.trim()}&rdquo;. Tap the camera to read a
            label, or check the spelling.
          </p>
        )}

      {/* Empty field → your staples (usual portions), one tight row. */}
      {!showResults && frequents.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {frequents.slice(0, 6).map((r) => (
            <button
              key={r.slug}
              type="button"
              onClick={() => logLocal(r.slug, r.name, r.usual)}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 hover:bg-[var(--nourish-green)]/5"
            >
              <Plus size={12} className="text-[var(--nourish-green)]" />
              {r.name}
              {r.usual !== 1 && (
                <span className="text-[var(--nourish-subtext-faint)]">
                  ×{r.usual}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
