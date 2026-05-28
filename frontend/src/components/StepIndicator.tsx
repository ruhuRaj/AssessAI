'use client';

import Link from 'next/link';
import clsx from 'clsx';

export type AppStep = 'create' | 'generate' | 'paper';

const STEPS: { id: AppStep; label: string; path: string }[] = [
  { id: 'create', label: 'Create', path: '/' },
  { id: 'generate', label: 'Generate', path: '' },
  { id: 'paper', label: 'Question paper', path: '' },
];

interface StepIndicatorProps {
  current: AppStep;
  assignmentId?: string;
}

export function StepIndicator({ current, assignmentId }: StepIndicatorProps) {
  const stepIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav
      className="step-indicator flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 no-print"
      aria-label="Progress"
    >
      {STEPS.map((step, idx) => {
        const done = idx < stepIndex;
        const active = idx === stepIndex;
        const href =
          step.id === 'create'
            ? '/'
            : step.id === 'generate' && assignmentId
              ? `/generate/${assignmentId}`
              : step.id === 'paper' && assignmentId
                ? `/paper/${assignmentId}`
                : null;

        const content = (
          <span
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition',
              active && 'bg-veda-600 text-white shadow-sm',
              done && !active && 'bg-veda-100 text-veda-800',
              !done && !active && 'bg-slate-100 text-slate-500'
            )}
          >
            <span
              className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                active && 'bg-white/20',
                done && !active && 'bg-veda-200 text-veda-800',
                !done && !active && 'bg-slate-200 text-slate-600'
              )}
            >
              {done ? '✓' : idx + 1}
            </span>
            {step.label}
          </span>
        );

        if (href && (done || active)) {
          return (
            <Link key={step.id} href={href} className="hover:opacity-90">
              {content}
            </Link>
          );
        }

        return <div key={step.id}>{content}</div>;
      })}
    </nav>
  );
}
