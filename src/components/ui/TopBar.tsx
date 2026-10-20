import { X } from 'lucide-react';
import { cx } from '../../lib/cx';

interface TopBarProps {
  index: number;
  total: number;
  level: number;
  onClose: () => void;
}

export function TopBar({ index, total, level, onClose }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <button
        type="button"
        onClick={onClose}
        aria-label="End session"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-2 active:bg-surface-2"
      >
        <X size={18} strokeWidth={2.4} />
      </button>
      <div className="flex flex-1 gap-1" aria-label={`Round ${index + 1} of ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cx(
              'h-2 flex-1 rounded-full transition-colors',
              i < index ? 'bg-accent' : i === index ? 'bg-accent/45' : 'bg-line',
            )}
          />
        ))}
      </div>
      <span className="tabular shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-ink-2">Lv {level}</span>
    </div>
  );
}
