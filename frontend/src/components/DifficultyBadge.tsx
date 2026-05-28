import { getDifficultyText } from '@/utils/helpers';
import clsx from 'clsx';

interface DifficultyBadgeProps {
  difficulty: string;
  size?: 'sm' | 'md';
}

export function DifficultyBadge({
  difficulty,
  size = 'sm',
}: DifficultyBadgeProps) {
  const level = difficulty?.toLowerCase() || 'medium';

  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        level === 'easy' && 'bg-emerald-100 text-emerald-800',
        level === 'medium' && 'bg-amber-100 text-amber-900',
        level === 'hard' && 'bg-rose-100 text-rose-800',
        !['easy', 'medium', 'hard'].includes(level) && 'bg-gray-100 text-gray-700'
      )}
    >
      {getDifficultyText(difficulty)}
    </span>
  );
}
