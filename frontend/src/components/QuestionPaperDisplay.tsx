'use client';

import { QuestionPaper, Section, Question, Assignment } from '@/types';
import { getDifficultyText } from '@/utils/helpers';
import { PaperInsights } from '@/components/paper/PaperInsights';
import { generationService } from '@/services/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface QuestionPaperDisplayProps {
  paper: QuestionPaper;
  assignment?: Assignment | null;
  onRegenerate?: () => void;
}

export function QuestionPaperDisplay({
  paper,
  assignment,
  onRegenerate,
}: QuestionPaperDisplayProps) {
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    rollNumber: '',
    section: '',
  });
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      const blob = await generationService.downloadPaperPdf(
        paper.assignmentId
      );
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${assignment?.title || 'question-paper'}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF download failed');
    } finally {
      setDownloading(false);
    }
  };

  let qNum = 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="ui-card bg-gradient-to-r from-brand-dark to-gray-800 text-white p-5 sm:p-6 mb-6 no-print">
        <p className="text-sm sm:text-base text-white/90">
          Your structured question paper for{' '}
          <strong>{assignment?.title || 'this assignment'}</strong> is ready.
          Questions are grouped into sections with difficulty labels — not raw AI
          text.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="ui-btn-primary bg-white text-brand-dark hover:bg-gray-100"
          >
            {downloading ? 'Preparing…' : '↓ Download PDF'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold border border-white/30 bg-transparent text-white hover:bg-white/10 transition"
          >
            Print
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold border border-white/30 bg-transparent text-white hover:bg-white/10 transition"
            >
              Regenerate
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <article
          id="question-paper-content"
          className="ui-card p-8 sm:p-10 shadow-paper"
        >
          <header className="text-center border-b-2 border-brand-dark pb-6 mb-6 font-display">
            <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">
              Assessment paper
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-dark">
              {assignment?.title || 'Question Paper'}
            </h1>
            <p className="mt-2 text-base text-brand-dark">
              Subject: <strong>{assignment?.subject || 'General'}</strong>
            </p>
            <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4 text-sm text-brand-muted max-w-md mx-auto">
              <span>Time: 45 minutes (suggested)</span>
              <span>Max marks: {paper.metadata.totalMarks}</span>
            </div>
            <p className="text-sm italic mt-4 text-brand-muted">
              All questions are compulsory unless stated otherwise.
            </p>
          </header>

          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-sm border-b border-brand-border pb-6">
            {(
              [
                ['name', 'Name'],
                ['rollNumber', 'Roll No.'],
                ['section', 'Section'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-end gap-2">
                <span className="shrink-0 font-medium">{label}:</span>
                <input
                  value={studentInfo[key]}
                  onChange={(e) =>
                    setStudentInfo((s) => ({ ...s, [key]: e.target.value }))
                  }
                  className="flex-1 border-0 border-b-2 border-brand-dark bg-transparent py-1 focus:outline-none min-w-0 print:border-black"
                />
              </div>
            ))}
          </div>

          {paper.sections.map((section: Section, sIdx: number) => (
            <section key={section.id || sIdx} className="mb-10 last:mb-0">
              <h2 className="text-center font-bold text-lg mb-1 text-brand-dark">
                {section.title || `Section ${String.fromCharCode(65 + sIdx)}`}
              </h2>
              {section.instructions && (
                <p className="text-center text-sm italic text-brand-muted mb-4">
                  {section.instructions}
                </p>
              )}

              <ol className="list-none space-y-5">
                {section.questions.map((q: Question) => {
                  qNum += 1;
                  const diff = getDifficultyText(q.difficulty);
                  return (
                    <li
                      key={q.id}
                      className="text-sm sm:text-base leading-relaxed border-b border-brand-border/40 pb-5 last:border-0"
                    >
                      <p>
                        <span className="font-bold">{qNum}. </span>
                        <span className="text-brand-orange font-semibold text-sm">
                          [{diff}]
                        </span>{' '}
                        {q.text}{' '}
                        <span className="font-semibold whitespace-nowrap">
                          [{q.marks} mark{q.marks !== 1 ? 's' : ''}]
                        </span>
                      </p>
                      {q.options && q.options.length > 0 && (
                        <ul className="mt-3 ml-6 space-y-1.5">
                          {q.options.map((opt, i) => (
                            <li key={i} className="text-brand-dark">
                              {String.fromCharCode(97 + i)}) {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div
                        className="mt-3 min-h-[2.5rem] border border-dashed border-brand-border rounded print:border-gray-400"
                        aria-hidden
                      />
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}

          <footer className="mt-10 pt-4 text-center text-sm font-semibold text-brand-muted border-t border-brand-dark">
            — End of paper —
          </footer>
        </article>

        <PaperInsights paper={paper} />
      </div>
    </div>
  );
}
