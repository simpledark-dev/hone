import { makeRng, type Rng } from '../random';
import type { Exercise, ExerciseType } from '../types';
import { generateLetterCount } from './letterCount';
import { generateListening } from './listening';
import { generateVisualCount } from './visualCount';

export function generateExercise(type: ExerciseType, level: number, rng: Rng = makeRng()): Exercise {
  switch (type) {
    case 'letters':
      return generateLetterCount(level, rng);
    case 'listening':
      return generateListening(level, rng);
    case 'shapes':
      return generateVisualCount(level, rng);
  }
}
