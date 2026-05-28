'use client';

import clsx from 'clsx';

export type WorkflowStep = 'create' | 'generate' | 'view';

const STEPS: { id: WorkflowStep; label: string; description: string }[] = [
  { id: 'create', label: 'Create', description: 'Set parameters' },
  { id: 'generate', label: 'Generate', description: 'AI builds paper' },
  { id: 'view', label: 'View', description: 'Review & export' },
];

interface WorkflowStepperProps {
  current: WorkflowStep;
  className?: string;
}

export function WorkflowStepper({ current, className }: WorkflowStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav
      aria-label="Assessment workflow"
      className={clsx('no-print', className)}
    >
      <ol className="flex items-center gap-2 sm:gap-0 sm:justify-between">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <li
              key={step.id}
              className="flex flex-1 items-center gap-2 sm:flex-col sm:text-center sm:gap-1"
            >
              <div className="flex items-center gap-2 sm:flex-col">
                <span
                  className={clsx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    active && 'bg-brand-dark text-white',
                    done && !active && 'bg-brand-orange text-white',
                    !done && !active && 'bg-white border-2 border-brand-border text-brand-muted'
                  )}
                >
                  {done ? '✓' : index + 1}
                </span>
                <div className="min-w-0 sm:mt-1">
                  <p
                    className={clsx(
                      'text-sm font-semibold',
                      active ? 'text-brand-dark' : 'text-brand-muted'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="hidden sm:block text-xs text-brand-muted">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={clsx(
                    'hidden sm:block flex-1 h-0.5 mx-2 max-w-[4rem]',
                    done ? 'bg-brand-orange' : 'bg-brand-border'
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
