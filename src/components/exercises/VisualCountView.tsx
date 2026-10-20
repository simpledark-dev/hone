import { useEffect } from 'react';
import { describeQuery } from '../../lib/exercises/visualCount';
import type { RoundResult, VisualCountExercise } from '../../lib/types';
import { AnswerSlots } from '../ui/AnswerSlots';
import { Keypad } from '../ui/Keypad';
import { PromptHeader } from '../ui/PromptHeader';
import { ResultPanel } from '../ui/ResultPanel';
import { BottomPanel } from './BottomPanel';
import { ShapeField } from './ShapeField';
import { useRound } from './useRound';

interface Props {
  exercise: VisualCountExercise;
  last: boolean;
  onFinish: (result: RoundResult) => void;
}

export function VisualCountView({ exercise, last, onFinish }: Props) {
  const round = useRound(exercise, onFinish);
  const { startTimer } = round;
  useEffect(() => startTimer(), [startTimer]);

  const single = exercise.queries.length === 1;
  const title = single ? (
    <>
      How many{' '}
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent-soft px-2 py-0.5 align-[-2px] text-accent">
        {exercise.slots[0]?.color && (
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: exercise.slots[0].color }} />
        )}
        {describeQuery(exercise.queries[0]!)}
      </span>
      ?
    </>
  ) : (
    'How many of each?'
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PromptHeader title={title} hint={exercise.hint} />
      <div className="flex min-h-0 flex-1 items-center justify-center py-1">
        <ShapeField exercise={exercise} reveal={!!round.result} />
      </div>
      <BottomPanel>
        {round.result ? (
          <ResultPanel result={round.result} slots={exercise.slots} onContinue={round.next} last={last} />
        ) : (
          <>
            <AnswerSlots slots={exercise.slots} values={round.values} activeId={round.activeId} onSelect={round.setActiveId} />
            <Keypad onDigit={round.digit} onBackspace={round.backspace} onSubmit={round.submit} canSubmit={round.complete} />
          </>
        )}
      </BottomPanel>
    </div>
  );
}
