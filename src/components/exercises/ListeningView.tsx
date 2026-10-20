import { Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { letterAudio } from '../../lib/audio/engine';
import { cx } from '../../lib/cx';
import { isVowel } from '../../lib/letters';
import type { ListeningExercise, RoundResult } from '../../lib/types';
import { AnswerSlots } from '../ui/AnswerSlots';
import { Button } from '../ui/Button';
import { Keypad } from '../ui/Keypad';
import { LetterTile, PromptHeader } from '../ui/PromptHeader';
import { ResultPanel } from '../ui/ResultPanel';
import { BottomPanel } from './BottomPanel';
import { useRound } from './useRound';

interface Props {
  exercise: ListeningExercise;
  last: boolean;
  onFinish: (result: RoundResult) => void;
}

type Phase = 'idle' | 'loading' | 'playing' | 'answer' | 'interrupted' | 'error';

export function ListeningView({ exercise, last, onFinish }: Props) {
  const round = useRound(exercise, onFinish);
  const { startTimer } = round;
  const [phase, setPhase] = useState<Phase>('idle');
  const [position, setPosition] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => letterAudio.stop(), []);

  const play = useCallback(async () => {
    setPosition(-1);
    setError(null);
    setPhase(letterAudio.ready ? 'playing' : 'loading');
    try {
      await letterAudio.playSequence(exercise.sequence, exercise.intervalMs, {
        onLetter: (i) => setPosition(i),
        onEnd: () => {
          setPhase('answer');
          startTimer();
        },
        onInterrupted: () => setPhase('interrupted'),
      });
      setPhase('playing');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Audio could not start.');
      setPhase('error');
    }
  }, [exercise.sequence, exercise.intervalMs, startTimer]);

  const title = useMemo(() => {
    if (exercise.mode === 'targets') {
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
    }
    return exercise.prompt;
  }, [exercise]);

  const total = exercise.sequence.length;
  const highlightSet = useMemo(() => new Set(exercise.targets), [exercise.targets]);
  const isHighlighted = (l: string) => (exercise.mode === 'targets' ? highlightSet.has(l) : isVowel(l));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PromptHeader title={title} hint={exercise.hint} />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-2">
        {round.result ? (
          <div className="animate-pop w-full rounded-card border border-line bg-surface p-4 shadow-card">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-ink-2">What was played</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {exercise.sequence.map((l, i) => (
                <span
                  key={i}
                  className={cx(
                    'tabular flex h-9 w-9 items-center justify-center rounded-lg text-base font-extrabold',
                    isHighlighted(l) ? 'bg-amber-soft text-ink' : 'bg-surface-2 text-ink-3',
                  )}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        ) : phase === 'idle' || phase === 'loading' ? (
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={play}
              disabled={phase === 'loading'}
              aria-label="Play letters"
              className="flex h-28 w-28 items-center justify-center rounded-full bg-accent text-white shadow-float transition-transform active:scale-95 disabled:opacity-60"
            >
              <Play size={44} strokeWidth={2.2} className="ml-1" fill="currentColor" />
            </button>
            <p className="text-sm font-semibold text-ink-2">
              {phase === 'loading' ? 'Loading audio…' : `Tap to play ${total} letters`}
            </p>
          </div>
        ) : phase === 'playing' ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <span className="absolute inset-0 animate-ping-soft rounded-full bg-accent/20" />
              <span key={position} className={cx('h-20 w-20 rounded-full bg-accent', position >= 0 && 'animate-beat')} />
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 px-6">
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className={cx('h-2.5 w-2.5 rounded-full transition-colors', i <= position ? 'bg-accent' : 'bg-line')} />
              ))}
            </div>
            <p className="text-sm font-semibold text-ink-2">{position < 0 ? 'Get ready…' : 'Listen'}</p>
          </div>
        ) : phase === 'answer' ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap justify-center gap-1.5 px-6">
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className="h-2.5 w-2.5 rounded-full bg-accent/40" />
              ))}
            </div>
            <p className="text-sm font-semibold text-ink-2">{total} letters played. How many?</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 text-center">
            <p className="text-base font-bold text-ink">
              {phase === 'interrupted' ? 'Playback was interrupted' : 'Audio could not start'}
            </p>
            {error && <p className="text-sm text-ink-2">{error}</p>}
            <Button size="md" onClick={play}>
              <RotateCcw size={18} /> Play again
            </Button>
          </div>
        )}
      </div>

      <BottomPanel>
        {round.result ? (
          <ResultPanel result={round.result} slots={exercise.slots} onContinue={round.next} last={last} />
        ) : phase === 'answer' ? (
          <div className="animate-rise space-y-3">
            <AnswerSlots slots={exercise.slots} values={round.values} activeId={round.activeId} onSelect={round.setActiveId} />
            <Keypad onDigit={round.digit} onBackspace={round.backspace} onSubmit={round.submit} canSubmit={round.complete} />
          </div>
        ) : null}
      </BottomPanel>
    </div>
  );
}
