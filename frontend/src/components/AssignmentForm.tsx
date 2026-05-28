'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Assignment, QuestionTypeRow } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFormField } from '@/store/assignmentSlice';
import { UploadCloudIcon, MicIcon } from '@/components/icons';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Essay',
  'True/False',
];

const TYPE_MAP: Record<string, string> = {
  'Multiple Choice Questions': 'MCQ',
  'Short Questions': 'Short Answer',
  Essay: 'Essay',
  'True/False': 'True/False',
};

const QUICK_TEMPLATES: {
  label: string;
  title: string;
  subject: string;
  difficulty: Assignment['difficulty'];
  rows: Omit<QuestionTypeRow, 'id'>[];
}[] = [
  {
    label: 'Science quiz',
    title: 'Quiz on Electricity',
    subject: 'Science',
    difficulty: 'mixed',
    rows: [
      { type: 'Multiple Choice Questions', count: 5, marksPerQuestion: 2 },
      { type: 'Short Questions', count: 5, marksPerQuestion: 2 },
    ],
  },
  {
    label: 'Math test',
    title: 'Algebra Unit Test',
    subject: 'Mathematics',
    difficulty: 'medium',
    rows: [
      { type: 'Short Questions', count: 8, marksPerQuestion: 3 },
      { type: 'Essay', count: 2, marksPerQuestion: 8 },
    ],
  },
  {
    label: 'English paper',
    title: 'Reading Comprehension',
    subject: 'English',
    difficulty: 'easy',
    rows: [
      { type: 'Multiple Choice Questions', count: 10, marksPerQuestion: 1 },
      { type: 'Essay', count: 2, marksPerQuestion: 5 },
    ],
  },
];

interface AssignmentFormProps {
  onSubmit: (assignment: Assignment, file: File | null) => void;
  loading?: boolean;
  onCancel?: () => void;
}

function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function newRow(): QuestionTypeRow {
  return {
    id: uid(),
    type: TYPE_OPTIONS[0],
    count: 5,
    marksPerQuestion: 2,
  };
}

