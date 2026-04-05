import { create } from "zustand";

interface TodayStore {
  inputMode: "text" | "camera" | null;
  cravingText: string;
  capturedPhoto: string | null;
  recognizedDish: {
    dishName: string;
    confidence: number;
    cuisine: string;
    isHomemade: boolean;
    alternates: string[];
  } | null;
  selectedSideId: string | null;
  isLoading: boolean;

  // actions
  setInputMode: (mode: "text" | "camera") => void;
  setCravingText: (text: string) => void;
  setCapturedPhoto: (url: string) => void;
  setRecognizedDish: (
    result: TodayStore["recognizedDish"]
  ) => void;
  selectSide: (sideId: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  inputMode: null as TodayStore["inputMode"],
  cravingText: "",
  capturedPhoto: null as string | null,
  recognizedDish: null as TodayStore["recognizedDish"],
  selectedSideId: null as string | null,
  isLoading: false,
};

export const useTodayStore = create<TodayStore>((set) => ({
  ...initialState,

  setInputMode: (mode) => set({ inputMode: mode }),
  setCravingText: (text) => set({ cravingText: text }),
  setCapturedPhoto: (url) => set({ capturedPhoto: url }),
  setRecognizedDish: (result) => set({ recognizedDish: result }),
  selectSide: (sideId) => set({ selectedSideId: sideId }),
  setLoading: (loading) => set({ isLoading: loading }),
  reset: () => set(initialState),
}));
