import { create } from "zustand";

export type FinalDecision = {
  selected: string;
  rationale: string;
  risks: string[];
  assumptions: string[];
  time_horizon: string;
};

type DebateState = {
  finalDecision: FinalDecision | null;
  setFinal: (d: FinalDecision) => void;
  clear: () => void;
};

export const useDebateStore = create<DebateState>((set) => ({
  finalDecision: null,
  setFinal: (d) => set({ finalDecision: d }),
  clear: () => set({ finalDecision: null })
}));


