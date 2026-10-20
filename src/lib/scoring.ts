import type { Exercise, ExerciseType, Progress, RoundResult } from './types';
import { clampLevel } from './difficulty';

export const ROUND_BASE = 200;
export const PERFECT_BONUS = 50;
export const SPEED_BONUS_MAX = 100;

export function levelMultiplier(level: number): number {
  return 1 + 0.2 * (clampLevel(level) - 1);
}

export interface ScoreInput {
  exercise: Exercise;
  given: number[];
  timeMs: number;
}

export function scoreRound({ exercise, given, timeMs }: ScoreInput): RoundResult {
  const expected = exercise.slots.map((s) => s.answer);
  const slotsTotal = expected.length;
  let slotsCorrect = 0;
  for (let i = 0; i < slotsTotal; i++) if (given[i] === expected[i]) slotsCorrect++;
  const correct = slotsCorrect === slotsTotal;

  const mult = levelMultiplier(exercise.level);
  let score = (ROUND_BASE / slotsTotal) * slotsCorrect;
  if (correct) {
    score += PERFECT_BONUS;
    const speed = Math.max(0, Math.min(1, (exercise.parMs - timeMs) / exercise.parMs));
    score += SPEED_BONUS_MAX * speed;
  }
  score = Math.round(score * mult);

  return {
    exerciseId: exercise.id,
    type: exercise.type,
    level: exercise.level,
    given,
    expected,
    correct,
    slotsCorrect,
    slotsTotal,
    timeMs,
    score,
  };
}

/**
 * Adaptive difficulty: early levels move up after one clean round, later
 * levels need two in a row. Any mistake drops one level and resets the streak.
 */
export function nextProgress(progress: Progress, type: ExerciseType, result: RoundResult): Progress {
  const level = progress.levels[type];
  const streak = progress.streaks[type];
  let nextLevel = level;
  let nextStreak = streak;

  if (result.correct) {
    nextStreak = streak + 1;
    const needed = level < 4 ? 1 : 2;
    if (nextStreak >= needed) {
      nextLevel = clampLevel(level + 1);
      nextStreak = 0;
    }
  } else {
    nextLevel = clampLevel(level - 1);
    nextStreak = 0;
  }

  return {
    levels: { ...progress.levels, [type]: nextLevel },
    streaks: { ...progress.streaks, [type]: nextStreak },
  };
}

export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}

export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
