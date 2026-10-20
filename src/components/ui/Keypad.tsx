import { Check, Delete } from 'lucide-react';
import { cx } from '../../lib/cx';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Colour classes live on each key so no two utilities fight over one property.
const keyBase =
  'flex h-12 items-center justify-center rounded-2xl border text-xl font-bold transition-[transform,background-color] duration-100 active:scale-95';
const keyClass = cx(keyBase, 'border-line bg-surface text-ink shadow-[0_1px_0_rgb(16_24_40_/_0.05)] active:bg-surface-2');

export function Keypad({ onDigit, onBackspace, onSubmit, canSubmit }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Number keypad">
      {DIGITS.map((d) => (
        <button key={d} type="button" className={keyClass} onClick={() => onDigit(d)}>
          {d}
        </button>
      ))}
      <button type="button" className={cx(keyClass, 'text-ink-2')} onClick={onBackspace} aria-label="Delete">
        <Delete size={22} strokeWidth={2.2} />
      </button>
      <button type="button" className={keyClass} onClick={() => onDigit('0')}>
        0
      </button>
      <button
        type="button"
        className={cx(
          keyBase,
          'border-transparent bg-accent text-white shadow-float active:bg-accent-2 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100',
        )}
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-label="Check answer"
      >
        <Check size={24} strokeWidth={2.6} />
      </button>
    </div>
  );
}
