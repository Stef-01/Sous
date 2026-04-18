/**
 * welcome-line — a single, low-stakes greeting that rotates based on the
 * user's streak and recency.
 *
 * Sprint D, Phase 4. Shown once per session under the header. Short,
 * lowercase, never exclaimed — the app's voice, not a marketing banner.
 */

export interface WelcomeLineInput {
  streak: number;
  lastCookIso: string | null;
  now?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function deriveWelcomeLine(input: WelcomeLineInput): string | null {
  const { streak, lastCookIso } = input;
  const now = input.now ?? Date.now();

  // Brand-new user: no cook yet, nothing honest to say.
  if (!lastCookIso && streak === 0) return null;

  if (lastCookIso) {
    const days = Math.floor((now - new Date(lastCookIso).getTime()) / DAY_MS);
    if (days >= 14) return "Good to see you again.";
    if (days >= 7) return "Back after a week.";
  }

  if (streak >= 30) return `${streak} days strong.`;
  if (streak >= 14) return `Day ${streak} — you're cooking again.`;
  if (streak >= 7) return `A full week. Day ${streak}.`;
  if (streak >= 3) return `Day ${streak} of cooking.`;

  return null;
}
