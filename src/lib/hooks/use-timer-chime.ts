/**
 * Timer chime — Web Audio API sound for cook timer completion.
 *
 * Plays a pleasant two-tone ascending chime (think kitchen timer "ding-ding").
 * Falls back silently if Web Audio API is unavailable.
 *
 * Samsung Food insight: audible cues free the cook from watching the screen.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    // Resume if suspended (autoplay policy)
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a two-note ascending chime — a clean, kitchen-friendly "ding ding".
 * Uses sine waves with quick envelope for a bell-like timbre.
 */
export function playTimerChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Two ascending notes: C5 (523 Hz) then E5 (659 Hz)
  const notes = [
    { freq: 523.25, start: 0, dur: 0.25 },
    { freq: 659.25, start: 0.2, dur: 0.35 },
  ];

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(note.freq, now + note.start);

    // Bell-like envelope: quick attack, medium decay
    gain.gain.setValueAtTime(0, now + note.start);
    gain.gain.linearRampToValueAtTime(0.3, now + note.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + note.start + note.dur,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.start);
    osc.stop(now + note.start + note.dur);
  }
}
