import { create } from "zustand";

type Phase = "mission" | "grab" | "cook" | "win";
type ChipType = "timer" | "mistake" | "hack" | "fact" | null;

interface CookStore {
  sessionId: string | null;
  currentPhase: Phase;
  currentStepIndex: number;
  totalSteps: number;
  expandedChip: ChipType;
  timerActive: boolean;
  timerRemaining: number;

  // actions
  startSession: (sessionId: string, totalSteps: number) => void;
  setPhase: (phase: Phase) => void;
  setTotalSteps: (total: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleChip: (chip: ChipType) => void;
  startTimer: (seconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  completeSession: () => void;
  reset: () => void;
}

const initialState = {
  sessionId: null as string | null,
  currentPhase: "mission" as Phase,
  currentStepIndex: 0,
  totalSteps: 0,
  expandedChip: null as ChipType,
  timerActive: false,
  timerRemaining: 0,
};

export const useCookStore = create<CookStore>((set, get) => ({
  ...initialState,

  startSession: (sessionId, totalSteps) =>
    set({ ...initialState, sessionId, totalSteps }),

  setPhase: (phase) => set({ currentPhase: phase, expandedChip: null }),

  setTotalSteps: (total) => set({ totalSteps: total }),

  nextStep: () => {
    const { currentStepIndex, totalSteps } = get();
    if (currentStepIndex < totalSteps - 1) {
      set({ currentStepIndex: currentStepIndex + 1, expandedChip: null });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1, expandedChip: null });
    }
  },

  toggleChip: (chip) =>
    set((state) => ({
      expandedChip: state.expandedChip === chip ? null : chip,
    })),

  startTimer: (seconds) => set({ timerActive: true, timerRemaining: seconds }),

  tickTimer: () =>
    set((state) => {
      if (state.timerRemaining <= 1) {
        return { timerActive: false, timerRemaining: 0 };
      }
      return { timerRemaining: state.timerRemaining - 1 };
    }),

  stopTimer: () => set({ timerActive: false, timerRemaining: 0 }),

  completeSession: () => set({ currentPhase: "win" }),

  reset: () => set(initialState),
}));
