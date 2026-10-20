import { lettersParams } from '../difficulty';
import { ALPHABET } from '../letters';
import { sample, shuffle, uid, type Rng } from '../random';
import type { LetterCountExercise } from '../types';
import { SENTENCES } from './passages';

export function countLetters(text: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const l of ALPHABET) counts[l] = 0;
  for (const ch of text.toUpperCase()) {
    if (counts[ch] !== undefined) counts[ch]++;
  }
  return counts;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

/** Joins random sentences until the passage is close to `targetWords` long. */
export function buildPassage(rng: Rng, targetWords: number): string {
  const chosen: string[] = [];
  let words = 0;
  for (const sentence of shuffle(rng, SENTENCES)) {
    if (words >= targetWords) break;
    const w = wordCount(sentence);
    if (words > 0 && words + w > targetWords + 6) continue;
    chosen.push(sentence);
    words += w;
  }
  return chosen.join(' ');
}

export function promptForTargets(targets: string[]): string {
  if (targets.length === 1) return `Count every ${targets[0]}`;
  return `Count every ${targets.slice(0, -1).join(', ')} and ${targets[targets.length - 1]}`;
}

export function generateLetterCount(level: number, rng: Rng): LetterCountExercise {
  const p = lettersParams(level);
  const passage = buildPassage(rng, p.words);
  const counts = countLetters(passage);

  let candidates = ALPHABET.filter((l) => counts[l]! >= p.minCount && counts[l]! <= p.maxCount);
  if (candidates.length < p.targets) {
    const distance = (l: string) => {
      const c = counts[l]!;
      return c < p.minCount ? p.minCount - c : c > p.maxCount ? c - p.maxCount : 0;
    };
    candidates = ALPHABET.filter((l) => counts[l]! >= 1)
      .sort((a, b) => distance(a) - distance(b))
      .slice(0, Math.max(p.targets, 4));
  }

  const targets = sample(rng, candidates, p.targets).sort();
  const words = wordCount(passage);
  return {
    id: uid(),
    type: 'letters',
    level,
    prompt: promptForTargets(targets),
    hint: 'Upper and lower case both count.',
    slots: targets.map((l) => ({ id: l, label: l, answer: counts[l]! })),
    parMs: Math.round(words * 600 * (0.6 + 0.4 * targets.length)),
    passage,
    targets,
  };
}
