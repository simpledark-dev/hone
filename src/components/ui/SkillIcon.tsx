import { CaseUpper, Ear, Shapes } from 'lucide-react';
import { cx } from '../../lib/cx';
import type { ExerciseType } from '../../lib/types';

const ICON = { letters: CaseUpper, listening: Ear, shapes: Shapes } as const;

interface SkillIconProps {
  type: ExerciseType;
  size?: 'md' | 'sm';
  className?: string;
}

export function SkillIcon({ type, size = 'md', className }: SkillIconProps) {
  const Icon = ICON[type];
  return (
    <span
      className={cx(
        'flex shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent',
        size === 'md' ? 'h-11 w-11' : 'h-8 w-8 rounded-lg',
        className,
      )}
    >
      <Icon size={size === 'md' ? 22 : 16} strokeWidth={2.2} />
    </span>
  );
}
