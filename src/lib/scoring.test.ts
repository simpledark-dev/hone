import { describe, expect, it } from 'vitest';
import { mulberry32 } from './random';
import { generateLetterCount } from './exercises/letterCount';
import { levelMultiplier, nextProgress, PERFECT_BONUS, ROUND_BASE, scoreRound, SPEED_BONUS_MAX } from './scoring';
import type { Progress } from './types';

const base: Progress = { levels: { letters: 1, listening: 1, shapes: 1 }, streaks: { letters: 0, listening: 0, shapes: 0 } };

describe('scoreRound', () => {
  const ex = generateLetterCount(3, mulberry32(7));
  const expected = ex.slots.map((s) => s.answer);

  it('awards full marks plus bonuses for an instant perfect answer', () => {
    const r = scoreRound({ exercise: ex, given: expected, timeMs: 0 });
    expect(r.correct).toBe(true);
    expect(r.score).toBe(Math.round((ROUND_BASE + PERFECT_BONUS + SPEED_BONUS_MAX) * levelMultiplier(3)));
  });

  it('awards no speed bonus when slower than par', () => {
    const r = scoreRound({ exercise: ex, given: expected, timeMs: ex.parMs * 2 });
    expect(r.score).toBe(Math.round((ROUND_BASE + PERFECT_BONUS) * levelMultiplier(3)));
  });

  it('scores zero for a wrong single answer', () => {
    const r = scoreRound({ exercise: ex, given: expected.map((n) => n + 1), timeMs: 1000 });
    expect(r.correct).toBe(false);
    expect(r.slotsCorrect).toBe(0);
    expect(r.score).toBe(0);
  });
});

describe('nextProgress', () => {
  const win = { correct: true } as Parameters<typeof nextProgress>[2];
  const loss = { correct: false } as Parameters<typeof nextProgress>[2];

  it('levels up after one clean round at low levels', () => {
    expect(nextProgress(base, 'letters', win).levels.letters).toBe(2);
  });

  it('needs two clean rounds at level 4 and above', () => {
    const p4: Progress = { ...base, levels: { ...base.levels, shapes: 4 } };
    const once = nextProgress(p4, 'shapes', win);
    expect(once.levels.shapes).toBe(4);
    expect(once.streaks.shapes).toBe(1);
    const twice = nextProgress(once, 'shapes', win);
    expect(twice.levels.shapes).toBe(5);
    expect(twice.streaks.shapes).toBe(0);
  });

  it('drops a level on a miss but never below 1', () => {
    expect(nextProgress(base, 'listening', loss).levels.listening).toBe(1);
    const p3: Progress = { ...base, levels: { ...base.levels, listening: 3 } };
    expect(nextProgress(p3, 'listening', loss).levels.listening).toBe(2);
  });
});
