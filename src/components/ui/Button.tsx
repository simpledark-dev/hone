import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'lg' | 'md' | 'sm';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-float hover:bg-accent-2',
  secondary: 'bg-surface text-ink border border-line shadow-card hover:bg-surface-2',
  ghost: 'bg-transparent text-ink-2 hover:bg-surface-2',
  danger: 'bg-danger-soft text-danger hover:bg-danger/15',
};

const SIZE: Record<Size, string> = {
  lg: 'h-14 px-6 text-[17px] rounded-2xl',
  md: 'h-12 px-5 text-[15px] rounded-2xl',
  sm: 'h-10 px-4 text-sm rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export function Button({ variant = 'primary', size = 'lg', full = false, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 font-bold transition-[transform,background-color,opacity] duration-150 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100',
        VARIANT[variant],
        SIZE[size],
        full && 'w-full',
        className,
      )}
      {...rest}
    />
  );
}
