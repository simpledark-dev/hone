import type { ReactNode } from 'react';

interface PromptHeaderProps {
  title: ReactNode;
  hint?: string;
}

export function PromptHeader({ title, hint }: PromptHeaderProps) {
  return (
    <header className="pb-2 pt-1">
      <h1 className="text-[22px] font-extrabold leading-snug tracking-tight text-ink">{title}</h1>
      {hint && <p className="mt-1 text-sm text-ink-2">{hint}</p>}
    </header>
  );
}

export function LetterTile({ children }: { children: ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-accent-soft px-1.5 align-[-4px] text-[20px] font-extrabold text-accent">
      {children}
    </span>
  );
}
