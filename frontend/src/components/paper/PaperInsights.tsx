'use client';

import { QuestionPaper } from '@/types';
import { DifficultyBadge } from '@/components/DifficultyBadge';

interface PaperInsightsProps {
  paper: QuestionPaper;
}

export function PaperInsights({ paper }: PaperInsightsProps) {
  const allQuestions = paper.sections.flatMap((s) => s.questions);
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  let mcqCount = 0;

  allQuestions.forEach((q) => {
    const d = q.difficulty?.toLowerCase() || 'medium';
    if (d in byDifficulty) byDifficulty[d as keyof typeof byDifficulty]++;
    if (q.options?.length) mcqCount++;
  });

  const sectionMarks = paper.sections.map((s) => ({
    title: s.title,
    marks: s.questions.reduce((sum, q) => sum + q.marks, 0),
    count: s.questions.length,
  }));

  return (
    <aside className="ui-card p-5 space-y-5 no-print lg:sticky lg:top-4 h-fit">
      <h3 className="font-bold text-brand-dark text-sm uppercase tracking-wide">
        Paper insights
      </h3>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-brand-surface p-3">
          <p className="text-2xl font-bold text-brand-dark">
            {paper.metadata.totalQuestions}
          </p>
          <p className="text-xs text-brand-muted">Questions</p>
        </div>
        <div className="rounded-xl bg-brand-surface p-3">
          <p className="text-2xl font-bold text-brand-orange">
            {paper.metadata.totalMarks}
          </p>
          <p className="text-xs text-brand-muted">Total marks</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-brand-muted mb-2">
          Difficulty mix
        </p>
        <div className="flex flex-wrap gap-2">
          <DifficultyBadge difficulty="easy" />
          <span className="text-sm text-brand-muted">× {byDifficulty.easy}</span>
          <DifficultyBadge difficulty="medium" />
          <span className="text-sm text-brand-muted">× {byDifficulty.medium}</span>
          <DifficultyBadge difficulty="hard" />
          <span className="text-sm text-brand-muted">× {byDifficulty.hard}</span>
        </div>
      </div>

      {mcqCount > 0 && (
        <p className="text-sm text-brand-muted">
          <strong className="text-brand-dark">{mcqCount}</strong> multiple-choice
          questions with options
        </p>
      )}

      <div>
        <p className="text-xs font-semibold text-brand-muted mb-2">
          Marks by section
        </p>
        <ul className="space-y-2">
          {sectionMarks.map((s) => (
            <li
              key={s.title}
              className="flex justify-between text-sm border-b border-brand-border/60 pb-2 last:border-0"
            >
              <span className="text-brand-dark truncate pr-2">{s.title}</span>
              <span className="text-brand-muted shrink-0">
                {s.count} Q · {s.marks}m
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
