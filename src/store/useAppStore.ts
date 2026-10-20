import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nextProgress } from '../lib/scoring';
import type { ExerciseType, Progress, RoundResult, SessionRecord } from '../lib/types';

export interface Settings {
  sound: boolean;
}

interface AppState {
  progress: Progress;
  history: SessionRecord[];
  settings: Settings;
  applyRound: (type: ExerciseType, result: RoundResult) => void;
  addSession: (record: SessionRecord) => void;
  setSound: (on: boolean) => void;
  resetAll: () => void;
}

export const DEFAULT_PROGRESS: Progress = {
  levels: { letters: 1, listening: 1, shapes: 1 },
  streaks: { letters: 0, listening: 0, shapes: 0 },
};

const MAX_HISTORY = 300;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      progress: DEFAULT_PROGRESS,
      history: [],
      settings: { sound: true },
      applyRound: (type, result) => set((s) => ({ progress: nextProgress(s.progress, type, result) })),
      addSession: (record) => set((s) => ({ history: [...s.history, record].slice(-MAX_HISTORY) })),
      setSound: (on) => set((s) => ({ settings: { ...s.settings, sound: on } })),
      resetAll: () => set({ progress: DEFAULT_PROGRESS, history: [] }),
    }),
    { name: 'hone.v1', version: 1 },
  ),
);
