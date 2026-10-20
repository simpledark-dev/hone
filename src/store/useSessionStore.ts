import { create } from 'zustand';
import { generateExercise } from '../lib/exercises';
import { makeRng } from '../lib/random';
import { planSession } from '../lib/session';
import type { Exercise, ExerciseType, RoundResult, SessionMode, SessionRecord } from '../lib/types';
import { uid } from '../lib/random';

type Levels = Record<ExerciseType, number>;

interface SessionState {
  status: 'idle' | 'running' | 'done';
  mode: SessionMode;
  plan: ExerciseType[];
  index: number;
  results: RoundResult[];
  startedAt: number;
  current: Exercise | null;
  lastRecord: SessionRecord | null;
  start: (mode: SessionMode, levels: Levels) => void;
  /** Records a finished round and prepares the next one, or finishes the session. */
  complete: (result: RoundResult, levels: Levels) => SessionRecord | null;
  abandon: () => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  status: 'idle',
  mode: 'mixed',
  plan: [],
  index: 0,
  results: [],
  startedAt: 0,
  current: null,
  lastRecord: null,

  start: (mode, levels) => {
    const plan = planSession(mode, makeRng());
    const first = plan[0]!;
    set({
      status: 'running',
      mode,
      plan,
      index: 0,
      results: [],
      startedAt: Date.now(),
      current: generateExercise(first, levels[first]),
    });
  },

  complete: (result, levels) => {
    const { plan, index, results, startedAt, mode } = get();
    const nextResults = [...results, result];
    const nextIndex = index + 1;
    if (nextIndex >= plan.length) {
      const endedAt = Date.now();
      const slotsTotal = nextResults.reduce((a, r) => a + r.slotsTotal, 0);
      const slotsCorrect = nextResults.reduce((a, r) => a + r.slotsCorrect, 0);
      const record: SessionRecord = {
        id: uid(),
        mode,
        startedAt,
        endedAt,
        rounds: nextResults,
        score: nextResults.reduce((a, r) => a + r.score, 0),
        accuracy: slotsTotal ? slotsCorrect / slotsTotal : 0,
        durationMs: endedAt - startedAt,
      };
      set({ status: 'done', results: nextResults, index: nextIndex, current: null, lastRecord: record });
      return record;
    }
    const type = plan[nextIndex]!;
    set({ results: nextResults, index: nextIndex, current: generateExercise(type, levels[type]) });
    return null;
  },

  abandon: () => set({ status: 'idle', current: null, results: [], index: 0, plan: [] }),
}));
