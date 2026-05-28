'use client';

import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="max-w-lg mx-auto flex flex-col items-center py-16 sm:py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-4xl mb-6">
        📝
      </div>
      <h2 className="text-2xl font-bold text-brand-dark mb-3">
        Start your first assessment
      </h2>
      <p className="text-brand-muted leading-relaxed mb-8">
        AssessAI helps teachers create structured question papers in three steps:
        define the assignment, generate with AI, and review a print-ready paper
        with sections, difficulty tags, and marks.
      </p>
      <ol className="text-left text-sm text-brand-muted space-y-2 mb-8 w-full max-w-xs">
        <li className="flex gap-2">
          <span className="font-bold text-brand-orange">1</span>
          Create — marks, types, optional reference file
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-brand-orange">2</span>
          Generate — AI + background job + live progress
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-brand-orange">3</span>
          View — structured paper, PDF, regenerate
        </li>
      </ol>
      <Link href="/create" className="ui-btn-primary px-8 py-3">
        + Create your first assignment
      </Link>
    </div>
  );
}
