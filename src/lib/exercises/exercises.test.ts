import { describe, expect, it } from 'vitest';
import { lettersParams, listeningParams, shapesParams } from '../difficulty';
import { ALPHABET, isVowel } from '../letters';
import { mulberry32 } from '../random';
import { planSession } from '../session';
import { countLetters, generateLetterCount, wordCount } from './letterCount';
import { generateListening } from './listening';
import { generateVisualCount, matchesQuery } from './visualCount';

const SEEDS = Array.from({ length: 30 }, (_, i) => i + 1);
const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

describe('letter counting', () => {
  it('answers match the real letter counts and respect level parameters', () => {
    for (const level of LEVELS) {
      const p = lettersParams(level);
      for (const seed of SEEDS) {
        const ex = generateLetterCount(level, mulberry32(seed));
        const counts = countLetters(ex.passage);
        expect(ex.slots).toHaveLength(p.targets);
        for (const slot of ex.slots) {
          expect(slot.answer).toBe(counts[slot.id]);
          expect(slot.answer).toBeGreaterThanOrEqual(1);
        }
        expect(new Set(ex.targets).size).toBe(ex.targets.length);
        const words = wordCount(ex.passage);
        expect(words).toBeGreaterThanOrEqual(p.words - 12);
        expect(words).toBeLessThanOrEqual(p.words + 12);
      }
    }
  });

  it('counts case-insensitively', () => {
    expect(countLetters('Gg tT')['G']).toBe(2);
    expect(countLetters('Gg tT')['T']).toBe(2);
  });
});

describe('listening', () => {
  it('sequence length, pool and answers are consistent', () => {
    for (const level of LEVELS) {
      const p = listeningParams(level);
      for (const seed of SEEDS) {
        const ex = generateListening(level, mulberry32(seed));
        expect(ex.sequence).toHaveLength(p.length);
        expect(ex.intervalMs).toBe(p.intervalMs);
        for (const l of ex.sequence) expect(p.pool).toContain(l);
        if (ex.mode === 'targets') {
          expect(ex.slots).toHaveLength(p.targets);
          for (const slot of ex.slots) {
            expect(slot.answer).toBe(ex.sequence.filter((l) => l === slot.id).length);
            expect(slot.answer).toBeGreaterThanOrEqual(1);
          }
        } else {
          const vowels = ex.sequence.filter(isVowel).length;
          expect(ex.slots[0]?.answer).toBe(vowels);
          if (ex.mode === 'vowelsConsonants') expect(ex.slots[1]?.answer).toBe(ex.sequence.length - vowels);
        }
      }
    }
  });
});

describe('visual counting', () => {
  it('answers equal the number of matching shapes and shapes stay in bounds', () => {
    for (const level of LEVELS) {
      const p = shapesParams(level);
      for (const seed of SEEDS) {
        const ex = generateVisualCount(level, mulberry32(seed));
        expect(ex.shapes.length).toBeLessThanOrEqual(p.count);
        expect(ex.shapes.length).toBeGreaterThanOrEqual(p.count - 4);
        expect(ex.queries).toHaveLength(p.queries);
        ex.queries.forEach((q, i) => {
          const actual = ex.shapes.filter((s) => matchesQuery(s, q)).length;
          expect(ex.slots[i]?.answer).toBe(actual);
          if (!p.allowZero) expect(actual).toBeGreaterThanOrEqual(1);
        });
        for (const s of ex.shapes) {
          expect(s.x - s.r).toBeGreaterThanOrEqual(0);
          expect(s.x + s.r).toBeLessThanOrEqual(ex.width);
          expect(s.y - s.r).toBeGreaterThanOrEqual(0);
          expect(s.y + s.r).toBeLessThanOrEqual(ex.height);
        }
      }
    }
  });

  it('never overlaps shapes at low levels', () => {
    for (const seed of SEEDS) {
      const ex = generateVisualCount(2, mulberry32(seed));
      for (let i = 0; i < ex.shapes.length; i++) {
        for (let j = i + 1; j < ex.shapes.length; j++) {
          const a = ex.shapes[i]!;
          const b = ex.shapes[j]!;
          expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual((a.r + b.r) * 0.98);
        }
      }
    }
  });
});

describe('session planning', () => {
  it('mixed sessions use every type equally with no back-to-back repeats', () => {
    for (const seed of SEEDS) {
      const plan = planSession('mixed', mulberry32(seed));
      expect(plan).toHaveLength(6);
      for (const t of ['letters', 'listening', 'shapes'] as const) {
        expect(plan.filter((x) => x === t)).toHaveLength(2);
      }
      for (let i = 1; i < plan.length; i++) expect(plan[i]).not.toBe(plan[i - 1]);
    }
  });

  it('single-skill sessions only contain that skill', () => {
    expect(planSession('shapes', mulberry32(1)).every((t) => t === 'shapes')).toBe(true);
  });
});

describe('alphabet helpers', () => {
  it('has 26 letters', () => {
    expect(ALPHABET).toHaveLength(26);
  });
});
