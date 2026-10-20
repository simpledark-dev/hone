import type { Exercise, RoundResult } from '../../lib/types';
import { LetterCountView } from './LetterCountView';
import { ListeningView } from './ListeningView';
import { VisualCountView } from './VisualCountView';

interface Props {
  exercise: Exercise;
  last: boolean;
  onFinish: (result: RoundResult) => void;
}

export function ExerciseView({ exercise, last, onFinish }: Props) {
  switch (exercise.type) {
    case 'letters':
      return <LetterCountView exercise={exercise} last={last} onFinish={onFinish} />;
    case 'listening':
      return <ListeningView exercise={exercise} last={last} onFinish={onFinish} />;
    case 'shapes':
      return <VisualCountView exercise={exercise} last={last} onFinish={onFinish} />;
  }
}
