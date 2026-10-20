import { useEffect, useMemo } from 'react';
import type { LetterCountExercise, RoundResult } from '../../lib/types';
import { AnswerSlots } from '../ui/AnswerSlots';
import { Keypad } from '../ui/Keypad';
import { LetterTile, PromptHeader } from '../ui/PromptHeader';
import { ResultPanel } from '../ui/ResultPanel';
import { BottomPanel } from './BottomPanel';
import { useRound } from './useRound';

interface Props {
  exercise: LetterCountExercise;
  last: boolean;
  onFinish: (result: RoundResult) => void;
}

export function LetterCountView({ exercise, last, onFinish }: Props) {
  const round = useRound(exercise, onFinish);
  const { startTimer } = round;
  useEffect(() => startTimer(), [startTimer]);

  const title = useMemo(() => {
    const t = exercise.targets;
    return (
      <>
        Count every{' '}
        {t.map((l, i) => (
          <span key={l}>
            {i > 0 && (i === t.length - 1 ? ' and ' : ', ')}
            <LetterTile>{l}</LetterTile>
          </span>
        ))}
      </>
    );
  }, [exercise.targets]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PromptHeader title={title} hint={exercise.hint} />
      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 py-2">
        <div className="rounded-card border border-line bg-surface p-5 shadow-card">
          <Passage text={exercise.passage} highlight={round.result ? exercise.targets : []} />
        </div>
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

function Passage({ text, highlight }: { text: string; highlight: string[] }) {
  if (highlight.length === 0) {
    return <p className="no-select text-[17px] leading-[1.75] text-ink">{text}</p>;
  }
  const set = new Set(highlight.map((l) => l.toUpperCase()));
  const nodes: React.ReactNode[] = [];
  let run = '';
  let key = 0;
  const flush = () => {
    if (run) nodes.push(<span key={key++}>{run}</span>);
    run = '';
  };
  for (const ch of text) {
    if (set.has(ch.toUpperCase())) {
      flush();
      nodes.push(
        <mark key={key++} className="rounded-[3px] bg-amber-soft px-[1px] font-extrabold text-ink">
          {ch}
        </mark>,
      );
    } else {
      run += ch;
    }
  }
  flush();
  return <p className="no-select text-[17px] leading-[1.75] text-ink">{nodes}</p>;
}
