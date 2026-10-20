import { listeningParams } from '../difficulty';
import { isVowel } from '../letters';
import { pick, randInt, sample, shuffle, uid, type Rng } from '../random';
import type { AnswerSlot, ListeningExercise, ListeningMode } from '../types';
import { promptForTargets } from './letterCount';

function hasTriple(seq: string[]): boolean {
  for (let i = 2; i < seq.length; i++) {
    if (seq[i] === seq[i - 1] && seq[i - 1] === seq[i - 2]) return true;
  }
  return false;
}

/** Shuffles, avoiding the same letter three times in a row where possible. */
export function arrangeSequence(rng: Rng, items: string[]): string[] {
  let best = shuffle(rng, items);
  for (let attempt = 0; attempt < 24 && hasTriple(best); attempt++) best = shuffle(rng, items);
  return best;
}

export function generateListening(level: number, rng: Rng): ListeningExercise {
  const p = listeningParams(level);
  const mode: ListeningMode = pick(rng, p.modes);
  let sequence: string[];
  let targets: string[] = [];
  let slots: AnswerSlot[];
  let prompt: string;
  let hint: string;

  if (mode === 'targets') {
    targets = sample(rng, p.pool, p.targets).sort();
    const others = p.pool.filter((l) => !targets.includes(l));
    const maxTotal = Math.max(targets.length, Math.round(p.length * 0.55));
    const perTargetMax = Math.max(1, Math.floor(maxTotal / targets.length));
    const counts = targets.map(() => randInt(rng, 1, perTargetMax));
    const items: string[] = [];
    targets.forEach((t, i) => {
      for (let k = 0; k < counts[i]!; k++) items.push(t);
    });
    while (items.length < p.length) items.push(pick(rng, others));
    sequence = arrangeSequence(rng, items);
    slots = targets.map((t, i) => ({ id: t, label: t, answer: counts[i]! }));
    prompt = promptForTargets(targets);
    hint = 'Each letter is spoken once, at a steady pace.';
  } else {
    const vowels = p.pool.filter(isVowel);
    const consonants = p.pool.filter((l) => !isVowel(l));
    const nVowels = randInt(rng, Math.max(1, Math.round(p.length * 0.25)), Math.round(p.length * 0.55));
    const nConsonants = p.length - nVowels;
    const items: string[] = [];
    for (let i = 0; i < nVowels; i++) items.push(pick(rng, vowels));
    for (let i = 0; i < nConsonants; i++) items.push(pick(rng, consonants));
    sequence = arrangeSequence(rng, items);
    if (mode === 'vowels') {
      slots = [{ id: 'vowels', label: 'Vowels', answer: nVowels }];
      prompt = 'Count the vowels';
    } else {
      slots = [
        { id: 'vowels', label: 'Vowels', answer: nVowels },
        { id: 'consonants', label: 'Consonants', answer: nConsonants },
      ];
      prompt = 'Count vowels and consonants';
    }
    hint = 'Vowels are A, E, I, O and U.';
  }

  return {
    id: uid(),
    type: 'listening',
    level,
    prompt,
    hint,
    slots,
    parMs: 2500 + 1500 * slots.length,
    mode,
    sequence,
    intervalMs: p.intervalMs,
    targets,
  };
}
