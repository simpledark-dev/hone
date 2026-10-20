import { shuffle, type Rng } from './random';
import { EXERCISE_TYPES, type ExerciseType, type SessionMode } from './types';

export const MIXED_ROUNDS = 6;
export const SINGLE_ROUNDS = 5;

export function roundsFor(mode: SessionMode): number {
  return mode === 'mixed' ? MIXED_ROUNDS : SINGLE_ROUNDS;
}

export function estimatedMinutes(mode: SessionMode): number {
  return mode === 'mixed' ? 4 : 3;
}

function hasAdjacentDuplicate(plan: ExerciseType[]): boolean {
  return plan.some((t, i) => i > 0 && plan[i - 1] === t);
}

/** Order of exercise types for a session. Mixed sessions never repeat a type back to back. */
export function planSession(mode: SessionMode, rng: Rng): ExerciseType[] {
  if (mode !== 'mixed') return Array.from({ length: SINGLE_ROUNDS }, () => mode);
  const perType = MIXED_ROUNDS / EXERCISE_TYPES.length;
  const base = EXERCISE_TYPES.flatMap((t) => Array.from({ length: perType }, () => t));
  let plan = shuffle(rng, base);
  for (let i = 0; i < 60 && hasAdjacentDuplicate(plan); i++) plan = shuffle(rng, base);
  if (hasAdjacentDuplicate(plan)) {
    const order = shuffle(rng, EXERCISE_TYPES);
    plan = Array.from({ length: MIXED_ROUNDS }, (_, i) => order[i % order.length]!);
  }
  return plan;
}
