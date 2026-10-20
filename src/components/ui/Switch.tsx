import { cx } from '../../lib/cx';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-8 w-14 shrink-0 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-line')}
    >
      <span
        className={cx(
          'absolute top-1 h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0_/_0.25)] transition-transform',
          checked ? 'translate-x-7' : 'translate-x-1',
        )}
      />
    </button>
  );
}