export function AssignmentForm({
  onSubmit,
  loading = false,
  onCancel,
}: AssignmentFormProps) {
  const dispatch = useAppDispatch();
  const assignment = useAppSelector((s) => s.assignment.formDraft);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [rows, setRows] = useState<QuestionTypeRow[]>([newRow()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totals = useMemo(() => {
    const totalQuestions = rows.reduce((s, r) => s + (r.count || 0), 0);
    const totalMarks = rows.reduce(
      (s, r) => s + (r.count || 0) * (r.marksPerQuestion || 0),
      0
    );
    return { totalQuestions, totalMarks };
  }, [rows]);

  const handleChange = (field: keyof Assignment, value: unknown) => {
    dispatch(setFormField({ field, value }));
  };

  const updateRow = (id: string, patch: Partial<QuestionTypeRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const addRow = () => setRows((prev) => [...prev, newRow()]);
  const removeRow = (id: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const stepper = (
    id: string,
    field: 'count' | 'marksPerQuestion',
    value: number,
    min = 1
  ) => (
    <div className="flex items-center border border-brand-border rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        className="px-3 py-2 text-brand-muted hover:bg-brand-surface"
        onClick={() =>
          updateRow(id, { [field]: Math.max(min, value - 1) })
        }
        disabled={loading}
      >
        −
      </button>
      <span className="flex-1 text-center text-sm font-semibold py-2 min-w-[2rem]">
        {value}
      </span>
      <button
        type="button"
        className="px-3 py-2 text-brand-muted hover:bg-brand-surface"
        onClick={() => updateRow(id, { [field]: value + 1 })}
        disabled={loading}
      >
        +
      </button>
    </div>
  );

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!assignment.title?.trim()) e.title = 'Required';
    if (!assignment.subject?.trim()) e.subject = 'Required';
    if (!assignment.dueDate) e.dueDate = 'Required';
    if (totals.totalQuestions <= 0) e.rows = 'Add at least one question';
    if (totals.totalMarks <= 0) e.rows = 'Marks must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please complete all required fields');
      return;
    }

    const questionTypes = [
      ...new Set(rows.map((r) => TYPE_MAP[r.type] || r.type)),
    ];

    const payload: Assignment = {
      ...assignment,
      totalMarks: totals.totalMarks,
      numberOfQuestions: totals.totalQuestions,
      questionTypes,
      difficulty: assignment.difficulty || 'mixed',
    };

    onSubmit(payload, referenceFile);
  };

  const onFile = (files: FileList | null) => {
    if (!files?.[0]) return;
    const f = files[0];
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'txt', 'doc', 'docx', 'png', 'jpg', 'jpeg'].includes(ext)) {
      toast.error('Unsupported file type');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('Max 10MB');
      return;
    }
    setReferenceFile(f);
  };

  const applyTemplate = (index: number) => {
    const t = QUICK_TEMPLATES[index];
    dispatch(
      setFormField({ field: 'title', value: t.title })
    );
    dispatch(setFormField({ field: 'subject', value: t.subject }));
    dispatch(setFormField({ field: 'difficulty', value: t.difficulty }));
    setRows(t.rows.map((r) => ({ ...r, id: uid() })));
    toast.success(`Applied "${t.label}" template`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="ui-card p-6 sm:p-8 space-y-8">
        <div>
          <p className="text-sm font-medium text-brand-dark mb-2">
            Quick start templates
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => applyTemplate(i)}
                className="ui-btn-outline text-sm py-2"
                disabled={loading}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
              Assignment title *
            </label>
            <input
              className={clsx('figma-input', errors.title && 'border-red-400')}
              value={assignment.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Quiz on Electricity"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
              Subject *
            </label>
            <input
              className={clsx('figma-input', errors.subject && 'border-red-400')}
              value={assignment.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Science"
              disabled={loading}
            />
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFile(e.dataTransfer.files);
          }}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-10 text-center transition',
            dragOver ? 'border-brand-orange bg-brand-orange-light' : 'border-brand-border bg-brand-surface/50'
          )}
        >
          <input
            type="file"
            className="hidden"
            id="file-upload"
            accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => onFile(e.target.files)}
            disabled={loading}
          />
          <UploadCloudIcon className="w-12 h-12 mx-auto text-brand-muted mb-3" />
          {referenceFile ? (
            <p className="font-medium text-brand-dark">{referenceFile.name}</p>
          ) : (
            <>
              <p className="font-medium text-brand-dark">
                Choose a file or drag & drop it here
              </p>
              <p className="text-sm text-brand-muted mt-1">
                PDF, TXT, Word, or images up to 10MB
              </p>
            </>
          )}
          <label
            htmlFor="file-upload"
            className="inline-block mt-4 figma-btn-outline cursor-pointer text-sm"
          >
            Browse Files
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
              Due date *
            </label>
            <input
              type="date"
              className={clsx('ui-input', errors.dueDate && 'border-red-400')}
              value={
                assignment.dueDate
                  ? new Date(assignment.dueDate).toISOString().slice(0, 10)
                  : ''
              }
              onChange={(e) => handleChange('dueDate', e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
              Difficulty level
            </label>
            <select
              className="ui-input"
              value={assignment.difficulty}
              onChange={(e) =>
                handleChange(
                  'difficulty',
                  e.target.value as Assignment['difficulty']
                )
              }
              disabled={loading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <h3 className="font-semibold text-brand-dark">Question structure</h3>
            <div className="text-sm text-brand-muted sm:text-right">
              <p>
                Total Questions:{' '}
                <strong className="text-brand-dark">{totals.totalQuestions}</strong>
              </p>
              <p>
                Total Marks:{' '}
                <strong className="text-brand-dark">{totals.totalMarks}</strong>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px_auto] gap-3 items-end p-4 rounded-xl bg-brand-surface border border-brand-border"
              >
                <div>
                  <label className="text-xs text-brand-muted mb-1 block">
                    Question Type
                  </label>
                  <select
                    className="figma-input text-sm"
                    value={row.type}
                    onChange={(e) => updateRow(row.id, { type: e.target.value })}
                    disabled={loading}
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-brand-muted mb-1 block">
                    No. of Questions
                  </label>
                  {stepper(row.id, 'count', row.count)}
                </div>
                <div>
                  <label className="text-xs text-brand-muted mb-1 block">
                    Marks
                  </label>
                  {stepper(row.id, 'marksPerQuestion', row.marksPerQuestion)}
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="p-2 text-brand-muted hover:text-red-500 sm:mb-0.5"
                  aria-label="Remove row"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {errors.rows && (
            <p className="text-red-500 text-sm mt-2">{errors.rows}</p>
          )}

          <button
            type="button"
            onClick={addRow}
            className="figma-btn-primary mt-4 text-sm"
            disabled={loading}
          >
            + Add Question Type
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            Additional Information{' '}
            <span className="font-normal text-brand-muted">
              (For better output)
            </span>
          </label>
          <div className="relative">
            <textarea
              className="figma-input min-h-[120px] resize-y pr-12"
              value={assignment.additionalInstructions || ''}
              onChange={(e) =>
                handleChange('additionalInstructions', e.target.value)
              }
              placeholder="e.g. Focus on application-based problems from uploaded chapter..."
              disabled={loading}
            />
            <button
              type="button"
              className="absolute bottom-3 right-3 p-2 rounded-full bg-brand-surface text-brand-muted hover:text-brand-orange"
              title="Voice input (coming soon)"
              tabIndex={-1}
            >
              <MicIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8 gap-4">
        <button
          type="button"
          className="figma-btn-outline"
          onClick={onCancel}
          disabled={loading}
        >
          ← Previous
        </button>
        <button type="submit" className="ui-btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save & generate paper →'}
        </button>
      </div>
    </form>
  );
}
