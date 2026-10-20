import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface ScreenProps {
  children: ReactNode;
  /** Lock to the viewport height and let children manage their own scrolling. */
  fixed?: boolean;
  className?: string;
}

export function Screen({ children, fixed = false, className }: ScreenProps) {
  return (
    <div
      className={cx(
        'mx-auto flex w-full max-w-md flex-col px-5 pt-safe pb-safe',
        fixed ? 'h-dvh overflow-hidden' : 'min-h-dvh',
        className,
      )}
    >
      {children}
    </div>
  );
}
