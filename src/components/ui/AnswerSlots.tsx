import { cx } from '../../lib/cx';

export interface SlotView {
  id: string;
  label: string;
  color?: string;
}

interface AnswerSlotsProps {
  slots: SlotView[];
  values: Record<string, string>;
  activeId: string;
  onSelect: (id: string) => void;
}

export function AnswerSlots({ slots, values, activeId, onSelect }: AnswerSlotsProps) {
  const multiple = slots.length > 1;
  return (
    <div className="flex justify-center gap-2">
      {slots.map((slot) => {
        const active = slot.id === activeId;
        const value = values[slot.id] ?? '';
        return (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSelect(slot.id)}
            aria-pressed={active}
            className={cx(
              'flex min-w-[96px] max-w-[180px] flex-1 flex-col items-center rounded-2xl border-2 px-3 py-2 transition-colors',
              active ? 'border-accent bg-accent-soft' : 'border-line bg-surface',
              !multiple && 'max-w-[220px]',
            )}
          >
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-2">
              {slot.color && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: slot.color }} />}
              {slot.label}
            </span>
            <span className={cx('tabular mt-0.5 h-8 text-[26px] font-extrabold leading-8', value ? 'text-ink' : 'text-ink-3')}>
              {value || (active ? <span className="inline-block h-6 w-[2px] translate-y-[3px] animate-pulse bg-accent" /> : '–')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
