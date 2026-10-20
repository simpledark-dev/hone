import type { ExerciseType, ListeningMode } from './types';
import { POOL_DISTINCT, POOL_FULL, POOL_MEDIUM } from './letters';

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;

export function clampLevel(level: number): number {
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(level)));
}

/** Linear interpolation across the level range, returned as a float. */
function lerp(level: number, atMin: number, atMax: number): number {
  const t = (clampLevel(level) - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL);
  return atMin + (atMax - atMin) * t;
}

export interface LettersParams {
  words: number;
  targets: number;
  minCount: number;
  maxCount: number;
}

export function lettersParams(level: number): LettersParams {
  const l = clampLevel(level);
  return {
    words: Math.round(lerp(l, 24, 78)),
    targets: l <= 3 ? 1 : l <= 7 ? 2 : 3,
    minCount: 2,
    maxCount: Math.round(lerp(l, 8, 18)),
  };
}

export interface ListeningParams {
  length: number;
  intervalMs: number;
  targets: number;
  pool: string[];
  modes: ListeningMode[];
}

export function listeningParams(level: number): ListeningParams {
  const l = clampLevel(level);
  return {
    length: Math.round(lerp(l, 6, 18)),
    intervalMs: Math.round(lerp(l, 1300, 720) / 10) * 10,
    targets: l <= 3 ? 1 : l <= 9 ? 2 : 3,
    pool: l <= 3 ? POOL_DISTINCT : l <= 6 ? POOL_MEDIUM : POOL_FULL,
    modes: l <= 3 ? ['targets'] : l <= 7 ? ['targets', 'vowels'] : ['targets', 'vowelsConsonants'],
  };
}

export interface ShapesParams {
  count: number;
  colors: number;
  kinds: number;
  queries: number;
  /** 0..1, how much shape sizes vary around the base size. */
  sizeVariance: number;
  /** 0..1, how much shapes may overlap (0 = never). */
  overlap: number;
  rotate: boolean;
  /** Whether a query may legitimately have the answer 0. */
  allowZero: boolean;
  /** Share of non-matching shapes that share one attribute with a query. */
  distractorRatio: number;
}

export function shapesParams(level: number): ShapesParams {
  const l = clampLevel(level);
  return {
    count: Math.round(lerp(l, 10, 40)),
    colors: Math.round(lerp(l, 3, 8)),
    kinds: Math.round(lerp(l, 2, 6)),
    queries: l <= 4 ? 1 : 2,
    sizeVariance: lerp(l, 0.1, 0.5),
    overlap: l >= 7 ? lerp(l, 0, 0.3) : 0,
    rotate: l >= 5,
    allowZero: l >= 6,
    distractorRatio: lerp(l, 0.3, 0.65),
  };
}

export const EXERCISE_LABEL: Record<ExerciseType, string> = {
  letters: 'Letter count',
  listening: 'Listening count',
  shapes: 'Shape count',
};

export const EXERCISE_BLURB: Record<ExerciseType, string> = {
  letters: 'Scan a passage and count target letters.',
  listening: 'Track spoken letters without seeing them.',
  shapes: 'Count shapes by colour and form among distractors.',
};
