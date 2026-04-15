"use client";

import { useState, useCallback, useEffect } from "react";

interface GameScore {
  gameId: string;
  bestScore: number;
  totalPlays: number;
  lastPlayed: string;
}

interface GameScoresState {
  scores: Record<string, GameScore>;
}

const STORAGE_KEY = "sous-game-scores";

function loadState(): GameScoresState {
  if (typeof window === "undefined") return { scores: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { scores: {} };
  } catch {
    return { scores: {} };
  }
}

function saveState(state: GameScoresState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export function useGameScores() {
  const [state, setState] = useState<GameScoresState>({ scores: {} });
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const recordScore = useCallback((gameId: string, score: number) => {
    setState((prev) => {
      const existing = prev.scores[gameId];
      const updated: GameScoresState = {
        scores: {
          ...prev.scores,
          [gameId]: {
            gameId,
            bestScore: Math.max(score, existing?.bestScore ?? 0),
            totalPlays: (existing?.totalPlays ?? 0) + 1,
            lastPlayed: new Date().toISOString(),
          },
        },
      };
      saveState(updated);
      return updated;
    });
  }, []);

  const getScore = useCallback(
    (gameId: string): GameScore | null => {
      return state.scores[gameId] ?? null;
    },
    [state.scores],
  );

  return { mounted, recordScore, getScore, allScores: state.scores };
}
