import { create } from "zustand";

const GEMINI_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY ?? "";
const GEMINI_MODEL = (import.meta as any).env?.VITE_GEMINI_MODEL ?? "gemini-1.5-flash";
const DEFAULT_MODEL = "gemini";

type SettingsState = {
  rounds: number;
  temperature: number;
  maxTokens: number;
  model: string;
  apiEndpoint: string;
  apiKey: string;
  apiModel: string;
  geminiKey: string;
  geminiModel: string;
  setRounds: (v: number) => void;
  setTemperature: (v: number) => void;
  setMaxTokens: (v: number) => void;
  setModel: (v: string) => void;
  setApiEndpoint: (v: string) => void;
  setApiKey: (v: string) => void;
  setApiModel: (v: string) => void;
  setGeminiKey: (v: string) => void;
  setGeminiModel: (v: string) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  rounds: 2,
  temperature: 0.7,
  maxTokens: 512,
  model: DEFAULT_MODEL,
  apiEndpoint: "",
  apiKey: "",
  apiModel: "",
  geminiKey: GEMINI_KEY,
  geminiModel: GEMINI_MODEL,
  setRounds: (v) => set({ rounds: v }),
  setTemperature: (v) => set({ temperature: v }),
  setMaxTokens: (v) => set({ maxTokens: v }),
  setModel: (v) => set({ model: v }),
  setApiEndpoint: (v) => set({ apiEndpoint: v }),
  setApiKey: (v) => set({ apiKey: v }),
  setApiModel: (v) => set({ apiModel: v }),
  setGeminiKey: (v) => set((state) => ({ geminiKey: v, model: v ? "gemini" : state.model })),
  setGeminiModel: (v) => set({ geminiModel: v }),
}));


