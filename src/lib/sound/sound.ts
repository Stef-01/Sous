/**
 * W36 — an optional, OFF-by-default sound set. Tones are SYNTHESISED via Web
 * Audio (no asset files, no bundle weight) and only play when the user has opted
 * in. Silent on the server, when disabled, or where Web Audio is unavailable.
 */

export type SoundType = "select" | "win" | "timer";

const KEY = "sous-sound-on";
const FREQ: Record<SoundType, number> = { select: 440, win: 660, timer: 880 };

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    window.localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    // ignore
  }
}

export function playSound(type: SoundType): void {
  if (typeof window === "undefined" || !isSoundEnabled()) return;
  try {
    const w = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctx = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = FREQ[type];
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  } catch {
    // audio blocked / unavailable — silent
  }
}
