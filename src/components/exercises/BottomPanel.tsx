import type { ReactNode } from 'react';

/** Sticks answer entry (or the result) to the bottom of the exercise screen. */
export function BottomPanel({ children }: { children: ReactNode }) {
  return <div className="shrink-0 space-y-3 pb-3 pt-2">{children}</div>;
}
