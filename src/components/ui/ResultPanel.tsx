import { Check, X } from 'lucide-react';
import { cx } from '../../lib/cx';
import { formatSeconds } from '../../lib/scoring';
import type { AnswerSlot, RoundResult } from '../../lib/types';
import { Button } from './Button';

interface ResultPanelProps {
  result: RoundResult;
  slots: AnswerSlot[];
  onContinue: () => void;
  last: boolean;
}

export function ResultPanel({ result, slots, onContinue, last }: ResultPanelProps) {
  const partial = !result.correct && result.slotsCorrect > 0;
  const title = result.correct ? 'Correct' : partial ? 'Almost' : 'Not quite';
  return (
    <div className="animate-rise rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span
          className={cx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            result.correct ? 'bg-success-soft text-success' : partial ? 'bg-amber-soft text-amber' : 'bg-danger-soft text-danger',
          )}
        >
          {result.correct ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold leading-tight text-ink">{title}</p>
          <p className="text-sm text-ink-2">{formatSeconds(result.timeMs)}</p>
        </div>
        <p className={cx('tabular text-xl font-extrabold', result.score > 0 ? 'text-accent' : 'text-ink-3')}>+{result.score}</p>
      </div>

      {!result.correct && (
        <ul className="mt-3 divide-y divide-line rounded-xl bg-surface-2 px-3">
          {slots.map((slot, i) => {
            const ok = result.given[i] === result.expected[i];
            return (
              <li key={slot.id} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  {slot.color && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: slot.color }} />}
                  {slot.label}
                </span>
                <span className="tabular flex items-center gap-2">
                  <span className={cx('font-bold', ok ? 'text-success' : 'text-danger line-through')}>{result.given[i]}</span>
                  {!ok && <span className="font-bold text-ink">{result.expected[i]}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Button full className="mt-3" onClick={onContinue} autoFocus>
        {last ? 'See results' : 'Continue'}
      </Button>
    </div>
  );
}
